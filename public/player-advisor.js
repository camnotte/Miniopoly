(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MiniopolyPlayerAdvisor=api;})(typeof window==='undefined'?globalThis:window,function(){
 'use strict';
 function advise(room,deeds={},busy=false){
  const me=room?.players?.find(p=>p.id===room.youId);if(!me)return null;
  const own=Object.values(deeds).filter(d=>room.owned?.[d.id]?.owner===me.seat&&!room.collapse?.lost?.[d.id]),homes=own.filter(d=>d.type==='p'),turn=room.turn===me.seat;
  const result=(key,details,actions=[],headline='')=>({key,details,text:headline||({
   lobby:'Complete sets to develop your properties.',moving:'Let’s see where we land.',finished:'The results are ready.',out:'Watch the remaining players.',trade:'A trade offer is waiting for you.',payment:'Resolve this payment first.',protected:'Your protected properties can withstand one wave.',building:'Prepare your properties before the tsunami.',setback:turn?'Choose an escape from Setback.':'Rent is paused while you’re in Setback.',permit:turn&&room.phase==='post'?'Use your permit for one free development.':'Save your permit for a free development on your turn.',develop:'You can afford to develop a property.',funding:'Save cash for your next development.',set:'One more property completes a set.',turn:turn?(room.phase==='roll'?'Your turn—roll the die.':'Review your landing, then end your turn.'):'Review properties or negotiate a trade.'
  })[key],actions:actions.slice(0,1)});
  if(room.stage==='lobby')return result('lobby','I’m your personal advisor, '+me.name+'. I’ll watch our properties, money and the approaching disaster. Build three green Houses or yellow Chalets, then replace all three with one red Estate. Each property can hold up to three Estates, with rents of 20×, 30× and 40× base rent.',[]);
  if(busy)return result('moving','Our game piece is moving. Let’s see where we land before making the next decision.');
  if(room.stage==='finished')return result('finished','The match is complete. Open the results to see how we finished.',['results']);
  if(me.out)return result('out','We are out of this match, but we can still watch the remaining players.',['properties']);
  if(room.trades?.some(o=>o.to===me.seat&&o.status==='pending')&&!(room.gameMode==='countdown'&&own.some(d=>room.collapse?.endangered?.includes(d.id)&&!(room.owned[d.id].level>0&&!room.collapse.shieldSpent?.[d.id]))))return result('trade','Another player has sent us a trade offer. Review the property and cash terms before deciding.',['trade']);
  if(turn&&['rent','bail'].includes(room.phase))return result('payment','We have a payment to resolve. Review the amount and our available cash before making development plans.',['landing','properties']);
  const candidates=homes.filter(d=>!room.owned[d.id].mortgage&&(room.owned[d.id].level||0)<6),permit=me.perks?.includes('building')&&candidates.length;
  const complete=candidates.filter(d=>Object.values(deeds).filter(x=>x.type==='p'&&x.color===d.color).every(x=>room.owned?.[x.id]?.owner===me.seat&&!room.owned[x.id].mortgage&&!room.collapse?.lost?.[x.id]));
  const affordable=complete.filter(d=>me.cash>=d.upgradeCost*(room.upgradeCostMultiplier||1));
  const next=room.collapse?.endangered||[],threats=own.filter(d=>next.includes(d.id));
  if(room.gameMode==='countdown'){
   const vulnerable=threats.filter(d=>!(room.owned[d.id].level>0&&!room.collapse.shieldSpent?.[d.id]));
   const improvable=vulnerable.filter(d=>d.type==='p'&&!room.owned[d.id].mortgage&&!room.collapse.shieldSpent?.[d.id]&&(room.owned[d.id].level||0)<6);
   if(vulnerable.length){
    const timing=room.round<room.rounds?'after building round '+room.rounds:'after everyone completes this round';
    let text='The next tsunami strikes '+timing+'. '+vulnerable.length+' of our properties '+(vulnerable.length===1?'is':'are')+' threatened without usable flood protection. ';
    if(permit&&improvable.length)text+='A Building Permit can develop '+improvable[0].name+' for free, without completing its set.';
    else if(improvable.some(d=>affordable.some(x=>x.id===d.id)))text+='We can afford to develop a threatened property and earn its one-use flood protection.';
    else if(vulnerable.some(d=>room.collapse.shieldSpent?.[d.id]))text+='Spent flood protection cannot be restored by another development. Consider trading while we still can.';
    else text+='Review our sets and possible trades. A normal paid development needs the full unmortgaged color set.';
    return result('danger',text,turn&&room.phase==='post'&&(permit&&improvable.length||improvable.some(d=>affordable.some(x=>x.id===d.id)))?['develop','properties']:['properties','trade'],vulnerable.some(d=>room.collapse.shieldSpent?.[d.id])?'Wave approaching—spent protection cannot be restored.':permit&&improvable.length?'Wave approaching—use your permit to protect '+improvable[0].name+'.':'Wave approaching—review your unprotected properties.');
   }
   if(threats.length)return result('protected','The next wave targets '+threats.length+' of our properties, and their flood protection is ready. Each protected property will cost one development when it protects the property, then remain spent.',['properties']);
   if(!room.collapse?.wave){const left=room.rounds-room.round+1;return result('building','The tsunami begins after everyone completes building round '+room.rounds+'. '+left+' building '+(left===1?'round remains':'rounds remain')+'. '+(permit?'We have a Building Permit: one free development without a full set.':'Acquire properties and complete sets so we can develop them for flood protection.'),turn&&room.phase==='post'&&permit?['develop','properties']:['properties','trade'],'Tsunami in '+left+' building '+(left===1?'round.':'rounds.'));}
  }
  if(me.penalty>0)return result('setback',turn?'We are in Setback. Review the free escape roll, paid escape and saved escape perks before choosing.':'Rent is paused while we are in Setback. We can review our properties while waiting.',['properties']);
  if(permit)return result('permit','We have a Building Permit. We can add a House or Chalet, replace three buildings with an Estate, or add another Estate (up to three), for free without owning the full color set. '+(turn&&room.phase==='post'?'Choose a property in Develop.':turn?'Resolve our roll and landing, then open Develop.':'We can use it on our turn.'),turn&&room.phase==='post'?['develop','properties']:['properties']);
  if(affordable.length)return result('develop','We own a complete unmortgaged set and can afford to develop '+affordable[0].name+'. Compare the new rent and cost before spending.',turn&&room.phase==='post'?['develop','properties']:['properties']);
  if(complete.length)return result('funding','We have a complete set, but we need more cash for its next development. Review the cost, our cash and possible trades before committing.',['properties','trade']);
  const almost=Object.values(deeds).filter(d=>d.type==='p').reduce((map,d)=>{(map[d.color]||=[]).push(d);return map;},{});
  const near=Object.entries(almost).find(([,set])=>set.filter(d=>room.owned?.[d.id]?.owner===me.seat&&!room.collapse?.lost?.[d.id]).length===set.length-1);
  if(near)return result('set','We are one property away from completing the '+near[0]+' set. A trade could unlock paid development into Houses or Chalets and then an Estate.',['trade','properties']);
  return result('turn',turn?(room.phase==='roll'?'It’s our turn. Roll to travel, then review the landing. Properties generate rent; complete color sets unlock paid development.':'Review our landing and available actions before ending the turn.'):'While '+(room.players[room.turn]?.name||'another player')+' takes a turn, we can review our properties and negotiate trades.',['properties','trade']);
 }
 // The status follows the displayed neighborhood, across all property owners.
 function neighborhoodStatus(room,world=0){
  const board=Number.isInteger(world)&&world>=0&&world<3?world:0,prefix=board+'-',disaster=['countdown','express'].includes(room?.gameMode),lost=room?.collapse?.lost||{};
  const homes=Object.entries(room?.owned||{}).filter(([id,o])=>id.startsWith(prefix)&&!o.lost&&!lost[id]);
  return {world:board,visible:disaster&&['playing','finished'].includes(room?.stage),submerged:room?.gameMode==='countdown'?Object.keys(lost).filter(id=>id.startsWith(prefix)&&lost[id]).length:0,protected:room?.gameMode==='countdown'?homes.filter(([id,o])=>o.level>0&&!room.collapse?.shieldSpent?.[id]).length:0,portals:room?.gameMode==='express'?Object.keys(lost).filter(id=>id.startsWith(prefix)&&lost[id]).length:0,owned:homes.length};
 }
 class Display{
  constructor({onAction=()=>{},onEnable=()=>{}}={}){
   this.onAction=onAction;this.onEnable=onEnable;this.collapsed=localStorage.getItem('miniopoly_player_advisor_min_v1')==='true';
   this.element=document.createElement('section');this.element.id='playerAdvisor';this.element.hidden=true;this.element.className='player-advisor';this.element.setAttribute('aria-label','Your personal advisor');
   this.element.innerHTML='<header><strong class="advisor-title">Your advisor</strong><button type="button" class="advisor-minimize" aria-label="Minimize advisor">−</button></header><div class="advisor-body"><span class="advisor-avatar" aria-hidden="true"></span><div class="advisor-speech"><p role="status" aria-live="polite"></p><div class="advisor-actions"></div><details class="advisor-more"><summary>More info</summary><p></p></details></div></div><section class="advisor-neighborhood-status" hidden aria-label="Displayed neighborhood status"><header><span>This neighborhood</span><strong class="advisor-neighborhood-name"></strong></header><div class="advisor-neighborhood-counts"><span class="advisor-status-first"><span class="advisor-water-icon" aria-hidden="true"><svg viewBox="0 0 36 24"><path d="M0 10c7 0 5-9 14-9-5 5-3 10 2 10 7 0 5-9 14-9-5 5-3 10 6 8v14H0Z" fill="#05aabd"/></svg></span><b></b><span class="advisor-status-label"></span></span><span class="advisor-status-second"><svg class="advisor-shield-icon" viewBox="0 0 32 36" aria-hidden="true"><path d="M16 2 29 7v11c0 8-8 13-13 16C11 31 3 26 3 18V7Z" fill="#23764c" stroke="#fff8db" stroke-width="2"/><path d="m9 17 5 5 10-11" fill="none" stroke="#fff8db" stroke-width="3"/></svg><b></b><span class="advisor-status-label"></span></span></div></section><button type="button" class="advisor-enable" hidden>Hints are off · Show my advisor</button>';
   this.toggle=this.element.querySelector('.advisor-minimize');this.toggle.onclick=()=>{this.collapsed=!this.collapsed;localStorage.setItem('miniopoly_player_advisor_min_v1',String(this.collapsed));this.paint();};this.element.querySelector('.advisor-enable').onclick=()=>{this.collapsed=false;localStorage.setItem('miniopoly_player_advisor_min_v1','false');this.onEnable();this.paint();};
  }
  paint(){this.element.classList.toggle('is-collapsed',this.collapsed);this.toggle.textContent=this.collapsed?'+':'−';this.toggle.setAttribute('aria-expanded',String(!this.collapsed));this.toggle.setAttribute('aria-label',this.collapsed?'Expand advisor':'Minimize advisor');}
  update(room,deeds,{enabled=true,busy=false,world=0,neighborhoodName=''}={}){
   const me=room?.players?.find(p=>p.id===room.youId);this.element.hidden=!me;if(!me)return;
   this.element.querySelector('.advisor-title').textContent=me.name+'’s advisor';
   const identity=[me.avatar,me.avatarImage].join(':');if(identity!==this.identity){this.identity=identity;this.element.querySelector('.advisor-avatar').innerHTML=window.MiniopolyAvatars.html(me.avatar,me.seat,me.avatarImage);}
   this.element.querySelector('.advisor-body').hidden=!enabled;this.element.querySelector('.advisor-enable').hidden=enabled;this.toggle.hidden=!enabled;
   const status=neighborhoodStatus(room,world),strip=this.element.querySelector('.advisor-neighborhood-status');strip.hidden=!status.visible;
   strip.dataset.world=String(status.world);strip.querySelector('.advisor-neighborhood-name').textContent=neighborhoodName||['Richmond Hill','The Communities','Coastal Georgia'][status.world];
   const tsunami=room.gameMode==='countdown',first=strip.querySelector('.advisor-status-first'),second=strip.querySelector('.advisor-status-second');
   first.querySelector('b').textContent=String(tsunami?status.submerged:status.portals);first.querySelector('.advisor-status-label').textContent=tsunami?'Submerged':'Portals';
   second.querySelector('b').textContent=String(tsunami?status.protected:status.owned);second.querySelector('.advisor-status-label').textContent=tsunami?'Protected':'Owned';strip.classList.toggle('is-collapse',!tsunami);
   const advice=advise(room,deeds,busy);this.element.dataset.advice=advice.key;
   const text=this.element.querySelector('.advisor-speech p');if(text.textContent!==advice.text)text.textContent=advice.text;
   const detail=this.element.querySelector('.advisor-more p');if(detail.textContent!==advice.details)detail.textContent=advice.details;
   const actions=this.element.querySelector('.advisor-actions');actions.replaceChildren();const names={develop:'Review development',properties:'My properties',trade:'Trading Center',landing:'Review landing',results:'View results'};
   for(const action of advice.actions){const button=document.createElement('button');button.type='button';button.textContent=names[action];button.dataset.advisorAction=action;button.disabled=busy;button.onclick=()=>this.onAction(action);actions.append(button);}this.paint();
  }
 }
 return {advise,neighborhoodStatus,Display};
});
