/* Personal, dismissible guidance. Bids and game decisions stay on the host. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MiniopolyHelper=api;})(typeof window==='undefined'?globalThis:window,function(){
 'use strict';
 const money=n=>'$'+Number(n||0).toLocaleString('en-US');
 const scope=(room,id)=>[room?.code,room?.matchId,room?.youId,id].join(':');
 class ReadTracker{
  constructor(key,storage=typeof localStorage==='undefined'?null:localStorage){this.key=key;this.storage=storage;try{this.seen=new Set(JSON.parse(storage?.getItem(key)||'[]'));}catch{this.seen=new Set();}}
  has(room,id){return this.seen.has(scope(room,id));}
  mark(room,id){this.seen.add(scope(room,id));this.seen=new Set([...this.seen].slice(-200));this.save();}
  forget(room,id){this.seen.delete(scope(room,id));this.save();}
  save(){try{this.storage?.setItem(this.key,JSON.stringify([...this.seen]));}catch{}}
 }
 function auctionSummary(room,deeds,result=room?.collapse?.lastAuction){
  if(!result)return null;const catalog=Array.isArray(deeds)?Object.fromEntries(deeds.map(d=>[d.id,d])):deeds||{},me=room.players?.find(p=>p.id===room.youId);
  const lots=result.results.map(r=>({id:r.id,name:catalog[r.id]?.name||r.id,winner:r.winner,owner:r.winner===null?'Bank':room.players?.[r.winner]?.name||'Player',price:r.price,rebuildCost:Math.max(50,Math.ceil((catalog[r.id]?.price||0)/2)),you:!!me&&r.winner===me.seat,tied:!!r.tied,bids:r.bids||[]}));
  const wins=lots.filter(l=>l.you),ruins=wins.filter(l=>room.owned?.[l.id]?.owner===me.seat&&room.collapse?.lost?.[l.id]);
  return {id:result.id,wave:result.wave,lots,wins,ruins,rebuildTotal:ruins.reduce((n,l)=>n+l.rebuildCost,0),paid:wins.reduce((n,l)=>n+l.price,0),yourTurn:!!me&&room.turn===me.seat&&['roll','post'].includes(room.phase),cash:me?.cash||0};
 }
 function helperTip(room,deeds={}){
  const me=room?.players?.find(p=>p.id===room.youId);if(!me||me.out||room.stage!=='playing')return null;
  const s=room.collapse||{},mine=Object.entries(room.owned||{}).filter(([,o])=>o.owner===me.seat),turn=room.turn===me.seat,safe=turn&&['roll','post'].includes(room.phase),catalog=Array.isArray(deeds)?Object.fromEntries(deeds.map(d=>[d.id,d])):deeds;
  if(s.auction)return null;
  const sites=mine.filter(([id])=>s.lost?.[id]);
  if(sites.length){const cost=sites.reduce((n,[id])=>n+Math.max(50,Math.ceil((catalog[id]?.price||0)/2)),0),ready=safe&&me.cash>=cost;
   return {id:'rebuild:'+s.wave+':'+sites.map(([id])=>id).sort().join(',')+':'+(safe?'turn':'waiting')+':'+(me.cash>=cost?'funded':'short'),title:ready?'Rebuild your new sites':'Your redevelopment sites',text:safe?(me.cash>=cost?'Pay '+money(cost)+' to rebuild '+sites.length+' site'+(sites.length===1?'':'s')+' and restore rent and deed value.':'Rebuilding needs '+money(cost)+'. Save cash or sell/trade assets before spending more.'):'When your turn begins, open Storm preparations and rebuild your '+sites.length+' site'+(sites.length===1?'':'s')+' for '+money(cost)+'.',action:'rebuild',label:'Show rebuilding options'};
  }
  const offer=room.trades?.find(t=>t.to===me.seat&&t.status==='pending');if(offer)return {id:'trade:'+offer.id,title:'Trade offer waiting',text:(room.players[offer.from]?.name||'A player')+' sent you a trade. Review the properties and cash before deciding.',action:'trade',label:'Review trade'};
  if(turn&&['rent','bail'].includes(room.phase))return {id:'payment:'+room.turnNumber+':'+room.phase,title:'Resolve your payment',text:'Review the '+money(room.obligation?.amount||room.pending?.amount)+' payment. Sell assets if you need more cash.',action:'landing',label:'Review landing'};
  if(room.gameMode==='countdown'&&s.direction&&!s.calm){const count=mine.filter(([id])=>s.endangered?.includes(id)&&!s.lost?.[id]).length;
   if(count)return {id:'warning:'+s.wave+':'+s.direction,title:'Wave from '+s.direction.toUpperCase(),text:count+' of your properties are exposed. '+(s.wave?'Prepare before this round ends.':'Use rounds '+(room.rounds-1)+' and '+room.rounds+' to protect or trade them.'),action:'path',label:'See properties in the wave path'};
  }
  if(s.calm)return {id:'calm',title:'The ocean is calm',text:'This is the final recovery round. Rebuild and review your net worth before scoring.',action:'properties',label:'Review properties'};
  if(turn&&room.phase==='post'&&typeof window!=='undefined'&&window.MiniopolyPlayerAdvisor){const a=window.MiniopolyPlayerAdvisor.advise(room,catalog);if(['permit','develop','set'].includes(a?.key))return {id:'action:'+room.turnNumber+':'+a.key,title:'A useful next step',text:a.text,action:a.actions[0]||'properties',label:a.key==='set'?'Review trades':'Review development'};}
  if(turn&&room.round===1&&room.phase==='roll')return {id:'intro',title:'Your neighborhood helper',text:'Roll to explore. Buy properties, complete sets and develop them to increase rent.',action:null,label:''};
  return null;
 }
 if(typeof document==='undefined')return {ReadTracker,auctionSummary,helperTip};
 class Display{
  constructor({getPreferences=()=>({helper:true}),getBusy=()=>false,onMute=()=>{},onAction=()=>{}}={}){
   Object.assign(this,{getPreferences,getBusy,onMute,onAction});this.read=new ReadTracker('miniopoly_helper_seen_v1');
   this.element=document.createElement('aside');this.element.id='playerHelperBubble';this.element.className='player-helper-bubble';this.element.hidden=true;this.element.setAttribute('aria-label','Your player helper');
   this.element.innerHTML='<header><strong>Player helper</strong><button type="button" class="helper-dismiss" aria-label="Dismiss helper hint">×</button></header><div class="helper-content"><span class="helper-avatar" aria-hidden="true"></span><div><h3></h3><p role="status" aria-live="polite"></p></div></div><footer><button type="button" class="helper-action"></button><button type="button" class="helper-read">Got it</button><button type="button" class="helper-mute">Mute helper</button></footer>';
   document.body.append(this.element);this.element.querySelector('.helper-dismiss').onclick=this.element.querySelector('.helper-read').onclick=()=>this.dismiss();this.element.querySelector('.helper-mute').onclick=()=>{this.onMute();this.syncVisibility();};this.element.querySelector('.helper-action').onclick=()=>{const action=this.tip?.action;this.dismiss();if(action)this.onAction(action);};
   this.observer=new MutationObserver(()=>this.syncVisibility());this.observer.observe(document.body,{subtree:true,attributes:true,attributeFilter:['hidden','open']});document.addEventListener('visibilitychange',()=>this.syncVisibility());
  }
  update(room,deeds){
   this.room=room;this.deeds=deeds;const enabled=this.getPreferences().helper!==false,tip=helperTip(room,deeds);
   if(this.enabled===false&&enabled&&tip)this.read.forget(room,tip.id);this.enabled=enabled;this.tip=tip;
   if(tip){const me=room.players.find(p=>p.id===room.youId),identity=[me.avatar,me.avatarImage].join(':');if(identity!==this.identity){this.identity=identity;this.element.querySelector('.helper-avatar').innerHTML=window.MiniopolyAvatars.html(me.avatar,me.seat,me.avatarImage);}
    this.element.querySelector('h3').textContent=tip.title;this.element.querySelector('.helper-content p').textContent=tip.text;const action=this.element.querySelector('.helper-action');action.textContent=tip.label;action.hidden=!tip.action;
   }this.syncVisibility();
  }
  syncVisibility(){const blocked=document.hidden||this.getBusy()||[...document.querySelectorAll('[role=dialog],dialog[open]')].some(n=>n.getClientRects().length&&!n.closest('[hidden]')),hidden=!this.tip||!this.room||this.getPreferences().helper===false||this.read.has(this.room,this.tip.id)||blocked;if(this.element.hidden!==hidden)this.element.hidden=hidden;}
  dismiss(){if(this.tip&&this.room)this.read.mark(this.room,this.tip.id);this.element.hidden=true;}
 }
 return {ReadTracker,auctionSummary,helperTip,Display};
});
