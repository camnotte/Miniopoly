(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MiniopolyPlayerAdvisor=api;})(typeof window==='undefined'?globalThis:window,function(){
 'use strict';
 function advise(room,deeds={},busy=false){
  const me=room?.players?.find(p=>p.id===room.youId);if(!me)return null;
  const own=Object.values(deeds).filter(d=>room.owned?.[d.id]?.owner===me.seat&&!room.collapse?.lost?.[d.id]),homes=own.filter(d=>d.type==='p'),turn=room.turn===me.seat;
  const result=(key,text,actions=[])=>({key,text,actions});
  if(room.stage==='lobby')return result('lobby','I’m your personal advisor, '+me.name+'. I’ll watch our properties, money and the approaching disaster. Build three green Houses or yellow Chalets, then replace all three with one red Estate.',[]);
  if(busy)return result('moving','Our game piece is moving. Let’s see where we land before making the next decision.');
  if(room.stage==='finished')return result('finished','The match is complete. Open the results to see how we finished.',['results']);
  if(me.out)return result('out','We are out of this match, but we can still watch the remaining players.',['properties']);
  if(room.trades?.some(o=>o.to===me.seat&&o.status==='pending')&&!(room.gameMode==='countdown'&&own.some(d=>room.collapse?.endangered?.includes(d.id)&&!(room.owned[d.id].level>0&&!room.collapse.shieldSpent?.[d.id]))))return result('trade','Another player has sent us a trade offer. Review the property and cash terms before deciding.',['trade']);
  if(turn&&['rent','bail'].includes(room.phase))return result('payment','We have a payment to resolve. Review the amount and our available cash before making development plans.',['landing','properties']);
  const candidates=homes.filter(d=>!room.owned[d.id].mortgage&&(room.owned[d.id].level||0)<4),permit=me.perks?.includes('building')&&candidates.length;
  const complete=candidates.filter(d=>Object.values(deeds).filter(x=>x.type==='p'&&x.color===d.color).every(x=>room.owned?.[x.id]?.owner===me.seat&&!room.owned[x.id].mortgage&&!room.collapse?.lost?.[x.id]));
  const affordable=complete.filter(d=>me.cash>=d.upgradeCost*(room.upgradeCostMultiplier||1));
  const next=room.collapse?.endangered||[],threats=own.filter(d=>next.includes(d.id));
  if(room.gameMode==='countdown'){
   const vulnerable=threats.filter(d=>!(room.owned[d.id].level>0&&!room.collapse.shieldSpent?.[d.id]));
   const improvable=vulnerable.filter(d=>d.type==='p'&&!room.owned[d.id].mortgage&&!room.collapse.shieldSpent?.[d.id]&&(room.owned[d.id].level||0)<4);
   if(vulnerable.length){
    const timing=room.round<room.rounds?'after building round '+room.rounds:'after everyone completes this round';
    let text='The next tsunami strikes '+timing+'. '+vulnerable.length+' of our properties '+(vulnerable.length===1?'is':'are')+' threatened without usable flood protection. ';
    if(permit&&improvable.length)text+='A Building Permit can develop '+improvable[0].name+' for free, without completing its set.';
    else if(improvable.some(d=>affordable.some(x=>x.id===d.id)))text+='We can afford to develop a threatened property and earn its one-use seawall.';
    else if(vulnerable.some(d=>room.collapse.shieldSpent?.[d.id]))text+='Spent seawalls cannot be restored by another development. Consider trading while we still can.';
    else text+='Review our sets and possible trades. A normal paid development needs the full unmortgaged color set.';
    return result('danger',text,turn&&room.phase==='post'&&(permit&&improvable.length||improvable.some(d=>affordable.some(x=>x.id===d.id)))?['develop','properties']:['properties','trade']);
   }
   if(threats.length)return result('protected','The next wave targets '+threats.length+' of our properties, and their seawalls are ready. Each seawall will cost one development when it protects the property, then remain spent.',['properties']);
   if(!room.collapse?.wave){const left=room.rounds-room.round+1;return result('building','The tsunami begins after everyone completes building round '+room.rounds+'. '+left+' building '+(left===1?'round remains':'rounds remain')+'. '+(permit?'We have a Building Permit: one free development without a full set.':'Acquire properties and complete sets so we can develop them for flood protection.'),turn&&room.phase==='post'&&permit?['develop','properties']:['properties','trade']);}
  }
  if(me.penalty>0)return result('setback',turn?'We are in Setback. Review the free escape roll, paid escape and saved escape perks before choosing.':'Rent is paused while we are in Setback. We can review our properties while waiting.',['properties']);
  if(permit)return result('permit','We have a Building Permit. We can add a House or Chalet, or replace three buildings with an Estate, for free without owning the full color set. '+(turn&&room.phase==='post'?'Choose a property in Develop.':turn?'Resolve our roll and landing, then open Develop.':'We can use it on our turn.'),turn&&room.phase==='post'?['develop','properties']:['properties']);
  if(affordable.length)return result('develop','We own a complete unmortgaged set and can afford to develop '+affordable[0].name+'. Compare the new rent and cost before spending.',turn&&room.phase==='post'?['develop','properties']:['properties']);
  if(complete.length)return result('funding','We have a complete set, but we need more cash for its next development. Review the cost, our cash and possible trades before committing.',['properties','trade']);
  const almost=Object.values(deeds).filter(d=>d.type==='p').reduce((map,d)=>{(map[d.color]||=[]).push(d);return map;},{});
  const near=Object.entries(almost).find(([,set])=>set.filter(d=>room.owned?.[d.id]?.owner===me.seat&&!room.collapse?.lost?.[d.id]).length===set.length-1);
  if(near)return result('set','We are one property away from completing the '+near[0]+' set. A trade could unlock paid development into Houses or Chalets and then an Estate.',['trade','properties']);
  return result('turn',turn?(room.phase==='roll'?'It’s our turn. Roll to travel, then review the landing. Properties generate rent; complete color sets unlock paid development.':'Review our landing and available actions before ending the turn.'):'While '+(room.players[room.turn]?.name||'another player')+' takes a turn, we can review our properties and negotiate trades.',['properties','trade']);
 }
 class Display{
  constructor({onAction=()=>{},onEnable=()=>{}}={}){
   this.onAction=onAction;this.onEnable=onEnable;this.collapsed=localStorage.getItem('miniopoly_player_advisor_min_v1')==='true';
   this.element=document.createElement('section');this.element.id='playerAdvisor';this.element.hidden=true;this.element.className='player-advisor';this.element.setAttribute('aria-label','Your personal advisor');
   this.element.innerHTML='<header><strong class="advisor-title">Your advisor</strong><button type="button" class="advisor-minimize" aria-label="Minimize advisor">−</button></header><div class="advisor-body"><span class="advisor-avatar" aria-hidden="true"></span><div class="advisor-speech"><p role="status" aria-live="polite"></p><div class="advisor-actions"></div></div></div><button type="button" class="advisor-enable" hidden>Hints are off · Show my advisor</button>';
   this.toggle=this.element.querySelector('.advisor-minimize');this.toggle.onclick=()=>{this.collapsed=!this.collapsed;localStorage.setItem('miniopoly_player_advisor_min_v1',String(this.collapsed));this.paint();};this.element.querySelector('.advisor-enable').onclick=()=>{this.collapsed=false;localStorage.setItem('miniopoly_player_advisor_min_v1','false');this.onEnable();this.paint();};
  }
  paint(){this.element.classList.toggle('is-collapsed',this.collapsed);this.toggle.textContent=this.collapsed?'+':'−';this.toggle.setAttribute('aria-expanded',String(!this.collapsed));this.toggle.setAttribute('aria-label',this.collapsed?'Expand advisor':'Minimize advisor');}
  update(room,deeds,{enabled=true,busy=false}={}){
   const me=room?.players?.find(p=>p.id===room.youId);this.element.hidden=!me;if(!me)return;
   this.element.querySelector('.advisor-title').textContent=me.name+'’s advisor';
   const identity=[me.avatar,me.avatarImage].join(':');if(identity!==this.identity){this.identity=identity;this.element.querySelector('.advisor-avatar').innerHTML=window.MiniopolyAvatars.html(me.avatar,me.seat,me.avatarImage);}
   this.element.querySelector('.advisor-body').hidden=!enabled;this.element.querySelector('.advisor-enable').hidden=enabled;this.toggle.hidden=!enabled;
   const advice=advise(room,deeds,busy);this.element.dataset.advice=advice.key;
   const text=this.element.querySelector('.advisor-speech p');if(text.textContent!==advice.text)text.textContent=advice.text;
   const actions=this.element.querySelector('.advisor-actions');actions.replaceChildren();const names={develop:'Review development',properties:'My properties',trade:'Trading Center',landing:'Review landing',results:'View results'};
   for(const action of advice.actions){const button=document.createElement('button');button.type='button';button.textContent=names[action];button.dataset.advisorAction=action;button.disabled=busy;button.onclick=()=>this.onAction(action);actions.append(button);}this.paint();
  }
 }
 return {advise,Display};
});
