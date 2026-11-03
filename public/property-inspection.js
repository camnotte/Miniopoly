/* Shared read-only property details; host snapshots remain authoritative. */
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./property-development'):root.MiniopolyDevelopment,typeof module==='object'&&module.exports?require('./cleanup-rules'):root.MiniopolyCleanupRules);if(typeof module==='object'&&module.exports)module.exports=api;else root.MiniopolyPropertyInspection=api;})(typeof window==='undefined'?globalThis:window,function(dev,service){
 'use strict';
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const money=n=>'$'+Number(n).toLocaleString('en-US');
 function model(room,catalog,id){
  const deeds=Array.isArray(catalog)?catalog:Object.values(catalog||{}),deed=deeds.find(d=>d.id===id);if(!deed)return null;
  const owned=room?.owned?.[id],owner=owned?room.players?.[owned.owner]:null,level=owned?.level||0,lost=!!room?.collapse?.lost?.[id]||!!owned?.lost;
  const boost=['express','countdown'].includes(room?.gameMode)&&room?.collapseRentBoost&&(room?.collapse?.wave||0)>0?1.5:1,railCount=Math.max(1,deeds.filter(d=>d.type==='rail'&&!!room?.owned?.[d.id]&&room.owned[d.id].owner===owned?.owner&&!room.owned[d.id].mortgage&&!room.owned[d.id].lost&&!room.collapse?.lost?.[d.id]).length);
  const utilityCount=Math.max(1,deeds.filter(d=>d.type==='util'&&!!room?.owned?.[d.id]&&room.owned[d.id].owner===owned?.owner&&!room.owned[d.id].mortgage&&!room.owned[d.id].lost&&!room.collapse?.lost?.[d.id]).length);
  const condition=service.condition(room,id),serviceBonus=service.bonus(room,id),closed=service.closed(room,id);
  const rentAt=n=>Math.ceil((deed.type==='rail'?dev.railRent(railCount,n):deed.base*dev.multipliers[n])*boost*condition.rate*serviceBonus);
  const rows=['p','rail','util'].includes(deed.type)?Array.from({length:dev.max(deed)+1},(_,n)=>({level:n,name:dev.name(n,deed),rent:deed.type==='util'?null:rentAt(n),rate:deed.type==='util'?dev.utilityRate(utilityCount,n)*boost*condition.rate*serviceBonus:null,oneRate:dev.utilityRate(1,n),twoRate:dev.utilityRate(2,n),cost:n?deed.upgradeCost*(room?.upgradeCostMultiplier||1):0})):[];
  let protection='',protectedHome=false;
  if(room?.gameMode==='countdown'){
   if(lost)protection='Submerged · Rebuild before it can earn rent';
   else if(!owned)protection='Unowned · No flood protection';
   else if(room.collapse?.temporary?.[id]===room.collapse?.wave+1){protection='Protected · 1 WAVE Shield for the next wave';protectedHome=true;}
   else if(level>0&&!room.collapse?.shieldSpent?.[id]){protection='Protected · Built-in shield saves one hit at the cost of one improvement';protectedHome=true;}
   else protection=room.collapse?.shieldSpent?.[id]?'Unprotected · Built-in shield already spent':'Unprotected · '+'Develop this property or use a Wave Shield card';
  }
  const members=deed.type==='p'?deeds.filter(d=>d.type==='p'&&d.color===deed.color).map(d=>{const o=room?.owned?.[d.id],p=o?room.players?.[o.owner]:null;return {id:d.id,name:d.name,board:d.board,owner:p?.name||'Unowned',mortgage:!!o?.mortgage,lost:!!room?.collapse?.lost?.[d.id],current:d.id===id};}):[];
  return {deed,owner:owner?.name||'Unowned',level,lost,railCount,utilityCount,rows,protection,protected:protectedHome,members,paused:!!owned?.mortgage||!!owner?.penalty,closed,condition,serviceBonus,currentRent:!owned||lost||closed||owned.mortgage||owner?.out||owner?.penalty?0:deed.type==='util'?null:rentAt(level)};
 }
 function html(room,catalog,id){
  const m=model(room,catalog,id);if(!m)return '';let out='<section class="property-inspection">'+(m.protection?'<p class="inspection-protection '+(m.protected?'is-protected':'')+'" role="status">'+esc(m.protection)+'</p>':'');
  if(service.enabled(room)&&room.owned[id]){out+='<p class="inspection-condition">Condition: '+esc(m.condition.label)+' · '+m.condition.percent+'% rent'+(m.condition.nextRound?' · Next decline: round '+m.condition.nextRound:'.')+'</p>';if(room.players[room.owned[id].owner]?.id===room.youId)out+='<button type="button" data-cleanup-housecall="'+esc(id)+'">Arrange cleaning house call</button>';}
  if(m.closed)out+='<p class="inspection-service">Closed for maintenance until round '+room.cleanup.effects[id].closedUntil+'. No rent.</p>';else if(m.serviceBonus>1)out+='<p class="inspection-service">Renovated · Rent +25% until round '+room.cleanup.effects[id].bonusUntil+'.</p>';
  if(m.rows.length){out+='<table class="inspection-rents"><caption>'+(m.deed.type==='util'?'Utility rent · '+m.utilityCount+' rent-collecting utilit'+(m.utilityCount===1?'y':'ies'):m.deed.type==='rail'?'Railroad rent · '+m.railCount+' rent-collecting railroad'+(m.railCount===1?'':'s'):'House / Chalet / Estate rent')+'</caption><thead><tr><th>Development</th><th>Rent</th><th>Step cost</th></tr></thead><tbody>';
   for(const row of m.rows)out+='<tr'+(row.level===m.level?' class="is-current"':'')+'><th>'+esc(row.name)+(row.level===m.level?' · Current':'')+'</th><td>'+(m.deed.type==='util'?row.rate+'× landing die':money(row.rent))+'</td><td>'+(row.level?money(row.cost):'—')+'</td></tr>';
   out+='</tbody></table><p class="inspection-note">'+(m.deed.type==='util'?'Each utility improves independently: Service Upgrade → Reinforced Network → Regional Hub. One utility charges 4× / 6× / 8× / 12× the landing die; two utilities charge 10× / 15× / 20× / 30×, according to this utility’s level. No complete set required. Round the final bill up to whole dollars.':m.deed.type==='rail'?'Each railroad can be improved independently: Depot → Terminal → Grand Station. Rent is 1.5×, 2× or 3× its railroad-count rate.':'Build three Houses (green) or Chalets (yellow), then replace them with one Estate (red). Maximum: three Estates. Paid residential development needs the full unmortgaged color set; Building Permits bypass the set.')+(['express','countdown'].includes(room?.gameMode)&&room.collapseRentBoost&&(room.collapse?.wave||0)>0?' Rates include the active 50% rent bonus.':'')+(m.paused?' Rent collection is currently paused. The table shows rates after the pause ends.':'')+'</p>';
  }else out+='<p>Utility rent: 4× the landing roll with one rent-collecting utility; 10× with two. Each utility can be developed independently.</p>';
  if(m.members.length){out+='<h3>'+esc(m.deed.color)+' set · Owners</h3><ul class="inspection-set-owners">';for(const member of m.members)out+='<li data-inspection-deed="'+esc(member.id)+'"'+(member.current?' class="is-current"':'')+'><strong>'+esc(member.name)+(member.current?' · This property':'')+'</strong><span>'+esc(member.owner)+(member.lost?' · Submerged':member.mortgage?' · Mortgaged':'')+'</span><small>'+['Richmond Hill','The Communities','Coastal Georgia'][member.board]+'</small></li>';out+='</ul>';}
  return out+'</section>';
 }
 function utilityBill(room,catalog,id=room?.pending?.id){
  const info=room?.pending;if(room?.phase!=='rent'||!info)return null;
  if(info.utilityRent)return info.utilityRent;
  const deeds=Array.isArray(catalog)?catalog:Object.values(catalog||{}),deed=deeds.find(d=>d.id===id),roll=room.lastRoll;
  if(deed?.type!=='util'||roll?.playerId!==info.playerId||roll.board+'-'+roll.position!==id||!Number.isInteger(roll.value)||roll.value<1||roll.value>12)return null;
  const m=model(room,deeds,id),rate=info.baseRent?info.baseRent/roll.value:dev.utilityRate(m.utilityCount,m.level);
  return {roll:roll.value,rate,level:m.level};
 }
 return {model,html,utilityBill};
});
