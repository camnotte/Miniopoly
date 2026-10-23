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
