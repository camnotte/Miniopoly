(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MiniopolyPlayerSets=api;})(typeof window==='undefined'?globalThis:window,function(){
  'use strict';
  const colors=[['Brown','#81502d','#fff9ed'],['Blue','#4c9ccb','#112f32'],['Pink','#d47b9c','#112f32'],['Orange','#e68e40','#112f32'],['Red','#d85c55','#061613'],['Yellow','#e5c55a','#112f32'],['Green','#69b27b','#112f32'],['Navy','#3d5e9b','#ffffff']];
  function member(deed,room,seat){
    const ownership=room.owned?.[deed.id],owner=ownership?room.players.find(player=>player.seat===ownership.owner):null;
    return {...deed,owned:Boolean(ownership&&ownership.owner===seat),ownerSeat:ownership?.owner??null,ownerName:owner?.name||null,mortgaged:Boolean(ownership?.mortgage),level:ownership?.level||0,foreclosed:!ownership&&(room.foreclosures||[]).some(item=>item.deedId===deed.id)};
  }
  function groups(deeds,room,seat){
    return colors.map(([color,fill,ink])=>{
      const members=deeds.filter(deed=>deed.type==='p'&&deed.color===color).map(deed=>member(deed,room,seat));
      const count=members.filter(member=>member.owned).length;
      return {color,fill,ink,members,count,total:members.length,complete:members.length>0&&count===members.length,mortgaged:members.some(member=>member.owned&&member.mortgaged)};
    }).filter(group=>group.total);
  }
  function otherDeeds(deeds,room,seat){
    const members=deeds.filter(deed=>deed.type!=='p'&&room.owned?.[deed.id]?.owner===seat).map(deed=>member(deed,room,seat));
    return {color:'Other deeds',other:true,members,count:members.length,total:members.length};
  }
  return {groups,otherDeeds};
});
