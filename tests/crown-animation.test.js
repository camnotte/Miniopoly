'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(ROOT,'public/index.html'),'utf8');
const css=fs.readFileSync(path.join(ROOT,'public/styles.css'),'utf8');
const app=fs.readFileSync(path.join(ROOT,'public/app.js'),'utf8');
test('championship crown floats with subtle motion, gold glow and reduced-motion opt-out',()=>{
  assert.match(html, /class="champion-crown" aria-hidden="true"><span>👑<\/span>/);
  assert.match(css, /\.champion-crown span\{[^}]*animation:miniCrownFloat 3\.2s ease-in-out infinite/);
  assert.match(css, /@keyframes miniCrownFloat\{[\s\S]*?translateY\(-7px\)/);
  assert.match(css, /\.legendary-dialog \.hall-crown\{[^}]*animation:miniCrownFloat/);
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)\{[^}]*\.legendary-dialog \.hall-crown\{animation:none!important/);
  assert.match(css, /\.awards-layer\.celebrating \.champion-crown/);
  assert.match(app, /function showAwards\(celebrate=false\)/);
  assert.match(app, /function hideAwards\(\)/);
});
