/* Recipient-only in-game alerts. Trade settlement remains on the host.
   seen deduplicates delivery/sounds; readIDs records explicit inbox choices. */
(()=>{
 'use strict';
 const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
 class TradeNotifications{
  constructor({button,onReview,onReadChange=()=>{},getPreferences=()=>({sound:true,volume:100})}){
   this.onReadChange=onReadChange;this.readIDs=new Set();this.button=button;this.getPreferences=getPreferences;this.seen=new Set();this.pendingSound=new Set();this.incoming=[];this.lastSound=0;
   this.sound=new window.MiniopolyPieceSounds.Engine({getPreferences,fetchAsset:null});
   this.badges=[];
   for(const selector of ['#menuTradingButton','#menuCategory-property > summary','#phoneGameMenu > summary']){
    const parent=document.querySelector(selector);if(!parent)continue;
    const badge=node('span','','trade-count');badge.hidden=true;badge.dataset.tradeCount='';const chevron=parent.querySelector('.menu-chevron');parent.insertBefore(badge,chevron);this.badges.push(badge);
   }
   this.toast=node('section',undefined,'trade-notification');this.toast.hidden=true;this.toast.setAttribute('aria-label','Trade notification');
   const head=node('header'),title=node('strong','New trade offer'),dismiss=node('button','×');dismiss.type='button';dismiss.setAttribute('aria-label','Dismiss trade notification');dismiss.onclick=()=>this.acknowledge();head.append(title,dismiss);
   this.message=node('p');this.message.setAttribute('role','status');this.message.setAttribute('aria-live','polite');this.message.setAttribute('aria-atomic','true');
   this.review=node('button','Review offer','trade-notification-review');this.review.type='button';this.review.onclick=()=>onReview();this.toast.append(head,this.message,this.review);const markRead=node('button','Mark as read','trade-notification-mark-read');markRead.type='button';markRead.onclick=()=>{for(const id of this.toastIDs||[])this.setRead(id,true,false);this.acknowledge();this.onReadChange();};this.toast.append(markRead);document.body.append(this.toast);
   window.addEventListener('storage',event=>{if(event.key===this.readKey){this.loadRead();this.updateIndicators();this.onReadChange();}});
   document.addEventListener('visibilitychange',()=>{clearTimeout(this.hideTimer);if(!document.hidden){this.armHide();this.scheduleSound();}});
   const gesture=()=>{if(this.pendingSound.size)void this.sound.unlock().then(()=>this.trySound());};
   document.addEventListener('pointerdown',gesture,{capture:true,passive:true});document.addEventListener('keydown',gesture,{capture:true});
  }
  read(){try{const ids=JSON.parse(localStorage.getItem(this.key)||'null');return Array.isArray(ids)?ids.filter(id=>typeof id==='string'):null;}catch{return null;}}
  write(){try{localStorage.setItem(this.key,JSON.stringify([...this.seen].slice(-100)));}catch{}}
  update(room,{dialogOpen=false}={}){
   const me=room?.players.find(p=>p.id===room.youId),eligible=room?.stage==='playing'&&me&&!me.out;
   const incoming=eligible?(room.trades||[]).filter(t=>t.status==='pending'&&room.players[t.to]?.id===room.youId):[],key=eligible?'miniopoly_trade_seen_v1:'+room.code+':'+room.matchId+':'+room.youId:'';
   const changed=this.key!==key;
   if(changed){this.key=key;this.readKey=key?key.replace('trade_seen_v1','trade_read_v1'):'';this.loadRead();this.seen=new Set();this.pendingSound.clear();clearTimeout(this.soundTimer);this.sound.stop();this.hide();}
   const saved=key?this.read():null;if(saved)for(const id of saved)this.seen.add(id);
   const fresh=incoming.filter(t=>!this.seen.has(t.id)),baseline=changed&&saved===null;
   this.incoming=incoming;for(const offer of incoming)this.seen.add(offer.id);if(key)this.write();
   const ids=new Set(incoming.map(t=>t.id));for(const id of this.pendingSound)if(!ids.has(id))this.pendingSound.delete(id);
   const count=incoming.length;this.updateIndicators();
   if(!count){this.hide();this.pendingSound.clear();clearTimeout(this.soundTimer);return {incoming,fresh:[]};}
   if(this.toastIDs?.length&&!this.toastIDs.some(id=>ids.has(id)))this.hide();
   if(fresh.length){
    this.toastIDs=fresh.map(t=>t.id);const names=[...new Set(fresh.map(t=>room.players[t.from]?.name||'A player'))];
    this.message.textContent=(fresh.length===1?'Trade offer from ':'New trade offers from ')+names.join(', ')+'. '+count+' pending '+(count===1?'offer':'offers')+' to review.';
    this.review.textContent=count===1?'Review offer':'Review offers';
    if(!dialogOpen){this.toast.hidden=false;this.armHide();}
    if(!baseline&&this.getPreferences()?.sound!==false&&Number(this.getPreferences()?.volume??100)>0){for(const offer of fresh)this.pendingSound.add(offer.id);this.scheduleSound();}
   }
   if(dialogOpen)this.hide();return {incoming,fresh};
  }
  loadRead(){try{const saved=JSON.parse(localStorage.getItem(this.readKey)||'[]');this.readIDs=new Set(Array.isArray(saved)?saved.filter(id=>typeof id==='string'):[]);}catch{this.readIDs=new Set();}}
  isRead(id){return this.readIDs.has(id);}
  get unreadCount(){return this.incoming.filter(t=>!this.isRead(t.id)).length;}
  setRead(id,value=true,notify=true){
   if(!this.incoming.some(t=>t.id===id))return;
   if(value)this.readIDs.add(id);else this.readIDs.delete(id);
   try{if(this.readKey)localStorage.setItem(this.readKey,JSON.stringify([...this.readIDs].slice(-100)));}catch{}
   this.pendingSound.delete(id);this.updateIndicators();if(notify)this.onReadChange();
  }
  markAllRead(){for(const offer of this.incoming)this.setRead(offer.id,true,false);this.acknowledge();this.onReadChange();}
  updateIndicators(){
   const count=this.unreadCount;this.button.classList.toggle('has-trade-offers',this.incoming.length>0);this.button.classList.toggle('has-unread-trades',count>0);
   document.getElementById('menuTradingButton')?.classList.toggle('has-unread-trades',count>0);
   for(const badge of this.badges){badge.hidden=!count;badge.textContent=String(count);badge.setAttribute('aria-label',count+' unread trade '+(count===1?'offer':'offers'));}
  }
  hide(){clearTimeout(this.hideTimer);this.toast.hidden=true;}
  acknowledge(){this.hide();this.pendingSound.clear();clearTimeout(this.soundTimer);}
  armHide(){clearTimeout(this.hideTimer);if(!document.hidden&&!this.toast.hidden)this.hideTimer=setTimeout(()=>this.hide(),12000);}
  scheduleSound(){clearTimeout(this.soundTimer);if(document.hidden||!this.pendingSound.size)return;this.soundTimer=setTimeout(()=>this.trySound(),Math.max(120,1000-(Date.now()-this.lastSound)));}
  trySound(){
   if(!this.pendingSound.size||document.hidden)return;
   if(this.getPreferences()?.sound===false||Number(this.getPreferences()?.volume??100)<=0){this.pendingSound.clear();return;}
   if(this.sound.playEffect('trade')){this.lastSound=Date.now();this.pendingSound.clear();clearTimeout(this.soundTimer);}
  }
  syncPreferences(){if(this.getPreferences()?.sound===false||Number(this.getPreferences()?.volume??100)<=0){this.pendingSound.clear();clearTimeout(this.soundTimer);this.sound.stop();}else this.sound.gain();}
 }
 window.MiniopolyTradeNotifications=TradeNotifications;
})();
