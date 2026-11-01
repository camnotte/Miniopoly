'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const deals=require('../lib/player-deals');
function room(){return {stage:'playing',phase:'post',gameMode:'classic',matchId:'m',round:1,turnNumber:0,turn:0,players:[{id:'a',name:'A',board:0,pos:1,cash:20,perks:['swap']},{id:'b',name:'B',board:1,pos:3,cash:1500,perks:[]},{id:'c',name:'C',board:2,pos:5,cash:1500,perks:[]}],owned:{},pending:null,obligation:null};}
const propose=(r,seat,input)=>deals.act(r,r.players[seat],'deal-propose',null,input);
const respond=(r,seat,kind,id=r.playerDeals.at(-1).id)=>deals.act(r,r.players[seat],kind,id);
function rent(){const r=room();r.phase='rent';r.obligation={amount:120,creditor:1,description:'Rent'};r.pending={kind:'rent',amount:120,playerId:'a'};return r;}
test('position swaps require consent and use exactly one sender token, without landing or GO rewards',()=>{
 const r=room(),cash=r.players.map(p=>p.cash);propose(r,0,{type:'swap',to:'b'});const id=r.playerDeals[0].id;
 assert.deepEqual(r.players[0].perks,['swap']);assert.deepEqual([r.players[0].board,r.players[0].pos],[0,1]);assert.equal(deals.list(r,r.players[2]).length,0);
 assert.throws(()=>respond(r,2,'deal-accept',id),/recipient/);assert.throws(()=>respond(r,0,'deal-accept',id),/recipient/);
 respond(r,1,'deal-accept',id);assert.deepEqual(r.players.map(p=>[p.board,p.pos]),[[1,3],[0,1],[2,5]]);assert.deepEqual(r.players[0].perks,[]);assert.deepEqual(r.players.map(p=>p.cash),cash);assert.equal(r.phase,'post');assert.equal(r.pending,null);assert.equal(r.playerDeals[0].status,'accepted');assert.throws(()=>respond(r,1,'deal-accept',id));
});
test('declines, withdrawals and expired swaps never consume a token; position/turn changes invalidate acceptance',()=>{
 for(const kind of ['deal-reject','deal-cancel']){const r=room();propose(r,0,{type:'swap',to:'b'});respond(r,kind==='deal-reject'?1:0,kind);assert.deepEqual(r.players[0].perks,['swap']);}
 for(const mutate of [r=>r.players[1].pos++,r=>r.turnNumber++,r=>r.lastRoll={at:1},r=>r.players[1].penalty=1,r=>r.players[1].out=true,r=>r.matchId='next',r=>r.phase='rent']){const r=room();propose(r,0,{type:'swap',to:'b'});mutate(r);assert.equal(deals.list(r,r.players[0])[0].status,'expired');assert.throws(()=>respond(r,1,'deal-accept'));assert.deepEqual(r.players[0].perks,['swap']);}
});
test('swaps cannot bypass Setback, an unpaid bill, an active void, missing tokens or another player’s turn',()=>{
 for(const mutate of [r=>r.players[0].perks=[],r=>r.turn=1,r=>r.players[0].penalty=1,r=>r.pending={kind:'card'},r=>r.obligation={amount:10},r=>{r.gameMode='express';r.collapse={lost:{'1-3':1}};}]){const r=room();mutate(r);assert.throws(()=>propose(r,0,{type:'swap',to:'b'}));assert.equal(r.playerDeals,undefined);}
 const r=room();assert.throws(()=>propose(r,0,{type:'swap',to:'a'}));assert.throws(()=>propose(r,0,{type:'swap',to:'missing'}));r.players[1].board=0;r.players[1].pos=1;assert.throws(()=>propose(r,0,{type:'swap',to:'b'}),/different location/);
});
test('rent offers and counters preserve the debt until accepted; acceptance changes the bill without taking cash',()=>{
 const r=rent(),cash=r.players.map(p=>p.cash);propose(r,0,{type:'rent',amount:10});const first=r.playerDeals[0];assert.equal(r.obligation.amount,120);assert.equal(r.pending.amount,120);assert.equal(deals.list(r,r.players[2]).length,0);
 propose(r,1,{type:'rent',amount:30,replaces:first.id,to:'a'});assert.equal(first.status,'countered');assert.throws(()=>respond(r,1,'deal-accept',first.id));
 respond(r,0,'deal-accept');assert.equal(r.obligation.amount,30);assert.equal(r.pending.amount,30);assert.equal(r.phase,'rent');assert.deepEqual(r.players.map(p=>p.cash),cash);assert.throws(()=>respond(r,0,'deal-accept'));
});
test('rent negotiations reject unauthorized users, bank fees and invalid/increased amounts without mutation',()=>{
 for(const input of [null,[],{type:'rent',amount:-1},{type:'rent',amount:121},{type:'rent',amount:1.5},{type:'rent',amount:'10'},{type:'rent',amount:NaN},{type:'rent',amount:1,to:'c'},{type:'rent',amount:1,extra:true}]){const r=rent(),before=structuredClone(r);assert.throws(()=>propose(r,0,input));assert.deepEqual(r,before);}
 for(const seat of [1,2]){const r=rent();assert.throws(()=>propose(r,seat,{type:'rent',amount:20}));}
 const r=rent();r.obligation.creditor=null;assert.throws(()=>propose(r,0,{type:'rent',amount:10}));
});
test('rent rejection leaves full rent due; payment, reset and bankruptcy expire outstanding requests',()=>{
 const r=rent();propose(r,0,{type:'rent',amount:20});respond(r,1,'deal-reject');assert.equal(r.obligation.amount,120);
 for(const mutate of [r=>r.phase='post',r=>r.players[0].out=true,r=>r.matchId='next',r=>r.obligation.amount=100]){const r=rent();propose(r,0,{type:'rent',amount:20});mutate(r);assert.equal(deals.list(r,r.players[1])[0].status,'expired');assert.throws(()=>respond(r,1,'deal-accept'));}
});
test('zero rent can be agreed and old offers cannot be replayed against a new debt',()=>{
 const r=rent();propose(r,0,{type:'rent',amount:0});const id=r.playerDeals[0].id;respond(r,1,'deal-accept');assert.equal(r.pending.amount,0);r.obligation={amount:120,creditor:1,description:'Rent'};propose(r,0,{type:'rent',amount:10});assert.throws(()=>respond(r,1,'deal-accept',id));assert.equal(deals.list(r,r.players[1]).at(-1).amount,10);
});
test('authenticated multiplayer negotiation survives restart, settles 90/10 once and remains private',async t=>{
 const g=await require('./helpers/deals-host.cjs')();t.after(()=>g.close());
 await g.edit(r=>{r.turn=1;r.phase='rent';r.pending={kind:'rent',amount:120,playerId:r.players[1].id};r.obligation={amount:120,creditor:0,description:'Rent at Copper Lane'};r.players[1].cash=40;r.festivalFund=0;});
 let response=await g.act(1,'deal-propose',{deal:{type:'rent',amount:20}});assert.equal(response.status,200);let offer=response.state.trades.at(-1);assert.equal((await g.resume(2)).state.trades.length,0);assert.equal((await g.act(2,'deal-accept',{id:offer.id})).status,400);
 await g.edit(()=>{});assert.equal((await g.resume()).state.trades.at(-1).status,'pending');response=await g.act(0,'deal-propose',{deal:{type:'rent',amount:30,replaces:offer.id}});assert.equal(response.status,200);offer=response.state.trades.at(-1);assert.equal((await g.act(1,'deal-accept',{id:offer.id})).status,200);assert.equal((await g.resume(1)).state.pending.amount,30);
 assert.equal((await g.act(1,'deal-accept',{id:offer.id})).status,400);assert.equal((await g.act(0,'pay')).status,403);response=await g.act(1,'pay');assert.equal(response.status,200);assert.equal(response.state.players[1].cash,10);assert.equal(response.state.players[0].cash,1527);assert.equal(response.state.festivalFund,3);assert.equal((await g.act(1,'pay')).status,400);
 await g.edit(r=>{r.turn=1;r.phase='rent';r.pending={kind:'rent',amount:20,playerId:r.players[1].id};r.obligation={amount:20,creditor:0,description:'Rent'};});response=await g.act(1,'deal-propose',{deal:{type:'rent',amount:0}});await g.act(0,'deal-accept',{id:response.state.trades.at(-1).id});response=await g.act(1,'pay');assert.equal(response.status,200);assert.equal(response.state.festivalFund,3);assert.equal(response.state.players[1].cash,10);
});
test('multiplayer swaps are authenticated, persisted and consumed once; the next real roll starts at the swapped location',async t=>{
 const g=await require('./helpers/deals-host.cjs')();t.after(()=>g.close());await g.edit(r=>{r.phase='roll';r.turn=0;r.pending=null;r.obligation=null;r.players[0].perks=['swap'];r.players[0].pos=0;r.players[0].board=0;r.players[1].pos=1;r.players[1].board=1;});
 const b=(await g.resume(1)).state.youId;let x=await g.act(0,'deal-propose',{deal:{type:'swap',to:b}});assert.equal(x.status,200);const id=x.state.trades.at(-1).id;await g.edit(()=>{});x=await g.act(1,'deal-accept',{id});assert.equal(x.status,200);assert.equal(x.state.players[0].board,1);assert.equal(x.state.players[0].pos,1);assert.equal(x.state.players[1].board,0);assert.equal(x.state.players[1].pos,0);assert.deepEqual(x.state.players[0].perks,[]);assert.equal(x.state.phase,'roll');assert.equal((await g.act(1,'deal-accept',{id})).status,400);x=await g.act(0,'roll');assert.equal(x.status,200);assert.equal(x.state.lastRoll.previousPosition,1);assert.equal(x.state.lastRoll.previousBoard,1);assert.equal(x.state.players[0].pos,2);
});
