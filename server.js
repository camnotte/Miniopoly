'use strict';
/** Mini-opoly Wi-Fi prototype: Node.js 18+, zero third-party dependencies. */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
// Keep test rooms across upgrades by storing saves outside versioned ZIP folders.
// For a one-time upgrade from older builds, copy the old saves/rooms.json into
// this project's saves/ folder before starting v0.2.3. It imports automatically.
const SHARED_SAVE_DIR = path.join(os.homedir(), '.miniopoly-wifi', 'saves');
const DATA_DIR = path.resolve(process.env.DATA_DIR || SHARED_SAVE_DIR);
if (!process.env.DATA_DIR && !fs.existsSync(path.join(DATA_DIR, 'rooms.json'))) {
  const legacySave = path.join(__dirname, 'saves', 'rooms.json');
  if (fs.existsSync(legacySave)) {
    fs.mkdirSync(DATA_DIR, {recursive:true});
    fs.copyFileSync(legacySave, path.join(DATA_DIR, 'rooms.json'));
    console.log(`Imported previous room saves from ${legacySave}`);
  }
}
const DATA_FILE = path.join(DATA_DIR, 'rooms.json');
const LEGENDARY_FILE = path.join(DATA_DIR, 'legendary.json');
const LEGENDARY_BRACKETS = [10,15,20];

const PUBLIC_DIR = path.join(__dirname, 'public');
const MAX_ROOMS = 100;
const COLORS = ['#ff7472', '#62a8ff', '#a6e35d', '#df86fa'];
const GAME_DATA = require('./game-data.json');
const DEEDS = Object.fromEntries(GAME_DATA.deeds.map(d=>[d.id,d]));
const SPECIAL_CARDS = {
  chest: [
    ['Local business grant',125], ['Community fundraiser',-50], ['Tax refund',100],
    ['Neighborhood dues',-75], ['Farmers market earnings',60], ['Coastal cleanup reward',90],
    ['Home inspection fee',-40], ['Found a lost wallet reward',50],
    {title:'Escape SetBack',perk:'escape',text:'Keep this card. Use it to leave SetBack without paying bail.'}
  ],
  lucky: [['Community festival prize',100],['Neighborhood volunteer award',75],['Bank dividend',125],['Found a forgotten savings bond',150],['Local arts raffle winner',90],['Tourism award',120],['Special neighborhood grant',110],['Lucky day cash prize',200],{title:'Escape SetBack',perk:'escape',text:'Keep this card. Use it to leave SetBack without paying bail.'}],
  traffic: [['Traffic detour fee',-40],['Smooth sailing reward',75],['Roadwork reimbursement',100],['Parking ticket',-30],['Scenic-route discovery prize',80],['Express lane toll',-25],['Transit rebate',60],['Coastal cleanup award',85],{title:'Escape SetBack',perk:'escape',text:'Keep this card. Use it to leave SetBack without paying bail.'}],
  weather: [['Unexpected Inheritance',150],['Neighborhood Festival',100],['Unexpected Repairs',-75],['Parking Fine',-40],['Lost-and-Found Reward',75],['Storm Cleanup',-100],['Property Photography Award',125],['Roadside Assistance',-60],{title:'Escape SetBack',perk:'escape',text:'Keep this card. Use it to leave SetBack without paying bail.'}]
};
const COMMUNITY_CARDS = [
  {title:'Neighborhood Grant',text:'Your community recognizes your contributions!',amount:100,emoji:'🎁'},
  {title:'Community Bake Sale',text:'Your bake sale was a success!',amount:75,emoji:'🧁'},
  {title:'Volunteer Crew',text:'Keep: $25 off your next unowned home purchase.',perk:'volunteer',emoji:'🏠'},
  {title:'Helping Hand',text:'Keep: block up to $100 of one bank penalty.',perk:'helping',emoji:'🤝'},
  {title:'Escape SetBack',text:'Keep: leave SetBack without a bail payment.',perk:'escape',emoji:'🎫'},
  {title:'Tow Voucher',text:'Keep: escape Setback before your next roll.',perk:'tow',emoji:'🔧'},
  {title:'Swap Favor',text:'Keep for future player-negotiated position swaps (not yet active).',perk:'swap',emoji:'🔄'}
];
const PERK_NAMES={volunteer:'Volunteer Crew',helping:'Helping Hand',tow:'Tow Voucher',escape:'Escape SetBack',swap:'Swap Favor'};
const WORLD_NAMES=GAME_DATA.worlds.map(w=>w.name);
// Three independent, host-wide score tables; room save resets cannot erase them.
function loadLegendary(){
  try{
    const raw=JSON.parse(fs.readFileSync(LEGENDARY_FILE,'utf8'));
    const data={10:[],15:[],20:[]};
    for(const rounds of LEGENDARY_BRACKETS){
      const entries=raw[String(rounds)];
      if(!Array.isArray(entries))continue;
      data[rounds]=entries.filter(x=>x&&Number.isSafeInteger(x.worth)&&x.worth>=0&&
        typeof x.name==='string'&&typeof x.matchId==='string'&&typeof x.playerId==='string'&&typeof x.at==='string')
        .slice(0,3).sort((a,b)=>b.worth-a.worth||a.at.localeCompare(b.at)||a.seat-b.seat);
    }
    return data;
  }catch(error){if(error.code!=='ENOENT')console.warn('Could not read legendary scores:',error.message);return {10:[],15:[],20:[]};}
}
const legendary = loadLegendary();
function saveLegendary(){
  fs.mkdirSync(DATA_DIR,{recursive:true});
  const temp=LEGENDARY_FILE+'.'+process.pid+'.tmp';
  fs.writeFileSync(temp,JSON.stringify(legendary,null,2),{mode:0o600});
  fs.renameSync(temp,LEGENDARY_FILE);
}
const rooms = new Map();
const live = new Map(); // roomCode -> Map<playerToken, Set<http.ServerResponse>>
const chatThrottle = new Map(); // private token -> last accepted chat timestamp
const attachmentThrottle = new Map();
const ATTACH_DIR = path.join(DATA_DIR, 'attachments');
const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024;
const MAX_ROOM_ATTACHMENT_BYTES = 20 * 1024 * 1024;
// Do not allow SVG, HTML, scripts, Office macros, or executables through chat.
const ATTACH_TYPES = {
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
  gif: 'image/gif', webp: 'image/webp', pdf: 'application/pdf', txt: 'text/plain'
};

function load() {
  let migratedFinished=false;
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    if (Array.isArray(data.rooms)) {
      for (const r of data.rooms) {
        if (/^[A-Z2-9]{6}$/.test(r.code) && Array.isArray(r.players) && r.players.length <= 4)
          {
            r.owned ||= {};
            r.ranked ??= false; // Older saved/test rooms are not silently promoted to ranked games.
            r.matchId ||= null;
            r.finalResults ||= null;
            r.pending ||= null;
            r.post ||= null;
            r.obligation ||= null;
            r.chat ||= [];
            r.turnNumber ||= 0;
            r.bailPending ||= null;
            r.foreclosures ||= [];
            for(const f of r.foreclosures) f.createdTurn ??= (r.turnNumber||0);
            r.nextForeclosureId ||= 1;
            for (const p of r.players) {p.cash ??= 1500;p.perks ||= [];p.penalty ||= 0;p.out ||= false;}
            if(r.stage==='finished'&&!r.finalResults){
              // Show awards for older completed games, but never import them as ranked historic records.
              r.ranked=false;r.matchId ||= crypto.randomUUID();
              finalizeRoom(r);migratedFinished=true;
            }
            rooms.set(r.code, r);
          }
      }
    }
    if(migratedFinished)save();
    console.log(`Loaded ${rooms.size} saved rooms.`);
  } catch (error) {
    if (error.code !== 'ENOENT') console.warn('Could not load saves:', error.message);
  }
}
function save() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = `${DATA_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify({format: 1, rooms: [...rooms.values()]}, null, 2), { mode: 0o600 });
  fs.renameSync(tmp, DATA_FILE);
}
load();

const codeAlphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function newCode() {
  for (let tryNumber = 0; tryNumber < 50; tryNumber++) {
    const code = Array.from({length: 6}, () => codeAlphabet[crypto.randomInt(codeAlphabet.length)]).join('');
    if (!rooms.has(code)) return code;
  }
  throw new Error('Unable to generate room code');
}
function token() { return crypto.randomBytes(24).toString('base64url'); }
function nameOf(value) {
  return typeof value === 'string' ? value.trim().replace(/[\x00-\x1f\x7f]/g, '').slice(0, 18) : '';
}
function cleanCode(value) {
  return typeof value === 'string' ? value.trim().toUpperCase().replace(/[^A-Z2-9]/g, '').slice(0, 6) : '';
}
function playerFromAuth(input) {
  const room = rooms.get(cleanCode(input.code));
  if (!room) throw bad('Room not found. Check the six-character room code.', 404);
  const player = room.players.find(p => p.token === input.token);
  if (!player) throw bad('Your seat could not be authenticated. Rejoin in the lobby.', 403);
  return {room, player};
}
function bad(message, status = 400) { return Object.assign(new Error(message), {status}); }
function peerCount(room, participant) {
  return live.get(room.code)?.get(participant.token)?.size || 0;
}
function publicRoom(room, viewer) {
  return {
    code: room.code, stage: room.stage, capacity: room.capacity, rounds: room.rounds,
    ranked: !!room.ranked, matchId:room.matchId||null, finalResults:room.finalResults||null, legendary,
    hostId: room.hostId, youId: viewer?.id ?? null, turn: room.turn,
    round: room.stage==='finished'?Math.min(room.round,room.rounds):room.round, turnNumber:room.turnNumber||0, phase: room.phase, lastRoll: room.lastRoll,
    pending: room.pending, post:room.post||null, obligation:room.obligation||null, owned: room.owned || {},
    bailPending:room.bailPending||null,
    foreclosures:(room.foreclosures||[]).map(f=>({...f,name:DEEDS[f.deedId]?.name||f.deedId,price:Math.ceil((DEEDS[f.deedId]?.price||0)/2),originalName:room.players[f.previousOwner]?.name||'Previous owner'})),
    log: room.log.slice(0, 35), chat: (room.chat||[]).slice(-80),
    players: room.players.map((p, index) => ({
      id: p.id, name: p.name, color: p.color, seat: index,
      pos: p.pos, board: p.board, streak: p.streak, cash: p.cash ?? 1500, perks:p.perks||[], penalty:p.penalty||0,out:!!p.out,
      connected: peerCount(room,p)>0
    }))
  };
}
function sendEvent(res, name, data) {
  if (!res.destroyed && !res.writableEnded) res.write(`event: ${name}\ndata: ${JSON.stringify(data)}\n\n`);
}
function broadcast(room) {
  const group = live.get(room.code);
  if (!group) return;
  for (const p of room.players) {
    const sockets = group.get(p.token);
    if (!sockets) continue;
    for (const res of sockets) sendEvent(res, 'state', publicRoom(room, p));
  }
}
function event(room, message) {
  room.log.unshift(message);
  room.log = room.log.slice(0, 45);
  save();
  broadcast(room);
}
function create({name,capacity,rounds,ranked=true}) {
  if (rooms.size >= MAX_ROOMS) throw bad('Too many stored rooms. Ask the host to archive older rooms.', 503);
  const nick = nameOf(name);
  if (!nick) throw bad('Enter a player name.');
  const seats = Number(capacity || 4);
  const roundCount = Number(rounds || 20);
  if (![2,3,4].includes(seats) || ![10,12,15,20,30].includes(roundCount)) throw bad('Invalid game options.');
  if(typeof ranked!=='boolean')throw bad('Ranked setting must be on or off.');
  const player = {id:crypto.randomUUID(), token:token(), name:nick, color:COLORS[0],pos:0,board:0,streak:0,cash:1500,perks:[],penalty:0,out:false};
  const room = {code:newCode(),hostId:player.id, capacity:seats, rounds:roundCount,ranked:Boolean(ranked)&&LEGENDARY_BRACKETS.includes(roundCount),matchId:null,finalResults:null,
    stage:'lobby', phase:'lobby', round:1, turn:0, turnNumber:0, lastRoll:null, pending:null, post:null, obligation:null, bailPending:null,owned:{}, foreclosures:[],nextForeclosureId:1,players:[player], log:[], chat:[]};
  rooms.set(room.code, room);
  event(room, `${nick} created the room.`);
  return {code:room.code,token:player.token,state:publicRoom(room,player)};
}
function join({code,name}) {
  const room = rooms.get(cleanCode(code));
  if (!room) throw bad('Room not found. Check the room code.', 404);
  if (room.stage !== 'lobby') throw bad('Match already started. Only existing players can reconnect.');
  if (room.players.length >= room.capacity) throw bad('This room is full.');
  const nick = nameOf(name);
  if (!nick) throw bad('Enter a player name.');
  if (room.players.some(p => p.name.toLowerCase() === nick.toLowerCase())) throw bad('Someone is already using that name.');
  const player = {id:crypto.randomUUID(),token:token(),name:nick,color:COLORS[room.players.length],pos:0,board:0,streak:0,cash:1500,perks:[],penalty:0,out:false};
  room.players.push(player);
  event(room, `${nick} joined as Player ${room.players.length}.`);
  return {code:room.code,token:player.token,state:publicRoom(room,player)};
}
// Game data and prices are loaded from v5.42, never submitted by a browser.
function getRent(deed, owned, ownerSeat, roll) {
  const mine = Object.keys(owned).filter(id=>owned[id]?.owner===ownerSeat && !owned[id].mortgage);
  if (deed.type==='p') return deed.base * [1,2,4,7][Math.min(3, owned[deed.id]?.level || 0)];
  if (deed.type==='rail') {
    const count=mine.filter(id=>DEEDS[id]?.type==='rail').length;
    return [0,25,50,100,200][Math.min(4,count)];
  }
  const count=mine.filter(id=>DEEDS[id]?.type==='util').length;
  return roll * (count>=2?10:4);
}
function activePlayer(room){return room.players[room.turn];}
function insistTurn(room,player){
  if(room.stage!=='playing'||activePlayer(room)?.id!==player.id) throw bad('Only the active player can do that.',403);
}
function ownedDeeds(room,seat){return Object.keys(room.owned).filter(id=>room.owned[id]?.owner===seat);}
function setPost(room,summary,extra={}){
  room.pending=null;room.obligation=null;room.phase='post';
  room.post={title:summary, ...extra};
}
function liability(room,amount,creditor,description,returnPhase='post'){
  room.obligation={amount,creditor,description,returnPhase};
  room.pending={kind:'rent',amount,creditor,creditorName:creditor===null?'the Bank':room.players[creditor].name,description,playerId:activePlayer(room).id};
  room.phase='rent';
}
function sample(items){return items[crypto.randomInt(items.length)];}
function drawSpecial(room,player,type,name){
  room.post=null;
  if(type==='bonus' && name==='Coastal Bonus'){
    player.cash+=75;
    room.pending={kind:'card',title:'Coastal Bonus',description:'Bonus awarded!',amount:75,source:name,emoji:'🌟',playerId:player.id};
  } else if(type==='bonus'){
    const card=sample(COMMUNITY_CARDS);
    let details=card.text, reward=card.amount||0, gainedPerk=card.perk||null;
    if(card.perk){
      if(player.perks.length>=2){reward=50;gainedPerk=null;details+=' (Perk inventory full: collected $50 instead.)';}
      else player.perks.push(card.perk);
    }
    if(reward)player.cash+=reward;
    room.pending={kind:'card',title:card.title,description:details,amount:reward,perk:gainedPerk,source:name,emoji:card.emoji,playerId:player.id};
  } else {
    const deck=type==='chest'?'chest':type==='weather'?'weather':name==='Lucky Draw'?'lucky':'traffic';
    const picked=sample(SPECIAL_CARDS[deck]);
    if(!Array.isArray(picked) && picked.perk){
      const hasSpace=player.perks.length<2;
      if(hasSpace)player.perks.push(picked.perk);
      else player.cash+=50;
      room.pending={kind:'card',title:picked.title,description:hasSpace?picked.text:'Perk inventory full: collected $50 instead.',amount:hasSpace?0:50,perk:hasSpace?picked.perk:null,source:name,emoji:'🎫',playerId:player.id};
    } else {
      const [title,amount]=picked;
      room.pending={kind:'card',title,description:amount<0?`A bank fee of $${-amount} is due. Review the card and continue to payment.`:`Collect $${amount} from the bank.`,amount,source:name,emoji:type==='chest'?'🎁':type==='weather'?'🌤️':'🎴',playerId:player.id};
      if(amount>0)player.cash+=amount;
    }
  }
  room.phase='card';
  return `${player.name} drew ${room.pending.source}: ${room.pending.title}${room.pending.amount>0?` (+$${room.pending.amount})`:''}.`;
}
function settleLanding(room, player, rollValue, passedGo) {
  const tile=GAME_DATA.worlds[player.board].tiles[player.pos];
  const id=`${player.board}-${player.pos}`;
  const deed=DEEDS[id];
  const details=[];
  room.post=null;room.obligation=null;
  if(passedGo && player.pos!==0){player.cash+=200;details.push(`${player.name} collected $200 for passing GO.`);}
  if(!deed){
    if(tile[0]==='start'){player.cash+=200;setPost(room,'GO bonus collected',{kind:'event',message:'You collected $200 for landing on GO.'});details.push(`${player.name} collected $200 for landing on GO.`);}
    else if(tile[0]==='trouble'){
      player.penalty=2;
      room.pending={kind:'card',title:'Setback Zone',description:'You entered SetBack. On your next turn, roll 6 or 12 to escape free; roll and pay 20× the result in bail; forfeit an undeveloped deed to foreclosure; or use an Escape SetBack card. You have up to two restricted roll attempts.',amount:0,source:tile[1],emoji:'⚠️',playerId:player.id};
      room.phase='card';details.push(`${player.name} entered Setback (two penalty turns).`);
    } else if(tile[0]==='tax'){
      const amount=tile[1]==='Storm Fund'?125:100;
      liability(room,amount,null,`${tile[1]} · $${amount}`);
      details.push(`${player.name} owes $${amount} to the bank for ${tile[1]}.`);
    } else if(['chest','chance','weather','bonus'].includes(tile[0]))details.push(drawSpecial(room,player,tile[0],tile[1]));
    else setPost(room,'Landing complete',{kind:'event',message:tile[1]});
    return details;
  }
  const owner=room.owned[id];
  if(!owner){
    const held=foreclosedEntry(room,id);
    if(held){setPost(room,'Foreclosed property',{kind:'foreclosure',name:deed.name,id,board:player.board,message:`${deed.name} is bank-held in foreclosure. Visit the Foreclosures market when eligible.`});details.push(`${player.name} landed on foreclosed ${deed.name}.`);return details;}
    const discount=deed.type==='p' && player.perks.includes('volunteer')?25:0;
    const price=Math.max(0,deed.price-discount);
    room.pending={kind:'purchase',id,board:player.board,pos:player.pos,type:deed.type,name:deed.name,price,base:deed.base,discount,playerId:player.id};
    room.phase='purchase';
    details.push(`${player.name} can buy ${deed.name} for $${price} or pass.`);
    return details;
  }
  if(owner.owner===room.turn){setPost(room,'Your property',{kind:'owned',id,name:deed.name,board:player.board,message:'You already own this deed.'});details.push(`${player.name} owns ${deed.name}.`);return details;}
  if(owner.mortgage){setPost(room,'Mortgaged deed',{kind:'owned',id,name:deed.name,board:player.board,message:'No rent is due.'});details.push(`${deed.name} is mortgaged; no rent due.`);return details;}
  const landlord=room.players[owner.owner];
  if(!landlord||landlord.out){setPost(room,'Landing complete',{kind:'event',message:'No rent due.'});return details;}
  const amount=getRent(deed,room.owned,owner.owner,rollValue);
  liability(room,amount,owner.owner,`${deed.name} · ${WORLD_NAMES[player.board]}`);
  room.pending.id=id; room.pending.name=deed.name;room.pending.board=player.board;
  details.push(`${player.name} owes $${amount} rent to ${landlord.name} for ${deed.name}. Waiting for payment.`);
  return details;
}
function checkLiquidation(room,id,seat){
  if(!DEEDS[id]||room.owned[id]?.owner!==seat)throw bad('That deed is not yours.',403);
  return {deed:DEEDS[id],owner:room.owned[id]};
}
function availableUpgrades(room,seat){
  return ownedDeeds(room,seat).filter(id=>{
    const deed=DEEDS[id],owned=room.owned[id];
    if(deed.type!=='p'||owned.mortgage||owned.level>=3)return false;
    const members=GAME_DATA.deeds.filter(d=>d.type==='p'&&d.color===deed.color);
    return members.every(d=>room.owned[d.id]?.owner===seat && !room.owned[d.id].mortgage);
  });
}
function playerWorth(room,seat){
  const player=room.players[seat];
  if(!player)return 0;
  return Math.round((player.cash||0)+ownedDeeds(room,seat).reduce((sum,id)=>{
    const deed=DEEDS[id],ownership=room.owned[id];
    if(!deed||!ownership)return sum;
    return sum+(ownership.mortgage?0:deed.price)+(ownership.level||0)*(deed.upgradeCost||0)/2;
  },0));
}
function finalizeRoom(room){
  if(room.finalResults)return;
  const finishedAt=new Date().toISOString();
  const standings=room.players.map((p,seat)=>({
    seat,id:p.id,name:p.name,color:p.color,cash:p.cash||0,
    deeds:ownedDeeds(room,seat).length,worth:playerWorth(room,seat),bankrupt:!!p.out
  })).sort((a,b)=>b.worth-a.worth||a.seat-b.seat);
  room.finalResults={matchId:room.matchId||crypto.randomUUID(),rounds:room.rounds,at:finishedAt,standings,
    legendaryEligible:!!room.ranked&&LEGENDARY_BRACKETS.includes(room.rounds),newRecords:[]};
  if(room.finalResults.legendaryEligible){
    const bracket=legendary[room.rounds];
    const prior=bracket.map(e=>e.matchId+':'+e.playerId);
    for(const p of standings){
      const id=room.finalResults.matchId+':'+p.id;
      if(!prior.includes(id))bracket.push({matchId:room.finalResults.matchId,roomCode:room.code,
        playerId:p.id,seat:p.seat,name:p.name,worth:p.worth,rounds:room.rounds,
        playerCount:room.players.length,at:finishedAt});
    }
    bracket.sort((a,b)=>b.worth-a.worth||a.at.localeCompare(b.at)||a.seat-b.seat);
    bracket.splice(3);
    room.finalResults.newRecords=bracket.filter(e=>e.matchId===room.finalResults.matchId)
      .map(e=>({...e,place:bracket.indexOf(e)+1}));
    saveLegendary();
  }
  room.stage='finished';room.phase='finished';
  room.round=Math.min(room.round,room.rounds); // Never display round 21 of 20.
}
function cleanupBankruptcy(room,player){
  const seat=room.turn,ob=room.obligation;
  const cash=Math.max(0,player.cash);
  if(ob?.creditor!==null && ob?.creditor!==undefined){
    room.players[ob.creditor].cash+=cash;
    for(const id of ownedDeeds(room,seat))room.owned[id].owner=ob.creditor;
  } else for(const id of ownedDeeds(room,seat))delete room.owned[id];
  player.cash=0;player.out=true;player.perks=[];
  room.pending=null;room.obligation=null;room.post=null;room.phase='post';
  if(room.players.filter(p=>!p.out).length<=1)finalizeRoom(room);
}
function advanceTurn(room){
  let next=room.turn,cycled=false;
  for(let i=0;i<room.players.length;i++){
    next=(next+1)%room.players.length;
    if(next===0)cycled=true;
    if(!room.players[next].out)break;
  }
  room.turn=next;room.turnNumber=(room.turnNumber||0)+1;
  if(cycled)room.round++;
  room.lastRoll=null;room.pending=null;room.post=null;room.obligation=null;room.bailPending=null;
  if(room.round>room.rounds||room.players.filter(p=>!p.out).length<=1)finalizeRoom(room);
  else room.phase='roll';
}
// Foreclosures are bank-held deeds, not immediately buyable unowned properties.
// A full round must pass before competitors can buy; the former owner can reclaim
// at the same half price after three full rounds if nobody else has purchased it.
function foreclosedEntry(room,deedId){return (room.foreclosures||[]).find(f=>f.deedId===deedId);}
function canBuyForeclosure(room,entry,seat){
  return room.stage==='playing' && (room.turnNumber||0)>=entry.createdTurn+2 &&
    (seat!==entry.previousOwner || room.round>=entry.round+3);
}
function nextRoll(room){
  const override=process.env.NODE_ENV==='test' && HOST==='127.0.0.1' ? Number((process.env.TEST_ROLL_SEQUENCE||'').split(',')[room.testRollIndex||0]) : NaN;
  room.testRollIndex=(room.testRollIndex||0)+1;
  return Number.isInteger(override)&&override>=1&&override<=12?override:crypto.randomInt(1,13);
}
function moveAfterRoll(room,player,value,previousBoard,previousPosition,freeFromSetback=false){
  let shift=value===6||value===12||player.streak>=9;
  if(freeFromSetback){player.penalty=0;shift=value===6||value===12;}
  if(shift){player.board=(player.board+1)%3;player.streak=0;}
  else player.streak++;
  const passedGo=previousPosition+value>=16;
  player.pos=(player.pos+value)%16;
  room.lastRoll={value,playerId:player.id,previousBoard,board:player.board,previousPosition,position:player.pos,shift,at:Date.now()};
  const details=settleLanding(room,player,value,passedGo);
  room.log.unshift(...details.reverse());
  event(room,`${player.name} rolled ${value}${shift?` and shifted to ${WORLD_NAMES[player.board]}`:''}; landed on ${GAME_DATA.worlds[player.board].tiles[player.pos][1]}.`);
}
function act({code,token:secret,kind,id,perk}) {
  const {room,player}=playerFromAuth({code,token:secret});
  if(kind==='start'||kind==='reset'||kind==='new-ranked-match'){
    if(player.id!==room.hostId)throw bad('Only the host can start or restart.',403);
    if(room.players.length<2)throw bad('At least two players are needed.');
    if(kind==='start'&&room.stage!=='lobby')throw bad('Match already started.');
    if(kind==='new-ranked-match'&&room.stage!=='finished')throw bad('A ranked rematch is available after the match ends.');
    if(kind==='new-ranked-match'&&!LEGENDARY_BRACKETS.includes(room.rounds))throw bad('Only 10, 15, and 20-round games qualify for the Legendary Hall.');
    room.ranked=kind==='new-ranked-match'?true:kind==='reset'?false:!!room.ranked;
    room.matchId=crypto.randomUUID();room.finalResults=null;
    room.stage='playing';room.phase='roll';room.round=1;room.turn=0;room.turnNumber=0;
    room.lastRoll=null;room.pending=null;room.post=null;room.obligation=null;room.bailPending=null;room.owned={};room.foreclosures=[];room.nextForeclosureId=1;room.testRollIndex=0;
    for(const p of room.players){p.pos=0;p.board=0;p.streak=0;p.cash=1500;p.perks=[];p.penalty=0;p.out=false;}
    room.log=[];
    event(room,`${kind==='reset'?'Unranked test match restarted':kind==='new-ranked-match'?'Ranked rematch started':'Match started'}! Room ${room.code}, same player seats. ${room.players[0].name} rolls first.`);
  } else if(kind==='roll'){
    insistTurn(room,player);
    if(room.phase!=='roll')throw bad('The game is not waiting for a roll.');
    const value=nextRoll(room);
    const previousBoard=player.board,previousPosition=player.pos;
    if(player.penalty>0 && value!==6 && value!==12){
      player.penalty--;
      room.lastRoll={value,playerId:player.id,previousBoard,board:player.board,previousPosition,position:player.pos,noMove:true,shift:false,at:Date.now()};
      room.pending={kind:'card',title:'Setback: No Escape',description:`Rolled ${value}. You stay on Setback. ${player.penalty} restricted turn(s) remain.`,source:'SETBACK',emoji:'⚠️',amount:0,playerId:player.id};
      room.phase='card';
      event(room,`${player.name} rolled ${value} in Setback and stayed on square ${player.pos+1}.`);
    } else {
      moveAfterRoll(room,player,value,previousBoard,previousPosition,player.penalty>0);
    }
  } else if(kind==='bail-roll'){
    insistTurn(room,player);
    if(room.phase!=='roll'||player.penalty<=0)throw bad('Bail is only available while held in SetBack.');
    const value=nextRoll(room),fee=20*value;
    if(player.cash<fee){
      // Do not reroll the bail price. It remains fixed until paid or the player forfeits a deed.
      room.bailPending={value,fee};room.phase='bail';
      room.pending={kind:'bail',amount:fee,value,playerId:player.id,description:`You rolled ${value}. Bail is $20 × ${value} = $${fee}. Sell assets to pay this fixed amount, or forfeit an eligible deed.`};
      event(room,`${player.name} rolled ${value} for bail, owes $${fee}, and must raise cash before moving.`);
    }else{
      player.cash-=fee;
      const previousBoard=player.board,previousPosition=player.pos;
      room.log.unshift(`${player.name} paid $${fee} bail (20 × ${value}) and escaped SetBack.`);
      moveAfterRoll(room,player,value,previousBoard,previousPosition,true);
    }
  } else if(kind==='pay-bail'){
    insistTurn(room,player);
    if(room.phase!=='bail'||!room.bailPending||player.penalty<=0)throw bad('No fixed bail payment is waiting.');
    const {value,fee}=room.bailPending;
    if(player.cash<fee)throw bad(`You need $${fee} for bail. Sell upgrades or a deed first.`);
    player.cash-=fee;room.bailPending=null;room.pending=null;
    room.log.unshift(`${player.name} paid $${fee} bail (20 × ${value}) and escaped SetBack.`);
    moveAfterRoll(room,player,value,player.board,player.pos,true);
  } else if(kind==='foreclose'){
    insistTurn(room,player);
    if(player.penalty<=0 || !['roll','post','bail'].includes(room.phase))throw bad('You can only forfeit a deed while held in SetBack.');
    const {deed,owner}=checkLiquidation(room,id,room.turn);
    if(owner.level>0||owner.mortgage)throw bad('Sell upgrades first. Only undeveloped, unmortgaged deeds can be forfeited.');
    delete room.owned[id];room.foreclosures ||= [];
    room.foreclosures.push({id:room.nextForeclosureId++,deedId:id,previousOwner:room.turn,round:room.round,createdTurn:room.turnNumber||0});
    player.penalty=0;
    if(room.phase==='bail'){room.bailPending=null;setPost(room,'Escaped SetBack',{kind:'setback',message:`You forfeited ${deed.name}; the bail demand was canceled.`});}
    if(room.phase==='post')room.post={title:'Escaped SetBack',kind:'setback',message:`You forfeited ${deed.name} to the Bank. It enters the Foreclosure Market; you are now free.`};
    event(room,`${player.name} forfeited ${deed.name} to the Bank and escaped SetBack. Foreclosure becomes buyable after another player completes one full turn.`);
  } else if(kind==='buy-foreclosure'){
    insistTurn(room,player);
    if(!['roll','post'].includes(room.phase))throw bad('Buy foreclosure properties before rolling or during your Turn Actions.');
    const entry=foreclosedEntry(room,id),deed=DEEDS[id];
    if(!entry||!deed||room.owned[id])throw bad('That foreclosure is no longer available.');
    if(!canBuyForeclosure(room,entry,room.turn))throw bad(room.turn===entry.previousOwner?'The original owner must wait three complete rounds before buying back.':'Foreclosure is held for one complete round.');
    const price=Math.ceil(deed.price/2);
    if(player.cash<price)throw bad('Not enough cash to purchase this foreclosure.');
    player.cash-=price;room.owned[id]={owner:room.turn,level:0,mortgage:false};
    room.foreclosures=room.foreclosures.filter(f=>f.deedId!==id);
    event(room,`${player.name} purchased foreclosed ${deed.name} from the Bank for $${price}.`);
  } else if(kind==='buy'||kind==='pass'){
    insistTurn(room,player);
    if(room.phase!=='purchase'||!room.pending||room.pending.playerId!==player.id)throw bad('No purchase decision is waiting.');
    const d=room.pending,deed=DEEDS[d.id];
    if(!deed||room.owned[d.id])throw bad('Deed unavailable.');
    if(kind==='buy'){
      if(player.cash<d.price)throw bad('Not enough cash to purchase this deed.');
      player.cash-=d.price;room.owned[d.id]={owner:room.turn,level:0,mortgage:false};
      if(d.discount){const ix=player.perks.indexOf('volunteer');if(ix>=0)player.perks.splice(ix,1);}
      setPost(room,'Property Purchased!',{kind:'purchase',id:d.id,name:deed.name,price:d.price,board:d.board,message:`You now own ${deed.name}.`});
    } else setPost(room,'Purchase Passed',{kind:'pass',id:d.id,name:deed.name,board:d.board,message:'You chose not to buy this deed. Auctions will be added later.'});
    event(room,kind==='buy'?`${player.name} bought ${deed.name} for $${d.price}.`:`${player.name} passed on ${deed.name}.`);
  } else if(kind==='continue-card'){
    insistTurn(room,player);
    if(room.phase!=='card'||room.pending?.playerId!==player.id)throw bad('No card is awaiting acknowledgment.');
    const card=room.pending;
    if(card.amount<0){
      const help=player.perks.indexOf('helping');
      const saving=help>=0?Math.min(100,-card.amount):0;
      if(saving){player.perks.splice(help,1);room.log.unshift(`${player.name} used Helping Hand to avoid $${saving} of the bank fee.`);}
      if(-card.amount-saving===0){setPost(room,`${card.source} complete`,{kind:'card',name:card.title,message:`Helping Hand covered the entire $${-card.amount} bank fee.`});event(room,`${player.name} avoided a bank fee with Helping Hand.`);return {ok:true,state:publicRoom(room,player)};}
      liability(room,-card.amount-saving,null,`${card.source}: ${card.title}`);
      event(room,`${player.name} must pay $${-card.amount} for ${card.title}.`);
    } else {
      setPost(room,`${card.source} complete`,{kind:'card',name:card.title,message:card.description});
      event(room,`${player.name} acknowledged ${card.title}.`);
    }
  } else if(kind==='pay'){
    insistTurn(room,player);
    if(room.phase!=='rent'||!room.obligation)throw bad('No payment is due.');
    const amount=room.obligation.amount,creditor=room.obligation.creditor;
    if(player.cash<amount)throw bad('Not enough cash. Sell upgrades or deeds, or declare bankruptcy.');
    player.cash-=amount;
    if(creditor!==null)room.players[creditor].cash+=amount;
    const description=room.obligation.description;
    setPost(room,creditor!==null?'Rent Paid!':'Bank Fee Paid!',{kind:'rent',message:`Paid $${amount} to ${creditor===null?'the Bank':room.players[creditor].name} for ${description}.`,amount});
    event(room,`${player.name} paid $${amount} to ${creditor===null?'the Bank':room.players[creditor].name}: ${description}.`);
  } else if(kind==='sell-upgrade'||kind==='sell-deed'){
    insistTurn(room,player);
    if(room.phase!=='rent'&&room.phase!=='post'&&room.phase!=='bail'&&!(room.phase==='roll'&&player.penalty>0))throw bad('You can only liquidate during your turn.');
    const {deed,owner}=checkLiquidation(room,id,room.turn);
    if(kind==='sell-upgrade'){
      if(deed.type!=='p'||owner.level<1)throw bad('There are no upgrades to sell.');
      owner.level--;const proceeds=Math.floor(deed.upgradeCost/2);
      player.cash+=proceeds;
      event(room,`${player.name} sold an upgrade on ${deed.name} to the Bank for $${proceeds}.`);
    } else {
      if(owner.level>0)throw bad('Sell all upgrades on this property first.');
      if(owner.mortgage)throw bad('Mortgaged deeds cannot be sold to the bank.');
      delete room.owned[id];const proceeds=Math.floor(deed.price/2);
      player.cash+=proceeds;
      event(room,`${player.name} sold ${deed.name} to the Bank for $${proceeds}.`);
    }
  } else if(kind==='upgrade'){
    insistTurn(room,player);
    if(room.phase!=='post')throw bad('Upgrades are available after resolving your landing.');
    if(!availableUpgrades(room,room.turn).includes(id))throw bad('Own the full, unmortgaged color set before upgrading.');
    const deed=DEEDS[id];
    if(player.cash<deed.upgradeCost)throw bad('Not enough cash for this upgrade.');
    room.owned[id].level++;player.cash-=deed.upgradeCost;
    event(room,`${player.name} upgraded ${deed.name} to Level ${room.owned[id].level} for $${deed.upgradeCost}.`);
  } else if(kind==='use-perk'){
    insistTurn(room,player);
    if(!['tow','escape'].includes(perk)||!['roll','post'].includes(room.phase)||player.penalty<=0||!player.perks.includes(perk))throw bad('This SetBack escape card cannot be used right now.');
    player.perks.splice(player.perks.indexOf(perk),1);player.penalty=0;
    if(room.phase==='post')room.post={title:'Escaped SetBack',kind:'setback',message:`Used ${PERK_NAMES[perk]}. You are free on your next turn.`};
    event(room,`${player.name} used ${PERK_NAMES[perk]} to leave SetBack.`);
  } else if(kind==='bankrupt'){
    insistTurn(room,player);
    if(room.phase!=='rent'||!room.obligation)throw bad('Bankruptcy can only be declared when a payment is due.');
    const creditor=room.obligation.creditor;
    cleanupBankruptcy(room,player);
    if(room.stage!=='finished')advanceTurn(room);
    event(room,`${player.name} declared bankruptcy${creditor===null?' to the bank':` to ${room.players[creditor].name}`}.`);
  } else if(kind==='end'){
    insistTurn(room,player);
    if(room.phase!=='post'&&room.phase!=='end')throw bad('Resolve the landing before ending your turn.');
    advanceTurn(room);
    if(room.stage==='finished')event(room,`🏆 Match complete! ${room.finalResults.standings[0].name} finished with $${room.finalResults.standings[0].worth.toLocaleString('en-US')} net worth.${room.finalResults.legendaryEligible?' Legendary scores recorded.':''}`);
    else event(room,`Round ${room.round}: ${activePlayer(room).name}'s turn.`);
  } else throw bad('Unrecognized action.');
  if(room.stage==='finished')for(const other of rooms.values())if(other!==room)broadcast(other);
  return {ok:true,state:publicRoom(room,player)};
}
/** Room-scoped conversation: never parsed as commands or used by game rules. */
function sendChat(body) {
  const {room,player}=playerFromAuth(body||{});
  const raw=body?.text;
  if(typeof raw!=='string')throw bad('Chat message must be text.');
  const message=raw.replace(/[\u0000-\u001f\u007f]/g,' ').trim();
  if(!message)throw bad('Type a message before sending.');
  if(message.length>280)throw bad('Messages must be 280 characters or fewer.');
  const now=Date.now();
  if(now-(chatThrottle.get(player.token)||0)<750)throw bad('Please wait a moment before sending another message.',429);
  chatThrottle.set(player.token,now);
  room.chat ||= [];
  room.chat.push({id:crypto.randomUUID(), playerId:player.id, name:player.name, seat:room.players.indexOf(player), text:message, at:new Date(now).toISOString()});
  pruneChat(room);
  save();
  broadcast(room);
  return {ok:true};
}
/** Authenticated room-only attachment storage, outside the public web directory. */
function attachmentType(filename, data) {
  const ext = String(filename||'').split('.').pop().toLowerCase();
  const mime = ATTACH_TYPES[ext];
  if (!mime) throw bad('Allowed files: PNG, JPG, GIF, WebP, PDF or TXT.');
  const check = {
    png: b=>b.subarray(0,8).equals(Buffer.from('89504e470d0a1a0a','hex')),
    jpg: b=>b.length>3&&b[0]===0xff&&b[1]===0xd8&&b[2]===0xff,
    jpeg: b=>b.length>3&&b[0]===0xff&&b[1]===0xd8&&b[2]===0xff,
    gif: b=>b.subarray(0,6).toString('ascii')==='GIF89a'||b.subarray(0,6).toString('ascii')==='GIF87a',
    webp: b=>b.subarray(0,4).toString('ascii')==='RIFF'&&b.subarray(8,12).toString('ascii')==='WEBP',
    pdf: b=>b.subarray(0,5).toString('ascii')==='%PDF-',
    txt: b=>b.length<=256*1024&&!b.includes(0)&&Buffer.from(b.toString('utf8'),'utf8').equals(b)
  }[ext];
  if(!check(data)) throw bad('File content does not match the permitted file type.');
  return {ext, mime, image: mime.startsWith('image/')};
}
function roomAttachmentUsage(code) {
  if(!fs.existsSync(ATTACH_DIR))return 0;
  let total=0;
  for(const n of fs.readdirSync(ATTACH_DIR))if(n.startsWith(code+'-')){
    try{total+=fs.statSync(path.join(ATTACH_DIR,n)).size;}catch{}
  }
  return total;
}
function pruneChat(room) {
  room.chat ||= [];
  const removed=room.chat.slice(0,Math.max(0,room.chat.length-80));
  room.chat=room.chat.slice(-80);
  for(const message of removed){
    const a=message.attachment;
    if(!a?.id||!/^[a-f0-9-]{36}$/.test(a.id))continue;
    const ext=Object.keys(ATTACH_TYPES).find(x=>a.name?.toLowerCase().endsWith('.'+x)&&ATTACH_TYPES[x]===a.mime);
    if(!ext)continue;
    try{fs.unlinkSync(path.join(ATTACH_DIR,`${room.code}-${a.id}.${ext}`));}catch{}
  }
}
function sendAttachment(body) {
  const {room,player}=playerFromAuth(body||{});
  const name=typeof body?.name==='string'?body.name.replace(/[\\/\u0000-\u001f\u007f<>]/g,'').trim().slice(0,80):'';
  if(!name||name.startsWith('.')) throw bad('Choose a valid filename.');
  const raw=body?.data;
  if(typeof raw!=='string'||!raw||raw.length>Math.ceil(MAX_ATTACHMENT_BYTES*4/3)+8||!/^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(raw))throw bad('Invalid attachment or file too large.',413);
  const data=Buffer.from(raw,'base64');
  if(!data.length||data.length>MAX_ATTACHMENT_BYTES)throw bad('Files must be 2 MB or smaller.',413);
  const type=attachmentType(name,data);
  const now=Date.now();
  if(now-(attachmentThrottle.get(player.token)||0)<1400)throw bad('Wait a moment before sending another file.',429);
  if(roomAttachmentUsage(room.code)+data.length>MAX_ROOM_ATTACHMENT_BYTES)throw bad('This room has reached its 20 MB attachment limit. Start a new room or ask the host to remove old files.',413);
  attachmentThrottle.set(player.token,now);
  const id=crypto.randomUUID();
  fs.mkdirSync(ATTACH_DIR,{recursive:true,mode:0o700});
  // Use an internal random name, never a user-provided filesystem path.
  const stored=path.join(ATTACH_DIR,`${room.code}-${id}.${type.ext}`);
  fs.writeFileSync(stored,data,{flag:'wx',mode:0o600});
  const attachment={id,name, size:data.length,mime:type.mime,image:type.image};
  room.chat||=[];
  room.chat.push({id:crypto.randomUUID(),playerId:player.id,name:player.name,seat:room.players.indexOf(player),attachment,at:new Date(now).toISOString()});
  room.chat=room.chat.slice(-80);
  save();broadcast(room);
  return {ok:true,attachment};
}
function serveAttachment(req,res,url){
  const id=url.pathname.slice('/api/attachment/'.length);
  if(!/^[a-f0-9-]{36}$/.test(id)) throw bad('Attachment not found.',404);
  const {room}=playerFromAuth({code:url.searchParams.get('code'),token:url.searchParams.get('token')});
  const entry=(room.chat||[]).find(m=>m.attachment?.id===id);
  if(!entry)throw bad('Attachment not found in this room.',404);
  const a=entry.attachment;
  const ext=Object.keys(ATTACH_TYPES).find(x=>ATTACH_TYPES[x]===a.mime && (a.name.toLowerCase().endsWith('.'+x)));
  if(!ext)throw bad('Invalid attachment.',404);
  const file=path.join(ATTACH_DIR,`${room.code}-${id}.${ext}`);
  const stat=fs.statSync(file,{throwIfNoEntry:false});
  if(!stat||!stat.isFile())throw bad('Attachment is missing from the host computer.',404);
  const disposition=a.image?'inline':'attachment';
  const safeName=a.name.replace(/[^A-Za-z0-9._ -]/g,'_');
  res.writeHead(200,{'Content-Type':a.mime==='text/plain'?'text/plain; charset=utf-8':a.mime,
    'Content-Length':stat.size,'Content-Disposition':`${disposition}; filename="${safeName}"`,
    'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer',
    'Content-Security-Policy':"default-src 'none'; sandbox"});
  if(req.method==='HEAD')return res.end();
  fs.createReadStream(file).pipe(res);
}
function reply(res,status,obj) {
  res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
  res.end(JSON.stringify(obj));
}
function readJSON(req, limit=4096) {
  return new Promise((resolve,reject)=>{
    if (!String(req.headers['content-type']||'').startsWith('application/json')) return reject(bad('Expected JSON request.'));
    let text='';
    req.on('data',part => {text+=part;if(text.length>limit){reject(bad('Request too large.',413));req.destroy();}});
    req.on('end',()=>{try{resolve(JSON.parse(text));}catch{reject(bad('Invalid JSON.'));}});
    req.on('error',reject);
  });
}
function networkAddresses(port) {
  const result=[];
  for(const arr of Object.values(os.networkInterfaces())) for(const iface of arr||[]) {
    if(iface.family==='IPv4'&&!iface.internal) result.push(`http://${iface.address}:${port}`);
  }
  return [...new Set(result)];
}
const staticFiles = {
  '/':['index.html','text/html; charset=utf-8'],
  '/index.html':['index.html','text/html; charset=utf-8'],
  '/review':['review.html','text/html; charset=utf-8'],
  '/review.html':['review.html','text/html; charset=utf-8'],
  '/review.css':['review.css','text/css; charset=utf-8'],
  '/review.js':['review.js','application/javascript; charset=utf-8'],
  '/review-board.js':['review-board.js','application/javascript; charset=utf-8'],
  '/turn-panel-preview':['turn-panel-preview.html','text/html; charset=utf-8'],
  '/turn-panel-preview.html':['turn-panel-preview.html','text/html; charset=utf-8'],
  '/turn-panel-preview.css':['turn-panel-preview.css','text/css; charset=utf-8'],
  '/turn-panel-preview.js':['turn-panel-preview.js','application/javascript; charset=utf-8'],
  '/turn-panel-board.css':['turn-panel-board.css','text/css; charset=utf-8'],
  '/floating-panel.css':['floating-panel.css','text/css; charset=utf-8'],
  '/floating-panel.js':['floating-panel.js','application/javascript; charset=utf-8'],
  '/live-panel.css':['live-panel.css','text/css; charset=utf-8'],
  '/styles.css':['styles.css','text/css; charset=utf-8'],
  '/storybook-board.css':['storybook-board.css','text/css; charset=utf-8'],
  '/storybook-shell.css':['storybook-shell.css','text/css; charset=utf-8'],
  '/storybook.js':['storybook.js','application/javascript; charset=utf-8'],
  '/fonts/fredoka.ttf':['fonts/fredoka.ttf','font/ttf'],
  '/fonts/nunito.ttf':['fonts/nunito.ttf','font/ttf'],
  '/art/icons/upgrade-star.png':['art/icons/upgrade-star.png','image/png'],
  '/app.js':['app.js','application/javascript; charset=utf-8'],
  '/board-v5-42.html':['board-v5-42.html','text/html; charset=utf-8'],
  '/go-world-1.webp':['go-world-1.webp','image/webp'],
  '/go-world-2.webp':['go-world-2.webp','image/webp'],
  '/go-world-3.webp':['go-world-3.webp','image/webp']
};
// Keep the public-file allowlist explicit; game saves and uploaded files use
// separate, authenticated routes and must never be served by this handler.
for(const name of ['neighborhoods','marsh']){
  const file=`art/richmond/${name}.svg`;
  staticFiles['/'+file]=[file,'image/svg+xml; charset=utf-8'];
}
for(const [world,names] of [['communities',['neighborhoods','commons']],['coastal',['neighborhoods','estuary']]]){
  for(const name of names){
    const file=`art/${world}/${name}.svg`;
    staticFiles['/'+file]=[file,'image/svg+xml; charset=utf-8'];
  }
}
for(const name of ['dice','house','chat','worlds','hall','bank','sound','hints','focus','arrow']){
  const file=`art/icons/${name}.svg`;
  staticFiles['/'+file]=[file,'image/svg+xml; charset=utf-8'];
}
function staticFile(res,pathname) {
  const item=staticFiles[pathname];
  if(!item){reply(res,404,{error:'Not found'});return;}
  const file=path.join(PUBLIC_DIR,item[0]);
  fs.stat(file,(e,stats)=>{
    if(e || !stats.isFile()) return reply(res,404,{error:'File missing'});
    res.writeHead(200,{'Content-Type':item[1],'Content-Length':stats.size,'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff'});
    fs.createReadStream(file).pipe(res);
  });
}
function subscribe(req,res,url) {
  const {room,player}=playerFromAuth({code:url.searchParams.get('code'),token:url.searchParams.get('token')});
  res.writeHead(200,{'Content-Type':'text/event-stream; charset=utf-8','Cache-Control':'no-cache, no-transform', 'Connection':'keep-alive','X-Accel-Buffering':'no','X-Content-Type-Options':'nosniff'});
  res.write(': Mini-opoly connected\n\n');
  let group=live.get(room.code);
  if(!group){group=new Map();live.set(room.code,group);}
  let peers=group.get(player.token);
  if(!peers){peers=new Set();group.set(player.token,peers);}
  peers.add(res);
  broadcast(room);
  res.on('close',()=>{
    peers.delete(res);
    if(!peers.size)group.delete(player.token);
    if(!group.size)live.delete(room.code);
    else broadcast(room);
  });
}
const server=http.createServer(async(req,res)=>{
  try {
    const origin=req.headers.origin;
    const host=req.headers.host;
    if(origin && new URL(origin).host!==host) throw bad('Cross-site requests are disabled.',403);
    const url=new URL(req.url, `http://${host||'localhost'}`);
    if((req.method==='GET'||req.method==='HEAD')&&url.pathname.startsWith('/api/attachment/'))return serveAttachment(req,res,url);
    if(req.method==='GET'&&url.pathname==='/api/network')return reply(res,200,{urls:networkAddresses(PORT),port:PORT,deeds:GAME_DATA.deeds});
    if(req.method==='GET'&&url.pathname==='/api/events')return subscribe(req,res,url);
    if(req.method==='POST'&&['/api/create','/api/join','/api/resume','/api/action','/api/chat','/api/attachment'].includes(url.pathname)) {
      const body=await readJSON(req,url.pathname==='/api/attachment'?Math.ceil(MAX_ATTACHMENT_BYTES*4/3)+1800:4096);
      if(url.pathname==='/api/create')return reply(res,200,create(body));
      if(url.pathname==='/api/join')return reply(res,200,join(body));
      if(url.pathname==='/api/chat')return reply(res,200,sendChat(body));
      if(url.pathname==='/api/attachment')return reply(res,200,sendAttachment(body));
      if(url.pathname==='/api/resume'){
        const {room,player}=playerFromAuth(body);
        return reply(res,200,{code:room.code,token:player.token,state:publicRoom(room,player)});
      }
      return reply(res,200,act(body));
    }
    if(req.method==='GET' || req.method==='HEAD')return staticFile(res,url.pathname);
    throw bad('Not found.',404);
  } catch(error) {
    console.warn('Request rejected:',error.message);
    if(!res.headersSent&&!res.destroyed)reply(res,error.status||500,{error:error.status?error.message:'Server error.'});
  }
});
setInterval(()=>{
  for(const group of live.values())for(const sockets of group.values())for(const res of sockets)
    if(!res.destroyed&&!res.writableEnded)res.write(': ping\n\n');
},15000).unref();
server.listen(PORT,HOST,()=>{
  console.log('\n🎲 Mini-opoly Wi-Fi multiplayer prototype v0.3.12');
  console.log(`Host opens: http://localhost:${PORT}`);
  for(const u of networkAddresses(PORT))console.log(`Other devices: ${u}`);
  console.log(`Room saves: ${DATA_DIR} (shared across v0.2.3+ upgrades)`);
  console.log('All players must be on the same Wi-Fi. Press Ctrl+C to stop.\n');
});
