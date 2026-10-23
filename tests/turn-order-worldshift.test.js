'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const board=fs.readFileSync(path.join(__dirname,'..','public/board-v5-42.html'),'utf8');
const shell=fs.readFileSync(path.join(__dirname,'..','public/index.html'),'utf8');

test('center board has real 2–4 player turn order, active theme and local You seat',()=>{
  for(const text of [
    "const miniTurnPlayers=G.players.map((p,i)=>",
    'mini-turn-player', 'mini-turn-roster', 'mini-turn-order-title', 'mini-turn-you',
    "G.phase!=='finished'&&G.turn===i?' is-active'", 'p.id===miniWifiLocalPlayerId',
    'miniWifiLocalPlayerId=state.youId', 'p.id=sp.id',
    'mini-turn-arrow','mini-turn-status', 'mini-turn-die-ready',
    'color-mix(in srgb,var(--world-soft',
    'grid-template-rows:auto minmax(64px,1fr) auto auto',
    "miniWifiLastActiveSeat=nextActiveId",
    'data-help="Turn order. The highlighted row',
  ])assert.ok(board.includes(text),text);
  assert.ok(!board.includes('<div class="mini512-trigger-hint">6 or 12 = WORLD SHIFT'), 'Permanent rule was moved to Helpful Hints');
  assert.ok(board.includes('Rolling a 6 or 12 triggers a World Shift'));
  assert.ok(shell.includes('PROTOTYPE v'+require('../package.json').version));
});

test('Wi-Fi shift delays movement for stand-by notice, while normal rolls continue immediately',()=>{
  const start=board.indexOf('function miniWifiMoveAfterShift(state,roll){');
  const end=board.indexOf('function miniWifiAnimateDiceThenMove(',start);
  assert.ok(start>=0&&end>start);
  const fn=board.slice(start,end);
  function run(roll,reduce=false){
    const children=[],posts=[],notices=[],moves=[],timers=[];
    const wrap={append:el=>children.push(el)};
    const classes=new Set();const board={classList:{add:(...names)=>names.forEach(c=>classes.add(c)),remove:(...names)=>names.forEach(c=>classes.delete(c))}};
    const document={getElementById:()=>board,querySelector:()=>wrap,createElement:()=>({className:'',innerHTML:'',setAttribute(){},querySelector:()=>({textContent:''}),remove(){children.pop()}})};
    const renders=[];const context={miniWifiPlayShiftSound:quick=>posts.push(['SHIFT_SOUND',quick]),miniWifiVisualBoard:0,render:()=>renders.push('render'),roll,miniWifiShiftPause:null,document,window:{matchMedia:()=>({matches:reduce})},miniWifiPost:(...a)=>posts.push(a),miniWifiNotify:t=>notices.push(t),miniWifiAnimateRoll:(...a)=>moves.push(a),setTimeout:(fn,ms)=>{timers.push({fn,ms});return timers.length;},clearTimeout(){}};
    vm.createContext(context);
    vm.runInContext(fn+'\nminiWifiMoveAfterShift({players:[]},roll);',context);
    return {children,posts,notices,moves,timers,classes,renders};
  }
  const shifted=run({playerId:'one',value:6,previousBoard:0,board:1});
  assert.equal(shifted.moves.length,0,'Movement waits for the World Shift pause');
  assert.equal(shifted.children.length,1,'Stand-by overlay is shown');
  assert.match(shifted.children[0].innerHTML,/WORLD SHIFT IN PROGRESS/);
  assert.match(shifted.children[0].innerHTML,/STAND BY/);
  assert.equal(shifted.timers[0].ms,1300);
  assert.equal(shifted.posts[0][0],'MINI_ANIMATION_START');
  assert.ok(shifted.posts.some(p=>p[0]==='SHIFT_SOUND'),'Sound accompanies the transition');
  assert.ok(shifted.classes.has('mini-world-fade-out'));
  shifted.timers[0].fn();assert.equal(shifted.renders.length,1);assert.equal(shifted.moves.length,0,'New world fades in before moving');assert.ok(shifted.classes.has('mini-world-fade-in'));assert.equal(shifted.timers[1].ms,1700);shifted.timers[1].fn();
  assert.equal(shifted.moves.length,1,'After stand-by, normal piece movement begins');
  assert.equal(shifted.children.length,0);
  assert.equal(run({previousBoard:2,board:2,value:5}).moves.length,1,'No delay on same-world rolls');
  assert.equal(run({previousBoard:0,board:1,value:6},true).moves.length,1,'Reduced-motion users are not delayed');
  assert.equal(shifted.classes.has('mini-world-handoff'),false,'Normal shifts do not use fast styling');
  const handoff=run({handoff:true,playerId:'two',previousBoard:0,board:1});
  assert.equal(handoff.timers[0].ms,400);
  assert.ok(handoff.classes.has('mini-world-handoff'));
  assert.ok(handoff.posts.some(p=>p[0]==='SHIFT_SOUND'&&p[1]===true),'Handoff uses its shorter sound');
  handoff.timers[0].fn();assert.equal(handoff.timers[1].ms,600);
  assert.ok(!handoff.posts.some(p=>p[0]==='MINI_WORLD_TRANSITION_DONE'),'Controls stay blocked through fade-in');
  handoff.timers[1].fn();
  assert.equal(handoff.moves.length,0,'A turn handoff never moves a piece');
  assert.equal(handoff.classes.size,0,'Fast and fade styles are cleared before the next roll');
  assert.equal(handoff.children.length,0);
  assert.equal(handoff.posts.filter(p=>p[0]==='MINI_WORLD_TRANSITION_DONE').length,1);
  const reducedHandoff=run({handoff:true,playerId:'two',previousBoard:1,board:2},true);
  assert.equal(reducedHandoff.timers.length,0);
  assert.equal(reducedHandoff.moves.length,0);
  assert.equal(reducedHandoff.posts[0][0],'MINI_WORLD_TRANSITION_DONE');
});
