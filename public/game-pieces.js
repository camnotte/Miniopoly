(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MiniopolyPieces=api;})(typeof window==='undefined'?globalThis:window,function(){
 'use strict';
 const items=Object.freeze([['🚗','Blimp'],['🐱','Cat'],['🐶','Dog'],['📱','Airplane'],['🚀','Battleship'],['🛵','Tennis shoes'],['🦖','T-Rex'],['🎮','Top Hat'],['car','Car']].map(([symbol,name])=>Object.freeze({symbol,name})));
 const valid=value=>items.some(item=>item.symbol===value);
 const resolve=(value,seat=0)=>items.find(item=>item.symbol===value)||items[(Number.isInteger(seat)&&seat>=0?seat:0)%items.length];
 function choose(value,players=[]){
  const occupied=new Set(players.map((p,i)=>resolve(p.piece,i).symbol));
  if(value!==undefined){
   if(!valid(value))throw Object.assign(Error('Choose one of the nine game pieces.'),{status:400});
   if(occupied.has(value)){const owner=players.find((p,i)=>resolve(p.piece,i).symbol===value);throw Object.assign(Error(resolve(value).name+' is already chosen by '+owner.name+'. Choose another piece.'),{status:409});}
   return value;
  }
  const preferred=resolve(undefined,players.length).symbol;
  return !occupied.has(preferred)?preferred:items.find(item=>!occupied.has(item.symbol))?.symbol;
 }
 const choices=Object.freeze(['🐱','🐶','🚗','📱','🦖','🛵','🚀','🎮','car'].map(symbol=>resolve(symbol)));
 return Object.freeze({items,choices,valid,resolve,choose});
});
