/* Local, read-only ocean rendering. Lighting follows a slowly rocking height field. */
(()=>{
 'use strict';
 const surfaces=[];let time=0,last=0,capture=false;
 function make(canvas){
  const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)return null;
  const data={canvas,ctx,width:0,height:0,frame:null,x:[]};
  data.resize=()=>{const box=canvas.getBoundingClientRect(),w=Math.max(90,Math.min(540,Math.round(box.width*.58))),h=Math.max(70,Math.round(w*box.height/Math.max(1,box.width)));if(w===data.width&&h===data.height)return;canvas.width=data.width=w;canvas.height=data.height=h;data.frame=ctx.createImageData(w,h);data.x=[.012,-.025,.087].map(k=>({sin:Float32Array.from({length:w},(_,i)=>Math.sin(i*k)),cos:Float32Array.from({length:w},(_,i)=>Math.cos(i*k))}));};
  data.draw=t=>{data.resize();const {width:w,height:h,frame,x}=data,p=frame.data,rock=Math.sin(t*.22)*.65,phase=[rock,Math.sin(t*.17+1.2)*.5,Math.sin(t*.31)*.55];
   for(let y=0;y<h;y++){
    const a=y*.026+Math.sin(y*.011)*.8+phase[0],b=y*.013+Math.sin(y*.019+1)*.6+phase[1],c=y*.055+Math.sin(y*.008)*1.2+phase[2],sa=Math.sin(a),ca=Math.cos(a),sb=Math.sin(b),cb=Math.cos(b),sc=Math.sin(c),cc=Math.cos(c);
    for(let i=0;i<w;i++){
     const s1=x[0].sin[i]*ca+x[0].cos[i]*sa,c1=x[0].cos[i]*ca-x[0].sin[i]*sa,s2=x[1].sin[i]*cb+x[1].cos[i]*sb,c2=x[1].cos[i]*cb-x[1].sin[i]*sb,s3=x[2].sin[i]*cc+x[2].cos[i]*sc,c3=x[2].cos[i]*cc-x[2].sin[i]*sc;
     const dx=.17*c1-.12*c2+.025*c3,dy=.36*c1+.17*c2+.035*c3,inv=1/Math.sqrt(1+dx*dx+dy*dy),nx=-dx*inv,ny=-dy*inv,nz=inv;
     const diffuse=Math.max(0,nx*-.24+ny*-.68+nz*.69),dot=Math.max(0,nx*-.12+ny*-.37+nz*.92),d2=dot*dot,d4=d2*d2,d8=d4*d4,spec=d8*d8*d8*d4;
     const crest=Math.max(0,(s1*.55+s2*.45-.72)/.28),foam=crest*crest*Math.max(0,s3-.3)*.24,shade=.70+diffuse*.25+(s1*.55+s2*.3)*.07,depth=(y/h)*.12;
     const r=(12+diffuse*13)*shade+spec*23+foam*110,g=(91+diffuse*36-depth*24)*shade+spec*38+foam*120,bv=(124+diffuse*28-depth*16)*shade+spec*38+foam*100,j=(y*w+i)*4;
     p[j]=Math.min(220,r);p[j+1]=Math.min(242,g);p[j+2]=Math.min(246,bv);p[j+3]=255;
    }
   }
   ctx.putImageData(frame,0,0);
  };data.draw(0);return data;
 }
 function init(){for(const canvas of document.querySelectorAll('.ocean-surface')){const surface=make(canvas);if(surface)surfaces.push(surface);}requestAnimationFrame(tick);}
 function tick(now){if(!last)last=now;const delta=Math.min(60,now-last);last=now;const stopped=document.body.classList.contains('paused')||document.body.classList.contains('reduced')||matchMedia('(prefers-reduced-motion: reduce)').matches||document.hidden;if(!stopped&&!capture)time+=delta/1000;if(!capture&&(!stopped||surfaces.some(s=>!s.frame)))for(const s of surfaces)s.draw(time);requestAnimationFrame(tick);}
 window.renderOceansAt=t=>{capture=true;time=t;for(const s of surfaces)s.draw(t);};
 new ResizeObserver(()=>{for(const s of surfaces){s.resize();s.draw(time);}}).observe(document.documentElement);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
