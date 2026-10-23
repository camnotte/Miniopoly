'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const board=fs.readFileSync(path.join(__dirname,'../public/board-v5-42.html'),'utf8');
const source=board.slice(board.indexOf('function miniWifiUnlockAudio()'),board.indexOf('function miniWifiCancelDicePlayback()'));
function harness(enabled,state='running'){
 const calls={noise:0,tones:0,stops:[],ramps:[],resume:0};
 function node(){return {connect(){return this},frequency:{setValueAtTime(){},exponentialRampToValueAtTime(...v){calls.ramps.push(v)}},gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},Q:{value:0},start(){},stop(t){calls.stops.push(t)}};}
 const audio={state,currentTime:10,sampleRate:100,destination:{},resume(){calls.resume++;this.state='running';return Promise.resolve()},createBuffer(ch,n){return {getChannelData:()=>new Float32Array(n)}},createBufferSource(){calls.noise++;return node()},createBiquadFilter:node,createGain:node,createOscillator(){calls.tones++;return node()}};
 const ctx={miniWifiAudioDestination:()=>audio.destination,soundEnabled:enabled,audioCtx:audio,window:{AudioContext:function(){return audio}},Math};vm.createContext(ctx);vm.runInContext(source,ctx);return {ctx,calls,audio};
}
test('world-shift sound respects mute and never creates audio nodes when muted',()=>{const h=harness(false);h.ctx.miniWifiPlayShiftSound();assert.equal(h.calls.noise,0);assert.equal(h.calls.tones,0);assert.equal(h.calls.resume,0)});
test('unlocked world shift creates one bounded whoosh and three resolving chimes',()=>{const h=harness(true);h.ctx.miniWifiPlayShiftSound();assert.equal(h.calls.noise,1);assert.equal(h.calls.tones,3);assert.ok(h.calls.stops.every(t=>t<=13));assert.ok(h.calls.ramps.some(([hz])=>hz===170));assert.ok(h.calls.ramps.some(([hz])=>hz===2600));});
test('sound can resume after a permitted browser interaction',()=>{const h=harness(true,'suspended');h.ctx.miniWifiUnlockAudio();assert.equal(h.calls.resume,1);assert.equal(h.audio.state,'running')});
test('between-player whoosh and chimes finish within the one-second handoff',()=>{const h=harness(true);h.ctx.miniWifiPlayShiftSound(true);assert.equal(h.calls.noise,1);assert.equal(h.calls.tones,3);assert.ok(h.calls.stops.every(t=>t<=11));assert.ok(h.calls.ramps.every(([,t])=>t<=11));const muted=harness(false);muted.ctx.miniWifiPlayShiftSound(true);assert.equal(muted.calls.noise,0);assert.equal(muted.calls.tones,0)});
test('personal volume uses one master gain and applies zero volume without changing sound effects',()=>{
  let connections=0;const gain={gain:{value:1},connect(){connections++;}},ctx={miniWifiMasterGain:null,miniWifiVolume:.25,audioCtx:{destination:{},createGain:()=>gain}};
  vm.createContext(ctx);vm.runInContext(board.slice(board.indexOf('function miniWifiAudioDestination('),board.indexOf('function miniWifiCancelGravity(')),ctx);
  assert.equal(ctx.miniWifiAudioDestination(),gain);assert.equal(gain.gain.value,.25);
  ctx.miniWifiVolume=0;assert.equal(ctx.miniWifiAudioDestination(),gain);assert.equal(gain.gain.value,0);assert.equal(connections,1);
});
