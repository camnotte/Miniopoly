'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const os=require('node:os');
const net=require('node:net');
const {spawn}=require('node:child_process');
const ROOT=path.join(__dirname,'..');
async function spawnHost(dir,sequence='1,2,3'){
  const port=await new Promise(done=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>done(p));});});
  const child=spawn(process.execPath,['server.js'],{cwd:ROOT,env:{...process.env,PORT:String(port),HOST:'127.0.0.1',DATA_DIR:dir,NODE_ENV:'test',TEST_ROLL_SEQUENCE:sequence},stdio:'ignore'});
  const base=`http://127.0.0.1:${port}`;
  for(let i=0;i<70;i++){
    try{if((await fetch(base+'/api/network')).ok)return {base,child};}catch{}
    await new Promise(r=>setTimeout(r,50));
  }
  child.kill();throw Error('server did not become ready');
}
async function stop(host){if(!host)return;await new Promise(resolve=>{if(host.child.exitCode!==null || host.child.signalCode!==null)return resolve();host.child.once('exit',resolve);host.child.kill();});}
async function call(host,api,body){const r=await fetch(host.base+'/api/'+api,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});return {status:r.status,...await r.json()};}
async function setup(host){const a=await call(host,'create',{name:'Host',capacity:2,rounds:20}),b=await call(host,'join',{code:a.code,name:'Guest'});await call(host,'action',{code:a.code,token:a.token,kind:'start'});return {a,b,code:a.code};}
const act=(h,r,who,kind,more={})=>call(h,'action',{code:r.code,token:r[who].token,kind,...more});
async function startWithState(mod,seq){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mini033-'));let h=await spawnHost(dir,seq);
 const r=await setup(h);
 await stop(h);
 const f=path.join(dir,'rooms.json');const saved=JSON.parse(fs.readFileSync(f,'utf8'));
 mod(saved.rooms[0]);fs.writeFileSync(f,JSON.stringify(saved));
 h=await spawnHost(dir,seq);
 return {h,r,dir};
}
test('SetBack: free roll of 6 escapes and moves to its correct new world',async()=>{
 const {h,r}=await startWithState(room=>{room.players[0].pos=8;room.players[0].penalty=2;},'6');
 try{
  const x=await act(h,r,'a','roll');
  assert.equal(x.status,200);assert.equal(x.state.players[0].penalty,0);
  assert.equal(x.state.players[0].pos,14);assert.equal(x.state.players[0].board,1);
  assert.equal(x.state.lastRoll.value,6);assert.equal(x.state.lastRoll.noMove,undefined);
 }finally{await stop(h);}
});
test('SetBack: bail roll with a shortfall is locked, requires funds, charges exact 20x and then moves',async()=>{
 const {h,r}=await startWithState(room=>{room.players[0].pos=8;room.players[0].penalty=2;room.players[0].cash=10;room.owned['0-15']={owner:0,level:0,mortgage:false};},'7,2');
 try{
  let x=await act(h,r,'a','bail-roll');assert.equal(x.state.phase,'bail');
  assert.equal(x.state.bailPending.fee,140);assert.equal(x.state.players[0].pos,8);
  assert.equal((await act(h,r,'a','bail-roll')).status,400);
  assert.equal((await act(h,r,'a','pay-bail')).status,400);
  x=await act(h,r,'a','sell-deed',{id:'0-15'});assert.equal(x.state.players[0].cash,185); // Ford Plantation: $350 / 2
  assert.equal(x.state.bailPending.value,7);
  x=await act(h,r,'a','pay-bail');
  assert.equal(x.status,200);assert.equal(x.state.players[0].cash,45);
  assert.equal(x.state.players[0].pos,15);assert.equal(x.state.players[0].penalty,0);
  assert.equal(x.state.lastRoll.value,7);assert.equal(x.state.bailPending,null);
 }finally{await stop(h);}
});
test('SetBack: foreclosed deeds wait one round; half-price sales transfer owner, never duplicate deeds',async()=>{
 const {h,r,dir}=await startWithState(room=>{room.players[0].pos=8;room.players[0].penalty=2;room.owned['0-1']={owner:0,level:0,mortgage:false};},'1,1');
 try{
  let x=await act(h,r,'a','foreclose',{id:'0-1'});
  assert.equal(x.state.players[0].penalty,0);
  assert.equal(x.state.players[0].cash,1500);
  assert.equal(x.state.owned['0-1'],undefined);
  assert.equal(x.state.foreclosures.length,1);
  assert.equal(x.state.foreclosures[0].price,30);
  assert.equal((await act(h,r,'a','buy-foreclosure',{id:'0-1'})).status,400);
  // Simulate a complete round passing while retaining the same saved room.
  await stop(h);
  const file=path.join(dir,'rooms.json'),roomData=JSON.parse(fs.readFileSync(file,'utf8'));
  roomData.rooms[0].turn=1;roomData.rooms[0].round=2;roomData.rooms[0].turnNumber=1;roomData.rooms[0].phase='roll';
  fs.writeFileSync(file,JSON.stringify(roomData));
  const h1=await spawnHost(dir,'1');
  assert.equal((await act(h1,r,'b','buy-foreclosure',{id:'0-1'})).status,400,'one next turn started does not count as a full turn');
  await stop(h1);
  roomData.rooms[0].turnNumber=2;fs.writeFileSync(file,JSON.stringify(roomData));
  const h2=await spawnHost(dir,'1');
  try{
   x=await act(h2,r,'b','buy-foreclosure',{id:'0-1'});
   assert.equal(x.status,200);assert.equal(x.state.owned['0-1'].owner,1);
   assert.equal(x.state.players[1].cash,1470);
   assert.equal(x.state.foreclosures.length,0);
   assert.equal((await act(h2,r,'b','buy-foreclosure',{id:'0-1'})).status,400);
  }finally{await stop(h2);}
 }finally{await stop(h);}
});
test('SetBack: former owner can reclaim only after 3 round advances',async()=>{
 const {h,r,dir}=await startWithState(room=>{room.players[0].pos=8;room.players[0].penalty=2;room.owned['0-1']={owner:0,level:0,mortgage:false};},'1');
 try{
  await act(h,r,'a','foreclose',{id:'0-1'});await stop(h);
  const file=path.join(dir,'rooms.json'),saved=JSON.parse(fs.readFileSync(file,'utf8'));
  saved.rooms[0].round=3;saved.rooms[0].turnNumber=4;fs.writeFileSync(file,JSON.stringify(saved));
  let host=await spawnHost(dir,'1');
  assert.equal((await act(host,r,'a','buy-foreclosure',{id:'0-1'})).status,400);
  await stop(host);
  saved.rooms[0].round=4;saved.rooms[0].turnNumber=6;fs.writeFileSync(file,JSON.stringify(saved));
  host=await spawnHost(dir,'1');
  try{const x=await act(host,r,'a','buy-foreclosure',{id:'0-1'});assert.equal(x.status,200);assert.equal(x.state.players[0].cash,1470);assert.equal(x.state.foreclosures.length,0);}finally{await stop(host);}
 }finally{await stop(h);}
});
test('SetBack escape card is supported in Chance and Community Chest and the client has accessible controls',()=>{
 const server=fs.readFileSync(path.join(ROOT,'server.js'),'utf8');
 assert.match(server,/chest:\s*\[[\s\S]*?title:'Escape SetBack'/);
 assert.match(server,/weather:\s*\[[\s\S]*?title:'Escape SetBack'/);
 const html=fs.readFileSync(path.join(ROOT,'public/index.html'),'utf8');
 assert.match(html,/foreclosureButton/);assert.match(html,/setbackButton/);
 const app=fs.readFileSync(path.join(ROOT,'public/app.js'),'utf8');
 assert.match(app,/pay-bail/);assert.match(app,/bail-roll/);assert.match(app,/buy-foreclosure/);assert.match(app,/renderForecloseRows/);
});

test('SetBack: Escape SetBack card is consumed once and cannot be used again',async()=>{
 const {h,r}=await startWithState(room=>{room.players[0].pos=8;room.players[0].penalty=2;room.players[0].perks=['escape'];},'1');
 try{
  let x=await act(h,r,'a','use-perk',{perk:'escape'});
  assert.equal(x.status,200);assert.equal(x.state.players[0].penalty,0);
  assert.equal(x.state.players[0].perks.length,0);
  assert.equal((await act(h,r,'a','use-perk',{perk:'escape'})).status,400);
 }finally{await stop(h);}
});
test('Foreclosure rejects improved property until upgrades sold',async()=>{
 const {h,r}=await startWithState(room=>{room.players[0].pos=8;room.players[0].penalty=2;room.owned['0-1']={owner:0,level:2,mortgage:false};},'1');
 try{
  assert.equal((await act(h,r,'a','foreclose',{id:'0-1'})).status,400);
  await act(h,r,'a','sell-upgrade',{id:'0-1'});
  assert.equal((await act(h,r,'a','foreclose',{id:'0-1'})).status,400);
  await act(h,r,'a','sell-upgrade',{id:'0-1'});
  const x=await act(h,r,'a','foreclose',{id:'0-1'});
  assert.equal(x.status,200);assert.equal(x.state.players[0].penalty,0);
 }finally{await stop(h);}
});
