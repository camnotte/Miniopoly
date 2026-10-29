'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),net=require('node:net'),{spawn}=require('node:child_process');
const root=path.resolve(__dirname,'..');
test('the last die result survives turn changes and host restarts, is replaced by the next roll, and clears for a new match',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mini-roll-reference-'));let child,base;
 async function start(){const port=await new Promise(resolve=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p));});});base='http://127.0.0.1:'+port;child=spawn(process.execPath,['server.js'],{cwd:root,env:{...process.env,HOST:'127.0.0.1',PORT:String(port),DATA_DIR:dir},stdio:'ignore'});for(let i=0;i<200;i++){try{if((await fetch(base+'/api/network')).ok)return;}catch{}await new Promise(r=>setTimeout(r,25));}throw Error('Host unavailable');}
 async function stop(){if(child?.exitCode===null){child.kill();await new Promise(r=>child.once('exit',r));}}
 async function api(route,body){const r=await fetch(base+'/api/'+route,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)}),data=await r.json();assert.equal(r.status,200,data.error);return data;}
 try{
  await start();const a=await api('create',{name:'Cam',capacity:2,rounds:10}),b=await api('join',{code:a.code,name:'Mac'}),seats=[a,b];const act=(seat,kind,extra={})=>api('action',{code:a.code,token:seats[seat].token,kind,...extra}),resume=seat=>api('resume',{code:a.code,token:seats[seat].token});
  let s=(await act(0,'start')).state;const match=s.matchId;assert.equal(s.lastRollReference,null);
  for(const [seat,value] of [[0,3],[1,1]]){
   await act(0,'developer',{developer:{action:'settings',die:value}});s=(await act(seat,'roll')).state;assert.equal(s.lastRoll.value,value);assert.equal(s.lastRollReference.value,value);assert.equal(s.phase,'purchase');await act(seat,'buy');s=(await act(seat,'end')).state;assert.equal(s.lastRoll,null);assert.equal(s.lastRollReference.value,value);assert.equal(s.lastRollReference.playerId,s.players[seat].id);
   await stop();await start();for(const viewer of [0,1]){s=(await resume(viewer)).state;assert.equal(s.phase,'roll');assert.equal(s.lastRoll,null);assert.equal(s.lastRollReference.value,value);assert.equal(s.turn,1-seat);}
  }
  s=(await act(0,'reset')).state;assert.notEqual(s.matchId,match);assert.equal(s.lastRoll,null);assert.equal(s.lastRollReference,null);
 }finally{await stop();fs.rmSync(dir,{recursive:true,force:true});}
});
