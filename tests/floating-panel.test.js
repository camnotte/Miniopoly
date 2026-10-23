'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../public/floating-panel.js'),'utf8');

function harness(saved=null,phone=false){
  function node(){
    const classes=new Set(),listeners={};
    return {hidden:false,style:{},firstElementChild:{},checked:false,
      classList:{add:c=>classes.add(c),remove:c=>classes.delete(c),contains:c=>classes.has(c),toggle(c,on){if(on)classes.add(c);else classes.delete(c);}},
      addEventListener:(name,fn)=>{listeners[name]=fn;},fire:(name,event={})=>listeners[name]?.(event),setAttribute(name,value){this[name]=value;},
      setPointerCapture(id){this.capture=id;},hasPointerCapture(id){return this.capture===id;},releasePointerCapture(){this.capture=null;}};
  }
  const elements=Object.fromEntries(['.panel-handle','.turn-panel-body','[data-panel-collapse]','[data-panel-keep]','[data-panel-dock]','[data-panel-quick]','[data-panel-title]'].map(key=>[key,node()]));
  const root=node();root.hidden=true;root.querySelector=key=>key===':focus-visible'?(root.focusVisible?{}:null):elements[key];
  Object.defineProperty(root,'offsetWidth',{get:()=>phone?340:292});
  Object.defineProperty(root,'offsetHeight',{get:()=>elements['.turn-panel-body'].hidden?54:500});
  const home={style:{},getBoundingClientRect:()=>({left:24,top:180})},reset=node();
  const timers=new Map();let id=0,written=null;
  const media={matches:phone,addEventListener(){}};
  const context={document:{documentElement:{clientWidth:phone?390:1440}},innerHeight:900,
    localStorage:{getItem:()=>JSON.stringify(saved),setItem:(_,value)=>{written=JSON.parse(value);}},
    matchMedia:()=>media,addEventListener(){},ResizeObserver:class{observe(){}},
    setTimeout(fn,delay){timers.set(++id,{fn,delay});return id;},clearTimeout:id=>timers.delete(id)};
  context.window=context;vm.createContext(context);vm.runInContext(source,context);
  const panel=new context.MiniopolyFloatingPanel(root,{storageKey:'test',home,reset});
  const state={visible:true,busy:false,blocked:false,title:'Your turn',attention:'room:turn:1'};
  return {panel,root,elements,home,reset,context,timers,state,get written(){return written;},tick(){const pending=[...timers.values()];timers.clear();for(const timer of pending)timer.fn();}};
}

test('idle fading yields to interaction, keyboard focus, live animation, dialogs and a new turn',()=>{
  const h=harness();h.panel.update(h.state);
  assert.equal([...h.timers.values()][0].delay,5000);
  h.tick();assert.ok(h.root.classList.contains('is-idle'));
  h.panel.update({...h.state});assert.ok(h.root.classList.contains('is-idle'),'unrelated live-state refresh does not keep waking the panel');
  h.root.fire('pointerenter');assert.ok(!h.root.classList.contains('is-idle'));
  h.panel.update({...h.state,busy:true});assert.equal(h.timers.size,0,'no fading during dice or movement');
  h.panel.update({...h.state,blocked:true});assert.equal(h.root.inert,true);assert.equal(h.timers.size,0);
  h.panel.update(h.state);h.root.focusVisible=true;h.tick();assert.ok(!h.root.classList.contains('is-idle'));
  h.root.focusVisible=false;h.panel.wake();h.tick();assert.ok(h.root.classList.contains('is-idle'));
  h.panel.update({...h.state,attention:'room:turn:2'});assert.ok(!h.root.classList.contains('is-idle'),'a new turn restores visibility');
  h.elements['[data-panel-keep]'].checked=true;h.elements['[data-panel-keep]'].fire('change');assert.equal(h.timers.size,0);
});

test('saved placement and dragging stay inside the viewport; collapse and reset remain recoverable',()=>{
  const h=harness({x:999,y:-999});h.panel.update(h.state);
  assert.equal(h.root.style.left,'1136px');assert.equal(h.root.style.top,'12px');
  const handle=h.elements['.panel-handle'];
  handle.fire('pointerdown',{button:0,pointerId:1,clientX:100,clientY:20});
  handle.fire('pointermove',{pointerId:1,clientX:-9999,clientY:9999});
  handle.fire('pointerup',{pointerId:1});
  assert.equal(h.root.style.left,'12px');assert.equal(h.root.style.top,'388px');
  assert.ok(h.written.x>=0&&h.written.x<=1&&h.written.y>=0&&h.written.y<=1);
  handle.fire('keydown',{key:'ArrowRight',shiftKey:true,preventDefault(){}});assert.equal(h.root.style.left,'52px');
  h.elements['[data-panel-collapse]'].fire('click');assert.equal(h.elements['.turn-panel-body'].hidden,true);assert.equal(h.elements['[data-panel-quick]'].hidden,false);
  h.reset.fire('click');assert.equal(h.root.style.left,'24px');assert.equal(h.root.style.top,'180px');assert.equal(h.elements['.turn-panel-body'].hidden,false);
});

test('phones start compact, snap between edges and retain desktop placement',()=>{
  const h=harness({x:.4,y:.5},true);h.panel.update(h.state);
  assert.equal(h.elements['.turn-panel-body'].hidden,true);assert.equal(h.root.style.left,'25px');assert.equal(h.root.style.top,'834px');
  h.elements['[data-panel-collapse]'].fire('click');assert.equal(h.root.style.top,'388px');
  h.elements['[data-panel-dock]'].fire('click');assert.equal(h.root.style.top,'12px');
  assert.equal(h.written.x,.4);assert.equal(h.written.y,.5);
  h.elements['.panel-handle'].fire('keydown',{key:'ArrowDown',preventDefault(){}});assert.equal(h.root.style.top,'388px');
});
