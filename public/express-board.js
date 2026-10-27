(()=>{
 'use strict';let state=null,lastWarning='',frame=0;
 const board=()=>document.getElementById('board');
 const lostHere=(room,id)=>room?.gameMode==='express'&&!!room.collapse?.lost?.[id];
 function decorate(){
  frame=0;const node=board();if(!node)return;
  const express=['express','countdown'].includes(state?.gameMode),view=window.MiniopolyExpressView.stage(state),world=Number(node.dataset.world);
  window.MiniopolyTsunami.decorateBoard(node,state);
  const collapse=state?.gameMode==='express';
  node.classList.toggle('express-cracks',collapse&&!!view&&(view.warning>=2||view.wave>0));node.style.setProperty('--express-crack-opacity',String(view?.wave?1:Math.min(1,.35+(view?.warning||0)*.13)));
  for(const tile of node.querySelectorAll('.tile[data-position]')){
   const id=world+'-'+tile.dataset.position,lost=express&&!!state.collapse?.lost?.[id],endangered=express&&state.collapse?.endangered?.includes(id),heat=window.MiniopolyPortalRecovery.status(state,id);
   tile.classList.toggle('express-lost',!!lost);tile.classList.toggle('express-endangered',!!endangered&&!lost);
   if((lost||endangered)&&!tile.querySelector('.collapse-surface')){
    const surface=document.createElement('span');surface.className='collapse-surface';surface.setAttribute('aria-hidden','true');const label=document.createElement('span');label.className='collapse-label';surface.append(label);tile.append(surface);
   }
   const tsunami=window.MiniopolyTsunami.tileStatus(state,id);
   const surface=tile.querySelector('.collapse-surface');
   if(surface){if(!lost&&!endangered)surface.remove();else {surface.querySelector('.collapse-label').textContent=tsunami?.label||(lost?'VOID · FATAL':'NEXT WAVE');let name=surface.querySelector('.tsunami-property-name');if(tsunami?.lost&&!name){name=document.createElement('span');name.className='tsunami-property-name';surface.prepend(name);}if(name){if(!tsunami?.lost)name.remove();else name.textContent=tile.querySelector('.tile-title')?.textContent||'Submerged property';}}}
   tile.classList.toggle('portal-hot',heat?.heat==='hot');tile.classList.toggle('portal-cooling',heat?.heat==='cooling');
   let embers=tile.querySelector('.portal-embers');
   if(heat&&!embers){embers=document.createElement('span');embers.className='portal-embers';embers.setAttribute('aria-hidden','true');for(let i=0;i<8;i++)embers.append(document.createElement('i'));const label=document.createElement('span');label.className='portal-heat-label';embers.append(label);tile.append(embers);}
   if(embers){if(!heat)embers.remove();else{embers.querySelector('.portal-heat-label').textContent=(heat.age===0?'HOT':'COOLING')+' · $'+heat.min+'–'+heat.max;embers.title=heat.label+' · Random $'+heat.min+'–$'+heat.max+' repair or medical fee on landing, plus normal rent. Cools after two recovered rounds.';}}
   const protectedHome=window.MiniopolyTsunami.hasProtection(state,id);
   if(!lost&&!endangered&&!heat&&!protectedHome&&tile.dataset.collapseLabel){tile.removeAttribute('aria-label');delete tile.dataset.collapseLabel;}
   if(lost||endangered||heat||protectedHome){tile.dataset.collapseLabel='true';const title=tile.querySelector('.tile-title')?.textContent||'Property';tile.setAttribute('aria-label',title+(lost?(state.gameMode==='countdown'?' · '+tsunami.description:' · Active portal · Evade token needed on first landing; a repeat this round is fatal'):endangered?' · Endangered · Struck after this round':'')+(protectedHome?' · Flood shield ready · Protects one tsunami hit at the cost of one upgrade':'')+(heat?' · '+heat.label+' · $'+heat.min+' to $'+heat.max+' damage fee on landing':''));}
  }
  for(const tile of node.querySelectorAll('.tile[data-position]')){
   for(const token of tile.querySelectorAll('.token[data-player-index]')){
    const player=state?.players[Number(token.dataset.playerIndex)],id=world+'-'+tile.dataset.position;
    const rescued=lostHere(state,id)&&!player?.out&&player?.board===world&&player?.pos===Number(tile.dataset.position)&&player.evade?.rescued?.includes(id);
    token.classList.toggle('express-evade-parked',!!rescued);
    if(rescued&&!token.querySelector('.evade-safety-ring')){const ring=document.createElement('span');ring.className='evade-safety-ring';ring.setAttribute('aria-hidden','true');token.prepend(ring);}
    if(!rescued)token.querySelector('.evade-safety-ring')?.remove();
   }
  }
  const round=node.querySelector('.mini519-round');if(express&&round){round.querySelector('span').textContent=view?.wave?(state.gameMode==='countdown'?'TSUNAMI':'COLLAPSE'):'BUILDING ROUND';round.querySelector('strong').textContent=view?.wave?'Wave '+view.wave:state.round+' of '+state.rounds;round.setAttribute('aria-label',view?.title||'Express building rounds');round.setAttribute('data-help',view?.hint||'Build quickly, then survive World Collapse.');}
  node.style.setProperty('--express-tremor',((view?.warning||1)*.5)+'px');
  const center=node.querySelector('.center');if(!collapse)center?.querySelector('.express-dust')?.remove();
  if(collapse&&view?.warning>=3&&center&&!center.querySelector('.express-dust')){const dust=document.createElement('span');dust.className='express-dust';dust.setAttribute('aria-hidden','true');for(let i=0;i<5;i++)dust.append(document.createElement('i'));center.append(dust);}
  const key=state?.code+':'+state?.matchId+':'+state?.round;
  if(!collapse)node.classList.remove('express-tremor');
  if(collapse&&state?.stage==='playing'&&(view?.warning||view?.wave)&&key!==lastWarning){lastWarning=key;window.miniPieceAudio?.playEffect('earthquake');node.classList.remove('express-tremor');if(!window.miniWifiReduceMotion&&!matchMedia('(prefers-reduced-motion: reduce)').matches){void node.offsetWidth;node.classList.add('express-tremor');}}
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(decorate);}
 window.addEventListener('message',event=>{if(event.source===window.parent&&event.origin===location.origin&&event.data?.type==='MINI_SYNC'){state=event.data.state;schedule();}});
 new MutationObserver(records=>{if(records.some(r=>[...r.addedNodes].some(n=>n.nodeType===1&&n.matches?.('.tile'))))schedule();}).observe(board(),{childList:true});
 board().addEventListener('click',event=>{const tile=event.target.closest('.express-lost');if(!tile)return;event.preventDefault();event.stopImmediatePropagation();window.miniWifiNotify?.(state?.gameMode==='countdown'?'SUBMERGED · No rent or property value. Landing here is safe.':'VOID · Temporarily worth $0. This property returns with cooling embers when the portal moves. An evade token can save a first visit; a repeat visit in this round is fatal.');},true);
})();
