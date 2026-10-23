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
test('parked pieces face the correct side of all 16 board steps',()=>{
  const headings=Array.from({length:16},(_,i)=>context.miniWifiHeadingFromPosition(i));
  assert.deepEqual(headings,['east','east','east','east','south','south','south','south',
    'west','west','west','west','north','north','north','north']);
  assert.equal(context.miniWifiHeadingFromPosition(16),'east');
});
test('vector facing follows the rendered segment without rotating the path container',()=>{
 const art=require('../public/storybook-pieces');
 for(const [point,heading] of [[{x:12,y:0},'east'],[{x:-12,y:0},'west'],[{x:0,y:-12},'north'],[{x:0,y:12},'south']])assert.equal(art.heading({x:0,y:0},point),heading);
 assert.equal(art.heading({x:1,y:2},{x:1,y:2},'north'),'north');
 assert.match(board,/marker\.dataset\.heading=window\.MiniopolyStorybookPieces\.heading/);
 assert.match(board,/miniWifiOrientParkedCars\(\)/);
});
test('existing piece path, speed, and landing order remain unchanged',()=>{
 assert.match(board,/const points=Array\.from\(\{length:roll\.value\+1\}/);
 assert.match(board,/const milliseconds=690/);
 assert.match(board,/miniWifiRevealSpecial\(state,roll\)/);
 assert.match(board,/marker\.innerHTML=artForPiece\(G\.players\[index\],index,'moving'\)/);
});
