'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const net=require('node:net');
const {spawn}=require('node:child_process');
const root=path.join(__dirname,'..');
const tmpRoot=fs.mkdtempSync(path.join(os.tmpdir(),'mini024-'));
let count=0;
async function freePort(){return new Promise(resolve=>{const s=net.createServer().listen(0,'127.0.0.1',()=>s.close(()=>resolve(s.address()?.port||port)));const port=0;});}
async function server(dataDir,seq){
  const port=await new Promise(resolve=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const n=s.address().port;s.close(()=>resolve(n));});});
  const child=spawn(process.execPath,['server.js'],{cwd:root,env:{...process.env,NODE_ENV:'test',HOST:'127.0.0.1',PORT:String(port),DATA_DIR:dataDir,TEST_ROLL_SEQUENCE:seq},stdio:'ignore'});
  const base=`http://127.0.0.1:${port}`;
  for(let t=0;t<60;t++){
    if(child.exitCode!==null)throw Error('Server exited early');
    try{if((await fetch(base+'/api/network')).ok)return {child,base};}catch{}
    await new Promise(r=>setTimeout(r,55));
  }
  child.kill();throw Error('Server did not start');
}
async function stop(x){if(!x)return;return new Promise(resolve=>{if(x.child.exitCode!==null)return resolve();x.child.once('exit',resolve);x.child.kill();});}
async function send(s,route,body){const r=await fetch(s.base+'/api/'+route,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});return {status:r.status,...await r.json()};}
async function room(s){const a=await send(s,'create',{name:'Win',capacity:2,rounds:12});const b=await send(s,'join',{code:a.code,name:'Mac'});await send(s,'action',{code:a.code,token:a.token,kind:'start'});return {a,b,code:a.code};}
const act=(s,r,seat,kind,extra={})=>send(s,'action',{code:r.code,token:r[seat].token,kind,...extra});
const resume=(s,r,seat)=>send(s,'resume',{code:r.code,token:r[seat].token});
const mkDir=()=>{const d=path.join(tmpRoot,'case-'+(++count));fs.mkdirSync(d,{recursive:true});return d;};

test('property purchased -> confirmation actions; opponent rent is NOT transferred until Pay',async()=>{
 const dir=mkDir(),s=await server(dir,'1,1');
 try{
  const r=await room(s);
  let x=await act(s,r,'a','roll');assert.equal(x.state.phase,'purchase');assert.equal(x.state.pending.name,'Copper Lane');
  x=await act(s,r,'a','buy');assert.equal(x.state.phase,'post');assert.equal(x.state.post.kind,'purchase');assert.equal(x.state.players[0].cash,1440);
  assert.equal((await act(s,r,'b','end')).status,403);
  await act(s,r,'a','end');
  x=await act(s,r,'b','roll');assert.equal(x.state.phase,'rent');assert.equal(x.state.pending.creditorName,'Win');
  assert.equal(x.state.pending.amount,6);assert.equal(x.state.players[0].cash,1440);assert.equal(x.state.players[1].cash,1500);
  assert.equal((await act(s,r,'a','pay')).status,403);
  x=await act(s,r,'b','pay');assert.equal(x.state.phase,'post');assert.equal(x.state.players[0].cash,1446);assert.equal(x.state.players[1].cash,1494);
  x=await act(s,r,'b','end');assert.equal(x.state.turn,0);
 }finally{await stop(s);}
});

test('Community Chest cards require acknowledgment; landing on Setback is just visiting',async()=>{
 const s=await server(mkDir(),'4,8,1');
 try{
  const r=await room(s);let x=await act(s,r,'a','roll');assert.equal(x.state.phase,'card');assert.equal(x.state.pending.source,'Community Chest');
  assert.equal((await act(s,r,'a','end')).status,400);
  x=await act(s,r,'a','continue-card');
  if(x.state.phase==='rent')x=await act(s,r,'a','pay');
  assert.equal(x.state.phase,'post');await act(s,r,'a','end');
  x=await act(s,r,'b','roll');assert.equal(x.state.phase,'post');assert.equal(x.state.post.title,'Visiting Setback');assert.equal(x.state.players[1].penalty,0);
  await act(s,r,'b','end');
  x=await act(s,r,'a','roll');assert.ok(x.state.lastRoll.value>=1);
 }finally{await stop(s);}
});

test('utilities and railroad deeds are purchasable; special CHANCE ? draws a card',async()=>{
 const dir=mkDir();let s=await server(dir,'1,12');
 try{
  const r=await room(s);
  await stop(s);
  const file=path.join(dir,'rooms.json');const data=JSON.parse(fs.readFileSync(file));
  data.rooms[0].players[0].pos=5;fs.writeFileSync(file,JSON.stringify(data));
  s=await server(dir,'1,12');
  let x=await act(s,r,'a','roll');assert.equal(x.state.phase,'purchase');assert.equal(x.state.pending.type,'util');assert.equal(x.state.pending.name,'Ogeechee Water');
  x=await act(s,r,'a','buy');assert.equal(x.state.owned['0-6'].owner,0);await act(s,r,'a','end');
  x=await act(s,r,'b','roll');assert.equal(x.state.phase,'card');assert.equal(x.state.pending.source,'CHANCE ?');
 }finally{await stop(s);}
});

test('rent shortfall: sale to Bank raises cash, creditor receives money only after settlement, room survives restart',async()=>{
 const dir=mkDir();let s=await server(dir,'1,1');
 try{
  const r=await room(s);
  await act(s,r,'a','roll');await act(s,r,'a','buy');await act(s,r,'a','end');
  await stop(s);
  const file=path.join(dir,'rooms.json'),saved=JSON.parse(fs.readFileSync(file));
  const match=saved.rooms[0];match.players[1].cash=1;
  match.owned['0-1'].level=3;
  match.owned['0-3']={owner:1,level:0,mortgage:false};
  fs.writeFileSync(file,JSON.stringify(saved));
  s=await server(dir,'1,1');
  let x=await act(s,r,'b','roll');assert.equal(x.state.phase,'rent');assert.equal(x.state.pending.amount,42);
  assert.equal((await act(s,r,'b','pay')).status,400);
  assert.equal((await act(s,r,'b','sell-deed',{id:'0-1'})).status,403);
  x=await act(s,r,'b','sell-deed',{id:'0-3'});
  assert.equal(x.state.players[1].cash,51);assert.equal(x.state.owned['0-3'],undefined);
  assert.equal(x.state.players[0].cash,1440);
  x=await act(s,r,'b','pay');assert.equal(x.state.players[1].cash,9);assert.equal(x.state.players[0].cash,1482);
  await stop(s);s=await server(dir,'1,1');
  x=await resume(s,r,'a');assert.equal(x.state.phase,'post');assert.equal(x.state.players[1].cash,9);
  assert.equal(x.state.code,r.code);
 }finally{await stop(s);}
});
