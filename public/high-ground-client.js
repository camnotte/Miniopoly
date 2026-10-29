(function(){
 'use strict';
 const $=id=>document.getElementById(id),rules=window.HighGroundRules,avatars=window.MiniopolyAvatars;
 const seatKey='miniopoly_high_ground_seat_v1',hintsKey='miniopoly_wifi_help_hints_v1';
 let auth=null,room=null,loading=false,world=0,noticeTimer,helperMin=false,polled=false;
 const colors=['#df916e','#75b6dc','#a5b870','#c098db'];
 const money=n=>'$'+Number(n).toLocaleString();
 const node=(tag,text,className)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(className)n.className=className;return n;};
 function button(text,fn,disabled=false){const b=node('button',text);b.type='button';b.disabled=disabled;b.onclick=fn;return b;}
 function notice(text){clearTimeout(noticeTimer);$('status').textContent=text;noticeTimer=setTimeout(()=>$('status').textContent='',7000);}
 function avatar(p){const n=node('span');n.innerHTML=avatars.html(p.avatar);return n.firstElementChild;}
 function active(){return room?.stage==='playing';}
 function mine(){return room?.players[room.you];}
 function owns(id){return room.owned[id]===room.you&&!room.lost.includes(id);}
 function ownProperties(){return room.catalog.filter(d=>owns(d.id));}
 function usable(){return active()&&!mine().out&&room.turn===room.you&&!room.resolvingWave&&!mine().awaitingEvac;}
 function scrollToPanel(id){const n=$(id);n.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});n.classList.remove('flash');void n.offsetWidth;n.classList.add('flash');n.setAttribute('tabindex','-1');n.focus({preventScroll:true});}
 async function request(kind,extra={},quiet=false){
  if(loading&&!quiet)return; if(!quiet){loading=true;lock();}
  try{
   let commandRevision=room?.revision;
   // Refresh before a write so an unrelated player's choice does not reject a click.
   // Never replay a write after a network failure: that could repeat a purchase.
   if(room&&!['create','join','resume'].includes(kind)){
    const check=await fetch('/api/high-ground',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({...auth,kind:'resume'})}),data=await check.json();
    if(!check.ok)throw Error(data.error||'Unable to refresh the room.');
    const latest=data.state,a=room.players[room.you],b=latest.players[latest.you];
    if(latest.revision!==room.revision&&(latest.stage!==room.stage||latest.round!==room.round||latest.turn!==room.turn||a.refuge!==b.refuge||a.height!==b.height||a.strength!==b.strength||a.built!==b.built||a.rolled!==b.rolled)){
     room=latest;window.hgState=room;render();throw Error('Your situation changed. Review the updated controls and try again.');
    }
    commandRevision=latest.revision;
   }
   const response=await fetch('/api/high-ground',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({...auth,kind,...(room?{revision:commandRevision}:{}),...extra})});
   const data=await response.json();if(!response.ok){if(response.status===409)setTimeout(poll,0);throw Error(data.error||'Unable to reach the prototype host.');}
   if(quiet&&(!auth||data.code!==auth.code))return;
   if(['create','join','resume'].includes(kind)){auth={code:data.code,token:data.token};localStorage.setItem(seatKey,JSON.stringify(auth));}
   if(!room||data.state.code!==room.code||data.state.revision>=room.revision){const changed=!room||room.revision!==data.state.revision||room.code!==data.state.code;room=data.state;window.hgState=room;if(changed||!quiet)render();}
   return data;
  }catch(e){if(!quiet)notice(e.message);else if(!polled)notice('Connection lost. Retrying the prototype host…');polled=true;}
  finally{if(!quiet){loading=false;lock();}}
 }
 function lock(){document.querySelectorAll('[data-busy]').forEach(b=>{b.disabled=loading||b.dataset.disabled==='true';});}
 function busyButton(b,disabled){b.dataset.busy='true';b.dataset.disabled=String(disabled);b.disabled=loading||disabled;return b;}
 async function poll(){if(!auth||loading)return;await request('resume',{},true);}
 function render(){
  if(!room)return;const p=mine();$('entry').hidden=true;$('game').hidden=false;$('lobby').hidden=room.stage!=='lobby';$('play').hidden=room.stage==='lobby';$('results').hidden=room.stage!=='finished';
  $('roomLabel').textContent='HIGH GROUND · ROOM '+room.code+(room.testing?' · HOST TESTING':'');
  $('phaseTitle').textContent=room.stage==='lobby'?'Gather your crew':room.stage==='finished'?'The storm has passed':room.resolvingWave?'Evacuation decisions':room.wave?'Storm · Wave '+room.wave+' of 5':'Building · Round '+room.round+' of '+room.buildingRounds;
  $('lobbyPlayers').replaceChildren(...room.players.map(q=>{const n=node('p',q.name+(q.bot?' · Practice bot':''));n.prepend(avatar(q));return n;}));
  $('start').hidden=room.you!==0;$('start').disabled=room.players.length<2||loading;
  if(room.stage==='lobby')return;
  renderPlayers();renderForecast();renderScene();renderActions();renderProperties();renderTrades();renderAdvisor();
  $('activity').replaceChildren(...room.log.slice(0,25).map(text=>node('li',text)));
  $('developer').hidden=room.you!==0||room.stage!=='playing';
  if(room.stage==='finished'){
   $('winner').textContent=room.winners.map(i=>room.players[i].name).join(' & ')+(room.winners.length>1?' share victory!':' wins!');
   $('standings').replaceChildren(...room.players.map((q,i)=>node('div',(room.winners.includes(i)?'♛ ':'')+q.name+' · Height '+q.height+' · Supports '+q.strength+'/'+q.maxStrength+(q.out?' · Eliminated in wave '+q.outWave:' · Survived'),'standing')));
  }
  lock();
 }
 function renderPlayers(){
  $('players').replaceChildren(...room.players.map((p,i)=>{const n=node('div',undefined,'player'+(room.turn===i&&active()?' current':'')+(p.out?' out':''));n.append(avatar(p));const copy=node('div');copy.append(node('strong',p.name+(i===room.you?' · You':'')),node('small',p.out?'REFUGE LOST':p.awaitingEvac?'EVACUATE NOW':room.turn===i&&active()?'CURRENT TURN':p.bot?'PRACTICE BOT':'WAITING'));copy.append(node('span',money(p.cash)+' · '+room.catalog.filter(d=>room.owned[d.id]===i&&!room.lost.includes(d.id)).length+' deeds','stats'),node('small','Height '+p.height+' · Supports '+p.strength+'/'+p.maxStrength));n.append(copy);return n;}));
 }
 function renderForecast(){
  const f=room.forecast,p=mine();$('forecastTitle').textContent=f?'Water '+f.water+' · Impact '+f.force:'Storm complete';
  $('forecastText').textContent=f?'Wave '+f.number+' of 5'+(f.target?' · Supporting property threatened: '+room.catalog.find(d=>d.id===f.target).name:'. No supporting property is targeted.'):'Compare the final refuges below.';
  const risk=rules.risk(p,f);$('forecastRisk').textContent=p.out?'Our refuge has been lost.':p.awaitingEvac?'Evacuate to another owned property.':p.refuge?risk.text:'Choose a refuge to begin preparing.';$('forecastRisk').classList.toggle('danger',!risk.safe||p.awaitingEvac);
  $('waveTiming').textContent=room.wave?'Next wave strikes after every survivor finishes this round.':'First wave strikes after everyone completes building round '+room.buildingRounds+'.';
 }
 function renderScene(){
  const p=mine(),d=room.catalog.find(d=>d.id===p.refuge),water=room.wave?rules.waves[Math.min(4,room.wave-1)].water:0,wy=330-water*25,py=330-p.height*25,fy=330-(room.forecast?.water||water)*25;
  $('refugeName').textContent=d?.name||(p.awaitingEvac?'Choose an evacuation site':'Choose your refuge');$('refugeWorld').textContent=d?room.worlds[d.board].name:'YOUR COMMUNITY';$('development').textContent=rules.title(p.height);$('heightReadout').textContent='↑ HEIGHT '+p.height+' / 6';$('strengthReadout').textContent='SUPPORTS '+p.strength+' / '+p.maxStrength;
  const support=p.strength<=1?'#b3694f':p.strength<=2?'#ddc582':'#e8e5c7',development=window.MiniopolyDevelopment.forHeight(p.height);
  const houses=[-106,0,106].map(x=>'<g transform="translate('+(320+x-48)+','+(py-78)+')">'+window.MiniopolyDevelopment.art(development).replace('<svg ','<svg width="96" height="86" ')+'</g>').join('');
  const pillars=[190,270,370,450].map(x=>`<path d="M${x} ${py+15}V368" stroke="${support}" stroke-width="${8+p.maxStrength*2}"/><path d="M${x-16} ${py+30}l32 45-32 45 32 45" stroke="#446f69" fill="none" stroke-width="3" opacity=".7"/>`).join('');
  const lines=[wy,wy+25,wy+55,wy+95].map((y,i)=>`<path class="ocean-line" d="M-40 ${y} Q20 ${y-13} 80 ${y}T200 ${y}T320 ${y}T440 ${y}T560 ${y}T700 ${y}" fill="none" stroke="${i?'#9be2de':'#d8f5e7'}" stroke-width="${i?2:4}" opacity="${i?.35:.85}"/>`).join('');
  $('refugeArt').innerHTML=`<svg viewBox="0 0 640 400" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet"><defs><linearGradient id="sea" x2="0" y2="1"><stop stop-color="#239aac" stop-opacity=".55"/><stop offset="1" stop-color="#064260"/></linearGradient></defs><g fill="#fff" opacity=".35"><ellipse cx="80" cy="95" rx="70" ry="14"/><ellipse cx="550" cy="120" rx="90" ry="12"/></g><path d="M0 340 120 325 220 350 330 330 480 344 640 325V400H0Z" fill="#29686b"/>${pillars}<rect x="150" y="${py+6}" width="340" height="16" rx="5" fill="#637f68" stroke="#385c55" stroke-width="3"/><path d="M150 ${py+6}h340" stroke="#f1e1af" stroke-width="6"/>${houses}<path d="M0 ${wy}Q40 ${wy-8}80 ${wy}T240 ${wy}T400 ${wy}T560 ${wy}T720 ${wy}V400H0Z" fill="url(#sea)"/>${lines}${room.forecast?`<path d="M35 ${fy}H605" stroke="#ffdd97" stroke-width="2" stroke-dasharray="6 7" opacity=".85"/><rect x="35" y="${fy-21}" width="165" height="18" rx="5" fill="#fff4d2" opacity=".9"/><text x="42" y="${fy-8}" fill="#244d55" font-size="11" font-family="sans-serif" font-weight="bold">NEXT WATER LEVEL ${room.forecast.water}</text>`:''}</svg>`;
  const svg=$('refugeArt').querySelector('svg'),scale=Math.min(svg.clientWidth/640,svg.clientHeight/400),waterTop=(svg.clientHeight-400*scale)/2+wy*scale;
  $('scene').style.setProperty('--water-top',waterTop+'px');
 }
 function renderActions(){
  const p=mine(),ok=usable();$('turnStatus').textContent=p.out?'Eliminated':p.awaitingEvac?'Choose evacuation':p.built?'Construction used this round':room.turn===room.you?'One construction action available':'Available on your turn';
  $('permitLabel').textContent=p.permits?'Use Building Permit · Free construction ('+p.permits+' available)':'No Building Permits remaining';$('usePermit').disabled=!ok||!p.permits||p.built;if(!p.permits)$('usePermit').checked=false;
  $('buildActions').replaceChildren(...['raise','reinforce','repair'].map(kind=>{const unavailable=!ok||!p.refuge||p.built||(kind==='raise'&&p.height>=6)||(kind==='reinforce'&&p.maxStrength>=4)||(kind==='repair'&&p.strength===p.maxStrength);const b=button({raise:'↑ Raise',reinforce:'◇ Reinforce',repair:'⌁ Repair'}[kind],()=>request('build',{construction:kind,permit:$('usePermit').checked}),unavailable);b.id='build-'+kind;b.append(node('small',kind==='raise'?(p.height>=6?'Maximum height reached':'Height '+p.height+' → '+(p.height+1)):kind==='reinforce'?(p.maxStrength>=4?'Fully reinforced':'Capacity '+p.maxStrength+' → '+(p.maxStrength+1)):(p.strength===p.maxStrength?'No repairs needed':'Restore supports to '+p.maxStrength)),node('small',$('usePermit').checked&&p.permits?'Building Permit · FREE':money(rules.cost(p,kind))));return busyButton(b,unavailable||(!$('usePermit').checked&&p.cash<rules.cost(p,kind)));}));
  busyButton($('roll'),!ok||p.rolled);busyButton($('end'),!ok||!p.rolled||!p.refuge);const d=room.catalog.find(d=>d.id===p.board+'-'+p.pos),buyable=ok&&p.rolled&&d&&!Number.isInteger(room.owned[d.id])&&!room.lost.includes(d.id);$('buy').hidden=!buyable;if(d)$('buy').textContent='Buy '+d.name+' · '+money(d.price);busyButton($('buy'),!buyable||(d&&p.cash<d.price));
  $('moveResult').textContent=room.lastMove?room.players[room.lastMove.seat].name+' rolled '+room.lastMove.die+' · '+room.lastMove.message:'Roll to travel through the three worlds. Land on an available property to buy it.';
 }
 function renderProperties(){
  const p=mine();$('income').textContent=money(ownProperties().filter(d=>d.id!==p.refuge).length*60)+' / round';$('propertyHelp').textContent=p.awaitingEvac?'Choose another owned, unsubmerged property for your one evacuation.':!p.refuge?'Choose one owned property as your refuge. This commits its location.':'Your supporting properties earn income and provide a possible evacuation site.';
  $('worldTabs').replaceChildren(...room.worlds.map((w,i)=>{const b=button(w.name,()=>{world=i;renderProperties();});b.setAttribute('aria-pressed',String(world===i));return b;}));
  $('properties').replaceChildren(...room.catalog.filter(d=>d.board===world).map(d=>{const owner=room.owned[d.id],lost=room.lost.includes(d.id),refuge=room.players.some(q=>q.refuge===d.id&&!q.out),n=node('article',undefined,'property'+(lost?' lost':'')+(refuge?' refuge':''));n.append(node('span',lost?'≋':refuge?'⚑':'⌂','property-icon'),node('strong',d.name),node('small',lost?'SUBMERGED · NO RENT':Number.isInteger(owner)?room.players[owner].name+(refuge?' · REFUGE':' · Supporting property'):'Available · '+money(d.price)));
   if(room.forecast?.target===d.id)n.append(node('small','⚠ THREATENED NEXT WAVE'));
   if(owns(d.id)&&active()&&!p.out){if(!p.refuge||p.awaitingEvac)n.append(busyButton(button(p.awaitingEvac?'Evacuate here':'Choose refuge',()=>request('refuge',{property:d.id})),false));else if(p.refuge!==d.id)n.append(busyButton(button('Sell · '+money(Math.floor(d.price*.6)),()=>request('sell',{property:d.id})),!usable()));}return n;}));
 }
 function renderTrades(){
  const p=mine(),count=room.offers.filter(o=>o.to===room.you&&o.status==='pending').length;$('tradeBadge').textContent=count?String(count):'';$('tradeBadge').className=count?'badge':'';
  const previous=$('tradeProperty').value;$('tradeProperty').replaceChildren(...room.catalog.filter(d=>Number.isInteger(room.owned[d.id])&&room.owned[d.id]!==room.you&&!room.players[room.owned[d.id]].out&&room.players[room.owned[d.id]].refuge!==d.id&&!room.lost.includes(d.id)).map(d=>{const o=node('option',d.name+' · '+room.players[room.owned[d.id]].name);o.value=d.id;return o;}));if([...$('tradeProperty').options].some(o=>o.value===previous))$('tradeProperty').value=previous;
  $('tradeAvailability').hidden=!!$('tradeProperty').options.length;$('tradeForm').hidden=!$('tradeProperty').options.length||!active()||p.out;
  busyButton($('sendOffer'),!active()||p.out||!$('tradeProperty').options.length||room.resolvingWave);
  $('offers').replaceChildren(...room.offers.slice().reverse().map(o=>{const n=node('div',undefined,'offer');n.append(node('div',room.players[o.from].name+' offers '+money(o.amount)+' for '+room.catalog.find(d=>d.id===o.property).name+' · '+o.status));if(o.to===room.you&&o.status==='pending'&&active()&&!p.out)n.append(busyButton(button('Accept',()=>request('respond',{offer:o.id,choice:'accept'})),!!room.resolvingWave),busyButton(button('Decline',()=>request('respond',{offer:o.id,choice:'decline'})),!!room.resolvingWave));return n;}));
 }
 function renderAdvisor(){
  const p=mine(),enabled=$('hints').checked;$('advisor').hidden=!enabled;$('showAdvisor').hidden=enabled;$('advisor').classList.toggle('is-minimized',helperMin);$('minimizeAdvisor').setAttribute('aria-expanded',String(!helperMin));$('minimizeAdvisor').textContent=helperMin?'+':'−';
  $('advisorName').textContent=p.name+'’S ADVISOR';$('advisorPortrait').replaceChildren(avatar(p));
  const advice=rules.advice(room,room.you);$('advisorHeadline').textContent=p.awaitingEvac?'We need to evacuate!':p.out?'We’ll rebuild next time.':room.stage==='finished'?'The storm is over.':'Let’s find high ground.';
  if($('advice').textContent!==advice.text)$('advice').textContent=advice.text;
  const labels={refuge:'Choose a refuge',raise:'Review raising',repair:'Review repairs',reinforce:'Review reinforcement',properties:'Review properties',trade:'Open trading',roll:'Roll & travel',forecast:'Review forecast'};
  $('adviceActions').replaceChildren(...advice.actions.map(action=>button(labels[action],()=>{
   if(['raise','repair','reinforce'].includes(action)){if(p.permits)$('usePermit').checked=true;renderActions();scrollToPanel('construction');$('build-'+action).focus({preventScroll:true});}
   else if(action==='roll'){scrollToPanel('construction');$('roll').focus({preventScroll:true});}
   else if(action==='trade')scrollToPanel('trading');else if(action==='forecast')scrollToPanel('forecastPanel');else{const owned=ownProperties();if(owned.length)world=owned[0].board;renderProperties();scrollToPanel('propertiesPanel');}
  })));
 }
 function clearView(){auth=null;room=null;window.hgState=null;$('game').hidden=true;$('entry').hidden=false;$('restore').hidden=!localStorage.getItem(seatKey);}
 avatars.items.forEach(a=>{const o=node('option',a.name);o.value=a.id;$('avatar').append(o);});$('avatar').onchange=()=>$('avatarPreview').replaceChildren(avatar({avatar:$('avatar').value}));$('avatar').onchange();
 $('entryForm').onsubmit=e=>{e.preventDefault();request('create',{name:$('name').value,avatar:$('avatar').value,buildingRounds:Number($('buildingRounds').value)});};
 $('demo').onclick=async()=>{if(!$('name').value)$('name').value='Cam';const result=await request('create',{name:$('name').value,avatar:$('avatar').value,buildingRounds:Number($('buildingRounds').value),demo:true});if(result)await request('start');};
 $('join').onclick=()=>request('join',{name:$('name').value,avatar:$('avatar').value,code:$('joinCode').value});$('start').onclick=()=>request('start');
 $('restore').onclick=()=>{try{auth=JSON.parse(localStorage.getItem(seatKey));request('resume');}catch{notice('No valid prototype seat was found.');}};
 $('roll').onclick=()=>request('roll');$('end').onclick=()=>request('end');$('buy').onclick=()=>request('buy');$('usePermit').onchange=renderActions;
 $('tradeForm').onsubmit=e=>{e.preventDefault();request('trade',{property:$('tradeProperty').value,amount:Number($('tradeAmount').value)});};
 $('advanceRound').onclick=()=>{if(confirm('Advance one round and skip remaining player turns? This may trigger a wave.'))request('test',{control:'round'});};$('setDie').onclick=()=>request('test',{control:'die',value:Number($('testDie').value)});
 $('hints').checked=(localStorage.getItem(hintsKey)??'on')!=='off';$('hints').onchange=()=>{localStorage.setItem(hintsKey,$('hints').checked?'on':'off');if(room&&room.stage!=='lobby')renderAdvisor();};
 $('showAdvisor').onclick=()=>{$('hints').checked=true;$('hints').onchange();};$('minimizeAdvisor').onclick=()=>{helperMin=!helperMin;renderAdvisor();};
 $('copyInvite').onclick=async()=>{const url=new URL(location.href);url.search='';url.searchParams.set('room',room.code);try{await navigator.clipboard.writeText(url.href);notice('Invitation copied. Share it with your friends.');}catch{notice('Share this address and room code '+room.code+': '+url.href);}};
 $('leave').onclick=clearView;$('newGame').onclick=clearView;
 const invitation=new URLSearchParams(location.search).get('room');if(invitation)$('joinCode').value=invitation.slice(0,6);
 $('restore').hidden=!localStorage.getItem(seatKey);if(!invitation&&localStorage.getItem(seatKey))$('restore').click();
 setInterval(()=>{if(!document.hidden)poll();},1200);addEventListener('focus',poll);addEventListener('resize',()=>{if(room&&room.stage!=='lobby')renderScene();});addEventListener('storage',e=>{if(e.key===hintsKey){$('hints').checked=e.newValue!=='off';if(room&&room.stage!=='lobby')renderAdvisor();}});
})();
