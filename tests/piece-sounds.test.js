'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {definitions,render,Engine}=require('../public/piece-sounds'),pieces=require('../public/game-pieces');
function harness({sound=true,volume=100,state='running'}={}){
 const prefs={sound,volume},timers=new Map(),listeners=new Map(),calls={buffers:0,starts:0,stops:0,resumes:0};let serial=0;
 const doc={hidden:false,addEventListener(type,fn){listeners.set(type,fn);},removeEventListener(type){listeners.delete(type);}};
 const context={state,sampleRate:8000,destination:{},resume(){calls.resumes++;this.state='running';return Promise.resolve();},createGain(){return {gain:{value:0},connect(){},disconnect(){}};},createBuffer(_ch,len){calls.buffers++;const a=new Float32Array(len);return {getChannelData:()=>a};},createBufferSource(){return {connect(){},disconnect(){},start(){calls.starts++;},stop(){calls.stops++;}};}};
 const engine=new Engine({document:doc,getPreferences:()=>prefs,getContext:()=>context,setTimeout(fn,ms){const id=++serial;timers.set(id,{fn,ms});return id;},clearTimeout(id){timers.delete(id);}});
 const tick=()=>{assert.equal(timers.size,1);const [id,{fn}]=timers.entries().next().value;timers.delete(id);fn();};
 return {engine,prefs,timers,listeners,calls,context,doc,tick};
}
test('all ten available pieces have distinct bounded, non-silent original sound assets',()=>{
 const peaks=new Set();assert.equal(Object.keys(definitions).length,pieces.choices.length);
 for(const p of pieces.choices){const info=definitions[p.symbol];assert.ok(info,p.name);const a=render(p.symbol,{sampleRate:22050});assert.equal(a.length,Math.ceil(info.duration*22050));let energy=0,peak=0;for(const x of a){assert.ok(Number.isFinite(x));energy+=x*x;peak=Math.max(peak,Math.abs(x));}assert.ok(peak<.66&&peak>.05,p.name);assert.ok(Math.sqrt(energy/a.length)>.02,p.name);peaks.add(peak.toFixed(5));assert.ok(Math.abs(a[0])<.001);assert.ok(Math.abs(a.at(-1))<.004,p.name+' fades out');}
 assert.equal(peaks.size,10);assert.equal(render('unknown').length,0);
});
test('muted, zero-volume, suspended and gesture-unlocked playback follow the existing preferences',async()=>{
 for(const options of [{sound:false},{volume:0},{state:'suspended'}]){const h=harness(options);h.engine.startMovement('🐶');assert.equal(h.calls.starts,0);assert.equal(h.timers.size,0);assert.equal(h.calls.buffers,0);await h.engine.unlock();if(options.state==='suspended'){assert.equal(h.calls.starts,1);assert.equal(h.calls.resumes,1);}else assert.equal(h.calls.starts,0);h.engine.dispose();}
});
test('movement uses per-piece cadence, caches assets and never duplicates the active loop',async()=>{
 const h=harness();await h.engine.unlock();h.engine.startMovement('🛵');assert.equal(h.calls.starts,1);assert.equal(h.timers.values().next().value.ms,600);h.engine.startMovement('🛵');h.engine.sync();assert.equal(h.calls.starts,1);h.tick();assert.equal(h.calls.starts,2);assert.equal(h.calls.buffers,1);h.engine.startMovement('school-bus');assert.equal(h.calls.starts,4);assert.equal(h.timers.size,0);assert.equal(h.engine.playHistory.at(-1).loop,true);assert.ok(h.calls.stops>=2);h.engine.stop();assert.equal(h.timers.size,0);assert.equal(h.engine.sources.size,0);
});
test('mute and hidden tabs cancel current sources; re-enable resumes one loop with current volume',async()=>{
 const h=harness();await h.engine.unlock();h.engine.startMovement('🚀');h.prefs.volume=25;h.engine.sync();assert.equal(h.engine.master.gain.value,.25*.62);assert.equal(h.timers.size,1);
 h.prefs.sound=false;h.engine.sync();assert.equal(h.timers.size,0);assert.equal(h.engine.sources.size,0);h.prefs.sound=true;h.engine.sync();assert.equal(h.timers.size,0);assert.equal(h.calls.starts,2);
 h.doc.hidden=true;h.listeners.get('visibilitychange')();assert.equal(h.timers.size,0);assert.equal(h.engine.sources.size,0);h.doc.hidden=false;h.listeners.get('visibilitychange')();assert.equal(h.timers.size,0);assert.equal(h.calls.starts,3);h.engine.dispose();assert.equal(h.timers.size,0);assert.equal(h.listeners.size,0);
});
test('celebration plays one winner at a time every four seconds, stops on exit and cannot revive from a stale timer',async()=>{
 const h=harness();await h.engine.unlock();h.engine.startCelebration(['🚀','school-bus','invalid']);assert.equal(h.calls.starts,1);assert.equal(h.timers.values().next().value.ms,4000);const stale=h.timers.values().next().value.fn;h.tick();assert.equal(h.calls.starts,2);assert.equal(h.calls.buffers,2);h.engine.stop();stale();assert.equal(h.timers.size,0);assert.equal(h.calls.starts,2);assert.equal(h.engine.sources.size,0);
});
test('default timers work with browser receiver requirements and cancel without an Illegal invocation',async()=>{
 const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),sandbox={module:{exports:{}}};vm.createContext(sandbox);
 vm.runInContext("globalThis.outstanding=0;globalThis.setTimeout=function(fn,ms){'use strict';if(this!==globalThis)throw TypeError('Illegal invocation');outstanding++;return 1;};globalThis.clearTimeout=function(id){'use strict';if(this!==globalThis)throw TypeError('Illegal invocation');outstanding--;};",sandbox);
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../public/piece-sounds.js'),'utf8'),sandbox);
 const h=harness(),engine=new sandbox.module.exports.Engine({document:null,getContext:()=>h.context});await engine.unlock();engine.startMovement('🐶');assert.equal(sandbox.outstanding,1);assert.equal(h.calls.starts,1);engine.stop();assert.equal(sandbox.outstanding,0);assert.equal(engine.sources.size,0);
});

test('ship has one departure horn, one continuous water loop, then the supplied bell only on arrival',async()=>{
 const h=harness();await h.engine.unlock();const bell={name:'supplied-ship-bell'};h.engine.recordings.set('ship-bell',bell);
 h.engine.startMovement('🚀');assert.deepEqual(h.engine.playHistory.map(x=>x.phase),['departure']);h.tick();assert.equal(h.engine.playHistory.at(-1).phase,'travel');assert.equal(h.engine.playHistory.at(-1).loop,true);assert.equal(h.timers.size,0);
 for(let i=0;i<10;i++)h.engine.sync();assert.equal(h.calls.starts,2,'Preference updates cannot layer water or repeat the horn');
 h.engine.arrive('🚀');assert.equal(h.engine.playHistory.at(-1).recording,'ship-bell');assert.equal(h.engine.playHistory.at(-1).phase,'arrival');assert.equal(h.engine.sources.size,1);assert.equal([...h.engine.sources][0].buffer,bell);assert.equal(h.engine.activity,null);assert.equal(h.timers.size,0);h.engine.stop();assert.equal(h.engine.sources.size,0);
});
test('T-Rex plays the supplied screech once and recorded stomps until arrival; cancellation cannot ring a ship bell',async()=>{
 const h=harness();await h.engine.unlock();h.engine.recordings.set('trex-screech',{name:'screech'});h.engine.recordings.set('trex-stomp',{name:'stomp'});
 h.engine.startMovement('🦖');assert.equal([...h.engine.sources][0].buffer.name,'screech');assert.equal(h.timers.values().next().value.ms,1200);h.tick();assert.equal(h.engine.playHistory.at(-1).recording,'trex-stomp');h.tick();assert.equal(h.engine.playHistory.filter(x=>x.recording==='trex-screech').length,1);
 const stale=h.timers.values().next().value.fn;h.engine.arrive('🦖');const count=h.calls.starts;stale();assert.equal(h.calls.starts,count);assert.equal(h.timers.size,0);assert.equal(h.engine.sources.size,0);
 h.engine.startMovement('🚀');h.engine.stop();assert.ok(!h.engine.playHistory.some(x=>x.phase==='arrival'));
});
test('earthquake effect respects sound, volume, hidden state and cleanup without starting a movement loop',async()=>{
 const h=harness();await h.engine.unlock();assert.equal(h.engine.playEffect('earthquake'),true);assert.equal(h.engine.activity,null);assert.equal(h.timers.size,0);assert.equal(h.engine.playHistory.at(-1).piece,'earthquake');h.prefs.sound=false;h.engine.sync();assert.equal(h.engine.sources.size,0);assert.equal(h.engine.playEffect('earthquake'),false);
 h.prefs.sound=true;h.prefs.volume=0;assert.equal(h.engine.playEffect('earthquake'),false);h.prefs.volume=100;h.doc.hidden=true;assert.equal(h.engine.playEffect('earthquake'),false);h.engine.dispose();
});
test('a late recording decode never plays after the movement was cancelled',async()=>{
 const h=harness();const decoded=[];h.engine.fetchAsset=async()=>({ok:true,arrayBuffer:async()=>new ArrayBuffer(1)});h.context.decodeAudioData=()=>new Promise(resolve=>decoded.push(resolve));await h.engine.unlock();h.engine.startMovement('🦖');await new Promise(resolve=>setImmediate(resolve));h.engine.stop();for(const resolve of decoded)resolve({name:'late-recording'});await new Promise(resolve=>setImmediate(resolve));assert.equal(h.calls.starts,0);assert.equal(h.engine.sources.size,0);assert.equal(h.timers.size,0);
});
test('bus and police layer one radio call over one continuous bed, without replaying speech after mute',async()=>{
 for(const [piece,prefix] of [['school-bus','bus'],['car','police']]){
  const h=harness();await h.engine.unlock();h.engine.recordings.set(prefix+'-departure',{name:'radio'});h.engine.recordings.set(prefix+'-travel',{name:'bed'});h.engine.startMovement(piece);assert.deepEqual(h.engine.playHistory.map(x=>x.recording),[prefix+'-departure',prefix+'-travel']);assert.deepEqual(h.engine.playHistory.map(x=>x.loop),[false,true]);for(let i=0;i<6;i++)h.engine.sync();assert.equal(h.calls.starts,2);assert.equal(h.timers.size,0);
  h.prefs.sound=false;h.engine.sync();assert.equal(h.engine.sources.size,0);h.prefs.sound=true;h.engine.sync();assert.equal(h.engine.playHistory.filter(x=>x.recording===prefix+'-departure').length,1);assert.equal(h.engine.sources.size,1);h.engine.arrive(piece);assert.equal(h.engine.sources.size,0);h.engine.dispose();
 }
});
test('parallel radio and ambience decoding both play, but late cancelled audio cannot restart',async()=>{
 const h=harness(),pending=new Map();h.engine.fetchAsset=async url=>({ok:true,arrayBuffer:async()=>new TextEncoder().encode(url).buffer});h.context.decodeAudioData=buffer=>new Promise(resolve=>pending.set(new TextDecoder().decode(buffer).split('/').at(-1).replace('.mp3',''),resolve));await h.engine.unlock();h.engine.startMovement('school-bus');await new Promise(r=>setImmediate(r));pending.get('bus-travel')({name:'engine'});await new Promise(r=>setImmediate(r));pending.get('bus-departure')({name:'radio'});await new Promise(r=>setImmediate(r));assert.deepEqual(h.engine.playHistory.map(x=>x.recording),['bus-travel','bus-departure']);assert.equal(h.engine.sources.size,2);h.engine.stop();const starts=h.calls.starts;for(const resolve of pending.values())resolve({name:'late'});await new Promise(r=>setImmediate(r));assert.equal(h.calls.starts,starts);assert.equal(h.engine.sources.size,0);h.engine.dispose();
});
