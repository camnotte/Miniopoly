const assert = require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const test=require('node:test');
const html=fs.readFileSync(path.join(__dirname,'../public/board-v5-42.html'),'utf8');
const preset=require('../design-lab-preset-5.json');
test('Preset 5 Town Tax idle PNG + activation GIF are embedded in active board',()=>{
 const v=preset.design.special.designs['0-14'];
 assert.ok(html.includes(v.imageData));
 assert.ok(html.includes(v.activeImageData));
 assert.ok(html.includes('mini59ActivateSpecialSquare'));
 assert.match(html,/\['start','chest','weather','chance','rail','util','tax','festival'\]\.includes\(t\[0\]\)/);
});
test('World GO images remain protected as separate assets',()=>{
 for(const n of [1,2,3]){
 assert.ok(html.includes('go-world-'));
 assert.ok(fs.existsSync(path.join(__dirname,`../public/go-world-${n}.webp`)));
 }
});
