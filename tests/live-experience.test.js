'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {turnKey}=require('../public/live-experience');
const room={code:'AB7CD9',matchId:'match1',turnNumber:3,round:2,stage:'playing',phase:'roll',turn:1,bonusCount:0,players:[{id:'a'},{id:'b'}]};
test('turn notices apply only to a player ready to roll',()=>{assert.equal(turnKey(null),'');for(const phase of ['lobby','purchase','card','rent','bail','post','end'])assert.equal(turnKey({...room,phase}),'');assert.equal(turnKey({...room,stage:'finished'}),'');assert.ok(turnKey(room));});
test('turn notices deduplicate chat and cash updates, but identify bonus rolls and rematches',()=>{const key=turnKey(room);assert.equal(turnKey({...room,chat:[{text:'hello'}],players:[{id:'a',cash:1400},{id:'b',cash:1200}]}),key);for(const change of [{turnNumber:4},{matchId:'match2'},{turn:0},{bonusCount:1},{code:'ZX7CD9'}])assert.notEqual(turnKey({...room,...change}),key);});

function noticeHarness(){
  const fs=require('node:fs'),vm=require('node:vm');
  const context={window:{},setTimeout:()=>{throw Error('A ready turn must not expire on a timer');}};
  vm.runInNewContext(fs.readFileSync(require.resolve('../public/live-experience'),'utf8'),context);
  const notices=new Map();let pulses=0;
  const instance=Object.create(context.window.MiniopolyLiveExperience.prototype);
  Object.assign(instance,{room:room.code,lastTurn:'',launcher:{},notice:{hidden:true,style:{setProperty(){}},classList:{remove(){},add(){pulses++;}},offsetWidth:1},node:id=>{if(!notices.has(id))notices.set(id,{});return notices.get(id);},renderChat(){},updateModalSemantics(){},position(){}});
  const update=extra=>instance.update({state:room,auth:{code:room.code},boardReady:true,animating:false,loading:false,...extra});
  return {instance,update,pulses:()=>pulses};
}

test('compact ready-turn notice persists across live refreshes and submission/spin, then hides during travel',()=>{
  const h=noticeHarness();h.update();assert.equal(h.instance.notice.hidden,false);
  for(let i=0;i<5;i++)h.update({state:{...room,chat:[{text:'hello '+i}]}});
  assert.equal(h.instance.notice.hidden,false);assert.equal(h.pulses(),1);
  h.update({rollPending:true,loading:true});assert.equal(h.instance.notice.hidden,false);
  h.update({diceSpinning:true,animating:true,state:{...room,phase:'post'}});assert.equal(h.instance.notice.hidden,false);
  h.update({animating:true,state:{...room,phase:'post'}});assert.equal(h.instance.notice.hidden,true);
  h.update({state:{...room,phase:'purchase'}});assert.equal(h.instance.notice.hidden,true);
  h.update({state:{...room,phase:'end'}});assert.equal(h.instance.notice.hidden,true);
});

test('failed roll restores the same notice without replaying the pulse; bonus and rematch announce anew',()=>{
  const h=noticeHarness();h.update();h.update({rollPending:true,loading:true});
  h.update();assert.equal(h.instance.notice.hidden,false);assert.equal(h.pulses(),1);
  h.update({state:{...room,bonusCount:1}});assert.equal(h.instance.notice.hidden,false);assert.equal(h.pulses(),2);
  h.update({state:{...room,matchId:'next-match'}});assert.equal(h.pulses(),3);
  h.update({state:{...room,stage:'finished'}});assert.equal(h.instance.notice.hidden,true);
});
