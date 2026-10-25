'use strict';
const crypto=require('node:crypto');
const {deeds}=require('../game-data.json');
const homes=deeds.filter(d=>d.type==='p');
const countdown=require('./countdown-mode');
const isExpress=room=>['express','countdown'].includes(room.gameMode);
const lost=(room,id)=>isExpress(room)&&!!room.collapse?.lost?.[id];
function choose(items){return items[crypto.randomInt(items.length)];}
function initialize(room){
  room.collapse=null;
  if(!isExpress(room))return;
  room.collapse={version:2,evadeRule:'construction-v1',wave:0,lost:{},endangered:[],midpointGranted:false};
  if(countdown.isCountdown(room))room.collapse={version:1,kind:'countdown',wave:0,lost:{},shieldSpent:{},endangered:[],midpointGranted:false};
  for(const player of room.players){delete player.evadeAward;delete player.countdownBefore;}
  // Equal $400 portfolios, with random deeds and no duplicates. Several disjoint
  // pairs remain available even with four players; cash is never deducted.
  for(let seat=0;seat<room.players.length;seat++){
    const available=homes.filter(d=>!room.owned[d.id]),pairs=[];
    for(let a=0;a<available.length;a++)for(let b=a+1;b<available.length;b++)
      if(available[a].price+available[b].price===400&&available[a].color!==available[b].color)pairs.push([available[a],available[b]]);
    if(!pairs.length)throw Error('No balanced Express starter pair remains.');
    const pair=choose(pairs);
    for(const deed of pair)room.owned[deed.id]={owner:seat,level:0,mortgage:false};
    room.players[seat].perks.push('building');
    room.log.unshift(room.players[seat].name+' received '+pair.map(d=>d.name).join(' and ')+' ($400 total), plus a Building Permit.');
  }
}
function goAward(room,player){
  if(!isExpress(room))return '';
  const available=homes.filter(d=>!room.owned[d.id]&&!lost(room,d.id)&&!(room.foreclosures||[]).some(f=>f.deedId===d.id));
  if(!available.length)return player.name+' passed GO; no available home remains for the Express reward.';
  const deed=choose(available);room.owned[deed.id]={owner:room.turn,level:0,mortgage:false};
  return player.name+' received '+deed.name+' free for passing GO.';
}
const hasEvade=room=>room.gameMode==='express'&&room.collapse?.evadeRule==='construction-v1';
function portfolio(room,seat){
  const owned=deeds.filter(d=>room.owned[d.id]?.owner===seat&&!lost(room,d.id));
  const properties=owned.length,improved=owned.filter(d=>d.type==='p'&&(room.owned[d.id].level||0)>0).length,points=properties+improved;
  return {properties,improved,points,earned:properties>=3?Math.min(3,Math.floor(points/3)):0};
}
function protection(room,seat){
  if(!hasEvade(room))return {enabled:false,remaining:0,earned:0,spent:0,locked:false,available:false};
  const player=room.players[seat],award=player.evadeAward;
  if(award){const rescued=[...(award.rescued||[])];return {enabled:true,locked:true,available:!player.out&&award.remaining>0&&room.stage==='playing'&&room.collapse.wave>0,properties:award.properties,improved:award.improved,points:award.points,earned:award.earned,remaining:award.remaining,spent:award.earned-award.remaining,rescued,rescuedNames:rescued.map(id=>deeds.find(d=>d.id===id)?.name||id)};}
  const current=portfolio(room,seat);return {enabled:true,...current,locked:false,available:false,remaining:current.earned,spent:0,rescued:[],rescuedNames:[]};
}
function lockProtection(room){
  if(!hasEvade(room))return;
  for(let seat=0;seat<room.players.length;seat++){
    const player=room.players[seat];if(player.evadeAward)continue;
    const current=player.out?{properties:0,improved:0,points:0,earned:0}:portfolio(room,seat);
    player.evadeAward={version:1,...current,remaining:current.earned,rescued:[],lockedRound:room.round};
    if(!player.out)room.log.unshift(player.name+' locked '+current.earned+' evade token'+(current.earned===1?'':'s')+' from '+current.properties+' properties and '+current.improved+' upgraded properties.');
  }
}
function useEvade(room,player,id){
  const award=player.evadeAward;
  if(!hasEvade(room)||room.stage!=='playing'||room.collapse.wave<1||!lost(room,id)||player.out||!award||award.remaining<=0||award.rescued.includes(id))return null;
  award.remaining--;award.rescued.push(id);
  return {id,remaining:award.remaining,earned:award.earned};
}
function markNext(room){
  const next=[];
  // One, then two, then three properties per world. Every draw is host-owned,
  // persisted and announced for the entire preceding round.
  for(let board=0;board<3;board++){
    const pool=deeds.filter(d=>d.board===board&&!lost(room,d.id));
    const count=Math.min(pool.length,Math.min(3,room.collapse.wave+1));
    for(let i=0;i<count;i++){const picked=choose(pool);next.push(picked.id);pool.splice(pool.indexOf(picked),1);}
  }
  room.collapse.endangered=next;
  if(next.length)room.log.unshift('Next collapse wave: '+next.map(id=>deeds.find(d=>d.id===id).name).join(', ')+'. These spaces disappear after this full round.');
}
function startRound(room){
  if(countdown.isCountdown(room))return countdown.startRound(room);
  if(!isExpress(room)||!room.collapse)return;
  const state=room.collapse;
  if(!state.midpointGranted&&room.round>=Math.ceil(room.rounds/2)+1){
    state.midpointGranted=true;
    for(const p of room.players)if(!p.out)p.perks.push('building');
    room.log.unshift('Express midpoint: every remaining player received another Building Permit.');
  }
  if(room.round>=room.rounds-4&&room.round<=room.rounds){
    const remaining=room.rounds-room.round+1;
    room.log.unshift(remaining===1?'FINAL BUILDING ROUND — WORLD COLLAPSE APPROACHING. Marked properties disappear after everyone finishes this round.':'World Collapse warning: '+remaining+' building rounds remain. Cracks and tremors are visual warnings; every property still works normally.');
  }
  if(room.round===room.rounds&&!state.endangered.length)markNext(room);
  if(room.round>room.rounds){
    if(state.wave===0)lockProtection(room);
    state.wave++;
    for(const id of state.endangered){state.lost[id]=state.wave;if(room.owned[id])room.owned[id].lost=true;}
    room.foreclosures=(room.foreclosures||[]).filter(f=>!lost(room,f.deedId));
    room.log.unshift(state.wave===1?'WORLD COLLAPSE HAS BEGUN. Marked properties are now fatal landing spaces. Last player standing wins.':'Collapse · Wave '+state.wave+': marked properties have disappeared.');
    markNext(room);
  }
}
function eliminate(room,player,reason){
  player.out=true;player.outReason=reason;player.eliminatedRound=room.round;
  player.eliminationOrder=1+Math.max(0,...room.players.map(p=>p.eliminationOrder||0));
}
module.exports={isExpress,lost,initialize,goAward,startRound,eliminate,hasEvade,portfolio,protection,lockProtection,useEvade};
