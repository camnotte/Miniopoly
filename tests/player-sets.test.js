'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const data=require('../game-data.json'),{groups,otherDeeds}=require('../public/player-sets');
const presentation=require('../public/landing-presentation');
const players=[{id:'a',seat:0,name:'Dell PC'},{id:'b',seat:1,name:'Chris'}];
test('set progress includes all eight cross-world color groups and excludes special deeds',()=>{
  const room={players,owned:{'0-1':{owner:0},'0-3':{owner:0},'0-2':{owner:0}}};
  const result=groups(data.deeds,room,0);
  assert.equal(result.length,8);assert.deepEqual(result.map(g=>g.total),[2,3,3,3,3,3,3,2]);
  assert.equal(result.find(g=>g.color==='Brown').count,1);assert.equal(result.find(g=>g.color==='Blue').count,1);
  assert.equal(result.reduce((sum,g)=>sum+g.count,0),2);
});
test('complete mortgaged sets retain ownership while missing members distinguish opponents, availability and foreclosure',()=>{
  const room={players,owned:{'0-1':{owner:0,level:1},'1-1':{owner:0,mortgage:true},'0-3':{owner:1}},foreclosures:[{deedId:'2-1'}]};
  const result=groups(data.deeds,room,0),brown=result.find(g=>g.color==='Brown'),blue=result.find(g=>g.color==='Blue');
  assert.equal(brown.complete,true);assert.equal(brown.mortgaged,true);assert.equal(brown.count,2);
  assert.equal(blue.members[0].ownerName,'Chris');assert.equal(blue.members[0].owned,false);
  assert.equal(blue.members[1].ownerName,null);assert.equal(blue.members[1].foreclosed,false);assert.equal(blue.members[2].foreclosed,true);
  assert.deepEqual(blue.members.map(d=>d.board),[0,1,2]);
});
test('movement holds ownership progress and foreclosure status without changing authoritative snapshots',()=>{
  const before={code:'ROOMAA',matchId:'match',stage:'playing',turn:0,players,owned:{'0-1':{owner:0}},foreclosures:[{deedId:'1-1'}],log:[]};
  const after=structuredClone(before);after.lastRoll={at:100,playerId:'a'};after.owned['1-1']={owner:0};after.foreclosures=[];
  const copy=structuredClone(after),hold=presentation.capture(before,after);
  const shown=presentation.project(after,hold);
  assert.equal(groups(data.deeds,shown,0)[0].count,1);assert.equal(shown.foreclosures.length,1);
  assert.equal(groups(data.deeds,presentation.project(after,null),0)[0].complete,true);assert.deepEqual(after,copy);
  before.owned['0-1'].owner=1;assert.equal(hold.owned['0-1'].owner,0,'Captured ownership is independent of later snapshots');
});
test('other deeds lists only that player’s owned railroads and utilities, with world and mortgage status',()=>{
  const special=data.deeds.filter(d=>d.type!=='p');assert.ok(special.length>=3);
  const room={players,owned:{[special[0].id]:{owner:0,mortgage:true},[special[1].id]:{owner:1},[special[2].id]:{owner:0},'0-1':{owner:0}}};
  const result=otherDeeds(data.deeds,room,0);
  assert.equal(result.other,true);assert.equal(result.count,2);
  assert.deepEqual(result.members.map(d=>d.id),[special[0].id,special[2].id]);
  assert.equal(result.members[0].mortgaged,true);assert.equal(result.members[0].ownerName,'Dell PC');
  assert.equal(result.members[0].board,special[0].board);assert.ok(result.members.every(d=>d.owned));
  assert.equal(otherDeeds(data.deeds,room,3).count,0);
});
