(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MiniopolyExpressView=api;})(typeof window==='undefined'?globalThis:window,function(){
 'use strict';
 const warnings={5:'Distant rumbling · five building rounds remain',4:'Small cracks are appearing',3:'Cracks are spreading · the neighborhoods are growing unstable',2:'Strong tremors · World Collapse is approaching',1:'FINAL BUILDING ROUND — WORLD COLLAPSE APPROACHING'};
 function stage(room){
  if(!['express','countdown'].includes(room?.gameMode)||room.stage==='lobby')return null;
  if(room.gameMode==='countdown'){
   if(room.collapse?.rule==='directional-v1'){
    const s=room.collapse,wave=s.wave||0,remaining=room.rounds-room.round+1,direction=s.direction?.toUpperCase(),warning=!!direction&&!s.calm;
    return {wave,remaining,warning:warning?2:0,title:s.calm?'CALM SEAS · Final recovery round':direction?'SIRENS FROM '+direction+' · '+(wave?'Next wave after this round':'First wave after round '+room.rounds):'Build normally · Sirens in round '+(room.rounds-1),hint:'Final two building rounds: prepare for a fixed wave direction. North/south exposes top and bottom rows; east/west exposes side columns. Each of five waves randomly strikes up to three owned properties total across the exposed edges of all neighborhoods. Exact targets are chosen at impact. One-use development protection costs one upgrade; a Wave Shield protects for one wave without spending that protection. Bid secretly on submerged sites and rebuild on your turn. After wave five, one calm recovery round precedes highest-net-worth scoring. Losing all properties does not eliminate you; bankruptcy does.'};
   }
   const wave=room.collapse?.wave||0,remaining=room.rounds-room.round+1,next=room.collapse?.endangered?.length||0;
   const tides={5:'Distant surf · five building rounds remain',4:'The tide is rising',3:'Strong currents · a tsunami is approaching',2:'High water · protect your properties',1:'FINAL BUILDING ROUND — TSUNAMI APPROACHING'};
   return {wave,remaining,warning:!wave&&remaining>=1&&remaining<=5?6-remaining:0,title:wave?'Tsunami · Wave '+wave+' · '+next+' properties threatened':tides[remaining]||'Tsunami · Building round '+room.round+' of '+room.rounds,hint:wave?'After this full round, the tsunami strikes marked properties. An upgraded property has one use of flood protection: the first hit removes one upgrade; a later hit submerges it. Submerged spaces have no rent or value and are safe to land on. Last property owner wins.':'Build, trade and upgrade. The first tsunami strikes after everyone finishes round '+room.rounds+'. Waves then target 1, 2, 3… owned properties across all three neighborhoods. Building Permits still work without complete sets.'};
  }
  const wave=room.collapse?.wave||0,remaining=room.rounds-room.round+1;
  return {wave,remaining,warning:!wave&&remaining>=1&&remaining<=5?6-remaining:0,
   title:wave?'Collapse · Wave '+wave:remaining<=5?warnings[remaining]:'Express · Building round '+room.round+' of '+room.rounds,
   hint:wave?(room.collapse?.evadeRule?'At most 3 portals per world; locations change after each full round. Returned properties keep their ownership and upgrades but have two rounds of cooling embers: $75–$150, then $25–$60 damage fees on landing. An evade token can protect your first visit to a portal this round; a repeat visit this round is fatal. Last player standing wins.':'At most 3 portals per world; locations change after each full round. Returned properties keep their ownership and upgrades but have two rounds of cooling embers: $75–$150, then $25–$60 damage fees on landing. Landing on an active portal is fatal; crossing it is safe. Last player standing wins.')+(room.collapseRentBoost?' Final Showdown: rent +50%.':''):'Collapse starts after everyone finishes round '+room.rounds+'. Properties still work normally.'};
 }
 return {stage};
});
