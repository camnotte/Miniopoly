(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MiniopolyExpressView=api;})(typeof window==='undefined'?globalThis:window,function(){
 'use strict';
 const warnings={5:'Distant rumbling · five building rounds remain',4:'Small cracks are appearing',3:'Cracks are spreading · the worlds are growing unstable',2:'Strong tremors · World Collapse is approaching',1:'FINAL BUILDING ROUND — WORLD COLLAPSE APPROACHING'};
 function stage(room){
  if(!['express','countdown'].includes(room?.gameMode)||room.stage==='lobby')return null;
  if(room.gameMode==='countdown'){const wave=room.collapse?.wave||0,remaining=room.rounds-room.round+1,next=room.collapse?.endangered?.length||0;return {wave,remaining,warning:!wave&&remaining>=1&&remaining<=5?6-remaining:0,title:wave?'Countdown · Wave '+wave+' · '+next+' properties threatened':'Countdown · Building round '+room.round+' of '+room.rounds,hint:wave?'After this full round, the void strikes marked properties. An upgraded property has one shield; losing your last property eliminates you. Void landings are safe.':'Build, trade and upgrade. Consumption begins after round '+room.rounds+'. Building Permits still work without complete sets.'};}
  const wave=room.collapse?.wave||0,remaining=room.rounds-room.round+1;
  return {wave,remaining,warning:!wave&&remaining>=1&&remaining<=5?6-remaining:0,
   title:wave?'Collapse · Wave '+wave:remaining<=5?warnings[remaining]:'Express · Building round '+room.round+' of '+room.rounds,
   hint:wave?(room.collapse?.evadeRule?'Available evade tokens protect a first landing per void. Repeat landings are fatal. Last player standing wins.':'Collapsed spaces are fatal on landing. Crossing them is safe. Last player standing wins.')+(room.collapseRentBoost?' Final Showdown: rent +50%.':''):'Collapse starts after everyone finishes round '+room.rounds+'. Properties still work normally.'};
 }
 return {stage};
});
