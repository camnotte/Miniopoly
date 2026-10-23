'use strict';
const $=id=>document.getElementById(id),stage=$('stage'),media=matchMedia('(prefers-reduced-motion: reduce)');
const names=['King Cam','Yasmina','Dell PC','Christopher Long'],avatars=['man-1','woman-2','man-2','woman-1'],pieces=['🛵','🐱','🐶','car'];
let animations=[],generation=0,paused=false;
const money=value=>'$'+value.toLocaleString('en-US');
function element(type,text='',className=''){const n=document.createElement(type);n.textContent=String(text);n.className=className;return n;}
function fitTitles(){for(const text of stage.querySelectorAll('.champion-title span')){text.textContent=text.dataset.fullTitle;if(text.scrollWidth>text.clientWidth+1)text.textContent=text.dataset.shortTitle;}}
function cancel(){generation++;for(const a of animations)a.cancel();animations=[];paused=false;$('pause').textContent='Pause';$('confetti').replaceChildren();}
function finish(){cancel();stage.classList.add('is-complete');stage.classList.toggle('is-still',media.matches||$('still').checked);$('phase').textContent='Your Miniopoly champion'+($('playerCount').value==='tie'?'s':'')+'.';$('skip').disabled=true;$('pause').disabled=true;}
function render(){
 cancel();stage.classList.remove('is-complete');const mode=$('playerCount').value,count=mode==='tie'?4:Number(mode),tied=mode==='tie';
 const players=names.slice(0,count).map((name,seat)=>({name,seat,avatar:avatars[seat],piece:pieces[seat],worth:tied&&seat===1?4120:[4120,3680,2810,2240][seat],cash:[1750,1480,1010,840][seat],deeds:[8,7,6,4][seat],upgrades:[4,3,2,1][seat],rank:tied&&seat===1?1:seat+1}));
 const podiums=$('podiums');podiums.replaceChildren();podiums.classList.toggle('is-tie',tied);const display=tied?players.slice(0,2):players.slice(0,3);podiums.dataset.count=display.length;
 for(const p of display){const winner=p.rank===1,card=element('article','','podium-player'+(winner?' winner':''));card.dataset.rank=p.rank;
  const identity=element('div','','podium-identity'),portrait=element('div','','portrait');portrait.innerHTML=MiniopolyAvatars.html(p.avatar,p.seat);const piece=element('span','','avatar-piece');piece.setAttribute('aria-hidden','true');piece.innerHTML=MiniopolyPieceArt.art(p.piece,'normal');identity.append(portrait,piece);
  const column=element('div','','podium-column');
  if(winner){
   const award=element('div','','champion-award'),title=element('div','','champion-title'),titleText=element('span',tied?'Miniopoly Co-Champion':'Miniopoly Champion');titleText.dataset.fullTitle=titleText.textContent;titleText.dataset.shortTitle=tied?'Co-Champion':'Champion';title.append(titleText);
   const art=element('div','','champion-art'),trophy=element('div','','champion-trophy');trophy.innerHTML=MOCKUP_TROPHY.replaceAll('cup-','cup-'+p.seat+'-');trophy.setAttribute('aria-hidden','true');piece.className='champion-piece';art.append(trophy,piece);award.append(title,art);column.append(award);
   const base=element('div','','winner-base');base.append(element('h2',p.name),element('div',money(p.worth),'champion-worth'));base.lastChild.setAttribute('aria-label','Net worth '+money(p.worth));column.append(base);
  }
  else{column.append(element('span',p.rank===2?'2nd':'3rd','rank-seal'),element('h3',p.name),element('strong',money(p.worth)),element('small',p.rank===2?'Second place':'Third place'));}
  card.append(identity,column);podiums.append(card);
 }
 const results=$('results');results.replaceChildren();for(const p of players){const row=element('div','','results-row'+(p.rank===1?' is-winner':''));row.setAttribute('role','listitem');const name=element('div','','result-name');name.append(element('b',p.rank),element('span',p.name+(p.seat===0?' · You':'')));row.append(name,element('strong',money(p.worth)));for(const [label,value]of [['Cash',money(p.cash)],['Deeds',p.deeds],['Upgrades',p.upgrades]]){const cell=element('div','','result-stat');cell.append(element('small',label),element('b',value));row.append(cell);}results.append(row);}
 fitTitles();replay();
}
function replay(){
 cancel();stage.classList.remove('is-complete');$('skip').disabled=false;$('pause').disabled=false;$('phase').textContent='The ceremony begins…';
 if(media.matches||$('still').checked){finish();return;}
 const run=generation,duration=4800,delay=650,baseTime=delay+duration,columns=[...stage.querySelectorAll('.winner .podium-column')];
 for(const column of columns){const start=column.getBoundingClientRect().height,style=getComputedStyle(stage),finalHeight=stage.getBoundingClientRect().height-parseFloat(style.getPropertyValue('--base-gap'))-parseFloat(style.getPropertyValue('--image-height'))/2;
  animations.push(column.animate([{height:start+'px'},{height:finalHeight+'px'}],{delay,duration,easing:'cubic-bezier(.25,.1,.25,1)',fill:'both'}));
 }
 animations.push(stage.querySelector('.winner-halo').animate([{opacity:0},{opacity:1}],{delay,duration,fill:'both'}));
 for(const base of stage.querySelectorAll('.winner-base'))animations.push(base.animate([{opacity:0,transform:'translateY(7px)'},{opacity:1,transform:'none'}],{delay:baseTime,duration:650,fill:'both',easing:'ease-out'}));
 for(const award of stage.querySelectorAll('.champion-award'))animations.push(award.animate([{opacity:0,transform:'translateY(9px)'},{opacity:1,transform:'none'}],{delay:baseTime,duration:650,fill:'both',easing:'ease-out'}));
 const width=stage.clientWidth,height=stage.clientHeight;
 for(let i=0;i<118;i++){const piece=element('i','','confetti-piece');piece.style.setProperty('--x',(3+(i*37)%94)+'%');piece.style.setProperty('--tint',['#f4d77f','#e8b75a','#fff0b8','#63a995','#b7d4c6'][i%5]);$('confetti').append(piece);const drift=((i%7)-3)*width*.025;
  animations.push(piece.animate([{opacity:0,transform:'translate(0,-20px) rotate(0)'},{opacity:.95,offset:.12},{opacity:.9,offset:.75},{opacity:0,transform:'translate('+drift+'px,'+(height+25)+'px) rotate('+(180+i*29)+'deg)'}],{delay:delay+i*38,duration:2000+(i%8)*90,easing:'linear',fill:'both'}));
 }
 const rising=animations[0];rising.ready.then(()=>{if(run===generation)$('phase').textContent='Rising to first place…';}).catch(()=>{});
 rising.finished.then(()=>{if(run!==generation)return;$('phase').textContent='The trophy and champion reveal.';}).catch(()=>{});
 Promise.all(animations.map(a=>a.finished)).then(()=>{if(run===generation)finish();}).catch(()=>{});
}
$('replay').onclick=replay;$('skip').onclick=finish;$('pause').onclick=()=>{paused=!paused;for(const a of animations)if(a.playState!=='finished')paused?a.pause():a.play();$('pause').textContent=paused?'Resume':'Pause';};$('playerCount').onchange=render;$('still').onchange=replay;media.addEventListener('change',()=>{if(media.matches)finish();});
let resizeTimer;addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{fitTitles();finish();},100);});
render();
document.fonts.ready.then(fitTitles);
