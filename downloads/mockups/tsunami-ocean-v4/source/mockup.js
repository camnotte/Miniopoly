'use strict';
(()=>{
const $=id=>document.getElementById(id),scene=$('scene'),board=$('board'),floating=$('floatingBoard'),walker=$('walker'),heading=$('pieceHeading'),pieceArt=$('pieceArt');
const colors={Brown:'#92704c',Blue:'#4f9dc4',Pink:'#c87998',Orange:'#dd9c48',Red:'#c56960',Yellow:'#d8bf54',Green:'#5d9d76',Navy:'#4c6a9b'};
let world=0,piece='ship',paused=false,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,step=0,phase=0,last=0,stepDuration=1150/1.2,landingCount=0,visible=true,cells=[],lastHeading='';const hitAnimations=new Map();
const submerged=new Set([1,7,11]),protectedPositions=new Set([3,15]);
const coords=pos=>pos<5?[0,pos]:pos<9?[pos-4,4]:pos<13?[4,12-pos]:[16-pos,0];
function createBoard(){
 for(const cell of cells)cell.remove();cells=[];
 const catalog=MOCKUP.deeds.filter(d=>d.board===world),names=MOCKUP.worlds;
 board.style.setProperty('--center-image','url("'+MOCKUP.images['world-'+world]+'")');$('worldTitle').textContent=names[world];
 for(let pos=0;pos<16;pos++){
  const d=catalog.find(d=>d.pos===pos),cell=document.createElement('div'),tile=document.createElement('div');cell.className='cell';cell.dataset.position=String(pos);const [row,col]=coords(pos);cell.style.gridArea=(row+1)+'/'+(col+1);tile.className='property-tile';cell.append(tile);
  const water=!!d&&submerged.has(pos),shield=!!d&&protectedPositions.has(pos);cell.classList.toggle('submerged',water);cell.classList.toggle('protected',shield);cell.classList.toggle('special',!d||d.type!=='p');
  const title=document.createElement('div');title.className='property-title';title.textContent=d?.name||({0:'GO',4:'Community Chest',8:'Setback',12:'Chance'}[pos]||'Town Tax');cell.style.setProperty('--stripe',colors[d?.color]||'#fff7df');tile.append(title);
  const photo=document.createElement('div');photo.className='property-photo';tile.append(photo);const image=MOCKUP.images['property-'+world+'-'+pos];
  if(image)photo.style.backgroundImage='url("'+image+'")';else if(pos===0){photo.innerHTML='<span class="go-word">GO</span>';photo.style.backgroundImage='linear-gradient(#0c647477,#073e5566),url("'+MOCKUP.images['world-'+world]+'")';photo.style.backgroundSize='cover';}else photo.textContent=({4:'🧰',8:'↪',12:'?',14:'♧'}[pos]||(d?.type==='rail'?'♜':d?.type==='util'?'♧':''));
  const footer=document.createElement('div');footer.className='property-footer';footer.innerHTML=water?'SUBMERGED · NO RENT':d?'<span><small>PRICE</small><br>$'+d.price+'</span><span><small>RENT</small><br>$'+d.base+'</span>':pos===0?'RICHMOND HILL'.replace('RICHMOND HILL',names[world].toUpperCase()):pos===8?'JUST VISITING':'DRAW A CARD';tile.append(footer);
  if(water){const sheet=document.createElement('div');sheet.className='property-water';sheet.setAttribute('aria-hidden','true');sheet.innerHTML='<div class="shore-wash">'+MOCKUP.shore+'</div><div class="shore-wash shore-follow">'+MOCKUP.shore+'</div>';photo.append(sheet);}
  if(shield){const dome=document.createElement('div');dome.className='shield-dome';dome.setAttribute('aria-hidden','true');dome.innerHTML='<span class="shield-caption">FLOOD SHIELD</span>';tile.append(dome);}
  cell.setAttribute('aria-label',title.textContent+(water?' · Submerged, safe to land, no rent':shield?' · Unused flood protection':''));board.append(cell);cells.push(cell);
 }
 paint();
}
function drawPiece(){pieceArt.innerHTML=MOCKUP.pieces[piece];walker.dataset.piece=piece;lastHeading='';paint();}
function bearing(index){const [r,c]=coords(index%16),[nr,nc]=coords((index+1)%16);return nc>c?'east':nc<c?'west':nr>r?'south':'north';}
function orient(dir){
 if(dir===lastHeading)return;lastHeading=dir;const direction={east:['right',0,false,'→'],south:['down',90,false,'↓'],west:['left',0,true,'←'],north:['up',-90,false,'↑']}[dir];
 walker.dataset.heading=direction[0];heading.style.transform='rotate('+direction[1]+'deg) scaleX('+(direction[2]?-1:1)+')';$('directionArrow').textContent=direction[3];$('travelStatus').textContent=({ship:'Battleship',bus:'School bus',rex:'T-Rex'}[piece])+' · '+(paused?'paused · facing ':reduced?'facing ':'moving ')+dir;
}
function center(index){const tile=cells[index%16];return {x:(board.offsetLeft+tile.offsetLeft+tile.offsetWidth/2)/floating.clientWidth*100,y:(board.offsetTop+tile.offsetTop+tile.offsetHeight*.6)/floating.clientHeight*100};}
function routePoint(progress){
 const w=floating.clientWidth,h=floating.clientHeight,a=center(0),b=center(4),c=center(8),left=a.x*w/100,right=b.x*w/100,top=a.y*h/100,bottom=c.y*h/100;
 const radius=Math.min((right-left)/4,(bottom-top)/4)*.32,horizontal=right-left-2*radius,vertical=bottom-top-2*radius,arc=Math.PI*radius/2,total=2*(horizontal+vertical)+4*arc;
 let distance=((progress/16*total+total-arc/2)%total+total)%total;
 const segments=[{len:horizontal,x:left+radius,y:top,dx:1,dy:0,angle:0},{len:arc,cx:right-radius,cy:top+radius,angle:-Math.PI/2},{len:vertical,x:right,y:top+radius,dx:0,dy:1,angle:90},{len:arc,cx:right-radius,cy:bottom-radius,angle:0},{len:horizontal,x:right-radius,y:bottom,dx:-1,dy:0,angle:180},{len:arc,cx:left+radius,cy:bottom-radius,angle:Math.PI/2},{len:vertical,x:left,y:bottom-radius,dx:0,dy:-1,angle:270},{len:arc,cx:left+radius,cy:top+radius,angle:Math.PI}];
 for(let i=0;i<segments.length;i++){const s=segments[i];if(distance>s.len&&i<segments.length-1){distance-=s.len;continue;}let x,y,angle;if(s.cx!==undefined){const theta=s.angle+distance/radius;x=s.cx+radius*Math.cos(theta);y=s.cy+radius*Math.sin(theta);angle=(theta*180/Math.PI+90+360)%360;}else{x=s.x+s.dx*distance;y=s.y+s.dy*distance;angle=s.angle;}return {x:x/w*100,y:y/h*100,dir:['east','south','west','north'][Math.round(angle/90)%4]};}
}
function paint(){if(!cells.length)return;const at=routePoint(step+phase);walker.style.left=at.x+'%';walker.style.top=at.y+'%';walker.dataset.moving='true';orient(at.dir);}

function landing(index){
 const tile=cells[index%16];landingCount++;$('stepTitle').textContent='Passing '+landingCount+' · '+(tile.querySelector('.property-title')?.textContent||'Property');$('stepCopy').textContent=piece==='ship'?'A heavier dip, a short wiggle, then the square settles.':'A smaller landing makes a gentle dip and ripples.';
 if(reduced)return;hitAnimations.get(tile)?.cancel();const weight=piece==='ship'?1:piece==='bus'?.75:.65;
 const frames=[{transform:'translateY(0) rotate(0)'},{transform:'translateY('+5*weight+'px) rotate('+1.8*weight+'deg)',offset:.17},{transform:'translateY('+(-3*weight)+'px) rotate('+(-1.5*weight)+'deg)',offset:.39},{transform:'translateY('+2*weight+'px) rotate('+1*weight+'deg)',offset:.63},{transform:'translateY(0) rotate(-.4deg)',offset:.83},{transform:'translateY(0) rotate(0)'}];const animation=tile.animate(frames,{duration:850,easing:'ease-in-out'});hitAnimations.set(tile,animation);animation.onfinish=()=>hitAnimations.delete(tile);
 const ring=$('landingRing'),at=center(index);ring.style.left=at.x+'%';ring.style.top=at.y+'%';ring.getAnimations().forEach(a=>a.cancel());ring.animate([{opacity:.85,transform:'translate(-50%,-30%) scale(.75)'},{opacity:0,transform:'translate(-50%,-30%) scale(1.65)'}],{duration:950,easing:'ease-out'});
}
function tick(now){if(!last)last=now;const dt=Math.min(50,now-last);last=now;if(!paused&&!reduced&&visible){phase+=dt/stepDuration;while(phase>=1){phase-=1;step=(step+1)%16;landing(step);lastHeading='';}paint();}requestAnimationFrame(tick);}
function setPause(value){paused=value;document.body.classList.toggle('paused',paused);$('pause').textContent=paused?'▶ Resume motion':'Ⅱ Pause motion';$('pause').setAttribute('aria-pressed',String(paused));lastHeading='';paint();}
function setReduced(value){reduced=value;$('reduce').checked=value;document.body.classList.toggle('reduced',value);for(const a of hitAnimations.values())a.cancel();hitAnimations.clear();$('landingRing').getAnimations().forEach(a=>a.cancel());lastHeading='';paint();}
$('pause').onclick=()=>setPause(!paused);$('replay').onclick=()=>{step=0;phase=0;landingCount=0;lastHeading='';$('stepTitle').textContent='See the motion';$('stepCopy').textContent='Continuous travel · 25% smaller pieces · Ocean motion retained.';setPause(false);paint();};
$('next').onclick=()=>{step=(step+1)%16;phase=0;lastHeading='';setPause(true);landing(step);paint();};
$('piece').onchange=()=>{piece=$('piece').value;drawPiece();};$('world').onchange=()=>{world=Number($('world').value);createBoard();};$('size').oninput=()=>{scene.style.setProperty('--ship-scale',Number($('size').value)/100);$('sizeLabel').textContent=$('size').value+'%';};$('water').oninput=()=>{scene.style.setProperty('--water-opacity',Number($('water').value)/100);$('waterLabel').textContent=$('water').value+'%';};$('reduce').onchange=()=>setReduced($('reduce').checked);
for(const id of ['community','chance'])$(id).onclick=()=>{const notice=$('deckMessage');notice.textContent='Floating '+(id==='community'?'Community Chest':'Chance')+' deck · Design preview only';notice.hidden=false;clearTimeout(window.mockupToast);window.mockupToast=setTimeout(()=>notice.hidden=true,2400);};
addEventListener('resize',paint);new ResizeObserver(paint).observe(floating);document.addEventListener('visibilitychange',()=>{visible=!document.hidden;last=0;});matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>setReduced(e.matches));
createBoard();drawPiece();setReduced(reduced);requestAnimationFrame(tick);
// Read-only deterministic capture hooks; these never connect to a game.
window.TsunamiOceanMockup={get state(){return {world,piece,step,phase,paused,reduced,landingCount,stepDuration};},setPosition(index,fraction=0){step=((index%16)+16)%16;phase=Math.max(0,Math.min(.999999,fraction));lastHeading='';paint();},land(index){landing(index);},pause:setPause};
})();
