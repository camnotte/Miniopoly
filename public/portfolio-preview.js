'use strict';

// Isolated design sample: reads the public deed catalog, never a room or seat.
// The standalone builder embeds that same catalog and all artwork for review.
(() => {
  const $=id=>document.getElementById(id);
  const worlds=['Richmond Hill','The Communities','Coastal Georgia'];
  const colors={Brown:'#987047',Blue:'#4c9ccb',Pink:'#cf7895',Orange:'#d78a3c',Red:'#c85f53',Yellow:'#bea03b',Green:'#489674',Navy:'#4c6188'};
  let players={you:'Christopher Notte',alex:'Alex Morgan',dell:'Dell PC'};
  const liveMode=window.parent!==window&&new URLSearchParams(location.search).get('live')==='1';
  let liveOwned={},liveBank={},liveLost={},liveRentBoost=false,liveUpgradeMultiplier=1,liveTurn=0,livePlayerName='',liveSignature='',detailDeedId=null;
  const sampleOwned={
    '0-1':{owner:'you',level:1},'1-1':{owner:'you',level:1},
    '0-3':{owner:'you'},'1-3':{owner:'you'},'2-1':{owner:'alex'},
    '0-5':{owner:'you'},'1-5':{owner:'you'},
    '0-13':{owner:'you',mortgage:true},'0-2':{owner:'you'},'0-6':{owner:'you'},
    '0-7':{owner:'alex'},'1-7':{owner:'dell'},'2-13':{owner:'alex'},
    '0-9':{owner:'dell'},'1-9':{owner:'dell'},'0-15':{owner:'dell'},
    '2-6':{owner:'alex'},'2-10':{owner:'dell'}
  };
  // At sample turn 12, one foreclosure is open and another opens next turn.
  const sampleBank={'1-11':{availableTurn:12},'2-9':{availableTurn:13}};
  const sampleTurn=12;
  const blobs=new Map();
  let deeds=[],tab='sets',scenario='progress',lastOpener=null,otherSetsOpen=false;
  const own=id=>liveMode?liveOwned[id]||null:scenario==='fresh'?null:sampleOwned[id]||null;
  const bank=id=>liveMode?liveBank[id]||null:scenario==='fresh'?null:sampleBank[id]||null;
  const bankOpen=held=>held?.available??((liveMode?liveTurn:sampleTurn)>=held.availableTurn);
  const bankDescription=held=>held.description||(bankOpen(held)?'Available in the Foreclosure Market.':'Opens in the Foreclosure Market next turn.');
  const lost=id=>!!liveLost[id]||!!own(id)?.lost;
  const mine=id=>!lost(id)&&own(id)?.owner==='you';
  const allGroups=()=>Object.keys(colors).map(color=>{
    const members=deeds.filter(d=>d.color===color),owned=members.filter(d=>mine(d.id)).length;
    return {color,members,owned,missing:members.length-owned,complete:owned===members.length};
  });
  function node(tag,className,text){const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;}
  function asset(src){
    const [base,fragment]=src.split('#'),embedded=window.MINI_PORTFOLIO_ASSETS?.[base];
    if(!embedded)return src;
    if(!blobs.has(base)){
      const bytes=Uint8Array.from(atob(embedded.data),c=>c.charCodeAt(0));
      blobs.set(base,URL.createObjectURL(new Blob([bytes],{type:embedded.mime})));
    }
    return blobs.get(base)+(fragment?'#'+fragment:'');
  }
  function image(src,className=''){const img=node('img',className);img.src=asset(src);img.alt='';img.loading='lazy';return img;}
  function status(deed){
    const record=own(deed.id),held=bank(deed.id);
    if(lost(deed.id))return {kind:'lost',label:'LOST · $0',detail:'Lost to World Collapse. No rent, upgrades, trades or sale value. Landing here is fatal.'};
    if(record?.owner==='you')return {kind:'you',label:'✓ Yours',detail:record.mortgage?'No rent while mortgaged.':'Owned by you.'};
    if(record)return {kind:'opponent',label:'Owned by '+players[record.owner],detail:'This property belongs to '+players[record.owner]+'.'};
    if(held){return {kind:'bank',label:'Bank-held',detail:bankDescription(held)};}
    return {kind:'unowned',label:'Available',detail:'Buy when you land.'};
  }
  function badge(deed){const state=status(deed);return node('span','ownership-badge status-'+state.kind,state.label);}
  function addArtOwnership(art,deed){
    const state=status(deed),held=bank(deed.id);
    const text=state.kind==='lost'?'LOST':state.kind==='you'?'YOURS':state.kind==='opponent'?players[own(deed.id).owner]
      :state.kind==='unowned'||(held&&bankOpen(held))?'Available':'Bank-held';
    art.classList.add('art-status-'+state.kind);
    const banner=node('span','art-owner-badge',text);
    // Card labels and the detail status carry the same ownership information.
    banner.setAttribute('aria-hidden','true');art.append(banner);
  }
  function stars(level,deed){return window.MiniopolyDevelopment.badge(level,deed);}

  function typeArt(deed){
    const el=node('span','type-scene'),svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','0 0 48 48');svg.setAttribute('aria-hidden','true');
    // Small category symbols are portfolio labels, not replacement board artwork.
    const paths=deed.type==='rail'?['M13 31V13Q13 7 24 7T35 13V31Q35 35 31 35H17Q13 35 13 31Z','M13 22H35M24 8V22M17 29H19M29 29H31M18 35L13 42M30 35L35 42M15 39H33']
      :deed.name.includes('Water')?['M24 5Q10 22 10 29A14 14 0 0 0 38 29Q38 22 24 5Z','M17 29Q17 36 24 36']
      :['M27 4L12 27H23L20 44L37 20H26L27 4Z'];
    for(const d of paths){const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',d);svg.append(p);}
    el.append(svg,node('span','',deed.type==='rail'?'RAILROAD':'UTILITY'));return el;
  }
  function rent(deed){
    const record=own(deed.id);
    if(lost(deed.id)||record?.mortgage)return '$0';
    if(record?.rentSuspended)return '$0';
    if(deed.type==='p')return '$'+Math.ceil(deed.base*window.MiniopolyDevelopment.multipliers[window.MiniopolyDevelopment.normalize(record?.level)]*(liveRentBoost?1.5:1));
    if(deed.type==='rail'){
      const count=record?deeds.filter(d=>d.type==='rail'&&own(d.id)?.owner===record.owner&&!own(d.id).mortgage&&!lost(d.id)).length:1;
      return '$'+Math.ceil([0,25,50,100,200][Math.min(4,count)]*(liveRentBoost?1.5:1));
    }
    const count=record?deeds.filter(d=>d.type==='util'&&own(d.id)?.owner===record.owner&&!own(d.id).mortgage&&!lost(d.id)).length:1;
    return (liveRentBoost?(count>=2?'15':'6'):(count>=2?'10':'4'))+'× roll';
  }
  function makeCard(deed){
    const record=own(deed.id),state=status(deed),card=node('button','property-card'+(mine(deed.id)?' is-yours':state.kind==='opponent'?' is-opponent':''));
    card.type='button';card.dataset.deed=deed.id;
    card.setAttribute('aria-label','View '+deed.name+', '+worlds[deed.board]+', '+state.label+(record?.mortgage?', mortgaged':''));
    const art=node('span','card-art'),src=window.MiniopolyVisuals.propertyArt(deed.id);
    art.append(src?image(src):typeArt(deed));
    addArtOwnership(art,deed);
    const pin=node('span','world-pin',String(deed.board+1));pin.setAttribute('aria-hidden','true');art.append(pin);
    const copy=node('span','card-copy');
    copy.append(node('span','card-world',worlds[deed.board]),node('strong','card-name',deed.name));
    if(record?.rentSuspended)copy.append(node('span','availability','Rent paused · Setback'));
    if(record?.mortgage)copy.append(node('span','mortgage-badge','Mortgaged'));
    else if(state.kind==='unowned')copy.append(node('span','availability','Buy when you land'));
    else if(state.kind==='bank')copy.append(node('span','availability',bank(deed.id).shortLabel||(bankOpen(bank(deed.id))?'Foreclosure Market open':'Opens next turn')));
    const bottom=node('span','card-bottom');
    if(deed.type==='p'&&record&&!lost(deed.id))bottom.append(stars(record.level||0,deed));
    else bottom.append(node('span','value','$'+(lost(deed.id)?0:deed.price)+' deed value'));
    const next=node('span','detail-arrow','→');next.setAttribute('aria-hidden','true');bottom.append(next);copy.append(bottom);card.append(art,copy);
    card.addEventListener('click',()=>showDetails(deed,card));return card;
  }
  function setCaption(group){
    if(group.complete)return group.members.some(d=>own(d.id)?.mortgage)?'All deeds are yours. Lift mortgages before upgrading.':'Every deed is yours. This set can be upgraded.';
    if(!group.owned)return 'Collect '+group.members.length+' properties across the worlds to complete this set.';
    const missing=group.members.filter(d=>!mine(d.id));
    if(missing.length===1){const d=missing[0],s=status(d);
      if(s.kind==='lost')return d.name+' is lost to World Collapse. This set cannot be completed.';
      if(s.kind==='opponent')return d.name+' belongs to '+players[own(d.id).owner]+'.';
      if(s.kind==='bank')return d.name+': '+bankDescription(bank(d.id));
      return d.name+' is unowned. Buy it when you land.';
    }
    return 'Still need '+missing.map(d=>d.name).join(' and ')+'.';
  }
  function makeGroup(group){
    const section=node('section','set-group');section.id='set-'+group.color.toLowerCase();section.style.setProperty('--set-color',colors[group.color]);
    const header=node('div','set-heading'),copy=node('div'),title=node('div','set-title'),heading=node('h3','',group.color+' set');heading.tabIndex=-1;
    title.append(node('span','color-dot'),heading);
    if(group.complete)title.append(node('span','set-label complete','✓ COMPLETE'));
    else if(group.missing===1&&group.owned)title.append(node('span','set-label','ONE AWAY'));
    copy.append(title,node('p','set-caption',setCaption(group)));
    const progress=node('div','set-progress'),segments=node('span','progress-segments');
    progress.append(node('strong','',group.owned+' of '+group.members.length+' yours'));
    for(let i=0;i<group.members.length;i++)segments.append(node('i',i<group.owned?'filled':''));
    segments.setAttribute('aria-hidden','true');progress.append(segments);header.append(copy,progress);
    const cards=node('div','set-deeds');for(const d of group.members)cards.append(makeCard(d));
    section.append(header,cards);return section;
  }
  function empty(title,description,canClear=true){
    const el=node('div','empty-state');el.append(node('span','empty-icon','⌂'),node('h3','',title),node('p','',description));
    if(canClear){const reset=node('button','','Clear filters');reset.type='button';reset.addEventListener('click',clearFilters);el.append(reset);}
    return el;
  }
  function renderSummary(groups){
    const owned=deeds.filter(d=>mine(d.id)).length,complete=groups.filter(g=>g.complete).length,near=groups.filter(g=>g.missing===1&&g.owned).length;
    const summary=$('portfolioStats');summary.replaceChildren();
    for(const [count,label,note,cl] of [[owned,'Properties owned','Across all three worlds',''],[complete,'Complete sets','8 color sets in total',''],[near,'One property away','Your next opportunities','near']]){
      const stat=node('div','stat '+cl),text=node('div');text.append(node('span','stat-label',label),node('span','stat-note',note));stat.append(node('strong','stat-value',String(count)),text);summary.append(stat);
    }
    $('mineCount').textContent=String(owned);$('allCount').textContent=String(deeds.length);
  }
  function filtersActive(){return $('worldFilter').value!=='all'||(tab==='sets'?$('setViewFilter').value!=='all':$('propertySearch').value.trim()||$('colorFilter').value!=='all'||(tab==='all'&&$('ownerFilter').value!=='all'));}
  function clearFilters(){for(const id of ['worldFilter','setViewFilter','ownerFilter','colorFilter'])$(id).value='all';$('propertySearch').value='';render();}
  function render(){
    const groups=allGroups(),world=$('worldFilter').value;
    renderSummary(groups);
    $('searchField').hidden=tab==='sets';$('setViewField').hidden=tab!=='sets';$('ownerField').hidden=tab!=='all';$('colorField').hidden=tab==='sets';
    $('clearFilters').hidden=!filtersActive();
    const content=$('portfolioContent');content.replaceChildren();
    $('worldContext').hidden=!(tab==='sets'&&world!=='all');
    $('worldContext').textContent=world==='all'?'':'Sets containing a property in '+worlds[Number(world)]+'. All members stay visible so you can follow the complete set.';
    $('viewFootnote').textContent=tab==='sets'?'Sets span all three worlds. Railroads and utilities appear in My Properties and All Properties.':'Select a property for its owner, rent, upgrade level, and set progress.';
    if(tab==='sets'){
      $('viewTitle').textContent=(liveMode?!deeds.some(d=>mine(d.id)):scenario==='fresh')?'Your collection starts here':'Your next complete set';
      $('viewDescription').textContent=(liveMode?!deeds.some(d=>mine(d.id)):scenario==='fresh')?'Land on an unowned property to start collecting. Select a card to explore.':'Nearly complete sets first. Select any property for details.';
      let visible=groups.filter(g=>world==='all'||g.members.some(d=>String(d.board)===world));
      const view=$('setViewFilter').value;
      if(view==='near')visible=visible.filter(g=>g.missing===1&&g.owned);
      if(view==='complete')visible=visible.filter(g=>g.complete);
      const priority=g=>g.missing===1&&g.owned?0:g.complete?1:g.owned?2:3;
      visible.sort((a,b)=>priority(a)-priority(b)||b.owned-a.owned);
      const unstarted=visible.filter(g=>!g.owned),active=visible.filter(g=>g.owned);
      $('resultCount').textContent=visible.length+' color sets';
      if(!visible.length)content.append(empty('No sets match this view','Try another world or clear the filters to see all color sets.'));
      for(const group of active)content.append(makeGroup(group));
      if(unstarted.length&&active.length){
        const details=node('details','unstarted-sets');details.open=otherSetsOpen;
        const summary=node('summary','','Sets you haven’t started ('+unstarted.length+')');summary.append(node('span','','Explore the other colors'));
        const list=node('div','unstarted-content');for(const g of unstarted)list.append(makeGroup(g));
        details.addEventListener('toggle',()=>{otherSetsOpen=details.open;});details.append(summary,list);content.append(details);
      }else for(const group of unstarted)content.append(makeGroup(group));
    }else{
      $('viewTitle').textContent=tab==='mine'?'Your deeds, all together':'Every deed. Every owner.';
      $('viewDescription').textContent=tab==='mine'?'Your properties, railroads, and utilities. Stars show the current upgrade level.':'Find a missing property, see who owns it, and check its world.';
      const search=$('propertySearch').value.trim().toLocaleLowerCase(),color=$('colorFilter').value,owner=$('ownerFilter').value;
      const visible=deeds.filter(d=>{
        if(tab==='mine'&&!mine(d.id)&&!(lost(d.id)&&own(d.id)?.owner==='you'))return false;
        if(world!=='all'&&String(d.board)!==world)return false;
        if(color!=='all'&&d.color!==color&&d.type!==color)return false;
        if(search&&!d.name.toLocaleLowerCase().includes(search))return false;
        if(tab==='all'&&owner!=='all'){
          if(owner==='opponents')return !!own(d.id)&&!mine(d.id);
          if(owner==='bank')return !!bank(d.id);
          if(owner==='unowned')return !own(d.id)&&!bank(d.id);
          return own(d.id)?.owner===owner;
        }
        return true;
      });
      $('resultCount').textContent=visible.length+' of '+(tab==='mine'?deeds.filter(d=>mine(d.id)).length:deeds.length)+' deeds';
      if(!visible.length){const fresh=tab==='mine'&&(liveMode?!deeds.some(d=>mine(d.id)):scenario==='fresh')&&!filtersActive();content.append(empty(fresh?'Your first deed is waiting':'No properties match',fresh?'Buy an unowned property when you land on it. Your deeds will appear here, with the world, rent, and upgrade stars.':'Try another search, world, owner, or color set.',!fresh));}
      else{const grid=node('div','property-grid');for(const d of visible)grid.append(makeCard(d));content.append(grid);}
    }
    $('portfolioAnnouncement').textContent=(tab==='sets'?'Set Progress':tab==='mine'?'My Properties':'All Properties')+'. '+$('resultCount').textContent+'. '+(liveMode?'Live collection':scenario==='fresh'?'Fresh start sample match':'In-progress sample match')+'.';
  }
  function chooseTab(value,focus=false){
    tab=value;
    for(const button of document.querySelectorAll('[data-tab]')){const selected=button.dataset.tab===tab;button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1;if(selected&&focus)button.focus();}
    $('portfolioPanel').setAttribute('aria-labelledby','tab-'+tab);render();
    const tabs=document.querySelector('.portfolio-tabs');
    if(window.scrollY>tabs.offsetTop)tabs.scrollIntoView({block:'start',behavior:'instant'});
  }
  function showSet(color){
    closeDetails();$('worldFilter').value='all';$('setViewFilter').value='all';chooseTab('sets');
    const target=$('set-'+color.toLowerCase()),details=target?.closest('details');
    if(details){details.open=true;otherSetsOpen=true;}
    const heading=target?.querySelector('h3');heading?.focus({preventScroll:true});target?.scrollIntoView({block:'center',behavior:'instant'});
  }
  function showDetails(deed,opener,refresh=false){
    detailDeedId=deed.id;
    if(!refresh)lastOpener=opener;
    const record=own(deed.id),state=status(deed),content=$('detailContent');content.replaceChildren();
    const layout=node('div','detail-layout'),art=node('div','detail-art'),src=window.MiniopolyVisuals.propertyArt(deed.id);
    art.append(src?image(src):typeArt(deed));
    addArtOwnership(art,deed);
    const body=node('div','detail-body'),world=node('p','detail-world','World '+(deed.board+1)+' · '+worlds[deed.board]),title=node('h2','',deed.name);title.id='detailTitle';
    body.append(world,title);
    const statusBox=node('div','detail-status');statusBox.append(badge(deed));if(record?.mortgage)statusBox.append(node('span','mortgage-badge','Mortgaged'));
    statusBox.append(node('p','',record?.rentSuspended?'Rent collection is paused while the owner is in Setback.':state.kind==='you'&&!record.mortgage?'Part of your collection.':state.detail));body.append(statusBox);
    const numbers=node('dl','detail-numbers');
    for(const [label,value] of [['Deed value','$'+(lost(deed.id)?0:deed.price)],[record?'Current rent':'Starting rent',rent(deed)]]){const cell=node('div');cell.append(node('dt','',label),node('dd','',value));numbers.append(cell);}
    body.append(numbers);
    if(deed.type==='p'&&!lost(deed.id)){
      body.append(node('p','detail-note','Paid upgrade cost: $'+(deed.upgradeCost*liveUpgradeMultiplier)+(liveUpgradeMultiplier===2?' · Tsunami 2×':'')));const level=node('div','detail-level');level.append(node('span','','Development'),stars(record?.level||0,deed));body.append(level);
      const group=allGroups().find(g=>g.color===deed.color),set=node('div','detail-set');
      set.append(node('h3','',deed.color+' set · '+group.owned+' of '+group.members.length+' yours'),node('p','',setCaption(group)));
      const view=node('button','','View the whole set →');view.type='button';view.addEventListener('click',()=>showSet(deed.color));set.append(view);body.append(set);
    }else{
      const family=deeds.filter(d=>d.type===deed.type),count=family.filter(d=>mine(d.id)).length,set=node('div','detail-set');
      set.append(node('h3','',(deed.type==='rail'?'Railroads':'Utilities')+' · '+count+' of '+family.length+' yours'),node('p','',deed.type==='rail'?'Rent increases with the number of unmortgaged railroads held by the same owner.':'Rent is 4× the roll for one utility, or 10× when the same owner holds both unmortgaged utilities.'));body.append(set);
    }
    body.append(node('p','detail-note',liveMode?'Your collection updates live. Purchases and upgrades are managed through your turn actions.':'Sample ownership for layout review. No purchases or game actions happen here.'));
    layout.append(art,body);content.append(layout);if(!refresh){$('deedDetails').showModal();$('closeDetails').focus();if(liveMode)window.parent.postMessage({type:'MINI_PORTFOLIO_DETAIL',open:true},location.origin);}
  }
  function closeDetails(){$('deedDetails').close();detailDeedId=null;}
  for(const button of document.querySelectorAll('[data-tab]')){
    button.addEventListener('click',()=>chooseTab(button.dataset.tab));
    button.addEventListener('keydown',event=>{
      const order=['sets','mine','all'],index=order.indexOf(button.dataset.tab);
      const next=event.key==='ArrowRight'?(index+1)%3:event.key==='ArrowLeft'?(index+2)%3:event.key==='Home'?0:event.key==='End'?2:null;
      if(next!==null){event.preventDefault();chooseTab(order[next],true);}
    });
  }
  for(const id of ['worldFilter','setViewFilter','ownerFilter','colorFilter'])$(id).addEventListener('change',render);
  $('propertySearch').addEventListener('input',render);$('clearFilters').addEventListener('click',clearFilters);
  $('sampleScenario').addEventListener('change',()=>{scenario=$('sampleScenario').value;otherSetsOpen=false;clearFilters();});
  $('closeDetails').addEventListener('click',closeDetails);
  $('deedDetails').addEventListener('close',()=>{const opener=lastOpener?.isConnected?lastOpener:document.querySelector('[data-deed="'+lastOpener?.dataset.deed+'"]');opener?.focus({preventScroll:true});detailDeedId=null;if(liveMode)window.parent.postMessage({type:'MINI_PORTFOLIO_DETAIL',open:false},location.origin);});
  $('deedDetails').addEventListener('click',event=>{if(event.target!==$('deedDetails'))return;const r=$('deedDetails').getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeDetails();});
  async function init(){
    try{
      const catalog=window.MINI_PORTFOLIO_DATA||await fetch('/api/network').then(response=>{if(!response.ok)throw new Error('Catalog unavailable');return response.json();});
      if(!Array.isArray(catalog.deeds)||catalog.deeds.length!==28)throw new Error('Incomplete deed catalog');
      deeds=catalog.deeds;render();
    }catch(error){$('portfolioContent').replaceChildren(empty('The sample could not open','Reload the page, or open the HTML from the downloaded Property Portfolio preview.',false));console.error(error);}
  }
  if(liveMode){
    document.body.classList.add('portfolio-live');
    $('portfolioContent').replaceChildren(node('p','loading-message','Opening your live portfolio…'));
    window.addEventListener('message',event=>{
      if(event.origin!==location.origin||event.source!==window.parent)return;
      if(event.data?.type==='MINI_PORTFOLIO_HIDE'){if($('deedDetails').open)closeDetails();return;}
      if(event.data?.type!=='MINI_PORTFOLIO_STATE')return;
      const {state:next,deeds:catalog}=event.data;
      if(!Array.isArray(next?.players)||!Array.isArray(catalog)||catalog.length!==28)return;
      const me=next.players.find(p=>p.id===next.youId);if(!me)return;
      const signature=JSON.stringify([next.owned,next.foreclosures,next.collapse,next.upgradeCostMultiplier,next.collapseRentBoost,next.players.map(p=>[p.seat,p.name,p.penalty]),next.round,next.turnNumber,next.stage,next.youId]);
      if(signature===liveSignature)return;liveSignature=signature;
      deeds=catalog;liveUpgradeMultiplier=next.upgradeCostMultiplier||1;liveTurn=next.turnNumber||0;livePlayerName=me.name;
      liveLost=next.collapse?.lost||{};liveRentBoost=next.gameMode==='express'&&next.collapse?.wave>0&&next.collapseRentBoost;
      players=Object.fromEntries(next.players.map(p=>[p.seat===me.seat?'you':'player-'+p.seat,p.name]));
      liveOwned=Object.fromEntries(Object.entries(next.owned||{}).map(([id,record])=>[id,{...record,owner:record.owner===me.seat?'you':'player-'+record.owner,rentSuspended:next.players[record.owner]?.penalty>0}]));
      liveBank=Object.fromEntries((next.foreclosures||[]).map(f=>{
        const wait=Math.max(0,f.createdTurn+2-liveTurn),reclaim=f.previousOwner===me.seat&&next.round<f.round+3;
        const available=!wait&&!reclaim&&next.stage==='playing';
        const description=wait?'Bank-held until another player finishes a full turn.':reclaim?'Your repurchase opens in round '+(f.round+3)+'.':next.stage==='playing'?'Available in the Foreclosure Market.':'Bank-held. This match has ended.';
        return [f.deedId,{available,description,shortLabel:wait?'Bank holding':reclaim?'Reclaim round '+(f.round+3):available?'Foreclosure Market open':'Match ended'}];
      }));
      $('portfolioPlayer').replaceChildren(document.createTextNode(me.name+' '),node('span','','· You'));
      const ownerFilter=$('ownerFilter'),selected=ownerFilter.value;
      ownerFilter.replaceChildren();
      for(const [value,label] of [['all','Everyone'],['you','Yours'],['opponents','Opponents'],...next.players.filter(p=>p.seat!==me.seat).map(p=>['player-'+p.seat,p.name]),['unowned','Unowned'],['bank','Bank-held']]){const option=node('option','',label);option.value=value;ownerFilter.append(option);}
      ownerFilter.value=Array.from(ownerFilter.options).some(o=>o.value===selected)?selected:'all';
      const scrollY=window.scrollY,dialogScroll=$('deedDetails').scrollTop,focusedDeed=document.activeElement?.dataset.deed;
      render();window.scrollTo(0,scrollY);
      if(focusedDeed)document.querySelector('[data-deed="'+focusedDeed+'"]')?.focus({preventScroll:true});
      if($('deedDetails').open&&detailDeedId){const deed=deeds.find(d=>d.id===detailDeedId);if(deed){showDetails(deed,null,true);$('deedDetails').scrollTop=dialogScroll;}}
    });
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!$('deedDetails').open){event.preventDefault();window.parent.postMessage({type:'MINI_PORTFOLIO_CLOSE'},location.origin);}});
    window.parent.postMessage({type:'MINI_PORTFOLIO_READY'},location.origin);
  }else init();
})();
