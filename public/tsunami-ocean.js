/* Tsunami visual scene. Read-only; the server owns every landing and wave. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MiniopolyTsunamiOcean=api;})(typeof window==='undefined'?globalThis:window,()=>{
 'use strict';
const APPROACH="<span class=\"deck-approach\" aria-hidden=\"true\"><svg viewBox=\"0 0 300 150\" preserveAspectRatio=\"none\"><path d=\"M-5 66Q28 43 62 59T130 55T199 58T305 47L305 150H-5Z\" fill=\"#56c4d4\" fill-opacity=\".36\"/><path d=\"M-5 66Q28 43 62 59T130 55T199 58T305 47\" fill=\"none\" stroke=\"#e2fff6\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-dasharray=\"39 7 19 4 28 9\"/><path d=\"M-5 79Q28 57 62 73T130 69T199 72T305 61\" fill=\"none\" stroke=\"#b4f1ee\" stroke-opacity=\".55\" stroke-width=\"2\"/></svg></span>";
const WASH="<span class=\"deck-wash\" aria-hidden=\"true\"><span class=\"deck-swash\"><svg viewBox=\"0 0 300 200\" preserveAspectRatio=\"none\"><defs><linearGradient id=\"card-water-0\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop stop-color=\"#dafff1\" stop-opacity=\".65\"/><stop offset=\".15\" stop-color=\"#8de1df\" stop-opacity=\".76\"/><stop offset=\".6\" stop-color=\"#258aa7\" stop-opacity=\".85\"/><stop offset=\"1\" stop-color=\"#126c8e\" stop-opacity=\".92\"/></linearGradient></defs><path d=\"M-8 23Q24 6 53 20T113 17T174 22T238 15T308 19V205H-8Z\" fill=\"url(#card-water-0)\"/><path d=\"M-8 23Q24 6 53 20T113 17T174 22T238 15T308 19\" fill=\"none\" stroke=\"#f2fff1\" stroke-width=\"4.5\" stroke-linecap=\"round\" stroke-dasharray=\"27 2 16 3 11 2 24 4\"/><path d=\"M-8 32Q24 15 53 29T113 26T174 31T238 24T308 28\" fill=\"none\" stroke=\"#cefff1\" stroke-width=\"2\" stroke-opacity=\".7\" stroke-dasharray=\"11 9 24 7\"/><g fill=\"#effff3\" fill-opacity=\".85\"><circle cx=\"28\" cy=\"27\" r=\"2\"/><circle cx=\"50\" cy=\"34\" r=\"1.5\"/><circle cx=\"85\" cy=\"24\" r=\"2.2\"/><circle cx=\"121\" cy=\"36\" r=\"1.8\"/><circle cx=\"161\" cy=\"27\" r=\"2.3\"/><circle cx=\"204\" cy=\"37\" r=\"1.4\"/><circle cx=\"237\" cy=\"24\" r=\"2\"/><circle cx=\"270\" cy=\"32\" r=\"1.8\"/></g></svg></span><span class=\"deck-wet-edge\"></span></span>";
const SHORE="<svg viewBox=\"0 0 300 240\" xmlns=\"http://www.w3.org/2000/svg\" preserveAspectRatio=\"none\"><defs><linearGradient id=\"wash\" x2=\"0\" y2=\"1\"><stop stop-color=\"#d8fff2\" stop-opacity=\".7\"/><stop offset=\".13\" stop-color=\"#9bdddb\" stop-opacity=\".66\"/><stop offset=\".55\" stop-color=\"#3fa6bc\" stop-opacity=\".76\"/><stop offset=\"1\" stop-color=\"#207e9e\" stop-opacity=\".82\"/></linearGradient></defs><path d=\"M-5 27Q23 12 48 24T96 23T144 24T194 21T242 22T305 18V245H-5Z\" fill=\"url(#wash)\"/><path d=\"M-5 27Q23 12 48 24T96 23T144 24T194 21T242 22T305 18\" fill=\"none\" stroke=\"#f1fff2\" stroke-width=\"5\" stroke-linecap=\"round\" stroke-dasharray=\"23 2 16 1 12 2\"/><path d=\"M-5 34Q31 24 58 34T112 32T169 33T222 30T305 30\" fill=\"none\" stroke=\"#d7fff2\" stroke-opacity=\".65\" stroke-width=\"2\" stroke-dasharray=\"16 6 7 7\"/><g fill=\"#f1fff3\" opacity=\".7\"><circle cx=\"9\" cy=\"33\" r=\"1.5\"/><circle cx=\"17\" cy=\"40\" r=\"1.2\"/><circle cx=\"26\" cy=\"37\" r=\"2\"/><circle cx=\"43\" cy=\"30\" r=\"1.3\"/><circle cx=\"58\" cy=\"39\" r=\"1.4\"/><circle cx=\"89\" cy=\"32\" r=\"1.8\"/><circle cx=\"110\" cy=\"40\" r=\"1.2\"/><circle cx=\"146\" cy=\"36\" r=\"1.7\"/><circle cx=\"162\" cy=\"41\" r=\"1.3\"/><circle cx=\"206\" cy=\"34\" r=\"1.5\"/><circle cx=\"224\" cy=\"39\" r=\"1.2\"/><circle cx=\"273\" cy=\"33\" r=\"1.5\"/><circle cx=\"71\" cy=\"40\" r=\"2.5\"/><circle cx=\"123\" cy=\"36\" r=\"2\"/><circle cx=\"185\" cy=\"40\" r=\"2.5\"/><circle cx=\"251\" cy=\"35\" r=\"2\"/></g></svg>";
 function make(canvas){
  const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)return null;
  const data={canvas,ctx,width:0,height:0,frame:null,x:[],time:0,texture:new Image()};
  data.texture.src='/art/ocean-surface.png?v=0.3.102';
  data.texture.onload=()=>{if(canvas.isConnected)data.draw(data.time);data.texture.onload=null;};
  data.resize=()=>{const box=canvas.getBoundingClientRect(),cap=data.texture.complete&&data.texture.naturalWidth?768:384,w=Math.max(90,Math.min(cap,Math.round(box.width*(cap===768?.8:.5)))),h=Math.max(70,Math.round(w*box.height/Math.max(1,box.width)));if(w===data.width&&h===data.height)return;canvas.width=data.width=w;canvas.height=data.height=h;data.frame=ctx.createImageData(w,h);data.x=[.022,-.047,.14].map((k,index)=>({sin:Float32Array.from({length:w},(_,i)=>{const x=i*384/w;return Math.sin(x*k+Math.sin(x*.027+index*1.7)*.6);}),cos:Float32Array.from({length:w},(_,i)=>{const x=i*384/w;return Math.cos(x*k+Math.sin(x*.027+index*1.7)*.6);})}));};
  data.draw=t=>{data.time=t;data.resize();const {width:w,height:h,texture,frame,x}=data;
   if(texture.complete&&texture.naturalWidth){
    // A real illustrated surface replaces the old low-resolution parallel bands.
    // Slow cropping gives a gentle rocking motion, with no additional timer.
    const sw=texture.naturalWidth*.90,sh=texture.naturalHeight*.90,sx=(texture.naturalWidth-sw)*(.5+.5*Math.sin(t*.13)),sy=(texture.naturalHeight-sh)*(.5+.5*Math.cos(t*.11));
    ctx.drawImage(texture,sx,sy,sw,sh,0,0,w,h);
    const shade=ctx.createLinearGradient(0,0,0,h);shade.addColorStop(0,'#073e4955');shade.addColorStop(.5,'#043b4540');shade.addColorStop(1,'#063e464d');ctx.fillStyle=shade;ctx.fillRect(0,0,w,h);return;
   }
   const p=frame.data,rock=Math.sin(t*.32)*1.05,phase=[rock,Math.sin(t*.23+1.2)*.85,t*.7];
   for(let y=0;y<h;y++){
    const yn=y*355/h,a=yn*.037+Math.sin(yn*.011)*.8+phase[0],b=yn*.021+Math.sin(yn*.019+1)*.6+phase[1],c=yn*.095+Math.sin(yn*.008)*1.2+phase[2],sa=Math.sin(a),ca=Math.cos(a),sb=Math.sin(b),cb=Math.cos(b),sc=Math.sin(c),cc=Math.cos(c);
    for(let i=0;i<w;i++){
     const s1=x[0].sin[i]*ca+x[0].cos[i]*sa,c1=x[0].cos[i]*ca-x[0].sin[i]*sa,s2=x[1].sin[i]*cb+x[1].cos[i]*sb,c2=x[1].cos[i]*cb-x[1].sin[i]*sb,s3=x[2].sin[i]*cc+x[2].cos[i]*sc,c3=x[2].cos[i]*cc-x[2].sin[i]*sc;
     const dx=.28*c1-.16*c2+.055*c3,dy=.42*c1+.21*c2+.055*c3,inv=1/Math.sqrt(1+dx*dx+dy*dy),nx=-dx*inv,ny=-dy*inv,nz=inv;
     const diffuse=Math.max(0,nx*-.24+ny*-.68+nz*.69),dot=Math.max(0,nx*-.12+ny*-.37+nz*.92),d2=dot*dot,d4=d2*d2,d8=d4*d4,spec=d8*d8;
     const crest=Math.max(0,1-Math.abs(s1+.23*s2-.82)/.10),foam=crest*(.2+.8*Math.max(0,s3))*.06,shade=.65+diffuse*.28+(s1*.55+s2*.3)*.12,depth=(y/h)*.12;
     const r=(8+diffuse*10)*shade+spec*12+foam*330,g=(77+diffuse*40-depth*24)*shade+spec*23+foam*290,bv=(116+diffuse*35-depth*16)*shade+spec*25+foam*250,j=(y*w+i)*4;
     p[j]=Math.min(240,r);p[j+1]=Math.min(242,g);p[j+2]=Math.min(246,bv);p[j+3]=255;
    }
   }
   ctx.putImageData(frame,0,0);
   // Open, broken crests read as rolling waves rather than closed light rings.
   ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
   const scale=Math.max(.55,Math.min(w,h)/355),bands=[.02,.13,.27,.42,.59,.75,.88,.98];
   for(let band=0;band<bands.length;band++){
    const phase=band*1.37+Math.sin(t*.28+band*.8)*.45,bob=Math.sin(t*.4+band)*h*.012;
    const points=[];
    for(let x=-12;x<=w+12;x+=4){const u=x/w,y=bands[band]*h+bob+Math.sin(u*Math.PI*2.2+phase)*h*.018+Math.sin(u*Math.PI*5.1+phase*.7)*h*.006;points.push([x,y]);}
    const trace=dy=>{ctx.beginPath();points.forEach(([x,y],i)=>{if(i)ctx.lineTo(x,y+dy);else ctx.moveTo(x,y+dy);});};
    ctx.setLineDash([]);trace(4*scale);ctx.strokeStyle='rgba(5,52,78,.25)';ctx.lineWidth=7*scale;ctx.stroke();
    trace(2*scale);ctx.strokeStyle='rgba(73,190,206,.2)';ctx.lineWidth=9*scale;ctx.stroke();
    trace(0);ctx.setLineDash([20*scale,5*scale,8*scale,10*scale,31*scale,6*scale]);ctx.lineDashOffset=-t*3+band*17;ctx.strokeStyle='rgba(220,255,246,'+(.22+.13*(.5+.5*Math.sin(t*.5+band)))+')';ctx.lineWidth=1.4*scale;ctx.stroke();
   }
   ctx.restore();
  };data.draw(0);return data;
 }

 const active=room=>room?.gameMode==='countdown'&&['playing','finished'].includes(room.stage)&&(room.collapse?.wave||0)>0;
 class Painter{
  constructor(onReduced=()=>{}){
   this.onReduced=onReduced;this.surfaces=new Map();this.time=0;this.last=0;this.frame=0;this.disposed=false;
   this.media=matchMedia('(prefers-reduced-motion: reduce)');
   this.sync=()=>{if(this.frame)cancelAnimationFrame(this.frame);this.frame=0;this.last=0;if(this.reduced())this.onReduced();this.draw();if(this.surfaces.size&&!this.reduced()&&!document.hidden&&!this.disposed)this.frame=requestAnimationFrame(t=>this.tick(t));};
   this.resize=new ResizeObserver(()=>this.draw());
   document.addEventListener('visibilitychange',this.sync);this.media.addEventListener('change',this.sync);
  }
  reduced(){return !!window.miniWifiReduceMotion||this.media.matches;}
  set(canvases){
   const next=new Set(canvases);
   for(const [canvas] of this.surfaces)if(!next.has(canvas)){this.resize.unobserve(canvas);this.surfaces.delete(canvas);}
   for(const canvas of next)if(!this.surfaces.has(canvas)){const surface=make(canvas);if(surface){this.surfaces.set(canvas,surface);this.resize.observe(canvas);}}
   if(!this.surfaces.size){if(this.frame)cancelAnimationFrame(this.frame);this.frame=0;this.last=0;return;}
   if(!this.frame)this.sync();
  }
  draw(){for(const surface of this.surfaces.values())if(surface.canvas.isConnected)surface.draw(this.time);}
  tick(now){this.frame=0;if(this.disposed||!this.surfaces.size||document.hidden)return;if(this.reduced()){this.onReduced();return;}
   if(!this.last)this.last=now;
   if(now-this.last>=50){this.time+=Math.min(.1,(now-this.last)/1000);this.last=now;this.draw();}
   this.frame=requestAnimationFrame(t=>this.tick(t));
  }
  dispose(){this.disposed=true;if(this.frame)cancelAnimationFrame(this.frame);this.frame=0;this.resize.disconnect();this.surfaces.clear();document.removeEventListener('visibilitychange',this.sync);this.media.removeEventListener('change',this.sync);}
 }
 let serial=0;
 function canvasLayer(parent,className){let layer=parent.querySelector(':scope > .'+className);if(!layer){layer=document.createElement('div');layer.className=className;layer.setAttribute('aria-hidden','true');layer.append(document.createElement('canvas'));parent.prepend(layer);}return layer.querySelector('canvas');}
 function offset(node,ancestor){let x=0,y=0;for(let current=node;current&&current!==ancestor;current=current.offsetParent){x+=current.offsetLeft;y+=current.offsetTop;const parent=current.offsetParent;if(parent&&parent!==ancestor){x+=parent.clientLeft;y+=parent.clientTop;}}return {x,y};}
 class Scene{
  constructor(board){
   this.board=board;this.wrap=board.closest('.boardwrap');this.room=null;this.on=false;this.animations=new Map();this.painter=new Painter(()=>this.stopContacts());
   this.resize=new ResizeObserver(()=>{if(this.labels?.childElementCount)this.makeLabels();});if(this.wrap)this.resize.observe(this.wrap);
   this.fonts=()=>{if(this.labels?.childElementCount)this.makeLabels();};document.fonts?.addEventListener('loadingdone',this.fonts);
   this.preferences=e=>{if(e.source===window.parent&&e.origin===location.origin&&e.data?.type==='MINI_PLAYER_PREFERENCES'){this.painter.sync();if(this.painter.reduced())this.stopContacts();}};window.addEventListener('message',this.preferences);
   this.systemMotion=()=>{if(this.painter.reduced())this.stopContacts();};this.painter.media.addEventListener('change',this.systemMotion);
   window.addEventListener('pagehide',()=>this.dispose(),{once:true});
  }
  update(room){
   this.room=room;this.on=active(room);document.documentElement.classList.toggle('tsunami-ocean-active',this.on);if(!this.wrap)return;
   this.wrap.classList.toggle('tsunami-ocean-wrap',this.on);
   if(!this.on){
    this.painter.set([]);this.clearLabels();this.stopContacts();
    this.wrap.querySelector(':scope > .tsunami-ocean-surround')?.remove();
    this.board.querySelectorAll('.tsunami-center-ocean,.tsunami-center-status,.tsunami-world-submerged,.tsunami-property-water').forEach(n=>n.remove());
    for(const button of this.board.querySelectorAll('.is-tsunami-deck'))this.cleanDeck(button);
    return;
   }
   // The page supplies the surrounding ocean; paint only inside the board.
   this.wrap.querySelector(':scope > .tsunami-ocean-surround')?.remove();
   const canvases=[],center=this.board.querySelector('.center');
   if(center){
    canvases.push(canvasLayer(center,'tsunami-center-ocean'));
    if(center.querySelector('.board-center-info'))center.querySelectorAll(':scope>.tsunami-center-status,:scope>.tsunami-world-submerged').forEach(n=>n.remove());
    else{
    let status=center.querySelector('.tsunami-center-status');if(!status){status=document.createElement('strong');status.className='tsunami-center-status';center.append(status);}
    status.textContent='TSUNAMI · WAVE '+room.collapse.wave;
    let count=center.querySelector('.tsunami-world-submerged');if(!count){count=document.createElement('span');count.className='tsunami-world-submerged';center.append(count);}
    const lost=Object.keys(room.collapse.lost||{}).filter(id=>id.startsWith(this.board.dataset.world+'-')).length;
    count.textContent=lost+' '+(lost===1?'property':'properties')+' submerged in this world';
    }
    for(const button of center.querySelectorAll('.mini-card-stack'))this.deck(button);
   }
   for(const tile of this.board.querySelectorAll('.tile[data-position]')){
    const lost=!!room.collapse.lost?.[this.board.dataset.world+'-'+tile.dataset.position];let water=tile.querySelector('.tsunami-property-water');
    if(lost&&!water){water=document.createElement('span');water.className='tsunami-property-water';water.setAttribute('aria-hidden','true');
     for(let i=0;i<2;i++){const sheet=document.createElement('span');sheet.className='tsunami-shore-wash'+(i?' tsunami-shore-follow':'');const id='tsunami-shore-'+(++serial);sheet.innerHTML=SHORE.replaceAll('"wash"','"'+id+'"').replaceAll('#wash','#'+id);water.append(sheet);}tile.append(water);
    }else if(!lost)water?.remove();
   }
   this.painter.set(canvases);
   if(this.wrap.querySelector('.miniwifi-walking-piece:not(.miniwifi-roll-origin)'))this.makeLabels();
  }
  deck(button){
   if(button.classList.contains('is-tsunami-deck'))return;button.classList.add('is-tsunami-deck');
   const face=document.createElement('span');face.className='tsunami-deck-face';face.append(...button.childNodes);button.append(face);
   const approach=document.createElement('span');approach.className='tsunami-deck-approach-holder';approach.setAttribute('aria-hidden','true');approach.innerHTML=APPROACH;button.prepend(approach);
   const water=document.createElement('span');water.className='tsunami-deck-wash-holder';water.setAttribute('aria-hidden','true');water.innerHTML=WASH.replaceAll('card-water-0','tsunami-card-water-'+(++serial));face.prepend(water);
  }
  cleanDeck(button){const face=button.querySelector('.tsunami-deck-face');face?.querySelector('.tsunami-deck-wash-holder')?.remove();if(face){button.append(...face.childNodes);face.remove();}button.querySelector('.tsunami-deck-approach-holder')?.remove();button.classList.remove('is-tsunami-deck');}
  anchor(position){
   if(!this.wrap)return null;const tile=this.board.querySelector('.tile[data-position="'+position+'"]');if(!tile)return null;
   if(!this.on){const target=tile.querySelector('.mini518-token-lane')||tile,point=offset(target,this.wrap),x=point.x+target.offsetWidth/2,y=point.y+target.offsetHeight/2;
    return {x,y};}
   const point=offset(tile,this.wrap),title=tile.querySelector('.tile-title'),footer=tile.querySelector('.mini522-property-footer,.mini523-utility-footer,.mini57-price,.price');
   const top=title?title.offsetTop+title.offsetHeight:tile.offsetHeight*.05,bottom=footer?footer.offsetTop:tile.offsetHeight*.94;
   return {x:point.x+tile.offsetWidth/2,y:point.y+(top+bottom)/2};
  }
  clearLabels(){if(this.labels)for(const group of this.labels.children){this.animations.get(group)?.cancel();this.animations.delete(group);}this.labels?.remove();this.labels=null;}
  makeLabels(){
   // Native square text and GO art stay beneath the traveling piece.
   this.clearLabels();
  }

  contact(position,piece){
   if(!this.on||this.painter.reduced())return;
   const tile=this.board.querySelector('.tile[data-position="'+position+'"]');if(!tile)return;
   const weight=piece==='🚀'?1:piece==='school-bus'?.75:.65;
   const frames=[{transform:'none'},{transform:'translateY('+5*weight+'px) rotate('+1.8*weight+'deg)',offset:.17},{transform:'translateY('+(-3*weight)+'px) rotate('+(-1.5*weight)+'deg)',offset:.39},{transform:'translateY('+2*weight+'px) rotate('+weight+'deg)',offset:.63},{transform:'none'}];
   for(const node of [tile,this.labels?.querySelector('[data-position="'+position+'"]')].filter(Boolean)){this.animations.get(node)?.cancel();const animation=node.animate(frames,{duration:850,easing:'ease-in-out'});this.animations.set(node,animation);animation.onfinish=()=>this.animations.delete(node);}
   const point=this.anchor(position),ring=document.createElement('span');ring.className='tsunami-contact-ring';ring.setAttribute('aria-hidden','true');ring.style.left=point.x+'px';ring.style.top=point.y+'px';this.wrap.append(ring);setTimeout(()=>ring.remove(),1000);
  }
  stopContacts(){for(const animation of this.animations.values())animation.cancel();this.animations.clear();this.wrap?.querySelectorAll('.tsunami-contact-ring').forEach(n=>n.remove());}
  dispose(){this.painter.media.removeEventListener('change',this.systemMotion);this.painter.dispose();this.stopContacts();this.clearLabels();this.resize.disconnect();document.fonts?.removeEventListener('loadingdone',this.fonts);window.removeEventListener('message',this.preferences);}
 }
 class PageOcean{
  constructor({getReducedMotion=()=>false}={}){
   this.layer=document.createElement('div');this.layer.id='pageOcean';this.layer.hidden=true;this.layer.setAttribute('aria-hidden','true');this.canvas=document.createElement('canvas');this.layer.append(this.canvas);document.body.prepend(this.layer);
   this.painter=new Painter();const reduced=this.painter.reduced.bind(this.painter);this.painter.reduced=()=>getReducedMotion()||reduced();
   window.addEventListener('pagehide',()=>this.painter.dispose(),{once:true});
  }
  update(room){const on=active(room);this.layer.hidden=!on;document.body.classList.toggle('tsunami-page-ocean',on);this.painter.set(on?[this.canvas]:[]);}
  sync(){this.painter.sync();}
 }
 return {active,Scene,Painter,PageOcean};
});
