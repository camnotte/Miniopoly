'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');

test('all three world GO assets exist and are served through the host',()=>{
 const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
 for(let n=1;n<=3;n++){
  const f=`go-world-${n}.webp`;
  assert.ok(fs.statSync(path.join(root,'public',f)).size > 8000);
  assert.ok(server.includes(`'/${f}':['${f}','image/webp']`));
 }
});
test('each start tile uses exact matching GO square; old Design Lab special artwork does not replace it',()=>{
 const b=fs.readFileSync(path.join(root,'public','board-v5-42.html'),'utf8');
 assert.match(b,/if\(spaceType==='start'\)tile\.classList\.add\('mini-go-card'\)/);
 assert.match(b,/const baseTile=spaceType==='start'\?/);
 assert.match(b,/go-world-\$\{displayBoard\+1\}\.webp/);
 assert.match(b,/\.tile\.space-start\.mini-go-card > \.mini-go-art/);
 assert.match(b,/object-fit:fill!important/);
 assert.match(b,/\.tile\.space-start\.mini-go-card > \.tokens\.mini518-token-lane/);
});
