(()=>{
 'use strict';let state=null,lastWarning='',frame=0;
 const board=()=>document.getElementById('board');
 function decorate(){
  frame=0;const node=board();if(!node)return;
  const express=state?.gameMode==='express',view=window.MiniopolyExpressView.stage(state),world=Number(node.dataset.world);
  node.classList.toggle('express-cracks',!!view&&view.warning>=2);node.style.setProperty('--express-crack-opacity',String((view?.warning||0)/5));
  for(const tile of node.querySelectorAll('.tile[data-position]')){
   const id=world+'-'+tile.dataset.position,lost=express&&!!state.collapse?.lost?.[id],endangered=express&&state.collapse?.endangered?.includes(id);
   tile.classList.toggle('express-lost',!!lost);tile.classList.toggle('express-endangered',!!endangered&&!lost);
   if((lost||endangered)&&!tile.querySelector('.collapse-surface')){
    const surface=document.createElement('span');surface.className='collapse-surface';surface.setAttribute('aria-hidden','true');const label=document.createElement('span');label.className='collapse-label';surface.append(label);tile.append(surface);
   }
   const surface=tile.querySelector('.collapse-surface');
   if(surface){if(!lost&&!endangered)surface.remove();else surface.querySelector('.collapse-label').textContent=lost?'VOID · FATAL':'NEXT WAVE';}
   if(lost||endangered){const title=tile.querySelector('.tile-title')?.textContent||'Property';tile.setAttribute('aria-label',title+(lost?' · Collapsed · Fatal on landing':' · Endangered · Collapses after this round'));}
  }
  for(const tile of node.querySelectorAll('.tile[data-position]')){
   for(const token of tile.querySelectorAll('.token[data-player-index]')){
    const player=state?.players[Number(token.dataset.playerIndex)],id=world+'-'+tile.dataset.position;
    const rescued=express&&!player?.out&&player?.board===world&&player?.pos===Number(tile.dataset.position)&&player.evade?.rescued?.includes(id);
    token.classList.toggle('express-evade-parked',!!rescued);
    if(rescued&&!token.querySelector('.evade-safety-ring')){const ring=document.createElement('span');ring.className='evade-safety-ring';ring.setAttribute('aria-hidden','true');token.prepend(ring);}
    if(!rescued)token.querySelector('.evade-safety-ring')?.remove();
   }
  }
  const round=node.querySelector('.mini519-round');if(express&&round){round.querySelector('span').textContent=view?.wave?'COLLAPSE':'BUILDING ROUND';round.querySelector('strong').textContent=view?.wave?'Wave '+view.wave:state.round+' of '+state.rounds;round.setAttribute('aria-label',view?.title||'Express building rounds');round.setAttribute('data-help',view?.hint||'Build quickly, then survive World Collapse.');}
  node.style.setProperty('--express-tremor',((view?.warning||1)*.5)+'px');
  const center=node.querySelector('.center');if(view?.warning>=3&&center&&!center.querySelector('.express-dust')){const dust=document.createElement('span');dust.className='express-dust';dust.setAttribute('aria-hidden','true');for(let i=0;i<5;i++)dust.append(document.createElement('i'));center.append(dust);}
  const key=state?.code+':'+state?.matchId+':'+state?.round;
  if(view?.warning&&key!==lastWarning){lastWarning=key;node.classList.remove('express-tremor');if(!window.miniWifiReduceMotion&&!matchMedia('(prefers-reduced-motion: reduce)').matches){void node.offsetWidth;node.classList.add('express-tremor');}}
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(decorate);}
 window.addEventListener('message',event=>{if(event.source===window.parent&&event.origin===location.origin&&event.data?.type==='MINI_SYNC'){state=event.data.state;schedule();}});
 new MutationObserver(records=>{if(records.some(r=>[...r.addedNodes].some(n=>n.nodeType===1&&n.matches?.('.tile'))))schedule();}).observe(board(),{childList:true});
 board().addEventListener('click',event=>{const tile=event.target.closest('.express-lost');if(!tile)return;event.preventDefault();event.stopImmediatePropagation();window.miniWifiNotify?.('LOST · This property is worth $0 and is fatal on landing.');},true);
})();
