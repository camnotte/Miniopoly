'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {model}=require('../public/championship');
function room(worths=[2300,1800],extra={}){
 const players=worths.map((worth,seat)=>({id:'p'+seat,seat,name:'Player '+seat,avatar:'woman-2',piece:seat?'🐶':'🛵',avatarImage:seat===0?'private-portrait':null}));
 return {code:'ABC234',name:'Friday game',stage:'finished',youId:'p0',players,owned:{'0-1':{owner:0,level:2},'1-3':{owner:0,level:1}},finalResults:{matchId:'match',rounds:10,at:'2026-10-23T12:00:00Z',legendaryMode:'individual',reason:'round-limit',standings:players.map((p,seat)=>({id:p.id,seat,name:p.name,worth:worths[seat],cash:1500,deeds:seat?1:2,bankrupt:false})),newRecords:[],...extra}};
}
test('championship uses authoritative final worth/order and actual identity, pieces and upgrade levels without mutating the room',()=>{
 const r=room(),before=JSON.stringify(r),m=model(r);assert.equal(m.name,'Friday game');assert.equal(m.winners[0].name,'Player 0');assert.equal(m.entries[0].worth,2300);assert.equal(m.entries[0].cash,1500);assert.equal(m.entries[0].upgrades,3);assert.equal(m.entries[0].piece,'🛵');assert.equal(m.entries[0].avatarImage,'private-portrait');assert.equal(m.entries[0].you,true);assert.equal(JSON.stringify(r),before);
 assert.deepEqual(m.entries.map(p=>p.rank),[1,2]);assert.equal(m.podium.length,2);assert.equal(model({...r,stage:'playing'}),null);
});
test('tied winners receive matching ranks and equal podium recognition; missing places are not invented',()=>{
 for(const worths of [[2300,2300],[2300,2300,1800],[2300,2300,2300,2300]]){const m=model(room(worths)),winners=worths.filter(x=>x===worths[0]).length;assert.equal(m.winners.length,winners);assert.equal(m.podium.length,winners);assert.ok(m.podium.every(p=>p.rank===1&&p.champion));}
 assert.deepEqual(model(room([2300,2300,1800,1600])).entries.map(p=>p.rank),[1,1,3,4]);assert.deepEqual(model(room([2300,1800,1800,1600])).entries.map(p=>p.rank),[1,2,2,4]);
 const m=model(room([2300,1800,1700,1600]));assert.equal(m.entries.length,4);assert.equal(m.podium.length,3);assert.equal(m.entries[3].rank,4);
});
test('last-player wins and Legendary recognition follow host results, with no fabricated awards',()=>{
 const r=room([2300,2300],{reason:'last-player'});r.finalResults.standings[1].bankrupt=true;const m=model(r);assert.equal(m.winners.length,1);assert.equal(m.entries[1].champion,false);assert.equal(m.entries[1].bankrupt,true);assert.deepEqual(m.newRecords,[]);assert.equal(m.ranked,false);
 r.finalResults.legendaryMode='gravity';r.finalResults.legendaryEligible=true;r.finalResults.newRecords=[{name:'Player 0',place:1,worth:2300}];const ranked=model(r);assert.equal(ranked.mode,'Gravity Pull');assert.equal(ranked.ranked,true);assert.equal(ranked.newRecords[0].place,1);
 r.round=4;r.rounds=10;r.finalResults.roundLimit=10;const early=model(r);assert.equal(early.rounds,4);assert.equal(early.roundLimit,10,'Early finish must not relabel the Legendary record bracket');
});
