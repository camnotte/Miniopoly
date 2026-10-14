const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const board=fs.readFileSync(path.join(__dirname,'../public/board-v5-42.html'),'utf8');
const headingSource=board.match(/function miniWifiHeadingFromPosition\(pos\)\{[\s\S]*?\n\}/)?.[0];
assert.ok(headingSource,'heading helper included in the board');
const context=vm.createContext({});
vm.runInContext(headingSource,context);
test('car faces the correct side of all 16 board steps',()=>{
  const headings=Array.from({length:16},(_,i)=>context.miniWifiHeadingFromPosition(i));
  assert.deepEqual(headings,['east','east','east','east','south','south','south','south',
    'west','west','west','west','north','north','north','north']);
  assert.equal(context.miniWifiHeadingFromPosition(16),'east');
});
test('direction flips or rotates the real car art only, not the moving container',()=>{
  assert.match(board,/#board \.tile \.token\.image-token\.car-token\[data-heading="west"\] \.token-art\.car-art\{transform:scaleX\(-1\)!important\}/);
  assert.match(board,/#board \.tile \.token\.image-token\.car-token\[data-heading="north"\] \.token-art\.car-art\{transform:rotate\(-90deg\)!important\}/);
  assert.match(board,/#board \.tile \.token\.image-token\.car-token\[data-heading="south"\] \.token-art\.car-art\{transform:rotate\(90deg\)!important\}/);
  assert.match(board,/marker\.dataset\.heading=miniWifiHeadingFromPosition\(roll\.previousPosition\+step-1\)/);
  assert.match(board,/miniWifiOrientParkedCars\(\)/);
});
test('existing piece path, speed, and landing order remain unchanged',()=>{
 assert.match(board,/const points=Array\.from\(\{length:roll\.value\+1\}/);
 assert.match(board,/const milliseconds=690/);
 assert.match(board,/miniWifiRevealSpecial\(state,roll\)/);
 assert.match(board,/marker\.innerHTML=artForPiece\(G\.players\[index\],index,'moving'\)/);
});
