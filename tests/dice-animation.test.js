'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const board=fs.readFileSync(path.join(__dirname,'..','public','board-v5-42.html'),'utf8');
const start=board.indexOf('/* Wi-Fi v0.2.2: reuse the actual V5.42 3D');
const end=board.indexOf('/* Special-space effects are presentation only.', start);
assert.ok(start>0 && end>start,'The 3D dice playback bridge exists in the original board');
const diceBridge=board.slice(start,end);

function harness(reduced=false){
  let scheduled=[];
  const canvas={};
  const classes=new Set();
  const die={classList:{add:c=>classes.add(c),remove:c=>classes.delete(c),contains:c=>classes.has(c)}};
  const caption={textContent:'ROLLED 5'};
  const paints=[],messages=[],moves=[],notices=[];
  const ctx={
    document:{getElementById:id=>id==='mini512-die'?canvas:id==='dice'?die:null,
      querySelector:sel=>sel==='#board .dice-caption'?caption:null},
    window:{matchMedia:()=>({matches:reduced})},
    requestAnimationFrame:cb=>{scheduled.push(cb);return scheduled.length},
    cancelAnimationFrame:()=>{},
    mini512PaintDie:(element,num,t)=>paints.push([element,num,t]),
    miniWifiPost:(type,info)=>messages.push([type,info]),
    miniWifiNotify:(message)=>notices.push(message),
    miniWifiAnimateRoll:(state,roll)=>moves.push([state,roll]),
  };
  vm.createContext(ctx);
  vm.runInContext(diceBridge,ctx,{timeout:1000});
  function advance(timestamp){assert.ok(scheduled.length>0,'An animation frame was requested');scheduled.shift()(timestamp);}
  return {ctx,canvas,die,caption,paints,messages,moves,notices,advance};
}

test('both browsers animate the authoritative 3D die BEFORE piece movement',()=>{
  for(const client of ['Windows','MacBook']){
    const h=harness();
    const state={players:[{name:client}]};
    const serverRoll={value:12,playerId:'p1'};
    h.ctx.miniWifiAnimateDiceThenMove(state,serverRoll);
    assert.ok(h.die.classList.contains('miniwifi-dice-rolling'));
    assert.match(h.caption.textContent,/SPINNING/);
    assert.equal(h.messages[0][0],'MINI_ANIMATION_START');
    assert.equal(h.moves.length,0);
    h.advance(1000);
    h.advance(1450);
    h.advance(2100);
    h.advance(2525);
    assert.equal(h.moves.length,0,`No movement before die settles on ${client}`);
    h.advance(2650);
    assert.ok(!h.die.classList.contains('miniwifi-dice-rolling'));
    assert.equal(h.caption.textContent,'ROLLED 12');
    assert.equal(h.paints.at(-1)[1],12);
    assert.equal(h.paints.at(-1)[2],null,'Settled face is the exact server result');
    assert.ok(h.paints.slice(1,-1).some(([, , t])=>t>0&&t<1),'Rendered intermediate spin frames');
    assert.deepEqual(h.messages.map(([type])=>type),['MINI_ANIMATION_START','MINI_DICE_SETTLED']);
    assert.equal(h.moves.length,1);
    assert.equal(h.moves[0][1],serverRoll);
  }
});

test('reduced-motion preference shows result and advances to movement without spinning',()=>{
  const h=harness(true);
  const roll={value:6,playerId:'p1'};
  h.ctx.miniWifiAnimateDiceThenMove({},roll);
  assert.equal(h.moves.length,1);
  assert.deepEqual(h.messages.map(([type])=>type),['MINI_DICE_SETTLED']);
  assert.ok(!h.die.classList.contains('miniwifi-dice-rolling'));
});

test('live match sidebar masks the final die value until spin settles',()=>{
  const app=fs.readFileSync(path.join(__dirname,'..','public','app.js'),'utf8');
  assert.match(app,/diceSpinning\?'…':latest\?\.value/);
  assert.match(app,/MINI_DICE_SETTLED/);
  assert.match(app,/beginRollPlaybackIfNew\(data\.state\)/);
  assert.match(app,/board-v5-42\.html\?v=0\.3\.7/);
});
