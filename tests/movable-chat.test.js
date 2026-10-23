'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {clampPosition,defaultPosition}=require('../public/movable-chat');
test('default desktop chat is beside the turn panel and viewport clamps survive zoom/keyboard offsets',()=>{
 const view={left:0,top:0,width:1470,height:956},size={width:370,height:500},turn={left:1098,right:1458,top:65,bottom:850};
 const p=defaultPosition(size,view,turn);assert.ok(p.x+size.width<turn.left);assert.ok(p.y>=12);assert.ok(p.y+size.height<=944);
 assert.deepEqual(clampPosition(-999,999,size,{left:20,top:30,width:600,height:700}),{x:32,y:218});
 const left=defaultPosition(size,view,{left:12,right:372,top:60,bottom:850});assert.ok(left.x>372);
});
