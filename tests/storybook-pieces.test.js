'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const pieces=require('../public/game-pieces'),art=require('../public/piece-art'),storybook=require('../public/storybook-pieces');
test('the replacement lineup preserves all saved identifiers and offers only the requested pieces',()=>{
 assert.deepEqual(pieces.choices.map(p=>p.name),['Cat','Dog','Blimp','Airplane','T-Rex','Tennis shoes','Battleship','Top Hat','Police car','School bus']);
 assert.deepEqual(pieces.items.map(p=>p.symbol),['🚗','🐱','🐶','📱','🚀','🛵','🦖','🎮','car','school-bus']);
 for(const {symbol} of pieces.items){const html=art.art(symbol,'normal');assert.match(html,/<svg/);assert.doesNotMatch(html,/piece-emoji|<img|<script|onload=|onerror=/);assert.ok(!/[\u{1F300}-\u{1FAFF}]/u.test(html),'Stored identifiers must not render as platform emoji');}
});
test('new pieces rest in parked/compact/Setback states; motion and flight belong only to moving state',()=>{
 for(const {symbol} of pieces.items.filter(p=>storybook.kind(p.symbol))){for(const state of ['normal','small','setback'])assert.doesNotMatch(art.art(symbol,state),/is-moving/);assert.match(art.art(symbol,'moving'),/is-moving/);}
 assert.equal(storybook.flying('🚗'),true);assert.equal(storybook.flying('📱'),true);assert.equal(storybook.flying('🚀'),false);
 assert.equal(storybook.kind('car'),'car');assert.equal(storybook.flying('car'),false);assert.match(art.art('car','moving'),/car-rig/);
 assert.equal(storybook.kind('🛵'),'shoes');assert.equal(storybook.kind('bogus'),null);assert.equal(storybook.kind('constructor'),null);assert.equal(art.art('__proto__'),'');assert.equal(art.art('bogus'),'');
});
test('direction follows actual positive, negative and resized segment geometry safely',()=>{
 assert.equal(storybook.heading({x:100,y:150},{x:80,y:150}),'west');assert.equal(storybook.heading({x:100,y:150},{x:100,y:110}),'north');
 assert.equal(storybook.heading({x:100,y:150},{x:130,y:152}),'east');assert.equal(storybook.heading({x:100,y:150},{x:102,y:190}),'south');
 assert.equal(storybook.heading(null,{},'west'),'west');assert.equal(storybook.heading({x:NaN,y:0},{x:1,y:2},'south'),'south');
});

test('vehicle artwork IDs are unique across copies and every local reference belongs to its own SVG',()=>{
 const seen=new Set();
 for(const symbol of ['car','school-bus','car','school-bus']){
  const html=art.art(symbol,'normal'),ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert(ids.length>0);for(const id of ids){assert(!seen.has(id),'Duplicate SVG ID '+id);seen.add(id);}
  for(const match of html.matchAll(/url\(#([^)]+)\)/g))assert(ids.includes(match[1]),'Local SVG reference must resolve inside the piece');
 }
});
test('the approved vehicles include movement and parked artwork without adding the monster truck',()=>{
 const police=art.art('car','moving'),bus=art.art('school-bus','normal');
 for(const name of ['vehicle-wheel-spin','vehicle-body','police-antenna','police-red-light','police-blue-light','police-spotlight','POLICE'])assert(police.includes(name),name);
 for(const name of ['bus-passenger','bus-wave-hand','bus-door-left','bus-door-right','bus-stop-paddle','bus-roof-lights','SCHOOL BUS'])assert(bus.includes(name),name);
 assert.match(police,/data-tire-tracks="true"/);assert.match(bus,/data-tire-tracks="true"/);
 assert.equal(storybook.kind('school-bus'),'bus');assert.equal(storybook.flying('school-bus'),false);
 assert.equal(pieces.resolve('car').name,'Police car');assert.equal(pieces.valid('monster-truck'),false);assert.equal(art.art('monster-truck'),'');
});
