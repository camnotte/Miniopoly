/* Native disclosure navigation. Match rules and actions stay in app.js. */
(()=>{
 'use strict';
 class GameMenu{
  constructor(root,{onVolume,onMotion}={}){
   this.root=root;this.content=root.querySelector('#phoneMenuItems');this.trigger=root.querySelector(':scope > summary');this.categories=[...root.querySelectorAll('.game-menu-category')];
   this.volume=root.querySelector('#menuVolume');this.motion=root.querySelector('#menuMotion');
   this.volume.oninput=()=>onVolume(Number(this.volume.value));this.motion.onchange=()=>onMotion(this.motion.value);
   for(const category of this.categories){
    category.addEventListener('toggle',()=>{if(category.open)for(const other of this.categories)if(other!==category)other.open=false;this.expanded(category);});
   }
   for(const detail of root.querySelectorAll('.menu-disclosure'))detail.addEventListener('toggle',()=>this.expanded(detail));
   this.content.addEventListener('click',event=>{
    const button=event.target.closest('button,a');if(!button||button.disabled)return;
    if(button.hasAttribute('data-menu-close')){this.close(true);return;}
    if(button.closest('[data-menu-keep],#menuQuickTools,#menuInvite,#menuSeatTools')||button.type==='submit')return;
    this.close(false);
   });
   root.addEventListener('toggle',()=>{document.body.classList.toggle('game-menu-open',root.open);if(root.open){this.content.scrollTop=0;this.position();}else this.collapse();});
   document.addEventListener('pointerdown',event=>{if(root.open&&!root.contains(event.target))this.close(false);});
   root.addEventListener('focusout',()=>{setTimeout(()=>{if(root.open&&!root.contains(document.activeElement))this.close(false);},0);});
   root.addEventListener('keydown',event=>this.key(event));window.addEventListener('resize',()=>this.position());window.addEventListener('miniopoly-font-change',()=>this.position());
   this.position();
  }
  expanded(detail){detail.querySelector(':scope > summary')?.setAttribute('aria-expanded',String(detail.open));}
  collapse(){for(const detail of this.root.querySelectorAll('#phoneMenuItems details')){detail.open=false;this.expanded(detail);}}
  close(focus){this.root.open=false;document.body.classList.remove('game-menu-open');this.collapse();if(focus)this.trigger.focus();}
  position(){if(!this.root.open)return;const rect=this.content.getBoundingClientRect();this.root.classList.toggle('menu-inline',innerWidth<=850||rect.left<350||innerHeight-Math.max(0,rect.top)-14<450);this.content.style.setProperty('--menu-room',Math.max(180,innerHeight-Math.max(0,rect.top)-14)+'px');}
  preferences(prefs){this.volume.value=String(prefs.volume);this.root.querySelector('#menuVolumeValue').textContent=prefs.volume+'%';this.motion.value=prefs.motion==='reduce'?'reduce':'system';}
  key(event){
   if(event.defaultPrevented)return;
   if(event.key==='Escape'){
    const nested=[...this.root.querySelectorAll('#phoneMenuItems details[open]')].reverse().find(d=>!d.classList.contains('game-menu-category'));
    const opened=nested||this.categories.find(d=>d.open);event.preventDefault();event.stopImmediatePropagation();
    if(opened){opened.open=false;this.expanded(opened);opened.querySelector(':scope > summary').focus();}else this.close(true);return;
   }
   if(event.target.matches('input,select,textarea,[contenteditable="true"]'))return;
   const summary=event.target.closest('summary'),category=summary?.parentElement;
   if(category?.classList.contains('game-menu-category')&&event.key==='ArrowLeft'&&!this.root.classList.contains('menu-inline')){event.preventDefault();category.open=true;for(const other of this.categories)if(other!==category)other.open=false;category.querySelector('.game-menu-submenu button:not([hidden]):not(:disabled),.game-menu-submenu summary')?.focus();}
   else if(event.key==='ArrowRight'&&!this.root.classList.contains('menu-inline')){const parent=event.target.closest('.game-menu-category[open]');if(parent){event.preventDefault();parent.open=false;parent.querySelector(':scope > summary').focus();}}
   else if(summary&&this.categories.includes(category)&&['ArrowDown','ArrowUp','Home','End'].includes(event.key)){event.preventDefault();let index=this.categories.indexOf(category);index=event.key==='Home'?0:event.key==='End'?this.categories.length-1:(index+(event.key==='ArrowDown'?1:-1)+this.categories.length)%this.categories.length;this.categories[index].querySelector(':scope > summary').focus();}
  }
 }
 window.MiniopolyGameMenu=GameMenu;
})();
