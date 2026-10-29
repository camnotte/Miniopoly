'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {advise}=require('../public/player-advisor'),development=require('../public/property-development');
const deeds=Object.fromEntries(require('../game-data.json').deeds.map(d=>[d.id,d]));
function room(){return {stage:'playing',youId:'cam',turn:0,round:10,rounds:10,gameMode:'countdown',phase:'post',owned:{'0-1':{owner:0,level:0},'1-1':{owner:1,level:0}},collapse:{wave:0,endangered:['0-1'],lost:{},shieldSpent:{}},players:[{id:'cam',seat:0,name:'Cam',cash:1500,perks:['building']},{id:'mac',seat:1,name:'Mac',cash:1500,perks:[]}],trades:[]};}
test('development names and illustrations replace the four numeric/star states',()=>{
 assert.deepEqual([0,1,2,3].map(development.name),['Houses','Chalets','Condos','Estates']);
 assert.equal(new Set([0,1,2,3].map(development.art)).size,4);assert.equal(development.name(100),'Estates');assert.equal(development.name(-1),'Houses');
 assert(!development.html(3).includes('★'));assert.match(development.html(3),/aria-label="Estates"/);
 assert.deepEqual([1,2,3,4,5,6].map(h=>development.name(development.forHeight(h))),['Houses','Chalets','Condos','Condos','Estates','Estates']);
});
test('main-game advice is private to the viewer and recommends a usable permit for their threatened home',()=>{
 const r=room(),cam=advise(r,deeds);assert.match(cam.text,/1 of our properties/);assert.match(cam.text,/Copper Lane/);assert.deepEqual(cam.actions,['develop','properties']);
 r.youId='mac';const mac=advise(r,deeds);assert(!mac.text.includes('Copper Lane'));assert(!mac.actions.includes('develop'));assert.match(mac.text,/Acquire properties/);
});
test('spent protection cannot be renewed by development and off-turn advice never offers a paid action',()=>{
 const r=room();r.collapse.shieldSpent['0-1']=true;let a=advise(r,deeds);assert.match(a.text,/cannot be restored/);assert(!a.actions.includes('develop'));
 delete r.collapse.shieldSpent['0-1'];r.turn=1;a=advise(r,deeds);assert(!a.actions.includes('develop'));
 r.turn=0;r.owned['0-1'].level=1;a=advise(r,deeds);assert.match(a.text,/seawalls are ready/);
});
test('busy presentations do not reveal upcoming advice, and incoming trades are recognized by seat',()=>{
 const r=room();assert.equal(advise(r,deeds,true).key,'moving');r.collapse.endangered=[];r.trades=[{to:0,from:1,status:'pending'}];assert.equal(advise(r,deeds).key,'trade');r.youId='mac';assert.notEqual(advise(r,deeds).key,'trade');
});
test('paid development advice requires a complete unmortgaged set and enough cash',()=>{
 const r=room();r.gameMode='classic';r.players[0].perks=[];
 for(const d of Object.values(deeds).filter(d=>d.type==='p'&&d.color==='Brown'))r.owned[d.id]={owner:0,level:0};
 assert.equal(advise(r,deeds).key,'develop');r.players[0].cash=0;assert.notEqual(advise(r,deeds).key,'develop');r.players[0].cash=1500;r.owned['1-1'].mortgage=true;assert.notEqual(advise(r,deeds).key,'develop');
});
