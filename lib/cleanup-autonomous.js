'use strict';
const crypto=require('node:crypto'),rules=require('../public/cleanup-rules'),{deeds}=require('../game-data.json'),{announce}=require('./cleanup-messages');
const catalog=Object.fromEntries(deeds.map(d=>[d.id,d])),MOVE_MS=6000,VISIT_MS=4000;
const enabled=room=>room?.cleanupServiceVersion===3;
const bad=message=>Object.assign(Error(message),{status:400});
function enable(room,now=Date.now()){
 if(!rules.enabled(room))return false;
 const changed=!enabled(room);room.cleanupServiceVersion=3;
 const c=room.cleanup;if(!c)return changed;
 c.jobs||=[];c.inspections||=[];c.effects||={};
 if(c.houseCall){const h=c.houseCall;if(!c.jobs.some(j=>j.id===h.id))c.jobs.push({...h});delete c.houseCall;}
 delete c.cooldownUntil;c.watchers=[];c.notices={};
 if(c.active&&!Number.isFinite(c.nextMoveAt))c.nextMoveAt=now+MOVE_MS;
 if(c.displayLocation&&!Number.isFinite(c.displayUntil))c.displayUntil=now+VISIT_MS;
 // A paid job was never saved in a half-completed state. Resume an interrupted trip once.
 for(const j of c.jobs)if(j.status==='travelling'&&!Number.isFinite(j.arriveAt))j.arriveAt=now+VISIT_MS;
 return changed;
}
function ensure(room){enable(room);return room.cleanup||=( {rule:'service-v3',active:false,board:0,pos:0,sequence:0,lastMove:null,effects:{},inspections:[],jobs:[],watchers:[],notices:{}} );}
function valid(room,j){const o=room.owned[j.deed];return j.matchId===room.matchId&&o?.owner===j.owner&&!o.mortgage&&!room.players[j.owner]?.out&&o.maintainedRound===j.maintenanceStart&&(o.serviceCount||0)===j.serviceCount;}
const waiting=j=>['booked','travelling'].includes(j.status);
function cancel(job,reason){job.status='cancelled';job.reason=reason;}
function reconcile(room){
 const c=room.cleanup;if(!c)return false;let changed=false;
 for(const j of c.jobs||[])if(waiting(j)&&!valid(room,j)){cancel(j,'Property was sold, cleaned or became unavailable. Reserved cash released.');changed=true;}
 // Mandatory bills always take priority over optional service reservations.
 for(let seat=0;seat<room.players.length;seat++){const p=room.players[seat],due=rules.billDue(room,seat);if(due>0&&p.cash-rules.reserved(room,p)<due){for(const j of [...(c.jobs||[])].reverse())if(waiting(j)&&j.owner===seat){cancel(j,'Reserved cash released to pay a required bill.');changed=true;if(p.cash-rules.reserved(room,p)>=due)break;}}}
 return changed;
}
function book(room,player,ids,choice,quotes){
 if(!rules.enabled(room)||room.stage!=='playing'||player.out)throw bad('House calls are available to active Standard players.');
 const c=ensure(room),seat=room.players.indexOf(player);reconcile(room);
 if(choice==='cancel'){const j=c.jobs.find(j=>j.id===ids&&j.owner===seat&&j.status==='booked');if(!j)throw bad('Only the booking owner can cancel a waiting house call.');cancel(j,'Cancelled by owner. Reserved cash released.');return j.reason;}
 if(choice==='notify')return 'The bot accepts requests at any time. Review a property quote to book.';
 if(choice!=='book')throw bad('Choose Book or Cancel.');
 const list=Array.isArray(ids)?ids:[ids],keys=Array.isArray(quotes)?quotes:[quotes];
 if(!list.length||list.length>deeds.length||new Set(list).size!==list.length||keys.length!==list.length)throw bad('Choose distinct properties with current quotes.');
 const jobs=list.map((id,index)=>{const o=room.owned[id],d=catalog[id];if(!d||!o||o.owner!==seat||o.mortgage)throw bad('Choose your own unmortgaged properties.');if(c.jobs.some(j=>waiting(j)&&j.deed===id))throw bad(d.name+' already has a queued visit.');const q=rules.quote(room,d);if(keys[index]!==q.key)throw bad('The quote changed. Review the current total before confirming.');return {id:crypto.randomUUID(),deed:id,owner:seat,playerId:player.id,matchId:room.matchId,status:'booked',maintenanceStart:o.maintainedRound,serviceCount:o.serviceCount||0,...q,bookedRound:room.round,bookedAt:Date.now()};});
 const total=jobs.reduce((sum,j)=>sum+j.total,0),due=rules.billDue(room,seat);if(player.cash-rules.reserved(room,player)-due<total)throw bad('Not enough available cash after protecting bills and existing service bookings.');
 c.jobs.push(...jobs);for(const j of jobs){const d=catalog[j.deed];announce(room,'booked',{property:d.name,owner:player.name,board:d.board,pos:d.pos});}
 return jobs.length+' house call'+(jobs.length===1?'':'s')+' queued. $'+total+' reserved. The bot travels automatically; no round cooldown.';
}
function pulse(room,now,travelTick){
 if(!enabled(room)||!rules.enabled(room)||room.stage!=='playing'||!room.cleanup)return false;
 const c=room.cleanup;c.jobs||=[];let changed=reconcile(room);
 let travelling=c.jobs.find(j=>j.status==='travelling');
 if(travelling){if(now<travelling.arriveAt)return changed;const j=travelling,p=room.players[j.owner],other=rules.reserved(room,p)-j.total,due=rules.billDue(room,j.owner);
  if(!valid(room,j)||p.cash-other-due<j.total){cancel(j,'Cash or property is no longer available. Reserved cash released.');}
  else{p.cash-=j.total;const o=room.owned[j.deed],d=catalog[j.deed];o.maintainedRound=room.round;o.cleanedRound=room.round;o.serviceCount=(o.serviceCount||0)+1;c.effects[j.deed]={closedUntil:0,bonusUntil:0};j.status='completed';j.completedRound=room.round;j.completedAt=now;for(const i of c.inspections)if(i.status==='pending'&&i.deed===j.deed)i.status='maintained';announce(room,'complete',{property:d.name,owner:p.name,board:d.board,pos:d.pos});room.log.unshift(p.name+' paid $'+j.total+' for maintenance at '+d.name+'. Condition restored to 100%.');}
  c.displayUntil=now+2000;c.nextMoveAt=now+2000;return true;
 }
 if(c.displayLocation){if(now<(c.displayUntil||0))return changed;delete c.displayLocation;delete c.displayUntil;c.lastMove=null;changed=true;}
 const next=c.jobs.find(j=>j.status==='booked');
 if(next){const d=catalog[next.deed];next.status='travelling';next.startedAt=now;next.arriveAt=now+VISIT_MS;c.displayLocation={board:d.board,pos:d.pos};c.displayUntil=next.arriveAt;c.lastMove={id:crypto.randomUUID(),kind:'house-call',board:d.board,from:d.pos,path:[d.pos],pos:d.pos,at:now};announce(room,'housecall',{property:d.name,owner:room.players[next.owner].name,board:d.board,pos:d.pos});return true;}
 if((c.active||c.tourQueue?.length)&&now>=(c.nextMoveAt||0)){travelTick(room);room.cleanup.nextMoveAt=now+MOVE_MS;return true;}
 // Keep receipts bounded while retaining every pending visit.
 if(c.jobs.length>80){const completed=c.jobs.filter(j=>!waiting(j)).slice(-50);c.jobs=[...completed,...c.jobs.filter(waiting)];changed=true;}
 return changed;
}
function publicState(room,viewer){const c=room.cleanup;if(!c)return null;const seat=viewer?room.players.indexOf(viewer):-1,jobs=c.jobs||[],mine=jobs.filter(j=>j.owner===seat);return {serviceVersion:3,nextMoveAt:c.nextMoveAt||null,houseCalls:jobs,houseCall:mine.at(-1)||null,queuedCount:jobs.filter(waiting).length,botBusy:jobs.some(j=>j.status==='travelling'),cooldownUntil:0};}
module.exports={enabled,enable,ensure,reconcile,book,pulse,publicState,MOVE_MS,VISIT_MS,waiting};
