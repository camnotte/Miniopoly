'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto'),bot=require('../lib/cleanup-bot'),rules=require('../public/cleanup-rules'),{deeds}=require('../game-data.json');
function room(){return {code:'BOT',matchId:'m',stage:'playing',phase:'roll',gameMode:'classic',round:5,rounds:0,turn:0,players:[{id:'a',name:'A',cash:1000,perks:[]},{id:'b',name:'B',cash:1000,perks:[]}],owned:{'0-6':{owner:0,level:0},'1-6':{owner:1,level:0},'2-6':{owner:0,level:0}},log:[],festivalFund:200};}
test('bot starts every five rounds in Standard, makes full laps in order, and never overlaps a tour',t=>{
 t.mock.method(crypto,'randomInt',()=>0);const r=room();bot.round(r);assert(r.cleanup.active);const sequence=r.cleanup.sequence;bot.round(r);assert.equal(r.cleanup.sequence,sequence);for(let i=0;i<9;i++)bot.tick(r);assert(!r.cleanup.active);assert.equal(r.cleanup.board,2);assert.equal(r.cleanup.pos,0);assert.equal(r.cleanup.inspections.length,3);assert.deepEqual(r.cleanup.inspections.map(i=>i.deed),['0-6','1-6','2-6']);bot.round(r);assert.equal(r.cleanup.sequence,sequence);r.round=10;bot.round(r);assert.equal(r.cleanup.sequence,sequence+1);assert.equal(r.cleanup.board,0);
 for(const mode of ['countdown','express']){const other=room();other.gameMode=mode;bot.round(other);bot.tick(other);assert.equal(other.cleanup,undefined);assert.equal(bot.publicState(other),null);}
});
test('service requires the owner and a current inspection, charges once outside the Festival and protects bill cash',t=>{
 t.mock.method(crypto,'randomInt',()=>0);const r=room();bot.round(r);bot.tick(r);const id=r.cleanup.inspections[0].id;assert.throws(()=>bot.act(r,r.players[1],id,'maintain'),/owner/);assert.throws(()=>bot.act(r,r.players[0],id,'wrong'));r.obligation={amount:990};assert.throws(()=>bot.act(r,r.players[0],id,'maintain'),/current bill/);r.obligation=null;bot.act(r,r.players[0],id,'maintain');assert.equal(r.players[0].cash,970);assert.equal(r.festivalFund,200);assert.throws(()=>bot.act(r,r.players[0],id,'maintain'));assert.equal(r.players[0].cash,970);
});
test('closure lasts a full round, renovation lasts two full rounds, and missed deadlines close without charging',t=>{
 t.mock.method(crypto,'randomInt',()=>0);for(const choice of ['close','renovate','timeout']){const r=room();bot.round(r);bot.tick(r);const i=r.cleanup.inspections[0];if(choice==='timeout'){r.round=6;bot.round(r);assert.equal(i.status,'auto-closed');assert.equal(r.players[0].cash,1000);assert(rules.closed(r,'0-6'));r.round=7;assert(!rules.closed(r,'0-6'));}else{bot.act(r,r.players[0],i.id,choice);r.round=6;if(choice==='close'){assert(rules.closed(r,'0-6'));r.round=7;assert(!rules.closed(r,'0-6'));}else{assert.equal(r.players[0].cash,940);assert.equal(rules.bonus(r,'0-6'),1.25);r.round=7;assert.equal(rules.bonus(r,'0-6'),1.25);r.round=8;assert.equal(rules.bonus(r,'0-6'),1);}}}
});
test('sold/traded or mortgaged properties expire inspections instead of billing another player',t=>{
 t.mock.method(crypto,'randomInt',()=>0);for(const mutate of [r=>delete r.owned['0-6'],r=>r.owned['0-6'].owner=1,r=>r.owned['0-6'].mortgage=true]){const r=room();bot.round(r);bot.tick(r);const id=r.cleanup.inspections[0].id;mutate(r);assert.throws(()=>bot.act(r,r.players[0],id,'maintain'));assert.equal(bot.publicState(r).inspections[0].status,'expired');r.round=6;bot.round(r);assert(!r.cleanup.effects['0-6']);assert.equal(r.players[0].cash,1000);}
});
test('real host keeps inspections across restart, owner can act off-turn, and renovation rent pays 90/10',async t=>{
 const g=await require('./helpers/deals-host.cjs')();t.after(()=>g.close());await g.edit(r=>{r.round=5;r.rounds=0;r.phase='roll';r.pending=null;r.owned={'0-6':{owner:0,level:0}};bot.round(r);r.cleanup.inspections.push({id:'inspection',matchId:r.matchId,deed:'0-6',owner:0,fee:30,round:5,dueRound:6,status:'pending'});r.turn=1;r.players[1].board=0;r.players[1].pos=5;});
 assert.equal((await g.act(1,'cleanup-service',{id:'inspection',choice:'renovate'})).status,400);let x=await g.act(0,'cleanup-service',{id:'inspection',choice:'renovate'});assert.equal(x.status,200);assert.equal(x.state.players[0].cash,1440);assert.equal(x.state.festivalFund,0);assert.equal((await g.act(0,'cleanup-service',{id:'inspection',choice:'renovate'})).status,400);await g.edit(()=>{});assert.equal((await g.resume()).state.cleanup.effects['0-6'].bonusUntil,8);x=await g.act(1,'roll');assert.equal(x.state.pending.baseRent,4);assert.equal(x.state.pending.serviceBonus,1);assert.equal(x.state.pending.amount,5);x=await g.act(1,'pay');assert.equal(x.state.players[0].cash,1444);assert.equal(x.state.festivalFund,1);
});
test('a closed property collects no rent, reopens on schedule, and the bot starts through real round progression',async t=>{
 const g=await require('./helpers/deals-host.cjs')();t.after(()=>g.close());await g.edit(r=>{r.round=4;r.rounds=0;r.turn=2;r.phase='post';r.pending=null;r.obligation=null;r.owned={'0-6':{owner:0,level:0}};});let x=await g.act(2,'end');assert.equal(x.state.round,5);assert(x.state.cleanup.active);assert.equal(x.state.cleanup.pos,0);await g.edit(r=>{r.cleanup.effects['0-6']={closedUntil:7,bonusUntil:0};r.turn=1;r.phase='roll';r.players[1].board=0;r.players[1].pos=5;});x=await g.act(1,'roll');assert.equal(x.state.phase,'post');assert.match(x.state.post.title,/Closed/);assert.equal(x.state.players[1].cash,1500);
});

test('service rent changes invalidate property offers while unchanged/legacy snapshots remain compatible',()=>{const trading=require('../lib/trading'),r=room();bot.round(r);const original=trading.snapshot(r,'0-6');r.cleanup.effects['0-6']={closedUntil:0,bonusUntil:0};assert.equal(trading.snapshot(r,'0-6'),original);r.cleanup.effects['0-6']={closedUntil:7,bonusUntil:0};assert.notEqual(trading.snapshot(r,'0-6'),original);r.round=7;assert.equal(trading.snapshot(r,'0-6'),original);});

test('inspection stops include properties immediately after GO and never skip a lap',t=>{t.mock.method(crypto,'randomInt',()=>0);const r=room();r.owned={'0-1':{owner:0,level:0},'0-3':{owner:1,level:0}};bot.round(r);assert.deepEqual(r.cleanup.stops,[1,3,0]);bot.tick(r);assert.equal(r.cleanup.pos,1);bot.tick(r);assert.equal(r.cleanup.pos,3);bot.tick(r);assert.equal(r.cleanup.board,1);assert.equal(r.cleanup.lastMove.path.at(-1),0);assert.deepEqual(r.cleanup.inspections.map(i=>i.deed),['0-1','0-3']);});

test('bot announcements are shared, bounded, and distinguish inspection from paid work',t=>{
 t.mock.method(crypto,'randomInt',()=>0);const r=room();bot.round(r);bot.tick(r);
 assert.equal(r.cleanup.broadcasts[0].kind,'start');
 assert.equal(r.cleanup.broadcasts.at(-1).kind,'inspection');assert.match(r.cleanup.broadcasts.at(-1).text,/awaiting|Awaiting/);
 const i=r.cleanup.inspections[0];bot.act(r,r.players[i.owner],i.id,'maintain');
 assert.equal(r.cleanup.broadcasts.at(-1).kind,'maintained');
 assert.deepEqual(bot.publicState(r).broadcasts,r.cleanup.broadcasts);
 for(let n=0;n<10;n++)bot.tick(r);assert.ok(r.cleanup.broadcasts.length<=12);assert.ok(r.cleanup.broadcasts.every(m=>m.id&&Number.isFinite(m.at)&&m.board>=0&&m.board<=2));
});
test('priority announcements name the buyer and actual destination for all viewers',()=>{
 const r=room();bot.stamp(r);const d=deeds.find(d=>d.id==='0-6'),q=rules.quote(r,d);
 bot.houseCall(r,r.players[0],d.id,'book',q.key);
 const messages=bot.publicState(r).broadcasts;
 assert.deepEqual(messages.map(m=>m.kind),['housecall','complete']);
 assert.match(messages[0].text,/A requested priority/);assert.ok(messages.every(m=>m.text.includes(d.name)&&m.pos===d.pos&&m.board===d.board));
 assert.equal(r.cleanup.houseCall.status,'completed');
});
