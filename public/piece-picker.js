(() => {
 'use strict';
 const pieces=window.MiniopolyPieces,art=window.MiniopolyPieceArt;
 const read=()=>{try{return localStorage.getItem('miniopoly_piece_v1');}catch{return null;}};
 class PiecePicker{
  constructor({onChange=()=>{}}={}){
   this.onChange=onChange;this.active='create';this.enabled=true;this.busy=false;this.request=null;
   this.selections={create:pieces.valid(read())?read():'🐱',join:pieces.valid(read())?read():'🐶'};
   this.availability={code:'',status:'empty',players:[],message:''};
   this.card=document.querySelector('.welcome-card');this.layout=document.createElement('div');this.layout.className='entry-layout';this.card.before(this.layout);this.layout.append(this.card);
   this.node=document.createElement('dialog');this.node.id='pieceChooser';this.node.className='entry-chooser piece-picker';this.node.setAttribute('aria-labelledby','piecePickerHeading');
   this.node.innerHTML='<section class="entry-chooser-content"><header><div><h2 id="piecePickerHeading">Choose your game piece</h2><p>This is the piece you’ll move around the board.</p></div><button type="button" data-piece-close aria-label="Close game piece choices">×</button></header><div class="entry-chooser-body"><div class="piece-options" role="radiogroup" aria-label="Choose your game piece"></div><p class="piece-status" role="status" aria-live="polite"></p></div><footer>Choose a piece to use it. Confirm your selection on the setup screen.</footer></section>';
   document.body.append(this.node);this.track=this.node.querySelector('.piece-options');this.buttons=new Map();
   for(const item of pieces.choices){
    const button=document.createElement('button');button.type='button';button.className='piece-tile';button.dataset.piece=item.symbol;button.setAttribute('role','radio');button.setAttribute('aria-label',item.name);
    button.innerHTML='<span class="piece-check" aria-hidden="true">✓</span><span class="piece-art"></span><strong></strong><small></small>';
    button.querySelector('.piece-art').innerHTML=art.art(item.symbol,'normal');button.querySelector('strong').textContent=item.name;
    button.onclick=()=>this.choose(item.symbol);button.onmouseenter=()=>this.preview(item.symbol);button.onmouseleave=()=>this.stopPreview(button);button.onfocus=()=>this.preview(item.symbol);button.onblur=()=>this.stopPreview(button);
    this.buttons.set(item.symbol,button);this.track.append(button);
   }
   this.node.querySelector('[data-piece-close]').onclick=()=>this.closeChooser();
   this.node.onclick=event=>{if(event.target===this.node)this.closeChooser();};this.node.addEventListener('close',()=>this.buttons.forEach(button=>this.stopPreview(button)));
   for(const form of ['create','join'])document.getElementById(form+'AvatarPicker').querySelector('[data-piece-open]').onclick=()=>this.openChooser(form);
   this.track.onkeydown=event=>{
    if(!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();const available=[...this.buttons.values()].filter(button=>!button.disabled);if(!available.length)return;
    const index=available.indexOf(document.activeElement),direction=['ArrowUp','ArrowLeft'].includes(event.key)?-1:1;
    const button=event.key==='Home'?available[0]:event.key==='End'?available.at(-1):available[(Math.max(0,index)+direction+available.length)%available.length];button.focus();this.choose(button.dataset.piece,false);
   };
   this.code=document.getElementById('joinCode');this.code.addEventListener('input',()=>this.codeChanged());this.render();
   this.timer=setInterval(()=>void this.refresh(),3000);
   this.resetPreviewLoop();
   matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',()=>{if(this.reduced())this.stopPreviews();});
   document.addEventListener('visibilitychange',()=>{if(document.hidden){this.cancel();this.stopPreviews();}else{void this.refresh();this.previewSelection();}});window.addEventListener('pagehide',()=>{this.cancel();this.closeChooser();this.stopPreviews();});
  }
  selection(form=this.active){return this.selections[form];}
  codeValue(){return this.code.value.trim().toUpperCase();}
  owner(symbol){return this.active==='join'?this.availability.players.find(p=>p.piece===symbol):null;}
  isReady(form){return pieces.valid(this.selections[form])&&(form==='create'||(this.availability.code===this.codeValue()&&this.availability.status==='ready'&&this.availability.players.length<this.availability.capacity&&!this.availability.players.some(p=>p.piece===this.selections.join)));}
  setBusy(value){this.busy=value;this.render();}
  setActive(form,enabled=true){
   const changed=form!==this.active||enabled!==this.enabled;this.active=form;this.enabled=enabled;
   if(changed){this.closeChooser();this.cancel();this.render();if(enabled&&form==='join')void this.refresh();}
  }
  openChooser(form=this.active){
   if(this.busy||!this.enabled)return;this.setActive(form);this.render();if(!this.node.open)this.node.showModal();
   this.previewSelection();
   const button=this.buttons.get(this.selection());(button&&!button.disabled?button:[...this.buttons.values()].find(b=>!b.disabled))?.focus();
  }
  closeChooser(){if(this.node.open)this.node.close();}
  choose(symbol,close=true){
   const button=this.buttons.get(symbol);if(!button||button.disabled)return;
   if(this.selections[this.active]!==symbol){this.selections[this.active]=symbol;try{localStorage.setItem('miniopoly_piece_v1',symbol);}catch{}this.onChange(this.active);}
   this.render();if(close)this.closeChooser();else this.preview(symbol);this.resetPreviewLoop();this.previewSelection();
  }
  reduced(){try{if(JSON.parse(localStorage.getItem('miniopoly_personal_options_v1'))?.motion==='reduce')return true;}catch{}return matchMedia('(prefers-reduced-motion: reduce)').matches;}
  resetPreviewLoop(){clearInterval(this.previewLoop);this.previewLoop=setInterval(()=>this.previewSelection(),2000);}
  animatePreview(node){
   this.stopPreview(node);const rig=node.querySelector('.token-art');if(!rig)return;
   // Restart CSS motion even when another preview was already running.
   void rig.offsetWidth;node.classList.add('is-previewing');rig.classList.add('is-moving');
   node.previewTimer=setTimeout(()=>{
    rig.classList.remove('is-moving');node.classList.remove('is-previewing');if(rig.hasAttribute('data-tire-tracks'))rig.classList.add('is-arriving');
    if(rig.hasAttribute('data-flight')){rig.classList.add('is-landing');node.landingTimer=setTimeout(()=>rig.classList.remove('is-landing'),480);}
   },1300);
  }
  preview(symbol){
   const button=this.buttons.get(symbol);if(!button||button.disabled||this.reduced())return;
   this.animatePreview(button);
  }
  previewSelection(){
   if(!this.enabled||this.busy||document.hidden||this.reduced()){this.stopPreviews();return;}
   const root=document.getElementById(this.active+'AvatarPicker'),trigger=root.querySelector('[data-piece-open]');
   if(trigger.disabled||trigger.classList.contains('is-taken')||!root.getClientRects().length)return;
   this.animatePreview(root.querySelector('[data-piece-current]'));
   if(this.node.open)this.preview(this.selection());
  }
  stopPreview(node){
   clearTimeout(node.previewTimer);clearTimeout(node.landingTimer);node.classList.remove('is-previewing');
   node.querySelector('.token-art')?.classList.remove('is-moving','is-landing','is-arriving');
  }
  stopPreviews(){
   this.buttons.forEach(button=>this.stopPreview(button));
   for(const form of ['create','join'])this.stopPreview(document.getElementById(form+'AvatarPicker').querySelector('[data-piece-current]'));
  }
  focus(form){this.setActive(form);if(form==='join'&&!/^[A-Z2-9]{6}$/.test(this.codeValue()))this.code.focus();else this.openChooser(form);}
  message(){return this.active==='create'?'':this.availability.status==='empty'?'Enter the room code to check available pieces.':this.availability.status==='loading'?'Checking the room’s pieces…':this.availability.status==='error'?this.availability.message:this.availability.players.length>=this.availability.capacity?'This room is full.':this.owner(this.selection())?pieces.resolve(this.selection()).name+' is taken. Choose another piece.':'Room checked. Choose an available piece.';}
  render(){
   const selected=this.selection(),selectedAvailable=!this.busy&&!this.owner(selected),firstFree=[...this.buttons.values()].find(b=>!this.owner(b.dataset.piece));
   for(const [symbol,button] of this.buttons){
    const owner=this.owner(symbol),chosen=symbol===selected;
    button.disabled=this.busy||Boolean(owner);button.classList.toggle('is-selected',chosen);button.classList.toggle('is-taken',Boolean(owner));button.setAttribute('aria-checked',String(chosen));
    button.tabIndex=!button.disabled&&(chosen||!selectedAvailable&&button===firstFree)?0:-1;
    const status=owner?'Chosen by '+owner.name:chosen?'Selected':this.active==='join'&&this.availability.status!=='ready'?'Choose':'Available';
    button.querySelector('small').textContent=status;button.title=pieces.resolve(symbol).name+' · '+status;button.setAttribute('aria-label',pieces.resolve(symbol).name+' · '+status);
    if(button.disabled)this.stopPreview(button);
   }
   const message=this.message();this.node.querySelector('.piece-status').textContent=message;
   for(const form of ['create','join']){
    const root=document.getElementById(form+'AvatarPicker'),trigger=root.querySelector('[data-piece-open]'),piece=pieces.resolve(this.selection(form)),owner=form==='join'?this.availability.players.find(p=>p.piece===piece.symbol):null;
    const current=root.querySelector('[data-piece-current]');if(current.dataset.piece!==piece.symbol){this.stopPreview(current);current.innerHTML=art.art(piece.symbol,'normal');current.dataset.piece=piece.symbol;}if(this.busy||!this.enabled||owner||form!==this.active)this.stopPreview(current);root.querySelector('[data-piece-selected]').textContent=piece.name;
    trigger.disabled=this.busy||!this.enabled;trigger.classList.toggle('is-taken',Boolean(owner));trigger.setAttribute('aria-label','Change game piece, selected '+piece.name+(owner?', chosen by '+owner.name:''));
    root.querySelector('[data-piece-status]').textContent=form==='join'?message:'';
   }
  }
  recheck(){this.availability.status='loading';this.onChange('join');this.render();void this.refresh(true);}
  cancel(){this.request?.controller.abort();this.request=null;}
  codeChanged(){
   this.cancel();this.availability={code:this.codeValue(),status:'empty',players:[],message:''};this.onChange('join');this.render();clearTimeout(this.debounce);this.debounce=setTimeout(()=>void this.refresh(),250);
  }
  async refresh(force=false){
   if(!this.enabled||this.active!=='join'||document.hidden)return;
   const code=this.codeValue();if(!/^[A-Z2-9]{6}$/.test(code)){if(this.availability.status!=='empty')this.codeChanged();return;}
   if(this.request?.code===code&&!force)return;this.cancel();
   if(this.availability.code!==code){this.availability={code,status:'loading',players:[],message:''};this.onChange('join');}
   if(this.availability.status!=='ready'){this.availability.status='loading';this.render();}
   const request={code,controller:new AbortController()};this.request=request;const timer=setTimeout(()=>request.controller.abort(),4000);
   try{
    const response=await fetch('/api/pieces',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code}),signal:request.controller.signal}),data=await response.json();
    if(this.request!==request||this.codeValue()!==code||this.active!=='join'||!this.enabled)return;
    if(!response.ok)throw Error(data.error||'Could not check the room.');
    if(data.code!==code||!Array.isArray(data.players))throw Error('Could not verify the room’s pieces.');
    const before=this.isReady('join');this.availability={code,status:'ready',players:data.players,capacity:data.capacity,message:''};
    if(before!==this.isReady('join'))this.onChange('join');this.render();
   }catch(error){
    if(this.request!==request||this.codeValue()!==code)return;
    this.availability={code,status:'error',players:[],message:error.name==='AbortError'?'The room check timed out. Trying again…':error.message};this.onChange('join');this.render();
   }finally{clearTimeout(timer);if(this.request===request)this.request=null;}
  }
 }
 window.MiniopolyPiecePicker=PiecePicker;
})();
