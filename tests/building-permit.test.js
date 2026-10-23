'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {details,candidates}=require('../public/building-permit');
const {deeds}=require('../game-data.json');
test('permit previews quote all upgrade levels and the existing rent and net-worth valuation',()=>{
  for(const deed of deeds.filter(d=>d.type==='p'))for(let level=0;level<3;level++){
    const ownership={owner:0,level,mortgage:false},before=structuredClone(ownership),preview=details(deed,ownership);
    assert.equal(preview.rent,deed.base*[1,2,4,7][level]);assert.equal(preview.nextRent,deed.base*[1,2,4,7][level+1]);
    assert.equal(preview.rentGain,preview.nextRent-preview.rent);
    assert.equal(preview.value,deed.price+level*deed.upgradeCost/2);
    assert.equal(preview.nextValue,preview.value+deed.upgradeCost/2);assert.deepEqual(ownership,before);
  }
  for(const ownership of [null,{level:3},{level:1,mortgage:true},{level:-1},{level:1.5}])assert.equal(details(deeds[0],ownership),null);
  assert.equal(details(deeds.find(d=>d.type==='rail'),{level:0}),null);
});
test('highest-priced eligible property and largest rent increase can be different choices',()=>{
  const room={owned:{'0-1':{owner:0,level:0},'2-13':{owner:0,level:0},'2-11':{owner:0,level:2},
    '0-3':{owner:0,level:0,mortgage:true},'0-5':{owner:0,level:3},'0-2':{owner:0,level:0},'0-7':{owner:1,level:0}}};
  const before=structuredClone(room),price=candidates(deeds,room,0),rent=candidates(deeds,room,0,'rent');
  assert.deepEqual(price.map(d=>d.id),['2-13','2-11','0-1']);assert.equal(price[0].rentGain,40);
  assert.equal(rent[0].id,'2-11');assert.equal(rent[0].rentGain,96);
  assert.deepEqual(room,before,'Comparing must not change ownership or consume a permit');
});
