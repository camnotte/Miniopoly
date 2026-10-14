'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const os=require('node:os');
const net=require('node:net');
const {spawn}=require('node:child_process');
const ROOT=path.join(__dirname,'..');
async function freePort(){return new Promise(done=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>done(p));});});}
async function startHost(dir){const port=await freePort();const child=spawn(process.execPath,['server.js'],{cwd:ROOT,env:{...process.env,PORT:String(port),HOST:'127.0.0.1',DATA_DIR:dir,NODE_ENV:'test'},stdio:'ignore'});const base='http://127.0.0.1:'+port;for(let i=0;i<100;i++){try{if((await fetch(base+'/api/network')).ok)return {base,child};}catch{}await new Promise(r=>setTimeout(r,40));}child.kill();throw Error('Host not ready');}
async function stop(h){if(!h)return;await new Promise(resolve=>{if(h.child.exitCode!==null||h.child.signalCode!==null)return resolve();h.child.once('exit',resolve);h.child.kill();});}
async function request(h,route,payload){const r=await fetch(h.base+'/api/'+route,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});return {status:r.status,...await r.json()};}
async function room(h,rounds,ranked=true){const a=await request(h,'create',{name:'Ada'+rounds,capacity:2,rounds,ranked});assert.equal(a.status,200);const b=await request(h,'join',{name:'Ben'+rounds,code:a.code});await request(h,'action',{code:a.code,token:a.token,kind:'start'});return {a,b,code:a.code,rounds};}
async function putOnFinalTurn(h,dir,r,values){await stop(h);const file=path.join(dir,'rooms.json');const saved=JSON.parse(fs.readFileSync(file,'utf8'));const data=saved.rooms.find(x=>x.code===r.code);data.round=r.rounds;data.turn=1;data.phase='post';data.players[0].cash=values[0];data.players[1].cash=values[1];data.owned={'0-1':{owner:0,level:0,mortgage:false},'0-3':{owner:1,level:1,mortgage:false}};fs.writeFileSync(file,JSON.stringify(saved));return startHost(dir);}
test('ranked 20-round results save host-scored worth once and persist across host restart; practice resets do not enter records',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mini036-'));let h=null;
 try{
  h=await startHost(dir);const r=await room(h,20,true);const matchId=(await request(h,'resume',{code:r.code,token:r.a.token})).state.matchId;
  h=await putOnFinalTurn(h,dir,r,[4200,1800]);
  const finished=await request(h,'action',{code:r.code,token:r.b.token,kind:'end'});
  assert.equal(finished.status,200);assert.equal(finished.state.stage,'finished');assert.equal(finished.state.round,20);
  assert.equal(finished.state.finalResults.standings[0].worth,4260);
  assert.equal(finished.state.finalResults.standings[1].worth,1925);
  assert.equal(finished.state.legendary[20].length,2);assert.equal(finished.state.legendary[20][0].worth,4260);
  assert.equal(finished.state.finalResults.newRecords[0].place,1);
  assert.equal((await request(h,'action',{code:r.code,token:r.b.token,kind:'end'})).status,403);
  await stop(h);h=await startHost(dir);
  const resumed=await request(h,'resume',{code:r.code,token:r.a.token});
  assert.equal(resumed.state.legendary[20].length,2);assert.equal(resumed.state.finalResults.matchId,matchId);
  const rematch=await request(h,'action',{code:r.code,token:r.a.token,kind:'new-ranked-match'});
  assert.equal(rematch.state.stage,'playing');assert.equal(rematch.state.ranked,true);assert.notEqual(rematch.state.matchId,matchId);
  const reset=await request(h,'action',{code:r.code,token:r.a.token,kind:'reset'});
  assert.equal(reset.state.ranked,false);assert.equal(reset.state.legendary[20].length,2);
 }finally{await stop(h);fs.rmSync(dir,{recursive:true,force:true});}
});
test('10, 15, and 20-round categories remain independent; excluded legacy and practice rooms never enter',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mini036-'));let h=null;
 try{
  h=await startHost(dir);
  for(const rounds of [10,15,20]){
    const r=await room(h,rounds,true);h=await putOnFinalTurn(h,dir,r,[rounds*100,400]);
    const finished=await request(h,'action',{code:r.code,token:r.b.token,kind:'end'});
    assert.equal(finished.status,200);
    assert.equal(finished.state.legendary[rounds].length,2);
    for(const other of [10,15,20])if(other!==rounds && other>rounds)assert.equal(finished.state.legendary[other].length,0);
  }
  const practice=await room(h,10,false);h=await putOnFinalTurn(h,dir,practice,[99999,99999]);
  const unranked=await request(h,'action',{code:practice.code,token:practice.b.token,kind:'end'});
  assert.equal(unranked.state.finalResults.legendaryEligible,false);
  assert.equal(unranked.state.legendary[10].length,2);
  const old=await room(h,12,true);assert.equal((await request(h,'resume',{code:old.code,token:old.a.token})).state.ranked,false);
 }finally{await stop(h);fs.rmSync(dir,{recursive:true,force:true});}
});
test('property collection, celebration and hall are accessible without changing shared game state',()=>{
 const html=fs.readFileSync(path.join(ROOT,'public/index.html'),'utf8');
 const js=fs.readFileSync(path.join(ROOT,'public/app.js'),'utf8');
 const css=fs.readFileSync(path.join(ROOT,'public/styles.css'),'utf8');
 for(const id of ['myPropertiesButton','propertySetRows','legendaryButton','legendaryEntries','awardsLayer','viewFinalBoardButton','showResultsButton','replayAwardsButton','rankedRematchButton'])assert.ok(html.includes('id="'+id+'"'),id);
 for(const code of ['renderMyProperties','makePropertyRow','GAME_WORLDS','renderLegendary','finalResults','newRecords','showAwards','hideAwards','makeCelebration'])assert.ok(js.includes(code),code);
 assert.ok(js.includes("d.color" )||js.includes('deed.color'));
 assert.match(css,/\.champion-name/);assert.match(css,/@keyframes miniConfetti/);assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});
test('four or more legendary performances retain only the highest three, with repeated champions allowed',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mini036-'));let h=null;
 try{
  h=await startHost(dir);
  const x=await room(h,20,true);h=await putOnFinalTurn(h,dir,x,[2000,1800]);
  const first=await request(h,'action',{code:x.code,token:x.b.token,kind:'end'});
  assert.equal(first.state.legendary[20].length,2);
  const y=await room(h,20,true);h=await putOnFinalTurn(h,dir,y,[4000,3000]);
  const second=await request(h,'action',{code:y.code,token:y.b.token,kind:'end'});
  assert.equal(second.state.legendary[20].length,3);
  assert.deepEqual(second.state.legendary[20].map(x=>x.worth),[4060,3125,2060]);
 }finally{await stop(h);fs.rmSync(dir,{recursive:true,force:true});}
});
test('a finished v0.3.5 room upgrades to display-only awards without rewriting legendary history',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mini036-'));let h=null;
 try{
  h=await startHost(dir);const r=await room(h,20,true);await stop(h);
  const file=path.join(dir,'rooms.json'),saved=JSON.parse(fs.readFileSync(file,'utf8'));
  const entry=saved.rooms.find(x=>x.code===r.code);entry.stage='finished';entry.phase='finished';entry.round=21;
  delete entry.ranked;delete entry.finalResults;delete entry.matchId;fs.writeFileSync(file,JSON.stringify(saved));
  h=await startHost(dir);
  const resumed=await request(h,'resume',{code:r.code,token:r.a.token});
  assert.equal(resumed.state.round,20);assert.ok(resumed.state.finalResults.standings.length===2);
  assert.equal(resumed.state.finalResults.legendaryEligible,false);assert.equal(resumed.state.legendary[20].length,0);
 }finally{await stop(h);fs.rmSync(dir,{recursive:true,force:true});}
});
