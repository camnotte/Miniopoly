(()=>{'use strict';const $=id=>document.getElementById(id),heroes=[...document.querySelectorAll('.ship-heading')],media=matchMedia('(prefers-reduced-motion: reduce)');let t=0,last=0,capture=false,paused=false;
const particles=[];for(const svg of document.querySelectorAll('.wake-ship-svg')){const layer=svg.querySelector('.flow-particles');for(const kind of ['near','inner']){const path=svg.querySelector('.'+kind+'-flow'),length=path.getTotalLength();for(let i=0;i<16;i++){const dot=document.createElementNS('http://www.w3.org/2000/svg','ellipse');dot.setAttribute('fill',i%3?'#f3fff4':'#b9f1e5');layer.append(dot);particles.push({dot,path,length,offset:i/16+(kind==='inner'?.027:0),kind});}}}
function reduced(){return $('reduce').checked||media.matches}
function draw(seconds){t=seconds;const mode=$('heading').value,dir=mode==='auto'?(Math.floor(t/6)%2?'left':'right'):mode,negative=dir==='left'||dir==='up';heroes.forEach((h,i)=>{h.dataset.dir=dir;const bob=reduced()?0:Math.sin(t*4.5)*1.5;h.querySelector('.ship-bob').style.transform='translateY('+bob+'px) rotate('+(reduced()?0:Math.sin(t*3)*.5)+'deg)';for(const p of h.querySelectorAll('.flow-path'))p.style.strokeDashoffset=String(-t*100);});
for(const p of particles){const f=(t*.65+p.offset)%1,point=p.path.getPointAtLength(f*p.length);p.dot.setAttribute('cx',point.x);p.dot.setAttribute('cy',point.y+Math.sin(f*22+p.offset*19)*2);p.dot.setAttribute('rx',2.8+Math.sin(f*Math.PI)*3.8);p.dot.setAttribute('ry',1.2+Math.sin(f*Math.PI)*1.5);p.dot.style.opacity=String(Math.min(1,f*12)*(1-f)*.9);}
$('headingLabel').textContent=({right:'→ Sailing right',left:'← Sailing left',up:'↑ Sailing up',down:'↓ Sailing down'})[dir];
$('hero').style.left=(50+(reduced()?0:Math.sin(t*.65)*2))+'%';
// Pass the square markers at a constant rate, carrying across each boundary.
const vertical=dir==='up'||dir==='down',span=(vertical?$('lane').clientHeight:$('lane').clientWidth)+220,q=(t%6)/6*span,progress=negative?span-q:q;
$('mini').style.left=vertical?'50%':(progress-110)+'px';$('mini').style.top=vertical?(progress-110)+'px':'48%';
$('stage').dataset.direction=dir;$('stage').dataset.time=t.toFixed(3);
}
function tick(now){if(!last)last=now;const dt=Math.min(60,now-last)/1000;last=now;if(!capture&&!paused&&!reduced()&&!document.hidden)draw(t+dt);requestAnimationFrame(tick)}
function sync(){document.body.classList.toggle('paused',paused);document.body.classList.toggle('reduced',reduced());$('pause').textContent=paused?'▶ Resume':'Ⅱ Pause';$('pause').setAttribute('aria-pressed',String(paused));draw(t)}
$('pause').onclick=()=>{paused=!paused;sync()};$('replay').onclick=()=>{paused=false;t=0;sync()};$('heading').onchange=()=>draw(t);$('reduce').onchange=sync;media.addEventListener('change',sync);
window.BattleshipWakeMockup=Object.freeze({capture(seconds){capture=true;draw(seconds);renderOceansAt(seconds)},get state(){return {time:t,paused,reduced:reduced(),direction:$('stage').dataset.direction}},get flow(){return particles.map(p=>({fraction:(t*.65+p.offset)%1,x:+p.dot.getAttribute('cx'),y:+p.dot.getAttribute('cy')}))}});sync();requestAnimationFrame(tick);
})();
