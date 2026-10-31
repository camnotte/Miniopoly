'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {clamp}=require('../public/property-overview');
test('saved or dragged overview placement stays reachable after viewport changes',()=>{
  const size={width:520,height:600},view={left:0,top:0,width:1470,height:1100};
  assert.deepEqual(clamp(-100,-100,size,view),{x:12,y:12});
  assert.deepEqual(clamp(1700,2000,size,view),{x:938,y:488});
  assert.deepEqual(clamp(450,170,size,view),{x:450,y:170});
  const smaller={left:20,top:30,width:850,height:700};
  assert.deepEqual(clamp(938,488,size,smaller),{x:338,y:118});
});

const {wavePath}=require('../public/property-overview'),{deeds}=require('../game-data.json'),storm=require('../lib/countdown-mode');
test('wave overview follows authoritative exposed edges in all three neighborhoods',()=>{
 const room={gameMode:'countdown',stage:'playing',rounds:10,collapse:storm.initialize()};
 for(const direction of ['north','south','east','west']){room.collapse.direction=direction;const result=wavePath(room,deeds);assert(result.available);assert.deepEqual(result.deeds.map(d=>d.id),deeds.filter(d=>storm.exposed(room,d.id)).sort((a,b)=>a.board-b.board||a.pos-b.pos).map(d=>d.id));assert.deepEqual([...new Set(result.deeds.map(d=>d.board))],[0,1,2]);}
});
test('wave overview includes unowned sites along the path but excludes submerged sites until rebuilt',()=>{
 const room={gameMode:'countdown',stage:'playing',rounds:10,owned:{'0-1':{owner:0}},collapse:{...storm.initialize(),direction:'north',lost:{'0-3':1}}},before=structuredClone(room);
 const result=wavePath(room,deeds);assert(result.deeds.some(d=>d.id==='0-1'));assert(result.deeds.some(d=>d.id==='2-1'));assert(!result.deeds.some(d=>d.id==='0-3'));assert.deepEqual(room,before);delete room.collapse.lost['0-3'];assert(wavePath(room,deeds).deeds.some(d=>d.id==='0-3'));
});
test('wave overview does not invent a direction before the warning or after calm seas',()=>{
 const room={gameMode:'countdown',stage:'playing',rounds:15,collapse:storm.initialize()};assert.equal(wavePath(room,deeds).available,false);assert.match(wavePath(room,deeds).message,/round 14/);room.collapse.direction='north';room.collapse.calm=true;assert.equal(wavePath(room,deeds).available,false);assert.match(wavePath(room,deeds).message,/calm/);room.gameMode='classic';assert.equal(wavePath(room,deeds).available,false);
});
