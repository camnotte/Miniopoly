(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MiniopolyCleanupRules=api;})(typeof window==='undefined'?globalThis:window,function(){
 'use strict';
 const enabled=room=>!!room&&(room.gameMode||'classic')==='classic';
 const effect=(room,id)=>enabled(room)?room.cleanup?.effects?.[id]:null;
 const closed=(room,id)=>!!effect(room,id)&&room.round<effect(room,id).closedUntil;
 const bonus=(room,id)=>!!effect(room,id)&&room.round<effect(room,id).bonusUntil?1.25:1;
 const fee=(deed,owned)=>Math.min(100,Math.max(30,Math.ceil((deed.price*.1+(owned.level||0)*5)/5)*5));
 const nextRound=room=>Math.floor((room?.round||1)/5)*5+5;
 return {enabled,effect,closed,bonus,fee,nextRound};
});
