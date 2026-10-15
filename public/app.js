'use strict';
const el=id=>document.getElementById(id);
const floatingTurnPanel=new window.MiniopolyFloatingPanel(el('turnPanel'),{
  storageKey:'miniopoly_live_turn_panel_v1',home:el('turnPanelHome'),reset:el('resetTurnPanelButton')
});
let panelPlayersSignature='',panelMirrorFrame=null,boardModalObserver=null,boardModalOpen=false,boardView=null;
function updateFloatingPanel(){
  const active=state?.players?.[state.turn],myTurn=active?.id===state?.youId;
  const visible=Boolean(auth&&boardReady&&state&&state.stage!=='lobby');
  const blocked=boardModalOpen||['purchaseLayer','propertiesLayer','foreclosureLayer','legendaryLayer','awardsLayer'].some(id=>!el(id).hidden);
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
function renderFloatingPlayers(){
  const signature=JSON.stringify([state.stage,state.turn,state.youId,state.players.map(p=>[p.id,p.name,p.color,p.connected,p.out])]);
  if(signature===panelPlayersSignature)return;
  panelPlayersSignature=signature;
  const list=el('panelPlayers');list.replaceChildren();
  for(const player of state.players){
    const active=state.stage==='playing'&&player.seat===state.turn;
    const row=document.createElement('li');row.className='panel-player'+(active?' is-active':'');
    row.dataset.playerSeat=String(player.seat);row.style.setProperty('--seat-color',player.color);
    if(active)row.setAttribute('aria-current','true');
    const seat=document.createElement('span');seat.className='panel-seat';seat.textContent=String(player.seat+1);
    const details=document.createElement('div'),name=document.createElement('div'),info=document.createElement('div');
    name.className='panel-player-name';name.textContent=player.name;
    info.className='panel-player-detail';
    if(player.id===state.youId){const you=document.createElement('span');you.className='panel-you';you.textContent='YOU';info.append(you);}
    const turn=document.createElement('span');turn.textContent=player.out?'Out':active?'Taking a turn':player.connected?'Online':'Reconnecting…';
    info.append(turn);details.append(name,info);row.append(seat,details);list.append(row);
  }
}
function renderFloatingPanel(myTurn,active){
  renderFloatingPlayers();
  el('panelPlayerCount').textContent=state.players.length+' at the table';
  el('panelTurnLabel').textContent=state.stage==='finished'?'Match complete':myTurn?'Your turn, '+active.name:active.name+"’s turn";
  el('panelRound').replaceChildren(document.createTextNode(state.round+' '));
  const total=document.createElement('small');total.textContent='/ '+state.rounds;el('panelRound').append(total);
  el('panelRound').parentElement.setAttribute('aria-label','Round '+state.round+' of '+state.rounds);
  el('panelShift').textContent='Shift '+(active?.streak||0)+' / 10';
  el('panelDieLabel').textContent=diceSpinning?'Rolling…':animating?'Piece moving…':state.stage==='finished'?'Match complete':!myTurn?'Watching together':state.phase==='roll'?'Tap to roll':'Roll complete';
  const compact=el('compactRoll');
  compact.textContent=diceSpinning?'Rolling…':animating?'Moving…':state.stage==='finished'?'Done':myTurn&&state.phase==='end'?'End turn':'Roll';
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
  if(innerWidth>850||document.body.classList.contains('board-focus')){
    frame.style.removeProperty('height');return;
  }
  const content=frame.contentDocument?.querySelector('.app');
  if(content)frame.style.setProperty('height',Math.ceil(content.getBoundingClientRect().height+8)+'px','important');
  sendBoardViewport();
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
let propertiesOpen=false, legendaryOpen=false, legendaryRounds=20, awardsHidden=false, awardsSeenMatchId=null, soundForAwards=true;

let hintsEnabled=(localStorage.getItem(HINTS_KEY)??'on')!=='off';
let auth=null, state=null, feed=null, chatReadId=null, chatSelected=false, pendingChatOpen=false, loading=false, networkInfo=null, boardReady=false, animating=false, diceSpinning=false, animationSafetyTimer=null, currentTab='create', modalTab='main', rememberedPhase='', artCache=new Map(), artRequested=new Set();
function showError(message){const box=el('alert');box.textContent=message;box.hidden=false;clearTimeout(showError.timer);showError.timer=setTimeout(()=>box.hidden=true,8500);}
function setLoading(active){loading=active;render();}
async function api(route,body){
  const response=await fetch('/api/'+route,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  let result;
  try{result=await response.json();}catch{throw new Error('Server sent an invalid response.');}
  if(!response.ok)throw new Error(result.error||'Request failed.');
  return result;
}
function switchTab(tab){
  currentTab=tab;
  el('createForm').hidden=tab!=='create';el('joinForm').hidden=tab!=='join';
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
function saveAuth(result){if(auth?.code!==result.code)boardView=null;auth={code:result.code,token:result.token};localStorage.setItem(STORE_KEY,JSON.stringify(auth));state=result.state;connect();render();}
function beginRollPlaybackIfNew(incoming){
  if(!boardReady||state?.stage!=='playing'||!incoming?.lastRoll?.at||incoming.lastRoll.at===state.lastRoll?.at)return;
  animating=true;
  diceSpinning=true;
  clearTimeout(animationSafetyTimer);
  // 1.65 s of dice + up to 12 x 0.69 s of movement + a world-shift pause.
  animationSafetyTimer=setTimeout(()=>{animating=false;diceSpinning=false;render();},19000);
}
function connect(){
  if(feed)feed.close();
  if(!auth)return;
  feed=new EventSource('/api/events?code='+encodeURIComponent(auth.code)+'&token='+encodeURIComponent(auth.token));
  feed.addEventListener('state',event=>{try{const incoming=JSON.parse(event.data); beginRollPlaybackIfNew(incoming); state=incoming;render();syncBoard();syncChat();el('networkPill').textContent='CONNECTED TO HOST';}catch(e){console.error(e);}});
  feed.onerror=()=>{el('networkPill').textContent='RECONNECTING…';};
}
function ensureBoard(){
  if(!auth)return;
  const frame=el('boardFrame');
  if(!frame.getAttribute('src'))frame.src='/board-v5-42.html?v=0.3.12';
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
  button.textContent=hintsEnabled?'💡 Hints On':'💡 Hints Off';
  button.setAttribute('aria-pressed',String(hintsEnabled));
  button.title=hintsEnabled?'Helpful hover hints are enabled. Click to declutter further by turning them off.':'Helpful hover hints are off. Click to show rule tooltips on hover.';
}
function setHintsEnabled(active){
  hintsEnabled=Boolean(active);
  localStorage.setItem(HINTS_KEY,hintsEnabled?'on':'off');
  updateHintsToggle();
  sendHintsState();
  refreshControlIcons();
  fitMobileBoard();
}

function setBoardFocus(focus){
  document.body.classList.toggle('board-focus',Boolean(focus));
  const toggle=el('focusButton');
  toggle.setAttribute('aria-pressed',String(Boolean(focus)));
  toggle.setAttribute('aria-label',focus?'Exit full board view':'Enter full board view');
  toggle.textContent=focus?'↙ Exit Full Board':'⛶ Full Board View';
  el('focusPropertiesButton').hidden=!focus;
  sendBoardMode();
  sendHintsState();
  refreshControlIcons();
  fitMobileBoard();
  floatingTurnPanel.constrain();
}

function syncChat(){
  if(!boardReady||!state)return;
  el('boardFrame').contentWindow?.postMessage({type:'MINI_CHAT_STATE',messages:state.chat||[],youId:state.youId,access:{code:auth?.code,token:auth?.token}},location.origin);
  if(pendingChatOpen){pendingChatOpen=false;el('boardFrame').contentWindow?.postMessage({type:'MINI_OPEN_CHAT'},location.origin);}
}
function openChat(){
  if(document.body.classList.contains('board-focus'))setBoardFocus(false);
  pendingChatOpen=true;
  if(boardReady){pendingChatOpen=false;el('boardFrame').contentWindow?.postMessage({type:'MINI_OPEN_CHAT'},location.origin);}
}
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
function syncBoard(){
  if(!boardReady||!state||state.stage==='lobby')return;
  el('boardFrame').contentWindow?.postMessage({type:'MINI_SYNC',state},location.origin);
  sendBoardMode();
  sendHintsState();
  syncChat();
}
function makePlayerRow(p,hostId,youId){
  const node=document.createElement('div');node.className='player-item';
  const token=document.createElement('div');token.className='player-color';token.style.setProperty('--player',p.color);token.textContent=String(p.seat+1);
  const details=document.createElement('div');details.className='player-details';
  const title=document.createElement('b');title.textContent=p.name+(p.id===youId?' (You)':'');
  const sub=document.createElement('small');sub.textContent='Player '+(p.seat+1)+(p.id===hostId?' · Host':'')+' · '+['Richmond Hill','The Communities','Coastal Georgia'][p.board]+' · Square '+(p.pos+1);
  details.append(title,sub);
  const badge=document.createElement('span');badge.className='player-badge'+(p.connected?' online':'');badge.textContent=p.connected?'● Online':'○ Offline';
  node.append(token,details,badge);return node;
}
function render(){
  updateHintsToggle();
  refreshControlIcons();
  el('welcomeView').hidden=Boolean(auth);
  el('gameView').hidden=!auth;
  document.body.classList.toggle('in-game',Boolean(auth));
  document.body.classList.toggle('live-turn-layout',Boolean(auth&&state&&state.stage!=='lobby'));
  // Share a single compact header between room information and game controls.
  const sessionHead=el('gameSessionHead');
  if(sessionHead?.parentElement!==el('topbar')) el('topbar').insertBefore(sessionHead,el('topbar').querySelector('.top-right'));
  if(!auth||!state){updateFloatingPanel();return;}
  el('lobbyPlayersPanel').hidden=state.stage!=='lobby';
  ensureBoard();
  el('roomCodeDisplay').textContent=state.code;
  el('inviteCode').textContent=state.code;
  el('inviteLink').value=invite();
  el('lanHelp').textContent=getLanBase()===location.origin && location.hostname==='localhost'?'No LAN address detected yet. Use the network address shown in the host terminal.':'Share this link on the same Wi-Fi. The host must keep the server running.';
  el('playerCount').textContent=state.players.length+' / '+state.capacity;
  el('sessionSubheading').textContent=state.stage==='lobby'?'PRIVATE GAME ROOM':state.stage==='playing'?'LIVE WI-FI GAME':'MATCH COMPLETE';
  el('matchStatus').textContent=state.stage==='lobby'?'Waiting for players':state.stage==='playing'?'In progress':'Match complete';
  el('showResultsButton').hidden=state.stage!=='finished';
  el('rankedRematchButton').hidden=!(state.stage==='finished'&&state.hostId===state.youId&&[10,15,20].includes(state.rounds));
  const slots=el('players');slots.replaceChildren();
  for(const p of state.players) slots.append(makePlayerRow(p,state.hostId,state.youId));
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
  el('resetButton').disabled=loading||animating||state.players.length<2;
  el('hostHelp').textContent=state.players.length<2?'Waiting for at least 2 players.':'Ready: '+state.players.length+' joined player(s).';
  el('boardMode').textContent=state.stage==='lobby'?'Preview · waiting to start':state.stage==='finished'?'Match complete':'Live · Round '+state.round;
  const chat=state.chat||[];
  const lastChat=chat.length?chat[chat.length-1].id:null;
  const unread=lastChat&&!chatSelected&&lastChat!==chatReadId;
  const badge=el('chatBadge');badge.hidden=!unread;badge.textContent=unread?'●':'';
  const me=state.players.find(p=>p.id===state.youId);
  const active=state.players[state.turn];
  const myTurn=state.stage==='playing'&&active?.id===state.youId;
  el('turnText').textContent=animating?(diceSpinning?'The 12-sided die is spinning…':'Watch the piece move and the landing effect…'):state.phase==='bail'?(myTurn?'Bail roll complete — pay the fixed bail amount or raise cash.':`${active?.name||'Player'} is resolving bail.`):state.phase==='purchase'?(myTurn?'Purchase decision: choose Buy or Pass.':`${active?.name||'Player'} is deciding whether to buy.`):state.stage==='lobby'?(isHost?'Start when you have at least two players.':'Waiting for the host to start…'):state.stage==='finished'?'🏆 Match complete — view the awards!':myTurn?(state.phase==='roll'?'Your turn — roll the die!':'Your roll is complete — end your turn.'):active?.name+"'s turn — watching together.";
  el('towButton').hidden=!(myTurn && ['roll','post'].includes(state.phase) && me?.penalty>0 && me?.perks?.includes('tow'));
  el('setbackButton').hidden=!(myTurn && me?.penalty>0 && ['roll','post'].includes(state.phase));
  el('foreclosureBadge').textContent=String((state.foreclosures||[]).filter(f=>(state.turnNumber||0)>=f.createdTurn+2 && (state.players.some(p=>p.seat!==f.previousOwner&&!p.out)||state.round>=f.round+3)).length);
  if(foreclosureOpen)renderForeclosureMarket();
  el('towButton').disabled=loading||animating;
  el('rollButton').disabled=loading||animating||!myTurn||state.phase!=='roll';
  el('endButton').disabled=loading||animating||!myTurn||state.phase!=='end';
  el('myCash').textContent=me?'$'+me.cash.toLocaleString('en-US'):'—';
  el('myDeedCount').textContent=String(Object.values(state.owned||{}).filter(o=>o.owner===me?.seat).length);
  if(propertiesOpen)renderMyProperties();
  if(legendaryOpen)renderLegendary();
  syncAwardsState();
  if(rememberedPhase!==state.phase){modalTab='main';rememberedPhase=state.phase;}
  renderLanding(myTurn,me,active);
  const latest=state.lastRoll;
  el('rollResult').classList.toggle('dice-spinning',diceSpinning);
  el('rollResult').querySelector('b').textContent=diceSpinning?'…':latest?.value||'—';
  el('rollResult').querySelector('span').textContent=diceSpinning?'Spinning…':animating?'Piece moving…':latest?.shift?'World shift!':'12-sided die';
  const history=el('activityLog');history.replaceChildren();
  const visibleLog=diceSpinning?['🎲 The twelve-sided die is spinning…',...state.log.slice(1,12)]:state.log.slice(0,12);
  for(const message of visibleLog){
    const line=document.createElement('div');line.className='activity-line';line.textContent=message;history.append(line);
  }
  renderFloatingPanel(myTurn,active);
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
  button.addEventListener('click',action);el('modalActions').append(button);return button;
}
function detailLine(label,value){
  const row=document.createElement('div');row.className='purchase-price-row';
  const left=document.createElement('span'),right=document.createElement('strong');
  left.textContent=label;right.textContent=value;row.append(left,right);el('modalSummary').append(row);
}
function renderLanding(myTurn,me,active){
  const layer=el('purchaseLayer');
  const phase=state?.stage==='playing'?state.phase:null;
  const info=phase==='post'?state.post:state.pending;
  const setbackMenu=['roll','post'].includes(phase) && modalTab.startsWith('setback') && myTurn && me?.penalty>0;
  const show=(['purchase','post','card','rent','bail'].includes(phase)||setbackMenu)&&!animating;
  const justOpened=layer.hidden&&show;
  layer.hidden=!show;
  if(!show)return;
  const ownerIsMe=myTurn && (phase==='post'||info?.playerId===state.youId);
  const deck=phase==='card',rent=phase==='rent';
  const id=info?.id||null;
  const storybookArt=window.MiniopolyVisuals.propertyArt(id);
  el('purchaseLayer').querySelector('.purchase-dialog').classList.toggle('storybook-card',Boolean(storybookArt));
  el('purchaseLayer').querySelector('.purchase-dialog').style.setProperty('--deed-color',COLORS_FOR_SETS[gameDeeds[id]?.color]||'#7b9b78');
  const title=setbackMenu?'SetBack Escape Options':phase==='bail'?'Bail Payment Required':phase==='purchase'?info.name:phase==='post'?info?.title||'Turn Actions':deck?info?.title||'Card Drawn':rent?(info.creditor===null?'Bank Payment Due':'Rent Due'):'Landing';
  const kicker=setbackMenu?'SETBACK · SELECT YOUR EXIT':phase==='bail'?'SETBACK · LOCKED BAIL ROLL':phase==='purchase'?'AVAILABLE '+(info.type==='p'?'PROPERTY':info.type==='rail'?'RAILROAD':'UTILITY'):
    phase==='post'?'YOUR TURN · ACTION CENTER':deck?(info.source||'CARD DRAWN').toUpperCase():rent?'PAYMENT REQUIRED':'LANDING';
  el('purchaseLabel').textContent=kicker;
  el('purchaseHeading').textContent=title;
  el('purchaseDescription').textContent=phase==='bail'?(info?.description||'Pay the fixed bail amount to escape, or forfeit a deed.'):setbackMenu?'Roll a 6 or 12 free, pay bail equal to $20 × your roll, surrender an eligible property, or use an Escape SetBack card. The bank manages foreclosures.':!ownerIsMe?`${active?.name||'The active player'} is resolving this landing. Waiting for their decision…`:
    phase==='purchase'?'Buy this deed or pass. The decision is confirmed by the host server.':
    phase==='post'?(info?.message||'You can manage your holdings before ending your turn.'):
    deck?(info.description||'Drawn card'):
    `You owe ${money(info.amount)} to ${info.creditorName}. Choose Pay or raise cash before settling.`;
  const summary=el('modalSummary');summary.replaceChildren();
  const details=el('modalDetails');details.replaceChildren();details.hidden=true;
  el('purchaseHint').textContent='';
  el('modalActions').replaceChildren();
  el('modalFooter').textContent='All purchases, payments, cards and asset sales are verified by the Windows host.';
  const imageWrap=el('modalArtWrap'),image=el('modalArt'),fallback=el('modalArtFallback');
  imageWrap.hidden=!(id||phase==='card');
  imageWrap.classList.toggle('storybook-art',Boolean(storybookArt));
  image.alt=id?'Illustration of '+(gameDeeds[id]?.name||'the property'):'Card illustration';
  image.hidden=true;fallback.hidden=false;
  if(id){
    fallback.textContent='🏡';
    requestArt(id);
    if(deedArt(id)){image.src=deedArt(id);image.hidden=false;fallback.hidden=true;}
  }else fallback.textContent=info?.emoji||'🎴';
  if(phase==='bail'){
    detailLine('Bail roll',String(info.value));detailLine('Bail due',money(info.amount));detailLine('Your cash',money(me.cash));
    if(ownerIsMe){
      if(modalTab==='bail-assets'){details.hidden=false;renderAssetRows(details,me);modalButton('← Back to Bail',()=>{modalTab='main';render();});}
      else if(modalTab==='bail-forfeit'){details.hidden=false;renderForecloseRows(details,me);modalButton('← Back to Bail',()=>{modalTab='main';render();});}
      else{modalButton('💵 Pay Bail '+money(info.amount),()=>runAction('pay-bail'),{style:'primary',disabled:me.cash<info.amount});
        modalButton('🏦 Sell Assets to Raise Cash',()=>{modalTab='bail-assets';render();});
        modalButton('🚧 Forfeit Property Instead',()=>{modalTab='bail-forfeit';render();});}
    }
  } else if(setbackMenu){
    detailLine('Restricted attempts left',String(me.penalty));
    detailLine('Cash available',money(me.cash));
    if(modalTab==='setback-deeds'){details.hidden=false;renderForecloseRows(details,me);modalButton('← Back',()=>{modalTab='setback';render();});}
    else if(modalTab==='setback-sell'){details.hidden=false;renderAssetRows(details,me);modalButton('← Back',()=>{modalTab='setback';render();});}
    else {
      if(phase==='roll'){
        modalButton('🎲 Try 6 or 12 (free)',()=>{modalTab='main';runAction('roll');},{style:'primary'});
        modalButton('💰 Roll & Pay Bail · $20 × result',()=>{modalTab='main';runAction('bail-roll');});
      } else { el('purchaseHint').textContent='You can forfeit a deed or use an escape card now. Free and bail rolls become available at the start of your next turn.'; }
      modalButton('🏦 Forfeit Deed to Bank',()=>{modalTab='setback-deeds';render();});
      for(const perk of ['escape','tow'])if(me.perks?.includes(perk))modalButton(`🎫 Use ${perk==='escape'?'Escape SetBack Card':'Tow Voucher'}`,()=>{modalTab='main';runAction('use-perk',{perk});});
      modalButton('💵 Sell Assets for Bail',()=>{modalTab='setback-sell';render();});
      modalButton('Close · Decide Later',()=>{modalTab='main';render();});
    }
  } else if(phase==='purchase'){
    detailLine('Purchase price',money(info.price));
    detailLine('Base rent',info.type==='rail'?'$25 / $50 / $100 / $200':info.type==='util'?'4× or 10× die':money(info.base));
    detailLine('Your cash',money(me?.cash));
    if(info.discount)detailLine('Volunteer Crew discount',money(info.discount));
    if(ownerIsMe){
      el('purchaseHint').textContent=me.cash<info.price?'You do not have enough cash to buy this deed.':'Purchase confirmation will open the Turn Action Center.';
      modalButton('🏠 Buy Property',()=>runAction('buy'),{style:'primary',disabled:me.cash<info.price});
      modalButton('Pass for Now',()=>runAction('pass'));
    }
  }else if(deck){
    detailLine('Card effect',info.amount>0?'+'+money(info.amount):info.amount<0?'-'+money(-info.amount):info.perk?'Perk saved':'Event');
    detailLine('Your cash',money(me?.cash));
    if(ownerIsMe)modalButton(info.amount<0?'Continue to Payment':'Continue to Turn Actions',()=>runAction('continue-card'),{style:'primary'});
  }else if(rent){
    detailLine(info.creditor===null?'Pay to':'You owe rent to',info.creditorName);
    detailLine('Amount due',money(info.amount));
    detailLine('Available cash',money(me?.cash));
    if(ownerIsMe){
      if(modalTab==='assets'){
        details.hidden=false;renderAssetRows(details,me);
        modalButton('← Back to Payment',()=>{modalTab='main';render();});
        modalButton('Pay '+money(info.amount),()=>runAction('pay'),{style:'primary',disabled:me.cash<info.amount});
        modalButton('Declare Bankruptcy',()=>{
          if(confirm('Declare bankruptcy? Remaining cash and deeds transfer to the creditor (or back to the bank). This cannot be undone.'))runAction('bankrupt');
        },{style:'danger'});
      }else{
        el('purchaseHint').textContent=me.cash<info.amount?`You need ${money(info.amount-me.cash)} more. Sell upgrades or deeds to the bank, or declare bankruptcy if you cannot pay.`:'Rent is not transferred until you press Pay.';
        modalButton('💵 Pay '+money(info.amount),()=>runAction('pay'),{style:'primary',disabled:me.cash<info.amount});
        modalButton('🤝 Negotiations · Coming Soon',()=>{}, {disabled:true,hint:'This future feature requires trade and creditor-approval rules.'});
        modalButton('🏦 Sell Upgrades / Property',()=>{modalTab='assets';render();});
        if(me.cash<info.amount)modalButton('Declare Bankruptcy',()=>{
          if(confirm('Declare bankruptcy? Your assets transfer to the creditor or bank and you leave the match.'))runAction('bankrupt');
        },{style:'danger'});
      }
    }
  }else if(phase==='post'){
    if(info?.kind==='purchase')detailLine('Price paid',money(info.price));
    if(info?.kind==='purchase'||info?.kind==='pass'||info?.kind==='owned')detailLine('Property',info.name||'—');
    detailLine('Available cash',money(me?.cash));
    if(ownerIsMe){
      if(modalTab==='upgrades'){
        details.hidden=false;renderUpgradeRows(details,me);
        modalButton('← Back to Turn Actions',()=>{modalTab='main';render();});
      }else if(modalTab==='perks'){
        details.hidden=false;renderPerkRows(details,me);
        modalButton('← Back to Turn Actions',()=>{modalTab='main';render();});
      }else if(modalTab==='trading'){
        details.hidden=false;details.textContent='Player-to-player trade offers, rent negotiations, and approval controls are planned for a later multiplayer update. No trade or debt cancellation occurs here.';
        modalButton('← Back to Turn Actions',()=>{modalTab='main';render();});
      }else{
        modalButton('🤝 Trading',()=>{modalTab='trading';render();});
        modalButton('🏘️ Upgrade',()=>{modalTab='upgrades';render();});
        modalButton('✨ Perks',()=>{modalTab='perks';render();});
        modalButton('End Turn →',()=>runAction('end'),{style:'primary'});
      }
    }
  }
  if(['purchase','post','rent'].includes(phase)){
    if(gameDeeds[id]?.type==='p'){
      const upgrades=document.createElement('div');upgrades.className='purchase-price-row';
      upgrades.append(makeTag('span','Upgrades'),makeLevelStars(state.owned?.[id]?.level||0));summary.append(upgrades);
    }
    const footer=el('modalFooter'),browse=document.createElement('button');browse.type='button';browse.className='modal-deeds-shortcut storybook-control';browse.dataset.icon='house';browse.textContent='View My Properties';
    browse.onclick=()=>openMyProperties();footer.append(document.createTextNode('  ·  '),browse);
  }
  if(justOpened && ownerIsMe)requestAnimationFrame(()=>el('modalActions').querySelector('button:not(:disabled)')?.focus());
}
function renderForecloseRows(wrapper,me){
 const deeds=Object.entries(state.owned).filter(([,o])=>state.players[o.owner]?.id===state.youId && !o.mortgage && !o.level);
 if(!deeds.length){wrapper.textContent='No eligible undeveloped, unmortgaged properties to forfeit. You can still attempt a free roll, pay bail or use an Escape SetBack card.';return;}
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
  const button=document.createElement('button');button.textContent='Buy';button.disabled=!available||!myTurn||!['roll','post'].includes(state.phase)||me.cash<f.price||loading;
  button.onclick=()=>runAction('buy-foreclosure',{id:f.deedId});row.append(info,button);list.append(row);
 }
}
function renderAssetRows(wrapper,me){
  const deeds=Object.entries(state.owned).filter(([,owner])=>state.players[owner.owner]?.id===state.youId);
  if(!deeds.length){wrapper.textContent='You have no properties or upgrades to sell. You may need to declare bankruptcy.';return;}
  for(const [id,own] of deeds){
    const d=gameDeeds[id];if(!d)continue;
    const item=document.createElement('div');item.className='modal-asset-row';
    const label=document.createElement('span');label.textContent=d.name+' · '+(own.level?'Level '+own.level:'No upgrades');
    item.append(label);
    if(own.level>0){
      const b=document.createElement('button');b.className='secondary';b.textContent='Sell upgrade +'+money(Math.floor(d.upgradeCost/2));b.disabled=loading;
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
  const owned=Object.entries(state.owned).filter(([,o])=>state.players[o.owner]?.id===state.youId);
  let eligible=0;
  for(const [id,o] of owned){
    const d=gameDeeds[id];if(!d||d.type!=='p'||o.mortgage||o.level>=3)continue;
    const set=Object.values(gameDeeds).filter(x=>x.type==='p'&&x.color===d.color);
    if(!set.every(x=>state.owned[x.id]?.owner===o.owner&&!state.owned[x.id]?.mortgage))continue;
    eligible++;
    const row=document.createElement('div');row.className='modal-asset-row';
    const label=document.createElement('span');label.textContent=`${d.name} · Level ${o.level} → ${o.level+1}`;
    const b=document.createElement('button');b.className='secondary';b.textContent='Upgrade '+money(d.upgradeCost);b.disabled=me.cash<d.upgradeCost||loading;
    b.onclick=()=>runAction('upgrade',{id});row.append(label,b);wrapper.append(row);
  }
  if(!eligible)wrapper.textContent='No upgrades are available. Own every property in an unmortgaged color group across all worlds to upgrade (maximum Level 3).';
}
function renderPerkRows(wrapper,me){
  const perks=me.perks||[];
  if(!perks.length){wrapper.textContent='No saved Community Perks. Draw Community Bonus cards to earn them.';return;}
  const descriptions={volunteer:'$25 off your next unowned house purchase (automatic)',helping:'Block up to $100 of a bank fee (automatic)',tow:'Escape Setback before rolling',swap:'Future feature: consensual position swap (not active)'};
  for(const perk of perks){
    const row=document.createElement('div');row.className='modal-asset-row';
    const label=document.createElement('span');label.textContent=({volunteer:'Volunteer Crew',helping:'Helping Hand',tow:'Tow Voucher',swap:'Swap Favor'}[perk]||perk)+' — '+(descriptions[perk]||'');
    row.append(label);wrapper.append(row);
  }
}
async function runAction(kind,extra={}){
  if(loading||!auth)return;
  try{setLoading(true);const data=await api('action',{...auth,kind,...extra});beginRollPlaybackIfNew(data.state);state=data.state;render();syncBoard();}
  catch(e){showError(e.message);}finally{setLoading(false);}
}
async function joinOrCreate(kind,body){
  if(loading)return;
  try{setLoading(true);const data=await api(kind,body);saveAuth(data);}
  catch(e){showError(e.message);}finally{setLoading(false);}
}
let gameDeeds={};
const COLORS_FOR_SETS={Brown:'#987047',Blue:'#4c9ccb',Pink:'#d47b9c',Orange:'#e68e40',Red:'#d85c55',Yellow:'#e5c55a',Green:'#44a981',Navy:'#3d5e9b'};
const GAME_WORLDS=['Richmond Hill','The Communities','Coastal Georgia'];
function makeTag(kind,text){const node=document.createElement(kind);node.textContent=text;return node;}
function makeLevelStars(level){
  const count=Math.max(0,Math.min(3,Math.floor(Number(level)||0)));
  const stars=document.createElement('span');stars.className='property-level-stars';
  stars.setAttribute('role','img');stars.setAttribute('aria-label',count+' of 3 upgrade stars');
  for(let index=0;index<3;index++){
    const image=document.createElement('img');image.src=window.MiniopolyVisuals.upgradeStar;image.alt='';
    image.className='property-level-star'+(index>=count?' is-empty':'');stars.append(image);
  }
  return stars;
}
function makePropertyRow(deed,owner,me){
  const row=document.createElement('div');row.className='property-deed-row'+(owner?.owner===me.seat?' own':'');
  const image=document.createElement('div');image.className='property-deed-art';
  row.classList.toggle('storybook-deed-row',Boolean(window.MiniopolyVisuals.propertyArt(deed.id)));
  if(deedArt(deed.id)){
    const img=document.createElement('img');img.src=deedArt(deed.id);img.alt='';img.loading='lazy';image.append(img);
  }else {image.textContent='🏠';if(owner?.owner===me.seat)requestArt(deed.id);}
  const copy=document.createElement('div');copy.className='property-deed-copy';
  copy.append(makeTag('strong',deed.name),makeTag('small',GAME_WORLDS[Number(deed.id.split('-')[0])]+' · $'+deed.price));
  if(deed.type==='p')copy.append(makeLevelStars(owner?.level||0));
  const badge=makeTag('span',owner?.owner===me.seat?(owner.mortgage?'Mortgaged':'OWNED'):
    owner?('Owned by '+(state.players[owner.owner]?.name||'Player')):
    (state.foreclosures||[]).some(f=>f.deedId===deed.id)?'Foreclosure':'Bank');
  badge.className='property-deed-status'+(owner?.owner===me.seat?' mine':'');
  row.append(image,copy,badge);return row;
}
function renderMyProperties(){
  if(!state||!auth)return;
  const me=state.players.find(p=>p.id===state.youId);if(!me)return;
  const mine=Object.values(state.owned||{}).filter(x=>x.owner===me.seat).length;
  el('propertiesIntro').textContent=me.name+' · your deed collection across all three worlds';
  const summary=el('propertySummary');summary.replaceChildren();
  summary.append(makeTag('strong',mine+' deed'+(mine===1?'':'s')));
  const all=Object.values(gameDeeds);
  const homes=all.filter(d=>d.type==='p');
  const colors=[...new Set(homes.map(d=>d.color))];
  const groups=colors.map(color=>({color,deeds:homes.filter(d=>d.color===color)}));
  for(const group of groups){group.owned=group.deeds.filter(d=>state.owned?.[d.id]?.owner===me.seat).length;group.complete=group.owned===group.deeds.length;}
  groups.sort((a,b)=>Number(b.complete)-Number(a.complete)||b.owned-a.owned||a.color.localeCompare(b.color));
  summary.append(makeTag('span',groups.filter(g=>g.complete).length+' / '+groups.length+' complete color sets'));
  const wrap=el('propertySetRows');wrap.replaceChildren();
  const active=groups.filter(g=>g.owned>0),unstarted=groups.filter(g=>!g.owned);
  function insertGroup(parent,g,collapse){
    const box=document.createElement('section');box.className='property-group'+(g.complete?' completed':'');
    const head=document.createElement('div');head.className='property-group-title';
    const dot=document.createElement('span');dot.className='property-color-dot';dot.style.background=COLORS_FOR_SETS[g.color]||'#7296ae';
    head.append(dot,makeTag('strong',g.color),makeTag('span',g.complete?'✓ COMPLETE':`${g.owned} / ${g.deeds.length} owned`));
    box.append(head);
    if(g.owned&&!g.complete){
      const missing=g.deeds.filter(d=>state.owned?.[d.id]?.owner!==me.seat);
      const hint=makeTag('p','Need: '+missing.map(d=>d.name).join(' · '));hint.className='property-missing';box.append(hint);
    }
    const deedsList=document.createElement('div');deedsList.className='property-deeds';
    for(const deed of g.deeds)deedsList.append(makePropertyRow(deed,state.owned?.[deed.id],me));
    box.append(deedsList);parent.append(box);
  }
  if(!active.length)wrap.append(makeTag('p','You have no color-group deeds yet. Explore these sets to plan your next purchase.'));
  for(const group of active)insertGroup(wrap,group);
  if(unstarted.length){const details=document.createElement('details');details.className='property-other-sets';
    const summaryNode=makeTag('summary',`Other color sets (${unstarted.length})`);details.append(summaryNode);
    for(const g of unstarted)insertGroup(details,g);
    wrap.append(details);
  }
  for(const type of ['rail','util']){
    const deeds=all.filter(d=>d.type===type);if(!deeds.length)continue;
    const group=document.createElement('section');group.className='property-group utilities-group';
    const count=deeds.filter(d=>state.owned?.[d.id]?.owner===me.seat).length;
    const head=makeTag('div',(type==='rail'?'🚂 Railroads':'💧 Utilities')+' · '+count+'/'+deeds.length+' owned');head.className='property-group-title';
    group.append(head);
    const list=document.createElement('div');list.className='property-deeds';for(const deed of deeds)list.append(makePropertyRow(deed,state.owned?.[deed.id],me));
    group.append(list);wrap.append(group);
  }
}
function openMyProperties(){if(!state)return;propertiesOpen=true;el('propertiesLayer').hidden=false;renderMyProperties();}
function closeMyProperties(){propertiesOpen=false;el('propertiesLayer').hidden=true;}
function renderLegendary(){
  const records=state?.legendary?.[legendaryRounds]||[];
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
function openLegendary(){if(!state)return;legendaryOpen=true;el('legendaryLayer').hidden=false;renderLegendary();}
function closeLegendary(){legendaryOpen=false;el('legendaryLayer').hidden=true;}
function playVictoryTone(){
  if(!soundForAwards||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;const ctx=new Audio();
    [392,494,587,784].forEach((hz,i)=>{const osc=ctx.createOscillator(),gain=ctx.createGain(),start=ctx.currentTime+i*.16;
      osc.type='triangle';osc.frequency.value=hz;gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(.042,start+.045);gain.gain.exponentialRampToValueAtTime(.0001,start+.42);osc.connect(gain).connect(ctx.destination);osc.start(start);osc.stop(start+.44);});
    setTimeout(()=>ctx.close().catch(()=>{}),2000);
  }catch{}
}
function makeCelebration(){
  const card=el('awardsLayer');card.classList.remove('celebrating');void card.offsetWidth;card.classList.add('celebrating');
  const pieces=el('celebrationParticles');pieces.replaceChildren();
  for(let i=0;i<38;i++){
    const elmt=document.createElement('i');elmt.className='confetti-piece';
    elmt.style.setProperty('--x',((i*37+9)%98)+'%');elmt.style.setProperty('--delay',((i*17)%23)/12+'s');
    elmt.style.setProperty('--duration',(2.4+(i%7)*.26)+'s');elmt.style.setProperty('--tint',['#f8d675','#76dbde','#bda1fc','#ed98b0'][i%4]);
    pieces.append(elmt);
  }
  for(let i=0;i<3;i++){const burst=document.createElement('i');burst.className='firework-burst';burst.style.setProperty('--burst-x',[23,75,51][i]+'%');burst.style.setProperty('--burst-y',[21,28,15][i]+'%');burst.style.setProperty('--delay',[.55,1,1.35][i]+'s');pieces.append(burst);}
  setTimeout(()=>card.classList.remove('celebrating'),4900);
  playVictoryTone();
}
function renderAwards(){
  const final=state?.finalResults;if(!final?.standings?.length)return;
  const scores=final.standings,winners=scores.filter(x=>x.worth===scores[0].worth);
  el('awardsTitle').textContent=winners.length>1?winners.map(x=>x.name).join(' & ').toUpperCase():scores[0].name.toUpperCase();
  el('championWorth').textContent=money(scores[0].worth);
  el('awardSubtitle').textContent=(winners.length>1?'CO-CHAMPIONS':'CHAMPION')+' · FINAL NET WORTH · '+final.rounds+' ROUNDS';
  const rows=el('finalPlaces');rows.replaceChildren();
  scores.forEach((p,index)=>{
    const row=document.createElement('div');row.className='award-place '+(index===0?'first':'');
    row.append(makeTag('span',index===0?'🥇':index===1?'🥈':index===2?'🥉':'🏅'),makeTag('strong',p.name),makeTag('b',money(p.worth)));
    rows.append(row);
  });
  const banner=el('legendaryRecognition');banner.hidden=!final.newRecords?.length;
  if(!banner.hidden){const top=final.newRecords.slice().sort((a,b)=>a.place-b.place)[0];
    banner.textContent=top.place===1?`👑 NEW ALL-TIME RECORD! ${top.name} · ${money(top.worth)}`:
      `✨ LEGENDARY TOP THREE! ${final.newRecords.map(x=>x.name+' #'+x.place).join(' · ')}`;
  }
}
function hideAwards(){awardsHidden=true;el('awardsLayer').hidden=true;el('awardsLayer').classList.remove('celebrating');}
function showAwards(celebrate=false){if(state?.stage!=='finished'||!state.finalResults)return;awardsHidden=false;renderAwards();el('awardsLayer').hidden=false;if(celebrate)makeCelebration();}
function syncAwardsState(){
  if(state?.stage==='finished'&&state.finalResults){
    if(awardsSeenMatchId!==state.finalResults.matchId){awardsSeenMatchId=state.finalResults.matchId;showAwards(true);}
    else if(!awardsHidden)renderAwards();
  }else{awardsSeenMatchId=null;awardsHidden=false;el('awardsLayer').hidden=true;}
}
async function start(){
  el('createTab').onclick=()=>switchTab('create');
  el('joinTab').onclick=()=>switchTab('join');
  el('createForm').onsubmit=e=>{e.preventDefault();joinOrCreate('create',{name:el('createName').value,capacity:Number(el('capacity').value),rounds:Number(el('rounds').value),ranked:el('rankedMatch').checked});};
  el('joinForm').onsubmit=e=>{e.preventDefault();joinOrCreate('join',{code:el('joinCode').value,name:el('joinName').value});};
  el('startButton').onclick=()=>runAction('start');
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
  el('focusButton').onclick=()=>setBoardFocus(!document.body.classList.contains('board-focus'));
  el('headerChatButton').onclick=()=>openChat();
  el('headerWorldsButton').onclick=()=>openWorlds();
  el('returnLiveBoard').onclick=()=>{if(boardReady)el('boardFrame').contentWindow?.postMessage({type:'MINI_RETURN_BOARD'},location.origin);};
  el('compactRoll').onclick=()=>{if(state?.phase==='end')el('endButton').click();else el('rollButton').click();};
  el('myPropertiesButton').onclick=()=>openMyProperties();
  el('focusPropertiesButton').onclick=()=>openMyProperties();
  el('propertiesClose').onclick=()=>closeMyProperties();
  el('propertiesLayer').onclick=e=>{if(e.target===el('propertiesLayer'))closeMyProperties();};
  el('legendaryButton').onclick=()=>openLegendary();
  el('awardsHallButton').onclick=()=>openLegendary();
  el('legendaryClose').onclick=()=>closeLegendary();
  el('legendaryLayer').onclick=e=>{if(e.target===el('legendaryLayer'))closeLegendary();};
  el('legendaryLayer').querySelectorAll('[data-legendary-rounds]').forEach(btn=>btn.onclick=()=>{legendaryRounds=Number(btn.dataset.legendaryRounds);renderLegendary();});
  el('viewFinalBoardButton').onclick=()=>hideAwards();
  el('showResultsButton').onclick=()=>showAwards(false);
  el('replayAwardsButton').onclick=()=>showAwards(true);
  el('rankedRematchButton').onclick=()=>{if(confirm('Start a NEW RANKED match with the same players and room code? This resets the board and creates a new record-eligible game.'))runAction('new-ranked-match');};
  el('hintsToggleButton').onclick=()=>setHintsEnabled(!hintsEnabled);
  el('wifiSoundButton').onclick=()=>{if(boardReady)el('boardFrame').contentWindow?.postMessage({type:'MINI_WIFI_TOGGLE_SOUND'},location.origin);};
  el('copyCode').onclick=()=>copy(state?.code||'',null);
  el('copyLink').onclick=()=>copy(invite(),el('inviteLink'));
  el('forgetButton').onclick=()=>{
    if(!confirm('Forget this player seat on this browser? It will remain reserved in the room, and you may be unable to rejoin after forgetting its secret key.'))return;
    if(feed)feed.close();auth=null;state=null;propertiesOpen=false;legendaryOpen=false;awardsHidden=false;awardsSeenMatchId=null;el('propertiesLayer').hidden=true;el('legendaryLayer').hidden=true;el('awardsLayer').hidden=true;chatSelected=false;chatReadId=null;boardReady=false;artRequested.clear();artCache.clear();animating=false;diceSpinning=false;clearTimeout(animationSafetyTimer);localStorage.removeItem(STORE_KEY);el('boardFrame').removeAttribute('src');setBoardFocus(false);render();
  };
  el('boardFrame').addEventListener('load',()=>{
    boardReady=true;syncBoard();syncChat();sendBoardMode();sendHintsState();
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
  });
  window.addEventListener('resize',fitMobileBoard);
  window.addEventListener('resize',sendBoardViewport);
  window.addEventListener('scroll',sendBoardViewport,{passive:true});
  window.addEventListener('message',event=>{
    if(event.origin!==location.origin||event.source!==el('boardFrame').contentWindow)return;
    if(event.data?.type==='MINI_CHAT_SEND')sendChatMessage(event.data.text);
    if(event.data?.type==='MINI_CHAT_ATTACHMENT')sendChatAttachment(event.data);
    if(event.data?.type==='MINI_CHAT_TAB'){
      chatSelected=Boolean(event.data.open);
      if(chatSelected){const messages=state?.chat||[];chatReadId=messages.length?messages[messages.length-1].id:chatReadId;}
      const badge=el('chatBadge');badge.hidden=chatSelected||!(state?.chat?.length) || state.chat[state.chat.length-1].id===chatReadId;
    }
    if(event.data?.type==='MINI_WIFI_SOUND_STATE'){soundForAwards=Boolean(event.data.enabled);el('wifiSoundButton').textContent=event.data.enabled?'Sound on':'Sound off';}
    if(event.data?.type==='MINI_BOARD_READY'){boardReady=true;artRequested.clear();syncBoard();syncChat();sendBoardMode();sendHintsState();render();}
    if(event.data?.type==='MINI_BOARD_VIEW'){
      const world=event.data.world;
      if(Number.isInteger(world)&&world>=0&&world<3){boardView={world,preview:event.data.preview===true};if(state)renderFloatingPanel(state.players[state.turn]?.id===state.youId,state.players[state.turn]);}
    }
    if(event.data?.type==='MINI_ANIMATION_START'){animating=true;render();}
    if(event.data?.type==='MINI_DICE_SETTLED'){diceSpinning=false;render();}
    if(event.data?.type==='MINI_ANIMATION_DONE'){clearTimeout(animationSafetyTimer);if(animating||diceSpinning){animating=false;diceSpinning=false;render();}}
    if(event.data?.type==='MINI_DEED_ART'){
      const {id,imageData}=event.data;
      if(typeof id==='string' && typeof imageData==='string' && imageData.startsWith('data:image/') && imageData.length<2000000){artCache.set(id,imageData);render();}
    }
    if(event.data?.type==='MINI_REQUEST_ROLL'){
      if(state?.stage==='playing'&&state?.players[state.turn]?.id===state.youId&&state?.phase==='roll')runAction('roll');
    }
  });
  const modalObserver=new MutationObserver(updateFloatingPanel);
  for(const id of ['purchaseLayer','propertiesLayer','foreclosureLayer','legendaryLayer','awardsLayer'])modalObserver.observe(el(id),{attributes:true,attributeFilter:['hidden']});
  try{networkInfo=await fetch('/api/network').then(r=>r.json());gameDeeds=Object.fromEntries((networkInfo.deeds||[]).map(d=>[d.id,d]));}catch{}
  const invitation=new URLSearchParams(location.search).get('room');
  if(invitation){switchTab('join');el('joinCode').value=invitation.toUpperCase();}
  try{
    const saved=JSON.parse(localStorage.getItem(STORE_KEY)||'null');
    if(saved?.code&&saved?.token){const result=await api('resume',saved);saveAuth(result);return;}
  }catch{localStorage.removeItem(STORE_KEY);}
  updateHintsToggle();
  render();
}
start();
