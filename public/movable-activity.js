'use strict';
(()=>{
  function clampPosition(x,y,size,view){return {x:Math.round(Math.max(view.left+12,Math.min(view.left+view.width-size.width-12,x))),y:Math.round(Math.max(view.top+12,Math.min(view.top+view.height-size.height-12,y)))};}
  function defaultPosition(size,view,rail){
    const bottom=view.top+view.height-12;
    const fitsBelow=rail&&rail.bottom+10+size.height<=bottom,below=fitsBelow?rail.bottom+10:bottom-size.height-(view.width<=850?64:0);
    const left=rail&&!fitsBelow&&view.width>850?rail.right+10:view.left+12;
    return clampPosition(left,below,size,view);
  }
  if(typeof module!=='undefined')module.exports={clampPosition,defaultPosition};
  if(typeof window==='undefined')return;
  window.MiniopolyMovableActivity=class{
    constructor(panel){
      this.panel=panel;this.handle=document.getElementById('matchActivityHandle');this.toggle=document.getElementById('matchActivityToggle');this.body=document.getElementById('matchActivityBody');this.log=document.getElementById('activityLog');this.rail=document.getElementById('desktopQuickActions');
      try{this.collapsed=localStorage.getItem('miniopoly_activity_collapsed_v1')==='true';}catch{this.collapsed=false;}
      this.applyCollapsed();
      this.toggle.onclick=()=>this.setCollapsed(!this.collapsed);
      document.getElementById('matchActivityReset').onclick=()=>{try{for(const mode of ['phone','desktop'])localStorage.removeItem('miniopoly_activity_position_'+mode+'_v1');}catch{}this.position();};
      this.handle.addEventListener('pointerdown',event=>{
        if(event.button!==0)return;event.preventDefault();this.handle.focus({preventScroll:true});
        const r=panel.getBoundingClientRect();this.drag={id:event.pointerId,x:event.clientX,y:event.clientY,left:r.left,top:r.top};this.handle.setPointerCapture(event.pointerId);panel.classList.add('is-dragging');
      });
      this.handle.addEventListener('pointermove',event=>{if(this.drag?.id===event.pointerId)this.place(this.drag.left+event.clientX-this.drag.x,this.drag.top+event.clientY-this.drag.y);});
      for(const type of ['pointerup','pointercancel','lostpointercapture'])this.handle.addEventListener(type,event=>{if(this.drag?.id!==event.pointerId)return;this.drag=null;panel.classList.remove('is-dragging');if(this.handle.hasPointerCapture(event.pointerId))this.handle.releasePointerCapture(event.pointerId);this.save();});
      this.handle.addEventListener('keydown',event=>{
        const step=event.shiftKey?40:10,delta={ArrowLeft:[-step,0],ArrowRight:[step,0],ArrowUp:[0,-step],ArrowDown:[0,step]}[event.key];if(!delta)return;event.preventDefault();event.stopPropagation();const r=panel.getBoundingClientRect();this.place(r.left+delta[0],r.top+delta[1]);this.save();
      });
      panel.addEventListener('keydown',event=>{if(event.key==='Escape'&&!this.collapsed){event.preventDefault();event.stopPropagation();this.setCollapsed(true);this.toggle.focus({preventScroll:true});}});
      const schedule=()=>{if(this.frame)return;this.frame=requestAnimationFrame(()=>{this.frame=null;this.position();});};
      addEventListener('resize',schedule);addEventListener('scroll',schedule,{passive:true});window.visualViewport?.addEventListener('resize',schedule);window.visualViewport?.addEventListener('scroll',schedule);
      this.observer=new ResizeObserver(schedule);this.observer.observe(panel);this.observer.observe(this.rail);
      document.fonts?.ready.then(schedule);
    }
    viewport(){const vp=window.visualViewport;return {left:vp?.offsetLeft||0,top:vp?.offsetTop||0,width:vp?.width||innerWidth,height:vp?.height||innerHeight};}
    key(){return 'miniopoly_activity_position_'+(this.viewport().width<=850?'phone':'desktop')+'_v1';}
    size(){return {width:this.panel.offsetWidth,height:this.panel.offsetHeight};}
    place(x,y){const p=clampPosition(x,y,this.size(),this.viewport());Object.assign(this.panel.style,{left:p.x+'px',top:p.y+'px',right:'auto',bottom:'auto'});}
    save(){const view=this.viewport(),size=this.size(),r=this.panel.getBoundingClientRect();try{localStorage.setItem(this.key(),JSON.stringify({x:(r.left-view.left-12)/Math.max(1,view.width-size.width-24),y:(r.top-view.top-12)/Math.max(1,view.height-size.height-24)}));}catch{}}
    applyCollapsed(){this.body.hidden=this.collapsed;this.panel.classList.toggle('is-minimized',this.collapsed);this.toggle.textContent=this.collapsed?'+':'−';this.toggle.setAttribute('aria-expanded',String(!this.collapsed));this.toggle.setAttribute('aria-label',this.collapsed?'Restore match activity':'Minimize match activity');this.toggle.title=this.collapsed?'Restore':'Minimize';}
    setCollapsed(value){
      const r=this.panel.getBoundingClientRect();
      if(value&&!this.collapsed){const top=this.log.getBoundingClientRect().top;this.reading=this.log.scrollTop>0?[...this.log.children].map(n=>({text:n.textContent,offset:n.getBoundingClientRect().top-top,bottom:n.getBoundingClientRect().bottom})).find(n=>n.bottom>top):null;if(this.body.contains(document.activeElement))this.toggle.focus({preventScroll:true});}
      this.collapsed=!!value;this.applyCollapsed();try{localStorage.setItem('miniopoly_activity_collapsed_v1',String(this.collapsed));}catch{}
      if(!this.panel.hidden){this.place(r.left,r.top);this.save();}
      if(!this.collapsed&&this.reading){const anchor=[...this.log.children].find(n=>n.textContent===this.reading.text);if(anchor)this.log.scrollTop+=anchor.getBoundingClientRect().top-this.log.getBoundingClientRect().top-this.reading.offset;this.reading=null;}
    }
    update(visible){this.panel.hidden=!visible;if(visible)this.position();}
    open(){if(this.panel.hidden)return;this.setCollapsed(false);this.position();this.log.focus({preventScroll:true});}
    position(){
      if(this.panel.hidden||this.drag)return;
      const view=this.viewport();this.panel.style.maxHeight=Math.max(60,view.height-24)+'px';this.panel.style.maxWidth=Math.max(100,view.width-24)+'px';
      const size=this.size();let saved;try{saved=JSON.parse(localStorage.getItem(this.key())||'null');}catch{}
      if(Number.isFinite(saved?.x)&&Number.isFinite(saved?.y)){this.place(view.left+12+saved.x*Math.max(0,view.width-size.width-24),view.top+12+saved.y*Math.max(0,view.height-size.height-24));return;}
      const rail=this.rail.getClientRects().length?this.rail.getBoundingClientRect():null,p=defaultPosition(size,view,rail);this.place(p.x,p.y);
    }
  };
})();
