'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {sameSeat,acceptsSnapshot}=require('../public/room-sync');
const auth={code:'AB7CD9',token:'private-seat'},current={code:auth.code,revision:12,youId:'mac',players:[{id:'mac'},{id:'dell'}],turn:0};
test('an older HTTP or stream reply cannot replace a newer turn snapshot',()=>{
  assert.equal(acceptsSnapshot(current,{...current,revision:11,turn:1},auth,auth),false);
  assert.equal(acceptsSnapshot(current,{...current,revision:12},auth,auth),true);
  assert.equal(acceptsSnapshot(current,{...current,revision:13,turn:1},auth,auth),true);
});
test('a previous room or player connection cannot update the active seat',()=>{
  assert.equal(sameSeat(auth,{...auth}),true);assert.equal(sameSeat(null,auth),false);
  for(const previous of [{...auth,code:'ZZ7CD9'},{...auth,token:'previous-seat'}])assert.equal(acceptsSnapshot(current,current,auth,previous),false);
  assert.equal(acceptsSnapshot(current,{...current,code:'ZZ7CD9'},auth,auth),false);
  assert.equal(acceptsSnapshot(current,{...current,youId:'dell'},auth,auth),false);
});
test('fresh and legacy rooms require a valid server revision and authenticated player',()=>{
  assert.equal(acceptsSnapshot(null,{...current,revision:0},auth,auth),true);
  for(const revision of [undefined,-1,NaN,1.5,'13'])assert.equal(acceptsSnapshot(current,{...current,revision},auth,auth),false);
  assert.equal(acceptsSnapshot(null,{...current,youId:'unknown'},auth,auth),false);
});
