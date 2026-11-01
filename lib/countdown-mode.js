'use strict';
const crypto=require('node:crypto'),{deeds}=require('../game-data.json');
const development=require('../public/property-development'),legacy=require('./countdown-legacy');
const catalog=new Map(deeds.map(d=>[d.id,d]));
const RULE='directional-v1',MAX_WAVES=5,AUCTION_MS=90000;
const isCountdown=room=>room?.gameMode==='countdown';
const directional=room=>isCountdown(room)&&room.collapse?.rule===RULE;
const active=(room,seat)=>deeds.filter(d=>room.owned[d.id]?.owner===seat&&!room.collapse?.lost?.[d.id]);
const fail=message=>{throw Object.assign(Error(message),{status:400});};
function initialize(){return {version:2,kind:'countdown',rule:RULE,wave:0,maxWaves:MAX_WAVES,lost:{},sites:{},shieldSpent:{},temporary:{},shieldUsed:{},endangered:[],midpointGranted:false,direction:null,warningRound:null,calm:false,complete:false,auctionRule:'live-v1',auctionQueue:[],recoveryRound:null,auction:null,lastAuction:null};}
function edge(position){return position>0&&position<4?'north':position>4&&position<8?'east':position>8&&position<12?'south':position>12&&position<16?'west':null;}
function exposed(room,id){const d=catalog.get(id),direction=room.collapse?.direction;if(!d||!direction)return false;const e=edge(d.pos);return ['north','south'].includes(direction)?['north','south'].includes(e):['east','west'].includes(e);}
function pool(room){return deeds.filter(d=>exposed(room,d.id)&&room.owned[d.id]&&!room.players[room.owned[d.id].owner]?.out&&!room.collapse.lost[d.id]);}
function mark(room){
 if(!directional(room))return legacy.mark(room);
 const state=room.collapse;state.endangered=state.calm?[]:pool(room).map(d=>d.id);
}
function pick(room){const available=pool(room),selected=[];for(let i=0;i<3&&available.length;i++)selected.push(available.splice(crypto.randomInt(available.length),1)[0].id);return selected;}
function rebuildCost(id){return Math.max(50,Math.ceil((catalog.get(id)?.price||0)/2));}
function migrate(room){
 if(!directional(room))return false;const s=room.collapse;let changed=false;
 if(s.auctionRule!=='live-v1'){s.auctionRule='live-v1';changed=true;}
 if(!Array.isArray(s.auctionQueue)){s.auctionQueue=[];changed=true;}
 if(room.phase==='tsunami-auction'){room.phase='roll';changed=true;}
 return changed;
}
function reserved(room,player){
 if(!directional(room)||player?.out)return 0;const seat=room.players.indexOf(player),a=room.collapse.auction;
 return a?Object.values(a.bids[seat]||{}).reduce((n,x)=>n+x,0):0;
}
function biddingCash(room,player){const due=room.turn===room.players.indexOf(player)?room.obligation?.amount||0:0;return Math.max(0,(player?.cash||0)-due);}
function availableCash(room,player){return Math.max(0,(player?.cash||0)-reserved(room,player));}
function releaseForPayment(room,player,amount){
 if(amount<=availableCash(room,player)||!reserved(room,player))return false;
 const a=room.collapse.auction,seat=room.players.indexOf(player);a.bids[seat]=Object.fromEntries(a.lots.map(id=>[id,0]));a.cancelled||={};a.cancelled[seat]='Your sealed bids became passes so you could cover a required payment.';
 room.log.unshift(player.name+'’s sealed bids became passes to cover a required payment.');return true;
}
function activateNext(room,now=Date.now()){
 const s=room.collapse;s.auctionQueue||=[];
 while(!s.auction&&s.auctionQueue.length){const next=s.auctionQueue.shift();next.lots=next.lots.filter(id=>s.lost[id]&&s.sites[id]&&!room.owned[id]);if(next.lots.length)s.auction={...next,deadline:now+AUCTION_MS,bids:{}};}
}
function startAuction(room){
 const state=room.collapse;state.auctionQueue||=[];
 const pending=new Set([...(state.auction?.lots||[]),...state.auctionQueue.flatMap(a=>a.lots)]),available=Object.keys(state.sites).filter(id=>state.lost[id]&&!room.owned[id]);
 const ids=[...new Set([...state.lastConsumed,...available])].filter(id=>state.lost[id]&&!room.owned[id]&&!pending.has(id)).slice(0,3);
 if(!ids.length)return;
 state.auctionQueue.push({id:crypto.randomUUID(),wave:state.wave,lots:ids});activateNext(room);
 room.log.unshift('Blind redevelopment auction'+(state.auction.wave!==state.wave?' queued':' open')+': '+ids.map(id=>catalog.get(id).name).join(', ')+'. Turns continue while players bid.');
}
function resolveAuction(room,{force=false,now=Date.now()}={}){
 if(!directional(room))return false;const state=room.collapse,a=state.auction;if(!a)return false;
 const seats=room.players.map((p,seat)=>!p.out?seat:null).filter(s=>s!==null);
 if(!force&&now<a.deadline&&!seats.every(seat=>Object.hasOwn(a.bids,seat)))return false;
 for(const seat of seats)if(seat===room.turn&&room.obligation)releaseForPayment(room,room.players[seat],room.obligation.amount);
 const funded=seats.filter(seat=>Object.values(a.bids[seat]||{}).reduce((n,x)=>n+x,0)<=room.players[seat].cash),results=[];
 for(const id of a.lots){
  const entries=funded.map(seat=>({seat,amount:a.bids[seat]?.[id]||0})).filter(b=>b.amount>0&&room.players[b.seat].cash>=b.amount),highest=Math.max(0,...entries.map(b=>b.amount)),tied=entries.filter(b=>b.amount===highest);
  const winner=tied.length?tied[crypto.randomInt(tied.length)]:null;
  if(winner){room.players[winner.seat].cash-=winner.amount;room.owned[id]={owner:winner.seat,level:0,mortgage:false,lost:true};state.sites[id].boughtWave=a.wave;room.log.unshift(room.players[winner.seat].name+' won '+catalog.get(id).name+' for $'+winner.amount+'. Rebuild for $'+rebuildCost(id)+' on their turn.');}
  else room.log.unshift('No bids for '+catalog.get(id).name+'; the submerged site remains bank-held.');
  results.push({id,winner:winner?.seat??null,price:winner?.amount||0,bids:seats.map(seat=>({seat,amount:a.bids[seat]?.[id]||0})),tied:tied.length>1});
 }
 state.lastAuction={id:a.id,wave:a.wave,results};state.auctionHistory=[...(state.auctionHistory||[]),state.lastAuction].slice(-5);state.auction=null;if(room.phase==='tsunami-auction')room.phase='roll';activateNext(room,now);if(state.calm&&!state.auction)state.recoveryRound=room.round+1;return true;
}
function bid(room,player,auctionId,bids){
 if(!directional(room)||room.stage!=='playing'||!room.collapse.auction)fail('No blind auction is open.');
 const a=room.collapse.auction,seat=room.players.indexOf(player);
 if(auctionId!==a.id)fail('This auction has ended. Review the current auction.');
 if(player.out||seat<0)fail('Only active players can bid.');
 if(Date.now()>=a.deadline)fail('The bidding deadline has passed.');
 if(Object.hasOwn(a.bids,seat))fail('Your sealed bids have already been submitted.');
 if(!bids||typeof bids!=='object'||Array.isArray(bids)||Object.keys(bids).some(id=>!a.lots.includes(id)))fail('Choose valid auction sites.');
 const amounts={};let total=0;
 for(const id of a.lots){const amount=bids[id]??0;if(!Number.isSafeInteger(amount)||amount<0)fail('Bids must be whole, nonnegative dollar amounts.');total+=amount;if(!Number.isSafeInteger(total))fail('The bid total is too large.');amounts[id]=amount;}
 if(total>biddingCash(room,player))fail('Your combined bids exceed cash available after required payments.');
 a.bids[seat]=amounts;room.log.unshift(player.name+' submitted sealed bids.');resolveAuction(room);
}
function shield(room,player,id){
 const state=room.collapse,seat=room.players.indexOf(player);
 if(!directional(room)||room.stage!=='playing'||state.calm||!state.direction||room.turn!==seat||!['roll','post'].includes(room.phase))fail('Use a Wave Shield on your turn during a wave warning.');
 if(room.owned[id]?.owner!==seat||state.lost[id]||!exposed(room,id))fail('Choose one of your exposed, functioning properties.');
 if((player.waveShields||0)<1)fail('You have no Wave Shield cards.');
 if(state.shieldUsed[seat]===state.wave+1)fail('You have already used a Wave Shield for this wave.');
 player.waveShields--;state.temporary[id]=state.wave+1;state.shieldUsed[seat]=state.wave+1;
 room.log.unshift(player.name+' protected '+catalog.get(id).name+' for wave '+(state.wave+1)+' with a Wave Shield.');
}
function rebuild(room,player,id){
 const state=room.collapse,seat=room.players.indexOf(player);
 if(!directional(room)||room.stage!=='playing'||room.turn!==seat||!['roll','post'].includes(room.phase))fail('Rebuild on your turn before rolling or after resolving your landing.');
 if(!state.lost[id]||!state.sites[id]||room.owned[id]?.owner!==seat)fail('Win this submerged site at auction before rebuilding.');
 const cost=rebuildCost(id);if(availableCash(room,player)<cost)fail('You need $'+cost+' to rebuild this site.');
 player.cash-=cost;delete state.lost[id];delete room.owned[id].lost;delete state.sites[id];
 mark(room);room.log.unshift(player.name+' rebuilt '+catalog.get(id).name+' for $'+cost+'. Base rent and deed value are restored; further development follows the normal set rules.');
}
function startRound(room){
 if(!directional(room))return legacy.startRound(room);
 const s=room.collapse;if(!s)return;
 if(!s.midpointGranted&&room.round>=Math.ceil(room.rounds/2)+1){s.midpointGranted=true;for(const p of room.players)if(!p.out)p.perks.push('building');room.log.unshift('Tsunami midpoint: each remaining player received a Building Permit.');}
 if(room.round>=room.rounds-1&&!s.direction){s.direction=['north','south','east','west'][crypto.randomInt(4)];s.warningRound=room.round;room.log.unshift('SIRENS FROM THE '+s.direction.toUpperCase()+'. The first wave hits after building round '+room.rounds+'. Two full rounds to prepare. This direction stays fixed for all five waves.');}
 mark(room);if(room.round<=room.rounds)return;
 if(s.calm){if(!s.auction&&!s.auctionQueue?.length&&room.round>(s.recoveryRound??room.round-1))s.complete=true;return;}
 s.wave++;s.lastConsumed=[];s.lastProtected=[];s.lastTargets=pick(room);
 for(const id of s.lastTargets){
  const o=room.owned[id],d=catalog.get(id);
  if(s.temporary[id]===s.wave){s.lastProtected.push(id);room.log.unshift('Wave Shield saved '+d.name+' without spending its development protection.');}
  else if(o.level>0&&!s.shieldSpent[id]){development.remove(o,{damage:true});s.shieldSpent[id]=true;s.lastProtected.push(id);room.log.unshift('Flood protection saved '+d.name+'. One development was lost; its built-in shield is now spent.');}
  else{s.lost[id]=s.wave;s.sites[id]={destroyedWave:s.wave,previousOwner:o.owner};s.lastConsumed.push(id);delete room.owned[id];room.log.unshift('The wave submerged '+d.name+'. The deed and buildings are gone; the site can be auctioned and rebuilt.');}
 }
 s.temporary={};room.foreclosures=(room.foreclosures||[]).filter(f=>!s.lost[f.deedId]);
 s.calm=s.wave>=MAX_WAVES;mark(room);
 room.log.unshift(s.calm?'The ocean is calm. Finish outstanding auctions, then everyone gets a full recovery round before scoring.':'Wave '+s.wave+' of '+MAX_WAVES+' struck from the '+s.direction+'. The next wave follows after one full round.');
 startAuction(room);if(s.calm&&!s.auction)s.recoveryRound=room.round;
}
function publicState(room,viewer){
 if(!directional(room))return room.collapse||null;
 const s=room.collapse,a=s.auction,seat=room.players.indexOf(viewer);
 return {...s,auction:a?{id:a.id,wave:a.wave,lots:a.lots.map(id=>({id,rebuildCost:rebuildCost(id)})),deadline:a.deadline,bidBudget:biddingCash(room,viewer),serverNow:Date.now(),submitted:Object.keys(a.bids).map(Number).filter(seat=>!room.players[seat]?.out),yourBids:Object.hasOwn(a.bids,seat)?{...a.bids[seat]}:null,yourCancellation:a.cancelled?.[seat]||null}:null};
}
function rank(standings,room){
 if(!directional(room))return legacy.rank(standings);
 const compare=(a,b)=>Number(a.bankrupt)-Number(b.bankrupt)||b.worth-a.worth;
 standings.sort((a,b)=>compare(a,b)||a.seat-b.seat);for(let i=0;i<standings.length;i++)standings[i].place=i&&compare(standings[i-1],standings[i])===0?standings[i-1].place:i+1;
}
module.exports={RULE,MAX_WAVES,AUCTION_MS,isCountdown,directional,initialize,migrate,reserved,availableCash,biddingCash,releaseForPayment,active,mark,startRound,rank,edge,exposed,pool,rebuildCost,bid,rebuild,shield,resolveAuction,publicState};
