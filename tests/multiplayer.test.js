'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const net = require('node:net');
const {spawn} = require('node:child_process');

async function freePort(){return new Promise((resolve,reject)=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p));});s.on('error',reject);});}
async function request(base,route,payload){const response=await fetch(base+'/api/'+route,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});return {status:response.status,data:await response.json()};}
async function startServer(port,dataDir){
  const child=spawn(process.execPath,['server.js'],{cwd:path.join(__dirname,'..'),env:{...process.env,PORT:String(port),HOST:'127.0.0.1',DATA_DIR:dataDir},stdio:['ignore','pipe','pipe']});
  let error='';child.stderr.on('data',x=>{error+=x.toString();});
  const base='http://127.0.0.1:'+port;
  for(let i=0;i<90;i++){
    if(child.exitCode!==null)throw Error('Server exited early: '+error);
    try{const resp=await fetch(base+'/api/network');if(resp.ok)return {child,base};}catch{}
    await new Promise(r=>setTimeout(r,50));
  }
  child.kill();throw Error('Server did not start: '+error);
}
function stop(child){return new Promise(resolve=>{if(child.exitCode!==null)return resolve();child.once('exit',resolve);child.kill();setTimeout(()=>{if(child.exitCode===null)child.kill('SIGKILL');},1200).unref();});}
function listenSSE(base,creds){
  const abort=new AbortController();const messages=[];
  const ready=(async()=>{
    const resp=await fetch(base+'/api/events?code='+creds.code+'&token='+encodeURIComponent(creds.token),{signal:abort.signal});
    assert.equal(resp.status,200);
    const reader=resp.body.getReader(); const decoder=new TextDecoder();let buffer='';
    while(true){const {done,value}=await reader.read();if(done)break;buffer+=decoder.decode(value,{stream:true});const items=buffer.split('\n\n');buffer=items.pop();for(const item of items){if(item.startsWith('event: state\n')){const match=item.match(/^data: (.*)$/m);if(match)messages.push(JSON.parse(match[1]));}}}
  })().catch(e=>{if(e.name!=='AbortError')throw e;});
  return {messages,abort,ready};
}
async function eventually(testFn,timeout=3000){const start=Date.now();while(Date.now()-start<timeout){if(testFn())return;await new Promise(r=>setTimeout(r,35));}throw Error('Expected realtime update did not arrive.');}

test('host, join, match, server dice, turn guarding, SSE and persisted resume',async()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'miniopoly-test-'));
  const port=await freePort();let service=await startServer(port,dir);let streamA,streamB;
  try {
    const {base}=service;
    const host=await request(base,'create',{name:'Cam',capacity:2,rounds:12});
    assert.equal(host.status,200);assert.equal(host.data.state.stage,'lobby');
    const code=host.data.code;assert.match(code,/^[A-Z2-9]{6}$/);
    const join=await request(base,'join',{code,name:'Alex'});
    assert.equal(join.status,200);assert.equal(join.data.state.players.length,2);
    const duplicate=await request(base,'join',{code,name:'Sam'});
    assert.equal(duplicate.status,400);
    const forbidden=await request(base,'action',{code,token:join.data.token,kind:'start'});
    assert.equal(forbidden.status,403);
    streamA=listenSSE(base,host.data);streamB=listenSSE(base,join.data);
    await eventually(()=>streamA.messages.length>0&&streamB.messages.length>0);
    const start=await request(base,'action',{code,token:host.data.token,kind:'start'});
    assert.equal(start.status,200);assert.equal(start.data.state.phase,'roll');
    await eventually(()=>streamA.messages.some(x=>x.stage==='playing')&&streamB.messages.some(x=>x.stage==='playing'));
    const wrongTurn=await request(base,'action',{code,token:join.data.token,kind:'roll'});
    assert.equal(wrongTurn.status,403);
    const roll=await request(base,'action',{code,token:host.data.token,kind:'roll'});
    assert.equal(roll.status,200);assert.ok(roll.data.state.lastRoll.value>=1&&roll.data.state.lastRoll.value<=12);
    assert.equal(roll.data.state.players[0].pos,roll.data.state.lastRoll.value%16);
    assert.ok(['post','purchase','card','rent'].includes(roll.data.state.phase));
    if(roll.data.state.phase==='purchase') {
      const d=roll.data.state.pending;
      assert.ok(d.name && d.price>0);
      const oldCash=roll.data.state.players[0].cash;
      const tooSoon=await request(base,'action',{code,token:host.data.token,kind:'end'});
      assert.equal(tooSoon.status,400);
      const badBuyer=await request(base,'action',{code,token:join.data.token,kind:'buy'});
      assert.equal(badBuyer.status,403);
      const buy=await request(base,'action',{code,token:host.data.token,kind:'buy',price:1});
      assert.equal(buy.status,200);
      assert.equal(buy.data.state.players[0].cash,oldCash-d.price);
      assert.equal(buy.data.state.owned[d.id].owner,0);
      assert.equal(buy.data.state.phase,'post');
      await eventually(()=>streamA.messages.some(x=>x.owned[d.id])&&streamB.messages.some(x=>x.owned[d.id]));
    }
    const afterLanding=await request(base,'resume',{code,token:host.data.token});
    if(afterLanding.data.state.phase==='card')await request(base,'action',{code,token:host.data.token,kind:'continue-card'});
    const afterCard=await request(base,'resume',{code,token:host.data.token});
    if(afterCard.data.state.phase==='rent')await request(base,'action',{code,token:host.data.token,kind:'pay'});
    await eventually(()=>streamA.messages.some(x=>x.lastRoll?.value===roll.data.state.lastRoll.value)&&streamB.messages.some(x=>x.lastRoll?.value===roll.data.state.lastRoll.value));
    const doubleRoll=await request(base,'action',{code,token:host.data.token,kind:'roll'});
    assert.equal(doubleRoll.status,400);
    const wrongEnd=await request(base,'action',{code,token:join.data.token,kind:'end'});
    assert.equal(wrongEnd.status,403);
    const end=await request(base,'action',{code,token:host.data.token,kind:'end'});
    assert.equal(end.status,200);assert.equal(end.data.state.turn,1);
    const roll2=await request(base,'action',{code,token:join.data.token,kind:'roll'});
    assert.equal(roll2.status,200);
    assert.ok(['post','purchase','card','rent'].includes(roll2.data.state.phase));
    if(roll2.data.state.phase==='purchase') {
      const before=roll2.data.state.players[1].cash;
      const skip=await request(base,'action',{code,token:join.data.token,kind:'pass'});
      assert.equal(skip.status,200);
      assert.equal(skip.data.state.players[1].cash,before);
      assert.equal(skip.data.state.phase,'post');
    }
    streamA.abort.abort();streamB.abort.abort();
    await stop(service.child);
    service=await startServer(port,dir);
    const resumed=await request(service.base,'resume',{code,token:join.data.token});
    assert.equal(resumed.status,200);assert.equal(resumed.data.state.lastRoll.value,roll2.data.state.lastRoll.value);
    assert.equal(resumed.data.state.players[1].name,'Alex');
    const impostor=await request(service.base,'resume',{code,token:'wrong-token'});
    assert.equal(impostor.status,403);
  } finally {
    streamA?.abort.abort();streamB?.abort.abort();await stop(service.child);fs.rmSync(dir,{recursive:true,force:true});
  }
});
