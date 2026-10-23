'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const pieces=require('../public/game-pieces'),art=require('../public/piece-art'),storybook=require('../public/storybook-pieces');
test('the replacement lineup preserves all saved identifiers and offers only the requested pieces',()=>{
 assert.deepEqual(pieces.choices.map(p=>p.name),['Cat','Dog','Blimp','Airplane','T-Rex','Tennis shoes','Battleship','Top Hat','Car']);
 assert.deepEqual(pieces.items.map(p=>p.symbol),['🚗','🐱','🐶','📱','🚀','🛵','🦖','🎮','car']);
 for(const {symbol} of pieces.items){const html=art.art(symbol,'normal');assert.match(html,/<svg/);assert.doesNotMatch(html,/piece-emoji|<img|<text|onload=|onerror=/);assert.ok(!/[\u{1F300}-\u{1FAFF}]/u.test(html),'Stored identifiers must not render as platform emoji');}
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
