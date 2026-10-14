const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const board=fs.readFileSync(path.join(__dirname,'../public/board-v5-42.html'),'utf8');
test('The overlay number circles were removed from the board',()=>{
  assert.equal(board.includes('miniwifi-player-pin'),false);
  assert.equal(board.includes('miniwifi-walking-icon'),false);
  assert.match(board,/marker\.innerHTML=artForPiece\(G\.players\[index\],index,'moving'\)/);
  assert.match(board,/miniwifi-in-motion/);
  assert.match(board,/function miniWifiAnimateRoll/);
});
