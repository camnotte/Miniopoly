'use strict';
const crypto=require('node:crypto');
const trading=require('./trading');
const bad=message=>Object.assign(Error(message),{status:400});
const position=p=>[p.board,p.pos];
const turnKey=room=>JSON.stringify([room.matchId,room.turnNumber,room.turn,room.round,room.lastRoll?.at]);
function rentParties(room){
 const owner=room.obligation?.creditor;
 return room.stage==='playing'&&room.phase==='rent'&&Number.isInteger(owner)&&owner>=0&&owner!==room.turn&&room.players[owner]&&!room.players[owner].out?{debtor:room.turn,owner}:null;
}
function swapSafe(room,a,b){
 return trading.safe(room)&&a&&b&&!a.out&&!b.out&&!a.penalty&&!b.penalty&&
  !(room.gameMode==='express'&&(room.collapse?.lost?.[a.board+'-'+a.pos]||room.collapse?.lost?.[b.board+'-'+b.pos]));
}
function valid(room,offer){
 if(room.stage!=='playing'||offer.matchId!==room.matchId||room.players[offer.from]?.out||room.players[offer.to]?.out)return false;
 if(offer.type==='rent'){
  const parties=rentParties(room);
  return !!parties&&parties.debtor===offer.debtor&&parties.owner===offer.owner&&room.obligation.negotiationId===offer.debtId&&room.obligation.amount===offer.originalAmount;
 }
 const a=room.players[offer.from],b=room.players[offer.to];
 return offer.type==='swap'&&swapSafe(room,a,b)&&room.turn===offer.from&&a.perks?.includes('swap')&&offer.turnKey===turnKey(room)&&JSON.stringify([position(a),position(b)])===offer.positions;
}
function list(room,viewer){
 const seat=room.players.indexOf(viewer);
 return (room.playerDeals||[]).filter(o=>o.from===seat||o.to===seat).slice(-60).map(o=>({id:o.id,type:o.type,from:o.from,to:o.to,at:o.at,status:o.status==='pending'&&!valid(room,o)?'expired':o.status,amount:o.amount,originalAmount:o.originalAmount,debtor:o.debtor,owner:o.owner,locations:o.locations,give:[],take:[],cashGive:0,cashTake:0}));
}
function act(room,player,kind,id,input={}){
 const seat=room.players.indexOf(player);
 if(seat<0||player.out||room.stage!=='playing')throw bad('Only active players can make offers.');
 const offers=room.playerDeals||[];
 if(kind==='deal-propose'){
  if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!['type','to','amount','replaces'].includes(k)))throw bad('Choose valid offer terms.');
  let offer,prior;
  if(input.replaces){prior=offers.find(o=>o.id===input.replaces);if(!prior||prior.to!==seat||prior.status!=='pending'||!valid(room,prior)||prior.type!=='rent'||input.type!=='rent')throw bad('That rent offer can no longer be countered.');}
  if(input.type==='swap'){
   const to=room.players.findIndex(p=>p.id===input.to),other=room.players[to];
   if(to<0||to===seat||room.turn!==seat||!player.perks?.includes('swap')||!swapSafe(room,player,other))throw bad('Use a Swap Favor on your turn between moves, with another player who is not in Setback. Resolve the landing first.');
   if(player.board===other.board&&player.pos===other.pos)throw bad('Choose a player at a different location.');
   offer={type:'swap',from:seat,to,turnKey:turnKey(room),positions:JSON.stringify([position(player),position(other)]),locations:[position(player),position(other)]};
  }else if(input.type==='rent'){
   const parties=rentParties(room);
   if(!parties||(!prior&&seat!==parties.debtor))throw bad('The player owing rent can start negotiations with the property owner. Bank debts cannot be negotiated.');
   const amount=input.amount;
   if(!Number.isSafeInteger(amount)||amount<0||amount>room.obligation.amount)throw bad('Offer a whole-dollar amount from $0 up to the rent due.');
   const to=prior?prior.from:parties.owner;
   if(input.to!==undefined&&input.to!==room.players[to].id)throw bad('Negotiate only with the other party to this rent.');
   if(!room.obligation.negotiationId)room.obligation.negotiationId=crypto.randomUUID();
   offer={type:'rent',from:seat,to,amount,originalAmount:room.obligation.amount,debtor:parties.debtor,owner:parties.owner,debtId:room.obligation.negotiationId};
  }else throw bad('Choose a position swap or rent negotiation.');
  // One open proposal per sender and type; a new proposal replaces their old terms.
  for(const old of offers)if(old.status==='pending'&&old.type===offer.type&&old.from===seat)old.status='withdrawn';
  if(prior)prior.status='countered';
  Object.assign(offer,{id:crypto.randomUUID(),matchId:room.matchId,at:Date.now(),status:'pending'});
  room.playerDeals=[...offers,offer].slice(-100);
  return player.name+' offered '+(offer.type==='swap'?'a position swap':'a rent settlement')+' to '+room.players[offer.to].name+'.';
 }
 const offer=offers.find(o=>o.id===id);
 if(!offer||offer.status!=='pending'||!valid(room,offer))throw bad('That offer has expired or was already resolved.');
 if(kind==='deal-cancel'){
  if(offer.from!==seat)throw bad('Only the sender can withdraw this offer.');
  offer.status='withdrawn';return player.name+' withdrew an offer.';
 }
 if(offer.to!==seat)throw bad('Only the recipient can respond to this offer.');
 if(kind==='deal-reject'){offer.status='declined';return player.name+' declined '+(offer.type==='swap'?'a position swap.':'a rent offer. The current rent remains due.');}
 if(kind!=='deal-accept')throw bad('Unknown offer action.');
 if(offer.type==='swap'){
  const a=room.players[offer.from],b=room.players[offer.to],[board,pos]=position(a);
  a.board=b.board;a.pos=b.pos;b.board=board;b.pos=pos;a.perks.splice(a.perks.indexOf('swap'),1);
 }else{
  room.pending.negotiatedFrom??=room.obligation.amount;
  room.obligation.amount=offer.amount;room.pending.amount=offer.amount;
 }
 offer.status='accepted';
 for(const other of offers)if(other!==offer&&other.status==='pending'&&(offer.type==='swap'&&other.type==='swap'||offer.type==='rent'&&other.debtId===offer.debtId))other.status='expired';
 return offer.type==='swap'?room.players[offer.from].name+' and '+player.name+' swapped positions using one Swap Favor. No GO reward or landing effect is triggered.':'Rent agreement: '+room.players[offer.debtor].name+' now owes $'+offer.amount+'. Choose Pay to complete payment (90% owner / 10% Festival).';
}
module.exports={rentParties,valid,list,act};
