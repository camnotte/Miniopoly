(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MiniopolyCleanupRules=api;})(typeof window==='undefined'?globalThis:window,function(){
 'use strict';
 const enabled=room=>!!room&&(room.gameMode||'classic')==='classic';
 const effect=(room,id)=>enabled(room)?room.cleanup?.effects?.[id]:null;
 const closed=(room,id)=>!!effect(room,id)&&room.round<effect(room,id).closedUntil;
 const bonus=(room,id)=>!!effect(room,id)&&room.round<effect(room,id).bonusUntil?1.25:1;
 const fee=(deed,owned)=>Math.min(100,Math.max(30,Math.ceil((deed.price*.1+(owned.level||0)*5)/5)*5));
 const nextRound=room=>Math.floor((room?.round||1)/5)*5+5;
 const labels=['Well maintained','Showing wear','Neglected','Run-down'],rates=[1,.9,.75,.5];
 function condition(room,id){const o=room?.owned?.[id],start=Number.isInteger(o?.maintainedRound)?o.maintainedRound:room?.round||1,age=Math.max(0,(room?.round||1)-start),tier=enabled(room)&&o?Math.min(3,Math.floor(age/3)):0;return {tier:tier+1,label:labels[tier],rate:rates[tier],percent:rates[tier]*100,start,nextRound:tier<3?start+(tier+1)*3:null};}
 function quote(room,deed){const o=room?.owned?.[deed?.id];if(!o)return null;const dev=typeof module==='object'&&module.exports?require('./property-development'):globalThis.MiniopolyDevelopment,value=Math.round(deed.price+dev.valueSteps(o)*deed.upgradeCost/2),maintenance=fee(deed,o),surcharge=Math.max(20,Math.ceil(value*.1/5)*5),total=maintenance+surcharge;return {value,maintenance,surcharge,total,key:JSON.stringify([room.matchId,deed.id,o.owner,o.level,o.maintainedRound,o.serviceCount||0,value,total])};}
 const billDue=(room,seat)=>room?.turn===seat?Math.max(room.obligation?.amount||0,room.phase==='card'&&room.pending?.amount<0?-room.pending.amount:0):0;
 const reserved=(room,player)=>!enabled(room)?0:room.cleanupServiceVersion===3||room.cleanup?.serviceVersion===3?(room.cleanup?.jobs||room.cleanup?.houseCalls||[]).filter(j=>['booked','travelling'].includes(j.status)&&j.playerId===player?.id).reduce((sum,j)=>sum+j.total,0):room.cleanup?.houseCall?.status==='booked'&&room.cleanup.houseCall.playerId===player?.id?room.cleanup.houseCall.total:0;
 return {enabled,effect,closed,bonus,fee,nextRound,condition,quote,reserved,billDue};
});
