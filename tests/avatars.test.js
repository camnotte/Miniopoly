'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const avatars=require('../public/avatars');

test('old saved faces and unknown avatar values resolve to safe current portraits',()=>{
  assert.equal(avatars.resolve('👩🏾',0).id,'woman-5');
  assert.equal(avatars.resolve('👨🏻‍🦰',0).id,'man-2');
  assert.equal(avatars.resolve(undefined,3).id,'man-4');
  assert.equal(avatars.resolve('../../secret',1).id,'man-2');
  assert.equal(avatars.resolve('<img onerror=alert(1)>',2).id,'man-3');
  assert.doesNotMatch(avatars.html('<img onerror=alert(1)>'),/onerror/);
});
