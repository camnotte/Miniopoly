'use strict';
const crypto=require('node:crypto'),{deeds}=require('../game-data.json');
const development=require('../public/property-development');
const isCountdown=room=>room.gameMode==='countdown';
const active=(room,seat)=>deeds.filter(d=>room.owned[d.id]?.owner===seat&&!room.collapse?.lost?.[d.id]);
function mark(room){
 const pool=deeds.filter(d=>room.owned[d.id]&&!room.players[room.owned[d.id].owner]?.out&&!room.collapse.lost[d.id]),next=[];
 const count=Math.min(pool.length,room.collapse.wave+1);
 for(let i=0;i<count;i++){const index=crypto.randomInt(pool.length);next.push(pool.splice(index,1)[0].id);}
 room.collapse.endangered=next;
 if(next.length)room.log.unshift('Tsunami: next wave targets '+next.map(id=>deeds.find(d=>d.id===id).name).join(', ')+'. One full round to prepare.');
}
function startRound(room){
 const state=room.collapse;if(!isCountdown(room)||!state)return;
 if(!state.midpointGranted&&room.round>=Math.ceil(room.rounds/2)+1){state.midpointGranted=true;for(const p of room.players)if(!p.out)p.perks.push('building');room.log.unshift('Tsunami midpoint: each remaining player received a Building Permit.');}
 if(room.round===room.rounds&&!state.endangered.length)mark(room);
 if(room.round<=room.rounds)return;
 state.wave++;
 const counts=room.players.map((_,seat)=>active(room,seat).length);state.lastConsumed=[];state.lastProtected=[];
 for(const id of state.endangered){
  const ownership=room.owned[id];if(!ownership||room.players[ownership.owner]?.out||state.lost[id])continue;
  const deed=deeds.find(d=>d.id===id);
  if(ownership.level>0&&!state.shieldSpent[id]){development.remove(ownership,{damage:true});state.shieldSpent[id]=true;state.lastProtected.push(id);room.log.unshift('Flood protection saved '+deed.name+'. One upgrade was lost; this property cannot earn flood protection again.');}
  else{state.lost[id]=state.wave;state.lastConsumed.push(id);delete room.owned[id];room.log.unshift('The tsunami submerged '+deed.name+' and all of its remaining upgrades.');}
 }
 const nextOrder=1+Math.max(0,...room.players.map(p=>p.eliminationOrder||0));
 for(let seat=0;seat<room.players.length;seat++){
  const p=room.players[seat];if(p.out||active(room,seat).length)continue;
  Object.assign(p,{out:true,outReason:'countdown',eliminatedRound:room.round,eliminationOrder:nextOrder,countdownBefore:counts[seat]});p.perks=[];
  room.log.unshift(p.name+' lost their last property and is out of Tsunami.');
 }
 room.foreclosures=(room.foreclosures||[]).filter(f=>!state.lost[f.deedId]);
 if(room.players.filter(p=>!p.out).length>1)mark(room);else state.endangered=[];
}
function compare(a,b){return Number(a.bankrupt)-Number(b.bankrupt)||(b.eliminatedRound||0)-(a.eliminatedRound||0)||(b.countdownBefore||0)-(a.countdownBefore||0);}
function rank(standings){standings.sort((a,b)=>compare(a,b)||a.seat-b.seat);for(let i=0;i<standings.length;i++)standings[i].place=i&&compare(standings[i-1],standings[i])===0?standings[i-1].place:i+1;}
module.exports={isCountdown,active,mark,startRound,rank};
