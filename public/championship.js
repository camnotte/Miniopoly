/* Championship presentation reads the host's final results; it never changes scores. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MiniopolyChampionship=api;})(typeof window==='undefined'?globalThis:window,function(){
 'use strict';
 const cash=value=>'$'+Math.round(Number(value)||0).toLocaleString('en-US');
 const ordinal=n=>n===1?'1st':n===2?'2nd':n===3?'3rd':n+'th';
 function model(room){
  const final=room?.finalResults;if(room?.stage!=='finished'||!final?.standings?.length)return null;
  const entries=final.standings.slice(0,4).map((p,index)=>{
   const player=room.players?.find(x=>x.id===p.id)||room.players?.find(x=>x.seat===p.seat)||{};
   const rank=final.gameMode==='countdown'?(p.place||index+1):final.gameMode==='express'?index+1:p.bankrupt?index+1:final.standings.findIndex(x=>!x.bankrupt&&x.worth===p.worth)+1;
   const upgrades=Number.isFinite(p.upgrades)?p.upgrades:Object.values(room.owned||{}).filter(o=>!o.lost&&o.owner===p.seat).reduce((sum,o)=>sum+(Number(o.level)||0),0);
   return {id:p.id,seat:p.seat,name:String(p.name||'Player'),worth:p.worth,cash:p.cash,deeds:p.deeds,upgrades,bankrupt:!!p.bankrupt,outReason:p.outReason||null,rank,
    avatar:p.avatar||player.avatar,avatarImage:p.avatarImage||player.avatarImage,piece:p.piece||player.piece,you:p.id===room.youId};
  });
  const winners=final.gameMode==='countdown'?entries.filter(p=>p.rank===1):final.reason==='last-player'?[entries[0]]:entries.filter(p=>!p.bankrupt&&p.worth===entries[0].worth);
  const championIds=new Set(winners.map(p=>p.id));for(const p of entries)p.champion=championIds.has(p.id);
  const podium=winners.length>1?entries.filter(p=>p.champion):entries.slice(0,3);
  return {key:room.code+':'+final.matchId,matchId:final.matchId,code:room.code,name:room.name||'Room '+room.code,at:final.at,
   rounds:['last-player','countdown','storm-complete'].includes(final.reason)&&Number.isSafeInteger(room.round)&&room.round>0?room.round:final.rounds,roundLimit:final.roundLimit??room.rounds??final.rounds,reason:final.reason,mode:(final.gameMode==='countdown'?'Express · Tsunami · ':final.gameMode==='express'?'Express · World Collapse · ':'')+(final.legendaryMode==='gravity'?'Gravity Pull':'Individual'),ranked:!!final.legendaryEligible,
   entries,winners,podium,newRecords:Array.isArray(final.newRecords)?final.newRecords:[]};
 }
 // Approved ribboned cup: large numeral directly on the cup, with no star.
 function trophy(prefix='championship'){return "<svg class=\"championship-trophy\" aria-hidden=\"true\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"20 20 200 236\" fill=\"none\">\n <defs>\n  <linearGradient id=\"cup-gold\" x1=\"65\" y1=\"60\" x2=\"175\" y2=\"166\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#fff6bc\"/><stop offset=\".28\" stop-color=\"#f4d573\"/><stop offset=\".5\" stop-color=\"#fff3ae\"/><stop offset=\".8\" stop-color=\"#d6a53c\"/><stop offset=\"1\" stop-color=\"#b67c26\"/></linearGradient>\n  <linearGradient id=\"cup-numeral\" x1=\"0\" y1=\"0\" x2=\".2\" y2=\"1\"><stop stop-color=\"#fff5bf\"/><stop offset=\".23\" stop-color=\"#f2c65b\"/><stop offset=\".46\" stop-color=\"#fff2a4\"/><stop offset=\".54\" stop-color=\"#c58b20\"/><stop offset=\".82\" stop-color=\"#e8b53c\"/><stop offset=\"1\" stop-color=\"#fff0a0\"/></linearGradient>\n <linearGradient id=\"cup-base\" x1=\"70\" y1=\"223\" x2=\"164\" y2=\"246\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#986a2d\"/><stop offset=\".5\" stop-color=\"#d9ad59\"/><stop offset=\"1\" stop-color=\"#80502c\"/></linearGradient>\n  <linearGradient id=\"cup-red\" x1=\"50\" y1=\"142\" x2=\"91\" y2=\"213\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#ec6b5b\"/><stop offset=\"1\" stop-color=\"#ab342e\"/></linearGradient>\n </defs>\n <ellipse cx=\"120\" cy=\"249\" rx=\"62\" ry=\"7\" fill=\"#956d32\" opacity=\".18\"/>\n <path d=\"M72 66H35C28 106 47 145 83 142M168 66h37c7 40-12 79-48 76\" stroke=\"#b5802c\" stroke-width=\"12\" stroke-linejoin=\"round\"/>\n <path d=\"M72 66H35C28 106 47 145 83 142M168 66h37c7 40-12 79-48 76\" stroke=\"#f6d97d\" stroke-width=\"7\" stroke-linejoin=\"round\"/>\n <path d=\"M70 136c-2 30-13 52-30 69l22-2 8 17c19-20 24-47 24-72Z\" fill=\"url(#cup-red)\" stroke=\"#a73c32\" stroke-width=\"2\"/>\n <path d=\"M170 136c2 30 13 52 30 69l-22-2-8 17c-19-20-24-47-24-72Z\" fill=\"url(#cup-red)\" stroke=\"#a73c32\" stroke-width=\"2\"/>\n <path d=\"M66 155c-3 17-10 34-20 46m128-46c3 17 10 34 20 46\" stroke=\"#ffac81\" stroke-width=\"3\"/>\n <path d=\"M112 165h16v32c0 8 9 16 23 21H89c14-5 23-13 23-21Z\" fill=\"url(#cup-gold)\" stroke=\"#ac7b2d\" stroke-width=\"2\"/>\n <path d=\"M65 53h110l-7 67c-3 27-23 49-48 49s-45-22-48-49Z\" fill=\"url(#cup-gold)\" stroke=\"#ae7c2b\" stroke-width=\"3\"/>\n <path d=\"m77 65 5 53c2 17 10 29 20 36\" stroke=\"#fff6c7\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n <ellipse cx=\"120\" cy=\"53\" rx=\"57\" ry=\"9\" fill=\"#f8df8c\" stroke=\"#b88732\" stroke-width=\"3\"/>\n <ellipse cx=\"120\" cy=\"52\" rx=\"47\" ry=\"4\" fill=\"#b7862e\" opacity=\".6\"/>\n <text x=\"120\" y=\"145\" text-anchor=\"middle\" class=\"trophy-gold-one\" fill=\"url(#cup-numeral)\" stroke=\"#996316\" stroke-width=\"2.4\" paint-order=\"stroke\" stroke-linejoin=\"round\" font-family=\"Nunito, sans-serif\" font-weight=\"1000\" font-size=\"88\">1</text>\n <rect x=\"87\" y=\"214\" width=\"66\" height=\"10\" rx=\"3\" fill=\"#eac264\" stroke=\"#ae7c2b\" stroke-width=\"2\"/>\n <path d=\"M80 224h80l5 19H75Z\" fill=\"url(#cup-base)\" stroke=\"#805627\" stroke-width=\"2\"/>\n <rect x=\"98\" y=\"229\" width=\"44\" height=\"9\" rx=\"2\" fill=\"#f7df8b\"/>\n <path d=\"m181 28 3 10 10 3-10 3-3 10-3-10-10-3 10-3Zm-121 3 2 7 7 2-7 2-2 7-2-7-7-2 7-2Z\" fill=\"#fff4bc\" stroke=\"#d2a34d\" stroke-width=\"1.5\"/>\n</svg>".replaceAll('cup-',String(prefix).replace(/[^a-z0-9-]/gi,'')+'-cup-');}
 function fanfare(volume=100){
  try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return()=>{};const ctx=new Audio();void ctx.resume();
   [[0,392,.22],[.2,523,.24],[.42,659,.25],[.68,784,.55],[1.15,523,.7],[1.15,659,.7],[1.15,784,1]].forEach(([offset,hz,duration])=>{const osc=ctx.createOscillator(),gain=ctx.createGain(),start=ctx.currentTime+offset;osc.type='triangle';osc.frequency.value=hz;gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(.025*volume/100,start+.035);gain.gain.exponentialRampToValueAtTime(.0001,start+duration);osc.connect(gain).connect(ctx.destination);osc.start(start);osc.stop(start+duration+.03);});
   const timer=setTimeout(()=>ctx.close().catch(()=>{}),2600);return()=>{clearTimeout(timer);void ctx.close().catch(()=>{});};
  }catch{return()=>{};}
 }
 class Ceremony {
  constructor(layer,{getRoom,getPreferences,onSound,onError,assets={}}={}){
   this.layer=layer;this.getRoom=getRoom;this.getPreferences=getPreferences||(()=>({}));this.onSound=onSound;this.onError=onError;this.signature='';this.generation=0;this.animations=[];this.orbits=[];this.facingFrame=null;this.lapProgress=new Map();
   this.pieceSounds=window.MiniopolyPieceSounds?new window.MiniopolyPieceSounds.Engine({getPreferences:this.getPreferences}):null;
   this.assets={background:'/art/championship/three-worlds.webp',avatars:'/art/avatars/players-v1.png',...assets};
   this.skip=this.node('skipCeremony');this.skip.onclick=()=>this.finishIntro();this.node('saveVictoryImage').onclick=()=>void this.saveImage();
   this.motion=matchMedia('(prefers-reduced-motion: reduce)');this.motion.addEventListener('change',()=>{if(this.layer.classList.contains('ceremony-intro')&&this.reduced())this.finishIntro();else this.refreshPreferences();});
   this.resizeObserver=new ResizeObserver(()=>{const r=this.node('awardsPodium').getBoundingClientRect(),size=r.width+':'+r.height;this.fitTitles();if(r.width&&this.layoutSize&&size!==this.layoutSize&&this.layer.classList.contains('ceremony-intro'))this.finishIntro();this.layoutSize=r.width?size:null;if(this.layer.classList.contains('ceremony-ready'))this.startOrbits();});this.resizeObserver.observe(this.node('awardsPodium'));
   document.fonts.ready.then(()=>this.fitTitles());
   window.addEventListener('miniopoly-font-change',()=>{this.fitTitles();if(this.layer.classList.contains('ceremony-ready'))this.startOrbits();});
   document.addEventListener('visibilitychange',()=>{if(document.hidden){this.stopOrbits();}else if(this.layer.classList.contains('ceremony-ready')&&!this.layer.hidden)this.startOrbits();});
   window.addEventListener('pagehide',()=>this.cancel());
  }
  node(id){return this.layer.querySelector('#'+id);}
  reduced(){return this.motion.matches||this.getPreferences().reducedMotion;}
  render(room){
   const value=model(room);if(!value){this.reset();return;}const signature=JSON.stringify(value);if(signature===this.signature)return;
   this.cancel();this.signature=signature;this.value=value;this.node('saveVictoryImage').disabled=false;
   this.node('championKicker').textContent=value.winners.length>1?'CO-CHAMPIONS':'CHAMPION';
   this.node('awardsTitle').textContent=value.winners.map(p=>p.name).join(' & ');this.node('championWorth').textContent=cash(value.winners[0]?.worth);
   this.node('championWorth').setAttribute('aria-label','Final net worth '+cash(value.winners[0]?.worth));
   this.node('awardSubtitle').textContent=(value.reason==='storm-complete'?'Calm seas · Final net worth · Round ':value.reason==='countdown'?'Property survival · Round ':value.reason==='last-player'?'Last player standing · Round ':'Final net worth · ')+value.rounds+(['last-player','countdown','storm-complete'].includes(value.reason)?'':' rounds')+' · '+value.mode;
   this.node('awardsMatchName').textContent=value.name;this.node('awardsMatchDate').textContent=this.date(value.at);
   const podium=this.node('awardsPodium');podium.replaceChildren();podium.dataset.count=value.podium.length;podium.classList.toggle('shared-championship',value.winners.length>1);
   for(const p of value.podium){const card=this.tag('article','', 'podium-player place-'+p.rank+(p.champion?' is-champion':''));card.dataset.rank=p.rank;
    const identity=this.tag('div','', 'podium-identity'),portrait=this.tag('div','', 'podium-avatar');portrait.innerHTML=window.MiniopolyAvatars.html(p.avatar,p.seat,p.avatarImage);
    const piece=this.tag('span','','award-piece');piece.innerHTML=window.MiniopolyPieceArt.art(window.MiniopolyPieces.resolve(p.piece,p.seat).symbol,'normal');piece.setAttribute('aria-hidden','true');piece.dataset.piece=p.piece;piece.dataset.seat=p.seat;identity.append(portrait);
    const plaque=this.tag('div','','podium-plaque'),name=this.tag('h3',p.name),worth=this.tag('strong',cash(p.worth),'podium-worth');
    worth.setAttribute('aria-label','Final net worth '+cash(p.worth));
    if(p.champion){
     const award=this.tag('div','','champion-award'),title=this.tag('div','','champion-title'),text=this.tag('span',value.winners.length>1?'CO-CHAMPION':'CHAMPION');
     text.dataset.fullTitle=text.textContent;text.dataset.shortTitle=value.winners.length>1?'CO-CHAMPION':'CHAMPION';title.append(text);
     const art=this.tag('div','','champion-art'),cup=this.tag('div','','champion-trophy');cup.innerHTML=trophy('championship-'+p.seat);piece.className='champion-piece';art.append(cup,piece);award.append(title,art);
     const base=this.tag('div','','winner-base');base.append(name,worth);plaque.append(award,base);
    }else{const base=this.tag('div','','podium-amount-base');base.append(worth,piece);plaque.append(this.tag('span',ordinal(p.rank),'podium-rank'),name,base,this.tag('small',(p.bankrupt?(p.outReason==='countdown'?'No properties remain':p.outReason==='collapse'?'Lost to collapse':'Bankrupt'):ordinal(p.rank)+' place')+(p.you?' · YOU':'')));}
    card.append(identity,plaque);podium.append(card);
   }
   const table=this.node('finalPlaces');table.replaceChildren();
   const header=this.tag('div','','championship-table-head');for(const label of ['Place / Player','Net worth','Cash','Deeds','Upgrades'])header.append(this.tag('span',label));table.append(header);
   for(const p of value.entries){const row=this.tag('div','','championship-result'+(p.champion?' is-champion':''));row.dataset.playerId=p.id;row.setAttribute('role','listitem');
    const identity=this.tag('div','','result-player'),rank=this.tag('b',String(p.rank),'result-rank'),name=this.tag('span',p.name+(p.you?' · You':''));identity.append(rank,name);if(p.bankrupt)name.append(this.tag('small',p.outReason==='countdown'?'No properties remain':p.outReason==='collapse'?'Lost to collapse':'Bankrupt'));
    row.append(identity,this.stat('Net worth',cash(p.worth)),this.stat('Cash',cash(p.cash)),this.stat('Deeds',p.deeds),this.stat('Upgrades',p.upgrades));table.append(row);
   }
   const record=this.node('legendaryRecognition');record.hidden=!value.newRecords.length;
   if(!record.hidden){const first=value.newRecords.some(p=>p.place===1);record.textContent=(first?'NEW LEGENDARY RECORD':'LEGENDARY TOP THREE')+' · '+value.mode+' · '+value.roundLimit+' rounds — '+value.newRecords.map(p=>p.name+' #'+p.place).join(' · ');}
  }
  fitTitles(){
   for(const text of this.layer.querySelectorAll('.champion-title span')){
    if(!text.clientWidth)continue;text.style.fontSize='';text.textContent=text.dataset.fullTitle;
    if(text.scrollWidth>text.clientWidth+1)text.textContent=text.dataset.shortTitle;
    let size=parseFloat(getComputedStyle(text).fontSize);while(text.scrollWidth>text.clientWidth+1&&size>10)text.style.fontSize=(--size)+'px';
   }
  }
  tag(type,text='',className=''){const n=document.createElement(type);n.textContent=String(text);if(className)n.className=className;return n;}
  stat(label,value){const n=this.tag('div','','result-stat');n.append(this.tag('small',label),this.tag('b',value));return n;}
  date(value){const date=new Date(value);return Number.isFinite(date.getTime())?date.toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'}):'Match complete';}
  stopOrbits(){
   if(this.facingFrame!==null)cancelAnimationFrame(this.facingFrame);this.facingFrame=null;
   for(const {animation,piece} of this.orbits){this.lapProgress.set(piece.dataset.seat,Math.min(4000,Number(animation.currentTime)||0));animation.cancel();piece.classList.remove('is-orbiting');piece.style.transform='';piece.style.zIndex='';}
   this.orbits=[];
   for(const piece of this.layer.querySelectorAll('.champion-piece')){piece.classList.remove('is-idling');for(const root of piece.querySelectorAll('.token-art'))root.classList.remove('is-moving');}
  }
  startOrbits(){
   this.stopOrbits();if(!this.value||this.layer.hidden||document.hidden)return;
   for(const piece of this.layer.querySelectorAll('.champion-piece')){
    const seat=piece.dataset.seat,elapsed=this.lapProgress.get(seat)||0;
    if(elapsed>=4000||this.reduced()){this.lapProgress.set(seat,4000);piece.dataset.lapComplete='true';piece.classList.add('is-idling');continue;}
    const art=piece.parentElement,w=art.clientWidth,h=art.clientHeight,pw=piece.offsetWidth,ph=piece.offsetHeight;
    if(!w||!h)continue;
    // Start and finish at the permanent parking spot beside the trophy base.
    const rx=Math.max(0,(w-pw*2)/2-3),ry=Math.max(0,(h-ph*1.8)/2-4),cx=(w-pw)/2,cy=(h-ph)/2;
    const frames=Array.from({length:33},(_,i)=>{const angle=i/32*Math.PI*2,front=Math.sin(angle)>=0;return {offset:i/32*.94,transform:'translate('+(cx+rx*Math.cos(angle))+'px,'+(cy+ry*Math.sin(angle))+'px) scale('+(front?1:.86)+')',zIndex:front?3:0};});
    frames.push({offset:1,transform:'translate('+(w-pw)+'px,'+(h-ph)+'px) scale(1)',zIndex:3});
    piece.classList.add('is-orbiting');piece.dataset.lapComplete='false';const animation=piece.animate(frames,{duration:4000,iterations:1,easing:'linear'});animation.currentTime=elapsed;this.orbits.push({piece,animation});
    for(const root of piece.querySelectorAll('.token-art'))root.classList.add('is-moving');
    animation.finished.then(()=>{
     if(!this.orbits.some(item=>item.animation===animation))return;
     this.lapProgress.set(seat,4000);piece.dataset.lapComplete='true';piece.dataset.heading='east';piece.classList.remove('is-orbiting');piece.classList.add('is-idling');piece.style.transform='';piece.style.zIndex='';
     for(const root of piece.querySelectorAll('.token-art'))root.classList.remove('is-moving');
     this.orbits=this.orbits.filter(item=>item.animation!==animation);
     if(!this.orbits.length)this.finishMomentSound();
    }).catch(()=>{});
   }
   const face=()=>{for(const {piece,animation} of this.orbits){const time=Number(animation.currentTime)||0;piece.dataset.heading=time<2000?'west':'east';}if(this.orbits.length)this.facingFrame=requestAnimationFrame(face);};face();
  }
  refreshPreferences(){
   this.layer.classList.toggle('ceremony-reduced-motion',!!this.reduced());
   this.pieceSounds?.sync();
   if(this.reduced()){this.startOrbits();if(this.layer.classList.contains('ceremony-intro'))this.finishIntro();}
   else if(this.layer.classList.contains('ceremony-ready')&&!this.orbits.length)this.startOrbits();
  }
  finishMomentSound(){if(this.momentArrived)return;this.momentArrived=true;clearTimeout(this.momentSoundTimer);this.pieceSounds?.arrive(this.value.winners[0].piece);}
  startMoment(){
   if(!this.value||this.layer.hidden)return;
   this.layer.classList.toggle('ceremony-reduced-motion',!!this.reduced());this.layer.classList.add('ceremony-ready');this.startOrbits();
   this.momentArrived=false;this.pieceSounds?.startMovement(this.value.winners[0].piece);clearTimeout(this.momentSoundTimer);this.momentSoundTimer=setTimeout(()=>{if(this.layer.classList.contains('ceremony-ready'))this.finishMomentSound();},4000);
  }
  celebrate(){
   if(!this.value)return;this.cancel();this.fitTitles();if(this.reduced()){this.startMoment();return;}
   this.layer.classList.add('ceremony-intro');const layout=this.node('awardsPodium').getBoundingClientRect();this.layoutSize=layout.width+':'+layout.height;this.skip.hidden=false;const run=++this.generation,delay=650,duration=4800,revealAt=delay+duration;
   for(const column of this.layer.querySelectorAll('.podium-player.is-champion .podium-plaque')){
    const start=column.getBoundingClientRect().height,style=getComputedStyle(column),target=parseFloat(style.getPropertyValue('--champion-final-height'));
    // The computed custom value can be calc(); measure the final height without changing the fixed base.
    column.style.height='var(--champion-final-height)';const end=column.getBoundingClientRect().height;column.style.height='';
    this.animations.push(column.animate([{height:start+'px'},{height:(Number.isFinite(target)?target:end)+'px'}],{delay,duration,easing:'cubic-bezier(.25,.1,.25,1)',fill:'both'}));
   }
   for(const item of this.layer.querySelectorAll('.champion-award,.winner-base'))this.animations.push(item.animate([{opacity:0,transform:'translateY(7px)'},{opacity:1,transform:'none'}],{delay:revealAt,duration:650,fill:'both',easing:'ease-out'}));
   const pieces=this.node('celebrationParticles'),scene=this.layer.querySelector('.ceremony-scene'),height=scene.clientHeight,width=scene.clientWidth;
   for(let i=0;i<118;i++){const n=this.tag('i','','ceremony-confetti');n.style.left=(3+(i*37)%94)+'%';n.style.backgroundColor=['#f4d77f','#e8b75a','#fff0b8','#63a995','#b7d4c6'][i%5];pieces.append(n);
    this.animations.push(n.animate([{opacity:0,transform:'translate(0,-20px) rotate(0)'},{opacity:.95,offset:.12},{opacity:.9,offset:.75},{opacity:0,transform:'translate('+((i%7-3)*width*.025)+'px,'+(height+25)+'px) rotate('+(180+i*29)+'deg)'}],{delay:delay+i*38,duration:2000+(i%8)*90,easing:'linear',fill:'both'}));
   }
   Promise.all(this.animations.map(a=>a.finished)).then(()=>{if(run===this.generation)this.finishIntro();}).catch(()=>{});
   const prefs=this.getPreferences();if(prefs.sound!==false&&Number(prefs.volume)!==0)this.stopSound=this.onSound?.();
  }
  cancel(){clearTimeout(this.momentSoundTimer);this.stopOrbits();this.lapProgress.clear();this.pieceSounds?.stop();this.generation++;for(const animation of this.animations)animation.cancel();this.animations=[];this.stopSound?.();this.stopSound=null;this.layer.classList.remove('ceremony-intro','ceremony-ready');this.skip.hidden=true;this.node('celebrationParticles').replaceChildren();}
  finishIntro(){this.cancel();this.fitTitles();this.startMoment();}
  hide(){this.cancel();this.node('saveVictoryImage').disabled=false;}
  reset(){this.hide();this.value=null;this.signature='';this.node('victorySaveStatus').textContent='';}
  async image(source){return new Promise((resolve,reject)=>{const im=new Image(),timer=setTimeout(()=>{im.onload=im.onerror=null;reject(Error('Artwork took too long to load. Try saving again.'));},8000);im.onload=()=>{clearTimeout(timer);resolve(im);};im.onerror=()=>{clearTimeout(timer);reject(Error('Artwork could not be loaded. Refresh and try again.'));};im.src=source;});}
  async saveImage(){
   const value=this.value;if(!value)return;const key=value.key,button=this.node('saveVictoryImage'),status=this.node('victorySaveStatus');button.disabled=true;status.textContent='Preparing your victory image…';
   const current=()=>this.value?.key===key&&model(this.getRoom())?.key===key;
   try{
    const [backdrop,sheet]=await Promise.all([this.image(this.assets.background),this.image(this.assets.avatars),document.fonts.ready]);if(!current())return;
    const portraits=await Promise.all(value.winners.map(async p=>window.MiniopolyAvatars.isPersonalImage(p.avatarImage)?this.image(p.avatarImage):null));if(!current())return;
    const canvas=document.createElement('canvas');canvas.width=1600;canvas.height=1180;const c=canvas.getContext('2d');c.fillStyle='#153f3d';c.fillRect(0,0,1600,1180);c.drawImage(backdrop,0,0,1600,800);
    const shade=c.createLinearGradient(0,0,0,800);shade.addColorStop(0,'#113b3a99');shade.addColorStop(.4,'#123c3ba8');shade.addColorStop(1,'#153f3d');c.fillStyle=shade;c.fillRect(0,0,1600,810);
    c.textAlign='center';this.drawText(c,(value.winners.length>1?'CO-CHAMPIONS':'CHAMPION'),800,85,28,'#f1d899',1400);
    const count=value.winners.length,spacing=Math.min(370,1400/count),start=800-(count-1)*spacing/2;
    for(let i=0;i<count;i++){const p=value.winners[i],x=start+i*spacing,size=count>2?140:180,y=140;c.save();c.beginPath();c.arc(x,y+size/2,size/2+6,0,Math.PI*2);c.fillStyle='#efd38b';c.fill();c.beginPath();c.arc(x,y+size/2,size/2,0,Math.PI*2);c.clip();
     if(portraits[i])c.drawImage(portraits[i],x-size/2,y,size,size);else{const index=window.MiniopolyAvatars.resolve(p.avatar,p.seat).index,sw=sheet.width/5,sh=sheet.height/2;c.drawImage(sheet,index%5*sw,Math.floor(index/5)*sh+(sh-sw)/2,sw,sw,x-size/2,y,size,size);}c.restore();
     this.drawText(c,p.name,x,370,count>2?30:42,'#fff4d7',spacing-24);this.drawText(c,cash(p.worth),x,427,42,'#f1d899',spacing-24);
    }
    this.drawText(c,value.name,800,515,30,'#fff4d7',1400);this.drawText(c,this.date(value.at)+' · '+(['last-player','countdown','storm-complete'].includes(value.reason)?'Ended in round '+value.rounds:value.rounds+' rounds')+' · '+value.mode,800,560,23,'#d3e0d2',1400);
    const columns=[100,800,1060,1290,1480];c.textAlign='left';['FINAL STANDINGS','NET WORTH','CASH','DEEDS','UPGRADES'].forEach((t,i)=>{c.textAlign=i?'right':'left';this.drawText(c,t,columns[i],655,20,'#ebd390',i?210:650);});
    value.entries.forEach((p,i)=>{const y=722+i*81;c.fillStyle=p.champion?'#365b49':'#204846';c.fillRect(65,y-43,1470,70);c.textAlign='left';this.drawText(c,p.rank+'. '+p.name+(p.bankrupt?(p.outReason==='collapse'?' · Lost to collapse':' · Bankrupt'):''),100,y,28,'#fff4dd',620);[cash(p.worth),cash(p.cash),String(p.deeds),String(p.upgrades)].forEach((t,j)=>{c.textAlign='right';this.drawText(c,t,columns[j+1],y,28,j===0?'#f1d899':'#e5ebde',210);});});
    c.textAlign='center';this.drawText(c,'YOUR WORLD. YOUR EMPIRE.  ·  MINIOPOLY',800,1115,20,'#a8c6b5',1400);
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('Could not prepare the image. Try again.');if(!current())return;
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Miniopoly-Championship-'+String(value.code).replace(/[^A-Z2-9]/g,'')+'.png';a.hidden=true;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);status.textContent='Victory image saved. Your personal photo is included if you used one.';
   }catch(error){if(current()){status.textContent=error.message;this.onError?.(error.message);}}
   finally{if(this.value?.key===key)button.disabled=false;}
  }
  drawText(c,text,x,y,size,color,maxWidth){c.font='800 '+size+'px '+(window.MiniopolyFontPreferences?.canvasFamily()||'Nunito, sans-serif');while(c.measureText(String(text)).width>maxWidth&&size>13){size--;c.font='800 '+size+'px '+(window.MiniopolyFontPreferences?.canvasFamily()||'Nunito, sans-serif');}c.fillStyle=color;c.fillText(String(text),x,y);}
 }
 return Object.freeze({model,trophy,fanfare,Ceremony});
});
