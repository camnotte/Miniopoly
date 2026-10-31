/* Tsunami is the presentation of the saved Countdown rules; never changes a room. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MiniopolyTsunami=api;})(typeof window==='undefined'?globalThis:window,function(){
 'use strict';
 class WaveTracker{
  constructor(){this.match='';this.wave=0;}
  update(room){
   if(room?.gameMode!=='countdown'||!['playing','finished'].includes(room.stage)){this.match='';this.wave=0;return false;}
   const match=room.code+':'+room.matchId,wave=Number(room.collapse?.wave)||0;
   // Resuming an existing wave must not replay a past disaster. A reset has a new match ID.
   if(match!==this.match){this.match=match;this.wave=wave;return false;}
   if(wave<=this.wave)return false;
   this.wave=wave;return true;
  }
 }
 function hasProtection(room,id){return room?.gameMode==='countdown'&&room.stage!=='lobby'&&!!room.owned?.[id]&&!room.collapse?.lost?.[id]&&((room.collapse?.temporary?.[id]===room.collapse?.wave+1)||((room.owned[id].level||0)>0&&!room.collapse?.shieldSpent?.[id]));}
 function tileStatus(room,id){
  if(room?.gameMode!=='countdown')return null;
  const lost=!!room.collapse?.lost?.[id],target=room.collapse?.endangered?.includes(id)&&!lost,protectedHome=hasProtection(room,id);
  if(room.collapse?.rule==='directional-v1'){const temporary=room.collapse.temporary?.[id]===room.collapse.wave+1;return lost?{lost:true,label:room.owned?.[id]?'REBUILD SITE · NO RENT':'AUCTION SITE · NO RENT',description:'Submerged redevelopment site · No rent or value until rebuilt · Safe to land'}:target?{lost:false,label:temporary?'1 WAVE SHIELD':protectedHome?'EXPOSED · PROTECTED':'EXPOSED',description:'Within the wave path; up to three properties are selected at impact'+(temporary?' · Wave Shield ready':protectedHome?' · Built-in shield ready':'')}:null;}
  return lost?{lost:true,label:'SUBMERGED · NO RENT',description:'Submerged · No rent or property value · Safe to land'}:target?{lost:false,label:protectedHome?'NEXT WAVE · PROTECTED':'NEXT WAVE',description:'Tsunami target · Struck after this full round'+(protectedHome?' · Flood protection will cost one upgrade':'')}:null;
 }
 // Track authoritative spending across all worlds, independent of tile rerenders.
 class ProtectionTracker{
  constructor(){this.match='';this.wave=0;this.protected=new Set();}
  update(room){
   const active=room?.gameMode==='countdown'&&['playing','finished'].includes(room.stage);
   if(!active){this.match='';this.wave=0;this.protected.clear();return [];}
   const match=room.code+':'+room.matchId,wave=Number(room.collapse?.wave)||0;
   if(match===this.match&&wave<this.wave)return [];
   const broken=match===this.match&&wave>this.wave?[...this.protected].filter(id=>room.collapse?.shieldSpent?.[id]):[];
   this.match=match;this.wave=wave;this.protected=new Set(Object.keys(room.owned||{}).filter(id=>hasProtection(room,id)));
   return broken;
  }
 }
 // Protection is a status on the ordinary card, not a raised platform.
 function decorateBoard(board,room){
  const active=room?.gameMode==='countdown'&&room.stage!=='lobby',wave=room?.collapse?.wave||0;
  board.dataset.waveDirection=active?(room.collapse?.direction||''):'';
  board.classList.toggle('tsunami-mode',active);board.classList.toggle('tsunami-high-water',active&&wave>0);
  const center=board.querySelector('.center');let tide=center?.querySelector('.tsunami-tide');
  if(active&&wave>0&&center&&!tide){tide=document.createElement('span');tide.className='tsunami-tide';tide.setAttribute('aria-hidden','true');center.prepend(tide);}
  if(!active||!wave)tide?.remove();
  const world=Number(board.dataset.world);
  for(const tile of board.querySelectorAll('.tile[data-position]')){
   const id=world+'-'+tile.dataset.position,protectedHome=active&&hasProtection(room,id);
   tile.classList.toggle('tsunami-protected',!!protectedHome);
   const temporary=active&&room.collapse?.temporary?.[id]===wave+1;tile.classList.toggle('tsunami-wave-shield',temporary);
   let badge=tile.querySelector('.flood-protection-status');
   if(!protectedHome){badge?.remove();continue;}
   if(!badge){badge=document.createElement('span');badge.className='flood-protection-status';badge.title='Flood protected · One wave costs one development; protection cannot be renewed';badge.setAttribute('role','img');badge.setAttribute('aria-label',badge.title);badge.innerHTML='<svg viewBox="0 0 32 36" aria-hidden="true"><path d="M16 2 29 7v11c0 8-8 13-13 16C11 31 3 26 3 18V7Z" fill="#23764c" stroke="#fff8db" stroke-width="2"/><path d="m9 17 5 5 10-11" fill="none" stroke="#fff8db" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';tile.append(badge);}
   badge.classList.toggle('is-wave-shield',temporary);badge.title=temporary?'Wave Shield · Protects for the next wave only':'Flood protection · One hit costs one development; built-in protection cannot be renewed';badge.setAttribute('aria-label',badge.title);
   if(temporary&&!badge.querySelector('img'))badge.innerHTML='<img src="/art/wave-shield.svg" alt="1 WAVE">';else if(!temporary&&badge.querySelector('img'))badge.innerHTML='<svg viewBox="0 0 32 36"><path d="M16 2 29 7v11c0 8-8 13-13 16C11 31 3 26 3 18V7Z" fill="#23764c" stroke="#fff8db" stroke-width="2"/><path d="m9 17 5 5 10-11" fill="none" stroke="#fff8db" stroke-width="3"/></svg>';

  }
 }
 const IMPACT_DURATION=8000;
 function impactDelay(direction,x,y){direction||='south';const progress=direction==='north'?y:direction==='south'?1-y:direction==='west'?x:1-x;return 900+Math.max(0,Math.min(1,progress))*4700;}
 class Destruction{
  constructor(){this.tracker=new WaveTracker();this.snapshots=new Map();this.timers=new Set();this.animations=[];document.addEventListener('visibilitychange',()=>{if(document.hidden)this.clear();});}
  clear(){if(this.frame)cancelAnimationFrame(this.frame);this.frame=0;for(const animation of this.animations)animation.cancel();this.animations=[];for(const timer of this.timers)clearTimeout(timer);this.timers.clear();this.stage?.remove();this.stage=null;}
  align(board){
   if(!this.stage?.isConnected)return;
   for(const ghost of this.stage.children){const tile=board.querySelector('.tile[data-position="'+ghost.dataset.deed.split('-')[1]+'"]');if(!tile)continue;const target=tile.getBoundingClientRect(),rect=ghost.getBoundingClientRect(),scale=rect.width/(ghost.offsetWidth||rect.width)||1;
    for(const [prop,delta] of [['left',target.left-rect.left],['top',target.top-rect.top],['width',target.width-rect.width],['height',target.height-rect.height]])if(Math.abs(delta)>.15)ghost.style[prop]=(parseFloat(ghost.style[prop])+delta/scale)+'px';
   }
   this.frame=requestAnimationFrame(()=>this.align(board));
  }
  freeze(tile){
   const copy=tile.cloneNode(true),props=['display','position','top','left','right','bottom','width','height','box-sizing','background-color','background-image','background-size','background-position','background-repeat','border','border-radius','padding','margin','font','color','line-height','text-align','z-index','object-fit','overflow','opacity','transform','filter','grid-template-columns','grid-template-rows','gap','align-items','justify-content','flex','flex-direction','visibility'];
   const originals=[tile,...tile.querySelectorAll('*')],clones=[copy,...copy.querySelectorAll('*')];originals.forEach((n,i)=>{const style=getComputedStyle(n);for(const prop of props)clones[i].style.setProperty(prop,style.getPropertyValue(prop),'important');});
   copy.querySelectorAll('.tokens,.property-owner-avatar,.collapse-surface,.tsunami-property-water,.flood-protection-status').forEach(n=>n.remove());copy.removeAttribute('data-position');copy.removeAttribute('id');copy.className='tsunami-demolition-copy';for(const [key,value] of Object.entries({position:'absolute',inset:'0',width:'100%',height:'100%',margin:'0',transform:'none'}))copy.style.setProperty(key,value,'important');return copy;
  }
  update(board,room){
   const hit=this.tracker.update(room),world=Number(board.dataset.world),match=room?.code+':'+room?.matchId;
   if(this.match!==match||this.world!==world){this.clear();this.snapshots.clear();this.match=match;this.world=world;}
   if(room?.gameMode!=='countdown'||room.stage==='lobby'){this.clear();this.snapshots.clear();return;}
   const reduced=window.miniWifiReduceMotion||matchMedia('(prefers-reduced-motion: reduce)').matches;
   if(reduced)this.clear();
   if(hit&&!reduced&&!document.hidden){
    this.clear();const wrap=board.parentElement;if(getComputedStyle(wrap).position==='static')wrap.style.position='relative';this.stage=document.createElement('div');this.stage.className='tsunami-destruction-stage';wrap.append(this.stage);
    for(const id of room.collapse.lastConsumed||[]){if(!id.startsWith(world+'-'))continue;const tile=board.querySelector('.tile[data-position="'+id.split('-')[1]+'"]');if(!tile)continue;
     const old=this.snapshots.get(id)?.copy||this.freeze(tile),ghost=document.createElement('div');ghost.className='tsunami-demolition-layer';ghost.dataset.deed=id;const sr=this.stage.getBoundingClientRect(),tr=tile.getBoundingClientRect(),scale=sr.width/(this.stage.offsetWidth||sr.width);ghost.style.left=(tr.left-sr.left)/scale+'px';ghost.style.top=(tr.top-sr.top)/scale+'px';ghost.style.width=tr.width/scale+'px';ghost.style.height=tr.height/scale+'px';
     const delay=impactDelay(room.collapse.direction,(tile.offsetLeft+tile.offsetWidth/2)/board.offsetWidth,(tile.offsetTop+tile.offsetHeight/2)/board.offsetHeight);ghost.style.setProperty('--impact-delay',delay+'ms');
     for(let i=0;i<4;i++){const fragment=document.createElement('div');fragment.className='tsunami-building-fragment fragment-'+i;fragment.style.setProperty('--fragment-x',(i%2?1:-1)*(13+i*5)+'px');fragment.style.setProperty('--fragment-y',(28+i*11)+'px');fragment.style.setProperty('--fragment-spin',(i%2?1:-1)*(8+i*5)+'deg');fragment.append(old.cloneNode(true));ghost.append(fragment);}
     const dust=document.createElement('span');dust.className='tsunami-demolition-dust';ghost.append(dust);this.stage.append(ghost);
    }
    for(const id of room.collapse.lastProtected||[]){if(!id.startsWith(world+'-'))continue;const tile=board.querySelector('.tile[data-position="'+id.split('-')[1]+'"]');if(tile)this.animations.push(tile.animate([{boxShadow:'inset 0 0 0 0 #fff4b400'},{boxShadow:'inset 0 0 25px 8px #fff4b4bb'},{boxShadow:'inset 0 0 0 0 #fff4b400'}],{delay:impactDelay(room.collapse.direction,(tile.offsetLeft+tile.offsetWidth/2)/board.offsetWidth,(tile.offsetTop+tile.offsetHeight/2)/board.offsetHeight),duration:1300}));}
    this.align(board);const timer=setTimeout(()=>{if(this.frame)cancelAnimationFrame(this.frame);this.frame=0;this.stage?.remove();this.stage=null;this.timers.delete(timer);},IMPACT_DURATION);this.timers.add(timer);
   }
   for(const tile of board.querySelectorAll('.tile[data-position]')){const id=world+'-'+tile.dataset.position;if(room.collapse?.lost?.[id]){this.snapshots.delete(id);continue;}const o=room.owned?.[id],signature=[tile.offsetWidth,tile.offsetHeight,o?.owner,o?.level,o?.mortgage,room.players[o?.owner]?.deeds,getComputedStyle(tile).fontFamily].join(':');if(this.snapshots.get(id)?.signature!==signature)this.snapshots.set(id,{signature,copy:this.freeze(tile)});}
  }
 }
 class Surge{
  constructor({getPreferences=()=>({sound:true,volume:100}),getReducedMotion=()=>false,onComplete=()=>{}}={}){
   this.onComplete=onComplete;this.getReducedMotion=getReducedMotion;this.tracker=new WaveTracker();this.count=0;this.timer=null;
   this.layer=document.createElement('div');this.layer.className='tsunami-surroundings';this.layer.hidden=true;this.layer.setAttribute('aria-hidden','true');
   const surge=document.createElement('div');surge.className='tsunami-surge';this.layer.append(surge);(document.querySelector('.board-frame-wrap')||document.body).append(this.layer);this.resize=()=>this.position();window.addEventListener('resize',this.resize);
   this.sound=new window.MiniopolyPieceSounds.Engine({getPreferences});
   this.visibility=()=>{if(document.hidden)this.finish();};document.addEventListener('visibilitychange',this.visibility);
   this.media=matchMedia('(prefers-reduced-motion: reduce)');this.motion=()=>this.syncPreferences();this.media.addEventListener('change',this.motion);
   this.pagehide=()=>this.stop();window.addEventListener('pagehide',this.pagehide);
  }
  update(room){
   const match=room?.code+':'+room?.matchId,direction=room?.collapse?.direction||null;
   if(match===this.warningMatch&&direction&&!this.warningDirection&&room?.stage==='playing')this.sound.playEffect('siren');
   this.warningMatch=match;this.warningDirection=direction;this.layer.dataset.direction=direction||'south';
   const hit=this.tracker.update(room);this.finished=room?.stage==='finished';const active=room?.gameMode==='countdown'&&(room.stage==='playing'||this.finished&&(hit||this.timer!==null));
   this.layer.hidden=!active;this.layer.classList.toggle('has-water',active&&!room.collapse?.calm&&(room.collapse?.wave||0)>0);
   if(!active){this.stop();return;}
   if(hit&&!document.hidden){
    this.stop();this.position();document.body.classList.add('tsunami-impact-playing');this.count++;this.layer.dataset.wave=String(room.collapse.wave);
    if(!this.getReducedMotion()&&!this.media.matches){void this.layer.offsetWidth;this.layer.classList.add('is-surging');}
    this.sound.playEffect('tsunami');this.timer=setTimeout(()=>this.finish(),this.getReducedMotion()||this.media.matches?800:IMPACT_DURATION);
   }
  }
  position(){const frame=document.getElementById('boardFrame'),board=frame?.contentDocument?.getElementById('board'),wrap=frame?.parentElement;if(!board||!wrap)return;const f=frame.getBoundingClientRect(),b=board.getBoundingClientRect(),w=wrap.getBoundingClientRect(),scale=f.width/(frame.clientWidth||f.width);Object.assign(this.layer.style,{left:f.left-w.left+b.left*scale+'px',top:f.top-w.top+b.top*scale+'px',width:b.width*scale+'px',height:b.height*scale+'px'});}
  finish(){this.stop();if(this.finished)this.layer.hidden=true;this.onComplete();}
  syncPreferences(){this.sound.sync();if(this.getReducedMotion()||this.media.matches){this.layer.classList.remove('is-surging');if(this.timer!==null)this.finish();}}
  stop(){clearTimeout(this.timer);this.timer=null;this.layer.classList.remove('is-surging');document.body.classList.remove('tsunami-impact-playing');this.sound.stop();}
  dispose(){this.stop();this.sound.dispose();document.removeEventListener('visibilitychange',this.visibility);this.media.removeEventListener('change',this.motion);window.removeEventListener('pagehide',this.pagehide);window.removeEventListener('resize',this.resize);this.layer.remove();}
 }
 return {WaveTracker,ProtectionTracker,hasProtection,tileStatus,decorateBoard,Surge,Destruction,impactDelay,IMPACT_DURATION};
});
