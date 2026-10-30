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
 function hasProtection(room,id){return room?.gameMode==='countdown'&&room.stage!=='lobby'&&!!room.owned?.[id]&&(room.owned[id].level||0)>0&&!room.collapse?.lost?.[id]&&!room.collapse?.shieldSpent?.[id];}
 function tileStatus(room,id){
  if(room?.gameMode!=='countdown')return null;
  const lost=!!room.collapse?.lost?.[id],target=room.collapse?.endangered?.includes(id)&&!lost,protectedHome=hasProtection(room,id);
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
  board.classList.toggle('tsunami-mode',active);board.classList.toggle('tsunami-high-water',active&&wave>0);
  const center=board.querySelector('.center');let tide=center?.querySelector('.tsunami-tide');
  if(active&&wave>0&&center&&!tide){tide=document.createElement('span');tide.className='tsunami-tide';tide.setAttribute('aria-hidden','true');center.prepend(tide);}
  if(!active||!wave)tide?.remove();
  const world=Number(board.dataset.world);
  for(const tile of board.querySelectorAll('.tile[data-position]')){
   const id=world+'-'+tile.dataset.position,protectedHome=active&&hasProtection(room,id);
   tile.classList.toggle('tsunami-protected',!!protectedHome);
   let badge=tile.querySelector('.flood-protection-status');
   if(!protectedHome){badge?.remove();continue;}
   if(!badge){badge=document.createElement('span');badge.className='flood-protection-status';badge.textContent='🛡';badge.title='Flood protected · One wave costs one development; protection cannot be renewed';badge.setAttribute('role','img');badge.setAttribute('aria-label',badge.title);tile.querySelector('.mini522-price-cell')?.append(badge);}
  }
 }
 class Surge{
  constructor({getPreferences=()=>({sound:true,volume:100}),getReducedMotion=()=>false,onComplete=()=>{}}={}){
   this.onComplete=onComplete;this.getReducedMotion=getReducedMotion;this.tracker=new WaveTracker();this.count=0;this.timer=null;
   this.layer=document.createElement('div');this.layer.className='tsunami-surroundings';this.layer.hidden=true;this.layer.setAttribute('aria-hidden','true');
   const surge=document.createElement('div');surge.className='tsunami-surge';this.layer.append(surge);document.body.append(this.layer);
   this.sound=new window.MiniopolyPieceSounds.Engine({getPreferences});
   this.visibility=()=>{if(document.hidden)this.finish();};document.addEventListener('visibilitychange',this.visibility);
   this.media=matchMedia('(prefers-reduced-motion: reduce)');this.motion=()=>this.syncPreferences();this.media.addEventListener('change',this.motion);
   this.pagehide=()=>this.stop();window.addEventListener('pagehide',this.pagehide);
  }
  update(room){
   const hit=this.tracker.update(room);this.finished=room?.stage==='finished';const active=room?.gameMode==='countdown'&&(room.stage==='playing'||this.finished&&(hit||this.timer!==null));
   this.layer.hidden=!active;this.layer.classList.toggle('has-water',active&&(room.collapse?.wave||0)>0);
   if(!active){this.stop();return;}
   if(hit&&!document.hidden){
    this.stop();this.count++;this.layer.dataset.wave=String(room.collapse.wave);
    if(!this.getReducedMotion()&&!this.media.matches){void this.layer.offsetWidth;this.layer.classList.add('is-surging');}
    this.sound.playEffect('tsunami');this.timer=setTimeout(()=>this.finish(),this.getReducedMotion()||this.media.matches?1000:4200);
   }
  }
  finish(){this.stop();if(this.finished)this.layer.hidden=true;this.onComplete();}
  syncPreferences(){this.sound.sync();if(this.getReducedMotion()||this.media.matches)this.layer.classList.remove('is-surging');}
  stop(){clearTimeout(this.timer);this.timer=null;this.layer.classList.remove('is-surging');this.sound.stop();}
  dispose(){this.stop();this.sound.dispose();document.removeEventListener('visibilitychange',this.visibility);this.media.removeEventListener('change',this.motion);window.removeEventListener('pagehide',this.pagehide);this.layer.remove();}
 }
 return {WaveTracker,ProtectionTracker,hasProtection,tileStatus,decorateBoard,Surge};
});
