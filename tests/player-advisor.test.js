'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {advise}=require('../public/player-advisor'),development=require('../public/property-development');
const deeds=Object.fromEntries(require('../game-data.json').deeds.map(d=>[d.id,d]));
function room(){return {stage:'playing',youId:'cam',turn:0,round:10,rounds:10,gameMode:'countdown',phase:'post',owned:{'0-1':{owner:0,level:0},'1-1':{owner:1,level:0}},collapse:{wave:0,endangered:['0-1'],lost:{},shieldSpent:{}},players:[{id:'cam',seat:0,name:'Cam',cash:1500,perks:['building']},{id:'mac',seat:1,name:'Mac',cash:1500,perks:[]}],trades:[]};}
test('three building slots fill with houses or chalets, then become up to three Estates',()=>{
 assert.deepEqual([0,1,2,3,4,5,6].map(n=>development.name(n)),['No buildings','1 House','2 Houses','3 Houses','Estate','2 Estates','3 Estates']);
 for(let n=0;n<=6;n++){const html=development.slots(n);assert.equal((html.match(/class="building-slot/g)||[]).length,4);assert.equal((html.match(/class="building-slot is-filled"/g)||[]).length,n>=4?n-3:n);}
 assert.match(development.art(1,{board:0}),/#62cd36/);assert.match(development.art(1,{board:1}),/#f2cb36/);assert.match(development.art(4),/#ed302b/);
 assert.equal(development.name(3,{board:1}),'3 Chalets');assert.equal(development.name(4,{board:1}),'Estate');
});
test('main-game advice is private to the viewer and recommends a usable permit for their threatened home',()=>{
 const r=room(),cam=advise(r,deeds);assert.match(cam.details,/1 of our properties/);assert.match(cam.text,/Copper Lane/);assert.deepEqual(cam.actions,['develop']);
 r.youId='mac';const mac=advise(r,deeds);assert(!mac.text.includes('Copper Lane'));assert(!mac.actions.includes('develop'));assert.match(mac.details,/Acquire properties/);
});
test('spent protection cannot be renewed by development and off-turn advice never offers a paid action',()=>{
 const r=room();r.collapse.shieldSpent['0-1']=true;let a=advise(r,deeds);assert.match(a.text,/cannot be restored/);assert(!a.actions.includes('develop'));
 delete r.collapse.shieldSpent['0-1'];r.turn=1;a=advise(r,deeds);assert(!a.actions.includes('develop'));
 r.turn=0;r.owned['0-1'].level=1;a=advise(r,deeds);assert.match(a.details,/flood protection is ready/);
});
test('busy presentations do not reveal upcoming advice, and incoming trades are recognized by seat',()=>{
 const r=room();assert.equal(advise(r,deeds,true).key,'moving');r.collapse.endangered=[];r.trades=[{to:0,from:1,status:'pending'}];assert.equal(advise(r,deeds).key,'trade');r.youId='mac';assert.notEqual(advise(r,deeds).key,'trade');
});
test('paid development advice requires a complete unmortgaged set and enough cash',()=>{
 const r=room();r.gameMode='classic';r.players[0].perks=[];
 for(const d of Object.values(deeds).filter(d=>d.type==='p'&&d.color==='Brown'))r.owned[d.id]={owner:0,level:0};
 assert.equal(advise(r,deeds).key,'develop');r.players[0].cash=0;assert.notEqual(advise(r,deeds).key,'develop');r.players[0].cash=1500;r.owned['1-1'].mortgage=true;assert.notEqual(advise(r,deeds).key,'develop');
});

test('advice uses one short headline and at most one action, with detail available separately',()=>{
 const r=room();for(const stage of ['lobby','playing','finished'])for(const phase of ['roll','post','rent']){r.stage=stage;r.phase=phase;const advice=advise(r,deeds);assert(advice.text.length<=100,advice.text);assert(advice.actions.length<=1);assert(advice.details.length>0);}
});

test('neighborhood disaster status counts properties across owners, excluding spent or submerged protection',()=>{
 const {neighborhoodStatus}=require('../public/player-advisor'),r=room();r.owned={'0-1':{owner:0,level:6},'0-3':{owner:1,level:1},'0-5':{owner:0,level:4},'0-7':{owner:1,level:2},'1-1':{owner:1,level:3}};r.collapse.lost={'0-7':1,'1-3':1};r.collapse.shieldSpent={'0-5':true};const before=JSON.stringify(r);
 assert.deepEqual(neighborhoodStatus(r,0),{world:0,visible:true,submerged:1,protected:2,portals:0,owned:3});
 assert.deepEqual(neighborhoodStatus(r,1),{world:1,visible:true,submerged:1,protected:1,portals:0,owned:1});assert.equal(neighborhoodStatus(r,2).protected,0);assert.equal(JSON.stringify(r),before);
 r.youId='mac';assert.equal(neighborhoodStatus(r,0).protected,2);
});
test('neighborhood status keeps portal and Standard semantics separate and hides in the lobby',()=>{
 const {neighborhoodStatus}=require('../public/player-advisor'),r=room();r.gameMode='express';r.collapse.lost={'0-1':2,'0-3':2,'2-5':2};assert.equal(neighborhoodStatus(r,0).portals,2);assert.equal(neighborhoodStatus(r,0).protected,0);assert.equal(neighborhoodStatus(r,0).submerged,0);
 r.gameMode='classic';assert.equal(neighborhoodStatus(r,0).visible,false);r.gameMode='countdown';r.stage='lobby';assert.equal(neighborhoodStatus(r,0).visible,false);assert.doesNotThrow(()=>neighborhoodStatus(null,NaN));
});
test('personal protection totals include all neighborhoods while distinguishing spent shields and developed properties',()=>{
 const {portfolioStatus}=require('../public/player-advisor'),r=room();r.owned={'0-1':{owner:0,level:2},'1-1':{owner:0,level:1},'2-3':{owner:1,level:4}};assert.deepEqual(portfolioStatus(r),{owned:2,developed:2,protected:2,spent:0});r.collapse.shieldSpent['0-1']=true;assert.deepEqual(portfolioStatus(r),{owned:2,developed:2,protected:1,spent:1});
});
