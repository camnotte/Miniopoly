'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),travel=require('../public/piece-travel'),{active}=require('../public/tsunami-ocean');
test('travel crosses a square boundary continuously and only finishes at the authoritative destination',()=>{
 const points=[{x:0,y:0},{x:100,y:0},{x:100,y:90}],copy=structuredClone(points),d=travel.stepDuration;
 const before=travel.sample(points,d-.01,d),at=travel.sample(points,d,d),after=travel.sample(points,d+.01,d);
 assert(before.x<100&&before.x>99.99);assert.equal(at.x,100);assert.equal(at.y,0);assert.equal(at.passed,1);assert.equal(at.done,false);assert(after.y>0&&after.y<.01);
 assert.deepEqual(travel.sample(points,2*d+100,d),{x:100,y:90,index:1,passed:2,done:true});assert.deepEqual(points,copy);
});
test('there is no late-square dwell and the 20 percent speed increase retains exact endpoints',()=>{
 const p=[{x:10,y:20},{x:210,y:20}],d=travel.stepDuration;
 assert.equal(690/d,1.2);for(const f of [0,.1,.5,.8,.9,.95,.99,1]){const at=travel.sample(p,d*f,d);assert(Math.abs(at.x-(10+200*f))<1e-8);assert.equal(at.done,f===1);}
 assert.equal(travel.sample(p,-100,d).x,10);assert.throws(()=>travel.sample([],0,d));assert.throws(()=>travel.sample(p,0,0));
});
test('ocean starts at an actual Tsunami wave and never in building, other modes or a waiting room',()=>{
 const room={gameMode:'countdown',stage:'playing',collapse:{wave:1}};assert.equal(active(room),true);assert.equal(active({...room,stage:'finished'}),true);
 for(const input of [null,{...room,collapse:{wave:0}},{...room,stage:'lobby'},{...room,gameMode:'classic'},{...room,gameMode:'express'}])assert.equal(active(input),false);
});
