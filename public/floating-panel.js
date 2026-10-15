'use strict';
// Device-local window placement only. Game state and actions belong to app.js.
window.MiniopolyFloatingPanel=class {
  constructor(root,{storageKey,home,reset}){
    this.root=root;this.key=storageKey;this.home=home;this.reset=reset;
    this.handle=root.querySelector('.panel-handle');this.body=root.querySelector('.turn-panel-body');
    this.collapse=root.querySelector('[data-panel-collapse]');this.keep=root.querySelector('[data-panel-keep]');
    this.dockButton=root.querySelector('[data-panel-dock]');this.quick=root.querySelector('[data-panel-quick]');
    this.mobile=matchMedia('(max-width: 700px)');this.position={x:12,y:12};
    this.visible=false;this.blocked=false;this.busy=false;this.drag=null;this.timer=null;this.title='Turn panel';
    try{this.saved=JSON.parse(localStorage.getItem(this.key))||{};}catch{this.saved={};}
    if(typeof this.saved!=='object'||Array.isArray(this.saved))this.saved={};
    this.collapsed=typeof this.saved.collapsed==='boolean'?this.saved.collapsed:this.mobile.matches;
    this.dock=this.saved.dock==='top'?'top':'bottom';this.keep.checked=this.saved.keep===true;
    this.refresh();
    for(const name of ['pointerenter','pointermove','pointerdown','focusin','wheel'])root.addEventListener(name,()=>this.wake(),{passive:true});
    root.addEventListener('focusout',()=>setTimeout(()=>this.wake(),0));
    this.handle.addEventListener('pointerdown',event=>{
      if(event.button!==0)return;
      this.drag={id:event.pointerId,x:event.clientX,y:event.clientY,origin:{...this.position}};
      this.handle.setPointerCapture(event.pointerId);root.classList.add('is-dragging');this.wake();
    });
    this.handle.addEventListener('pointermove',event=>{
      if(this.drag?.id!==event.pointerId)return;
      this.place(this.drag.origin.x+event.clientX-this.drag.x,this.drag.origin.y+event.clientY-this.drag.y);
    });
    const end=event=>{
      if(this.drag?.id!==event.pointerId)return;
      this.drag=null;root.classList.remove('is-dragging');
      if(this.handle.hasPointerCapture(event.pointerId))this.handle.releasePointerCapture(event.pointerId);
      if(this.mobile.matches){this.dock=this.position.y+root.offsetHeight/2<innerHeight/2?'top':'bottom';this.snap();}
      this.save();this.wake();
    };
    for(const name of ['pointerup','pointercancel','lostpointercapture'])this.handle.addEventListener(name,end);
    this.handle.addEventListener('keydown',event=>{
      const d={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[event.key];
      if(!d)return;event.preventDefault();
      if(this.mobile.matches){if(d[1]){this.dock=d[1]<0?'top':'bottom';this.snap();}}
      else {const step=event.shiftKey?40:10;this.place(this.position.x+d[0]*step,this.position.y+d[1]*step);}
      this.save();this.wake();
    });
    this.collapse.addEventListener('click',()=>{
      this.collapsed=!this.collapsed;this.refresh();this.constrain();this.save();this.wake();
    });
    this.keep.addEventListener('change',()=>{this.save();this.wake();});
    this.dockButton.addEventListener('click',()=>{this.dock=this.dock==='top'?'bottom':'top';this.snap();this.save();this.wake();});
    reset.addEventListener('click',()=>{
      this.saved={};this.collapsed=this.mobile.matches;this.dock='bottom';this.keep.checked=false;
      this.refresh();this.defaultPosition();this.save();this.wake();
    });
    const resized=()=>{if(this.visible){this.restore();this.sizeHome();}};
    addEventListener('resize',resized);window.visualViewport?.addEventListener('resize',resized);
    this.mobile.addEventListener('change',()=>{this.collapsed=this.mobile.matches;this.refresh();this.restore();});
    new ResizeObserver(()=>{if(this.visible){this.constrain();this.sizeHome();}}).observe(root);
  }
  limits(){return {x:Math.max(12,document.documentElement.clientWidth-this.root.offsetWidth-12),y:Math.max(12,innerHeight-this.root.offsetHeight-12)};}
  place(x,y){
    const max=this.limits();
    this.position={x:Math.round(Math.max(12,Math.min(max.x,x))),y:Math.round(Math.max(12,Math.min(max.y,y)))};
    this.root.style.left=this.position.x+'px';this.root.style.top=this.position.y+'px';
  }
  snap(){
    this.place((document.documentElement.clientWidth-this.root.offsetWidth)/2,this.dock==='top'?12:this.limits().y);
    this.dockButton.textContent=this.dock==='top'?'Move to bottom ↓':'Move to top ↑';
  }
  constrain(){if(this.mobile.matches)this.snap();else this.place(this.position.x,this.position.y);}
  defaultPosition(){
    if(this.mobile.matches){this.snap();return;}
    const rect=this.home.getBoundingClientRect();this.place(rect.left,rect.top);
  }
  restore(){
    if(this.mobile.matches){this.snap();return;}
    if(Number.isFinite(this.saved.x)&&Number.isFinite(this.saved.y)){
      const max=this.limits();this.place(max.x*this.saved.x,max.y*this.saved.y);
    }else this.defaultPosition();
  }
  save(){
    const max=this.limits();
    this.saved={collapsed:this.collapsed,dock:this.dock,keep:this.keep.checked,
      x:this.mobile.matches?this.saved.x:this.position.x/max.x,
      y:this.mobile.matches?this.saved.y:this.position.y/max.y};
    try{localStorage.setItem(this.key,JSON.stringify(this.saved));}catch{}
  }
  sizeHome(){this.home.style.height=this.visible&&!this.mobile.matches?this.root.offsetHeight+'px':'0px';}
  refresh(){
    this.root.classList.toggle('is-collapsed',this.collapsed);this.body.hidden=this.collapsed;this.quick.hidden=!this.collapsed;
    this.collapse.setAttribute('aria-expanded',String(!this.collapsed));
    this.collapse.setAttribute('aria-label',this.collapsed?'Expand turn panel':'Collapse turn panel');
    this.collapse.firstElementChild.textContent=this.collapsed?'+':'−';
    this.root.querySelector('[data-panel-title]').textContent=this.collapsed?this.title:'Turn panel';
    this.sizeHome();
  }
  wake(){
    this.root.classList.remove('is-idle');clearTimeout(this.timer);
    if(!this.visible||this.keep.checked||this.busy||this.blocked||this.drag)return;
    this.timer=setTimeout(()=>{
      if(!this.root.querySelector(':focus-visible'))this.root.classList.add('is-idle');
    },5000);
  }
  update({visible,busy,blocked,title,attention}){
    const shown=visible&&!this.visible,notify=attention!==this.attention,unblocked=this.blocked&&!blocked;
    const idleChanged=this.busy!==busy||this.blocked!==blocked;
    this.visible=visible;this.busy=busy;this.blocked=blocked;this.attention=attention;this.title=title;
    this.root.hidden=!visible;this.root.inert=blocked;this.root.classList.toggle('is-obscured',blocked);
    this.reset.hidden=!visible;this.refresh();
    if(shown)this.restore();
    if(shown||notify||unblocked||idleChanged)this.wake();
    if(!visible)clearTimeout(this.timer);
  }
};
