/* Small, original synthesized game sounds. No network, recordings or game-state writes. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MiniopolyPieceSounds=api;})(typeof window==='undefined'?globalThis:window,function(){
 'use strict';
 const TAU=Math.PI*2;
 const definitions=Object.freeze({
  '🐱':{kind:'cat',label:'Cat meow',duration:1.05,cadence:2700},
  '🐶':{kind:'dog',label:'Dog bark',duration:.72,cadence:2400},
  '🚗':{kind:'blimp',label:'Blimp propeller and air horn',duration:1.1,cadence:2800},
  '📱':{kind:'airplane',label:'Airplane propeller',duration:1.05,cadence:2100},
  '🦖':{kind:'trex',label:'T-Rex growl and stomp',duration:1,cadence:2200},
  '🛵':{kind:'shoes',label:'Shoe footstep',duration:.2,cadence:600},
  '🚀':{kind:'battleship',label:'Ship horn and water',duration:1.4,cadence:3000},
  '🎮':{kind:'hat',label:'Top Hat spring and sparkle',duration:.65,cadence:1800},
  car:{kind:'police',label:'Police engine and siren chirp',duration:.95,cadence:2600},
  'school-bus':{kind:'bus',label:'School bus engine and horn',duration:1.1,cadence:2800}
 });
 const resolve=value=>definitions[value]||null;
 const envelope=(t,d,attack=.025,release=.08)=>t<0||t>=d?0:Math.min(1,t/attack,(d-t)/release);
 function voiced(phase,f0,formants){
  let signal=0,weight=0;
  for(let n=1;n<=24;n++){
   const hz=n*f0;let band=.12/n;
   for(const [center,width,strength] of formants)band+=strength*Math.exp(-.5*((hz-center)/width)**2)/Math.sqrt(n);
   signal+=Math.sin(n*phase)*band;weight+=band;
  }
  return signal/Math.max(1,weight*.65);
 }
 function render(piece,{sampleRate=22050,occasion='movement'}={}){
  const info=resolve(piece);if(!info)return new Float32Array();
  const rate=Math.max(8000,Math.min(96000,Number(sampleRate)||22050)),data=new Float32Array(Math.ceil(info.duration*rate));
  let seed=0x713a52,low=0;
  const tone=(t,f,depth=.15)=>Math.sin(TAU*f*t)+depth*Math.sin(TAU*f*2*t);
  const horn=(t,start,d,f,gain=.25)=>{const x=t-start;return gain*envelope(x,d,.055,.12)*(tone(x,f,.36)+.26*Math.sin(TAU*(f*1.502)*x));};
  for(let i=0;i<data.length;i++){
   const t=i/rate;seed=(Math.imul(seed,1664525)+1013904223)>>>0;const noise=seed/2147483648-1;low+=.065*(noise-low);let s=0;
   switch(info.kind){
    case 'shoes':s=envelope(t,.19,.003,.13)*(.48*low+.25*Math.sin(TAU*(105*t-160*t*t))*Math.exp(-t*22));break;
    case 'dog':for(const start of [0,.33]){const x=t-start,d=.27;if(x>=0&&x<d){const f=190-90*x/d,phase=TAU*(190*x-45*x*x/d);s+=envelope(x,d,.008,.09)*(.45*voiced(phase,f,[[520,160,1],[1280,260,.6],[2450,380,.24]])+.2*noise)*(.85+.15*Math.sin(TAU*37*x));}}break;
    case 'cat':{const d=1,x=t/d,f=430+260*Math.sin(Math.PI*x)-140*x,phase=TAU*(430*t+260*d/Math.PI*(1-Math.cos(Math.PI*x))-70*t*t/d);s=envelope(t,d,.08,.18)*(.45*voiced(phase,f,[[700,190,.6],[1420,260,1],[2400,380,.25]])+.025*noise);break;}
    case 'battleship':s=horn(t,.1,1.1,110,.27)+horn(t,.12,1.08,146.83,.16)+low*.16*envelope(t,1.4,.06,.22);break;
    case 'bus':s=.12*envelope(t,1.05,.04,.18)*(tone(t,54,.4)+.4*low)*(1+.2*Math.sin(TAU*16*t))+horn(t,.18,.25,293.66,.2)+horn(t,.57,.32,349.23,.18);break;
    case 'police':s=.11*envelope(t,.9,.035,.15)*(tone(t,70,.5)+low)+.11*envelope(t-.12,.62,.045,.12)*Math.sin(TAU*(530*t+70/(TAU*2.5)*Math.sin(TAU*2.5*t)));break;
    case 'airplane':s=.2*envelope(t,1.02,.1,.18)*((.65+.35*Math.sin(TAU*26*t))*(tone(t,95,.5)+.15*Math.sin(TAU*191*t))+.35*low);break;
    case 'blimp':s=.16*envelope(t,1.05,.12,.18)*(tone(t,47,.4)+.22*noise)*(1+.2*Math.sin(TAU*14*t))+(occasion==='celebration'?horn(t,.25,.52,220,.16):0);break;
    case 'trex':s=envelope(t,.84,.06,.2)*(.27*voiced(TAU*(84*t-15*t*t),84-30*t,[[270,150,1],[750,230,.6],[1500,400,.2]])+.14*low)*(1+.26*Math.sin(TAU*31*t));for(const a of [.1,.64])s+=envelope(t-a,.2,.005,.14)*.16*Math.sin(TAU*62*(t-a))*Math.exp(-Math.max(0,t-a)*10);break;
    case 'hat':s=.28*envelope(t,.5,.008,.22)*Math.sin(TAU*(170*t+115*(1-Math.exp(-8*t))));s+=.06*envelope(t-.23,.35,.01,.2)*tone(t,1046.5,.1);break;
   }
   // Keep every asset bounded and leave room for the existing dice/music mix.
   data[i]=Math.max(-.65,Math.min(.65,s))*.7;
  }
  return data;
 }
 let sharedContext=null;
 function browserContext(){if(!sharedContext){const AC=typeof window!=='undefined'&&(window.AudioContext||window.webkitAudioContext);if(AC)sharedContext=new AC();}return sharedContext;}
 class Engine{
  constructor({getPreferences=()=>({sound:true,volume:100}),getContext=browserContext,document:doc=typeof document==='undefined'?null:document,setTimeout:later=(fn,ms)=>globalThis.setTimeout(fn,ms),clearTimeout:cancel=id=>globalThis.clearTimeout(id)}={}){
   Object.assign(this,{getPreferences,getContext,doc,later,cancel});this.activity=null;this.timer=null;this.sources=new Set();this.buffers=new Map();this.serial=0;this.context=null;this.master=null;this.playCount=0;
   this.gesture=()=>void this.unlock();this.visibility=()=>this.sync();
   doc?.addEventListener('pointerdown',this.gesture,{capture:true,passive:true});doc?.addEventListener('keydown',this.gesture,{capture:true});doc?.addEventListener('visibilitychange',this.visibility);
  }
  allowed(){const p=this.getPreferences()||{};return p.sound!==false&&Number(p.volume??100)>0&&!this.doc?.hidden;}
  async unlock(){
   if(!this.allowed())return;
   try{if(!this.context||this.context.state==='closed')this.context=this.getContext();if(!this.context)return;if(this.context.state==='suspended')await this.context.resume();this.sync();}catch{/* Browser permission to play is granted by an actual user gesture. */}
  }
  gain(){const level=Math.max(0,Math.min(100,Number(this.getPreferences()?.volume??100)||0))/100;if(this.master)this.master.gain.value=level*.62;return level;}
  silence(){if(this.timer!==null)this.cancel(this.timer);this.timer=null;for(const source of this.sources){try{source.stop();}catch{}source.disconnect?.();}this.sources.clear();}
  stop(){this.serial++;this.activity=null;this.silence();}
  startMovement(piece){if(!resolve(piece)){this.stop();return;}if(this.activity?.type==='movement'&&this.activity.piece===piece)return;this.stop();this.activity={type:'movement',piece};this.sync();}
  startCelebration(pieces){const choices=pieces.filter(piece=>resolve(piece));this.stop();if(choices.length)this.activity={type:'celebration',pieces:choices,index:0};this.sync();}
  sync(){
   this.gain();if(!this.activity||!this.allowed()||this.context?.state!=='running'){this.silence();return;}
   if(this.timer===null)this.pulse();
  }
  pulse(){
   if(!this.activity||!this.allowed()||this.context?.state!=='running'){this.silence();return;}
   const job=this.activity,piece=job.type==='movement'?job.piece:job.pieces[job.index++%job.pieces.length];this.play(piece,job.type);
   const identity=this.serial,delay=job.type==='celebration'?4000:resolve(piece).cadence;
   this.timer=this.later(()=>{this.timer=null;if(identity===this.serial)this.pulse();},delay);
  }
  play(piece,occasion='movement'){
   if(!this.allowed()||this.context?.state!=='running'||!resolve(piece))return false;
   try{
    if(!this.master){this.master=this.context.createGain();this.master.connect(this.context.destination);}this.gain();
    const key=piece+':'+occasion;let buffer=this.buffers.get(key);
    if(!buffer){const samples=render(piece,{sampleRate:this.context.sampleRate,occasion});buffer=this.context.createBuffer(1,samples.length,this.context.sampleRate);buffer.getChannelData(0).set(samples);this.buffers.set(key,buffer);}
    const source=this.context.createBufferSource();source.buffer=buffer;source.connect(this.master);this.sources.add(source);source.onended=()=>{this.sources.delete(source);source.disconnect?.();};source.start();this.playCount++;return true;
   }catch{return false;}
  }
  dispose(){this.stop();this.doc?.removeEventListener('pointerdown',this.gesture,true);this.doc?.removeEventListener('keydown',this.gesture,true);this.doc?.removeEventListener('visibilitychange',this.visibility);this.master?.disconnect?.();}
 }
 return Object.freeze({definitions,resolve,render,Engine,unlockedContext:()=>sharedContext?.state==='running'?sharedContext:null});
});
