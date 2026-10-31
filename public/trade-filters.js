/* Read-only trading aids. Prices are comparison baselines, not offer valuations. */
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./property-development'):root.MiniopolyDevelopment);if(typeof module==='object'&&module.exports)module.exports=api;else root.MiniopolyTradeFilters=api;})(typeof window==='undefined'?globalThis:window,function(development){
 'use strict';
 const values=deeds=>Array.isArray(deeds)?deeds:Object.values(deeds||{});
 const live=(room,id)=>!!room.owned?.[id]&&!room.owned[id].lost&&!room.collapse?.lost?.[id];
 function needed(room,deeds,seat){
  const catalog=values(deeds),result=[];
  for(const color of new Set(catalog.filter(d=>d.type==='p').map(d=>d.color))){
   const set=catalog.filter(d=>d.type==='p'&&d.color===color),owned=set.filter(d=>live(room,d.id)&&room.owned[d.id].owner===seat).length;
   if(!owned||owned===set.length)continue;
   for(const deed of set){const owner=room.owned?.[deed.id]?.owner;if(!live(room,deed.id)||owner===seat||room.players?.find(p=>p.seat===owner)?.out)continue;result.push({id:deed.id,owner,owned,total:set.length,missing:set.length-owned,completes:owned===set.length-1});}
  }
  return result;
 }
 function estimatedRent(room,deeds,deed,recipient){
  const holding=room.owned?.[deed.id];if(!live(room,deed.id)||holding.mortgage)return 0;
  const catalog=values(deeds);let rent;
  if(deed.type==='p')rent=deed.base*development.multipliers[development.normalize(holding.level)];
  else {const count=catalog.filter(d=>d.type===deed.type&&live(room,d.id)&&room.owned[d.id].owner===recipient&&!room.owned[d.id].mortgage&&d.id!==deed.id).length+1;rent=deed.type==='rail'?[0,25,50,100,200][Math.min(4,count)]:(count>=2?10:4)*6.5;}
  return room.gameMode==='express'&&room.collapse?.wave>0&&room.collapseRentBoost?rent*1.5:rent;
 }
 const value=(room,deeds,deed,recipient)=>deed.price>0?estimatedRent(room,deeds,deed,recipient)/deed.price:0;
 return {needed,estimatedRent,value};
});
