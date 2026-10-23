'use strict';
(() => {
  function clampPosition(x,y,size,view){
    return {x:Math.round(Math.max(view.left+12,Math.min(view.left+view.width-size.width-12,x))),y:Math.round(Math.max(view.top+12,Math.min(view.top+view.height-size.height-12,y)))};
  }
  function defaultPosition(size,view,turn){
    let x=view.left+view.width-size.width-14,y=view.top+view.height-size.height-72;
    if(turn&&view.width>850){
      if(turn.left-size.width-14>=view.left+12)x=turn.left-size.width-14;
      else if(turn.right+14+size.width<=view.left+view.width-12)x=turn.right+14;
      else if(turn.top-size.height-14>=view.top+12)y=turn.top-size.height-14;
      else x=view.left+12;
    }
    return clampPosition(x,y,size,view);
  }
  if(typeof module!=='undefined')module.exports={clampPosition,defaultPosition};
  if(typeof window==='undefined')return;
  window.MiniopolyMovableChat=class {
    constructor(panel,launcher){
      this.panel=panel;this.launcher=launcher;this.handle=document.getElementById('roomChatHandle');this.turn=document.getElementById('turnPanel');
      this.handle.addEventListener('pointerdown',event=>{
        if(event.button!==0)return;
        const r=panel.getBoundingClientRect();this.drag={id:event.pointerId,x:event.clientX,y:event.clientY,left:r.left,top:r.top};
        this.handle.setPointerCapture(event.pointerId);panel.classList.add('is-dragging');
      });
      this.handle.addEventListener('pointermove',event=>{
        if(this.drag?.id!==event.pointerId)return;
        this.place(this.drag.left+event.clientX-this.drag.x,this.drag.top+event.clientY-this.drag.y);
      });
      for(const event of ['pointerup','pointercancel','lostpointercapture'])this.handle.addEventListener(event,e=>{
        if(this.drag?.id!==e.pointerId)return;
        this.drag=null;panel.classList.remove('is-dragging');if(this.handle.hasPointerCapture(e.pointerId))this.handle.releasePointerCapture(e.pointerId);this.save();
      });
      this.handle.addEventListener('keydown',event=>{
        const step=event.shiftKey?40:10,delta={ArrowLeft:[-step,0],ArrowRight:[step,0],ArrowUp:[0,-step],ArrowDown:[0,step]}[event.key];
        if(!delta)return;event.preventDefault();const r=panel.getBoundingClientRect();this.place(r.left+delta[0],r.top+delta[1]);this.save();
      });
      document.getElementById('roomChatReset').onclick=()=>{for(const mode of ['phone','desktop'])localStorage.removeItem('miniopoly_chat_position_'+mode+'_v1');this.position();};
      const schedule=()=>{if(this.frame)return;this.frame=requestAnimationFrame(()=>{this.frame=null;this.position();});};
      this.observer=new MutationObserver(schedule);this.observer.observe(this.turn,{attributes:true,attributeFilter:['style','class','hidden']});
      new ResizeObserver(schedule).observe(this.turn);
    }
    viewport(){const vp=window.visualViewport;return {left:vp?.offsetLeft||0,top:vp?.offsetTop||0,width:vp?.width||innerWidth,height:vp?.height||innerHeight};}
    key(){return 'miniopoly_chat_position_'+(this.viewport().width<=850?'phone':'desktop')+'_v1';}
    size(){return {width:this.panel.offsetWidth,height:this.panel.offsetHeight};}
    place(x,y){const p=clampPosition(x,y,this.size(),this.viewport());Object.assign(this.panel.style,{left:p.x+'px',top:p.y+'px',right:'auto',bottom:'auto'});}
    save(){const view=this.viewport(),size=this.size(),r=this.panel.getBoundingClientRect();try{localStorage.setItem(this.key(),JSON.stringify({x:(r.left-view.left-12)/Math.max(1,view.width-size.width-24),y:(r.top-view.top-12)/Math.max(1,view.height-size.height-24)}));}catch{}}
    position(){
      const view=this.viewport();this.panel.style.maxHeight=Math.max(100,view.height-24)+'px';
      const turn=this.turn.getClientRects().length&&getComputedStyle(this.turn).visibility!=='hidden'?this.turn.getBoundingClientRect():null;
      const launcherSize={width:this.launcher.offsetWidth,height:this.launcher.offsetHeight};
      const launch=defaultPosition(launcherSize,view,turn);this.launcher.style.left=launch.x+'px';this.launcher.style.top=(view.top+view.height-launcherSize.height-14)+'px';this.launcher.style.right='auto';this.launcher.style.bottom='auto';
      if(this.panel.hidden||this.drag)return;
      const size=this.size();let saved;try{saved=JSON.parse(localStorage.getItem(this.key())||'null');}catch{}
      if(Number.isFinite(saved?.x)&&Number.isFinite(saved?.y)){this.place(view.left+12+saved.x*Math.max(0,view.width-size.width-24),view.top+12+saved.y*Math.max(0,view.height-size.height-24));return;}
      const p=defaultPosition(size,view,turn);this.place(p.x,p.y);
    }
  };
})();
