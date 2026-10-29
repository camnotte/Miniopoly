'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {deeds,worlds}=require('../game-data.json'),avatars=require('../public/avatars'),rules=require('../public/high-ground-rules');
const catalog=deeds.filter(d=>d.type==='p'),byId=Object.fromEntries(catalog.map(d=>[d.id,d]));
const fail=(message,status=400)=>{throw Object.assign(Error(message),{status});};
const cleanName=value=>typeof value==='string'?value.replace(/[\x00-\x1f\x7f]/g,'').trim().slice(0,18):'';
const properties=(r,seat)=>catalog.filter(d=>r.owned[d.id]===seat&&!r.lost.includes(d.id));
function player(name,avatar,seat,bot=false){return {name,avatar:avatars.resolve(avatar,seat).id,token:crypto.randomBytes(32).toString('hex'),bot,cash:1200,height:1,strength:2,maxStrength:2,permits:1,refuge:null,evacUsed:false,awaitingEvac:false,out:false,built:false,rolled:false,board:seat%3,pos:0};}
function log(r,text){r.log.unshift(text);r.log=r.log.slice(0,60);}
function forecast(r,random){
 const wave=rules.waves[r.wave];if(!wave){r.forecast=null;return;}
 const refuges=new Set(r.players.map(p=>p.refuge)),pool=catalog.filter(d=>Number.isInteger(r.owned[d.id])&&!r.lost.includes(d.id)&&!refuges.has(d.id));
 r.forecast={...wave,number:r.wave+1,target:pool.length?pool[random(pool.length)].id:null};
}
function finish(r){
 if(r.players.some(p=>p.awaitingEvac&&!p.out))return;
 const alive=r.players.map((p,i)=>({...p,seat:i})).filter(p=>!p.out);
 if(alive.length>1&&r.wave<rules.waves.length)return;
 r.stage='finished';r.offers.forEach(o=>{if(o.status==='pending')o.status='expired';});
 let ranked=alive;
 if(!ranked.length)ranked=r.players.map((p,i)=>({...p,seat:i})).filter(p=>p.outWave===Math.max(...r.players.map(p=>p.outWave||0)));
 ranked.sort((a,b)=>b.height-a.height||b.strength-a.strength);
 const best=ranked[0];r.winners=ranked.filter(p=>p.height===best.height&&p.strength===best.strength).map(p=>p.seat);
 log(r,'High Ground complete: '+r.winners.map(i=>r.players[i].name).join(' and ')+(r.winners.length>1?' share victory.':' wins.'));
}
function strike(r,random){
 const next=r.forecast;r.wave++;log(r,'WAVE '+r.wave+': water '+next.water+', support impact '+next.force+'.');
 if(next.target&&!r.players.some(p=>!p.out&&p.refuge===next.target)){r.lost.push(next.target);delete r.owned[next.target];log(r,byId[next.target].name+' was submerged. It no longer pays income or rent.');}
 for(let seat=0;seat<r.players.length;seat++){
  const p=r.players[seat];if(p.out)continue;
  p.refuge ||=properties(r,seat)[0]?.id||null;
  const flood=p.height<=next.water;p.strength=Math.max(0,p.strength-next.force);
  if(!flood&&p.strength>0){log(r,p.name+' survived at height '+p.height+' with '+p.strength+' support strength.');continue;}
  if(p.refuge&&!r.lost.includes(p.refuge)){r.lost.push(p.refuge);delete r.owned[p.refuge];}
  log(r,p.name+': '+(flood?'water overtook the homes.':'the supports failed.'));
  if(!p.evacUsed&&properties(r,seat).length){p.awaitingEvac=true;p.refuge=null;log(r,p.name+' can evacuate once to another owned property.');}
  else{p.out=true;p.outWave=r.wave;p.awaitingEvac=false;log(r,p.name+' is out.');}
 }
 r.offers.forEach(o=>{if(o.status==='pending'&&(r.lost.includes(o.property)||r.players[o.from].out||r.players[o.to].out))o.status='expired';});
 finish(r);if(r.stage!=='finished')forecast(r,random);
}
function nextRound(r,random){
 if(r.round>=r.buildingRounds)strike(r,random);
 if(r.stage==='finished')return;
 if(r.players.some(p=>p.awaitingEvac&&!p.out)){r.resolvingWave=true;return;}
 incomeRound(r);
}
function incomeRound(r){
 r.round++;r.players.forEach((p,i)=>{p.built=false;p.rolled=false;if(!p.out){const income=properties(r,i).filter(d=>d.id!==p.refuge).length*60;p.cash+=income;}});
 log(r,'Round '+r.round+': each supporting property paid $60 income.');
}
function choose(r,seat,id){
 const p=r.players[seat];if(r.owned[id]!==seat||r.lost.includes(id))fail('Choose one of your unsubmerged properties.');
 if(p.awaitingEvac){p.evacUsed=true;p.awaitingEvac=false;p.height=Math.max(1,p.height-1);p.strength=2;p.maxStrength=2;log(r,p.name+' evacuated to '+byId[id].name+' using salvaged construction.');}
 else if(r.wave>0||p.refuge)fail('Your refuge is committed. It can only move during an evacuation.');
 p.refuge=id;r.offers.forEach(o=>{if(o.status==='pending'&&o.property===id)o.status='expired';});log(r,p.name+' chose '+byId[id].name+' as their refuge.');
 if(r.resolvingWave&&!r.players.some(p=>p.awaitingEvac&&!p.out)){
  r.resolvingWave=false;
  if(r.wave===rules.waves.length)for(const survivor of r.players)if(!survivor.out&&survivor.height<=rules.waves.at(-1).water){survivor.out=true;survivor.outWave=r.wave;log(r,survivor.name+' could not reach safe ground after the final evacuation.');}
  finish(r);if(r.stage!=='finished'){incomeRound(r);r.turn=r.players.findIndex(p=>!p.out);}
 }
}
function build(r,seat,kind,permit){
 const p=r.players[seat];if(!p.refuge||p.awaitingEvac)fail('Choose a refuge first.');if(p.built)fail('You have already used this round’s construction action.');
 if(!['raise','reinforce','repair'].includes(kind))fail('Choose Raise, Reinforce or Repair.');
 if(kind==='raise'&&p.height>=6)fail('Maximum refuge height is six.');
 if(kind==='reinforce'&&p.maxStrength>=4)fail('Supports are already fully reinforced.');
 if(kind==='repair'&&p.strength===p.maxStrength)fail('The supports do not need repairs.');
 if(typeof permit!=='boolean')fail('Choose whether to use a Building Permit.');
 const price=rules.cost(p,kind);if(permit){if(!p.permits)fail('You have no Building Permit.');p.permits--;}else{if(p.cash<price)fail('Not enough cash for this construction.');p.cash-=price;}
 if(kind==='raise')p.height++;if(kind==='reinforce'){p.maxStrength++;p.strength++;}if(kind==='repair')p.strength=p.maxStrength;
 p.built=true;log(r,p.name+' '+{raise:'raised the refuge to height '+p.height,reinforce:'reinforced supports to '+p.maxStrength,repair:'repaired supports to '+p.strength}[kind]+(permit?' using a Building Permit.':' for $'+price+'.'));
}
function end(r,seat,random){
 const p=r.players[seat];if(p.awaitingEvac)fail('Choose an evacuation property first.');if(!p.refuge)fail('Choose your refuge before ending your turn.');if(!p.rolled)fail('Roll before ending your turn.');
 for(let i=seat+1;i<r.players.length;i++)if(!r.players[i].out){r.turn=i;return;}
 nextRound(r,random);if(r.stage!=='finished')r.turn=r.players.findIndex(p=>!p.out);
}
function roll(r,seat,random){
 const p=r.players[seat];if(p.rolled)fail('You have already rolled.');if(p.awaitingEvac)fail('Evacuate before moving.');
 const die=r.testDie??(random(6)+1);r.testDie=null;const previous={board:p.board,pos:p.pos},total=p.pos+die;
 if(total>=16){p.board=(p.board+1)%3;p.cash+=100;log(r,p.name+' passed GO and collected $100.');}p.pos=total%16;p.rolled=true;
 const id=p.board+'-'+p.pos,d=byId[id],owner=r.owned[id];let message=worlds[p.board].tiles[p.pos][1];
 if(d&&Number.isInteger(owner)&&owner!==seat&&!r.lost.includes(id)&&!r.players[owner].out){const rent=d.base*(r.players[owner].refuge===id?Math.max(1,r.players[owner].height):1),paid=Math.min(p.cash,rent);p.cash-=paid;r.players[owner].cash+=paid;message=d.name+': paid $'+paid+' rent to '+r.players[owner].name+(paid<rent?' (limited to available cash)':'');}
 else if(!d){p.cash+=40;message+=' · $40 community supply grant';}
 r.lastMove={seat,die,previous,board:p.board,pos:p.pos,message};log(r,p.name+' rolled '+die+': '+message+'.');
}
function bots(r,random){
 for(const offer of r.offers.filter(o=>!r.resolvingWave&&o.status==='pending'&&r.players[o.to].bot)){
  const buyer=r.players[offer.from],seller=r.players[offer.to];
  if(!buyer.out&&!seller.out&&buyer.cash>=offer.amount&&offer.amount>=byId[offer.property].price&&r.owned[offer.property]===offer.to&&seller.refuge!==offer.property&&!r.lost.includes(offer.property)){
   buyer.cash-=offer.amount;seller.cash+=offer.amount;r.owned[offer.property]=offer.from;offer.status='accepted';log(r,seller.name+' accepted '+buyer.name+'’s offer for '+byId[offer.property].name+'.');
   r.offers.forEach(o=>{if(o.status==='pending'&&o.property===offer.property)o.status='expired';});
  }else offer.status='declined';
 }
 for(let seat=0;seat<r.players.length;seat++)if(r.players[seat].bot&&r.players[seat].awaitingEvac)choose(r,seat,properties(r,seat)[0].id);
 if(r.resolvingWave)return;
 for(let guard=0;guard<4&&r.stage==='playing'&&r.players[r.turn]?.bot;guard++){
  const seat=r.turn,p=r.players[seat];if(p.awaitingEvac||!p.refuge){choose(r,seat,properties(r,seat)[0].id);if(!r.wave)forecast(r,random);}
  const danger=rules.risk(p,r.forecast);let kind=danger.reason==='height'?'raise':danger.reason==='strength'?(p.strength<p.maxStrength?'repair':'reinforce'):p.maxStrength<4?'reinforce':'raise';
  if((kind!=='raise'||p.height<6)&&(kind!=='reinforce'||p.maxStrength<4)&&(p.permits||p.cash>=rules.cost(p,kind)))build(r,seat,kind,!!p.permits);
  roll(r,seat,random);end(r,seat,random);
 }
}
function store({directory,random=crypto.randomInt}={}){
 const rooms=new Map(),file=directory&&path.join(directory,'high-ground-rooms.json');
 if(file&&fs.existsSync(file)){try{const saved=JSON.parse(fs.readFileSync(file,'utf8'));for(const r of (saved.rooms||[]).slice(0,100))if(/^[A-Z2-9]{6}$/.test(r.code)&&Array.isArray(r.players)&&r.players.length>=1&&r.players.length<=4)rooms.set(r.code,r);}catch{console.warn('High Ground prototype save could not be loaded. Main game saves are unaffected.');}}
 function commit(r){const all=new Map(rooms);all.set(r.code,r);if(file){fs.mkdirSync(directory,{recursive:true});const tmp=file+'.'+process.pid+'.tmp';fs.writeFileSync(tmp,JSON.stringify({format:1,rooms:[...all.values()]}),{mode:0o600});fs.renameSync(tmp,file);}rooms.set(r.code,r);}
 function view(r,seat){const result=structuredClone(r);result.players.forEach(p=>{delete p.token;});delete result.testDie;result.you=seat;result.offers=result.offers.filter(o=>o.from===seat||o.to===seat);result.catalog=catalog;result.worlds=worlds.map(w=>({name:w.name,tiles:w.tiles}));return result;}
 function respond(r,seat,token){return {code:r.code,token,state:view(r,seat)};}
 return {handle(body){
  if(!body||typeof body!=='object'||Array.isArray(body))fail('Choose a prototype action.');const kind=body.kind;
  if(kind==='create'){
   if(rooms.size>=100)fail('Prototype room limit reached.');const name=cleanName(body.name);if(!name)fail('Enter your name.');if(![5,10].includes(body.buildingRounds))fail('Choose five or ten building rounds.');
   let code;do{code=Array.from({length:6},()=> 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[random(32)]).join('');}while(rooms.has(code));
   const r={code,revision:1,stage:'lobby',round:1,buildingRounds:body.buildingRounds,wave:0,forecast:null,turn:0,players:[player(name,body.avatar,0)],owned:{},lost:[],offers:[],log:[],winners:[],lastMove:null,testing:false};
   if(body.demo===true)r.players.push(player('Harbor crew','woman-2',1,true));commit(r);return respond(r,0,r.players[0].token);
  }
  const code=typeof body.code==='string'?body.code.trim().toUpperCase():'';const existing=rooms.get(code);if(!existing)fail('High Ground room not found.',404);
  const r=structuredClone(existing);
  if(kind==='join'){
   if(r.stage!=='lobby'||r.players.length>=4)fail('This room has started or is full.',409);const name=cleanName(body.name);if(!name)fail('Enter your name.');
   const seat=r.players.length;r.players.push(player(name,body.avatar,seat));r.revision++;commit(r);return respond(r,seat,r.players[seat].token);
  }
  const seat=r.players.findIndex(p=>typeof body.token==='string'&&p.token===body.token);if(seat<0)fail('Restore your High Ground seat or join the room.',403);
  if(kind==='resume')return respond(r,seat,r.players[seat].token);
  if(!Number.isSafeInteger(body.revision)||body.revision!==r.revision)fail('The room changed. Review the latest state and try again.',409);
  if(['start','test'].includes(kind)&&seat!==0)fail('Only the host can use this control.',403);
  if(kind==='start'){
   if(r.stage!=='lobby'||r.players.length<2)fail('Wait for another player or use the quick demo.');
   r.stage='playing';r.players.forEach((p,i)=>{for(let w=0;w<3;w++){const candidates=catalog.filter(d=>d.board===w);r.owned[candidates[i].id]=i;}});forecast(r,random);log(r,'Choose a refuge. Five storm waves follow '+r.buildingRounds+' building rounds.');
  }else{
   if(r.stage!=='playing')fail('This prototype match is not in progress.');const p=r.players[seat];
   if(kind==='test'){
    if(body.control==='die'){if(!Number.isInteger(body.value)||body.value<1||body.value>6)fail('Choose a die value from one to six.');r.testDie=body.value;}
    else if(body.control==='round'){const wasResolving=r.resolvingWave;for(let i=0;i<r.players.length;i++){if(r.players[i].out)continue;if(!r.players[i].refuge||r.players[i].awaitingEvac)choose(r,i,properties(r,i)[0].id);}if(r.stage==='playing'&&!wasResolving)nextRound(r,random);r.turn=r.players.findIndex(p=>!p.out);}
    else fail('Choose a test control.');r.testing=true;log(r,'Host testing control used.');
   }else{
    if(p.out)fail('Your refuge is out of this match.');
    if(['build','roll','buy','sell','end'].includes(kind)&&seat!==r.turn)fail('Wait for your turn.',403);
    if(r.resolvingWave&&kind!=='refuge')fail('Wait for the evacuation decisions before continuing.');
    if(kind==='refuge'){choose(r,seat,body.property);if(!r.wave)forecast(r,random);}
    else if(kind==='build')build(r,seat,body.construction,body.permit);
    else if(kind==='roll')roll(r,seat,random);
    else if(kind==='buy'){
     const id=p.board+'-'+p.pos,d=byId[id];if(!p.rolled||!d||r.lost.includes(id)||Number.isInteger(r.owned[id]))fail('Land on an available property to buy it.');if(p.cash<d.price)fail('Not enough cash.');p.cash-=d.price;r.owned[id]=seat;log(r,p.name+' bought '+d.name+' for $'+d.price+'.');
    }else if(kind==='sell'){
     if(r.owned[body.property]!==seat||p.refuge===body.property)fail('Choose a supporting property you own.');p.cash+=Math.floor(byId[body.property].price*.6);delete r.owned[body.property];r.offers.forEach(o=>{if(o.status==='pending'&&o.property===body.property)o.status='expired';});log(r,p.name+' sold '+byId[body.property].name+'.');
    }else if(kind==='trade'){
     const to=r.owned[body.property],amount=body.amount;if(!Number.isInteger(to)||to===seat||r.players[to].out||r.players[to].refuge===body.property)fail('Choose another player’s supporting property.');
     if(!Number.isSafeInteger(amount)||amount<1||amount>p.cash)fail('Offer a whole cash amount you can afford.');if(r.offers.filter(o=>o.from===seat&&o.status==='pending').length>=4)fail('You already have four pending offers.');
     r.offers.push({id:crypto.randomUUID(),from:seat,to,property:body.property,amount,status:'pending'});r.offers=r.offers.slice(-40);
    }else if(kind==='respond'){
     const offer=r.offers.find(o=>o.id===body.offer&&o.status==='pending');if(!offer||offer.to!==seat)fail('This offer is no longer available.');if(!['accept','decline'].includes(body.choice))fail('Accept or decline the offer.');
     if(body.choice==='decline')offer.status='declined';else{const buyer=r.players[offer.from];if(buyer.out||buyer.cash<offer.amount||r.owned[offer.property]!==seat||p.refuge===offer.property||r.lost.includes(offer.property))fail('The buyer or property is no longer available.');buyer.cash-=offer.amount;p.cash+=offer.amount;r.owned[offer.property]=offer.from;offer.status='accepted';r.offers.forEach(o=>{if(o.status==='pending'&&o.property===offer.property)o.status='expired';});log(r,p.name+' sold '+byId[offer.property].name+' to '+buyer.name+' for $'+offer.amount+'.');}
    }else if(kind==='end')end(r,seat,random);else fail('Unknown prototype action.');
   }
  }
  bots(r,random);r.revision++;commit(r);return respond(r,seat,r.players[seat].token);
 },rooms};
}
module.exports={store,properties};
