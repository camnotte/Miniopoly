/* Shared read-only property details; host snapshots remain authoritative. */
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./property-development'):root.MiniopolyDevelopment);if(typeof module==='object'&&module.exports)module.exports=api;else root.MiniopolyPropertyInspection=api;})(typeof window==='undefined'?globalThis:window,function(dev){
 'use strict';
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const money=n=>'$'+Number(n).toLocaleString('en-US');
 function model(room,catalog,id){
  const deeds=Array.isArray(catalog)?catalog:Object.values(catalog||{}),deed=deeds.find(d=>d.id===id);if(!deed)return null;
  const owned=room?.owned?.[id],owner=owned?room.players?.[owned.owner]:null,level=owned?.level||0,lost=!!room?.collapse?.lost?.[id]||!!owned?.lost;
  const boost=room?.collapseRentBoost&&(room?.collapse?.wave||0)>0?1.5:1,railCount=Math.max(1,deeds.filter(d=>d.type==='rail'&&!!room?.owned?.[d.id]&&room.owned[d.id].owner===owned?.owner&&!room.owned[d.id].mortgage&&!room.owned[d.id].lost&&!room.collapse?.lost?.[d.id]).length);
  const rentAt=n=>Math.ceil((deed.type==='rail'?dev.railRent(railCount,n):deed.base*dev.multipliers[n])*boost);
  const rows=['p','rail'].includes(deed.type)?Array.from({length:dev.max(deed)+1},(_,n)=>({level:n,name:dev.name(n,deed),rent:rentAt(n),cost:n?deed.upgradeCost*(room?.upgradeCostMultiplier||1):0})):[];
  let protection='Not applicable · Flood protection is used in Tsunami',protectedHome=false;
  if(room?.gameMode==='countdown'){
   if(lost)protection='Submerged · Rebuild before it can earn rent';
   else if(!owned)protection='Unowned · No flood protection';
   else if(room.collapse?.temporary?.[id]===room.collapse?.wave+1){protection='Protected · 1 WAVE Shield for the next wave';protectedHome=true;}
   else if(level>0&&!room.collapse?.shieldSpent?.[id]){protection='Protected · Built-in shield saves one hit at the cost of one improvement';protectedHome=true;}
   else protection=room.collapse?.shieldSpent?.[id]?'Unprotected · Built-in shield already spent':'Unprotected · '+(deed.type==='util'?'Use a Wave Shield card': 'Develop this property or use a Wave Shield card');
  }
  const members=deed.type==='p'?deeds.filter(d=>d.type==='p'&&d.color===deed.color).map(d=>{const o=room?.owned?.[d.id],p=o?room.players?.[o.owner]:null;return {id:d.id,name:d.name,board:d.board,owner:p?.name||'Unowned',mortgage:!!o?.mortgage,lost:!!room?.collapse?.lost?.[d.id],current:d.id===id};}):[];
  return {deed,owner:owner?.name||'Unowned',level,lost,railCount,rows,protection,protected:protectedHome,members,paused:!!owned?.mortgage||!!owner?.penalty,currentRent:!owned||lost||owned.mortgage||owner?.out||owner?.penalty?0:deed.type==='util'?null:rentAt(level)};
 }
 function html(room,catalog,id){
  const m=model(room,catalog,id);if(!m)return '';let out='<section class="property-inspection"><p class="inspection-protection '+(m.protected?'is-protected':'')+'" role="status">'+esc(m.protection)+'</p>';
  if(m.rows.length){out+='<table class="inspection-rents"><caption>'+(m.deed.type==='rail'?'Railroad rent · '+m.railCount+' rent-collecting railroad'+(m.railCount===1?'':'s'):'House / Chalet / Estate rent')+'</caption><thead><tr><th>Development</th><th>Rent</th><th>Step cost</th></tr></thead><tbody>';
   for(const row of m.rows)out+='<tr'+(row.level===m.level?' class="is-current"':'')+'><th>'+esc(row.name)+(row.level===m.level?' · Current':'')+'</th><td>'+money(row.rent)+'</td><td>'+(row.level?money(row.cost):'—')+'</td></tr>';
   out+='</tbody></table><p class="inspection-note">'+(m.deed.type==='rail'?'Each railroad can be improved independently: Depot → Terminal → Grand Station. Rent is 1.5×, 2× or 3× its railroad-count rate.':'Build three Houses (green) or Chalets (yellow), then replace them with one Estate (red). Maximum: three Estates. Paid residential development needs the full unmortgaged color set; Building Permits bypass the set.')+(m.paused?' Rent collection is currently paused. The table shows rates after the pause ends.':'')+'</p>';
  }else out+='<p>Utility rent: 4× the landing roll with one rent-collecting utility; 10× with two. Utilities cannot be developed.</p>';
  if(m.members.length){out+='<h3>'+esc(m.deed.color)+' set · Owners</h3><ul class="inspection-set-owners">';for(const member of m.members)out+='<li data-inspection-deed="'+esc(member.id)+'"'+(member.current?' class="is-current"':'')+'><strong>'+esc(member.name)+(member.current?' · This property':'')+'</strong><span>'+esc(member.owner)+(member.lost?' · Submerged':member.mortgage?' · Mortgaged':'')+'</span><small>'+['Richmond Hill','The Communities','Coastal Georgia'][member.board]+'</small></li>';out+='</ul>';}
  return out+'</section>';
 }
 return {model,html};
});
