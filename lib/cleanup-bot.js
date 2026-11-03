'use strict';
const crypto=require('node:crypto'),rules=require('../public/cleanup-rules'),{deeds}=require('../game-data.json'),catalog=new Map(deeds.map(d=>[d.id,d]));
const bad=message=>Object.assign(Error(message),{status:400});
function valid(room,i){return i.matchId===room.matchId&&room.owned[i.deed]?.owner===i.owner&&!room.players[i.owner]?.out&&!room.owned[i.deed]?.mortgage;}
function close(room,i,status='closed'){room.cleanup.effects[i.deed]={closedUntil:room.round+(status==='auto-closed'?1:2),bonusUntil:0};i.status=status;i.resolvedRound=room.round;room.log.unshift(catalog.get(i.deed).name+' is closed for maintenance until round '+room.cleanup.effects[i.deed].closedUntil+'.');}
function plan(room,board){const pool=deeds.filter(d=>d.board===board&&room.owned[d.id]&&!room.owned[d.id].mortgage&&!room.players[room.owned[d.id].owner]?.out),stops=[];while(pool.length&&stops.length<2){const [d]=pool.splice(crypto.randomInt(pool.length),1);stops.push(d.pos);}return stops.sort((a,b)=>a-b).concat(0);}
function round(room){
 if(!rules.enabled(room)||room.stage!=='playing'||room.rounds>0&&room.round>room.rounds)return;
 const c=room.cleanup;
 if(c){for(const [id,e] of Object.entries(c.effects))if(!room.owned[id]||Math.max(e.closedUntil||0,e.bonusUntil||0)<=room.round)delete c.effects[id];for(const i of c.inspections)if(i.status==='pending'){if(!valid(room,i))i.status='expired';else if(room.round>=i.dueRound)close(room,i,'auto-closed');}}
 if(room.round%5||c?.active||c?.startedRound===room.round)return;
 room.cleanup={rule:'service-v1',active:true,startedRound:room.round,board:0,pos:0,stops:plan(room,0),stopIndex:0,sequence:(c?.sequence||0)+1,lastMove:null,effects:c?.effects||{},inspections:c?.inspections.slice(-60)||[]};
 room.log.unshift('Neighborhood Service Bot tour begins at Richmond Hill GO. It visits all three neighborhoods; next tour in round '+(room.round+5)+'.');
}
function tick(room){
 const c=room.cleanup;if(!rules.enabled(room)||room.stage!=='playing'||!c?.active)return;
 const board=c.board,from=c.pos,target=c.stops?.[c.stopIndex++]??0,end=target>from?target:16,path=Array.from({length:end-from},(_,n)=>(from+n+1)%16),pos=end%16;
 c.lastMove={id:crypto.randomUUID(),board,from,path,pos,at:Date.now()};c.pos=pos;
 if(end===16){if(board===2){c.active=false;room.log.unshift('Neighborhood Service Bot completed all three neighborhoods. Tour complete.');}else{c.board++;c.pos=0;c.stops=plan(room,c.board);c.stopIndex=0;room.log.unshift('Service Bot completed a lap and teleported to '+['Richmond Hill','The Communities','Coastal Georgia'][c.board]+' GO.');}return;}
 const id=board+'-'+pos,deed=catalog.get(id),o=room.owned[id];
 if(!deed||!o||o.mortgage||room.players[o.owner]?.out)return;
 const i={id:crypto.randomUUID(),matchId:room.matchId,deed:id,owner:o.owner,fee:rules.fee(deed,o),round:room.round,dueRound:room.round+1,status:'pending'};c.inspections.push(i);
 room.log.unshift('Service Bot inspected '+deed.name+'. '+room.players[o.owner].name+' can maintain, renovate or close it before round '+i.dueRound+'.');
}
function publicState(room){if(!rules.enabled(room)||!room.cleanup)return null;const c=room.cleanup;return {...c,nextStop:catalog.get(c.board+'-'+(c.stops?.[c.stopIndex]||0))?.name||'GO',inspections:c.inspections.map(i=>({...i,name:catalog.get(i.deed)?.name||i.deed,status:i.status==='pending'&&!valid(room,i)?'expired':i.status}))};}
function act(room,player,id,choice){
 if(!rules.enabled(room)||room.stage!=='playing'||player.out)throw bad('Service inspections are available to active players in Standard mode.');
 const c=room.cleanup,i=c?.inspections.find(i=>i.id===id),seat=room.players.indexOf(player);
 if(!i||i.status!=='pending'||!valid(room,i)||room.round>=i.dueRound)throw bad('This inspection is no longer available.');
 if(i.owner!==seat)throw bad('Only the property owner can choose service.');
 if(!['maintain','renovate','close'].includes(choice))throw bad('Choose Maintain, Renovate or Close temporarily.');
 if(choice==='close')close(room,i);
 else{const cost=i.fee*(choice==='renovate'?2:1),due=room.turn===seat?room.obligation?.amount||0:0;if(player.cash-due<cost)throw bad('Not enough cash after reserving your current bill. Choose temporary closure or raise cash first.');player.cash-=cost;i.status=choice==='renovate'?'renovated':'maintained';i.resolvedRound=room.round;c.effects[i.deed]={closedUntil:0,bonusUntil:choice==='renovate'?room.round+3:0};room.log.unshift(player.name+' paid $'+cost+' for '+choice+' at '+catalog.get(i.deed).name+'. This service payment leaves the game.'+(choice==='renovate'?' Rent +25% until round '+(room.round+3)+'.':''));}
 return 'Service inspection resolved for '+catalog.get(i.deed).name+'.';
}
module.exports={round,tick,act,publicState};
