'use strict';
// This mockup reads the graphics-review board. It never creates a room or sends
// game actions. The native renderer supplies the same 12-sided die artwork.
(() => {
  const frame=document.getElementById('previewBoard');
  const panel=document.getElementById('turnPanel');
  const handle=document.getElementById('panelHandle');
  const body=document.getElementById('panelBody');
  const collapseButton=document.getElementById('collapsePanel');
  const rollButton=document.getElementById('panelRoll');
  const compactRoll=document.getElementById('compactRoll');
  const nextButton=document.getElementById('panelEndTurn');
  const keepVisible=document.getElementById('keepPanelVisible');
  const canvas=document.getElementById('panelDie');
  const status=document.getElementById('panelRollStatus');
  const mobile=window.matchMedia('(max-width: 700px)');
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const worldNames=['Richmond Hill','The Communities','Coastal Georgia'];
  const players=[
    {name:'Dell PC',color:'#ed8573'},
    {name:'Christopher Notte',color:'#78b7ed'},
    {name:'Alexandria Jackson',color:'#bca2e6'},
    {name:'William Montgomery',color:'#e6c76b'}
  ];
  const storageKey='miniopoly-turn-panel-preview-v1';
  let saved=null;
  try { saved=JSON.parse(localStorage.getItem(storageKey)); } catch {}
  if(!saved||typeof saved!=='object')saved={};
  let world=0,seats=2,activeSeat=1,round=3,rollValue=8,rolling=false;
  let collapsed=typeof saved.collapsed==='boolean'?saved.collapsed:mobile.matches;
  let dock=saved.dock==='top'?'top':'bottom';
  let position={x:12,y:12},drag=null,idleTimer=null,boardObserver=null,sizeObserver=null;
  let ready=false;
  keepVisible.checked=saved.keepVisible===true;

  function announce(text){document.getElementById('previewAnnouncement').textContent=text;}
  function limits(){return {x:Math.max(12,document.documentElement.clientWidth-panel.offsetWidth-12),y:Math.max(12,window.innerHeight-panel.offsetHeight-12)};}
  function place(x,y){
    const max=limits();
    position={x:Math.round(Math.max(12,Math.min(max.x,x))),y:Math.round(Math.max(12,Math.min(max.y,y)))};
    panel.style.left=position.x+'px';panel.style.top=position.y+'px';
  }
  function snapMobile(){
    const max=limits();
    place((document.documentElement.clientWidth-panel.offsetWidth)/2,dock==='top'?12:max.y);
    document.getElementById('dockPanel').textContent=dock==='top'?'Move to bottom ↓':'Move to top ↑';
    document.getElementById('moveHelp').textContent='Drag to the top or bottom · Tap − to collapse';
  }
  function persist(){
    const max=limits();
    const next={collapsed,dock,keepVisible:keepVisible.checked,x:position.x/Math.max(1,max.x),y:position.y/Math.max(1,max.y)};
    // Phone docking should not replace a desktop position saved earlier.
    if(mobile.matches){next.x=saved.x;next.y=saved.y;}
    try {localStorage.setItem(storageKey,JSON.stringify(next));} catch {}
    saved=next;
  }
  function defaultPosition(){
    if(mobile.matches){snapMobile();return;}
    const rect=document.getElementById('previewStage').getBoundingClientRect();
    place(rect.right-panel.offsetWidth-12,rect.top+2);
  }
  function restorePosition(){
    if(mobile.matches){snapMobile();return;}
    if(Number.isFinite(saved.x)&&Number.isFinite(saved.y)){
      const max=limits();place(max.x*saved.x,max.y*saved.y);
    } else defaultPosition();
    document.getElementById('moveHelp').textContent='Drag the handle · Arrow keys move it too';
  }
  function wake(){
    panel.classList.remove('is-idle');
    clearTimeout(idleTimer);
    if(!ready||keepVisible.checked||rolling||drag||document.body.classList.contains('has-property-open'))return;
    idleTimer=setTimeout(()=>{
      if(!keepVisible.checked&&!rolling&&!drag&&!panel.querySelector(':focus-visible'))panel.classList.add('is-idle');
    },5000);
  }
  function refreshCollapse(){
    panel.classList.toggle('is-collapsed',collapsed);
    body.hidden=collapsed;
    compactRoll.hidden=!collapsed;
    collapseButton.setAttribute('aria-expanded',String(!collapsed));
    collapseButton.setAttribute('aria-label',collapsed?'Expand turn panel':'Collapse turn panel');
    collapseButton.firstElementChild.textContent=collapsed?'+':'−';
    updateTitle();
  }
  function updateTitle(){
    document.getElementById('panelTitle').textContent=collapsed?(activeSeat===1?'Your turn':players[activeSeat].name+"’s turn"):'Turn panel';
  }
  function renderPlayers(){
    const list=document.getElementById('panelPlayers');list.replaceChildren();
    for(let i=0;i<seats;i++){
      const player=players[i],row=document.createElement('li');
      row.className='panel-player'+(i===activeSeat?' is-active':'');row.style.setProperty('--seat-color',player.color);
      if(i===activeSeat)row.setAttribute('aria-current','true');
      const seat=document.createElement('span');seat.className='panel-seat';seat.textContent=String(i+1);
      const details=document.createElement('div');
      const name=document.createElement('div');name.className='panel-player-name';name.textContent=player.name;
      const detail=document.createElement('div');detail.className='panel-player-detail';
      if(i===1){const you=document.createElement('span');you.className='panel-you';you.textContent='YOU';detail.append(you);}
      const turn=document.createElement('span');turn.textContent=i===activeSeat?'Taking a turn':'Ready to play';detail.append(turn);
      details.append(name,detail);row.append(seat,details);list.append(row);
    }
    document.getElementById('panelPlayerCount').textContent=seats+' at the table';
    document.getElementById('panelTurnLabel').textContent=activeSeat===1?'Your turn, Christopher':players[activeSeat].name+"’s turn";
    document.getElementById('panelRound').replaceChildren(document.createTextNode(round+' '));
    const total=document.createElement('small');total.textContent='/ 20';document.getElementById('panelRound').append(total);
    updateTitle();
  }
  function paintDie(progress=null){
    const paint=frame.contentWindow?.mini512PaintDie;
    if(typeof paint==='function')paint(canvas,rollValue,progress);
  }
  function rollSample(){
    if(rolling||!ready)return;
    rolling=true;wake();
    rollButton.disabled=compactRoll.disabled=nextButton.disabled=true;
    status.textContent='Rolling the sample die…';
    rollValue=1+Math.floor(Math.random()*12);
    const started=performance.now(),duration=reducedMotion.matches?0:1100;
    function tick(now){
      const progress=duration?Math.min(1,(now-started)/duration):1;
      paintDie(progress<1?progress:null);
      if(progress<1){requestAnimationFrame(tick);return;}
      rolling=false;rollButton.disabled=compactRoll.disabled=nextButton.disabled=false;
      status.textContent='Sample roll: '+rollValue+'. The board stays in place.';
      announce('Sample roll '+rollValue);wake();
    }
    requestAnimationFrame(tick);
  }
  function fitBoard(){
    if(!mobile.matches){frame.style.removeProperty('height');return;}
    const content=frame.contentDocument?.querySelector('.app');
    if(content)frame.style.height=Math.ceil(content.getBoundingClientRect().height+4)+'px';
  }
  function selectWorld(index){
    world=index;
    document.getElementById('previewWorldName').textContent=worldNames[index];
    document.getElementById('previewWorldNumber').textContent='WORLD '+(index+1)+' OF 3';
    for(const button of document.querySelectorAll('[data-preview-world]'))button.setAttribute('aria-pressed',String(Number(button.dataset.previewWorld)===index));
    frame.contentWindow?.postMessage({type:'MINI_REVIEW_WORLD',world:index},location.origin);
  }
  function attachBoard(){
    const doc=frame.contentDocument;
    if(!doc?.querySelector('#board'))return;
    doc.documentElement.classList.add('turn-panel-board');
    if(!doc.getElementById('turnPanelBoardStyle')){
      const style=document.createElement('link');style.id='turnPanelBoardStyle';style.rel='stylesheet';style.href='/turn-panel-board.css';
      style.addEventListener('load',fitBoard);doc.head.append(style);
    }
    ready=true;panel.hidden=false;
    paintDie();refreshCollapse();renderPlayers();restorePosition();wake();selectWorld(world);
    sizeObserver?.disconnect();
    sizeObserver=new ResizeObserver(fitBoard);sizeObserver.observe(doc.querySelector('.app'));
    boardObserver?.disconnect();
    const overlay=doc.getElementById('overlay');
    boardObserver=new MutationObserver(()=>{
      const open=!overlay.classList.contains('hidden');
      document.body.classList.toggle('has-property-open',open);
      if(open&&panel.contains(document.activeElement))document.activeElement.blur();
      wake();
    });
    boardObserver.observe(overlay,{attributes:true,attributeFilter:['class']});
    fitBoard();
  }

  panel.addEventListener('pointerenter',wake);
  panel.addEventListener('pointermove',wake);
  panel.addEventListener('pointerdown',wake);
  panel.addEventListener('focusin',wake);
  panel.addEventListener('focusout',()=>setTimeout(wake,0));
  panel.addEventListener('wheel',wake,{passive:true});
  handle.addEventListener('pointerdown',event=>{
    if(event.button!==0)return;
    drag={id:event.pointerId,startX:event.clientX,startY:event.clientY,x:position.x,y:position.y};
    handle.setPointerCapture(event.pointerId);panel.classList.add('is-dragging');wake();
  });
  handle.addEventListener('pointermove',event=>{
    if(!drag||event.pointerId!==drag.id)return;
    place(drag.x+event.clientX-drag.startX,drag.y+event.clientY-drag.startY);
  });
  function endDrag(event){
    if(!drag||event.pointerId!==drag.id)return;
    drag=null;panel.classList.remove('is-dragging');
    if(handle.hasPointerCapture(event.pointerId))handle.releasePointerCapture(event.pointerId);
    if(mobile.matches){dock=position.y+panel.offsetHeight/2<window.innerHeight/2?'top':'bottom';snapMobile();}
    persist();wake();
  }
  handle.addEventListener('pointerup',endDrag);handle.addEventListener('pointercancel',endDrag);
  handle.addEventListener('lostpointercapture',endDrag);
  handle.addEventListener('keydown',event=>{
    const delta={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[event.key];
    if(!delta)return;
    event.preventDefault();
    if(mobile.matches){if(delta[1]){dock=delta[1]<0?'top':'bottom';snapMobile();}}
    else {const step=event.shiftKey?40:10;place(position.x+delta[0]*step,position.y+delta[1]*step);}
    persist();wake();
  });
  collapseButton.addEventListener('click',()=>{
    collapsed=!collapsed;refreshCollapse();
    if(mobile.matches)snapMobile();else place(position.x,position.y);
    persist();wake();
  });
  keepVisible.addEventListener('change',()=>{persist();wake();});
  document.getElementById('dockPanel').addEventListener('click',()=>{dock=dock==='top'?'bottom':'top';snapMobile();persist();wake();});
  document.getElementById('resetPanel').addEventListener('click',()=>{
    saved={};collapsed=mobile.matches;dock='bottom';keepVisible.checked=false;
    refreshCollapse();defaultPosition();persist();wake();announce('Turn panel reset.');
  });
  rollButton.addEventListener('click',rollSample);compactRoll.addEventListener('click',rollSample);
  nextButton.addEventListener('click',()=>{
    activeSeat=(activeSeat+1)%seats;
    if(activeSeat===0)round=round>=20?1:round+1;
    renderPlayers();status.textContent=activeSeat===1?'Your turn. The panel is fully visible again.':'Example turn for '+players[activeSeat].name+'.';
    if(mobile.matches)snapMobile();else place(position.x,position.y);
    wake();announce(activeSeat===1?'Your turn':players[activeSeat].name+"’s turn");
  });
  document.getElementById('previewSeats').addEventListener('change',event=>{
    seats=Number(event.target.value);activeSeat=Math.min(activeSeat,seats-1);renderPlayers();
    if(mobile.matches)snapMobile();else place(position.x,position.y);
    wake();
  });
  for(const button of document.querySelectorAll('[data-preview-world]'))button.addEventListener('click',()=>selectWorld(Number(button.dataset.previewWorld)));
  frame.addEventListener('load',attachBoard);
  window.addEventListener('message',event=>{
    if(event.origin!==location.origin||event.source!==frame.contentWindow)return;
    if(event.data?.type==='MINI_REVIEW_READY'&&!ready)attachBoard();
  });
  window.addEventListener('resize',()=>{if(!ready)return;restorePosition();fitBoard();});
  window.visualViewport?.addEventListener('resize',()=>{if(!ready)return;if(mobile.matches)snapMobile();else place(position.x,position.y);});
  // The downloadable preview writes an embedded board into the blank frame.
  if(frame.contentDocument?.querySelector('html.graphics-review'))attachBoard();
})();
