'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const project=path.join(__dirname,'..');
const board=fs.readFileSync(path.join(project,'public/board-v5-42.html'),'utf8');
const gameData=JSON.parse(fs.readFileSync(path.join(project,'game-data.json')));
const start=board.indexOf('/* Special-space effects are presentation only.');
const end=board.indexOf('function miniWifiStopAnimation(notify=true)',start);
assert.ok(start>0&&end>start,'Special playback implementation is included in the original board');
const moduleSource=board.slice(start,end);
function node(tag){
 const classes=new Set();
 return {
  tag,dataset:{},style:{},textContent:'',className:'',children:[],removed:false,
  setAttribute(){},
  classList:{add:k=>classes.add(k),remove:k=>classes.delete(k),contains:k=>classes.has(k)},
  append(...children){this.children.push(...children);},
  remove(){this.removed=true;}
 };
}
function harness(reduced=false){
 const boardWrap=node('boardwrap'),tile=node('tile');
 const messages=[],notices=[],specialActivations=[],scheduled=[];
 const ctx={
  miniWifiSpecialPlayback:null,
  W:gameData.worlds,
  document:{querySelector:selector=>selector==='.boardwrap'?boardWrap:selector.startsWith('#board .tile[')?tile:null,createElement:node},
  window:{matchMedia:()=>({matches:reduced})},
  miniWifiPost:(name,payload)=>messages.push([name,payload]),
  miniWifiNotify:(msg)=>notices.push(msg),
  mini59ActivateSpecialSquare:(board,pos)=>specialActivations.push([board,pos]),
  setTimeout:(callback,delay)=>{scheduled.push([callback,delay]);return scheduled.length},
  clearTimeout:()=>{},
  console:{debug:()=>{}}
 };
 vm.createContext(ctx);vm.runInContext(moduleSource,ctx,{timeout:2000});
 return {ctx,boardWrap,tile,messages,notices,specialActivations,scheduled};
}
const testCases=[
 {board:0,pos:4,kind:'chest',phrase:'Community Chest'},
 {board:1,pos:2,kind:'chance',phrase:'Lucky Draw'},
 {board:1,pos:4,kind:'bonus',phrase:'Community Bonus'},
 {board:0,pos:8,kind:'trouble',phrase:'Setback Zone'},
 {board:2,pos:15,kind:'tax',phrase:'Storm Fund'},
 {board:2,pos:10,kind:'util',phrase:'Coastal Power'},
 {board:0,pos:2,kind:'rail',phrase:'Coastal Express'},
 {board:0,pos:0,kind:'start',phrase:'GO'}
];
for(const t of testCases){
 test(`special landing effect for ${t.kind} identifies ${t.phrase} and finishes after reveal`,()=>{
  const h=harness();
  const pending=t.kind==='chest'||t.kind==='chance'||t.kind==='bonus'||t.kind==='trouble' ?
   {playerId:'active',title:'Golden Ticket',description:'Collect $55 from the bank.',amount:55,emoji:'🎴'}:
   t.kind==='tax'?{playerId:'active',amount:125}:null;
  const state={phase:pending?.title==='Golden Ticket'?'card':t.kind==='tax'?'rent':'purchase',pending,players:[]};
  const roll={board:t.board,position:t.pos,playerId:'active',noMove:t.kind==='trouble'};
  const effect=h.ctx.miniWifiLandingEffectData(state,roll);
  assert.ok(effect);assert.equal(effect.kind,t.kind);
  if(['chest','chance','bonus','trouble'].includes(t.kind))assert.equal(effect.title,'Golden Ticket');
  else assert.ok(effect.title.includes(t.phrase));
  h.ctx.miniWifiRevealSpecial(state,roll);
  assert.ok(h.boardWrap.children.length===1,'Special overlay inserted into board');
  assert.equal(h.boardWrap.children[0].className,'miniwifi-special-overlay');
  assert.ok(h.tile.classList.contains('miniwifi-special-tile'),'Destination tile highlights');
  assert.equal(h.messages[0][0],'MINI_SPECIAL_START');
  assert.equal(h.messages.filter(x=>x[0]==='MINI_ANIMATION_DONE').length,0,'Popup must wait for the reveal');
  const [finish,delay]=h.scheduled.at(-1);assert.equal(delay,2100);
  finish();
  assert.equal(h.messages.at(-1)[0],'MINI_ANIMATION_DONE');
  assert.equal(h.boardWrap.children[0].removed,true);
  assert.equal(h.tile.classList.contains('miniwifi-special-tile'),false);
 });
}
test('normal property has no extra animation and immediately permits its purchase popup',()=>{
 const h=harness();const state={phase:'purchase'};const roll={board:0,position:1,playerId:'active'};
 assert.equal(h.ctx.miniWifiLandingEffectData(state,roll),null);
 h.ctx.miniWifiRevealSpecial(state,roll);
 assert.equal(h.messages.length,1);assert.equal(h.messages[0][0],'MINI_ANIMATION_DONE');
});
test('reduced motion preference skips special animation while unblocking card decision',()=>{
 const h=harness(true);const state={phase:'card',pending:{playerId:'active',title:'Surprise!',description:'Reward',amount:20}};
 h.ctx.miniWifiRevealSpecial(state,{board:0,position:4,playerId:'active'});
 assert.equal(h.boardWrap.children.length,0);
 assert.equal(h.messages.at(-1)[0],'MINI_ANIMATION_DONE');
 assert.equal(h.notices.length,1);
});
test('movement and dice complete before special animation; modal waits for the finish event',()=>{
 assert.match(board,/miniWifiAnimateDiceThenMove\(state,state\.lastRoll\)/);
 assert.match(board,/miniWifiRevealSpecial\(state,roll\)/);
 assert.match(board,/miniWifiStopAnimation\(false\)/);
 assert.match(board,/if\(hadMovement && notify\)miniWifiPost\('MINI_ANIMATION_DONE'\)/);
 const app=fs.readFileSync(path.join(project,'public/app.js'),'utf8');
 assert.match(app,/\['purchase','post','card','rent','bail'\]\.includes\(phase\)/);
 assert.match(app,/MINI_ANIMATION_DONE/);
});
