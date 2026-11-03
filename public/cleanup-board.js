(()=>{'use strict';let state,lastId,seen=false,timer,route=[],step=0,visual=null,marker;
 let session=null,following=false,previousBoard=null,announcementTimer=null,returnTimer=null,queue=[],known=new Set(),bubble,followBar,voice=false,beforeSyncPreview=null;
 window.addEventListener('message',e=>{if(e.origin===location.origin&&e.source===parent&&e.data?.type==='MINI_SYNC')beforeSyncPreview=devPreviewBoard;},true);
 try{voice=localStorage.getItem('miniopoly_bot_voice_v1')==='true';}catch{}
 function controls(){
  if(followBar?.isConnected)return;const wrap=document.querySelector('.boardwrap');if(!wrap)return;
  followBar=document.createElement('div');followBar.className='cleanup-follow-controls';
  const toggle=document.createElement('button');toggle.type='button';toggle.onclick=()=>{if(following)stopFollowing();else{following=true;previousBoard=devPreviewBoard;focusBot();}refreshControls();};followBar.append(toggle);
  const label=document.createElement('label'),check=document.createElement('input');check.type='checkbox';check.checked=voice;check.onchange=()=>{voice=check.checked;try{localStorage.setItem('miniopoly_bot_voice_v1',String(voice));}catch{}if(!voice)window.speechSynthesis?.cancel();};label.append(check,document.createTextNode('Bot voice'));followBar.append(label);
  bubble=document.createElement('div');bubble.className='cleanup-bot-bubble';bubble.setAttribute('role','status');bubble.setAttribute('aria-live','polite');bubble.hidden=true;wrap.append(followBar,bubble);refreshControls();
 }
 function refreshControls(){window.miniCleanupFollowing=following;if(!followBar)return;followBar.hidden=!session;followBar.firstChild.textContent=following?'Stop following bot':'Follow bot';}
 function selectBoard(board){if(devPreviewBoard!==board){devPreviewBoard=board;render();}requestAnimationFrame(draw);}
 function focusBot(){if(!following)return;const c=state?.cleanup,loc=visual||c?.displayLocation||c;if(loc)selectBoard(loc.board);}
 function restoreBoard(){const prior=previousBoard;following=false;previousBoard=null;devPreviewBoard=prior;render();requestAnimationFrame(draw);}
 function stopFollowing(){if(following)restoreBoard();refreshControls();}
 function playNotice(message){
  if(!soundEnabled||miniWifiVolume<=0)return;
  if(['inspection','complete'].includes(message.kind)){try{playTick(.10,660,.09);setTimeout(()=>{if(soundEnabled)playTick(.10,880,.09);},120);}catch{}}
  if(voice&&window.speechSynthesis){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(message.text);u.rate=1.08;u.pitch=.75;u.volume=miniWifiVolume;speechSynthesis.speak(u);}
 }
 function showNext(){if(!queue.length){announcementTimer=null;return;}controls();const m=queue.shift();if(!bubble)return;bubble.textContent='🤖 '+m.text;bubble.hidden=false;playNotice(m);announcementTimer=setTimeout(()=>{bubble.hidden=true;showNext();},Math.min(7500,Math.max(4500,m.text.length*55)));}
 function receiveBroadcasts(next){
  const c=next?.cleanup,enabled=next?.stage==='playing'&&window.MiniopolyCleanupRules.enabled(next);
  if(!enabled){clearTimeout(announcementTimer);clearTimeout(returnTimer);queue=[];if(following)restoreBoard();session=null;bubble&&(bubble.hidden=true);refreshControls();return;}
  const current=c?.active?'tour:'+next.matchId+':'+c.sequence:c?.displayLocation?'visit:'+c.houseCall?.id:null;
  if(current&&current!==session){if(!following&&session===null){previousBoard=beforeSyncPreview;following=true;}session=current;clearTimeout(returnTimer);controls();refreshControls();}
  if(current){clearTimeout(returnTimer);returnTimer=null;focusBot();}
  else if(session&&!returnTimer){returnTimer=setTimeout(()=>{if(following)restoreBoard();session=null;returnTimer=null;refreshControls();},8500);}
  for(const m of c?.broadcasts||[]){if(known.has(m.id))continue;known.add(m.id);if(Date.now()-m.at<15000)queue.push(m);}
  if(known.size>150)known=new Set((c?.broadcasts||[]).map(m=>m.id));
  if(queue.length>6)queue=queue.slice(-6);if(!announcementTimer&&queue.length)showNext();
 }

 const moving=()=>!(window.miniWifiReduceMotion||matchMedia('(prefers-reduced-motion: reduce)').matches);
 function draw(){
  if(!state||!window.MiniopolyCleanupRules.enabled(state)){marker?.remove();return;}
  const c=state.cleanup,board=document.getElementById('board');if(!board)return;
  board.querySelectorAll('.cleanup-property-status').forEach(n=>n.remove());for(const tile of board.querySelectorAll('.tile[data-position]')){const id=getDisplayBoard()+'-'+tile.dataset.position,closed=window.MiniopolyCleanupRules.closed(state,id),bonus=window.MiniopolyCleanupRules.bonus(state,id)>1,condition=window.MiniopolyCleanupRules.condition(state,id);tile.dataset.conditionTier=String(condition.tier);tile.classList.toggle('cleanup-closed',closed);if(closed||bonus||state.owned?.[id]&&condition.tier>1){const label=document.createElement('span');label.className='cleanup-property-status';label.textContent=closed?'CLOSED':condition.tier>1?condition.label.toUpperCase()+' · '+condition.percent+'%': 'RENT +25%';tile.append(label);}}
  const loc=visual||c?.displayLocation||(c?.active?{board:c.board,pos:c.pos}:null);if(!loc||loc.board!==getDisplayBoard()){marker?.remove();return;}
  if(!marker?.isConnected){marker=document.createElement('div');marker.className='cleanup-board-bot';marker.setAttribute('role','img');marker.setAttribute('aria-label','Neighborhood Service Bot');const img=document.createElement('img');img.src='/art/cleanup-bot.png';img.alt='';marker.append(img);document.querySelector('.boardwrap').append(marker);}
  const wrap=marker.parentElement,tile=board.querySelector('.tile[data-position="'+loc.pos+'"]');if(!tile)return;const a=tile.getBoundingClientRect(),b=wrap.getBoundingClientRect();marker.style.left=(a.left-b.left+a.width*.6)+'px';marker.style.top=(a.top-b.top+a.height*.5)+'px';marker.classList.toggle('is-moving',!!visual&&moving());
 }
 function travel(){if(following)focusBot();if(step>=route.length){if(state.cleanup.lastMove.pos===0&&marker?.isConnected){marker.classList.add('is-teleporting');timer=setTimeout(()=>{visual=null;timer=null;if(following&&state.cleanup.active)selectBoard(state.cleanup.board);draw();},400);}else{visual=null;timer=null;if(following&&state.cleanup.active)selectBoard(state.cleanup.board);draw();}return;}visual={board:state.cleanup.lastMove.board,pos:route[step++]};draw();timer=setTimeout(travel,180);}
 window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==parent)return;if(e.data?.type==='MINI_RETURN_BOARD'){stopFollowing();return;}if(e.data?.type==='MINI_PLAYER_PREFERENCES'&&(e.data.preferences?.sound===false||e.data.preferences?.volume===0))window.speechSynthesis?.cancel();if(e.data?.type==='MINI_CLEANUP_DETAILS'&&asset(e.data.id)){devPreviewBoard=asset(e.data.id).board;render();showDeed(e.data.id);return;}if(e.data?.type==='MINI_CLEANUP_VIEW'&&Number.isInteger(e.data.board)&&e.data.board>=0&&e.data.board<3){devPreviewBoard=e.data.board;render();requestAnimationFrame(draw);return;}if(e.data?.type!=='MINI_SYNC')return;state=e.data.state;receiveBroadcasts(state);const c=state?.cleanup,move=c?.lastMove,id=move?.id;if(id&&id!==lastId){const replay=seen;lastId=id;clearTimeout(timer);if(following)selectBoard(move.board);if(move.kind==='house-call'){marker?.remove();visual=null;}else if(replay&&moving()&&c){route=move.path;step=0;visual={board:move.board,pos:move.from};travel();}else{visual=null;if(following&&c.active)selectBoard(c.board);}}if(!move){clearTimeout(timer);visual=null;lastId=null;}seen=true;requestAnimationFrame(draw);});
 document.addEventListener('click',e=>{const b=e.target.closest?.('[data-cleanup-housecall]');if(b)parent.postMessage({type:'MINI_CLEANUP_HOUSE_CALL',id:b.dataset.cleanupHousecall},location.origin);});
 window.addEventListener('resize',draw);document.addEventListener('DOMContentLoaded',()=>{const board=document.getElementById('board');if(board)new MutationObserver(()=>{requestAnimationFrame(draw);}).observe(board,{childList:true});});
})();
