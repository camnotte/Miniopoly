'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {remainingRounds}=require('../public/match-lifecycle');
test('five-round countdown includes the current round and skips unlimited or finished games',()=>{
 for(let round=16;round<=20;round++)assert.equal(remainingRounds({stage:'playing',rounds:20,round}),21-round);
 assert.equal(remainingRounds({stage:'playing',rounds:0,round:99}),null);assert.equal(remainingRounds({stage:'finished',rounds:20,round:20}),null);
});
test('round notifications show once per round, defer during playback and never auto-dismiss the winner',()=>{
 const nodes=new Map(),saved=new Map(),timers=[];let returns=0;
 const ctx={window:{},document:{getElementById:id=>{if(!nodes.has(id))nodes.set(id,{hidden:true});return nodes.get(id);}},sessionStorage:{getItem:key=>saved.get(key),setItem:(k,v)=>saved.set(k,v)},setTimeout:(fn,ms)=>{timers.push({fn,ms});return timers.length;},clearTimeout(){}};
 vm.runInNewContext(fs.readFileSync(require.resolve('../public/match-lifecycle'),'utf8'),ctx);
 const live=new ctx.window.MiniopolyMatchLifecycle({onReturn:()=>returns++}),state={code:'ROOMAA',matchId:'match',stage:'playing',rounds:20,round:16};
 live.update(state,{busy:true});assert.equal(timers.length,0);live.update(state);assert.equal(nodes.get('roundCountdownNumber').textContent,'5');assert.equal(timers.length,1);live.update(state);assert.equal(timers.length,1);live.update({...state,round:17});assert.equal(nodes.get('roundCountdownNumber').textContent,'4');
 live.update({...state,round:17,rounds:30});assert.equal(nodes.get('roundCountdown').hidden,true);live.update({...state,round:17,rounds:20});assert.equal(nodes.get('roundCountdownNumber').textContent,'4');
 live.update({...state,round:17,rounds:18});assert.equal(nodes.get('roundCountdownNumber').textContent,'2');
 live.update({...state,stage:'finished'});const before=timers.length;live.update({...state,stage:'finished'});assert.equal(timers.length,before);assert.equal(returns,0);nodes.get('returnToRooms').onclick();assert.equal(returns,1);
});
