'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),filters=require('../public/trade-filters'),{deeds}=require('../game-data.json');
const byId=Object.fromEntries(deeds.map(d=>[d.id,d]));
const room=()=>({gameMode:'countdown',owned:{'0-1':{owner:0,level:1},'1-1':{owner:1,level:0},'2-1':{owner:2,level:0},'0-2':{owner:0,level:0},'1-6':{owner:1,level:0},'0-6':{owner:1,level:0}},players:[{seat:0},{seat:1},{seat:2}],collapse:{lost:{},wave:0}});
test('needed set properties span neighborhoods and opponents, without including railroads or complete/unstarted sets',()=>{
 const r=room();delete r.owned['0-1'];delete r.owned['1-1'];r.owned['0-3']={owner:0,level:0};r.owned['1-3']={owner:1,level:0};const before=JSON.stringify(r),matches=filters.needed(r,byId,0);assert.deepEqual(matches.map(m=>m.id).sort(),['1-3','2-1']);assert(matches.every(m=>m.owned===1&&m.total===3&&!m.completes));assert.equal(JSON.stringify(r),before);
 r.owned['1-3'].owner=0;assert.equal(filters.needed(r,byId,0).find(m=>m.id==='2-1').completes,true);r.owned['2-1'].owner=0;assert.equal(filters.needed(r,byId,0).length,0);
});
test('lost properties and eliminated owners cannot become trade suggestions; a mortgaged deed is still identified as missing',()=>{
 const r=room();r.collapse.lost['2-1']=2;r.owned['1-1'].mortgage=true;assert.deepEqual(filters.needed(r,byId,0).map(m=>m.id),['1-1']);r.players[1].out=true;assert.equal(filters.needed(r,byId,0).length,0);
});
test('best value uses live buildings, excludes mortgage rent and estimates acquired rail/utility rent for the recipient',()=>{
 const r=room();assert.equal(filters.estimatedRent(r,byId,byId['0-1'],1),12);r.owned['0-1'].level=4;assert.equal(filters.estimatedRent(r,byId,byId['0-1'],1),120);assert.equal(filters.value(r,byId,byId['0-1'],1),2);
 assert.equal(filters.estimatedRent(r,byId,byId['1-6'],0),50);r.owned['0-2'].mortgage=true;assert.equal(filters.estimatedRent(r,byId,byId['1-6'],0),25);
 assert.equal(filters.estimatedRent(r,byId,byId['0-6'],0),26);r.owned['0-1'].mortgage=true;assert.equal(filters.value(r,byId,byId['0-1'],1),0);
});
