'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),net=require('node:net'),{spawn}=require('node:child_process');
const express=require('../lib/express-mode'),trading=require('../lib/trading'),{deeds}=require('../game-data.json');
function room(){const r={gameMode:'express',stage:'playing',phase:'post',matchId:'moving-test',round:10,rounds:10,turn:0,owned:{},foreclosures:[],log:[],players:[{id:'a',name:'A',cash:1500,perks:[],out:false},{id:'b',name:'B',cash:1500,perks:[],out:false}]};express.initialize(r);return r;}
const locations=(r,world)=>Object.keys(r.collapse.lost).filter(id=>deeds.find(d=>d.id===id).board===world);
async function game(t,{count=2,rolls='2'}={}){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mini-moving-'));let child,base;
 async function start(){const port=await new Promise(resolve=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p));});});base='http://127.0.0.1:'+port;child=spawn(process.execPath,['server.js'],{cwd:path.join(__dirname,'..'),env:{...process.env,HOST:'127.0.0.1',PORT:String(port),DATA_DIR:dir,NODE_ENV:'test',TEST_ROLL_SEQUENCE:rolls,TEST_CARD_SEQUENCE:'1'},stdio:'ignore'});for(let i=0;i<200;i++){try{if((await fetch(base+'/api/network')).ok)return;}catch{}await new Promise(r=>setTimeout(r,25));}throw Error('Host not ready');}
 async function stop(){if(child?.exitCode===null&&!child.signalCode){child.kill();await new Promise(r=>child.once('exit',r));}}
 t.after(async()=>{await stop();fs.rmSync(dir,{recursive:true,force:true});});await start();
 const api=async(route,body)=>{const res=await fetch(base+'/api/'+route,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});return {status:res.status,...await res.json()};};
 const a=await api('create',{name:'Host',gameMode:'express',capacity:count,rounds:10}),seats=[a];for(let i=1;i<count;i++)seats.push(await api('join',{code:a.code,name:'Guest'+i}));
 const act=async(seat,kind,extra={})=>{const d=await api('action',{code:a.code,token:seats[seat].token,kind,...extra});assert.equal(d.status,200,d.error);return d.state;},resume=async()=>(await api('resume',{code:a.code,token:a.token})).state;
 const edit=async fn=>{await stop();const f=path.join(dir,'rooms.json'),d=JSON.parse(fs.readFileSync(f));fn(d.rooms.find(r=>r.code===a.code));fs.writeFileSync(f,JSON.stringify(d));await start();};return {act,resume,edit,dir,api,seats};
}
test('portals replace the previous map, never exceed three per world, and every position moves each full round',()=>{
 for(let trial=0;trial<40;trial++){
  const r=room();express.startRound(r);let old=[];
  for(let wave=1;wave<=25;wave++){
   r.round=10+wave;express.startRound(r);const ids=Object.keys(r.collapse.lost);
   assert.equal(ids.length,3*Math.min(3,wave));assert.equal(new Set(ids).size,ids.length);assert.ok(ids.every(id=>deeds.some(d=>d.id===id)));assert.ok(old.every(id=>!ids.includes(id)),'All old positions close');
   for(let world=0;world<3;world++)assert.equal(locations(r,world).length,Math.min(3,wave));
   assert.ok(r.collapse.endangered.every(id=>!ids.includes(id)));old=ids;
  }
 }
});
test('closed portals restore the exact deed and upgrades, keep foreclosures, and do not revive eliminated owners',()=>{
 const r=room();r.owned={'0-1':{owner:0,level:3,mortgage:true},'1-1':{owner:1,level:1}};const original=structuredClone(r.owned['0-1']);r.foreclosures=[{deedId:'2-1',previousOwner:0}];r.collapse.endangered=['0-1','1-1','2-1'];r.round=11;express.startRound(r);assert.equal(r.owned['0-1'].lost,true);assert.equal(r.foreclosures.length,1);r.players[1].out=true;
 r.round=12;express.startRound(r);assert.deepEqual(r.owned['0-1'],original);assert.equal(r.owned['1-1'],undefined);assert.equal(r.collapse.history['0-1'],1);
});
test('migration caps legacy accumulated voids, preserves current rescue/token balance and is idempotent',()=>{
 const r=room();delete r.collapse.portalRule;r.collapse.version=2;r.collapse.wave=7;r.round=17;r.collapse.lost={};r.owned={};
 for(const d of deeds){r.collapse.lost[d.id]=Math.min(7,Math.floor(d.pos/2)+1);r.owned[d.id]={owner:0,level:2,lost:true};}
 r.players[0].evadeAward={version:1,earned:3,remaining:1,rescued:['0-1','0-3'],properties:6,improved:3,points:9};r.lastRoll={evade:{id:'0-1'}};
 assert.equal(express.migratePortals(r),true);for(let world=0;world<3;world++)assert.equal(locations(r,world).length,3);assert.ok(r.collapse.lost['0-1']);assert.equal(r.players[0].evadeAward.remaining,1);assert.ok(r.players[0].evadeAward.rescued.includes('0-1'));assert.ok(Object.values(r.owned).filter(o=>!o.lost).length>0);
 const snapshot=structuredClone(r);assert.equal(express.migratePortals(r),false);assert.deepEqual(r,snapshot);
 const finished=room();finished.stage='finished';delete finished.collapse.portalRule;const historical=structuredClone(finished);assert.equal(express.migratePortals(finished),false);assert.deepEqual(finished,historical);
 const countdown=room();countdown.gameMode='countdown';delete countdown.collapse.portalRule;const untouched=structuredClone(countdown);assert.equal(express.migratePortals(countdown),false);assert.deepEqual(countdown,untouched);
});
test('repeat protection is per round: revisits are fatal now but a later returning portal can spend a remaining token',()=>{
 const r=room();r.owned=Object.fromEntries(deeds.slice(0,6).map(d=>[d.id,{owner:0,level:1}]));r.collapse.endangered=['0-1','1-1','2-1'];r.round=11;express.startRound(r);
 assert.equal(express.useEvade(r,r.players[0],'0-1').remaining,2);assert.equal(express.useEvade(r,r.players[0],'0-1'),null);r.round=12;express.startRound(r);assert.equal(r.players[0].evadeAward.remaining,2);assert.deepEqual(r.players[0].evadeAward.rescued,[]);assert.equal(express.useEvade(r,r.players[0],'0-1'),null,'Closed square is safe and never spends');
 r.collapse.endangered=['0-1','1-1','2-1'];r.round=13;express.startRound(r);assert.equal(express.useEvade(r,r.players[0],'0-1').remaining,1);assert.equal(express.useEvade(r,r.players[0],'0-1'),null);
});
test('a portal invalidates pending offers permanently rather than reactivating them when it closes',()=>{
 const r=room();r.owned={'0-1':{owner:0,level:1}};trading.act(r,r.players[0],'trade-propose',null,{to:'b',give:['0-1'],cashTake:1});const offer=r.trades[0];r.collapse.endangered=['0-1'];r.round=11;express.startRound(r);assert.equal(offer.status,'expired');r.round=12;express.startRound(r);assert.equal(r.owned['0-1'].lost,undefined);assert.equal(trading.list(r,r.players[1])[0].status,'expired');assert.throws(()=>trading.act(r,r.players[1],'trade-accept',offer.id),/no longer/);
});
test('real round boundaries relocate once; restored upgraded property regains value and charges its original rent',async t=>{
 const g=await game(t);await g.act(0,'start');await g.edit(r=>{r.round=10;r.turn=1;r.phase='post';r.owned={'0-3':{owner:1,level:1,mortgage:false}};r.collapse.endangered=['0-3','1-1','2-1'];r.players[0].pos=3;r.players[0].penalty=0;});let s=await g.act(1,'end');assert.equal(s.players[0].out,false,'Opening below a parked piece is safe');assert.equal(s.owned['0-3'].lost,true);assert.equal(s.players[1].worth,1500);const map=structuredClone(s.collapse);await g.edit(()=>{});assert.deepEqual((await g.resume()).collapse,map,'Restart preserves both active and next maps');
 await g.edit(r=>{r.turn=0;r.phase='post';r.lastRoll=null;});await g.act(0,'end');assert.deepEqual((await g.resume()).collapse,map,'A player turn is not a full round');await g.edit(r=>{r.turn=1;r.phase='post';r.lastRoll=null;});s=await g.act(1,'end');assert.equal(s.collapse.wave,2);assert.equal(s.collapse.lost['0-3'],undefined);assert.equal(s.owned['0-3'].lost,undefined);assert.equal(s.owned['0-3'].level,1);const deed=deeds.find(d=>d.id==='0-3');assert.equal(s.players[1].worth,1500+deed.price+deed.upgradeCost/2);
 await g.edit(r=>{r.players[0].pos=1;r.turn=0;r.phase='roll';r.lastRoll=null;});s=await g.act(0,'roll');assert.equal(s.players[0].out,false);assert.equal(s.pending.kind,'rent');assert.ok(s.pending.ember);const fee=s.pending.amount;assert.ok(fee>=75&&fee<=150);assert.equal(s.pending.creditor,null);s=await g.act(0,'pay');assert.equal(s.pending.amount,deed.base*2);assert.equal(s.pending.ember,undefined);s=await g.act(0,'pay');assert.equal(s.players[1].cash,1500+deed.base*2);
});
test('a repeat portal landing during bonus rolls is fatal despite remaining tokens, without moving the map',async t=>{
 const g=await game(t,{rolls:'11,11,5'});await g.act(0,'start');await g.edit(r=>{r.round=10;r.turn=1;r.phase='post';r.owned=Object.fromEntries(deeds.filter(d=>d.type==='p').slice(0,6).map(d=>[d.id,{owner:0,level:1}]));r.collapse.endangered=['0-1','1-1','2-1'];r.players[0].pos=6;});let s=await g.act(1,'end'),map=structuredClone(s.collapse);s=await g.act(0,'roll');assert.equal(s.post.kind,'evade');assert.equal(s.players[0].evade.remaining,2);s=await g.act(0,'bonus-roll',{rollAt:s.lastRoll.at});if(s.phase==='purchase')s=await g.act(0,'pass');if(s.phase==='card')s=await g.act(0,'continue-card');if(s.phase==='rent')s=await g.act(0,'pay');assert.equal(s.extraRoll,true);s=await g.act(0,'bonus-roll',{rollAt:s.lastRoll.at});assert.equal(s.players[0].out,true);assert.equal(s.players[0].evade.remaining,2);assert.equal(s.finalResults.standings[0].seat,1);assert.deepEqual(s.collapse,map);
});
test('loading an old active room repairs overpopulation immediately and persists it without changing finished records',async t=>{
 const g=await game(t);await g.act(0,'start');await g.edit(r=>{r.round=16;r.collapse.wave=6;delete r.collapse.portalRule;r.collapse.version=2;r.collapse.lost=Object.fromEntries(deeds.map(d=>[d.id,1]));r.owned=Object.fromEntries(deeds.map(d=>[d.id,{owner:0,level:1,lost:true}]));});const s=await g.resume();assert.equal(s.collapse.portalRule,'moving-v1');assert.equal(Object.keys(s.collapse.lost).length,9);for(let world=0;world<3;world++)assert.equal(locations(s,world).length,3);assert.ok(Object.values(s.owned).some(o=>!o.lost));const persisted=JSON.parse(fs.readFileSync(path.join(g.dir,'rooms.json'))).rooms[0];assert.deepEqual(persisted.collapse,s.collapse);await g.edit(()=>{});assert.deepEqual((await g.resume()).collapse,s.collapse);
});
const recovery=require('../lib/portal-recovery');
test('recovery heat decays for exactly two rounds and host fees stay in disjoint random bands for every piece',()=>{
 const r=room();r.collapse.wave=2;r.collapse.history={'0-1':1};const before=structuredClone(r),first=new Set();for(const piece of ['car','school-bus','🚀','📱','🚗','🛵','🎮','🐱','🐶','🦖'])for(let i=0;i<30;i++){const fee=recovery.charge(r,{piece},'0-1');assert.equal(fee.heat,'hot');assert.ok(fee.amount>=75&&fee.amount<=150);assert.match(fee.message,/bank/);assert.match(fee.cause,/tires|engine|hull|gear|fabric|propeller|soles|burns|scorched|ill|paws|feet/i);first.add(fee.amount);}assert.ok(first.size>20);assert.deepEqual(r,before,'Preview and fee draw do not mutate room');
 r.collapse.wave=3;for(let i=0;i<100;i++){const fee=recovery.charge(r,{piece:'car'},'0-1');assert.equal(fee.heat,'cooling');assert.ok(fee.amount>=25&&fee.amount<=60);}r.collapse.wave=4;assert.equal(recovery.charge(r,{piece:'car'},'0-1'),null);r.collapse.wave=2;r.collapse.lost['0-1']=2;assert.equal(recovery.status(r,'0-1'),null);r.gameMode='countdown';assert.equal(recovery.status(r,'0-1'),null);
});
test('a damage fee is saved once, cannot be rerolled, and rent follows it without charging twice',async t=>{
 const g=await game(t);await g.act(0,'start');await g.edit(r=>{r.round=12;r.collapse.wave=2;r.collapse.lost={};r.collapse.history={'0-3':1};r.owned={'0-3':{owner:1,level:1}};r.players[0].piece='car';r.players[0].pos=1;});let s=await g.act(0,'roll');const fee=s.pending.amount;assert.match(s.pending.ember.cause,/police car/);assert.equal(s.players[0].cash,1500);await g.edit(()=>{});assert.equal((await g.resume()).pending.amount,fee);const {code,token}=g.seats[0];assert.equal((await g.api('action',{code,token,kind:'roll'})).status,400);assert.equal((await g.api('action',{code,token:g.seats[1].token,kind:'pay'})).status,403);
 s=await g.act(0,'pay');assert.equal(s.players[0].cash,1500-fee);assert.equal(s.pending.ember,undefined);assert.equal(s.pending.amount,20);await g.edit(()=>{});s=await g.act(0,'pay');assert.equal(s.players[0].cash,1500-fee-20);assert.equal(s.players[1].cash,1520);assert.equal((await g.api('action',{code,token,kind:'pay'})).status,400);assert.equal(JSON.parse(fs.readFileSync(path.join(g.dir,'rooms.json'))).rooms[0].emberLanding,null);
});
test('a hot unowned landing collects GO once before the fee, then offers the normal purchase',async t=>{
 const g=await game(t,{rolls:'3'});await g.act(0,'start');await g.edit(r=>{r.round=12;r.collapse.wave=2;r.collapse.lost={};r.collapse.history={'0-2':1};r.owned=Object.fromEntries(deeds.filter(d=>d.type==='p').map(d=>[d.id,{owner:1,level:0}]));r.players[0].pos=15;r.players[0].cash=0;});let s=await g.act(0,'roll');assert.equal(s.players[0].cash,200);const fee=s.pending.amount;s=await g.act(0,'pay');assert.equal(s.players[0].cash,200-fee);assert.equal(s.phase,'purchase');assert.equal(s.pending.id,'0-2');s=await g.act(0,'pass');assert.equal(s.owned['0-2'],undefined);assert.equal(s.players[0].cash,200-fee);
});
test('owners also pay ember damage; crossing or being pulled onto a hot space does not charge guests',async t=>{
 const g=await game(t,{count:3,rolls:'6'});await g.act(0,'start');await g.edit(r=>{r.worldShift='gravity';r.round=12;r.collapse.wave=2;r.collapse.lost={};r.collapse.history={'1-7':1};r.owned={'1-7':{owner:0,level:1}};r.players[0].pos=1;r.players[1].pos=2;r.players[1].board=2;r.players[2].pos=3;r.players[2].board=0;});let s=await g.act(0,'roll');assert.ok(s.lastRoll.gravityPull);assert.equal(s.pending.ember.id,'1-7');const fee=s.pending.amount;assert.deepEqual(s.players.slice(1).map(p=>p.cash),[1500,1500]);s=await g.act(0,'pay');assert.equal(s.post.kind,'owned');assert.equal(s.players[0].cash,1500-fee);assert.equal(s.owned['1-7'].level,1);
});
test('bankruptcy on an ember fee clears the deferred landing and all abandoned deeds, including active portals',async t=>{
 const g=await game(t,{count:3});await g.act(0,'start');await g.edit(r=>{r.round=12;r.collapse.wave=2;r.collapse.lost={'1-1':2};r.collapse.history={'0-3':1};r.owned={'1-1':{owner:0,level:1,lost:true},'0-3':{owner:0,level:1}};r.players[0].cash=0;r.players[0].pos=1;});let s=await g.act(0,'roll');assert.ok(s.pending.ember);s=await g.act(0,'bankrupt');assert.equal(s.players[0].out,true);assert.ok(Object.values(s.owned).every(o=>o.owner!==0));assert.equal(s.turn,1);const saved=JSON.parse(fs.readFileSync(path.join(g.dir,'rooms.json'))).rooms[0];assert.equal(saved.emberLanding,null);assert.equal(s.phase,'roll');
});
test('crossing hot debris is free, second-round landings have lower fees, and the third recovered round has none',async t=>{
 const g=await game(t);await g.act(0,'start');await g.edit(r=>{r.round=12;r.collapse.wave=2;r.collapse.lost={};r.collapse.history={'0-2':1};r.owned={'0-3':{owner:1,level:1}};r.players[0].pos=1;});let s=await g.act(0,'roll');assert.equal(s.pending.ember,undefined);assert.equal(s.pending.amount,20,'Crossing the hot rail does not charge damage');
 await g.edit(r=>{r.round=13;r.testRollIndex=0;r.collapse.wave=3;r.collapse.history={'0-3':1};r.turn=0;r.phase='roll';r.pending=null;r.post=null;r.obligation=null;r.lastRoll=null;r.players[0].pos=1;});s=await g.act(0,'roll');assert.equal(s.pending.ember.heat,'cooling');assert.ok(s.pending.amount>=25&&s.pending.amount<=60);await g.act(0,'pay');await g.act(0,'pay');
 await g.edit(r=>{r.round=14;r.testRollIndex=0;r.collapse.wave=4;r.turn=0;r.phase='roll';r.pending=null;r.post=null;r.obligation=null;r.lastRoll=null;r.players[0].pos=1;});s=await g.act(0,'roll');assert.equal(s.pending.ember,undefined);assert.equal(s.pending.amount,20);
});
