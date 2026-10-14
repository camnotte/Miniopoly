'use strict';
// This optional display mode never submits game actions or creates a room.
(() => {
  if(new URLSearchParams(location.search).get('review')!=='graphics')return;
  document.documentElement.classList.add('graphics-review');
  G.players.forEach((player,index)=>{player.name=['Morgan','Alex'][index]||'Player '+(index+1);});
  let previewLevel=0,inspectedDeed=null;
  const inspectNativeDeed=showDeed;
  showDeed=function(id){
    inspectedDeed=id;
    const previous=G.owned[id];
    const hasPreviewUpgrades=asset(id)?.type==='p'&&previewLevel>0;
    if(hasPreviewUpgrades)G.owned[id]={owner:0,level:previewLevel,mortgage:false};
    try{return inspectNativeDeed(id);}
    finally{
      if(hasPreviewUpgrades){if(previous)G.owned[id]=previous;else delete G.owned[id];}
    }
  };
  const nativeRender=render;
  render=function(){
    nativeRender();
    const die=document.getElementById('dice');
    if(die){die.onclick=()=>{};die.onkeydown=()=>{};die.setAttribute('aria-disabled','true');die.setAttribute('aria-label','12-sided die visual preview');}
    const caption=document.querySelector('.mini-turn-status');
    if(caption)caption.textContent='EXPLORE YOUR NEIGHBORHOOD';
    const status=document.querySelector('.mini-live-info');
    if(status)status.textContent='Graphics review · example players';
    document.querySelectorAll('#board .tile.property').forEach(tile=>{
      const deed=asset(getDisplayBoard()+'-'+tile.dataset.position);
      tile.tabIndex=0;tile.setAttribute('role','button');tile.setAttribute('aria-label','View '+deed.name+' property card');
      tile.onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();tile.click();}};
    });
  };
  window.addEventListener('message',event=>{
    if(event.origin!==location.origin||event.source!==window.parent)return;
    if(event.data?.type==='MINI_REVIEW_LEVEL'){
      const level=event.data.level;
      if(!Number.isInteger(level)||level<0||level>3)return;
      previewLevel=level;
      if(inspectedDeed&&!document.getElementById('overlay').classList.contains('hidden'))showDeed(inspectedDeed);
      return;
    }
    if(event.data?.type!=='MINI_REVIEW_WORLD')return;
    const index=event.data.world;
    if(!Number.isInteger(index)||index<0||index>2)return;
    enforceClose();inspectedDeed=null;devPreviewBoard=index===0?null:index;render();
  });
  enforceClose();render();
  miniWifiPost('MINI_REVIEW_READY');
})();
