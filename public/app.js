'use strict';
const el=id=>document.getElementById(id);
const floatingTurnPanel=new window.MiniopolyFloatingPanel(el('turnPanel'),{
  storageKey:'miniopoly_live_turn_panel_v1',home:el('turnPanelHome'),reset:el('resetTurnPanelButton'),inlineHome:el('phoneTurnHeader')
});
const liveExperience=new window.MiniopolyLiveExperience({sendMessage:text=>api('chat',{...auth,text}),sendAttachment:file=>api('attachment',{...auth,...file}),onChatToggle:open=>{chatSelected=open;if(open){chatReadId=state?.chat?.at(-1)?.id||null;el('chatBadge').hidden=true;}}});
const matchActivity=new window.MiniopolyMovableActivity(el('matchActivityPanel'));
const pageOcean=new window.MiniopolyTsunamiOcean.PageOcean({getReducedMotion:()=>gameOptions.reducedMotion});
const evadeTokens=new window.MiniopolyEvadeTokens.Display({showBar:false});
const tradingCenter=new window.MiniopolyTradingCenter({getPreferences:()=>gameOptions.personal,getBusy:()=>loading||animating,send:async(kind,extra)=>{if(loading||animating||!auth)throw Error('Wait for the current move to finish.');const requestAuth={...auth};const data=await api('action',{...requestAuth,kind,...extra});applyRoomState(data.state,{requestAuth});}});
const playerAdvisor=new window.MiniopolyPlayerAdvisor.Display({onEnable:()=>setHintsEnabled(true),onAction:handleAdvisorAction});
el('compactGameTools').append(playerAdvisor.element);
const developerTools=new window.MiniopolyDeveloperTools({getBusy:()=>loading||animating||diceSpinning||!!worldTransitionKey||rollPending,send:async developer=>{if(loading||animating||diceSpinning||worldTransitionKey||rollPending)throw Error('Wait for movement to finish.');const requestAuth={...auth};setLoading(true);try{const data=await api('action',{...requestAuth,kind:'developer',developer});applyRoomState(data.state,{requestAuth});}finally{setLoading(false);}}});
const matchLifecycle=new window.MiniopolyMatchLifecycle({onReturn:()=>leaveRoom(true)});
const championship=new window.MiniopolyChampionship.Ceremony(el('awardsLayer'),{getRoom:()=>state,getPreferences:()=>({...gameOptions.personal,reducedMotion:gameOptions.reducedMotion}),onSound:()=>playVictoryTone(),onError:message=>showError(message)});
let financialHold=null,activitySignature='',worldTransitionKey='',buildingPermitSort='price';
const presentedRoom=()=>window.MiniopolyLandingPresentation.project(state,financialHold);
const presentedPlayers=()=>presentedRoom()?.players||[];
const landingArtwork=new window.MiniopolyLandingPresentation.Artwork(el('modalArt'),el('modalArtFallback'));
const landingWatch=new window.MiniopolyLandingPresentation.WatchState();
let landingUpgradeSignature='',landingUpgradeId='',festivalRenderSignature='';
let panelPlayersSignature='',panelMirrorFrame=null,boardModalObserver=null,boardModalOpen=false,boardView=null;
function updateFloatingPanel(){
  const active=state?.players?.[state.turn],myTurn=active?.id===state?.youId;
  const visible=Boolean(auth&&boardReady&&state&&state.stage!=='lobby');
  const blocked=boardModalOpen||['purchaseLayer','propertiesLayer','foreclosureLayer','legendaryLayer','awardsLayer','cardReviewLayer','buildingPermitDetails','gameOptionsLayer'].some(id=>!el(id).hidden);
  if((blocked||!visible)&&!propertyOverview.visible)playerSetDetails.close();
  floatingTurnPanel.update({visible,busy:loading||animating||diceSpinning,blocked,
    title:state?.stage==='finished'?'Match complete':myTurn?'Your turn':(active?.name||'Player')+"’s turn",
    attention:state?.code+':'+state?.stage+':'+state?.turnNumber+':'+state?.turn});
}
function mirrorBoardDie(){
  if(panelMirrorFrame!==null)cancelAnimationFrame(panelMirrorFrame);
  if(!boardReady||!auth||!state||state.stage==='lobby'){panelMirrorFrame=null;return;}
  const draw=()=>{
    panelMirrorFrame=null;
    const source=el('boardFrame').contentDocument?.getElementById('mini512-die');
    const target=el('panelDie');
    if(source?.width&&source.height){
      const context=target.getContext('2d');context.clearRect(0,0,target.width,target.height);
      context.drawImage(source,0,0,target.width,target.height);
      target.dataset.roll=diceSpinning?'':String(state?.lastRoll?.value||'');
    }
    if(auth&&boardReady&&animating)panelMirrorFrame=requestAnimationFrame(draw);
  };
  panelMirrorFrame=requestAnimationFrame(draw);
}
function rankPlayersByWorth(players){
  const worth=player=>Number(player.worth)||0;
  const sorted=[...players].sort((a,b)=>Number(Boolean(a.out))-Number(Boolean(b.out))||worth(b)-worth(a)||a.seat-b.seat);
  return sorted.map(player=>({player,
    rank:player.out?null:sorted.findIndex(other=>!other.out&&worth(other)===worth(player))+1,
    tied:!player.out&&sorted.some(other=>other.id!==player.id&&!other.out&&worth(other)===worth(player))
  }));
}
function propertyGroups(room,seat){return window.MiniopolyPlayerSets.groups(Object.values(gameDeeds),room,seat);}
function makePlayerPropertiesButton(player,room){
  const button=document.createElement('button');button.type='button';button.className='player-properties-button';button.dataset.playerSeat=String(player.seat);
  const protectedCount=room?.gameMode==='countdown'?Object.keys(room.owned||{}).filter(id=>room.owned[id].owner===player.seat&&window.MiniopolyTsunami.hasProtection(room,id)).length:null;
  const description='View '+player.name+' properties · '+(player.deeds??0)+(player.deeds===1?' deed':' deeds')+(protectedCount===null?'':' · '+protectedCount+' protected from the next tsunami hit');
  button.setAttribute('aria-label',description);button.title=description;
  button.setAttribute('aria-controls','propertyOverview');button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-expanded','false');
  button.innerHTML=window.MiniopolyPropertyOverview.icon();const label=makeTag('span','Properties');label.className='player-properties-label';
  const counts=document.createElement('span');counts.className='player-properties-counts';counts.setAttribute('aria-hidden','true');
  if(protectedCount!==null){const shield=makeTag('span','');shield.className='player-protected-count';shield.innerHTML='<svg viewBox="0 0 28 32" focusable="false"><path d="M14 1.5 26 6v9c0 7-5 12-12 15.5C7 27 2 22 2 15V6Z" fill="#23844e" stroke="#eef7df" stroke-width="2"/></svg>';shield.append(makeTag('b',String(protectedCount)));counts.append(shield);}
  const count=makeTag('span',String(player.deeds??0));count.className='player-properties-count';counts.append(count);button.append(label,counts);return button;
}
function makePropertySetStrip(player,room){
  const section=document.createElement('section');section.className='player-property-sets';section.setAttribute('aria-label',player.name+' property sets');
  const grid=document.createElement('div');grid.className='player-sets-grid';
  for(const group of propertyGroups(room,player.seat)){
    const button=document.createElement('button');button.type='button';button.className='player-set-chip'+(group.complete?' is-complete':'')+(!group.count?' is-empty':'');
    button.dataset.playerSeat=String(player.seat);button.dataset.setColor=group.color;button.dataset.room=room.code+':'+(room.matchId||'lobby');
    button.style.setProperty('--set-color',group.fill);button.style.setProperty('--set-ink',group.ink);
    button.setAttribute('aria-label',player.name+' · '+group.color+' set · '+group.count+' of '+group.total+' owned'+(group.complete?' · Complete':'')+' · Show properties and worlds');
    button.setAttribute('aria-controls','playerSetDetails');button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-expanded','false');
    const label=makeTag('span',group.color);label.className='set-name';button.append(label,makeTag('b',group.count+'/'+group.total));
    if(group.complete){const check=makeTag('span','✓');check.className='set-complete-check';check.setAttribute('aria-hidden','true');button.append(check);}
    grid.append(button);
  }
  section.append(grid);
  const other=window.MiniopolyPlayerSets.otherDeeds(Object.values(gameDeeds),room,player.seat);
  if(other.count){
    const button=makeTag('button','Railroads & utilities · '+other.count);button.type='button';button.className='player-set-chip player-other-deeds';
    Object.assign(button.dataset,{playerSeat:String(player.seat),setColor:'Other deeds',room:room.code+':'+(room.matchId||'lobby')});
    button.setAttribute('aria-label',player.name+' · '+other.count+' owned railroads and utilities · Show deeds and worlds');
    button.setAttribute('aria-controls','playerSetDetails');button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-expanded','false');section.append(button);
  }
  return section;
}
function renderOverviewPlayer(player,room){
  const row=document.createElement('article');row.className='property-overview-player';row.dataset.playerSeat=String(player.seat);
  const heading=document.createElement('header'),select=document.createElement('button');select.type='button';select.className='property-overview-select';select.dataset.overviewSelect=String(player.seat);
  select.append(avatarElement(player));const name=makeTag('span',player.name);name.className='property-overview-name';select.append(name);
  if(player.id===room.youId){const you=makeTag('span','YOU');you.className='property-overview-you';select.append(you);}
  select.setAttribute('aria-label','Highlight '+player.name+' properties');
  const total=makeTag('span',(player.deeds??0)+(player.deeds===1?' deed':' deeds'));total.className='property-overview-total';heading.append(select,total);row.append(heading);
  if(player.out)row.append(makeTag('small',player.outReason==='countdown'?'Portfolio submerged':player.outReason==='collapse'?'Lost to collapse':'Bankrupt'));
  const badge=window.MiniopolyEvadeTokens.badge(player);if(badge)row.append(badge);
  row.append(makePropertySetStrip(player,room));return row;
}
function renderUpgradedProperties(room){
  const section=document.createElement('section');section.className='world-upgrades';
  section.append(makeTag('p','All players · Properties with upgrades, across all three worlds.'));
  for(let world=0;world<3;world++){
    const deeds=Object.values(gameDeeds).filter(d=>d.board===world&&d.type==='p'&&room.owned[d.id]?.level>0&&!room.collapse?.lost?.[d.id]);
    const group=document.createElement('section');group.className='world-upgrade-group';group.append(makeTag('h3',GAME_WORLDS[world]+' · '+deeds.length));
    const list=document.createElement('ul');
    for(const d of deeds){
      const own=room.owned[d.id],player=room.players[own.owner],li=document.createElement('li');li.dataset.upgradedDeed=d.id;
      const name=makeTag('strong',d.name),level=window.MiniopolyDevelopment.badge(own.level,d);level.className='upgrade-level-badge';
      const details=makeTag('small',(player?.name||'Unknown owner')+' · '+d.color+(own.mortgage?' · Mortgaged':'')+(player?.penalty?' · Rent paused in Setback':''));
      li.append(name,level,details);
      if(room.gameMode==='countdown')li.append(makeTag('small',room.collapse?.shieldSpent?.[d.id]?'Flood protection spent':'Seawall ready · One tsunami hit protected'));
      list.append(li);
    }
    if(!deeds.length)group.append(makeTag('p','No upgraded properties in this world.'));else group.append(list);section.append(group);
  }
  return section;
}
function renderFloatingPlayers(){
  const room=presentedRoom(),players=room?.players||[];
  const worlds=players.map(player=>window.MiniopolyLandingPresentation.worldForPlayer(state,financialHold,player));
  const signature=JSON.stringify([state.stage,state.turn,state.youId,players,worlds,room?.owned,room?.foreclosures,room?.gameMode,room?.collapse?.lost,room?.collapse?.shieldSpent]);
  if(signature===panelPlayersSignature)return;
  panelPlayersSignature=signature;
  const ranked=rankPlayersByWorth(players);
  const list=el('panelPlayers');list.replaceChildren();
  for(const {player,rank:place,tied} of ranked){
    const active=state.stage==='playing'&&player.seat===state.turn;
    const row=document.createElement('li');row.className='panel-player'+(active?' is-active':'')+(player.out?' is-out':'');
    row.dataset.playerSeat=String(player.seat);
    if(active)row.setAttribute('aria-current','true');
    const details=document.createElement('div'),name=makeTag('div',player.name),info=document.createElement('div');
    details.className='panel-player-info';name.className='panel-player-name';info.className='panel-player-detail';
    const turn=makeTag('span',player.out?(player.outReason==='countdown'?'Portfolio submerged':player.outReason==='collapse'?'Lost to collapse':'Bankrupt'):active?(player.id===state.youId?'YOUR TURN':'PLAYING'):player.penalty>0?'In Setback':player.connected?'Online':'Reconnecting…');
    turn.className=active?'panel-playing':'';info.append(turn);
    if(active&&player.penalty>0)info.append(makeTag('span','In Setback'));
    if(active&&!player.connected)info.append(makeTag('span','Reconnecting…'));
    const stats=document.createElement('div');stats.className='panel-player-stats';
    for(const [label,value] of [['Net worth',money(player.worth)],['Cash',money(player.cash)]]){
      const stat=document.createElement('span');stat.className=label==='Net worth'?'panel-worth':'panel-cash';stat.append(makeTag('small',label),makeTag('b',value));stats.append(stat);
    }
    const rank=makeTag('span',player.out?'OUT':String(place));rank.className='panel-rank';rank.setAttribute('aria-label',player.out?(player.outReason==='countdown'?'Portfolio submerged':player.outReason==='collapse'?'Lost to collapse':'Bankrupt'):(tied?'Tied for net-worth rank ':'Net-worth rank ')+place);rank.title=player.out?(player.outReason==='countdown'?'Portfolio submerged':player.outReason==='collapse'?'Lost to collapse':'Bankrupt'):(tied?'Tied for rank ':'Rank ')+place+' · '+money(player.worth)+' net worth';
    const world=worlds[players.indexOf(player)];
    const worldBadge=makeTag('span',GAME_WORLDS[world]||'Unknown world');worldBadge.className='panel-player-world';worldBadge.dataset.world=String(world);
    worldBadge.setAttribute('aria-label',(player.out?'Last world: ':'Current world: ')+worldBadge.textContent);worldBadge.title=worldBadge.getAttribute('aria-label');
    details.append(name,worldBadge,info);const evadeBadge=window.MiniopolyEvadeTokens.badge(player);if(evadeBadge)details.append(evadeBadge);const identity=document.createElement('div');identity.className='player-identity';identity.append(makePlayerPortrait(player,player.id===state.youId),details,makePlayerPropertiesButton(player,room));
    const card=document.createElement('div');card.className='panel-player-card';card.append(identity,stats);row.append(rank,card);list.append(row);
  }
  playerSetDetails.refresh();
}

function renderFloatingPanel(myTurn,active){
  renderFloatingPlayers();
  el('panelPlayerCount').textContent=state.players.length+' at the table';
  el('panelTurnLabel').textContent=state.stage==='finished'?'Match complete':myTurn?'Your turn, '+active.name:active.name+"’s turn";
  el('panelRound').replaceChildren(document.createTextNode(['express','countdown'].includes(state.gameMode)&&state.collapse?.wave?(state.gameMode==='countdown'?'Tsunami · Wave ':'Collapse · Wave ')+state.collapse.wave:state.round+' '));
  const total=document.createElement('small');total.textContent=['express','countdown'].includes(state.gameMode)?(state.collapse?.wave?'':'/ '+state.rounds+' building'):state.rounds?'/ '+state.rounds:'· no limit';el('panelRound').append(total);
  el('panelRound').parentElement.removeAttribute('aria-label');
  el('panelShift').textContent=state.accelerated?'Consecutive bonus rolls: '+(state.bonusCount||0)+' of 3':'Shift '+(active?.streak||0)+' / 10';
  const waiting=state.stage==='playing'&&!myTurn;
  const end=el('endButton');end.classList.toggle('is-waiting',waiting);
  el('endButtonLabel').textContent=waiting?'Waiting for '+active.name:'End Turn';
  el('panelDieLabel').textContent=diceSpinning?'Rolling…':animating?'Piece moving…':state.stage==='finished'?'Match complete':!myTurn?'':state.phase==='roll'?'Tap to roll':'Roll complete';
  const compact=el('compactRoll');
  compact.textContent=diceSpinning?'Rolling…':animating?'Moving…':state.stage==='finished'?'Done':waiting?'Waiting for '+active.name:myTurn&&state.phase==='end'?'End turn':'Roll';
  compact.disabled=state.phase==='end'?el('endButton').disabled:el('rollButton').disabled;
  const world=boardView?.world??active?.board??0;
  el('boardWorldTitle').textContent=GAME_WORLDS[world];
  el('boardWorldSubtitle').textContent=window.MiniopolyVisuals.worldScenery(world)?.subtitle||'';
  el('boardMode').textContent=boardView?.preview?'World preview':state.stage==='finished'?'Match complete':'Live board';
  el('returnLiveBoard').hidden=!boardView?.preview;
  updateFloatingPanel();mirrorBoardDie();
}
function refreshControlIcons(){
  document.querySelectorAll('button[data-icon]').forEach(button=>{
    button.classList.add('storybook-control');
    // Preserve labels, badges and listeners while replacing platform emoji art.
    for(const node of button.childNodes){
      if(node.nodeType===Node.TEXT_NODE && node.textContent.trim()){
        node.textContent=node.textContent.replace(/^[\s\p{Extended_Pictographic}\uFE0F\u200D⛶↙]+/u,'');
        break;
      }
    }
  });
}
const deedArt=id=>window.MiniopolyVisuals.propertyArt(id)||artCache.get(id);
let boardSizeObserver=null;
function fitMobileBoard(){
  const frame=el('boardFrame');
  if(innerWidth>850&&frame.clientWidth>=900){
    frame.style.removeProperty('height');if(boardReady){sendBoardViewport();liveExperience.position();}return;
  }
  const content=frame.contentDocument?.querySelector('.app');
  if(content)frame.style.setProperty('height',Math.ceil(content.getBoundingClientRect().height+8)+'px','important');
  sendBoardViewport();
  if(typeof liveExperience!=='undefined')liveExperience.position();
}
function sendBoardViewport(){
  if(!boardReady)return;
  const rect=el('boardFrame').getBoundingClientRect(),top=Math.max(0,-rect.top);
  const height=Math.max(0,Math.min(rect.height,innerHeight-rect.top)-top);
  el('boardFrame').contentWindow?.postMessage({type:'MINI_VIEWPORT',top,height},location.origin);
}
const STORE_KEY='miniopoly_wifi_seat_v1';
const HINTS_KEY='miniopoly_wifi_help_hints_v1';
let foreclosureOpen=false;
let roomCatchupTimer=null,roomCatchupRequest=null;
let propertiesOpen=false, legendaryOpen=false, legendaryRounds=20, legendaryMode='individual', awardsHidden=false, awardsSeenMatchId=null, soundForAwards=true;

let hintsEnabled=(localStorage.getItem(HINTS_KEY)??'on')!=='off';
let auth=null, state=null, feed=null, chatReadId=null, chatSelected=false, pendingChatOpen=false, loading=false, rollPending=false, networkInfo=null, boardReady=false, animating=false, diceSpinning=false, animationSafetyTimer=null, currentTab='create', modalTab='main', rememberedPhase='', artCache=new Map(), specialArtCache=new Map(), artRequested=new Set();
const sessionNotice=new window.MiniopolyRoomSync.Notice(el('sessionNotice'),{storage:sessionStorage,onAction:value=>{
  if(value.kind==='reset'){sessionNotice.clear();switchTab(value.host?'create':'join');el(value.host?'createName':'joinCode').focus();}
  else if(['lost','stopped'].includes(value.kind))wakeRoomConnection();else sessionNotice.clear();
}});
function showError(message){const box=el('alert');box.textContent=message;box.hidden=false;clearTimeout(showError.timer);showError.timer=setTimeout(()=>box.hidden=true,8500);}
function setLoading(active){loading=active;render();}
async function api(route,body,{signal}={}){
  const response=await fetch('/api/'+route,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal});
  let result;
  try{result=await response.json();}catch{throw new Error('Server sent an invalid response.');}
  if(response.status===401&&networkInfo?.remote){location.reload();throw new Error('Please sign into the private game again.');}
  if(!response.ok){if(response.status===410&&auth&&body?.code===auth.code&&body?.token===auth.token)resetClosedSeat({code:body.code,message:result.error},{code:body.code,token:body.token});throw Object.assign(new Error(result.error||'Request failed.'),{status:response.status});}
  return result;
}
function switchTab(tab){
  currentTab=tab;avatarPicker?.closeChooser();piecePicker?.setActive(tab,!auth);
  el('createForm').hidden=tab!=='create';el('joinForm').hidden=tab!=='join';entryOptions?.setJoin(tab==='join');
  el('createTab').classList.toggle('selected',tab==='create');
  el('joinTab').classList.toggle('selected',tab==='join');
}
function getLanBase(){
  const fromBrowser=location.origin;
  if(!['localhost','127.0.0.1','::1'].includes(location.hostname))return fromBrowser;
  const addresses=networkInfo?.urls||[];
  const preferred=addresses.find(u=>/^http:\/\/(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(u));
  return preferred||addresses[0]||fromBrowser;
}
function invite(){return getLanBase()+'/?room='+encodeURIComponent(state?.code||'');}
async function copy(text,input){
  try{await navigator.clipboard.writeText(text);showError('Copied to clipboard.');}
  catch{
    if(input){input.focus();input.select();try{document.execCommand('copy');showError('Link selected/copied.');}catch{showError('Select and copy the link manually.');}}
    else showError('Your browser blocked copying. Select the room code on screen.');
  }
}
function saveAuth(result){sessionNotice.clear();if(auth?.code!==result.code)boardView=null;auth={code:result.code,token:result.token};window.MiniopolySeats.remember(localStorage,auth);localStorage.setItem(STORE_KEY,JSON.stringify(auth));state=result.state;const address=new URL(location.href);for(const key of ['new','restore','resume','roomName'])address.searchParams.delete(key);if(address.searchParams.has('room'))address.searchParams.set('room',auth.code);history.replaceState(null,'',address.pathname+address.search+address.hash);connect();render();}
function resetClosedSeat(notice,requestAuth=auth){
  if(!window.MiniopolyRoomSync.sameSeat(auth,requestAuth)||notice?.code!==auth?.code)return;
  const host=state?.youId===state?.hostId,code=auth.code;
  window.MiniopolySeats.forget(localStorage,auth.code);leaveRoom();
  history.replaceState(null,'',location.pathname);el('joinCode').value='';
  showRoomResetNotice({host,code});
}
function showRoomResetNotice(details){clearTimeout(showError.timer);el('alert').hidden=true;switchTab(details.host?'create':'join');sessionNotice.show('reset',details);}
function beginRollPlaybackIfNew(incoming){
  if(!boardReady||state?.stage!=='playing'||!incoming?.lastRoll?.at||incoming.lastRoll.at===state.lastRoll?.at||incoming.lastRoll.playerId!==incoming.players?.[incoming.turn]?.id)return;
  financialHold=window.MiniopolyLandingPresentation.capture(state,incoming);
  animating=true;
  diceSpinning=true;
  clearTimeout(animationSafetyTimer);
  // 1.65 s of dice + up to 12 x 0.69 s of movement + a world-shift pause.
  animationSafetyTimer=setTimeout(()=>{animating=false;diceSpinning=false;financialHold=null;render();},24000);
}
function setConnectionStatus(connected,stopped=false){
  if(!auth)return;
  if(connected&&state?.hostingStopping){connected=false;stopped=true;}
  const text=connected?'Connected to host':'Reconnecting…';
  const pill=el('networkPill');pill.textContent=text;pill.title=text;pill.setAttribute('aria-label',text);pill.dataset.connected=String(connected);
  el('menuConnection').textContent=connected?'Connected':stopped?'Host stopped':'Reconnecting…';el('menuConnection').dataset.connected=String(connected);
  if(connected)sessionNotice.connected();else sessionNotice.show(stopped?'stopped':'lost');
  clearInterval(roomCatchupTimer);roomCatchupTimer=setInterval(()=>{void refreshRoomState();},connected?5000:2000);
}
function applyRoomState(incoming,{requestAuth=auth,catchUp=false}={}){
  if(!window.MiniopolyRoomSync.acceptsSnapshot(state,incoming,auth,requestAuth))return false;
  const worldHandoff=Boolean(!gameOptions.reducedMotion&&boardReady&&!catchUp&&state?.stage==='playing'&&incoming.stage==='playing'&&state.matchId===incoming.matchId&&state.turn!==incoming.turn&&state.players[state.turn]?.board!==incoming.players[incoming.turn]?.board&&!matchMedia('(prefers-reduced-motion: reduce)').matches);
  const changedTurn=state&&(state.matchId!==incoming.matchId||state.turnNumber!==incoming.turnNumber||state.turn!==incoming.turn||state.stage!==incoming.stage);
  const unseenRoll=incoming.lastRoll?.at&&incoming.lastRoll.at!==state?.lastRoll?.at;
  const releasedEscapeSnapshot=incoming.lastRoll?.at===state?.lastRoll?.at&&state?.lastRoll?.noMove&&!incoming.lastRoll?.noMove;
  const skipReplay=Boolean((catchUp&&(unseenRoll||releasedEscapeSnapshot))||(changedTurn&&incoming.lastRoll?.playerId!==incoming.players[incoming.turn]?.id));
  if(changedTurn||skipReplay){worldTransitionKey='';clearTimeout(animationSafetyTimer);animating=false;diceSpinning=false;financialHold=null;}
  if(unseenRoll)worldTransitionKey='';
  if(!skipReplay){
    if(releasedEscapeSnapshot){financialHold=window.MiniopolyLandingPresentation.capture(state,incoming);animating=true;diceSpinning=false;clearTimeout(animationSafetyTimer);animationSafetyTimer=setTimeout(()=>{animating=false;financialHold=null;render();},24000);}
    else beginRollPlaybackIfNew(incoming);
  }
  if(worldHandoff){worldTransitionKey=[incoming.matchId,incoming.turnNumber,incoming.players[incoming.turn].id].join(':');animating=true;diceSpinning=false;clearTimeout(animationSafetyTimer);animationSafetyTimer=setTimeout(()=>{worldTransitionKey='';animating=false;render();},5000);}
  state=incoming;render();syncBoard({skipReplay,transitionWorld:worldHandoff});syncChat();return true;
}
function stopRoomCatchup(){
  clearInterval(roomCatchupTimer);roomCatchupTimer=null;
  roomCatchupRequest?.controller.abort();roomCatchupRequest=null;
}
async function refreshRoomState(force=false){
  if(!auth||!state||(!force&&document.hidden))return;
  if(roomCatchupRequest&&window.MiniopolyRoomSync.sameSeat(roomCatchupRequest.auth,auth))return;
  roomCatchupRequest?.controller.abort();
  const request={auth:{...auth},controller:new AbortController()};roomCatchupRequest=request;
  const timeout=setTimeout(()=>request.controller.abort(),2500);
  try{
    const data=await api('resume',request.auth,{signal:request.controller.signal});
    if(roomCatchupRequest!==request||!window.MiniopolyRoomSync.sameSeat(auth,request.auth))return;
    applyRoomState(data.state,{requestAuth:request.auth,catchUp:true});setConnectionStatus(true);
    if(feed?.readyState===EventSource.CLOSED)connect();
  }catch(error){
    if(error.status===410){resetClosedSeat({code:request.auth.code,message:error.message},request.auth);return;}
    if(roomCatchupRequest===request&&window.MiniopolyRoomSync.sameSeat(auth,request.auth))setConnectionStatus(false);
  }finally{clearTimeout(timeout);if(roomCatchupRequest===request)roomCatchupRequest=null;}
}
function wakeRoomConnection(){
  if(!auth||document.hidden)return;
  stopRoomCatchup();connect();void refreshRoomState(true);
}
async function restoreLiveBoard(){
  if(!auth||loading)return;
  const requestAuth={...auth};
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),4500);
  stopRoomCatchup();
  try{
    setLoading(true);
    const data=await api('resume',requestAuth,{signal:controller.signal});
    if(!window.MiniopolyRoomSync.sameSeat(auth,requestAuth))return;
    // Rebuild presentation only after the host answers. Never reset the match.
    clearTimeout(animationSafetyTimer);worldTransitionKey='';financialHold=null;
    animating=false;diceSpinning=false;boardView=null;artRequested.clear();
    applyRoomState(data.state,{requestAuth,catchUp:true});
    boardReady=false;boardModalOpen=false;
    el('phoneGameMenu').open=false;
    const frame=el('boardFrame');
    if(frame.getAttribute('src'))frame.contentWindow.location.replace(frame.src);
    else ensureBoard();
    setConnectionStatus(true);
  }catch(error){if(window.MiniopolyRoomSync.sameSeat(auth,requestAuth))showError('Unable to restore the board: '+error.message+' Your saved match has not been reset.');}
  finally{clearTimeout(timeout);if(window.MiniopolyRoomSync.sameSeat(auth,requestAuth)){setLoading(false);connect();}}
}
function handleRoomPageShow(event){
  if(event.persisted&&auth&&!loading)void restoreLiveBoard();
  else wakeRoomConnection();
}
function connect(){
  if(feed)feed.close();
  clearInterval(roomCatchupTimer);
  if(!auth)return;
  const requestAuth={...auth},subscription=new EventSource('/api/events?code='+encodeURIComponent(auth.code)+'&token='+encodeURIComponent(auth.token));feed=subscription;
  roomCatchupTimer=setInterval(()=>{void refreshRoomState();},5000);
  subscription.addEventListener('state',event=>{
    if(feed!==subscription||!window.MiniopolyRoomSync.sameSeat(auth,requestAuth))return;
    try{applyRoomState(JSON.parse(event.data),{requestAuth});setConnectionStatus(true);}catch(error){console.error(error);void refreshRoomState(true);}
  });
  subscription.addEventListener('room-closed',event=>{
    if(feed!==subscription)return;
    try{resetClosedSeat(JSON.parse(event.data),requestAuth);}catch(error){console.error(error);}
  });
  subscription.addEventListener('host-stopping',event=>{
    if(feed!==subscription||!window.MiniopolyRoomSync.sameSeat(auth,requestAuth))return;
    try{const notice=JSON.parse(event.data);if(notice.code!==auth.code)return;stopRoomCatchup();setConnectionStatus(false,true);}catch(error){console.error(error);}
  });
  subscription.onerror=()=>{
    if(feed!==subscription||!window.MiniopolyRoomSync.sameSeat(auth,requestAuth))return;
    setConnectionStatus(false);void refreshRoomState(true);
  };
}

function ensureBoard(){
  if(!auth)return;
  const frame=el('boardFrame');
  if(!frame.getAttribute('src'))frame.src='/board-v5-42.html?v=0.3.89';
}
function sendBoardMode(){
  if(boardReady)el('boardFrame').contentWindow?.postMessage({type:'MINI_LAYOUT_MODE',focus:document.body.classList.contains('board-focus'),floatingTurnPanel:true},location.origin);
}

function sendHintsState(){
  if(boardReady)el('boardFrame').contentWindow?.postMessage({type:'MINI_HINTS_STATE',enabled:hintsEnabled},location.origin);
}
function updateHintsToggle(){
  const button=el('hintsToggleButton');
  if(!button)return;
  button.textContent='Hints';
  button.setAttribute('aria-pressed',String(hintsEnabled));
  button.title=hintsEnabled?'Helpful hover hints are enabled. Click to declutter further by turning them off.':'Helpful hover hints are off. Click to show rule tooltips on hover.';
}
function setHintsEnabled(active){
  hintsEnabled=Boolean(active);
  localStorage.setItem(HINTS_KEY,hintsEnabled?'on':'off');
  updateHintsToggle();
  sendHintsState();
  updatePlayerAdvisor();
  refreshControlIcons();
  fitMobileBoard();
}

function setBoardFocus(focus){
  document.body.classList.toggle('board-focus',Boolean(focus));
  const toggle=el('focusButton');
  toggle.setAttribute('aria-pressed',String(Boolean(focus)));
  toggle.setAttribute('aria-label',focus?'Exit full board view':'Enter full board view');
  toggle.textContent=focus?'↙ Exit Full Board':'⛶ Full Board View';
  layoutPhoneHeader();
  sendBoardMode();
  sendHintsState();
  updatePlayerAdvisor();
  refreshControlIcons();
  fitMobileBoard();
  floatingTurnPanel.constrain();
}

function syncChat(){
  if(!boardReady||!state)return;
  el('boardFrame').contentWindow?.postMessage({type:'MINI_CHAT_STATE',messages:state.chat||[],youId:state.youId,access:{code:auth?.code,token:auth?.token}},location.origin);
  if(pendingChatOpen){pendingChatOpen=false;el('boardFrame').contentWindow?.postMessage({type:'MINI_OPEN_CHAT'},location.origin);}
}
function openChat(){liveExperience.openChat();}

async function sendChatMessage(message){
  if(!auth||typeof message!=='string')return;
  try{await api('chat',{...auth,text:message});}
  catch(e){showError('Chat: '+e.message);el('boardFrame').contentWindow?.postMessage({type:'MINI_CHAT_ERROR',message:e.message},location.origin);}
}
function openWorlds(){
  if(!boardReady){showError('The board is still loading. Try View Worlds in a moment.');return;}
  el('boardFrame').contentWindow?.postMessage({type:'MINI_OPEN_WORLDS'},location.origin);
}
async function sendChatAttachment(payload){
  if(!auth||!payload)return;
  try{
    await api('attachment',{...auth,name:payload.name,data:payload.data});
    el('boardFrame').contentWindow?.postMessage({type:'MINI_CHAT_ATTACH_SUCCESS'},location.origin);
  }catch(e){showError('Attachment: '+e.message);el('boardFrame').contentWindow?.postMessage({type:'MINI_CHAT_ERROR',message:e.message},location.origin);}
}
function syncBoard({skipReplay=false,transitionWorld=false}={}){
  if(!boardReady||!state||state.stage==='lobby')return;
  el('boardFrame').contentWindow?.postMessage({type:'MINI_SYNC',state:presentedRoom(),skipReplay,transitionWorld},location.origin);
  sendBoardMode();
  sendHintsState();
  syncChat();
}
function avatarElement(player){
  const holder=document.createElement('span');holder.innerHTML=window.MiniopolyAvatars.html(player.avatar,player.seat,player.avatarImage);return holder.firstElementChild;
}
function makePlayerPortrait(player,isYou){
  const stack=document.createElement('div');stack.className='player-portrait-stack';
  const portrait=document.createElement('div');portrait.className='player-portrait';portrait.append(avatarElement(player));stack.append(portrait);
  if(isYou){const badge=makeTag('span','YOU');badge.className='player-portrait-you';stack.append(badge);}
  return stack;
}
function makePlayerRow(p,hostId,youId){
  const node=document.createElement('div');node.className='player-item'+(p.id===youId?' is-you':'');
  const details=document.createElement('div');details.className='player-details';
  const title=makeTag('b',p.name),sub=makeTag('small','Player '+(p.seat+1));
  if(p.id===hostId){const host=makeTag('span','HOST');host.className='player-host-badge';details.append(title,host,sub);}else details.append(title,sub);
  const status=makeTag('small',p.connected?'Online':'Reconnecting…');status.className='player-connection';details.append(status);
  node.append(makePlayerPortrait(p,p.id===youId),details,makePlayerPropertiesButton(p));return node;
}

function positionGameModeHelp(){
  const trigger=el('gameModeInfo'),hint=el('gameModeHint');if(!trigger.parentElement.classList.contains('is-open'))return;
  const box=trigger.getBoundingClientRect(),width=Math.min(280,innerWidth-24),desktop=document.body.classList.contains('quick-actions-layout');
  const left=desktop?Math.min(box.right+16,innerWidth-width-12):Math.max(12,Math.min(box.left,innerWidth-width-12));
  hint.style.left=left+'px';hint.style.top='12px';
  const height=hint.offsetHeight,below=desktop?box.top:box.bottom+9;
  hint.style.top=Math.max(12,Math.min(below,innerHeight-height-12))+'px';
}
function layoutPhoneHeader(){
  const menu=el('phoneGameMenu');menu.hidden=!auth;
  const desktop=Boolean(auth&&state&&state.stage!=='lobby'&&innerWidth>850&&!document.body.classList.contains('board-focus'));
  const rail=el('quickActionsButtons');el('desktopQuickActions').hidden=!desktop;
  document.body.classList.toggle('quick-actions-layout',desktop);
  const panelTop=Math.max(12,el('turnPanelHome').getBoundingClientRect().top);
  el('turnPanel').style.setProperty('--live-panel-room',Math.max(240,innerHeight-panelTop-12)+'px');
  if(floatingTurnPanel.visible&&!floatingTurnPanel.inline&&!floatingTurnPanel.drag)floatingTurnPanel.restore();
  const properties=el('focusPropertiesButton'),propertyHome=desktop?rail:document.querySelector('.session-head-actions');
  if(properties.parentElement!==propertyHome)propertyHome.insertBefore(properties,propertyHome.firstChild);
  for(const [id,home] of [['headerWorldsButton','worldsMenuHome'],['foreclosureButton','foreclosureMenuHome'],['cardReviewButton','cardsMenuHome'],['headerChatButton','chatMenuHome']]){
    const button=el(id),target=el(home);if(button.parentElement!==target)target.append(button);let proxy=rail.querySelector('[data-quick-action="'+id+'"]');if(!proxy){proxy=document.createElement('button');proxy.type='button';proxy.className=button.className;proxy.dataset.quickAction=id;proxy.dataset.icon=button.dataset.icon;proxy.onclick=()=>button.click();rail.append(proxy);}proxy.innerHTML=button.innerHTML;for(const node of proxy.querySelectorAll('[id]'))node.removeAttribute('id');proxy.hidden=button.hidden;proxy.disabled=button.disabled;proxy.title=button.title;
  }
  const modeStatus=el('expressStatus'),compactTools=el('compactGameTools'),modeHome=desktop?el('desktopQuickActions'):compactTools;
  if(modeStatus.parentElement!==modeHome)modeHome.insertBefore(modeStatus,modeHome.firstChild);
  const tradeHome=desktop?rail:compactTools;
  if(tradingCenter.button.parentElement!==tradeHome)tradeHome.append(tradingCenter.button);

  compactTools.hidden=desktop||!auth||!state;
  el('cardReviewLabel').textContent='Community & Chance cards';const cardsProxy=rail.querySelector('[data-quick-action="cardReviewButton"]');if(cardsProxy)cardsProxy.textContent='Cards';
  const seats=el('seatTools'),seatParent=auth?el('menuSeatTools'):el('welcomeView').parentElement;
  if(seats.parentElement!==seatParent){if(auth)seatParent.append(seats);else seatParent.insertBefore(seats,el('welcomeView'));}
  for(const [selector,target] of [['#inviteDetails','menuInvite'],['.quick-tools','menuQuickTools'],['#setbackButton','menuSetbackActions'],['#towButton','menuSetbackActions']]){
    const node=document.querySelector(selector);if(node.parentElement!==el(target))el(target).append(node);
  }
  const activityVisible=Boolean(auth&&state&&state.stage!=='lobby'),activity=el('activityDetails'),activityHome=activityVisible?el('matchActivityBody'):el('menuActivity');
  if(activity.parentElement!==activityHome)activityHome.append(activity);
  matchActivity.update(activityVisible);
  el('focusPropertiesButton').hidden=!auth;
  placePlayerAdvisor();
}
function renderGameMenu(){
  const me=presentedPlayers().find(p=>p.id===state.youId);
  const perks={building:'Building Permit · one free upgrade without completing its set. Use it from Turn Actions → Perks.',volunteer:'Volunteer Crew · $25 off your next house purchase.',helping:'Helping Hand · blocks up to $100 of your next bank penalty.',tow:'Tow Voucher · leave Setback before rolling.',escape:'Escape Setback · leave without paying.',swap:'Swap Favor · trading support is coming later.'};
  const perkSignature=JSON.stringify(me?.perks||[]);if(el('menuPerks').dataset.signature!==perkSignature){el('menuPerks').dataset.signature=perkSignature;const rows=[];for(const id of new Set(me?.perks||[])){const text=(perks[id]||id).split(' · '),detail=makeTag('details',''),summary=makeTag('summary',text[0]+((me.perks.filter(p=>p===id).length>1)?' ×'+me.perks.filter(p=>p===id).length:'')),body=makeTag('div',text.slice(1).join(' · '));detail.className='menu-disclosure';detail.append(summary,body);rows.push(detail);}el('menuPerks').replaceChildren(...(rows.length?rows:[makeTag('p','No saved perks yet. Earn them from Community cards.')]));}
  el('menuHostGroup').hidden=state.hostId!==state.youId||state.stage==='lobby';el('menuActivityButton').hidden=state.stage==='lobby';el('menuLobbyActivity').hidden=state.stage!=='lobby';el('menuTradingButton').hidden=state.stage!=='playing'||!!me?.out;el('gameOptionsButton').hidden=state.stage==='finished';
  el('menuMatchRule').textContent=state.gameMode==='countdown'?'Tsunami: '+state.rounds+' building rounds, then 1, 2, 3… properties threatened each wave. Upgrades provide flood protection once; losing your last property eliminates you. Submerged spaces collect no rent and are safe to land on.':state.gameMode==='express'?'Express · World Collapse: '+state.rounds+' building rounds, then up to 3 moving portals per world. Portals relocate after each full round; closed properties return to normal. Last player standing wins. '+(state.collapseRentBoost?'Rent increases 50% during collapse.':'Normal rent during collapse.'):state.rounds?'This match lasts '+state.rounds+' rounds. Highest net worth wins; the last player remaining wins earlier.':'This match continues until one player remains.';
  const available=Number(el('foreclosureBadge').textContent);
  el('foreclosureBadge').hidden=!available;
  el('menuWorldShiftRule').textContent=state.worldShift==='gravity'?'Gravity Pull brings eligible players to the roller’s exact world and destination. Only the roller resolves the landing; players held in Setback stay put, and pulled players receive no GO payment.':'Individual shifts move only the roller. Other players keep their world and square.';
  el('gameMenuNotification').hidden=!available;
  el('gameMenuNotification').setAttribute('aria-label',available+' foreclosure '+(available===1?'property':'properties')+' available');
  for(const proxy of el('quickActionsButtons').querySelectorAll('[data-quick-action]')){const original=el(proxy.dataset.quickAction);proxy.innerHTML=original.innerHTML;for(const node of proxy.querySelectorAll('[id]'))node.removeAttribute('id');proxy.hidden=original.hidden;proxy.disabled=original.disabled;if(proxy.dataset.quickAction==='cardReviewButton')proxy.textContent='Cards';}
}

function render(){
  if(!animating&&!diceSpinning&&!worldTransitionKey)financialHold=null;
  piecePicker?.setActive(currentTab,!auth);avatarPicker?.setEntryEnabled(!auth);avatarPicker?.setSubmitting(loading);
  if(typeof updateSeatTools==='function')updateSeatTools();
  updateHintsToggle();
  refreshControlIcons();
  el('welcomeView').hidden=Boolean(auth);
  el('gameView').hidden=!auth;
  document.body.classList.toggle('in-game',Boolean(auth));
  document.body.classList.toggle('live-turn-layout',Boolean(auth&&state&&state.stage!=='lobby'));
  el('desktopPlayerDock').hidden=!auth||!state||state.stage==='lobby';
  // Share a single compact header between room information and game controls.
  const sessionHead=el('gameSessionHead');
  if(sessionHead?.parentElement!==el('topbar')) el('topbar').insertBefore(sessionHead,el('topbar').querySelector('.top-right'));
  layoutPhoneHeader();
  evadeTokens.refresh(presentedRoom());tradingCenter.update(state,gameDeeds);developerTools.update(state);
  updatePlayerAdvisor();
  const expressStage=window.MiniopolyExpressView.stage(state),expressStatus=el('expressStatus');
  tsunami.update(state);pageOcean.update(state);
  document.body.classList.toggle('tsunami-high-water-game',state?.gameMode==='countdown'&&(state.collapse?.wave||0)>0);
  expressStatus.classList.toggle('is-tsunami',state?.gameMode==='countdown');
  expressStatus.hidden=!auth||!state;
  el('developerTestNotice').hidden=!state?.developerTest;
  if(state){
    expressStatus.classList.toggle('is-collapse',(expressStage?.wave||0)>0);
    el('gameModeName').textContent=state.gameMode==='countdown'?'Tsunami':state.gameMode==='express'?'World Collapse':'Standard';
    el('gameModeHint').textContent=expressStage?.hint||(state.rounds?'Standard: highest net worth after everyone completes round '+state.rounds+'. The last player remaining can win earlier.':'Standard: play until one player remains.');positionGameModeHelp();
    el('gameModeWarning').hidden=!expressStage?.warning;
    el('gameModeWarning').textContent=expressStage?.warning?expressStage.title:'';
  }
  if(!auth||!state){gameOptions.refresh();buildingPermitInfo.close();propertyOverview.close();playerSetDetails.close();updateFloatingPanel();liveExperience.update({state,auth,boardReady,animating,loading,rollPending,diceSpinning});matchLifecycle.reset();return;}
  el('forgetButton').textContent=state.youId===state.hostId?'Forget seat · Reset everyone':'Forget seat';
  el('forgetButton').title=state.youId===state.hostId?'Close this room and return every player to Create / Join':'Forget this browser’s saved seat only';
  el('lobbyPlayersPanel').hidden=state.stage!=='lobby';
  ensureBoard();
  el('roomCodeDisplay').textContent=state.code;
  el('inviteCode').textContent=state.code;
  el('inviteLink').value=invite();
  el('lanHelp').textContent=networkInfo?.remote?'Share this HTTPS invitation link and the game password privately. The host PC must stay awake with online hosting running.':getLanBase()===location.origin && location.hostname==='localhost'?'No LAN address detected yet. Use the network address shown in the host terminal.':'Share this link on the same Wi-Fi. The host must keep the server running.';
  el('playerCount').textContent=state.players.length+' / '+state.capacity;
  el('lobbyOptionsSummary').textContent=window.miniopolyOptionsSummary(state);
  el('sessionSubheading').textContent=state.stage==='lobby'?'PRIVATE GAME ROOM':state.stage==='playing'?'LIVE WI-FI GAME':'MATCH COMPLETE';
  el('matchStatus').textContent=state.stage==='lobby'?'Waiting for players':state.stage==='playing'?'In progress':'Match complete';
  el('showResultsButton').hidden=state.stage!=='finished';
  el('rankedRematchButton').hidden=!(!['express','countdown'].includes(state.gameMode)&&state.stage==='finished'&&state.hostId===state.youId&&[10,15,20].includes(state.rounds)&&(state.startingCash??1500)===1500);
  const slots=el('players');slots.replaceChildren();
  for(const p of presentedPlayers()) slots.append(makePlayerRow(p,state.hostId,state.youId));
  for(let i=state.players.length;i<state.capacity;i++){
    const seat=document.createElement('div');seat.className='player-item empty-seat';
    const c=document.createElement('span');c.className='player-color';c.textContent='+';
    const n=document.createElement('div');n.className='player-details';n.textContent='Open seat '+(i+1);
    seat.append(c,n);slots.append(seat);
  }
  const isHost=state.hostId===state.youId;
  el('hostControls').hidden=state.stage!=='lobby'||!isHost;
  el('startButton').disabled=loading||state.players.length<2;
  el('resetButton').hidden=!isHost||state.stage==='lobby';
  el('extendMatchButton').hidden=['express','countdown'].includes(state.gameMode)||!isHost||!state.rounds||state.stage==='lobby'||state.players.filter(p=>!p.out).length<=1;
  el('extendMatchButton').disabled=loading||animating;
  el('resetButton').disabled=loading||animating||state.players.length<2;
  el('hostHelp').textContent=state.players.length<2?'Waiting for at least 2 players.':'Ready: '+state.players.length+' joined player(s).';
  el('boardMode').textContent=state.stage==='lobby'?'Preview · waiting to start':state.stage==='finished'?'Match complete':'Live · Round '+state.round;
  const chat=state.chat||[];
  const lastChat=chat.length?chat[chat.length-1].id:null;
  const unread=lastChat&&!chatSelected&&lastChat!==chatReadId;
  const badge=el('chatBadge');badge.hidden=!unread;badge.textContent=unread?'●':'';
  const me=presentedPlayers().find(p=>p.id===state.youId);
  const active=state.players[state.turn];
  const myTurn=state.stage==='playing'&&active?.id===state.youId;
  el('turnText').textContent=animating?(diceSpinning?'The 12-sided die is spinning…':'Watch the piece move and the landing effect…'):state.phase==='bail'?(myTurn?'Escape roll complete — pay 20× its result or choose another exit.':`${active?.name||'Player'} is resolving a paid escape.`):state.phase==='purchase'?(myTurn?'Purchase decision: choose Buy or Pass.':`${active?.name||'Player'} is deciding whether to buy.`):state.stage==='lobby'?(isHost?'Start when you have at least two players.':'Waiting for the host to start…'):state.stage==='finished'?'🏆 Match complete — view the awards!':myTurn?(state.phase==='roll'?'Your turn — roll the die!':'Your roll is complete — end your turn.'):active?.name+"'s turn — watching together.";
  el('towButton').hidden=!(myTurn && ['roll','post'].includes(state.phase) && me?.penalty>0 && me?.perks?.includes('tow'));
  el('setbackButton').hidden=!(myTurn && me?.penalty>0 && ['roll','post'].includes(state.phase));
  el('foreclosureBadge').textContent=String((state.foreclosures||[]).filter(f=>(state.turnNumber||0)>=f.createdTurn+2 && (state.players.some(p=>p.seat!==f.previousOwner&&!p.out)||state.round>=f.round+3)).length);
  if(foreclosureOpen)renderForeclosureMarket();
  for(const id of ['towButton','setbackButton','focusPropertiesButton','myPropertiesButton','headerWorldsButton','foreclosureButton','cardReviewButton'])el(id).disabled=loading||animating;
  el('rollButton').disabled=loading||animating||!myTurn||state.phase!=='roll';
  el('endButton').disabled=loading||animating||!myTurn||state.phase!=='end';
  el('restoreBoardButton').disabled=loading;
  el('myCash').textContent=me?'$'+me.cash.toLocaleString('en-US'):'—';
  el('myDeedCount').textContent=String(Object.values(state.owned||{}).filter(o=>o.owner===me?.seat&&!o.lost).length);
  if(propertiesOpen)renderMyProperties();
  if(legendaryOpen)renderLegendary();
  syncAwardsState();
  if(rememberedPhase!==state.phase){modalTab=state.phase==='roll'&&myTurn&&me?.penalty>0?'setback':'main';rememberedPhase=state.phase;}
  renderLanding(myTurn,active);
  placePlayerAdvisor();
  const latest=state.lastRoll;
  el('rollResult').classList.toggle('dice-spinning',diceSpinning);
  el('rollResult').querySelector('b').textContent=diceSpinning?'…':latest?.value||'—';
  el('rollResult').querySelector('span').textContent=diceSpinning?'Spinning…':animating?'Piece moving…':latest?.shift?'World shift!':'Last roll';
  renderActivityHistory();
  renderGameMenu();
  renderFloatingPanel(myTurn,active);
  propertyOverview.refresh();
  buildingPermitInfo.refresh();
  gameOptions.refresh();
  liveExperience.update({state,auth,boardReady,animating,loading,rollPending,diceSpinning});
  matchLifecycle.update(state,{busy:animating||loading});
}
function renderActivityHistory(){
  const messages=presentedRoom()?.log||[],signature=JSON.stringify(messages);
  if(signature===activitySignature)return;activitySignature=signature;
  const history=el('activityLog'),top=history.getBoundingClientRect().top;
  const anchor=history.scrollTop>0?[...history.children].find(node=>node.getBoundingClientRect().bottom>top):null;
  const offset=anchor?anchor.getBoundingClientRect().top-top:0,anchorText=anchor?.textContent;
  history.replaceChildren(...messages.map(message=>{const line=makeTag('div',message);line.className='activity-line';return line;}));
  if(anchorText){const match=[...history.children].find(node=>node.textContent===anchorText);if(match)history.scrollTop+=match.getBoundingClientRect().top-history.getBoundingClientRect().top-offset;}
}
const money=n=>'$'+Number(n||0).toLocaleString('en-US');
function requestArt(id){
  if(!id||deedArt(id)||artRequested.has(id)||!boardReady)return;
  artRequested.add(id);
  el('boardFrame').contentWindow?.postMessage({type:'MINI_IMAGE_REQUEST',id},location.origin);
}
function modalButton(label,action,{style='secondary',disabled=false,hint=''}={}){
  const button=document.createElement('button');button.type='button';button.className=style;
  const icon=label.startsWith('🏠')?'house':/^[🏦💵💰]/u.test(label)?'bank':label.startsWith('🎲')?'dice':null;
  if(icon){button.dataset.icon=icon;button.classList.add('storybook-control');label=label.replace(/^[\s\p{Extended_Pictographic}\uFE0F]+/u,'');}
  button.textContent=label;button.disabled=disabled||loading;if(hint)button.title=hint;
  button.addEventListener('click',action);el('modalActions').append(button);
  if(hint&&!disabled){
    const wrap=document.createElement('span');wrap.className='action-hint';
    const trigger=document.createElement('button');trigger.type='button';trigger.className='action-hint-toggle';trigger.textContent='ⓘ';trigger.setAttribute('aria-label','Why a bonus roll?');trigger.setAttribute('aria-expanded','false');
    const help=document.createElement('span');help.className='action-hint-text';help.id='bonusRollHint';help.setAttribute('role','tooltip');help.textContent=hint;button.setAttribute('aria-describedby',help.id);
    trigger.onclick=()=>{const open=trigger.getAttribute('aria-expanded')!=='true';trigger.setAttribute('aria-expanded',String(open));wrap.classList.toggle('is-open',open);};
    wrap.append(trigger,help);button.addEventListener('focus',()=>wrap.classList.add('is-focused'));button.addEventListener('blur',()=>wrap.classList.remove('is-focused'));button.addEventListener('mouseenter',()=>wrap.classList.add('is-focused'));button.addEventListener('mouseleave',()=>wrap.classList.remove('is-focused'));el('modalActions').append(wrap);
  }return button;
}
function detailLine(label,value,parent=el('modalSummary')){
  const row=document.createElement('div');row.className='purchase-price-row';
  const left=document.createElement('span'),right=document.createElement('strong');
  left.textContent=label;right.textContent=value;row.append(left,right);parent.append(row);return row;
}
function renderLandingLocation(deed,landingId,active){
  const location=el('landingLocation');location.replaceChildren();
  const world=deed?.board??(state.lastRoll?.playerId===active?.id?state.lastRoll.board:active?.board);
  if(GAME_WORLDS[world])location.append(makeTag('span',GAME_WORLDS[world]));
  if(deed){const badge=makeTag('span',deed.type==='p'?deed.color+' set':deed.type==='rail'?'Railroad':'Utility');badge.className='landing-set-badge';
    if(deed.type==='p')badge.style.setProperty('--set-color',COLORS_FOR_SETS[deed.color]||'#7b9b78');location.append(badge);}
  else if(landingId)location.append(makeTag('span',state.pending?.source||'Special place'));
  location.hidden=!location.childElementCount;
}
function renderLandingUpgrades(deed){
  const panel=el('landingUpgrades');panel.hidden=deed?.type!=='p'||!!state.collapse?.lost?.[deed?.id];
  if(panel.hidden){landingUpgradeId='';landingUpgradeSignature='';panel.open=false;return;}
  const ownership=state.owned?.[deed.id],level=ownership?.level||0;
  const signature=JSON.stringify([deed.id,level,ownership?.mortgage,deed.base,deed.upgradeCost,state.upgradeCostMultiplier,state.collapse?.wave,state.collapseRentBoost,state.code,state.matchId,state.players.find(p=>p.seat===ownership?.owner)?.penalty]);
  if(signature===landingUpgradeSignature)return;
  if(deed.id!==landingUpgradeId)panel.open=false;
  landingUpgradeId=deed.id;landingUpgradeSignature=signature;
  el('landingLevelLabel').textContent=level===4?'Fully developed':'Development';
  el('landingLevelStars').replaceChildren(makeLevelStars(level,deed));
  const content=el('landingUpgradeDetails');content.replaceChildren();
  const table=makeTag('table',''),caption=makeTag('caption','Rent and paid upgrade cost'+(state.upgradeCostMultiplier===2?' · Tsunami 2×':'')+' at each level'),head=makeTag('thead',''),header=makeTag('tr','');
  for(const text of ['Development','Rent','Step cost']){const th=makeTag('th',text);th.scope='col';header.append(th);}head.append(header);
  const body=makeTag('tbody','');
  for(const [next,multiplier] of window.MiniopolyDevelopment.multipliers.entries()){const row=makeTag('tr',''),label=makeTag('th',window.MiniopolyDevelopment.name(next,deed)+(next===level?' · Current':''));label.scope='row';row.classList.toggle('is-current',next===level);row.append(label,makeTag('td',money(Math.ceil(deed.base*multiplier*(['express','countdown'].includes(state.gameMode)&&state.collapse?.wave>0&&state.collapseRentBoost?1.5:1)))),makeTag('td',next?money(deed.upgradeCost*(state.upgradeCostMultiplier||1)):'—'));body.append(row);}
  table.append(caption,head,body);content.append(table,makeTag('p','Normal upgrades require the full '+deed.color+' set. A Building Permit allows one free upgrade without the set. Maximum development: Estates.'));
  if(ownership?.mortgage)content.append(makeTag('p','This property is mortgaged; rent collection is paused.'));
  if(ownership&&state.players.find(p=>p.seat===ownership.owner)?.penalty>0)content.append(makeTag('p','The owner is in Setback; rent collection is paused until they leave.'));
}
function minimizeLanding(){
  if(!state||state.players[state.turn]?.id===state.youId||el('purchaseLayer').hidden)return;
  landingWatch.minimize();render();el('landingWaitingNotice').focus({preventScroll:true});
}
function restoreLanding(){landingWatch.restore();render();el('landingMinimize').focus({preventScroll:true});}
function renderFestival(result){
  const panel=el('festivalCelebration');panel.hidden=!result;
  el('purchaseLayer').querySelector('.purchase-dialog').classList.toggle('festival-dialog',Boolean(result));
  el('purchaseLayer').querySelector('.purchase-dialog').setAttribute('aria-labelledby',result?'festivalBanner':'purchaseHeading');
  if(!result)return;
  const signature=JSON.stringify([result.id,state.youId,state.players.map(p=>[p.id,p.name,p.avatar,p.avatarImage])]);
  if(signature===festivalRenderSignature)return;festivalRenderSignature=signature;panel.replaceChildren();
  const scene=makeTag('header','');scene.className='festival-scene';
  const title=makeTag('h3','Community Festival');title.id='festivalBanner';title.className='festival-ribbon';
  const total=makeTag('p',money(result.total)+' shared with players');total.className='festival-total';
  scene.append(title,makeTag('p',result.playerName+' brings everyone together!'),total);panel.append(scene);
  let seen=false;try{const key='miniopoly_festival_seen_'+state.code+'_'+result.id;seen=Boolean(sessionStorage.getItem(key));sessionStorage.setItem(key,'1');}catch{}
  panel.classList.toggle('is-celebrating',!gameOptions.reducedMotion&&!seen);
  if(!gameOptions.reducedMotion&&!seen)scene.append(window.MiniopolyFestivalCelebration.fireworks(document));
  const list=makeTag('div','');list.className='festival-payouts';
  for(const share of result.shares){
    const player=state.players.find(p=>p.id===share.playerId),row=makeTag('div','');row.className='festival-payout'+(share.visitor?' is-visitor':'')+(share.playerId===state.youId?' is-you':'');row.dataset.playerId=share.playerId;
    if(player)row.append(avatarElement(player));
    const copy=makeTag('div','');copy.append(makeTag('strong',share.name),makeTag('small',(share.visitor?'Festival visitor · 60%':'Shared 40%')+(share.playerId===state.youId?' · YOU':'')));
    const amount=makeTag('b','+'+money(share.amount));row.append(copy,amount);list.append(row);
  }
  panel.append(list,makeTag('p',result.total?'Payouts added. Festival fund reset to $0.':'The fund is empty. Town Tax and Storm Fund payments will refill it.'));

}
function renderLanding(myTurn,active){
  const me=window.MiniopolyLandingPresentation.viewer(state);
  const layer=el('purchaseLayer');
  const phase=state?.stage==='playing'?state.phase:null;
  const info=phase==='post'?state.post:state.pending;
  const setbackMenu=['roll','post'].includes(phase) && modalTab.startsWith('setback') && myTurn && me?.penalty>0;
  const show=(['purchase','post','card','rent','bail'].includes(phase)||setbackMenu)&&!animating;
  const minimized=landingWatch.sync(state,myTurn)&&show&&!myTurn;
  const justOpened=layer.hidden&&show&&!minimized;
  layer.hidden=!show||minimized;
  el('landingWaitingNotice').hidden=!minimized;
  el('landingMinimize').hidden=!show||myTurn;
  el('landingWaitingNotice').setAttribute('aria-expanded',String(!layer.hidden));
  if(!show){landingArtwork.clear();return;}
  const ownerIsMe=Boolean(me&&myTurn&&(phase==='post'||info?.playerId===me.id));
  const deck=phase==='card',rent=phase==='rent';
  renderFestival(info?.festival||null);
  const id=info?.id||null;
  const landingId=setbackMenu?null:id||((phase==='card'||phase==='bail'||(phase==='post'&&info?.kind==='event'))&&state.lastRoll?state.lastRoll.board+'-'+state.lastRoll.position:null);
  const storybookArt=window.MiniopolyVisuals.propertyArt(id);
  el('purchaseLayer').querySelector('.purchase-dialog').classList.toggle('storybook-card',Boolean(storybookArt));
  el('purchaseLayer').querySelector('.purchase-dialog').style.setProperty('--deed-color',COLORS_FOR_SETS[gameDeeds[id]?.color]||'#7b9b78');
  const title=setbackMenu?'SetBack Escape Options':phase==='bail'?'Paid Escape · '+money(info.amount):phase==='purchase'?info.name:phase==='post'?info?.title||'Turn Actions':deck?info?.title||'Card Drawn':rent?(info.ember?'Ember damage':info.creditor===null?'Bank Payment Due':'Rent Due'):'Landing';
  const kicker=setbackMenu?'SETBACK · SELECT YOUR EXIT':phase==='bail'?'SETBACK · 20 × YOUR LOCKED ROLL':phase==='purchase'?'AVAILABLE '+(info.type==='p'?'PROPERTY':info.type==='rail'?'RAILROAD':'UTILITY'):
    phase==='post'?(ownerIsMe?'YOUR TURN · ACTION CENTER':'WATCHING · TURN ACTIONS'):deck?(info.source||'CARD DRAWN').toUpperCase():rent?(info.ember?info.ember.label+' · DAMAGE FEE':'PAYMENT REQUIRED'):'LANDING';
  el('purchaseLabel').textContent=kicker;
  el('purchaseHeading').textContent=title;
  el('purchaseDescription').textContent=phase==='bail'?(info?.description||'Pay 20 times the locked roll to escape, or forfeit a deed.'):setbackMenu?'Roll 6 or 12 to leave free, choose a paid roll costing 20 × its result, forfeit an eligible deed, or use an escape card. After three failed free attempts, the settled roll costs 20 × its result. Escape rolls never shift worlds or earn bonuses. Rent collection stays paused until release.':!ownerIsMe?`${active?.name||'The active player'} is resolving this landing. Waiting for their decision…`:
    phase==='purchase'?'Buy this property or pass for now.':
    phase==='post'?(info?.message||'You can manage your holdings before ending your turn.'):
    deck?(info.description||'Drawn card'):
    `You owe ${money(info.amount)} to ${info.creditorName}. Choose Pay or raise cash before settling.`;
  const summary=el('modalSummary');summary.replaceChildren();
  const waiting=phase==='post'?' is taking turn actions…':deck?' is reviewing a card…':' is deciding…';
  const status=ownerIsMe?(phase==='purchase'?'Your decision':phase==='rent'||phase==='bail'?'Payment required':deck?'Card drawn':'Your turn'):(active?.name||'The active player')+waiting;
  if(el('landingStatus').textContent!==(info?.festival?'Celebrating together':status))el('landingStatus').textContent=info?.festival?'Celebrating together':status;
  el('landingStatus').classList.toggle('is-waiting',!ownerIsMe);
  const waitingText=(active?.name||'The active player')+waiting;
  if(el('landingWaitingText').textContent!==waitingText)el('landingWaitingText').textContent=waitingText;
  layer.querySelector('.purchase-dialog').setAttribute('aria-modal',String(ownerIsMe));
  if(!ownerIsMe)el('purchaseDescription').textContent=deck?(info?.description||''):phase==='bail'?(info?.description||''):'';
  if(info?.festival)el('purchaseDescription').textContent='';
  if(info?.kind==='evade')el('purchaseDescription').textContent=info.message;
  if(info?.ember)el('purchaseDescription').textContent=info.ember.message;
  renderLandingLocation(gameDeeds[landingId],landingId,active);
  renderLandingUpgrades(gameDeeds[id]);
  const details=el('modalDetails');details.replaceChildren();details.hidden=true;
  el('purchaseHint').textContent=info?.collapseBonus?'Final Showdown: normal rent '+money(info.baseRent)+' + '+money(info.collapseBonus)+' (50% increase).':'';
  el('modalActions').replaceChildren();
  const imageWrap=el('modalArtWrap'),fallback=el('modalArtFallback');
  imageWrap.hidden=Boolean(info?.festival)||!(landingId||phase==='card');
  imageWrap.classList.toggle('storybook-art',Boolean(storybookArt));
  imageWrap.classList.toggle('is-evade-art',info?.kind==='evade');
  imageWrap.classList.toggle('is-ember-art',!!info?.ember);
  if(info?.kind==='evade'){imageWrap.hidden=false;landingArtwork.show({key:state.code+':'+state.matchId+':'+state.lastRoll?.at+':evade',source:'/art/evade-token.svg',alt:'Evade token used to survive the void',motion:false});}
  else if(landingId){
    const property=gameDeeds[landingId]?.type==='p';
    fallback.textContent=property?'🏡':gameDeeds[landingId]?.type==='rail'?'🚂':gameDeeds[landingId]?.type==='util'?'⚡':info?.emoji||'🎴';
    requestArt(landingId);
    const reduced=gameOptions.reducedMotion;
    const source=property?deedArt(landingId):(!reduced&&specialArtCache.get(landingId))||artCache.get(landingId);
    landingArtwork.show({key:[state.code,state.matchId,state.turnNumber,active?.id,state.lastRoll?.at,landingId].join(':'),source,
      alt:(property?'Property: ':'Special place: ')+(gameDeeds[landingId]?.name||info?.source||info?.title||'Landing'),
      motion:!property&&!reduced&&Boolean(source)&&!source.startsWith('data:image/gif;')});
  }else{landingArtwork.clear();fallback.textContent=info?.emoji||'🎴';}
  if(phase==='bail'){
    detailLine('Locked escape roll',String(info.value));detailLine('20 × die result',money(info.amount));
    if(ownerIsMe){
      if(active.out){modalButton('Continue watching →',()=>runAction('end'),{style:'primary'});}
      else if(modalTab==='bail-assets'){details.hidden=false;renderAssetRows(details,me);modalButton('← Back to Escape Options',()=>{modalTab='main';render();});}
      else if(modalTab==='bail-forfeit'){details.hidden=false;renderForecloseRows(details,me);modalButton('← Back to Escape Options',()=>{modalTab='main';render();});}
      else{modalButton('💵 Pay & Escape '+money(info.amount),()=>runAction('pay-bail'),{style:'primary',disabled:me.cash<info.amount});
        modalButton('🏦 Sell Assets to Raise Cash',()=>{modalTab='bail-assets';render();});
        modalButton('🚧 Forfeit Property Instead',()=>{modalTab='bail-forfeit';render();});
        for(const perk of ['escape','tow'])if(me.perks?.includes(perk))modalButton('Use '+(perk==='escape'?'Escape Setback card':'Tow Voucher'),()=>runAction('use-perk',{perk}));
        if(me.cash<info.amount)modalButton('Declare Bankruptcy',()=>{if(confirm('Declare bankruptcy and leave this match?'))runAction('bankrupt');},{style:'danger'});}
    }
  } else if(setbackMenu){
    detailLine('Free attempts left',String(Math.max(0,3-(me.setbackAttempts||0))));
    if(modalTab==='setback-deeds'){details.hidden=false;renderForecloseRows(details,me);modalButton('← Back',()=>{modalTab='setback';render();});}
    else if(modalTab==='setback-sell'){details.hidden=false;renderAssetRows(details,me);modalButton('← Back',()=>{modalTab='setback';render();});}
    else {
      if(phase==='roll'){
        modalButton('🎲 Free Attempt · Roll 6 or 12',()=>{modalTab='main';runAction('roll');},{style:'primary'});
        modalButton('🎲 Paid Escape · Roll, Then Pay 20×',()=>{modalTab='main';runAction('bail-roll');});
      } else { el('purchaseHint').textContent='You can forfeit a deed or use an escape card now. Free and paid escape rolls become available at the start of your next turn.'; }
      modalButton('🏦 Forfeit Deed to Bank',()=>{modalTab='setback-deeds';render();});
      for(const perk of ['escape','tow'])if(me.perks?.includes(perk))modalButton(`🎫 Use ${perk==='escape'?'Escape SetBack Card':'Tow Voucher'}`,()=>{modalTab='main';runAction('use-perk',{perk});});
      modalButton('💵 Sell Assets for Escape',()=>{modalTab='setback-sell';render();});
      modalButton('Close · Decide Later',()=>{modalTab='main';render();});
    }
  } else if(phase==='purchase'){
    const costs=makeTag('div','');costs.className='landing-financial-grid';summary.append(costs);
    detailLine('Purchase price',money(info.price),costs);
    detailLine('Base rent',info.type==='rail'?'$25 / $50 / $100 / $200':info.type==='util'?'4× or 10× die':money(info.base),costs);
    if(info.discount)detailLine('Volunteer Crew discount',money(info.discount));
    if(ownerIsMe){
      el('purchaseHint').textContent=me.cash<info.price?'You do not have enough cash to buy this deed.':'';
      modalButton('🏠 Buy Property',()=>runAction('buy'),{style:'primary',disabled:me.cash<info.price});
      modalButton('Pass for Now',()=>runAction('pass'));
    }
  }else if(deck){
    if(!info.festival)detailLine('Card effect',info.amount>0?'+'+money(info.amount):info.amount<0?'-'+money(-info.amount):info.perk?'Perk saved':'Event');
    if(ownerIsMe)modalButton(info.amount<0?'Continue to Payment':'Continue to Turn Actions',()=>runAction('continue-card'),{style:'primary'});
  }else if(rent){
    detailLine(info.creditor===null?'Pay to':ownerIsMe?'You owe rent to':(active?.name||'The current player')+' owes rent to',info.creditorName);
    detailLine('Amount due',money(info.amount));
    if(window.MiniopolyFestival.taxName(state.obligation))detailLine('Festival fund contribution',money(info.amount));
    if(ownerIsMe){
      if(active.out){modalButton('Continue watching →',()=>runAction('end'),{style:'primary'});}
      else if(modalTab==='assets'){
        details.hidden=false;renderAssetRows(details,me);
        modalButton('← Back to Payment',()=>{modalTab='main';render();});
        modalButton('Pay '+money(info.amount),()=>runAction('pay'),{style:'primary',disabled:me.cash<info.amount});
        modalButton('Declare Bankruptcy',()=>{
          if(confirm('Declare bankruptcy? Remaining cash and deeds transfer to the creditor (or back to the bank). This cannot be undone.'))runAction('bankrupt');
        },{style:'danger'});
      }else{
        el('purchaseHint').textContent=me.cash<info.amount?`You need ${money(info.amount-me.cash)} more. Sell upgrades or deeds to the bank, or declare bankruptcy if you cannot pay.`:window.MiniopolyFestival.taxName(state.obligation)?'Pay to add this tax to the shared Festival fund.':'Payment transfers only when you press Pay.';
        modalButton('💵 Pay '+money(info.amount),()=>runAction('pay'),{style:'primary',disabled:me.cash<info.amount});
        modalButton('🤝 Negotiations · Coming Soon',()=>{}, {disabled:true,hint:'This future feature requires trade and creditor-approval rules.'});
        modalButton('🏦 Sell Upgrades / Property',()=>{modalTab='assets';render();});
        if(me.cash<info.amount)modalButton('Declare Bankruptcy',()=>{
          if(confirm('Declare bankruptcy? Your assets transfer to the creditor or bank and you leave the match.'))runAction('bankrupt');
        },{style:'danger'});
      }
    }
  }else if(phase==='post'){
    if(info?.kind==='evade')detailLine('Evade tokens remaining',String(info.remaining));
    if(info?.kind==='purchase')detailLine('Price paid',money(info.price));
    if(info?.kind==='purchase'||info?.kind==='pass'||info?.kind==='owned')detailLine('Property',info.name||'—');
    if(ownerIsMe){
      if(active.out){modalButton('Continue watching →',()=>runAction('end'),{style:'primary'});}
      else if(modalTab==='upgrades'){
        details.hidden=false;renderUpgradeRows(details,me);
        modalButton('← Back to Turn Actions',()=>{modalTab='main';render();});
      }else if(modalTab==='perks'){
        details.hidden=false;renderPerkRows(details,me);
        modalButton('← Back to Turn Actions',()=>{modalTab='main';render();});
      }else if(modalTab==='trading'){
        details.hidden=false;details.textContent='Offer properties and cash, accept or counter offers in the Trading Center.';modalButton('Open Trading Center',()=>tradingCenter.open());
        modalButton('← Back to Turn Actions',()=>{modalTab='main';render();});
      }else{
        modalButton('🤝 Trading Center',()=>tradingCenter.open());
        modalButton('🏘️ Develop property',()=>{modalTab='upgrades';render();});
        modalButton('✨ Perks',()=>{modalTab='perks';render();});
        modalButton(state.extraRoll?'Bonus Roll →':'End Turn →',()=>runAction(state.extraRoll?'bonus-roll':'end',state.extraRoll?{rollAt:state.lastRoll.at}:{}),{style:'primary',hint:state.extraRoll?'Earned an extra roll by rolling 7 or 11. Click to roll immediately.':''});
      }
    }
  }
  // The landing belongs to the active player on every screen. Keep that
  // player's name and cash together; the viewer's balance stays in standings.
  el('landingBalance').replaceChildren();
  const cashRow=detailLine((active?.name||'Current player')+'’s cash',active&&Number.isFinite(active.cash)?money(active.cash):'—',el('landingBalance'));
  cashRow.classList.add('landing-player-cash');
  cashRow.dataset.playerId=active?.id||'';
  cashRow.dataset.roomRevision=String(state.revision??'');
  if(active?.evade?.enabled){const protection=makeTag('div','');protection.className='evade-landing-status';const badge=window.MiniopolyEvadeTokens.badge(active),copy=makeTag('small',active.out?'Unused tokens cannot save a repeat landing in the same round.':active.evade.locked?'Protection locked for this collapse':active.evade.points+' construction points · Tokens activate at collapse');protection.append(badge,copy);el('landingBalance').append(protection);}
  if(justOpened && ownerIsMe && !liveExperience.chatOpen)requestAnimationFrame(()=>el('modalActions').querySelector('button:not(:disabled)')?.focus());
}
function renderForecloseRows(wrapper,me){
 const deeds=Object.entries(state.owned).filter(([,o])=>state.players[o.owner]?.id===state.youId && !o.lost && !o.mortgage && !o.level);
 if(!deeds.length){wrapper.textContent='No eligible undeveloped, unmortgaged properties to forfeit. You can still attempt a free roll, choose a paid escape or use an Escape SetBack card.';return;}
 for(const [id] of deeds){
  const deed=gameDeeds[id];if(!deed)continue;
  const row=document.createElement('div');row.className='modal-asset-row';
  const label=document.createElement('span');label.textContent=`${deed.name} · Foreclosure price ${money(Math.ceil(deed.price/2))}`;
  const button=document.createElement('button');button.className='secondary';button.textContent='Forfeit · Escape';
  button.onclick=()=>{if(confirm(`Forfeit ${deed.name} to the Bank? You receive $0, leave SetBack, and the deed enters foreclosure.`)){modalTab='main';runAction('foreclose',{id});}};
  row.append(label,button);wrapper.append(row);
 }
}
function renderForeclosureMarket(){
 const list=el('foreclosureRows');list.replaceChildren();
 const deeds=state?.foreclosures||[];
 if(!deeds.length){const p=document.createElement('p');p.textContent='No properties are currently foreclosed.';list.append(p);return;}
 const me=state?.players.find(p=>p.id===state.youId),myTurn=state?.stage==='playing'&&state.players[state.turn]?.id===state.youId;
 for(const f of deeds){
  const available=(state.turnNumber||0)>=f.createdTurn+2 && (f.previousOwner!==me?.seat || state.round>=f.round+3);
  const row=document.createElement('div');row.className='foreclosure-item';
  const info=document.createElement('span');
  const when=(state.turnNumber||0)<f.createdTurn+2?'Bank holding until one full other-player turn finishes':f.previousOwner===me?.seat && state.round<f.round+3?`Your repurchase opens round ${f.round+3}`:'Available at half price';
  info.textContent=`${f.name} · ${money(f.price)} · Former owner: ${f.originalName} · ${when}`;
  const button=document.createElement('button');button.textContent='Buy';button.disabled=animating||!available||!myTurn||!['roll','post'].includes(state.phase)||me.cash<f.price||loading;
  button.onclick=()=>runAction('buy-foreclosure',{id:f.deedId});row.append(info,button);list.append(row);
 }
}
function renderAssetRows(wrapper,me){
  const deeds=Object.entries(state.owned).filter(([,owner])=>!owner.lost&&state.players[owner.owner]?.id===state.youId);
  if(!deeds.length){wrapper.textContent='You have no properties or upgrades to sell. You may need to declare bankruptcy.';return;}
  for(const [id,own] of deeds){
    const d=gameDeeds[id];if(!d)continue;
    const item=document.createElement('div');item.className='modal-asset-row';
    const label=document.createElement('span');label.textContent=d.name+' · '+window.MiniopolyDevelopment.name(own.level,d);
    item.append(label);
    if(own.level>0){
      const b=document.createElement('button');b.className='secondary';b.textContent=(own.level===4?'Estate → 3 '+window.MiniopolyDevelopment.type(d)+'s':'Remove 1 '+window.MiniopolyDevelopment.type(d))+' · Refund '+money(window.MiniopolyDevelopment.saleSteps(own)*Math.floor(d.upgradeCost/2));b.disabled=loading;
      b.onclick=()=>runAction('sell-upgrade',{id});item.append(b);
    }else if(!own.mortgage){
      const b=document.createElement('button');b.className='secondary';b.textContent='Sell deed +'+money(Math.floor(d.price/2));b.disabled=loading;
      b.onclick=()=>runAction('sell-deed',{id});item.append(b);
    }else{const b=document.createElement('small');b.textContent='Mortgaged';item.append(b);}
    wrapper.append(item);
  }
  const small=document.createElement('p');small.textContent='Bank buyback: 50% of deed price or upgrade cost. Sell upgrades before the deed. This is separate from foreclosure; sold deeds cannot be bought back through foreclosure.';wrapper.append(small);
}
function renderUpgradeRows(wrapper,me){
  const guide=document.createElement('div');guide.className='property-development-guide';for(let i=0;i<=window.MiniopolyDevelopment.MAX;i++){if(i)guide.append(makeTag('span','→'));guide.append(window.MiniopolyDevelopment.badge(i));}wrapper.append(guide,makeTag('p','Three green Houses or yellow Chalets become one red Estate. The Communities uses Chalets; the other worlds use Houses.'));
  if(state.upgradeCostMultiplier===2)wrapper.append(makeTag('p','Tsunami construction: paid upgrades cost 2× the standard price. Building Permits remain free.'));
  const owned=Object.entries(state.owned).filter(([,o])=>!o.lost&&state.players[o.owner]?.id===state.youId);
  let eligible=0;
  for(const [id,o] of owned){
    const d=gameDeeds[id];if(!d||d.type!=='p'||o.mortgage||o.level>=window.MiniopolyDevelopment.MAX)continue;
    const set=Object.values(gameDeeds).filter(x=>x.type==='p'&&x.color===d.color);
    if(!set.every(x=>state.owned[x.id]?.owner===o.owner&&!state.owned[x.id]?.mortgage&&!state.owned[x.id]?.lost))continue;
    eligible++;
    const row=document.createElement('div');row.className='modal-asset-row';
    const label=document.createElement('span');label.textContent=`${d.name} · ${window.MiniopolyDevelopment.name(o.level,d)} → ${window.MiniopolyDevelopment.name(o.level+1,d)}`;
    const b=document.createElement('button');b.className='secondary';const cost=d.upgradeCost*(state.upgradeCostMultiplier||1);b.textContent=(o.level===3?'Replace 3 '+window.MiniopolyDevelopment.type(d)+'s with Estate':'Build '+window.MiniopolyDevelopment.type(d)+' '+(o.level+1)+'/3')+' · '+money(cost);b.disabled=me.cash<cost||loading||state.phase!=='post';
    b.onclick=()=>runAction('upgrade',{id});row.append(label,b);wrapper.append(row);
  }
  if(!eligible)wrapper.append(makeTag('p','No paid upgrades are available. Own every property in an unmortgaged color group across all worlds for a paid upgrade (maximum Estates).'));
  if(me.perks?.includes('building')){
    const permit=document.createElement('section');permit.className='building-permit-options';
    permit.append(makeTag('h3','Use your Building Permit'),makeTag('p','One free upgrade. You do not need the complete set. Choose a property below.'));
    renderBuildingPermitRows(permit,me);wrapper.append(permit);
  }
}
function renderBuildingPermitRows(wrapper,me){
  const options=()=>window.MiniopolyBuildingPermit.candidates(Object.values(gameDeeds),presentedRoom(),me.seat,buildingPermitSort);
  if(!options().length){wrapper.append(makeTag('p','Keep this card: you need an owned, unmortgaged house below Estates. Railroads and utilities cannot be upgraded.'));return;}
  const tools=document.createElement('div');tools.className='permit-compare-tools';tools.append(makeTag('p','Click a property name for upgrade details.'));
  const label=makeTag('label','Sort by'),sort=document.createElement('select');sort.dataset.permitSort='';
  for(const [value,text] of [['price','Highest deed price'],['rent','Largest rent increase']]){const option=makeTag('option',text);option.value=value;sort.append(option);}sort.value=buildingPermitSort;label.append(sort);tools.append(label);
  const list=document.createElement('div');list.className='permit-property-list';wrapper.append(tools,list);
  const renderOptions=()=>{
    list.replaceChildren();
    for(const info of options()){
      const id=info.id,row=document.createElement('div');row.className='modal-asset-row permit-property-row';
      const copy=document.createElement('div');copy.className='permit-property-copy';
      const name=makeTag('button',info.name);name.type='button';name.className='permit-property-name';name.dataset.permitInfo=id;name.setAttribute('aria-controls','buildingPermitDetails');name.setAttribute('aria-haspopup','dialog');
      copy.append(name,makeTag('small',GAME_WORLDS[info.board]+' · Deed '+money(info.price)+' · '+window.MiniopolyDevelopment.name(info.level,info)+' → '+window.MiniopolyDevelopment.name(info.nextLevel,info)));
      const rent=makeTag('small','Rent '+money(info.rent)+' → '+money(info.nextRent)+' (+'+money(info.rentGain)+')');rent.className='permit-rent-change';copy.append(rent);
      const use=makeTag('button','Use Building Permit · Free');use.type='button';use.className='secondary';use.dataset.permitDeed=id;
      use.disabled=loading;use.onclick=()=>runAction('use-perk',{perk:'building',id});row.append(copy,use);list.append(row);
    }
  };
  sort.onchange=()=>{buildingPermitSort=sort.value;renderOptions();};renderOptions();
}
function renderPerkRows(wrapper,me){
  const perks=me.perks||[];
  if(!perks.length){wrapper.textContent='No saved Community Perks. Draw Community Bonus cards to earn them.';return;}
  const descriptions={building:'One free upgrade without a complete color set (maximum Estates; unmortgaged only)',escape:'Leave Setback without a payment',volunteer:'$25 off your next unowned house purchase (automatic)',helping:'Block up to $100 of a bank fee (automatic)',tow:'Escape Setback before rolling',swap:'Future feature: consensual position swap (not active)'};
  for(const perk of perks){
    const row=document.createElement('div');row.className='modal-asset-row';
    const label=document.createElement('span');label.textContent=({building:'Building Permit',escape:'Escape Setback',volunteer:'Volunteer Crew',helping:'Helping Hand',tow:'Tow Voucher',swap:'Swap Favor'}[perk]||perk)+' — '+(descriptions[perk]||'');
    row.append(label);wrapper.append(row);
    if(perk==='building')renderBuildingPermitRows(wrapper,me);
  }
}
async function runAction(kind,extra={}){
  if(loading||animating||!auth||['lost','stopped'].includes(sessionNotice.kind))return;
  rollPending=['roll','bail-roll','bonus-roll'].includes(kind);
  const requestAuth={...auth};
  try{setLoading(true);const data=await api('action',{...requestAuth,kind,...extra});applyRoomState(data.state,{requestAuth});}
  catch(e){if(window.MiniopolyRoomSync.sameSeat(auth,requestAuth))showError(e.message);}finally{rollPending=false;setLoading(false);}
}
async function joinOrCreate(kind,body){
  if(loading)return;
  try{setLoading(true);const data=await api(kind,body);saveAuth(data);}
  catch(e){showError(e.message);if(kind==='join'&&e.status===409)piecePicker.recheck();}finally{setLoading(false);}
}
let gameDeeds={};
const COLORS_FOR_SETS={Brown:'#987047',Blue:'#4c9ccb',Pink:'#d47b9c',Orange:'#e68e40',Red:'#d85c55',Yellow:'#e5c55a',Green:'#44a981',Navy:'#3d5e9b'};
const GAME_WORLDS=['Richmond Hill','The Communities','Coastal Georgia'];
const playerSetDetails=new window.MiniopolyPlayerSetDetails(target=>{
  const room=presentedRoom();if(!room||target.room!==room.code+':'+(room.matchId||'lobby'))return null;
  const player=room.players.find(p=>p.seat===target.seat),group=target.color==='Other deeds'?window.MiniopolyPlayerSets.otherDeeds(Object.values(gameDeeds),room,target.seat):propertyGroups(room,target.seat).find(g=>g.color===target.color);
  return player&&group?{player:{name:player.name},group}:null;
},GAME_WORLDS);
const propertyOverview=new window.MiniopolyPropertyOverview({getData:presentedRoom,renderPlayer:renderOverviewPlayer,renderUpgrades:renderUpgradedProperties,onDetailsRefresh:()=>playerSetDetails.refresh(),onClose:()=>playerSetDetails.close(),onDetailed:()=>openMyProperties()});
const buildingPermitInfo=new window.MiniopolyBuildingPermit.Info({getData:presentedRoom,getDeeds:()=>Object.values(gameDeeds),getArt:deedArt,worlds:GAME_WORLDS});
const gameOptions=new window.MiniopolyGameOptions({getData:()=>state,onSave:async (options,{signal}={})=>{
  const requestAuth={...auth};
  try{const result=await api('action',{...requestAuth,kind:'set-options',options},{signal});if(!signal?.aborted)applyRoomState(result.state,{requestAuth});}
  finally{if(signal?.aborted&&window.MiniopolyRoomSync.sameSeat(auth,requestAuth))wakeRoomConnection();}
},onPreferences:preferences=>applyPlayerPreferences(preferences)});
const tsunami=new window.MiniopolyTsunami.Surge({getPreferences:()=>gameOptions.personal,getReducedMotion:()=>gameOptions.reducedMotion,onComplete:()=>syncAwardsState()});
const gameMenu=new window.MiniopolyGameMenu(el('phoneGameMenu'),{onVolume:volume=>gameOptions.updatePersonal({volume}),onMotion:motion=>gameOptions.updatePersonal({motion})});
function sendPlayerPreferences(){if(boardReady)el('boardFrame').contentWindow?.postMessage({type:'MINI_PLAYER_PREFERENCES',preferences:{...gameOptions.personal,volume:gameOptions.personal.volume/100,motion:gameOptions.reducedMotion?'reduce':'system'}},location.origin);}
function applyPlayerPreferences(preferences){tsunami.syncPreferences();pageOcean.sync();tradingCenter.alerts.syncPreferences();soundForAwards=preferences.sound;if((gameOptions.reducedMotion||!preferences.sound||preferences.volume===0)&&championship.layer.classList.contains('ceremony-intro'))championship.finishIntro();championship.refreshPreferences();document.documentElement.classList.toggle('mini-reduced-motion',preferences.motion==='reduce'||matchMedia('(prefers-reduced-motion: reduce)').matches);el('wifiSoundButton').textContent='Sound';el('wifiSoundButton').setAttribute('aria-pressed',String(preferences.sound));gameMenu.preferences(preferences);sendPlayerPreferences();}
applyPlayerPreferences(gameOptions.personal);

function makeTag(kind,text){const node=document.createElement(kind);node.textContent=text;return node;}
function makeLevelStars(level,deed){return window.MiniopolyDevelopment.badge(level,deed);}
function placePlayerAdvisor(){
  const modal=!el('purchaseLayer').hidden;
  const desktop=innerWidth>850&&state?.stage!=='lobby'&&!document.body.classList.contains('board-focus');
  const home=modal?el('purchaseLayer').querySelector('.purchase-dialog'):desktop?el('desktopPlayerDock'):el('compactGameTools');
  if(modal){const after=el('purchaseDescription');if(after.nextElementSibling!==playerAdvisor.element)after.after(playerAdvisor.element);}
  else if(playerAdvisor.element.parentElement!==home)home.prepend(playerAdvisor.element);
}
function updatePlayerAdvisor(){playerAdvisor.update(presentedRoom(),gameDeeds,{enabled:hintsEnabled,busy:loading||animating||diceSpinning||!!worldTransitionKey});}
function handleAdvisorAction(action){
  if(!auth||!state||loading||animating||diceSpinning)return;
  if(action==='properties')openMyProperties();
  else if(action==='trade')tradingCenter.open();
  else if(action==='results')showAwards();
  else if(action==='landing'){restoreLanding();el('purchaseLayer').querySelector('button:not([hidden])')?.focus();}
  else if(action==='develop'){
    if(state.players[state.turn]?.id!==state.youId||state.phase!=='post'){showError('Developments are available after resolving your landing on your turn.');return;}
    modalTab='upgrades';render();el('modalDetails')?.querySelector('button:not(:disabled)')?.focus();
  }
}

function renderMyProperties(){
  if(!state||!auth)return;
  el('propertyPortfolioFrame').contentWindow?.postMessage({type:'MINI_PORTFOLIO_STATE',state:presentedRoom(),deeds:Object.values(gameDeeds)},location.origin);
}
let portfolioReturnFocus=null;
function openMyProperties(){if(!state)return;portfolioReturnFocus=propertyOverview.visible?propertyOverview.returnFocus:document.activeElement;propertyOverview.close();playerSetDetails.close();propertiesOpen=true;el('propertiesLayer').hidden=false;renderMyProperties();el('propertiesClose').focus();}
function closeMyProperties(){propertiesOpen=false;el('propertiesLayer').hidden=true;el('propertiesClose').hidden=false;el('propertyPortfolioFrame').contentWindow?.postMessage({type:'MINI_PORTFOLIO_HIDE'},location.origin);(portfolioReturnFocus?.getClientRects().length?portfolioReturnFocus:el('phoneGameMenu').querySelector(':scope > summary'))?.focus({preventScroll:true});}
function renderLegendary(){
  const records=(legendaryMode==='gravity'?state?.legendaryGravity:state?.legendary)?.[legendaryRounds]||[];
  el('legendaryMode').value=legendaryMode;
  el('legendaryCategory').textContent=(legendaryMode==='gravity'?'Gravity Pull':'Individual')+' · '+legendaryRounds+' rounds · Top three performances on this host';
  el('legendaryLayer').querySelectorAll('[data-legendary-rounds]').forEach(btn=>{
    const selected=Number(btn.dataset.legendaryRounds)===legendaryRounds;btn.classList.toggle('active',selected);btn.setAttribute('aria-selected',String(selected));
  });
  const entries=el('legendaryEntries');entries.replaceChildren();
  const labels=['👑 ALL-TIME LEGEND','🥈 LEGENDARY ELITE','🥉 LEGENDARY CONTENDER'];
  for(let i=0;i<3;i++){
    const row=document.createElement('div');row.className='legendary-entry place-'+(i+1);
    const entry=records[i];
    const header=makeTag('small',labels[i]);const name=makeTag('strong',entry?.name||'Awaiting a champion');
    const score=makeTag('b',entry?'$'+entry.worth.toLocaleString('en-US'):'—');
    const info=makeTag('small',entry?new Date(entry.at).toLocaleDateString()+' · '+entry.playerCount+' players':'Finish a ranked '+legendaryRounds+'-round match to set this record.');
    row.append(header,name,score,info);entries.append(row);
  }
}
function openLegendary(){if(!state)return;legendaryMode=state.worldShift==='gravity'?'gravity':'individual';if([10,15,20].includes(state.rounds))legendaryRounds=state.rounds;legendaryOpen=true;el('legendaryLayer').hidden=false;renderLegendary();}
function closeLegendary(){legendaryOpen=false;el('legendaryLayer').hidden=true;}
function playVictoryTone(){
  if(!soundForAwards||gameOptions.personal.volume===0||gameOptions.reducedMotion)return;
  return window.MiniopolyChampionship.fanfare(gameOptions.personal.volume);
}
function makeCelebration(){championship.celebrate();}
function renderAwards(){championship.render(state);}
function hideAwards(){awardsHidden=true;championship.hide();el('awardsLayer').hidden=true;}
function showAwards(celebrate=false){if(state?.stage!=='finished'||!state.finalResults)return;awardsHidden=false;el('phoneGameMenu').open=false;renderAwards();el('awardsLayer').hidden=false;if(celebrate)makeCelebration();else championship.finishIntro();}
function syncAwardsState(){
  if(state?.stage==='finished'&&tsunami.timer!==null)return;
  if(state?.stage==='finished'&&state.finalResults&&!animating){
    if(awardsSeenMatchId!==state.finalResults.matchId){awardsSeenMatchId=state.finalResults.matchId;showAwards(true);}
    else if(!awardsHidden)renderAwards();
  }else{awardsSeenMatchId=null;awardsHidden=false;championship.reset();el('awardsLayer').hidden=true;}
}
function leaveRoom(completed=false){
  if(completed&&state?.stage!=='finished')return;
  const departingAuth=auth&&{...auth};sessionNotice.clear();championship.reset();
  if(completed&&auth)window.MiniopolySeats.forget(localStorage,auth.code);
  landingArtwork.clear();landingWatch.sync(null,false);el('landingWaitingNotice').hidden=true;landingUpgradeSignature='';landingUpgradeId='';festivalRenderSignature='';
  buildingPermitInfo.close();gameOptions.reset();
  propertyOverview.close();playerSetDetails.close();
  if(feed)feed.close();feed=null;stopRoomCatchup();
  auth=null;state=null;evadeTokens.refresh(null);tradingCenter.update(null);propertiesOpen=false;legendaryOpen=false;awardsHidden=false;awardsSeenMatchId=null;
  for(const id of ['purchaseLayer','propertiesLayer','foreclosureLayer','legendaryLayer','awardsLayer','cardReviewLayer'])el(id).hidden=true;
  foreclosureOpen=false;chatSelected=false;chatReadId=null;boardReady=false;boardModalOpen=false;boardView=null;
  worldTransitionKey='';financialHold=null;activitySignature='';panelPlayersSignature='';
  artRequested.clear();artCache.clear();specialArtCache.clear();animating=false;diceSpinning=false;rollPending=false;loading=false;
  clearTimeout(animationSafetyTimer);
  try{const stored=JSON.parse(localStorage.getItem(STORE_KEY)||'null');if(!stored||window.MiniopolyRoomSync.sameSeat(stored,departingAuth))localStorage.removeItem(STORE_KEY);}catch{localStorage.removeItem(STORE_KEY);}
  liveExperience.resetRoom();matchLifecycle.reset();avatarPicker.resetConfirmation();
  el('propertyPortfolioFrame').contentWindow?.postMessage({type:'MINI_PORTFOLIO_HIDE'},location.origin);el('propertiesClose').hidden=false;
  el('panelPlayers').replaceChildren();el('activityLog').replaceChildren();
  el('boardFrame').removeAttribute('src');
  el('phoneGameMenu').open=false;setBoardFocus(false);switchTab('create');
  el('networkPill').textContent='Ready to play';el('networkPill').title='Create or join a game';el('networkPill').setAttribute('aria-label','Ready to create or join a game');el('networkPill').dataset.connected='false';
  if(completed)history.replaceState(null,'',location.pathname);
  render();
}
function rememberCreateSettings(){
  try{localStorage.setItem('miniopoly_match_defaults_v1',JSON.stringify({hostName:el('createName').value,capacity:Number(el('capacity').value),gameMode:el('gameMode').value,collapseRentBoost:el('collapseRentBoost').checked,rounds:Number(el('rounds').value),startingCash:Number(el('startingCash').value),worldShift:el('worldShift').value,ranked:el('rankedMatch').checked}));}catch{}
}
function restoreCreateSettings(){
  try{
    const params=new URLSearchParams(location.search),incoming=params.get('hostSetup');
    const settings=JSON.parse(incoming||localStorage.getItem('miniopoly_match_defaults_v1')||'null');
    if(!settings||typeof settings!=='object')return;
    if(typeof settings.hostName==='string')el('createName').value=settings.hostName.trim().slice(0,18);
    if(['classic','express','countdown'].includes(settings.gameMode))el('gameMode').value=settings.gameMode;
    el('collapseRentBoost').checked=!!settings.collapseRentBoost;
    if([2,3,4].includes(Number(settings.capacity)))el('capacity').value=String(settings.capacity);
    if([0,10,12,15,20,30,50].includes(Number(settings.rounds)))el('rounds').value=String(settings.rounds);
    if([1000,1500,2000].includes(Number(settings.startingCash)))el('startingCash').value=String(settings.startingCash);
    if(['individual','gravity'].includes(settings.worldShift))el('worldShift').value=settings.worldShift;
    el('rankedMatch').checked=!!settings.ranked&&[10,15,20].includes(Number(el('rounds').value));
    rememberCreateSettings();
    if(incoming){params.delete('hostSetup');history.replaceState(null,'',location.pathname+(params.size?'?'+params:'')+location.hash);}
  }catch{}
}
let avatarPicker,piecePicker,entryOptions;
function selectedAvatar(){return avatarPicker.selection().avatar;}
function selectedAvatarImage(){return avatarPicker.selection().avatarImage;}
function setupAvatarPickers(){piecePicker=new window.MiniopolyPiecePicker({onChange:form=>avatarPicker?.resetConfirmation(form)});avatarPicker=new window.MiniopolyAvatarPicker(piecePicker);}
async function start(){
  try{const u=new URL(new URLSearchParams(location.search).get('setupConsole'));if(u.protocol==='http:'&&u.hostname==='127.0.0.1'&&u.port&&!u.username&&!u.password&&u.pathname==='/'&&!u.search&&!u.hash)localStorage.setItem('miniopoly_setup_console_v1',u.origin);}catch{}
  setupAvatarPickers();
  el('createTab').onclick=()=>switchTab('create');
  el('joinTab').onclick=()=>switchTab('join');
  el('createForm').onsubmit=e=>{e.preventDefault();if(!avatarPicker.requireConfirmation('create'))return;rememberCreateSettings();joinOrCreate('create',{name:el('createName').value,roomName:el('createRoomName').value,avatar:selectedAvatar(),avatarImage:selectedAvatarImage(),piece:piecePicker.selection('create'),capacity:Number(el('capacity').value),gameMode:el('gameMode').value,collapseRentBoost:el('collapseRentBoost').checked,rounds:Number(el('rounds').value),startingCash:Number(el('startingCash').value),worldShift:el('worldShift').value,ranked:el('rankedMatch').checked});};
  el('joinForm').onsubmit=e=>{e.preventDefault();if(!avatarPicker.requireConfirmation('join'))return;joinOrCreate('join',{code:el('joinCode').value,name:el('joinName').value,avatar:selectedAvatar(),avatarImage:selectedAvatarImage(),piece:piecePicker.selection('join')});};
  function updateMatchOptions(){entryOptions?.sync();const express=['express','countdown'].includes(el('gameMode').value),countdown=el('gameMode').value==='countdown';el('expressSetupHelp').hidden=!express;el('expressSetupHelp').textContent=countdown?'Tsunami: build your portfolio, brace for the waves and keep your last property above water.':'World Collapse uses fatal void landings.';el('collapseRentOption').hidden=!express||countdown;el('matchLengthLabel').textContent=countdown?'Building rounds before tsunami':express?'Building rounds before collapse':'Match length';el('entryOptionsSummary').textContent=el('capacity').value+' players · '+(countdown?'Tsunami':express?'World Collapse':'Standard')+' · '+(Number(el('rounds').value)?el('rounds').value+' rounds':'Unlimited')+' · '+(el('worldShift').value==='gravity'?'Gravity Pull':'Individual shifts')+' · $'+Number(el('startingCash').value).toLocaleString('en-US');const eligible=el('gameMode').value==='classic'&&[10,15,20].includes(Number(el('rounds').value))&&Number(el('startingCash').value)===1500;el('rankedMatch').disabled=!eligible;if(!eligible)el('rankedMatch').checked=false;el('createShiftHelp').textContent=el('worldShift').value==='gravity'?'Gravity Pull brings eligible players to the roller’s exact world and square.':'Individual shifts move only the roller.';rememberCreateSettings();}
  entryOptions=new window.MiniopolyEntryOptions({onChange:updateMatchOptions});
  for(const id of ['capacity','rounds','startingCash','worldShift','gameMode','collapseRentBoost'])el(id).addEventListener('change',updateMatchOptions);
  el('gameOptionsButton').onclick=()=>gameOptions.open(el('gameOptionsButton'));
  el('lobbyOptionsButton').onclick=()=>gameOptions.open(el('lobbyOptionsButton'));
  el('startButton').onclick=()=>runAction('start');
  el('extendMatchButton').onclick=()=>runAction('extend-match');
  el('resetButton').onclick=()=>{
    if(!state||!auth)return;
    if(confirm(`Restart a PRACTICE match in room ${state.code}?\n\nThis keeps the SAME room code and seats but clears cash, property holdings, turns, and positions. Practice matches do not enter Legendary records.`))runAction('reset');
  };
  el('rollButton').onclick=()=>runAction('roll');
  el('towButton').onclick=()=>runAction('use-perk',{perk:'tow'});
  el('setbackButton').onclick=()=>{modalTab='setback';render();};
  el('foreclosureButton').onclick=()=>{foreclosureOpen=true;el('foreclosureLayer').hidden=false;renderForeclosureMarket();};
  el('marketClose').onclick=()=>{foreclosureOpen=false;el('foreclosureLayer').hidden=true;};
  el('foreclosureLayer').addEventListener('click',e=>{if(e.target===el('foreclosureLayer'))el('marketClose').click();});
  el('endButton').onclick=()=>runAction('end');
  el('phonePlayersToggle').onclick=()=>{const open=!el('turnPanel').classList.contains('show-players');el('turnPanel').classList.toggle('show-players',open);el('phonePlayersToggle').setAttribute('aria-expanded',String(open));};
  el('menuMyPropertiesButton').onclick=()=>openMyProperties();
  el('menuTradingButton').onclick=()=>tradingCenter.open();
  const modeHelp=el('gameModeInfo').parentElement,modeInfo=el('gameModeInfo');
  const showModeHelp=open=>{modeHelp.classList.toggle('is-open',open);modeInfo.setAttribute('aria-expanded',String(open));if(open)positionGameModeHelp();};
  window.addEventListener('resize',positionGameModeHelp);
  window.addEventListener('scroll',positionGameModeHelp,true);
  modeHelp.addEventListener('mouseenter',()=>showModeHelp(true));
  modeHelp.addEventListener('mouseleave',()=>{if(!modeHelp.contains(document.activeElement))showModeHelp(false);});
  modeInfo.addEventListener('focus',()=>showModeHelp(true));
  modeInfo.addEventListener('click',()=>showModeHelp(true));
  modeHelp.addEventListener('focusout',event=>{if(!modeHelp.contains(event.relatedTarget))showModeHelp(false);});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&modeHelp.classList.contains('is-open')){event.preventDefault();event.stopImmediatePropagation();showModeHelp(false);}},true);
  document.addEventListener('pointerdown',event=>{if(!modeHelp.contains(event.target))showModeHelp(false);});
  el('menuActivityButton').onclick=()=>{gameMenu.close(false);matchActivity.open();};
  el('focusButton').onclick=()=>setBoardFocus(!document.body.classList.contains('board-focus'));
  el('headerChatButton').onclick=()=>openChat();
  el('headerWorldsButton').onclick=()=>openWorlds();
  el('returnLiveBoard').onclick=()=>{if(boardReady)el('boardFrame').contentWindow?.postMessage({type:'MINI_RETURN_BOARD'},location.origin);};
  el('restoreBoardButton').onclick=()=>void restoreLiveBoard();
  el('landingMinimize').onclick=minimizeLanding;
  el('landingWaitingNotice').onclick=restoreLanding;
  el('landingMyProperties').onclick=()=>openMyProperties();
  el('landingAllProperties').onclick=()=>propertyOverview.open(state?.players.find(p=>p.id===state.youId)?.seat,el('landingAllProperties'));
  el('purchaseLayer').addEventListener('keydown',event=>{if(event.key==='Escape'&&!event.defaultPrevented&&!el('landingMinimize').hidden&&event.target.closest('.purchase-dialog')){event.preventDefault();minimizeLanding();}});
  el('compactRoll').onclick=()=>{if(state?.phase==='end')el('endButton').click();else el('rollButton').click();};
  el('myPropertiesButton').onclick=()=>openMyProperties();
  el('focusPropertiesButton').onclick=()=>openMyProperties();
  el('propertyOverviewButton').onclick=()=>propertyOverview.open(state?.players.find(p=>p.id===state.youId)?.seat,el('propertyOverviewButton'));
  el('propertiesClose').onclick=()=>closeMyProperties();
  el('propertiesLayer').addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();closeMyProperties();}if(event.key==='Tab'&&event.shiftKey&&document.activeElement===el('propertiesClose')){event.preventDefault();el('propertyPortfolioFrame').focus();}});
  el('propertiesLayer').onclick=e=>{if(e.target===el('propertiesLayer'))closeMyProperties();};
  el('legendaryButton').onclick=()=>openLegendary();
  el('awardsHallButton').onclick=()=>openLegendary();
  el('legendaryClose').onclick=()=>closeLegendary();
  el('legendaryMode').onchange=()=>{legendaryMode=el('legendaryMode').value;renderLegendary();};
  el('legendaryLayer').onclick=e=>{if(e.target===el('legendaryLayer'))closeLegendary();};
  el('legendaryLayer').querySelectorAll('[data-legendary-rounds]').forEach(btn=>btn.onclick=()=>{legendaryRounds=Number(btn.dataset.legendaryRounds);renderLegendary();});
  el('viewFinalBoardButton').onclick=()=>hideAwards();
  el('showResultsButton').onclick=()=>showAwards(false);
  el('replayAwardsButton').onclick=()=>showAwards(true);
  el('rankedRematchButton').onclick=()=>{if(confirm('Start a NEW RANKED match with the same players and room code? This resets the board and creates a new record-eligible game.'))runAction('new-ranked-match');};
  el('hintsToggleButton').onclick=()=>setHintsEnabled(!hintsEnabled);
  el('wifiSoundButton').onclick=()=>gameOptions.updatePersonal({sound:!gameOptions.personal.sound});
  el('copyCode').onclick=()=>copy(state?.code||'',null);
  el('copyLink').onclick=()=>copy(invite(),el('inviteLink'));
  el('forgetButton').onclick=async()=>{
    const host=state?.youId===state?.hostId,requestAuth=auth&&{...auth};if(!requestAuth||loading)return;
    if(!confirm(host?'Reset this room for EVERYONE? All seats and this unfinished match will be cleared. Players return to Create / Join so you can choose new options. Completed records and other saved games stay saved.':'Forget this player seat on this browser? It will remain reserved in the room, and you may be unable to rejoin after forgetting its secret key.'))return;
    if(host){
      const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),6500);setLoading(true);
      try{const result=await api('action',{...requestAuth,kind:'forget-all-seats'},{signal:controller.signal});resetClosedSeat(result.roomClosed,requestAuth);}
      catch(error){
        if(window.MiniopolyRoomSync.sameSeat(auth,requestAuth)){
          if(error.status===410)resetClosedSeat({code:requestAuth.code,message:error.message},requestAuth);
          else{el('phoneGameMenu').open=false;sessionNotice.show(error.message==='Unrecognized action.'?'update':'error',{error:error.name==='AbortError'?'The host did not confirm the reset in time. Your seat has been kept. Check the connection and try again.':error.message});}
        }
      }finally{clearTimeout(timeout);setLoading(false);}
    }
    else{window.MiniopolySeats.forget(localStorage,requestAuth.code);leaveRoom();}
  };
  el('boardFrame').addEventListener('load',()=>{
    if(!auth||!el('boardFrame').getAttribute('src')){boardReady=false;return;}
    const boardDoc=el('boardFrame').contentDocument;
    if(boardDoc&&!boardDoc.getElementById('phoneBoardStyles')){const link=boardDoc.createElement('link');link.id='phoneBoardStyles';link.rel='stylesheet';link.href='/phone-board.css';boardDoc.head.append(link);}
    boardDoc?.addEventListener('pointerdown',()=>{el('phoneGameMenu').open=false;});
    boardReady=true;sendPlayerPreferences();syncBoard();syncChat();sendBoardMode();sendHintsState();
    boardSizeObserver?.disconnect();
    const content=el('boardFrame').contentDocument?.querySelector('.app');
    if(content){boardSizeObserver=new ResizeObserver(fitMobileBoard);boardSizeObserver.observe(content);}
    fitMobileBoard();
    boardModalObserver?.disconnect();boardModalOpen=false;
    const overlay=el('boardFrame').contentDocument?.getElementById('overlay');
    if(overlay){
      boardModalObserver=new MutationObserver(()=>{boardModalOpen=!overlay.classList.contains('hidden');updateFloatingPanel();sendBoardViewport();});
      boardModalObserver.observe(overlay,{attributes:true,attributeFilter:['class']});
      boardModalOpen=!overlay.classList.contains('hidden');
    }
    render();
    floatingTurnPanel.restore();
  });
  const unlockGameAudio=()=>el('boardFrame').contentWindow?.miniWifiUnlockAudio?.();
  document.addEventListener('pointerdown',unlockGameAudio,{capture:true});document.addEventListener('keydown',unlockGameAudio,{capture:true});
  window.addEventListener('online',wakeRoomConnection);
  window.addEventListener('offline',()=>{if(auth)setConnectionStatus(false);});
  window.addEventListener('pageshow',handleRoomPageShow);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)wakeRoomConnection();});
  window.addEventListener('pagehide',()=>{stopRoomCatchup();feed?.close();feed=null;});
  window.addEventListener('resize',layoutPhoneHeader);
  window.addEventListener('resize',fitMobileBoard);
  window.addEventListener('resize',sendBoardViewport);
  window.addEventListener('scroll',sendBoardViewport,{passive:true});
  window.addEventListener('message',event=>{
    if(event.origin===location.origin&&event.source===el('propertyPortfolioFrame').contentWindow){
      if(event.data?.type==='MINI_PORTFOLIO_READY')renderMyProperties();
      if(event.data?.type==='MINI_PORTFOLIO_CLOSE')closeMyProperties();
      if(event.data?.type==='MINI_PORTFOLIO_DETAIL')el('propertiesClose').hidden=event.data.open===true;
      return;
    }
    if(event.origin!==location.origin||event.source!==el('boardFrame').contentWindow)return;
    if(event.data?.type==='MINI_TRADING_CENTER'&&!animating)tradingCenter.open();
    if(event.data?.type==='MINI_CARD_REVIEW'&&!animating)window.MiniopolyCards.open(event.data.deck);
    if(event.data?.type==='MINI_CHAT_SEND')sendChatMessage(event.data.text);
    if(event.data?.type==='MINI_CHAT_ATTACHMENT')sendChatAttachment(event.data);
    if(event.data?.type==='MINI_CHAT_TAB'){
      if(event.data.open)liveExperience.openChat();chatSelected=liveExperience.chatOpen;
      if(chatSelected){const messages=state?.chat||[];chatReadId=messages.length?messages[messages.length-1].id:chatReadId;}
      const badge=el('chatBadge');badge.hidden=chatSelected||!(state?.chat?.length) || state.chat[state.chat.length-1].id===chatReadId;
    }
    if(event.data?.type==='MINI_WIFI_SOUND_STATE'&&gameOptions.personal.sound!==Boolean(event.data.enabled))gameOptions.updatePersonal({sound:Boolean(event.data.enabled)});
    if(event.data?.type==='MINI_BOARD_READY'){boardReady=true;sendPlayerPreferences();artRequested.clear();syncBoard();syncChat();sendBoardMode();sendHintsState();render();}
    if(event.data?.type==='MINI_BOARD_VIEW'){
      const world=event.data.world;
      if(Number.isInteger(world)&&world>=0&&world<3){boardView={world,preview:event.data.preview===true};if(state)renderFloatingPanel(state.players[state.turn]?.id===state.youId,state.players[state.turn]);}
    }
    if(event.data?.type==='MINI_ANIMATION_START'&&state?.stage==='playing'&&state.phase!=='roll'&&state.lastRoll?.playerId===state.players[state.turn]?.id){animating=true;render();}
    if(event.data?.type==='MINI_DICE_SETTLED'){diceSpinning=false;render();}
    if(event.data?.type==='MINI_PIECE_LANDED'&&window.MiniopolyLandingPresentation.arrived(state,financialHold,event.data)){financialHold=null;render();syncBoard();}
    if(event.data?.type==='MINI_WORLD_TRANSITION_DONE'&&worldTransitionKey===[event.data.matchId,event.data.turnNumber,event.data.playerId].join(':')){worldTransitionKey='';clearTimeout(animationSafetyTimer);animating=false;diceSpinning=false;render();}
    if(event.data?.type==='MINI_ANIMATION_DONE'&&!worldTransitionKey){clearTimeout(animationSafetyTimer);if(animating||diceSpinning){animating=false;diceSpinning=false;financialHold=null;render();}}
    if(event.data?.type==='MINI_DEED_ART'){
      const {id,imageData,activeImageData}=event.data;
      if(typeof activeImageData==='string'&&activeImageData.startsWith('data:image/')&&activeImageData.length<8000000)specialArtCache.set(id,activeImageData);
      if(typeof id==='string' && typeof imageData==='string' && imageData.startsWith('data:image/') && imageData.length<8000000){artCache.set(id,imageData);render();}
    }
    if(event.data?.type==='MINI_REQUEST_ROLL'){
      if(state?.stage==='playing'&&state?.players[state.turn]?.id===state.youId&&state?.phase==='roll')runAction('roll');
    }
  });
  const modalObserver=new MutationObserver(updateFloatingPanel);
  for(const id of ['purchaseLayer','propertiesLayer','foreclosureLayer','legendaryLayer','awardsLayer','cardReviewLayer','buildingPermitDetails','gameOptionsLayer'])modalObserver.observe(el(id),{attributes:true,attributeFilter:['hidden']});
  try{networkInfo=await fetch('/api/network').then(r=>r.json());gameDeeds=Object.fromEntries((networkInfo.deeds||[]).map(d=>[d.id,d]));if(networkInfo.remote){document.title='Miniopoly Private Online Game · v0.3.89';el('networkModeLabel').textContent='Online Multiplayer';el('networkPill').textContent='PRIVATE ONLINE GAME';el('welcomeConnection').textContent='Play a private Mini-opoly match with friends from anywhere. Join on your phone, tablet, or computer using the game link and password.';el('connectionHelp').textContent='The host PC must stay awake with online hosting running. Share the password privately.';el('inviteLabel').textContent='Private online invitation link';el('remoteLogout').hidden=false;el('createForm').querySelector('button[type=submit]').textContent='Create Room →';}}catch{}
  restoreCreateSettings();updateMatchOptions();
  const roomName=new URLSearchParams(location.search).get('roomName');if(roomName)el('createRoomName').value=roomName.slice(0,40);
  const invitation=new URLSearchParams(location.search).get('room');
  if(invitation){switchTab('join');el('joinCode').value=invitation.toUpperCase();void piecePicker.refresh(true);}
  try{
    const requested=new URLSearchParams(location.search),room=requested.get('resume')||invitation;
    const current=JSON.parse(localStorage.getItem(STORE_KEY)||'null');
    const saved=requested.get('new')==='1'||requested.get('restore')==='1'?null:room?window.MiniopolySeats.find(localStorage,room.toUpperCase()):current;
    if(saved?.code&&saved?.token){try{const result=await api('resume',saved);saveAuth(result);return;}catch(error){if(error.status!==410)throw error;window.MiniopolySeats.forget(localStorage,saved.code);history.replaceState(null,'',location.pathname);el('joinCode').value='';switchTab('create');showRoomResetNotice({code:saved.code});render();return;}}
    if(requested.get('restore')==='1'||requested.has('resume')){el('seatTools').open=true;showError('Restore your private player seat file to reconnect to this saved game. Its board and progress have not changed.');}
  }catch{showError('This saved seat could not be restored. Your saved game has not been reset. You can restore a player seat file or return to Game Launcher.');}
  updateHintsToggle();
  if(sessionNotice.kind==='reset')switchTab(sessionNotice.value.host?'create':'join');
  render();
}
start();
