(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MiniopolyDevelopment=api;})(typeof window==='undefined'?globalThis:window,function(){
 'use strict';
 const RULE='three-buildings-v1',MAX=4,multipliers=[1,2,3,4,7];
 const normalize=value=>Math.max(0,Math.min(MAX,Math.floor(Number(value)||0)));
 // Default: The Communities uses Chalets; individual deeds can override buildingType.
 const type=deed=>deed?.buildingType==='chalet'||(deed?.buildingType!=='house'&&deed?.board===1)?'Chalet':'House';
 function name(value,deed){const level=normalize(value);return level===4?'Estate':level?level+' '+type(deed)+(level===1?'':'s'):'No buildings';}
 function art(value,deed){const level=normalize(value),color=level===4?'#ed302b':type(deed)==='Chalet'?'#f2cb36':'#62cd36';return '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M5 29 32 6 59 29H52V58H12V29Z" fill="'+color+'" stroke="#24452b" stroke-width="3" stroke-linejoin="round"/></svg>';}
 function slots(value,deed){const level=normalize(value),count=level===4?1:level;return '<span class="building-slots" data-building-level="'+level+'" role="img" aria-label="'+name(level,deed)+(level===4?' · replaces three buildings · maximum':' of three before an Estate')+'">'+Array.from({length:3},(_,i)=>'<span class="building-slot'+(i<count?' is-filled':'')+'">'+(i<count?art(level,deed):'')+'</span>').join('')+'</span>';}
 function html(value,compact=false,deed){const level=normalize(value);return '<span class="development-badge'+(compact?' is-compact':'')+'" data-development="'+level+'">'+slots(level,deed)+'<b>'+name(level,deed)+'</b></span>';}
 function badge(value,deed){const holder=document.createElement('span');holder.innerHTML=html(value,false,deed);return holder.firstElementChild;}
 const forHeight=height=>height>=5?4:Math.max(1,Math.min(3,height-1));
 function fundedLevels(owned){
  const level=normalize(owned?.level);
  if(Array.isArray(owned?.developmentFundedLevels))return [...new Set(owned.developmentFundedLevels.filter(n=>Number.isInteger(n)&&n>0&&n<=level))].sort((a,b)=>a-b);
  const count=Math.max(0,Math.min(level,Number.isInteger(owned?.developmentValueSteps)?owned.developmentValueSteps:level));
  return Array.from({length:count},(_,i)=>i+1);
 }
 const valueSteps=owned=>fundedLevels(owned).length;
 function develop(owned){const level=normalize(owned.level);if(level>=MAX)return false;const funded=fundedLevels(owned);owned.level=level+1;funded.push(owned.level);owned.developmentFundedLevels=funded;owned.developmentValueSteps=funded.length;return true;}
 const saleSteps=owned=>fundedLevels(owned).includes(normalize(owned?.level))?1:0;
 function remove(owned,{damage=false}={}){
  const level=normalize(owned.level);if(!level)return 0;const funded=fundedLevels(owned),index=funded.indexOf(level);let steps=0;
  if(index>=0){funded.splice(index,1);steps=1;}else if(damage&&funded.length){funded.pop();steps=1;}
  owned.level=level-1;owned.developmentFundedLevels=funded;owned.developmentValueSteps=funded.length;return steps;
 }
 function migrate(room){
  if(room.developmentRule===RULE)return false;
  for(const owned of Object.values(room.owned||{})){const old=Math.max(0,Math.min(3,Math.floor(Number(owned.level)||0)));owned.level=[0,1,3,4][old];owned.developmentValueSteps=old;owned.developmentFundedLevels=[[],[1],[1,3],[1,3,4]][old];}
  for(const offer of room.trades||[])if(offer.status==='pending')offer.status='expired';
  room.developmentRule=RULE;return true;
 }
 return {RULE,MAX,multipliers,names:[0,1,2,3,4].map(n=>name(n)),normalize,type,name,art,slots,html,badge,forHeight,fundedLevels,valueSteps,develop,saleSteps,remove,migrate};
});
