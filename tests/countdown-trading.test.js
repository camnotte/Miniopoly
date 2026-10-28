'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),net=require('node:net'),{spawn}=require('node:child_process');
const countdown=require('../lib/countdown-mode'),express=require('../lib/express-mode'),trading=require('../lib/trading'),options=require('../lib/match-options'),championship=require('../public/championship'),{deeds}=require('../game-data.json');
const root=path.join(__dirname,'..');
function room(){const r={code:'ABC234',matchId:'m',stage:'playing',phase:'post',turn:0,gameMode:'countdown',round:10,rounds:10,owned:{},log:[],players:[{id:'a',name:'Cam',cash:1500,perks:[],out:false},{id:'b',name:'Mac',cash:1500,perks:[],out:false}],foreclosures:[]};express.initialize(r);return r;}
async function host(t,{mode='countdown',rolls='1'}={}){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mini-countdown-'));let child,base;
 async function start(){const port=await new Promise(resolve=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p));});});base='http://127.0.0.1:'+port;child=spawn(process.execPath,['server.js'],{cwd:root,env:{...process.env,HOST:'127.0.0.1',PORT:String(port),DATA_DIR:dir,NODE_ENV:'test',TEST_ROLL_SEQUENCE:rolls},stdio:'ignore'});for(let i=0;i<200;i++){try{if((await fetch(base+'/api/network')).ok)return;}catch{}await new Promise(r=>setTimeout(r,25));}throw Error('Host did not start');}
 async function stop(){if(child?.exitCode===null&&!child.signalCode){child.kill();await new Promise(r=>child.once('exit',r));}}
 t.after(async()=>{await stop();fs.rmSync(dir,{recursive:true,force:true});});await start();
 const api=async(route,body)=>{const r=await fetch(base+'/api/'+route,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});return {status:r.status,...await r.json()};};
 const a=await api('create',{name:'Cam',capacity:3,gameMode:mode,rounds:10}),b=await api('join',{code:a.code,name:'Mac'}),c=await api('join',{code:a.code,name:'Alex'}),seats=[a,b,c];assert.equal(a.status,200);
 const act=(seat,kind,extra={})=>api('action',{code:a.code,token:seats[seat].token,kind,...extra});const resume=(seat=0)=>api('resume',{code:a.code,token:seats[seat].token});
 async function edit(fn){await stop();const file=path.join(dir,'rooms.json'),data=JSON.parse(fs.readFileSync(file));fn(data.rooms.find(r=>r.code===a.code));fs.writeFileSync(file,JSON.stringify(data));await start();}
 return {api,act,resume,edit,seats,dir,get base(){return base;}};
}
test('Countdown is a separate finite building mode with balanced starts, permits and no evade tokens',()=>{
 for(const rounds of [10,15,20]){assert.equal(options.parse({gameMode:'countdown',rounds}).gameMode,'countdown');assert.equal(options.rankedSettings({gameMode:'countdown',rounds,startingCash:1500}),false);}
 assert.throws(()=>options.parse({gameMode:'countdown',rounds:0}));const r=room();for(let seat=0;seat<2;seat++){const owned=countdown.active(r,seat);assert.equal(owned.length,2);assert.equal(owned.reduce((s,d)=>s+d.price,0),400);assert.deepEqual(r.players[seat].perks,['building']);assert.equal(express.protection(r,seat).enabled,false);}
});
test('Countdown targets 1, 2, 3… owned deeds globally, with full-round warning and no duplicate targets',()=>{
 const r=room();r.owned=Object.fromEntries(deeds.map((d,i)=>[d.id,{owner:i%2,level:0}]));const before=JSON.stringify(r.owned);express.startRound(r);assert.equal(r.collapse.endangered.length,1);assert.equal(JSON.stringify(r.owned),before);
 for(let wave=1;wave<=5;wave++){r.round=10+wave;express.startRound(r);assert.equal(r.collapse.lastConsumed.length,wave);assert.equal(r.collapse.endangered.length,wave+1);assert.equal(new Set(r.collapse.endangered).size,wave+1);assert.ok(r.collapse.endangered.every(id=>r.owned[id]&&!r.collapse.lost[id]));}
});
test('an upgrade shields a property once; trading and re-upgrading never restore the spent shield',()=>{
 const r=room();r.owned={'0-1':{owner:0,level:3},'0-3':{owner:0,level:0},'1-1':{owner:1,level:0},'1-3':{owner:1,level:0}};r.round=11;r.collapse.endangered=['0-1'];express.startRound(r);assert.equal(r.owned['0-1'].level,2);assert.equal(r.collapse.shieldSpent['0-1'],true);assert.equal(r.collapse.lost['0-1'],undefined);r.owned['0-1'].owner=1;r.owned['0-1'].level=3;r.round=12;r.collapse.endangered=['0-1'];express.startRound(r);assert.equal(r.owned['0-1'],undefined);assert.equal(r.collapse.lost['0-1'],2);assert.deepEqual(r.collapse.lastConsumed,['0-1']);
});
test('same-wave elimination uses starting property count and supports a genuine shared victory',()=>{
 const r=room();r.owned={'0-1':{owner:0,level:0},'1-1':{owner:1,level:0},'1-3':{owner:1,level:0}};r.round=11;r.collapse.endangered=Object.keys(r.owned);express.startRound(r);assert.ok(r.players.every(p=>p.out));const rows=r.players.map((p,seat)=>({...p,seat,bankrupt:p.out}));countdown.rank(rows);assert.equal(rows[0].id,'b');assert.equal(rows[0].place,1);assert.equal(rows[1].place,2);
 const tie=[{seat:0,bankrupt:true,eliminatedRound:11,countdownBefore:1},{seat:1,bankrupt:true,eliminatedRound:11,countdownBefore:1}];countdown.rank(tie);assert.deepEqual(tie.map(p=>p.place),[1,1]);
});
test('trades settle atomically with cash, preserve upgrades/shields, require recipient consent and expire conflicting offers',()=>{
 const r=room();r.owned={'0-1':{owner:0,level:1},'0-3':{owner:1,level:0}};r.collapse.shieldSpent['0-1']=true;const a=r.players[0],b=r.players[1];trading.act(r,a,'trade-propose',null,{to:b.id,give:['0-1'],take:['0-3'],cashGive:100,cashTake:20});const offer=r.trades[0];assert.throws(()=>trading.act(r,a,'trade-accept',offer.id),/recipient/);assert.equal(r.owned['0-1'].owner,0);trading.act(r,b,'trade-accept',offer.id);assert.equal(a.cash,1420);assert.equal(b.cash,1580);assert.equal(r.owned['0-1'].owner,1);assert.equal(r.owned['0-1'].level,1);assert.equal(r.collapse.shieldSpent['0-1'],true);assert.throws(()=>trading.act(r,b,'trade-accept',offer.id),/no longer/);assert.equal(a.cash,1420);
});
test('offers reject invalid funds, duplicates, stolen properties, forged counterparties and pending liabilities',()=>{
 const r=room(),a=r.players[0],b=r.players[1];r.owned={'0-1':{owner:0,level:0}};for(const patch of [{give:['0-1','0-1']},{cashGive:-1},{cashGive:2000},{cashGive:1.5},{to:a.id},{take:['0-1']}])assert.throws(()=>trading.act(r,a,'trade-propose',null,{to:b.id,give:['0-1'],...patch}));r.phase='rent';assert.throws(()=>trading.act(r,a,'trade-propose',null,{to:b.id,give:['0-1']}),/landing or payment/);r.phase='post';trading.act(r,a,'trade-propose',null,{to:b.id,give:['0-1']});r.owned['0-1'].level=1;assert.equal(trading.list(r,b)[0].status,'expired');assert.throws(()=>trading.act(r,b,'trade-accept',r.trades[0].id));
});
test('counteroffers reverse the negotiation, withdraw old terms, and consumed properties invalidate pending offers',()=>{
 const r=room(),a=r.players[0],b=r.players[1];r.owned={'0-1':{owner:0,level:0},'1-1':{owner:1,level:0}};trading.act(r,a,'trade-propose',null,{to:b.id,give:['0-1'],cashTake:100});const first=r.trades[0];trading.act(r,b,'trade-propose',null,{to:a.id,take:['0-1'],cashGive:50,replaces:first.id});assert.equal(first.status,'countered');const offer=r.trades[1];r.collapse.lost['0-1']=1;delete r.owned['0-1'];assert.equal(trading.list(r,a).find(t=>t.id===offer.id).status,'expired');assert.throws(()=>trading.act(r,a,'trade-accept',offer.id));
});
test('Countdown persists, consumed landings are safe and do not charge rent or cancel Gravity Pull',async t=>{
 const g=await host(t,{rolls:'6'});await g.act(0,'start');await g.edit(r=>{r.worldShift='gravity';r.round=11;r.collapse.wave=1;r.collapse.lost={'1-7':1};r.phase='roll';r.owned={'0-1':{owner:0,level:0},'1-1':{owner:1,level:0},'2-1':{owner:2,level:0}};r.players[0].pos=1;});let s=(await g.resume()).state;assert.equal(s.gameMode,'countdown');s=(await g.act(0,'roll')).state;assert.equal(s.post.kind,'countdown');assert.equal(s.players[0].out,false);assert.equal(s.players[0].cash,1500);assert.ok(s.lastRoll.gravityPull);assert.equal(s.players[1].pos,7);assert.equal(s.owned['1-7'],undefined);
});
test('Countdown permits keep the no-set exception, but further paid upgrades require the full set',async t=>{
 const g=await host(t);await g.act(0,'start');await g.edit(r=>{r.phase='post';r.pending=null;r.owned={'0-1':{owner:0,level:0}};});let s=(await g.act(0,'use-perk',{perk:'building',id:'0-1'})).state;assert.equal(s.owned['0-1'].level,1);assert.equal(s.players[0].cash,1500);assert.equal((await g.act(0,'upgrade',{id:'0-1'})).status,400);await g.edit(r=>{r.owned['0-15']={owner:0,level:0};}); // Full Brown set is selected below from catalog rather than assumed.
 const brown=deeds.filter(d=>d.color==='Brown');await g.edit(r=>{for(const d of brown)r.owned[d.id]={owner:0,level:d.id==='0-1'?1:0};});s=(await g.act(0,'upgrade',{id:'0-1'})).state;assert.equal(s.owned['0-1'].level,2);
});
test('real multiplayer offers are private, accepted off-turn, persisted, and update set eligibility',async t=>{
 const g=await host(t);await g.act(0,'start');const brown=deeds.filter(d=>d.color==='Brown'),first=brown[0],second=brown[1];await g.edit(r=>{r.phase='post';r.pending=null;r.owned={[first.id]:{owner:0,level:0},[second.id]:{owner:1,level:0},'2-1':{owner:2,level:0}};});let s=(await g.act(0,'trade-propose',{trade:{to:g.seats[1].state?.youId||(await g.resume(1)).state.youId,take:[second.id],cashGive:100}})).state;assert.equal(s.trades.length,1);assert.equal((await g.resume(2)).state.trades.length,0);await g.edit(()=>{});s=(await g.resume(1)).state;assert.equal(s.trades[0].status,'pending');s=(await g.act(1,'trade-accept',{id:s.trades[0].id})).state;assert.equal(s.owned[second.id].owner,0);assert.equal(s.players[0].cash,1400);assert.equal(s.players[1].cash,1600);s=(await g.act(0,'upgrade',{id:first.id})).state;assert.equal(s.owned[first.id].level,1);
});
test('a wave finalizes a sole survivor or tied finalists without assigning an eliminated next turn',async t=>{
 const g=await host(t);await g.act(0,'start');await g.edit(r=>{r.round=10;r.turn=2;r.phase='post';r.pending=null;r.owned={'0-1':{owner:0,level:0},'1-1':{owner:1,level:0},'2-1':{owner:2,level:0}};r.collapse.endangered=['0-1','1-1'];});let s=(await g.act(2,'end')).state;assert.equal(s.stage,'finished');assert.equal(s.finalResults.standings[0].seat,2);assert.equal(s.finalResults.standings[0].place,1);assert.equal(s.finalResults.gameMode,'countdown');assert.equal(s.finalResults.legendaryEligible,false);const model=championship.model(s);assert.equal(model.winners[0].seat,2);
 await g.act(0,'reset');await g.edit(r=>{r.round=10;r.turn=2;r.phase='post';r.pending=null;r.owned={'0-1':{owner:0,level:0},'1-1':{owner:1,level:0},'2-1':{owner:2,level:0}};r.collapse.endangered=Object.keys(r.owned);});s=(await g.act(2,'end')).state;assert.equal(s.stage,'finished');assert.deepEqual(s.finalResults.standings.map(p=>p.place),[1,1,1]);assert.equal(championship.model(s).winners.length,3);
});
test('Tsunami doubles paid upgrade prices in building and wave phases; permits, resale and other modes retain their rules',async t=>{
 const g=await host(t),brown=deeds.filter(d=>d.color==='Brown'),d=brown[0];await g.act(0,'start');
 await g.edit(r=>{r.phase='post';r.pending=null;r.owned=Object.fromEntries(brown.map(d=>[d.id,{owner:0,level:0}]));r.players[0].cash=d.upgradeCost*2-1;});
 let before=(await g.resume()).state;assert.equal(before.upgradeCostMultiplier,2);assert.equal((await g.act(0,'upgrade',{id:d.id})).status,400);let s=(await g.resume()).state;assert.equal(s.players[0].cash,before.players[0].cash);assert.equal(s.owned[d.id].level,0);
 await g.edit(r=>{r.players[0].cash=d.upgradeCost*5;});s=(await g.act(0,'upgrade',{id:d.id})).state;assert.equal(s.players[0].cash,d.upgradeCost*3);assert.equal(s.owned[d.id].level,1);
 s=(await g.act(0,'sell-upgrade',{id:d.id})).state;assert.equal(s.players[0].cash,d.upgradeCost*3+Math.floor(d.upgradeCost/2));
 const cash=s.players[0].cash;s=(await g.act(0,'use-perk',{perk:'building',id:d.id})).state;assert.equal(s.players[0].cash,cash);assert.equal(s.owned[d.id].level,1);
 await g.edit(r=>{r.round=11;r.collapse.wave=1;});s=(await g.act(0,'upgrade',{id:d.id})).state;assert.equal(s.players[0].cash,cash-d.upgradeCost*2);assert.equal(s.owned[d.id].level,2);
 const classic=await host(t,{mode:'classic'});await classic.act(0,'start');await classic.edit(r=>{r.phase='post';r.pending=null;r.owned=Object.fromEntries(brown.map(d=>[d.id,{owner:0,level:0}]));});const old=(await classic.resume()).state;s=(await classic.act(0,'upgrade',{id:d.id})).state;assert.equal(s.upgradeCostMultiplier,1);assert.equal(s.players[0].cash,old.players[0].cash-d.upgradeCost);
});
test('developer tools are host-only, validate before mutation, keep dice private and persist forced results',async t=>{
 const g=await host(t,{mode:'classic'}),guest=await g.act(1,'developer',{developer:{action:'settings',round:1,die:6,repeat:false}});assert.equal(guest.status,403);
 for(const developer of [{action:'settings',round:0},{action:'settings',round:201},{action:'settings',die:13},{action:'settings',die:'6'},{action:'settings',repeat:'yes'},{action:'settings',cash:100000}])assert.equal((await g.act(0,'developer',{developer})).status,400);
 let s=(await g.resume()).state;assert.equal(s.developerTest,false);assert.equal(s.developer,null);
 s=(await g.act(0,'developer',{developer:{action:'settings',round:4,die:6,repeat:false}})).state;assert.equal(s.developer.die,6);assert.equal(s.ranked,false);assert.equal(Object.hasOwn((await g.resume(1)).state,'developer'),false);
 s=(await g.act(0,'start')).state;assert.equal(s.round,4);assert.equal(s.developerTest,true);
 s=(await g.act(0,'roll')).state;assert.equal(s.lastRoll.value,6);assert.equal(s.developer.die,null);
 await g.edit(r=>{r.phase='roll';r.pending=null;r.obligation=null;r.players[0].penalty=0;});await g.act(0,'developer',{developer:{action:'settings',round:4,die:3,repeat:true}});await g.edit(()=>{});
 for(let n=0;n<2;n++){await g.edit(r=>{r.phase='roll';r.pending=null;r.obligation=null;r.post=null;});s=(await g.act(0,'roll')).state;assert.equal(s.lastRoll.value,3);assert.equal(s.developer.die,3);}
 s=(await g.act(0,'developer',{developer:{action:'settings',round:4,die:null,repeat:false}})).state;assert.equal(s.developer.die,null);assert.equal(s.developerTest,true);
});
test('fresh developer starts and jumps apply real Tsunami and moving-portal waves without simulating GO rewards',async t=>{
 const g=await host(t);let s=(await g.act(0,'developer',{developer:{action:'start',round:10}})).state;assert.equal(s.round,10);assert.equal(s.collapse.wave,0);assert.equal(Object.keys(s.owned).length,6);assert(s.players.every(p=>p.perks.filter(x=>x==='building').length===2));
 s=(await g.act(0,'developer',{developer:{action:'jump',round:12}})).state;assert.equal(s.round,12);assert.equal(s.collapse.wave,2);assert.equal(Object.keys(s.collapse.lost).length,3);assert.equal(Object.keys(s.owned).length,3);assert(s.players.every(p=>p.cash===1500));
 const before=JSON.stringify([s.owned,s.collapse]);assert.equal((await g.act(0,'developer',{developer:{action:'jump',round:11}})).status,400);s=(await g.resume()).state;assert.equal(JSON.stringify([s.owned,s.collapse]),before);
 const e=await host(t,{mode:'express'});s=(await e.act(0,'developer',{developer:{action:'start',round:13}})).state;assert.equal(s.collapse.wave,3);for(let world=0;world<3;world++)assert.equal(Object.keys(s.collapse.lost).filter(id=>id.startsWith(world+'-')).length,3);
});
test('developer jumps cannot erase liabilities, test finishes do not enter records, and ranked rematches clear overrides',async t=>{
 const g=await host(t,{mode:'classic'});await g.act(0,'start');await g.edit(r=>{r.phase='rent';r.pending={kind:'rent',amount:100,playerId:r.players[0].id};r.obligation={amount:100};});assert.equal((await g.act(0,'developer',{developer:{action:'jump',round:5}})).status,400);let s=(await g.resume()).state;assert.equal(s.pending.amount,100);assert.equal(s.developerTest,false);
 s=(await g.act(0,'developer',{developer:{action:'start',round:11,die:12,repeat:true}})).state;assert.equal(s.stage,'finished');assert.equal(s.finalResults.legendaryEligible,false);assert.equal(s.finalResults.developerTest,true);assert.equal(s.legendary[10].length,0);
 const library=await g.api('central',{seats:[{code:s.code,token:g.seats[0].token}]});assert(!library.records.some(r=>r.matchId===s.matchId));
 s=(await g.act(0,'new-ranked-match')).state;assert.equal(s.stage,'playing');assert.equal(s.round,1);assert.equal(s.developer,null);assert.equal(s.developerTest,false);assert.equal(s.ranked,true);
});
test('jumping from a partial round advances only its remaining turns and starts the next round at the first survivor',async t=>{
 const g=await host(t,{mode:'classic'});await g.act(0,'start');await g.edit(r=>{r.turn=1;r.turnNumber=1;r.phase='post';r.pending=null;});
 const s=(await g.act(0,'developer',{developer:{action:'jump',round:3}})).state;assert.equal(s.round,3);assert.equal(s.turn,0);assert.equal(s.turnNumber,6);
});
