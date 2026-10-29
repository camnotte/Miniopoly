(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.HighGroundRules=api;})(typeof window==='undefined'?globalThis:window,function(){
  'use strict';
  const waves=[{water:1,force:1},{water:2,force:1},{water:2,force:2},{water:3,force:2},{water:4,force:3}];
  const title=height=>height>=5?'Estates':height>=3?'Condos':height>=2?'Chalets':'Houses';
  const cost=(p,kind)=>kind==='raise'?200+(p.height-1)*100:kind==='reinforce'?180:100;
  function risk(player,forecast){
    if(!forecast)return {safe:true,text:'The storm has passed.'};
    if(player.height<=forecast.water)return {safe:false,reason:'height',text:'Water will reach the homes. Raise above level '+forecast.water+'.'};
    if(player.strength<=forecast.force)return {safe:false,reason:'strength',text:'The wave will overwhelm the supports. They need more than '+forecast.force+' strength.'};
    return {safe:true,text:'Above the forecast water, with enough support strength to survive.'};
  }
  function advice(room,seat){
    const p=room.players[seat],next=room.forecast;
    if(room.stage==='lobby')return {key:'lobby',text:'Choose an avatar—your advisor will use the same character. Each player starts with three properties and one Building Permit.',actions:[]};
    if(room.stage==='finished')return {key:'finished',text:room.winners.includes(seat)?'Our refuge made it! Review the final heights and supports below.':'The storm won this time. Next time, plan height and supports together.',actions:[]};
    if(p.out)return {key:'out',text:'Our refuge was lost and no evacuation remained. We can follow the other players until the final wave.',actions:[]};
    if(p.awaitingEvac)return {key:'evacuate:'+room.wave,text:'Our refuge failed! We have one evacuation. Choose another owned property. Salvaged construction loses one height level; supports restart at two.',actions:['refuge']};
    if(!p.refuge)return {key:'choose',text:'First, choose one of our properties as a refuge. We need height AND strong supports; our other properties provide income and an evacuation destination.',actions:['refuge']};
    if(room.resolvingWave)return {key:'wait-evac',text:'The wave has passed. We are waiting for the other players to choose their evacuation sites before the next round.',actions:['forecast']};
    const warning=risk(p,next),ownTurn=room.turn===seat;
    if(warning.safe&&p.height>=6&&p.strength===4)return {key:'ready:'+room.round,text:'Our refuge is at maximum height with fully reinforced supports. We are prepared for the forecast. Keep cash for repairs after the next wave.',actions:ownTurn&&!p.rolled?['roll']:['trade']};
    if(p.built)return {key:'built:'+room.round,text:(warning.safe?'Our refuge is ready for the next wave. ':warning.text+' Our construction action is already spent this round. ')+(ownTurn?'We can still roll, buy or trade before ending our turn.':'We can review properties or negotiate while waiting.'),actions:ownTurn&&!p.rolled?['roll']:['trade']};
    let build=warning.reason==='height'?'raise':warning.reason==='strength'?(p.strength<p.maxStrength?'repair':'reinforce'):p.maxStrength<4?'reinforce':'raise';
    if(build==='raise'&&p.height>=6)build=p.strength<p.maxStrength?'repair':'reinforce';
    const price=cost(p,build),verb={raise:'raise the refuge',repair:'repair the supports',reinforce:'reinforce the supports'}[build];
    const prefix=room.wave?'Next wave: water '+next.water+', impact '+next.force+'. ':'The first wave follows building round '+room.buildingRounds+'. ';
    let text=prefix+(warning.safe?'We are prepared for that forecast. ':warning.text+' ');
    if(p.permits)text+='We have a Building Permit: '+verb+' for free. It still uses this round’s construction action.';
    else if(p.cash>=price)text+='We can '+verb+' for $'+price+'.';
    else return {key:'funds:'+room.round,text:text+'We need $'+(price-p.cash)+' more to '+verb+'. Sell a supporting property or negotiate a trade. Selling also reduces our future income.',actions:['properties','trade']};
    if(!ownTurn)text+=' Construction is available on our turn.';
    if(room.offers?.some(o=>o.to===seat&&o.status==='pending'))text+=' Someone has sent us a trade offer.';
    return {key:build+':'+room.round,text,actions:[build,'forecast']};
  }
  return {waves,title,cost,risk,advice};
});
