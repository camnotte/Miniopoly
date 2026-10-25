(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MiniopolyPortalRecovery=api;})(typeof window==='undefined'?globalThis:window,function(){
 'use strict';
 // Read-only heat projection. Fees are drawn and persisted by the host on landing.
 function status(room,id){
  if(room?.gameMode!=='express'||room.collapse?.portalRule!=='moving-v1'||room.collapse?.lost?.[id])return null;
  const last=room.collapse?.history?.[id],wave=room.collapse?.wave;
  if(!Number.isInteger(last)||last<0||!Number.isInteger(wave)||wave<1)return null;
  const age=wave-last-1;if(age<0||age>1)return null;
  return age===0?{age,heat:'hot',label:'HOT EMBERS',min:75,max:150,round:1}:{age,heat:'cooling',label:'COOLING EMBERS',min:25,max:60,round:2};
 }
 return {status};
});
