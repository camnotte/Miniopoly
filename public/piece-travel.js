/* A display-only, continuous replay of the server's square-by-square route. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MiniopolyPieceTravel=api;})(typeof window==='undefined'?globalThis:window,()=>{
 'use strict';
 function sample(points,elapsed,stepDuration){
  if(!Array.isArray(points)||points.length<2||!Number.isFinite(stepDuration)||stepDuration<=0)throw Error('A route and positive step duration are required.');
  const progress=Math.max(0,Math.min(points.length-1,(Number(elapsed)||0)/stepDuration)),index=Math.min(points.length-2,Math.floor(progress)),fraction=progress-index,a=points[index],b=points[index+1];
  return {x:a.x+(b.x-a.x)*fraction,y:a.y+(b.y-a.y)*fraction,index,passed:Math.floor(progress),done:progress===points.length-1};
 }
 return {sample,stepDuration:690/1.2};
});
