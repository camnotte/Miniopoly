'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(ROOT,'public/index.html'),'utf8');
const css=fs.readFileSync(path.join(ROOT,'public/styles.css'),'utf8');
const app=fs.readFileSync(path.join(ROOT,'public/app.js'),'utf8');
test('championship keeps a skippable rise and gentle title glow with reduced motion, preserving the Hall crown',()=>{
  const ceremony=fs.readFileSync(path.join(ROOT,'public/championship.css'),'utf8');
  assert.match(html, /id="skipCeremony"/);
  assert.match(ceremony, /@keyframes championshipGlow/);
  assert.match(css, /\.legendary-dialog \.hall-crown\{[^}]*animation:miniCrownFloat/);
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)\{[^}]*\.legendary-dialog \.hall-crown\{animation:none!important/);
  assert.match(ceremony, /@media\(prefers-reduced-motion:reduce\)/);
  assert.match(app, /function showAwards\(celebrate=false\)/);
  assert.match(app, /function hideAwards\(\)/);
});
