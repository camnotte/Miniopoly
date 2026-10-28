(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MiniopolyPropertyOverview=api.Overview;})(typeof window==='undefined'?globalThis:window,function(){
  'use strict';
  function clamp(x,y,size,view){return {x:Math.round(Math.max(view.left+12,Math.min(view.left+view.width-size.width-12,x))),y:Math.round(Math.max(view.top+12,Math.min(view.top+view.height-size.height-12,y)))};}
  const icon='<svg viewBox="0 0 66 58" aria-hidden="true"><g stroke="#315b50" stroke-width="2" stroke-linejoin="round"><g transform="rotate(-17 24 32)"><rect x="5" y="12" width="32" height="40" rx="3" fill="#fff9e9"/><path d="M6 15q0-2 2-2h26q2 0 2 2v9H6Z" fill="#987047"/></g><rect x="18" y="5" width="32" height="42" rx="3" fill="#fff9e9"/><path d="M19 8q0-2 2-2h26q2 0 2 2v9H19Z" fill="#4c9ccb"/><g transform="rotate(20 43 31)"><rect x="29" y="12" width="31" height="40" rx="3" fill="#fff9e9"/><path d="M30 15q0-2 2-2h25q2 0 2 2v9H30Z" fill="#d47b9c"/><path d="m35 36 9-8 9 8m-15-3v12h12V33m-8 12v-8h4v8" fill="none"/></g></g></svg>';
  if(typeof document==='undefined')return {clamp};
  const node=(tag,text,className)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(className)n.className=className;return n;};
  class Overview{
    static icon(){return icon;}
    constructor({getData,renderPlayer,renderUpgrades,onDetailsRefresh,onClose,onDetailed}){
      Object.assign(this,{getData,renderPlayer,renderUpgrades,onDetailsRefresh,onClose,onDetailed});this.view='sets';this.selected=null;this.drag=null;this.savedKey='miniopoly_property_overview_position_v1';this.roomCode=null;this.matchId=null;this.signature='';
      this.root=node('section',null,'property-overview');this.root.id='propertyOverview';this.root.hidden=true;this.root.setAttribute('role','dialog');this.root.setAttribute('aria-labelledby','propertyOverviewTitle');
      const header=node('header',null,'property-overview-header');this.handle=node('div',null,'property-overview-handle');this.handle.tabIndex=0;this.handle.title='Drag to move · Arrow keys move the window';
      const title=node('h2','Property Overview');title.id='propertyOverviewTitle';this.subtitle=node('p','All players · Select a set to inspect.');this.handle.append(title,this.subtitle);
      this.resetButton=node('button','↺','property-overview-reset');this.resetButton.type='button';this.resetButton.title='Reset window position';this.resetButton.setAttribute('aria-label','Reset property overview position');
      this.closeButton=node('button','×','property-overview-close');this.closeButton.type='button';this.closeButton.setAttribute('aria-label','Close property overview');header.append(this.handle,this.resetButton,this.closeButton);
      this.list=node('div',null,'property-overview-list');this.list.tabIndex=0;this.list.setAttribute('role','region');this.list.setAttribute('aria-label','All player properties. Scroll with the mouse wheel, arrow keys, Page Up or Page Down.');
      const footer=node('footer');this.detailedButton=node('button','Open my detailed portfolio');this.detailedButton.type='button';footer.append(this.detailedButton);this.views=node('div',null,'property-overview-views');this.views.setAttribute('aria-label','Property overview views');for(const [value,label] of [['sets','Set progress'],['upgrades','Upgraded properties']]){const button=node('button',label);button.type='button';button.dataset.overviewView=value;button.setAttribute('aria-pressed',String(value===this.view));button.onclick=()=>{this.view=value;this.onClose?.();this.signature='';this.refresh();};this.views.append(button);}this.root.append(header,this.views,this.list,footer);document.body.append(this.root);
      this.closeButton.onclick=()=>this.close(true);this.detailedButton.onclick=()=>this.onDetailed();this.resetButton.onclick=()=>{try{localStorage.removeItem(this.savedKey);}catch{}this.position(true);};
      document.addEventListener('click',event=>{const button=event.target.closest?.('.player-properties-button');if(button)this.open(Number(button.dataset.playerSeat),button);});
      this.list.addEventListener('click',event=>{const button=event.target.closest('[data-overview-select]');if(button)this.select(Number(button.dataset.overviewSelect),true);});
      document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!event.defaultPrevented&&this.visible){if(!document.getElementById('playerSetDetails')?.hidden)return;event.preventDefault();this.close(true);}});
      this.handle.addEventListener('pointerdown',event=>{
        if(this.mobile||event.button!==0)return;const r=this.root.getBoundingClientRect();this.drag={id:event.pointerId,x:event.clientX,y:event.clientY,left:r.left,top:r.top};this.handle.setPointerCapture(event.pointerId);this.root.classList.add('is-dragging');
      });
      this.handle.addEventListener('pointermove',event=>{if(this.drag?.id===event.pointerId)this.place(this.drag.left+event.clientX-this.drag.x,this.drag.top+event.clientY-this.drag.y);});
      for(const type of ['pointerup','pointercancel','lostpointercapture'])this.handle.addEventListener(type,event=>{if(this.drag?.id!==event.pointerId)return;this.drag=null;this.root.classList.remove('is-dragging');if(this.handle.hasPointerCapture(event.pointerId))this.handle.releasePointerCapture(event.pointerId);this.save();});
      this.handle.addEventListener('keydown',event=>{if(this.mobile)return;const step=event.shiftKey?40:10,move={ArrowLeft:[-step,0],ArrowRight:[step,0],ArrowUp:[0,-step],ArrowDown:[0,step]}[event.key];if(move){event.preventDefault();const r=this.root.getBoundingClientRect();this.place(r.left+move[0],r.top+move[1]);this.save();}});
      window.addEventListener('resize',()=>this.position(true));window.visualViewport?.addEventListener('resize',()=>this.position(true));
      window.visualViewport?.addEventListener('scroll',()=>this.position(true));
      this.observer=new ResizeObserver(()=>{if(this.frame)return;this.frame=requestAnimationFrame(()=>{this.frame=null;this.position();});});this.observer.observe(this.root);
    }
    get visible(){return !this.root.hidden;}
    get mobile(){return this.viewport().width<=600;}
    viewport(){const vp=window.visualViewport;return {left:vp?.offsetLeft||0,top:vp?.offsetTop||0,width:vp?.width||innerWidth,height:vp?.height||innerHeight};}
    open(seat,trigger){
      const data=this.getData();if(!data||data.stage==='finished')return;
      this.returnFocus=trigger||document.activeElement;this.roomCode=data.code;this.matchId=data.matchId||null;this.selected=data.players.some(p=>p.seat===seat)?seat:data.players.find(p=>p.id===data.youId)?.seat??0;
      const wasVisible=this.visible;this.root.hidden=false;this.refresh();if(!wasVisible)this.position(true);this.select(this.selected,true);this.handle.focus({preventScroll:true});
    }
    refresh(){
      if(!this.visible)return;const data=this.getData();
      if(!data||data.code!==this.roomCode||data.stage==='finished'||(this.matchId&&this.matchId!==data.matchId)){this.close();return;}
      this.matchId=data.matchId||null;
      const signature=JSON.stringify([this.view,data.code,data.youId,data.collapse,data.players.map(p=>[p.id,p.seat,p.name,p.avatar,p.avatarImage,p.deeds,p.out,p.penalty]),data.owned,data.foreclosures]);
      if(signature!==this.signature){
        const focus=document.activeElement,focusSeat=focus?.dataset.overviewSelect,focusSet=focus?.dataset.setColor,focusPlayer=focus?.dataset.playerSeat;
        this.signature=signature;const scroll=this.list.scrollTop;this.list.replaceChildren(...(this.view==='upgrades'&&this.renderUpgrades?[this.renderUpgrades(data)]:data.players.map(player=>this.renderPlayer(player,data))));this.subtitle.textContent=this.view==='upgrades'?'All players · Upgrade levels in every world.':'All players · Select a set to inspect.';for(const button of this.views.children)button.setAttribute('aria-pressed',String(button.dataset.overviewView===this.view));this.list.scrollTop=scroll;
        if(focusSeat!==undefined)this.list.querySelector(`[data-overview-select="${Number(focusSeat)}"]`)?.focus({preventScroll:true});
        else if(focusSet)this.list.querySelector(`.player-set-chip[data-player-seat="${Number(focusPlayer)}"][data-set-color="${focusSet}"]`)?.focus({preventScroll:true});
      }
      if(!data.players.some(p=>p.seat===this.selected))this.selected=data.players.find(p=>p.id===data.youId)?.seat??0;
      this.select(this.selected);this.position();this.onDetailsRefresh?.();
    }
    select(seat,reveal=false){
      this.selected=seat;
      for(const row of this.list.children){const selected=Number(row.dataset.playerSeat)===seat;row.classList.toggle('is-selected',selected);row.querySelector('[data-overview-select]')?.setAttribute('aria-pressed',String(selected));
        if(selected&&reveal){const top=row.offsetTop,bottom=top+row.offsetHeight;if(top<this.list.scrollTop)this.list.scrollTop=top;else if(bottom>this.list.scrollTop+this.list.clientHeight)this.list.scrollTop=bottom-this.list.clientHeight;}
      }
      this.updateTriggers();
    }
    updateTriggers(){document.querySelectorAll('.player-properties-button').forEach(button=>button.setAttribute('aria-expanded',String(this.visible&&Number(button.dataset.playerSeat)===this.selected)));}
    place(x,y){const p=clamp(x,y,{width:this.root.offsetWidth,height:this.root.offsetHeight},this.viewport());Object.assign(this.root.style,{left:p.x+'px',top:p.y+'px'});this.onDetailsRefresh?.();}
    save(){if(this.mobile)return;const view=this.viewport(),r=this.root.getBoundingClientRect();try{localStorage.setItem(this.savedKey,JSON.stringify({x:(r.left-view.left-12)/Math.max(1,view.width-r.width-24),y:(r.top-view.top-12)/Math.max(1,view.height-r.height-24)}));}catch{}}
    position(restore=false){
      if(!this.visible||this.drag)return;const view=this.viewport();this.root.classList.toggle('is-phone',this.mobile);this.handle.title=this.mobile?'Property overview · All players':'Drag to move · Arrow keys move the window';this.root.style.maxHeight=Math.max(140,Math.min(this.mobile?view.height*.8:690,view.height-24))+'px';
      const mode=this.mobile?'phone':'desktop';
      if(this.mobile){this.root.style.width=Math.max(0,view.width-16)+'px';this.root.style.left=view.left+8+'px';this.root.style.top=Math.max(view.top+8,view.top+view.height-this.root.offsetHeight-8)+'px';this.lastMode=mode;this.onDetailsRefresh?.();return;}
      this.root.style.width=Math.min(520,view.width-24)+'px';
      if(!restore&&this.lastMode===mode){const r=this.root.getBoundingClientRect();this.place(r.left,r.top);return;}
      this.lastMode=mode;let saved;try{saved=JSON.parse(localStorage.getItem(this.savedKey)||'null');}catch{}
      if(Number.isFinite(saved?.x)&&Number.isFinite(saved?.y)){this.place(view.left+12+saved.x*Math.max(0,view.width-this.root.offsetWidth-24),view.top+12+saved.y*Math.max(0,view.height-this.root.offsetHeight-24));return;}
      const turn=document.getElementById('turnPanel')?.getBoundingClientRect(),width=this.root.offsetWidth;
      this.place(turn&&turn.left-width-12>=view.left+12?turn.left-width-12:view.left+Math.max(12,(view.width-width)/2),view.top+90);
    }
    close(restore=false){
      if(!this.visible)return;this.root.hidden=true;this.signature='';this.roomCode=null;this.matchId=null;this.drag=null;this.root.classList.remove('is-dragging');this.updateTriggers();this.onClose?.();
      const usable=node=>node?.isConnected&&node.getClientRects().length&&!node.closest('[inert],[hidden],.is-obscured');
      const target=[this.returnFocus,document.querySelector('.modal-overview-shortcut'),...document.querySelectorAll('.player-properties-button'),document.querySelector('#phoneGameMenu > summary')].find(usable);if(restore&&target)target.focus({preventScroll:true});
    }
  }
  return {Overview,clamp};
});
