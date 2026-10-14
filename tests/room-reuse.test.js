'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const net=require('node:net');
const {spawn}=require('node:child_process');
const baseDir=path.resolve(__dirname,'..');
async function freePort(){return new Promise((resolve,reject)=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const port=s.address().port;s.close(()=>resolve(port));});s.on('error',reject);});}
async function runServer(dataDir,port){
 const child=spawn(process.execPath,['server.js'],{cwd:baseDir,env:{...process.env,DATA_DIR:dataDir,PORT:String(port),HOST:'127.0.0.1'},stdio:['ignore','pipe','pipe']});
 const base=`http://127.0.0.1:${port}`;let err='';child.stderr.on('data',d=>err+=d);
 for(let attempt=0;attempt<100;attempt++){
  if(child.exitCode!==null)throw Error('Server quit: '+err);
  try{const response=await fetch(base+'/api/network');if(response.ok)return {child,base};}catch{}
  await new Promise(resolve=>setTimeout(resolve,40));
 }
 child.kill();throw Error('Server timed out: '+err);
}
async function stop(s){if(!s)return;await new Promise(resolve=>{if(s.child.exitCode!==null)return resolve();s.child.once('exit',resolve);s.child.kill();setTimeout(()=>{if(s.child.exitCode===null)s.child.kill('SIGKILL');},1000).unref();});}
async function post(base,kind,data){const result=await fetch(base+'/api/'+kind,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});return {status:result.status,body:await result.json()};}
test('host can restart a test match without changing the code, seats, or tokens; server restart retains them',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mini-reuse-'));const port=await freePort();let service;
 try{
  service=await runServer(dir,port);
  const host=await post(service.base,'create',{name:'Cam-Windows',capacity:2,rounds:20});assert.equal(host.status,200);
  const guest=await post(service.base,'join',{code:host.body.code,name:'Cam-Mac'});assert.equal(guest.status,200);
  const code=host.body.code;
  const h={code,token:host.body.token}; const g={code,token:guest.body.token};
  const start=await post(service.base,'action',{...h,kind:'start'});assert.equal(start.status,200);
  let roll=await post(service.base,'action',{...h,kind:'roll'});assert.equal(roll.status,200);
  if(roll.body.state.phase==='purchase'){
   const buy=await post(service.base,'action',{...h,kind:'buy'});assert.equal(buy.status,200);
  }
  const outsider=await post(service.base,'action',{...g,kind:'reset'});assert.equal(outsider.status,403);
  const reset=await post(service.base,'action',{...h,kind:'reset'});assert.equal(reset.status,200);
  const state=reset.body.state;assert.equal(state.code,code);assert.equal(state.stage,'playing');assert.equal(state.phase,'roll');assert.equal(state.turn,0);assert.equal(state.round,1);
  assert.equal(state.lastRoll,null);assert.equal(state.pending,null);assert.deepEqual(state.owned,{});
  assert.deepEqual(state.players.map(p=>p.name),['Cam-Windows','Cam-Mac']);
  assert.deepEqual(state.players.map(p=>p.pos),[0,0]);assert.deepEqual(state.players.map(p=>p.cash),[1500,1500]);
  const oldSeat=await post(service.base,'resume',g);assert.equal(oldSeat.status,200);assert.equal(oldSeat.body.state.code,code);assert.equal(oldSeat.body.state.youId,state.players[1].id);
  await stop(service);service=await runServer(dir,port);
  const afterRestart=await post(service.base,'resume',h);assert.equal(afterRestart.status,200);assert.equal(afterRestart.body.state.code,code);assert.equal(afterRestart.body.state.phase,'roll');
  const repeat=await post(service.base,'action',{...h,kind:'reset'});assert.equal(repeat.status,200);assert.equal(repeat.body.state.code,code);
  const guestAfter=await post(service.base,'resume',g);assert.equal(guestAfter.status,200);
  const saved=JSON.parse(fs.readFileSync(path.join(dir,'rooms.json')));assert.equal(saved.rooms[0].code,code);
 }finally{await stop(service);fs.rmSync(dir,{force:true,recursive:true});}
});
