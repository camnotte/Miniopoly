'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),net=require('node:net'),{spawn}=require('node:child_process');
const storm=require('../lib/countdown-mode'),{deeds}=require('../game-data.json'),tsunami=require('../public/tsunami'),view=require('../public/express-view');
function room(){return {gameMode:'countdown',stage:'playing',phase:'roll',round:1,rounds:10,turn:0,turnNumber:0,players:[{id:'a',name:'Cam',cash:1500,perks:[],waveShields:2},{id:'b',name:'Mac',cash:1500,perks:[],waveShields:2}],owned:Object.fromEntries(deeds.map((d,i)=>[d.id,{owner:i%2,level:0}])),collapse:storm.initialize(),foreclosures:[],log:[]};}
function flood(r,ids=['0-1']){const s=r.collapse;s.direction='north';s.wave=1;s.lastConsumed=ids;s.lost=Object.fromEntries(ids.map(id=>[id,1]));s.sites=Object.fromEntries(ids.map(id=>[id,{destroyedWave:1,previousOwner:0}]));for(const id of ids)delete r.owned[id];s.auction={id:'auction',wave:1,lots:ids,deadline:Date.now()+90000,bids:{}};r.phase='tsunami-auction';}
test('sirens begin at the start of the penultimate building round; direction is persisted for all waves',()=>{
 for(const rounds of [10,15,20]){const r=room();r.rounds=rounds;for(let n=1;n<rounds-1;n++){r.round=n;storm.startRound(r);assert.equal(r.collapse.direction,null);assert.equal(r.collapse.wave,0);}r.round=rounds-1;storm.startRound(r);const direction=r.collapse.direction;assert(['north','south','east','west'].includes(direction));assert.equal(r.collapse.wave,0);assert.equal(r.collapse.warningRound,rounds-1);assert.equal(r.collapse.lastTargets,undefined);r.round=rounds;storm.startRound(r);assert.equal(r.collapse.wave,0);assert.equal(r.collapse.direction,direction);r.round++;storm.startRound(r);assert.equal(r.collapse.wave,1);assert.equal(r.collapse.direction,direction);assert.equal(r.collapse.lastTargets.length,3);}
});
test('north/south only threaten top and bottom deeds, east/west only side deeds; specials are never eligible',()=>{
 const r=room();for(const direction of ['north','south','east','west']){r.collapse.direction=direction;const ids=storm.pool(r).map(d=>d.id);assert(ids.length>3);assert(ids.every(id=>['north','south'].includes(direction)?[1,2,3,9,10,11].includes(Number(id.split('-')[1])):[5,6,7,13,14,15].includes(Number(id.split('-')[1]))));for(let board=0;board<3;board++)for(const p of [0,4,8,12])assert.equal(storm.exposed(r,board+'-'+p),false);}
});
test('every wave draws at most three unique global targets at impact, repeats standing properties, and keeps zero-deed players active',()=>{
 const r=room();r.collapse.direction='north';r.owned={'0-1':{owner:0,level:4},'0-3':{owner:0,level:1},'0-9':{owner:1,level:1},'0-5':{owner:1,level:0}};
 r.round=11;storm.startRound(r);assert.equal(r.collapse.lastTargets.length,3);assert.equal(new Set(r.collapse.lastTargets).size,3);assert.equal(r.collapse.lastProtected.length,3);assert.equal(r.owned['0-1'].level,3);assert.equal(r.collapse.lastConsumed.length,0);
 r.round=12;storm.startRound(r);assert.equal(r.collapse.lastConsumed.length,3);assert.equal(r.players[0].out,undefined);assert.equal(storm.active(r,0).length,0);assert.equal(r.owned['0-5'].owner,1);assert(r.collapse.auction);
 storm.resolveAuction(r,{force:true});r.round=13;storm.startRound(r);assert.equal(r.collapse.lastTargets.length,0);assert(r.players.every(p=>!p.out));
});
test('Wave Shield expires after one wave, preserves the built-in shield, enforces turn, exposure, inventory and one-use-per-wave',()=>{
 const r=room();r.collapse.direction='north';r.round=9;r.owned={'0-1':{owner:0,level:3},'0-3':{owner:0,level:0},'0-5':{owner:0,level:0}};
 assert.throws(()=>storm.shield(r,r.players[1],'0-1'));assert.throws(()=>storm.shield(r,r.players[0],'0-5'));storm.shield(r,r.players[0],'0-1');assert.equal(r.players[0].waveShields,1);assert(tsunami.hasProtection(r,'0-1'));assert.throws(()=>storm.shield(r,r.players[0],'0-3'));
 r.round=11;storm.startRound(r);assert.equal(r.owned['0-1'].level,3);assert.equal(r.collapse.shieldSpent['0-1'],undefined);assert.deepEqual(r.collapse.temporary,{});storm.resolveAuction(r,{force:true});storm.shield(r,r.players[0],'0-1');r.round=12;storm.startRound(r);assert.equal(r.owned['0-1'].level,3);assert.equal(r.players[0].waveShields,0);assert.throws(()=>storm.shield(r,r.players[0],'0-1'));
});
test('a shield expires even if its sheltered-by-chance property is not struck',()=>{
 const r=room();r.collapse.direction='north';r.round=9;r.owned={'0-1':{owner:0,level:0}};storm.shield(r,r.players[0],'0-1');delete r.owned['0-1'];r.round=11;storm.startRound(r);assert.deepEqual(r.collapse.temporary,{});assert.equal(r.players[0].waveShields,1);
});
test('sealed auctions reserve total affordability, hide other bids, pay winners once and leave losers unchanged',()=>{
 const r=room();flood(r,['0-1','0-3']);const before=structuredClone(r);for(const bids of [{'0-1':1501},{'0-1':1000,'0-3':600},{'0-1':-1},{'0-1':1.5},{'not-a-deed':1}]){assert.throws(()=>storm.bid(r,r.players[0],'auction',bids));assert.deepEqual(r,before);}
 assert.throws(()=>storm.bid(r,r.players[0],'stale',{}));storm.bid(r,r.players[0],'auction',{'0-1':120,'0-3':50});const guest=storm.publicState(r,r.players[1]);assert.equal(guest.auction.yourBids,null);assert.equal(guest.auction.bids,undefined);assert.deepEqual(guest.auction.submitted,[0]);assert(!JSON.stringify(guest).includes('120'));assert.deepEqual(storm.publicState(r,r.players[0]).auction.yourBids,{'0-1':120,'0-3':50});assert.throws(()=>storm.bid(r,r.players[0],'auction',{}));
 storm.bid(r,r.players[1],'auction',{'0-1':100,'0-3':90});assert.equal(r.owned['0-1'].owner,0);assert.equal(r.owned['0-3'].owner,1);assert.equal(r.players[0].cash,1380);assert.equal(r.players[1].cash,1410);assert.equal(r.phase,'roll');assert(r.collapse.lost['0-1']);assert.equal(r.collapse.auction,null);assert.equal(storm.resolveAuction(r),false);assert.equal(r.players[0].cash,1380);
});
test('ties select one highest bidder, pass does not award a free site, timeout is persisted and missing bids pass',()=>{
 const r=room();flood(r,['0-1','0-3']);storm.bid(r,r.players[0],'auction',{'0-1':100});storm.bid(r,r.players[1],'auction',{'0-1':100});const result=r.collapse.lastAuction.results[0];assert(result.tied);assert.equal(r.owned['0-1'].owner,result.winner);assert.equal(r.owned['0-3'],undefined);assert.equal(r.players.reduce((n,p)=>n+p.cash,0),2900);
 const q=room();flood(q);storm.bid(q,q.players[0],'auction',{'0-1':50});const restored=JSON.parse(JSON.stringify(q));assert.equal(storm.resolveAuction(restored,{now:restored.collapse.auction.deadline-1}),false);assert(storm.resolveAuction(restored,{now:restored.collapse.auction.deadline}));assert.equal(restored.owned['0-1'].owner,0);assert.equal(restored.players[1].cash,1500);
});
test('rebuilding requires auction ownership, own turn and cash; restores base value/rent but not spent protection',()=>{
 const r=room();flood(r);r.collapse.shieldSpent['0-1']=true;storm.bid(r,r.players[0],'auction',{'0-1':70});storm.bid(r,r.players[1],'auction',{});const before=structuredClone(r);assert.throws(()=>storm.rebuild(r,r.players[1],'0-1'));assert.deepEqual(r,before);r.players[0].cash=49;assert.throws(()=>storm.rebuild(r,r.players[0],'0-1'));r.players[0].cash=100;storm.rebuild(r,r.players[0],'0-1');assert.equal(r.players[0].cash,50);assert.equal(r.collapse.lost['0-1'],undefined);assert.equal(r.owned['0-1'].lost,undefined);assert.equal(r.owned['0-1'].level,0);assert.equal(r.collapse.shieldSpent['0-1'],true);assert.throws(()=>storm.rebuild(r,r.players[0],'0-1'));
});
test('five waves end in one calm recovery round; final net worth ranks survivors and supports shared wins',()=>{
 const r=room();r.collapse.direction='north';r.owned={};for(let wave=1;wave<=5;wave++){r.round=10+wave;storm.startRound(r);assert.equal(r.collapse.wave,wave);assert.equal(r.collapse.complete,false);assert.equal(r.collapse.calm,wave===5);}r.round=16;storm.startRound(r);assert.equal(r.collapse.wave,5);assert(r.collapse.complete);
 const rows=[{seat:0,bankrupt:false,worth:1800},{seat:1,bankrupt:false,worth:2100},{seat:2,bankrupt:true,worth:3000},{seat:3,bankrupt:false,worth:2100}];storm.rank(rows,r);assert.deepEqual(rows.map(p=>p.seat),[1,3,0,2]);assert.deepEqual(rows.map(p=>p.place),[1,1,3,4]);
});
test('presentation describes exposed edges, temporary cards and new scoring while legacy saves retain their old rules',()=>{
 const r=room();r.collapse.direction='north';storm.mark(r);assert.match(view.stage(r).title,/NORTH/);assert.match(view.stage(r).hint,/net.worth/);assert.equal(tsunami.tileStatus(r,'0-1').label,'EXPOSED');storm.shield(r,r.players[0],'0-1');assert.equal(tsunami.tileStatus(r,'0-1').label,'1 WAVE SHIELD');delete r.collapse.rule;r.collapse.endangered=[];r.round=10;storm.startRound(r);assert.equal(r.collapse.endangered.length,1);
});
async function host(t,{cards}={}){
 const root=path.join(__dirname,'..'),dir=fs.mkdtempSync(path.join(os.tmpdir(),'directional-tsunami-'));let child,base;
 async function start(){const port=await new Promise(resolve=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p));});});base='http://127.0.0.1:'+port;child=spawn(process.execPath,['server.js'],{cwd:root,env:{...process.env,HOST:'127.0.0.1',PORT:String(port),DATA_DIR:dir,NODE_ENV:'test',...(cards?{TEST_CARD_SEQUENCE:cards}:{})},stdio:'ignore'});for(let i=0;i<200;i++){try{if((await fetch(base+'/api/network')).ok)return;}catch{}await new Promise(r=>setTimeout(r,25));}throw Error('Host did not start');}
 async function stop(){if(child?.exitCode===null&&!child.signalCode){child.kill();await new Promise(r=>child.once('exit',r));}}
 t.after(async()=>{await stop();fs.rmSync(dir,{recursive:true,force:true});});await start();
 const api=async(route,body)=>{const r=await fetch(base+'/api/'+route,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});return {status:r.status,...await r.json()};};
 const a=await api('create',{name:'Cam',capacity:2,gameMode:'countdown',rounds:10}),b=await api('join',{code:a.code,name:'Mac'}),seats=[a,b];
 const act=(seat,kind,extra={})=>api('action',{code:a.code,token:seats[seat].token,kind,...extra}),resume=(seat=0)=>api('resume',{code:a.code,token:seats[seat].token});
 async function edit(fn){await stop();const file=path.join(dir,'rooms.json'),data=JSON.parse(fs.readFileSync(file));fn(data.rooms.find(r=>r.code===a.code));fs.writeFileSync(file,JSON.stringify(data));await start();}
 return {api,act,resume,edit,seats,get base(){return base;}};
}
test('real multiplayer secret bidding persists across restart, blocks normal spending, and rebuild restores worth without double charging',async t=>{
 const g=await host(t);await g.act(0,'start');await g.edit(r=>{r.round=11;r.collapse.direction='north';flood(r);});let s=(await g.resume()).state,a=s.collapse.auction.id;assert.equal(s.phase,'tsunami-auction');assert.equal((await g.act(0,'roll')).status,400);assert.equal((await g.act(1,'wave-shield',{id:'0-1'})).status,400);assert.equal((await g.act(0,'tsunami-bid',{auction:a,bids:{'0-1':130}})).status,200);
 await g.edit(()=>{});s=(await g.resume(1)).state;assert.equal(s.collapse.auction.yourBids,null);assert.equal(s.collapse.auction.bids,undefined);assert.equal((await g.resume()).state.collapse.auction.yourBids['0-1'],130);assert.equal((await g.act(0,'tsunami-bid',{auction:a,bids:{'0-1':140}})).status,400);
 s=(await g.act(1,'tsunami-bid',{auction:a,bids:{'0-1':90}})).state;assert.equal(s.owned['0-1'].owner,0);assert.equal(s.players[0].cash,1370);assert.equal(s.players[1].cash,1500);assert.equal(s.players[0].worth,1370+Object.entries(s.owned).filter(([id,o])=>o.owner===0&&!s.collapse.lost[id]).reduce((n,[id])=>n+deeds.find(d=>d.id===id).price,0));
 assert.equal((await g.act(1,'rebuild',{id:'0-1'})).status,400);s=(await g.act(0,'rebuild',{id:'0-1'})).state;assert.equal(s.players[0].cash,1320);assert.equal(s.collapse.lost['0-1'],undefined);assert.equal(s.owned['0-1'].level,0);assert.equal((await g.act(0,'rebuild',{id:'0-1'})).status,400);await g.edit(()=>{});assert.equal((await g.resume()).state.players[0].cash,1320);
});
test('real first wave waits two full preparation rounds; final recovery scores net worth and retains no-deed players',async t=>{
 const g=await host(t);let s=(await g.act(0,'developer',{developer:{action:'start',round:9}})).state;assert.equal(s.collapse.wave,0);assert(s.collapse.direction);s=(await g.act(0,'developer',{developer:{action:'jump',round:10}})).state;assert.equal(s.collapse.wave,0);
 await g.edit(r=>{r.collapse.direction='north';r.owned={'0-1':{owner:0,level:0},'0-3':{owner:1,level:0}};r.turn=1;r.phase='post';});s=(await g.act(1,'end')).state;assert.equal(s.collapse.wave,1);assert(s.players.every(p=>!p.out));assert.equal(s.phase,'tsunami-auction');for(let seat=0;seat<2;seat++)s=(await g.act(seat,'tsunami-bid',{auction:s.collapse.auction.id,bids:{}})).state;
 await g.edit(r=>{r.round=15;r.collapse.wave=5;r.collapse.calm=true;r.collapse.auction=null;r.turn=1;r.phase='post';r.owned={};r.players[0].cash=1900;r.players[1].cash=2100;});s=(await g.act(1,'end')).state;assert.equal(s.stage,'finished');assert.equal(s.finalResults.reason,'storm-complete');assert.equal(s.finalResults.standings[0].seat,1);assert.equal(s.finalResults.standings[0].worth,2100);assert.equal(s.finalResults.standings[0].place,1);assert.equal(s.finalResults.legendaryEligible,false);
});
test('both deck types award separate Wave Shield inventory capped at two, with a cash substitute when full',async t=>{
 const g=await host(t);await g.act(0,'start');const cards=(await fetch(g.base+'/api/cards').then(r=>r.json())).decks;
 for(const [pos,deck] of [[4,'chest'],[12,'weather']]){const index=cards.find(d=>d.id===deck).cards.findIndex(c=>c.perk==='wave-shield');assert(index>0);for(const held of [0,2]){ const h=await host(t,{cards:String(index)});await h.act(0,'start');await h.edit(r=>{r.players[0].pos=pos-1;r.players[0].waveShields=held;r.developer={enabled:true,die:1};});const s=(await h.act(0,'roll')).state;assert.equal(s.pending.title,'Wave Shield');assert.equal(s.players[0].waveShields,held===2?2:1);assert.equal(s.players[0].cash,held===2?1550:1500);assert.equal(s.players[0].perks.length,1);}}
});

test('an expired saved auction closes automatically on the server without a host action',async t=>{
 const g=await host(t);await g.act(0,'start');await g.edit(r=>{r.round=11;flood(r);r.collapse.auction.deadline=Date.now()-100;r.collapse.auction.bids={0:{'0-1':80}};});
 let s;for(let n=0;n<60;n++){s=(await g.resume()).state;if(!s.collapse.auction)break;await new Promise(resolve=>setTimeout(resolve,50));}
 assert.equal(s.collapse.auction,null);assert.equal(s.phase,'roll');assert.equal(s.players[0].cash,1420);assert.equal(s.players[1].cash,1500);assert.equal(s.owned['0-1'].owner,0);assert.equal(s.collapse.lastAuction.results[0].bids[1].amount,0);await g.edit(()=>{});assert.equal((await g.resume()).state.players[0].cash,1420);
});
