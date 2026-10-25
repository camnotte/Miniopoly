'use strict';
const crypto=require('node:crypto'),{deeds}=require('../game-data.json'),catalog=new Map(deeds.map(d=>[d.id,d]));
const bad=message=>Object.assign(Error(message),{status:400});
const safe=room=>room.stage==='playing'&&['roll','post','end'].includes(room.phase)&&!room.obligation&&!room.pending;
const snapshot=(room,id)=>JSON.stringify([room.owned[id]?.owner,room.owned[id]?.level||0,!!room.owned[id]?.mortgage,!!room.collapse?.shieldSpent?.[id]]);
function valid(room,offer){
 if(offer.matchId!==room.matchId||room.stage!=='playing'||room.players[offer.from]?.out||room.players[offer.to]?.out)return false;
 return [...offer.give,...offer.take].every(id=>room.owned[id]&&!room.collapse?.lost?.[id]&&snapshot(room,id)===offer.assets[id]);
}
function list(room,viewer){const seat=room.players.indexOf(viewer);return (room.trades||[]).filter(t=>t.from===seat||t.to===seat).slice(-60).map(t=>({...t,status:t.status==='pending'&&!valid(room,t)?'expired':t.status,assets:undefined}));}
function act(room,player,kind,id,input={}){
 const seat=room.players.indexOf(player);if(player.out||room.stage!=='playing')throw bad('Trading is available to active players during a match.');
 room.trades||=[];
 if(kind==='trade-propose'){
  if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(key=>!['to','give','take','cashGive','cashTake','replaces'].includes(key)))throw bad('Choose valid trade terms.');
  if(!safe(room))throw bad('Resolve the current landing or payment before proposing a trade.');
  const to=room.players.findIndex(p=>p.id===input.to);if(to<0||to===seat||room.players[to].out)throw bad('Choose another active player.');
  const ids=value=>{if(!Array.isArray(value)||value.length>deeds.length||new Set(value).size!==value.length||value.some(id=>typeof id!=='string'||!catalog.has(id)))throw bad('Choose valid, distinct properties.');return value;};
  const give=ids(input.give||[]),take=ids(input.take||[]),cashGive=input.cashGive??0,cashTake=input.cashTake??0;
  if(!Number.isSafeInteger(cashGive)||!Number.isSafeInteger(cashTake)||cashGive<0||cashTake<0)throw bad('Cash must be a whole, nonnegative amount.');
  if(!give.length&&!take.length&&!cashGive&&!cashTake)throw bad('Add a property or cash to the offer.');
  if(cashGive>player.cash||cashTake>room.players[to].cash)throw bad('A player does not have the offered cash.');
  if(give.some(id=>room.owned[id]?.owner!==seat||room.collapse?.lost?.[id])||take.some(id=>room.owned[id]?.owner!==to||room.collapse?.lost?.[id]))throw bad('A selected property is no longer available.');
  let prior;if(input.replaces){prior=room.trades.find(t=>t.id===input.replaces);if(!prior||prior.to!==seat||prior.from!==to||prior.status!=='pending'||!valid(room,prior))throw bad('That offer can no longer be countered.');}
  if(room.trades.filter(t=>t.status==='pending'&&valid(room,t)&&t.from===seat).length>=8)throw bad('Withdraw an open offer before sending another.');
  const offer={id:crypto.randomUUID(),matchId:room.matchId,from:seat,to,give,take,cashGive,cashTake,status:'pending',at:Date.now(),assets:Object.fromEntries([...give,...take].map(id=>[id,snapshot(room,id)]))};
  if(prior)prior.status='countered';room.trades.push(offer);if(room.trades.length>100){const pending=room.trades.filter(t=>t.status==='pending'&&valid(room,t)),history=room.trades.filter(t=>!pending.includes(t)).slice(-60);room.trades=[...pending,...history].sort((a,b)=>a.at-b.at);}return player.name+' sent a trade offer to '+room.players[to].name+'.';
 }
 const offer=room.trades.find(t=>t.id===id);if(!offer)throw bad('Trade offer not found.');
 if(offer.status!=='pending'||!valid(room,offer))throw bad('That trade is no longer available.');
 if(kind==='trade-cancel'){if(offer.from!==seat)throw bad('Only the sender can withdraw this offer.');offer.status='withdrawn';return player.name+' withdrew a trade offer.';}
 if(offer.to!==seat)throw bad('Only the recipient can respond to this offer.');
 if(kind==='trade-reject'){offer.status='declined';return player.name+' declined a trade offer.';}
 if(kind!=='trade-accept')throw bad('Unknown trade action.');
 if(!safe(room))throw bad('Resolve the current landing or payment before accepting a trade.');
 const a=room.players[offer.from],b=room.players[offer.to];if(a.cash<offer.cashGive||b.cash<offer.cashTake)throw bad('A player no longer has the offered cash.');
 a.cash+=offer.cashTake-offer.cashGive;b.cash+=offer.cashGive-offer.cashTake;
 for(const id of offer.give)room.owned[id].owner=offer.to;for(const id of offer.take)room.owned[id].owner=offer.from;offer.status='accepted';
 for(const other of room.trades)if(other.status==='pending'&&!valid(room,other))other.status='expired';
 return a.name+' and '+b.name+' completed a trade: '+[...offer.give,...offer.take].map(id=>catalog.get(id).name).join(', ')+(offer.cashGive||offer.cashTake?' · cash exchanged':'')+'.';
}
module.exports={safe,snapshot,valid,list,act};
