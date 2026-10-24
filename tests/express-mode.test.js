'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),net=require('node:net'),{spawn}=require('node:child_process');
const express=require('../lib/express-mode'),options=require('../lib/match-options'),view=require('../public/express-view'),{deeds}=require('../game-data.json');
const root=path.join(__dirname,'..');
async function game(t,{count=2,rolls='2',settings={}}={}){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mini-express-'));let child,base;
 async function start(){const port=await new Promise(resolve=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p));});});base='http://127.0.0.1:'+port;child=spawn(process.execPath,['server.js'],{cwd:root,env:{...process.env,HOST:'127.0.0.1',PORT:String(port),DATA_DIR:dir,NODE_ENV:'test',TEST_ROLL_SEQUENCE:rolls,TEST_CARD_SEQUENCE:'1'},stdio:'ignore'});for(let i=0;i<200;i++){try{if((await fetch(base+'/api/network')).ok)return;}catch{}await new Promise(r=>setTimeout(r,25));}throw Error('Host did not start');}
 async function stop(){if(child?.exitCode===null&&!child.signalCode){child.kill();await new Promise(resolve=>child.once('exit',resolve));}}
 t.after(async()=>{await stop();fs.rmSync(dir,{recursive:true,force:true});});await start();
 const api=async(route,body)=>{const res=await fetch(base+'/api/'+route,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});return {status:res.status,...await res.json()};};
 const a=await api('create',{name:'Host',capacity:count,gameMode:'express',rounds:10,...settings});assert.equal(a.status,200);const seats=[a];for(let i=1;i<count;i++)seats.push(await api('join',{code:a.code,name:'Guest '+i}));
 const act=(seat,kind,extra={})=>api('action',{code:a.code,token:seats[seat].token,kind,...extra}),resume=()=>api('resume',{code:a.code,token:a.token});
 async function edit(fn){await stop();const file=path.join(dir,'rooms.json'),data=JSON.parse(fs.readFileSync(file));fn(data.rooms.find(r=>r.code===a.code));fs.writeFileSync(file,JSON.stringify(data));await start();}
 return {a,seats,act,resume,edit,api,dir};
}
test('two random starter homes give all 2–4 players exactly $400, without duplicate deeds or charging cash',()=>{
 const deals=new Set();
 for(let n=2;n<=4;n++)for(let trial=0;trial<300;trial++){
  const room={gameMode:'express',owned:{},log:[],players:Array.from({length:n},(_,i)=>({name:'P'+i,perks:[],cash:1500}))};express.initialize(room);
  assert.equal(Object.keys(room.owned).length,n*2);
  room.players.forEach((p,seat)=>{const portfolio=deeds.filter(d=>room.owned[d.id]?.owner===seat);assert.equal(portfolio.length,2);assert.ok(portfolio.every(d=>d.type==='p'));assert.equal(portfolio.reduce((s,d)=>s+d.price,0),400);assert.notEqual(portfolio[0].color,portfolio[1].color);assert.equal(p.cash,1500);assert.deepEqual(p.perks,['building']);});
  deals.add(Object.keys(room.owned).sort().join(','));
 }
 assert.ok(deals.size>20,'Deals vary across matches');
});
test('Express accepts only 10/15/20 building rounds; legacy settings stay Classic and ranked rules stay isolated',async t=>{
 assert.deepEqual(options.parse(),{rounds:0,startingCash:1500,worldShift:'individual'});
 for(const rounds of [0,12,30,50])assert.throws(()=>options.parse({gameMode:'express',rounds}));
 for(const rounds of [10,15,20])assert.equal(options.parse({gameMode:'express',rounds}).gameMode,'express');
 const g=await game(t);assert.equal(g.a.state.ranked,false);assert.equal(g.a.state.gameMode,'express');assert.equal((await g.act(0,'start')).status,200);
 for(const opts of [{gameMode:'classic'},{rounds:15},{collapseRentBoost:true}])assert.equal((await g.act(0,'set-options',{options:opts})).status,400);
 assert.equal((await g.act(1,'set-options',{options:{worldShift:'gravity'}})).status,403);
 assert.equal((await g.act(0,'set-options',{options:{worldShift:'gravity'}})).status,200);
 assert.equal((await g.act(0,'extend-match')).status,400);
 let state=(await g.resume()).state;assert.equal(state.rounds,10);assert.equal(state.gameMode,'express');assert.equal(state.worldShift,'gravity');
 assert.equal(state.players[0].worth,1900);assert.equal(state.players[0].deeds,2);
 const id=Object.keys(state.owned).find(id=>state.owned[id].owner===0);assert.equal((await g.act(0,'use-perk',{perk:'building',id})).status,200);
 state=(await g.resume()).state;assert.equal(state.owned[id].level,1);assert.equal(state.players[0].cash,1500);assert.deepEqual(state.players[0].perks,[]);
});
for(const rounds of [10,15,20])test(rounds+' rounds: five warnings, midpoint permit once, a full-round danger notice, then waves that persist',async t=>{
 const g=await game(t,{settings:{rounds}});await g.act(0,'start');
 const boundary=async round=>{await g.edit(r=>{r.round=round;r.turn=1;r.phase='post';r.pending=null;r.post=null;r.lastRoll=null;});return (await g.act(1,'end')).state;};
 let state=await boundary(Math.ceil(rounds/2));assert.ok(state.players.every(p=>p.perks.filter(x=>x==='building').length===2));assert.equal(state.collapse.midpointGranted,true);
 await g.edit(()=>{});state=(await g.resume()).state;assert.equal(state.players[0].perks.length,2);
 for(let remaining=5;remaining>=1;remaining--){state=await boundary(rounds-remaining);assert.equal(view.stage(state).warning,6-remaining);assert.equal(state.collapse.wave,0);assert.equal(Object.keys(state.collapse.lost).length,0);}
 assert.equal(state.round,rounds);assert.equal(state.collapse.endangered.length,3);assert.deepEqual(new Set(state.collapse.endangered.map(id=>Number(id[0]))),new Set([0,1,2]));
 const first=[...state.collapse.endangered],id=first[0];
 await g.edit(r=>{r.turn=1;r.phase='post';r.owned[id]={owner:0,level:2,mortgage:false};r.players[0].board=Number(id[0]);r.players[0].pos=Number(id.split('-')[1]);r.foreclosures=[{deedId:first[1],previousOwner:0,round:1,createdTurn:0}];});
 state=(await g.act(1,'end')).state;assert.equal(state.stage,'playing');assert.equal(state.round,rounds+1);assert.equal(state.collapse.wave,1);assert.equal(state.collapse.endangered.length,6);assert.ok(first.every(id=>state.collapse.lost[id]===1));assert.equal(state.players[0].out,false,'Standing on a collapsing space is safe');assert.equal(state.owned[id].lost,true);assert.equal(state.foreclosures.length,0);assert.equal(view.stage(state).wave,1);
 assert.equal((await g.act(0,'set-options',{options:{worldShift:'gravity'}})).status,200,'World shift remains editable after the building period');
 const snapshot=structuredClone(state.collapse);await g.edit(()=>{});assert.deepEqual((await g.resume()).state.collapse,snapshot);
 await g.edit(r=>{r.phase='post';});for(const kind of ['sell-deed','sell-upgrade','upgrade','foreclose'])assert.equal((await g.act(0,kind,{id})).status,400);
 assert.equal((await g.act(0,'use-perk',{perk:'building',id})).status,400);
 state=await boundary(rounds+1);assert.equal(state.collapse.wave,2);assert.equal(Object.keys(state.collapse.lost).length,9);assert.ok(state.collapse.endangered.every(id=>!state.collapse.lost[id]));
});
test('crossing GO or landing on it after a lap gives exactly one home; Gravity Pull guests get no cash or homes',async t=>{
 const g=await game(t,{rolls:'6',settings:{worldShift:'gravity'}});await g.act(0,'start');
 await g.edit(r=>{r.players[0].pos=10;r.owned={};});
 let state=(await g.act(0,'roll')).state;assert.equal(state.players[0].cash,1700);assert.equal(state.players[0].deeds,1);assert.equal(state.players[1].cash,1500);assert.equal(state.players[1].deeds,0);assert.ok(state.lastRoll.gravityPull);assert.equal(state.players[0].pos,0);
 await g.edit(r=>{r.turn=0;r.phase='roll';r.lastRoll=null;r.players[0].pos=15;r.testRollIndex=0;});
 state=(await g.act(0,'roll')).state;assert.equal(state.players[0].cash,1900);assert.equal(state.players[0].deeds,2);assert.equal(state.players[1].cash,1500);
});
test('GO rewards exclude foreclosures and lost homes, and exhaustion still pays the ordinary GO cash',async t=>{
 const g=await game(t);await g.act(0,'start');
 await g.edit(r=>{r.owned={};for(const d of deeds.filter(d=>d.type==='p'))r.collapse.lost[d.id]=1;r.collapse.wave=1;r.players[0].pos=15;});
 let state=(await g.act(0,'roll')).state;assert.equal(state.players[0].out,true,'The dice destination is lost, even after passing GO');assert.equal(state.players[0].cash,1500,'Fatal landing resolves before rewards');
 await g.act(0,'reset');await g.edit(r=>{r.players[0].pos=14;r.owned={};r.foreclosures=deeds.filter(d=>d.type==='p').map((d,i)=>({id:i,deedId:d.id,previousOwner:1,createdTurn:0,round:1}));});
 state=(await g.act(0,'roll')).state;assert.equal(state.players[0].pos,0);assert.equal(state.players[0].cash,1700);assert.equal(Object.keys(state.owned).length,0);
});
test('fatal shifted landing cancels Gravity Pull and bonuses; survivor wins regardless of wealth; records and restarts preserve survival order',async t=>{
 const g=await game(t,{count:3,rolls:'6',settings:{worldShift:'gravity'}});await g.act(0,'start');
 await g.edit(r=>{r.round=11;r.collapse.wave=1;r.collapse.lost['1-7']=1;r.owned={};r.players[0].pos=1;r.players[1].board=2;r.players[1].pos=4;r.players[2].board=0;r.players[2].pos=15;});
 let state=(await g.act(0,'roll')).state;assert.equal(state.stage,'playing');assert.equal(state.phase,'post');assert.equal(state.players[0].out,true);assert.equal(state.players[0].outReason,'collapse');assert.equal(state.players[0].eliminationOrder,1);assert.equal(state.extraRoll,false);assert.equal(state.lastRoll.gravityPull,undefined);assert.deepEqual(state.players.slice(1).map(p=>[p.board,p.pos]),[[2,4],[0,15]]);
 assert.equal((await g.act(0,'use-perk',{perk:'building',id:'0-1'})).status,400);assert.equal((await g.act(0,'end')).state.turn,1);
 await g.edit(r=>{r.players[1].board=0;r.players[1].pos=1;r.players[1].cash=9999;r.players[2].cash=1;r.testRollIndex=0;r.phase='roll';r.lastRoll=null;});
 state=(await g.act(1,'roll')).state;assert.equal(state.stage,'finished');assert.equal(state.round,11);assert.equal(state.finalResults.reason,'last-player');assert.equal(state.finalResults.gameMode,'express');assert.equal(state.finalResults.legendaryEligible,false);assert.deepEqual(state.finalResults.standings.map(p=>p.seat),[2,1,0]);assert.ok(state.finalResults.standings[0].worth<state.finalResults.standings[1].worth);assert.deepEqual(state.legendaryGravity,{10:[],15:[],20:[]});
 const records=JSON.parse(fs.readFileSync(path.join(g.dir,'match-records.json'))).matches;assert.equal(records.length,1);assert.equal(records[0].gameMode,'express');assert.deepEqual(records[0].standings.map(p=>p.place),[1,2,3]);await g.edit(()=>{});assert.deepEqual((await g.resume()).state.finalResults,state.finalResults);
 await g.act(0,'reset');assert.equal(JSON.parse(fs.readFileSync(path.join(g.dir,'match-records.json'))).matches.length,1);state=(await g.resume()).state;assert.equal(state.collapse.wave,0);assert.ok(state.players.every(p=>!p.out&&!p.outReason));assert.equal(Object.keys(state.owned).length,6);
});
test('crossing a lost space is safe; collapse rent is normal by default and optional +50% only after collapse',async t=>{
 const g=await game(t,{rolls:'2'});await g.act(0,'start');
 async function land(wave,boost){await g.edit(r=>{r.testRollIndex=0;r.collapse.wave=wave;r.collapseRentBoost=boost;r.collapse.lost={'0-2':1};r.owned={'0-2':{owner:1,level:0,lost:true},'0-3':{owner:1,level:1}};r.players[0].pos=1;r.turn=0;r.phase='roll';r.lastRoll=null;});return (await g.act(0,'roll')).state;}
 let state=await land(1,false);assert.equal(state.players[0].out,false);assert.equal(state.pending.amount,20);
 state=await land(0,true);assert.equal(state.pending.amount,20);
 state=await land(1,true);assert.equal(state.pending.amount,30);assert.equal(state.pending.collapseBonus,10);assert.equal((await g.act(0,'pay')).state.players[1].cash,1530);
});
test('bonus rolls do not advance the collapse wave, and Setback does not move or pull anyone',async t=>{
 const g=await game(t,{rolls:'7,2',settings:{worldShift:'gravity'}});await g.act(0,'start');
 await g.edit(r=>{r.round=11;r.collapse.wave=1;r.owned={};r.turn=1;r.players[1].pos=0;});
 let state=(await g.act(1,'roll')).state;assert.equal(state.extraRoll,true);if(state.phase==='purchase')state=(await g.act(1,'pass')).state;
 state=(await g.act(1,'end')).state;assert.equal(state.turn,1);assert.equal(state.collapse.wave,1);assert.equal(state.round,11);
 await g.edit(r=>{r.players[1].penalty=3;r.players[1].pos=8;r.testRollIndex=1;});state=(await g.act(1,'roll')).state;assert.equal(state.players[1].pos,8);assert.equal(state.lastRoll.noMove,true);assert.equal(state.lastRoll.gravityPull,undefined);assert.equal(state.collapse.wave,1);
});
test('complete Express matches use ordinary API turns through warnings, collapse, elimination and final standings',async t=>{
 for(const worldShift of ['individual','gravity']){
  const g=await game(t,{count:3,rolls:Array.from({length:350},(_,i)=>[2,5,6,3,8,9,4,10,12][i%9]).join(','),settings:{worldShift}});
  let state=(await g.act(0,'start')).state,sawCollapse=false;
  for(let step=0;state.stage!=='finished'&&step<1000;step++){
   const seat=state.turn,player=state.players[seat];let kind;
   if(state.phase==='roll')kind='roll';
   else if(state.phase==='purchase')kind='pass';
   else if(state.phase==='card')kind='continue-card';
   else if(state.phase==='rent')kind=player.cash>=state.obligation.amount?'pay':'bankrupt';
   else if(state.phase==='bail')kind=player.cash>=state.bailPending.fee?'pay-bail':'bankrupt';
   else if(state.phase==='post')kind='end';
   else assert.fail('Unexpected phase '+state.phase);
   const result=await g.act(seat,kind);assert.equal(result.status,200,JSON.stringify({kind,phase:state.phase,error:result.error}));state=result.state;
   if(state.collapse.wave)sawCollapse=true;
   if(state.round<=state.rounds)assert.equal(state.collapse.wave,0);
  }
  assert.equal(state.stage,'finished');assert.equal(sawCollapse,true);assert.equal(state.players.filter(p=>!p.out).length,1);assert.equal(state.finalResults.standings[0].bankrupt,false);assert.equal(state.finalResults.reason,'last-player');
 }
});
test('host launcher remembers Express defaults without ranking it alongside Classic',()=>{
 const {gameSettings}=require('../scripts/host-online');
 for(const rounds of [10,15,20]){const s=gameSettings({gameMode:'express',rounds,collapseRentBoost:true,ranked:true});assert.equal(s.gameMode,'express');assert.equal(s.rounds,rounds);assert.equal(s.collapseRentBoost,true);assert.equal(s.ranked,false);}
 assert.equal(gameSettings({gameMode:'express',rounds:0}).rounds,10);
});
