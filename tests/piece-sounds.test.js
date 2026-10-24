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
 const h=harness();await h.engine.unlock();h.engine.startMovement('🛵');assert.equal(h.calls.starts,1);assert.equal(h.timers.values().next().value.ms,600);h.engine.startMovement('🛵');h.engine.sync();assert.equal(h.calls.starts,1);h.tick();assert.equal(h.calls.starts,2);assert.equal(h.calls.buffers,1);h.engine.startMovement('school-bus');assert.equal(h.calls.starts,3);assert.equal(h.timers.size,1);assert.equal(h.timers.values().next().value.ms,2800);assert.ok(h.calls.stops>=2);h.engine.stop();assert.equal(h.timers.size,0);assert.equal(h.engine.sources.size,0);
});
test('mute and hidden tabs cancel current sources; re-enable resumes one loop with current volume',async()=>{
 const h=harness();await h.engine.unlock();h.engine.startMovement('🚀');h.prefs.volume=25;h.engine.sync();assert.equal(h.engine.master.gain.value,.25*.62);assert.equal(h.timers.size,1);
 h.prefs.sound=false;h.engine.sync();assert.equal(h.timers.size,0);assert.equal(h.engine.sources.size,0);h.prefs.sound=true;h.engine.sync();assert.equal(h.timers.size,1);assert.equal(h.calls.starts,2);
 h.doc.hidden=true;h.listeners.get('visibilitychange')();assert.equal(h.timers.size,0);assert.equal(h.engine.sources.size,0);h.doc.hidden=false;h.listeners.get('visibilitychange')();assert.equal(h.timers.size,1);assert.equal(h.calls.starts,3);h.engine.dispose();assert.equal(h.timers.size,0);assert.equal(h.listeners.size,0);
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
