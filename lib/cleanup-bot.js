'use strict';
const crypto=require('node:crypto'),rules=require('../public/cleanup-rules'),{deeds}=require('../game-data.json'),catalog=new Map(deeds.map(d=>[d.id,d]));
const {announce}=require('./cleanup-messages');
const bad=message=>Object.assign(Error(message),{status:400});
function valid(room,i){return i.matchId===room.matchId&&room.owned[i.deed]?.owner===i.owner&&!room.players[i.owner]?.out&&!room.owned[i.deed]?.mortgage;}
function close(room,i,status='closed'){room.cleanup.effects[i.deed]={closedUntil:room.round+(status==='auto-closed'?1:2),bonusUntil:0};i.status=status;i.resolvedRound=room.round;room.log.unshift(catalog.get(i.deed).name+' is closed for maintenance until round '+room.cleanup.effects[i.deed].closedUntil+'.');}
function plan(room,board){const pool=deeds.filter(d=>d.board===board&&room.owned[d.id]&&!room.owned[d.id].mortgage&&!room.players[room.owned[d.id].owner]?.out),stops=[];while(pool.length&&stops.length<2){const [d]=pool.splice(crypto.randomInt(pool.length),1);stops.push(d.pos);}return stops.sort((a,b)=>a-b).concat(0);}
function stamp(room){if(!rules.enabled(room)||room.stage!=='playing')return false;let changed=false;for(const o of Object.values(room.owned||{}))if(!Number.isInteger(o.maintainedRound)){o.maintainedRound=room.round;changed=true;}return changed;}
function ensure(room){return room.cleanup||=( {rule:'service-v2',active:false,board:0,pos:0,sequence:0,lastMove:null,effects:{},inspections:[],watchers:[],notices:{}} );}
function targetValid(room,h){return h.matchId===room.matchId&&room.owned[h.deed]?.owner===h.owner&&!room.owned[h.deed].mortgage&&!room.players[h.owner]?.out&&room.owned[h.deed].maintainedRound===h.maintenanceStart&&(room.owned[h.deed].serviceCount||0)===h.serviceCount;}
function busy(room){const c=room.cleanup;return c?.inspections.find(i=>i.id===c.currentInspection&&i.status==='pending'&&valid(room,i)&&room.round<i.dueRound);}
function reconcile(room){
 if(!rules.enabled(room)||room.stage!=='playing')return;stamp(room);const c=room.cleanup;if(!c)return;if(c.currentInspection===undefined&&c.active){const i=[...c.inspections].reverse().find(i=>i.status==='pending'&&i.deed===c.board+'-'+c.pos&&valid(room,i));c.currentInspection=i?.id||null;}
 const h=c.houseCall;if(h?.status==='booked'){
  if(!targetValid(room,h)){h.status='cancelled';h.reason='Property was sold, cleaned or became unavailable. Reserved cash released.';}
  else if(!busy(room)){
   const p=room.players[h.owner],due=rules.billDue(room,h.owner);
   if(p.cash-due<h.total){h.status='cancelled';h.reason='Cash is needed for the current bill. Reserved cash released.';}
   else{const d=catalog.get(h.deed);announce(room,'housecall',{property:d.name,owner:p.name,board:d.board,pos:d.pos});p.cash-=h.total;room.owned[h.deed].maintainedRound=room.round;room.owned[h.deed].cleanedRound=room.round;room.owned[h.deed].serviceCount=(room.owned[h.deed].serviceCount||0)+1;c.effects[h.deed]={closedUntil:0,bonusUntil:0};h.status='completed';h.completedRound=room.round;c.cooldownUntil=room.round+2;c.displayLocation={board:catalog.get(h.deed).board,pos:catalog.get(h.deed).pos};c.lastMove={id:crypto.randomUUID(),kind:'house-call',board:c.displayLocation.board,from:c.displayLocation.pos,path:[c.displayLocation.pos],pos:c.displayLocation.pos,at:Date.now()};for(const i of c.inspections)if(i.status==='pending'&&i.deed===h.deed)i.status='maintained';announce(room,'complete',{property:d.name,owner:p.name,board:d.board,pos:d.pos});room.log.unshift(p.name+' paid $'+h.total+' for an immediate house call at '+catalog.get(h.deed).name+'. Condition restored to 100%. Next house call: round '+c.cooldownUntil+'.');}
  }
 }
 if(c.houseCall?.status!=='booked'&&room.round>=(c.cooldownUntil||0)&&c.watchers?.length){c.notices||={};for(const seat of c.watchers)if(!room.players[seat]?.out)c.notices[seat]={id:crypto.randomUUID(),round:room.round};c.watchers=[];}
}
function houseCall(room,player,id,choice,quote){
 if(!rules.enabled(room)||room.stage!=='playing'||player.out)throw bad('House calls are available to active Standard players.');
 const seat=room.players.indexOf(player);
 if(choice==='book'){
  const o=room.owned[id],d=catalog.get(id);if(!o||o.owner!==seat||o.mortgage||!d)throw bad('Choose your own unmortgaged property.');
  const c=room.cleanup;if(c?.houseCall?.status==='booked')throw bad('The bot already has a confirmed house call. Ask to be notified when available.');if(room.round<(c?.cooldownUntil||0))throw bad('The bot is available again in round '+c.cooldownUntil+'.');
  const q=rules.quote(room,d);if(quote!==q.key)throw bad('The quote changed. Review the current total before confirming.');const due=rules.billDue(room,seat);if(player.cash-due<q.total)throw bad('Not enough cash after reserving your current bill.');
  const state=ensure(room);state.houseCall={id:crypto.randomUUID(),deed:id,owner:seat,playerId:player.id,matchId:room.matchId,status:'booked',maintenanceStart:o.maintainedRound,serviceCount:o.serviceCount||0,...q,bookedRound:room.round};state.watchers=(state.watchers||[]).filter(s=>s!==seat);if(state.notices)delete state.notices[seat];if(busy(room))announce(room,'booked',{property:d.name,owner:player.name,board:d.board,pos:d.pos});reconcile(room);return state.houseCall.status==='completed'?'House call completed. Condition restored.':'House call booked. Cash is reserved until the current inspection finishes.';
 }
 const c=ensure(room);
 if(choice==='cancel'){const h=c.houseCall;if(!h||h.status!=='booked'||h.id!==id||h.owner!==seat)throw bad('Only the booking owner can cancel a waiting house call.');h.status='cancelled';h.reason='Cancelled by owner. Reserved cash released.';reconcile(room);return h.reason;}
 if(choice==='notify'){c.watchers||=[];if(!c.watchers.includes(seat))c.watchers.push(seat);reconcile(room);return 'The helper will notify you when the bot is available.';}
 throw bad('Choose Book, Cancel or Notify me.');
}
function round(room){
 if(!rules.enabled(room)||room.stage!=='playing'||room.rounds>0&&room.round>room.rounds)return;
 stamp(room);const c=room.cleanup;
 if(c){for(const [id,e] of Object.entries(c.effects))if(!room.owned[id]||Math.max(e.closedUntil||0,e.bonusUntil||0)<=room.round)delete c.effects[id];for(const i of c.inspections)if(i.status==='pending'){if(!valid(room,i))i.status='expired';else if(room.round>=i.dueRound)close(room,i,'auto-closed');}}
 reconcile(room);
 if(room.round%5||(c?.lastScheduledRound??c?.startedRound)===room.round)return;
 const state=ensure(room);state.lastScheduledRound=room.round;
 if(state.active||state.displayLocation||state.houseCall?.status==='booked'){state.tourQueue||=[];state.tourQueue.push(room.round);room.log.unshift('Round '+room.round+' service tour queued until the current bot work finishes.');return;}
 startTour(room,room.round);
}
function startTour(room,scheduled){const c=ensure(room);room.cleanup={...c,rule:'service-v2',active:true,startedRound:room.round,scheduledRound:scheduled,board:0,pos:0,stops:plan(room,0),stopIndex:0,sequence:(c.sequence||0)+1,lastMove:null,currentInspection:null,inspections:c.inspections.slice(-60)};announce(room,'start');room.log.unshift('Service tour scheduled for round '+scheduled+' starts at Richmond Hill GO.');}

function tick(room){
 const c=room.cleanup;if(!rules.enabled(room)||room.stage!=='playing'||!c)return;reconcile(room);if(c.houseCall?.status==='booked')return;if(c.displayLocation){delete c.displayLocation;c.lastMove=null;return;}if(!c.active){if(c.tourQueue?.length)startTour(room,c.tourQueue.shift());return;}c.currentInspection=null;
 const board=c.board,from=c.pos,target=c.stops?.[c.stopIndex++]??0,end=target>from?target:16,path=Array.from({length:end-from},(_,n)=>(from+n+1)%16),pos=end%16;
 c.lastMove={id:crypto.randomUUID(),board,from,path,pos,at:Date.now()};c.pos=pos;announce(room,'moving',{property:catalog.get(board+'-'+pos)?.name||'GO',board,pos});
 if(end===16){if(board===2){c.active=false;announce(room,'end',{board,pos});room.log.unshift('Neighborhood Service Bot completed all three neighborhoods. Tour complete.');}else{c.board++;c.pos=0;c.stops=plan(room,c.board);c.stopIndex=0;announce(room,'teleport',{property:['Richmond Hill','The Communities','Coastal Georgia'][c.board]+' GO'});room.log.unshift('Service Bot completed a lap and teleported to '+['Richmond Hill','The Communities','Coastal Georgia'][c.board]+' GO.');}return;}
 const id=board+'-'+pos,deed=catalog.get(id),o=room.owned[id];
 if(!deed||!o||o.mortgage||room.players[o.owner]?.out)return;
 if(o.cleanedRound===o.maintainedRound&&rules.condition(room,id).tier===1){room.log.unshift(deed.name+' recently passed cleaning; no new inspection fee.');return;}
 const i={id:crypto.randomUUID(),matchId:room.matchId,deed:id,owner:o.owner,fee:rules.fee(deed,o),round:room.round,dueRound:room.round+1,status:'pending'};c.inspections.push(i);c.currentInspection=i.id;announce(room,'inspection',{property:deed.name,owner:room.players[o.owner].name,board,pos});
 room.log.unshift('Service Bot inspected '+deed.name+'. '+room.players[o.owner].name+' can maintain, renovate or close it before round '+i.dueRound+'.');
}
function publicState(room){if(!rules.enabled(room)||!room.cleanup)return null;const c=room.cleanup;return {...c,botBusy:!!busy(room),nextStop:catalog.get(c.board+'-'+(c.stops?.[c.stopIndex]||0))?.name||'GO',inspections:c.inspections.map(i=>({...i,name:catalog.get(i.deed)?.name||i.deed,status:i.status==='pending'&&!valid(room,i)?'expired':i.status}))};}
function act(room,player,id,choice){
 if(!rules.enabled(room)||room.stage!=='playing'||player.out)throw bad('Service inspections are available to active players in Standard mode.');
 const c=room.cleanup,i=c?.inspections.find(i=>i.id===id),seat=room.players.indexOf(player);
 if(!i||i.status!=='pending'||!valid(room,i)||room.round>=i.dueRound)throw bad('This inspection is no longer available.');
 if(i.owner!==seat)throw bad('Only the property owner can choose service.');
 if(!['maintain','renovate','close'].includes(choice))throw bad('Choose Maintain, Renovate or Close temporarily.');
 if(choice==='close')close(room,i);
 else{const cost=i.fee*(choice==='renovate'?2:1),due=rules.billDue(room,seat);if(player.cash-due-rules.reserved(room,player)<cost)throw bad('Not enough unreserved cash after protecting your current bill and house-call booking. Choose temporary closure or raise cash first.');player.cash-=cost;room.owned[i.deed].maintainedRound=room.round;room.owned[i.deed].cleanedRound=room.round;room.owned[i.deed].serviceCount=(room.owned[i.deed].serviceCount||0)+1;i.status=choice==='renovate'?'renovated':'maintained';i.resolvedRound=room.round;c.effects[i.deed]={closedUntil:0,bonusUntil:choice==='renovate'?room.round+3:0};room.log.unshift(player.name+' paid $'+cost+' for '+choice+' at '+catalog.get(i.deed).name+'. This service payment leaves the game.'+(choice==='renovate'?' Rent +25% until round '+(room.round+3)+'.':''));}
 announce(room,choice==='close'?'closed':choice==='renovate'?'renovated':'maintained',{property:catalog.get(i.deed).name,owner:player.name,board:catalog.get(i.deed).board,pos:catalog.get(i.deed).pos});
 return 'Service inspection resolved for '+catalog.get(i.deed).name+'.';
}
module.exports={round,tick,act,publicState,stamp,reconcile,houseCall};
