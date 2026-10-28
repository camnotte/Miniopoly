/* Personal sound presentation: supplied local clips and original synthesized effects. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MiniopolyPieceSounds=api;})(typeof window==='undefined'?globalThis:window,function(){
 'use strict';
 const TAU=Math.PI*2;
 const definitions=Object.freeze({
  '🐱':{kind:'cat',label:'Cat meow',duration:1.05,cadence:2700},
  '🐶':{kind:'dog',label:'Dog bark',duration:.72,cadence:2400},
  '🚗':{kind:'blimp',label:'Blimp propeller',duration:1.1,cadence:2800},
  '📱':{kind:'airplane',label:'Airplane propeller',duration:1.05,cadence:2100},
  '🦖':{kind:'trex',label:'Cinematic dinosaur roar, then footsteps',duration:1,cadence:2200},
  '🛵':{kind:'shoes',label:'Shoe footstep',duration:.2,cadence:600},
  '🚀':{kind:'battleship',label:'Departure horn, water, arrival bell',duration:1.4,cadence:3000},
  '🎮':{kind:'hat',label:'Top Hat cloth flutter',duration:.65,cadence:1800},
  car:{kind:'police',label:'Police siren, engine and radio',duration:.95,cadence:2600},
  'school-bus':{kind:'bus',label:'School bus pupils, engine and radio',duration:1.1,cadence:2800}
 });
 const effects={tsunami:{kind:'tsunami',duration:4.2},earthquake:{kind:'earthquake',duration:.75},trade:{kind:'trade',duration:.65}};
 const radioCalls=Object.freeze({"car": [{"asset": "police-departure", "text": "Dispatch, unit seven. On patrol. All clear. Over."}, {"asset": "police-radio-2", "text": "Dispatch, unit seven. Checking the waterfront. Over."}, {"asset": "police-radio-3", "text": "Base, unit seven. Traffic is moving. Over."}, {"asset": "police-radio-4", "text": "Dispatch, unit seven. Back on patrol. Over."}, {"asset": "police-radio-5", "text": "Base, unit seven. Neighborhood clear. Over."}], "school-bus": [{"asset": "bus-departure", "text": "Base, bus twelve. All aboard. Back on route. Over."}, {"asset": "bus-radio-2", "text": "Base, bus twelve. Next stop, school. Over."}, {"asset": "bus-radio-3", "text": "Base, bus twelve. All students seated. Over."}, {"asset": "bus-radio-4", "text": "Base, bus twelve. Route running on time. Over."}, {"asset": "bus-radio-5", "text": "Base, bus twelve. Returning to school. Over."}]});
 const recordings=Object.fromEntries(['tsunami-surge','trex-screech','trex-stomp','ship-bell','ship-water','bus-departure','bus-travel','police-departure','police-travel','cat-meow','dog-bark','airplane-travel','blimp-travel','shoe-step','hat-flutter',...Object.values(radioCalls).flat().map(call=>call.asset)].map(name=>[name,'/audio/'+name+'.mp3']));
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
 function render(piece,{sampleRate=22050,occasion='movement',phase='departure'}={}){
  const info=resolve(piece)||effects[piece];if(!info)return new Float32Array();
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
    case 'battleship':if(phase==='arrival'){s=envelope(t,1.4,.004,.4)*Math.exp(-t*2)*(.28*tone(t,880,.3)+.13*tone(t,1397,.1));break;}s=(phase==='departure'?horn(t,.02,1.1,110,.27)+horn(t,.04,1.08,146.83,.16):0)+(.3*low+.05*noise)*envelope(t,1.4,.06,.12);break;
    case 'bus':s=.12*envelope(t,1.05,.04,.18)*(tone(t,54,.4)+.4*low)*(1+.2*Math.sin(TAU*16*t))+horn(t,.18,.25,293.66,.2)+horn(t,.57,.32,349.23,.18);break;
    case 'police':s=.11*envelope(t,.9,.035,.15)*(tone(t,70,.5)+low)+.11*envelope(t-.12,.62,.045,.12)*Math.sin(TAU*(530*t+70/(TAU*2.5)*Math.sin(TAU*2.5*t)));break;
    case 'airplane':s=.2*envelope(t,1.02,.1,.18)*((.65+.35*Math.sin(TAU*26*t))*(tone(t,95,.5)+.15*Math.sin(TAU*191*t))+.35*low);break;
    case 'blimp':s=.16*envelope(t,1.05,.12,.18)*(tone(t,47,.4)+.22*noise)*(1+.2*Math.sin(TAU*14*t))+(occasion==='celebration'?horn(t,.25,.52,220,.16):0);break;
    case 'trex':if(phase==='travel'){s=envelope(t,.32,.004,.26)*(.42*Math.sin(TAU*57*t)*Math.exp(-t*14)+.2*low);break;}s=envelope(t,.84,.06,.2)*(.27*voiced(TAU*(84*t-15*t*t),84-30*t,[[270,150,1],[750,230,.6],[1500,400,.2]])+.14*low)*(1+.26*Math.sin(TAU*31*t));for(const a of [.1,.64])s+=envelope(t-a,.2,.005,.14)*.16*Math.sin(TAU*62*(t-a))*Math.exp(-Math.max(0,t-a)*10);break;
    case 'trade':for(const [start,f] of [[0,659.25],[.16,830.61],[.32,987.77]]){const x=t-start;s+=.24*envelope(x,.3,.012,.16)*Math.exp(-Math.max(0,x)*5)*tone(x,f,.1);}break;
    case 'tsunami':s=envelope(t,4.2,.65,1.3)*(.7*low+.14*noise)*(.55+.45*Math.sin(Math.PI*t/4.2));break;
    case 'earthquake':s=envelope(t,.75,.035,.2)*(.52*low+.2*Math.sin(TAU*(39*t-8*t*t))+.08*noise)*( .7+.3*Math.sin(TAU*13*t));break;
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
  constructor({random=Math.random,getPreferences=()=>({sound:true,volume:100}),getContext=browserContext,document:doc=typeof document==='undefined'?null:document,setTimeout:later=(fn,ms)=>globalThis.setTimeout(fn,ms),clearTimeout:cancel=id=>globalThis.clearTimeout(id),fetchAsset=typeof window==='undefined'?null:(url=>fetch(url))}={}){
   Object.assign(this,{random,getPreferences,getContext,doc,later,cancel,fetchAsset});this.lastRadio={};this.activity=null;this.timer=null;this.sources=new Set();this.buffers=new Map();this.serial=0;this.context=null;this.master=null;this.playCount=0;this.recordings=new Map();this.pendingRecordings=new Map();this.playHistory=[];
   this.gesture=()=>void this.unlock();this.visibility=()=>this.sync();
   doc?.addEventListener('pointerdown',this.gesture,{capture:true,passive:true});doc?.addEventListener('keydown',this.gesture,{capture:true});doc?.addEventListener('visibilitychange',this.visibility);
  }
  allowed(){const p=this.getPreferences()||{};return p.sound!==false&&Number(p.volume??100)>0&&!this.doc?.hidden;}
  async unlock(){
   if(!this.allowed())return;
   try{if(!this.context||this.context.state==='closed')this.context=this.getContext();if(!this.context)return;if(this.context.state==='suspended')await this.context.resume();this.preload();this.sync();}catch{/* Browser permission to play is granted by an actual user gesture. */}
  }
  gain(){const level=Math.max(0,Math.min(100,Number(this.getPreferences()?.volume??100)||0))/100;if(this.master)this.master.gain.value=level*.62;return level;}
  silence(){if(this.activity){this.activity.waterPlaying=false;this.activity.bedPlaying=false;}if(this.timer!==null)this.cancel(this.timer);this.timer=null;for(const source of this.sources){try{source.stop();}catch{}source.disconnect?.();}this.sources.clear();}
  stop(){this.serial++;this.activity=null;this.silence();}
  startMovement(piece){if(!resolve(piece)){this.stop();return;}if(this.activity?.type==='movement'&&this.activity.piece===piece)return;this.stop();this.activity={type:'movement',piece,departed:false,radioClip:this.chooseRadio(piece)};this.sync();}
  chooseRadio(piece){
   const all=radioCalls[piece];if(!all)return null;
   const choices=all.filter(call=>call.asset!==this.lastRadio[piece]);
   const index=Math.min(choices.length-1,Math.max(0,Math.floor(this.random()*choices.length)));
   return this.lastRadio[piece]=choices[index].asset;
  }
  startCelebration(pieces){const choices=pieces.filter(piece=>resolve(piece));this.stop();if(choices.length)this.activity={type:'celebration',pieces:choices,index:0};this.sync();}
  sync(){
   this.gain();if(!this.activity||!this.allowed()||this.context?.state!=='running'){this.silence();return;}
   if(this.timer===null)this.pulse();
  }
  preload(){for(const name of Object.keys(recordings))void this.loadRecording(name);}
  loadRecording(name){
   if(this.recordings.has(name))return Promise.resolve(this.recordings.get(name));
   if(!this.fetchAsset||!this.context?.decodeAudioData)return Promise.resolve(null);
   if(!this.pendingRecordings.has(name))this.pendingRecordings.set(name,(async()=>{
    try{const url=globalThis.MiniopolySoundAssets?.[name]||recordings[name],response=await this.fetchAsset(url);if(!response.ok)throw Error('Audio unavailable');const buffer=await this.context.decodeAudioData(await response.arrayBuffer());this.recordings.set(name,buffer);return buffer;}catch{return null;}
   })());
   return this.pendingRecordings.get(name);
  }
  arrive(piece){this.stop();if(piece==='🚀')this.play(piece,'movement','arrival');}
  playEffect(name){if(effects[name])return this.play(name,'effect','departure');return false;}
  pulse(){
   if(!this.activity||!this.allowed()||this.context?.state!=='running'){this.silence();return;}
   const job=this.activity,piece=job.type==='movement'?job.piece:job.pieces[job.index++%job.pieces.length];
   if(job.type==='movement'&&['car','school-bus','📱','🚗'].includes(piece)){
    if(job.bedPlaying)return;job.bedPlaying=true;
    if(!job.departed&&['car','school-bus'].includes(piece))this.play(piece,job.type,'departure');
    job.departed=true;job.phase='travel';this.play(piece,job.type,'travel');return;
   }
   const phase=job.type==='movement'?(job.departed?'travel':'departure'):'departure';job.departed=true;job.phase=phase;
   if(job.type==='movement'&&piece==='🚀'&&phase==='travel'){if(job.waterPlaying)return;job.waterPlaying=true;}
   this.play(piece,job.type,phase);
   // Water is one uninterrupted loop after the single departure horn.
   if(job.type==='movement'&&piece==='🚀'&&phase==='travel')return;
   const identity=this.serial,delay=job.type==='celebration'?4000:piece==='🚀'?1200:piece==='🦖'?(phase==='departure'?1200:620):resolve(piece).cadence;
   this.timer=this.later(()=>{this.timer=null;if(identity===this.serial)this.pulse();},delay);
  }
  play(piece,occasion='movement',phase='departure'){
   if(!this.allowed()||this.context?.state!=='running'||!(resolve(piece)||effects[piece]))return false;
   const assets={'🐱':'cat-meow','🐶':'dog-bark','📱':'airplane-travel','🚗':'blimp-travel','🛵':'shoe-step','🎮':'hat-flutter'};
   const recording=(occasion==='movement'&&phase==='departure'&&radioCalls[piece])?(this.activity?.radioClip||this.chooseRadio(piece)):piece==='tsunami'?'tsunami-surge':piece==='🦖'?(phase==='travel'?'trex-stomp':'trex-screech'):piece==='🚀'?(phase==='arrival'?'ship-bell':phase==='travel'?'ship-water':null):piece==='school-bus'&&occasion==='movement'?'bus-'+phase:piece==='car'?'police-'+(occasion==='movement'?phase:'travel'):assets[piece]||null;
   const identity=this.serial,request=recording?(this.recordingRequest=(this.recordingRequest||0)+1):0,channel=piece+':'+occasion+':'+phase,loop=occasion==='movement'&&phase==='travel'&&['🚀','car','school-bus','📱','🚗'].includes(piece);
   this.recordingTokens||=new Map();if(recording)this.recordingTokens.set(channel,request);
   const emit=buffer=>{
    if(identity!==this.serial||!this.allowed()||this.context?.state!=='running')return false;
    try{
     if(!this.master){this.master=this.context.createGain();this.master.connect(this.context.destination);}this.gain();
     const source=this.context.createBufferSource();source.buffer=buffer;source.loop=loop;source.connect(this.master);this.sources.add(source);source.onended=()=>{this.sources.delete(source);source.disconnect?.();};if(occasion==='celebration'&&buffer.duration>3.8)source.start(0,0,3.5);else source.start();this.playCount++;this.playHistory.push({piece,occasion,phase,recording,loop});if(this.playHistory.length>40)this.playHistory.shift();return true;
    }catch{return false;}
   };
   const fallback=()=>{
    const key=piece+':'+occasion+':'+(['🚀','🦖','car','school-bus'].includes(piece)?phase:'departure');let buffer=this.buffers.get(key);
    if(!buffer){const samples=render(piece,{sampleRate:this.context.sampleRate,occasion,phase});buffer=this.context.createBuffer(1,samples.length,this.context.sampleRate);buffer.getChannelData(0).set(samples);this.buffers.set(key,buffer);}
    return emit(buffer);
   };
   if(recording){if(this.recordings.has(recording))return emit(this.recordings.get(recording));if(this.fetchAsset&&this.context.decodeAudioData){void this.loadRecording(recording).then(buffer=>{if(identity===this.serial&&this.recordingTokens.get(channel)===request&&this.allowed()&&!(piece==='🦖'&&phase==='departure'&&this.activity?.phase==='travel')){if(buffer)emit(buffer);else fallback();}});return true;}}
   return fallback();
  }
  dispose(){this.stop();this.doc?.removeEventListener('pointerdown',this.gesture,true);this.doc?.removeEventListener('keydown',this.gesture,true);this.doc?.removeEventListener('visibilitychange',this.visibility);this.master?.disconnect?.();}
 }
 return Object.freeze({definitions,radioCalls,recordingNames:Object.freeze(Object.keys(recordings)),resolve,render,Engine,unlockedContext:()=>sharedContext?.state==='running'?sharedContext:null});
});
