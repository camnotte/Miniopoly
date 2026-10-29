'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),net=require('node:net'),{spawn}=require('node:child_process');
const root=path.join(__dirname,'..');
async function match(t,{rolls='1',cards='1',rounds,modify}={}){
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mini-portfolio-rules-'));let host;
  async function start(){
    const port=await new Promise(resolve=>{const socket=net.createServer();socket.listen(0,'127.0.0.1',()=>{const n=socket.address().port;socket.close(()=>resolve(n));});});
    const child=spawn(process.execPath,['server.js'],{cwd:root,env:{...process.env,HOST:'127.0.0.1',PORT:String(port),DATA_DIR:dir,NODE_ENV:'test',TEST_ROLL_SEQUENCE:rolls,TEST_CARD_SEQUENCE:cards},stdio:'ignore'});
    host={child,base:'http://127.0.0.1:'+port};
    for(let i=0;i<100;i++){if(child.exitCode!==null)throw Error('Host exited');try{if((await fetch(host.base+'/api/network')).ok)return;}catch{}await new Promise(r=>setTimeout(r,25));}throw Error('Host did not start');
  }
  async function stop(){if(!host||host.child.exitCode!==null||host.child.signalCode!==null)return;await new Promise(r=>{host.child.once('exit',r);host.child.kill();});}
  async function call(route,body){const res=await fetch(host.base+'/api/'+route,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});return {status:res.status,...await res.json()};}
  t.after(async()=>{await stop();fs.rmSync(dir,{recursive:true,force:true});});await start();
  const a=await call('create',{name:'Christopher Notte',capacity:2,rounds}),b=await call('join',{name:'Alex Morgan',code:a.code});assert.equal(a.status,200);assert.equal(b.status,200);
  const seats=[a,b];const act=(seat,kind,extra={})=>call('action',{code:a.code,token:seats[seat].token,kind,...extra});
  assert.equal((await act(0,'start')).status,200);
  async function edit(fn){await stop();const file=path.join(dir,'rooms.json'),saved=JSON.parse(fs.readFileSync(file,'utf8'));fn(saved.rooms.find(r=>r.code===a.code));fs.writeFileSync(file,JSON.stringify(saved));await start();}
  if(modify)await edit(modify);
  const resume=(seat=0)=>call('resume',{code:a.code,token:seats[seat].token});
  async function resolve(seat,result){while(['purchase','card','rent'].includes(result.state.phase)){result=await act(seat,result.state.phase==='purchase'?'pass':result.state.phase==='card'?'continue-card':'pay');assert.equal(result.status,200);}return result;}
  return {act,resume,resolve,edit,call,get base(){return host.base;}};
}

test('default match passes round 50 and bankruptcy crowns the remaining player even at zero net worth',async t=>{
  const m=await match(t,{modify:r=>{r.round=50;r.turn=1;r.phase='post';}});
  let x=await m.act(1,'end');assert.equal(x.state.rounds,0);assert.equal(x.state.round,51);assert.equal(x.state.stage,'playing');
  await m.edit(r=>{r.phase='rent';r.turn=0;r.players[0].cash=0;r.players[1].cash=0;r.obligation={amount:1000,creditor:null,description:'Bank fee'};r.pending={kind:'rent',amount:1000,creditor:null,playerId:r.players[0].id};});
  x=await m.act(0,'bankrupt');assert.equal(x.state.stage,'finished');assert.equal(x.state.round,51);assert.equal(x.state.finalResults.reason,'last-player');assert.equal(x.state.finalResults.standings[0].seat,1);assert.equal(x.state.finalResults.standings[0].bankrupt,false);assert.equal(x.state.finalResults.legendaryEligible,false);
});

test('host can continue a finished 20-round match without resetting seats, cash, or deeds',async t=>{
  const m=await match(t,{rounds:20,modify:r=>{r.turn=1;r.round=20;r.phase='post';r.owned['0-1']={owner:0,level:1,mortgage:false};r.players[0].cash=987;}});
  assert.equal((await m.act(1,'end')).state.stage,'finished');assert.equal((await m.act(1,'extend-match')).status,403);
  let x=await m.act(0,'extend-match');assert.equal(x.state.stage,'playing');assert.equal(x.state.round,21);assert.equal(x.state.rounds,0);assert.equal(x.state.players[0].cash,987);assert.equal(x.state.owned['0-1'].level,1);assert.equal(x.state.ranked,false);
  await m.edit(()=>{});x=await m.resume();assert.equal(x.state.rounds,0);assert.equal(x.state.round,21);
  for(const rounds of [30,50])assert.equal((await m.call('create',{name:'Long game',capacity:2,rounds})).status,200);
  assert.equal((await m.call('create',{name:'Bad options',capacity:2,rounds:21})).status,400);
});

test('7/11 bonus rolls require landing resolution, survive restart, and the third sends directly to Setback',async t=>{
  const m=await match(t,{rolls:'7,11,7'});
  let x=await m.act(0,'roll');assert.equal(x.state.extraRoll,true);assert.equal(x.state.bonusCount,1);assert.equal((await m.act(0,'roll')).status,400);assert.equal((await m.act(1,'end')).status,403);
  await m.resolve(0,x);x=await m.act(0,'end');assert.equal(x.state.phase,'roll');assert.equal(x.state.turn,0);assert.equal(x.state.turnNumber,0);assert.equal(x.state.round,1);
  x=await m.act(0,'roll');assert.equal(x.state.bonusCount,2);await m.resolve(0,x);await m.act(0,'end');await m.edit(()=>{});
  x=await m.resume();assert.equal(x.state.bonusCount,2);const before=x.state.players[0].cash;
  x=await m.act(0,'roll');assert.equal(x.state.lastRoll.value,7);assert.equal(x.state.lastRoll.sentToSetback,true);assert.equal(x.state.players[0].pos,8);assert.equal(x.state.players[0].penalty,3);assert.equal(x.state.players[0].cash,before);assert.equal(x.state.extraRoll,false);
  await m.act(0,'continue-card');x=await m.act(0,'end');assert.equal(x.state.turn,1);assert.equal(x.state.bonusCount,0);
});

test('a nonqualifying bonus roll breaks the chain and landing on Setback is just visiting',async t=>{
  const m=await match(t,{rolls:'7,2,8'});let x=await m.act(0,'roll');await m.resolve(0,x);await m.act(0,'end');x=await m.act(0,'roll');assert.equal(x.state.extraRoll,false);await m.resolve(0,x);await m.act(0,'end');
  x=await m.act(1,'roll');assert.equal(x.state.players[1].pos,8);assert.equal(x.state.players[1].penalty,0);assert.equal(x.state.post.title,'Visiting Setback');
});

test('Community Chest and Chance both include working Go to Setback cards, and the review lists all 47 current cards',async t=>{
  const m=await match(t,{rolls:'4,12',cards:'0,0'});
  const catalog=await fetch(m.base+'/api/cards').then(r=>r.json());assert.equal(catalog.decks.length,5);assert.equal(catalog.decks.reduce((n,d)=>n+d.cards.length,0),47);
  for(const id of ['chest','weather'])assert.equal(catalog.decks.find(d=>d.id===id).cards.find(c=>c.action==='setback').title,'Go to Setback');
  assert.equal(catalog.decks.find(d=>d.id==='chest').cards.find(c=>c.perk==='swap').active,false);
  let x=await m.act(0,'roll');assert.equal(x.state.pending.effect,'setback');assert.equal(x.state.players[0].penalty,0);assert.equal((await m.act(0,'end')).status,400);
  x=await m.act(0,'continue-card');assert.equal(x.state.players[0].pos,8);assert.equal(x.state.players[0].penalty,3);assert.equal(x.state.players[0].cash,1500);await m.act(0,'end');
  x=await m.act(1,'roll');assert.equal(x.state.pending.source,'CHANCE ?');assert.equal(x.state.pending.effect,'setback');x=await m.act(1,'continue-card');assert.equal(x.state.players[1].penalty,3);assert.equal(x.state.players[1].board,1);assert.equal(x.state.players[1].pos,8);
});

test('rent is paused for a Setback landlord and resumes only after release; paid escape costs 20× the settled roll',async t=>{
  const m=await match(t,{rolls:'1,1,1',modify:r=>{r.turn=1;r.players[0].pos=8;r.players[0].penalty=3;r.owned['0-1']={owner:0,level:3,mortgage:false};}});
  let x=await m.act(1,'roll');assert.equal(x.state.phase,'post');assert.equal(x.state.post.title,'Rent paused · Setback');assert.equal(x.state.players[1].cash,1500);await m.act(1,'end');
  x=await m.act(0,'pay-setback');assert.equal(x.state.players[0].cash,1500);assert.equal(x.state.players[0].penalty,3);assert.equal(x.state.phase,'bail');assert.equal(x.state.bailPending.fee,20);const at=x.state.lastRoll.at;assert.equal((await m.act(0,'pay-setback')).status,400);x=await m.act(0,'pay-bail');assert.equal(x.state.lastRoll.at,at);assert.equal(x.state.players[0].cash,1480);assert.equal(x.state.players[0].penalty,0);
  await m.edit(r=>{r.turn=1;r.phase='roll';r.players[1].pos=0;});x=await m.act(1,'roll');assert.equal(x.state.phase,'rent');assert.equal(x.state.pending.amount,42);assert.equal(x.state.players[0].cash,1480);x=await m.act(1,'pay');assert.equal(x.state.players[0].cash,1522);
});

test('failed escape turns stay restricted, third failure locks 20× the roll, and payment reuses the settled die',async t=>{
  const m=await match(t,{rolls:'2,1,2,1,2',modify:r=>{r.players[0].pos=8;r.players[0].penalty=3;r.players[0].cash=10;r.owned['0-15']={owner:0,level:0,mortgage:false};}});
  for(let attempt=1;attempt<=2;attempt++){
    let x=await m.act(0,'roll');assert.equal(x.state.players[0].setbackAttempts,attempt);assert.ok(x.state.players[0].penalty>0);assert.equal(x.state.players[0].pos,8);await m.act(0,'continue-card');await m.act(0,'end');x=await m.act(1,'roll');await m.resolve(1,x);await m.act(1,'end');
  }
  let x=await m.act(0,'roll');assert.equal(x.state.phase,'bail');assert.equal(x.state.bailPending.fee,40);const timestamp=x.state.lastRoll.at;
  assert.equal((await m.act(0,'roll')).status,400);assert.equal((await m.act(0,'pay-bail')).status,400);await m.act(0,'sell-deed',{id:'0-15'});x=await m.act(0,'pay-bail');assert.equal(x.state.players[0].cash,145);assert.equal(x.state.players[0].penalty,0);assert.equal(x.state.players[0].pos,10);assert.equal(x.state.lastRoll.value,2);assert.equal(x.state.lastRoll.at,timestamp);assert.equal(x.state.extraRoll,false);
});

test('rolling 12 exits Setback without an extra roll; an unpaid forced fee permits bankruptcy',async t=>{
  const m=await match(t,{rolls:'12,2',modify:r=>{r.players[0].pos=8;r.players[0].penalty=3;}});
  let x=await m.act(0,'roll');assert.equal(x.state.players[0].penalty,0);assert.equal(x.state.players[0].pos,4);assert.equal(x.state.extraRoll,false);assert.equal(x.state.players[0].board,0);assert.equal(x.state.lastRoll.shift,false);
  await m.edit(r=>{r.turn=0;r.phase='roll';r.players[0].pos=8;r.players[0].penalty=1;r.players[0].setbackAttempts=2;r.players[0].cash=0;});
  x=await m.act(0,'roll');assert.equal(x.state.phase,'bail');x=await m.act(0,'bankrupt');assert.equal(x.status,200);assert.equal(x.state.stage,'finished');assert.equal(x.state.finalResults.standings[0].seat,1);
});


test('live standings use the championship valuation for mortgages, upgrades and bankruptcy transfers',async t=>{
  const m=await match(t,{modify:r=>{
    r.players[0].cash=987;
    r.owned['0-1']={owner:0,level:2,mortgage:false};
    r.owned['0-3']={owner:0,level:0,mortgage:true};
  }});
  const catalog=await fetch(m.base+'/api/network').then(r=>r.json());
  const deed=catalog.deeds.find(d=>d.id==='0-1');
  let x=await m.resume();
  assert.equal(x.state.players[0].worth,987+deed.price+deed.upgradeCost);
  assert.equal(x.state.players[0].deeds,2);
  assert.equal(x.state.players[1].worth,1500);
  await m.edit(r=>{r.phase='rent';r.turn=0;r.players[0].cash=0;r.obligation={amount:10000,creditor:1,description:'Rent'};r.pending={kind:'rent',amount:10000,creditor:1,playerId:r.players[0].id};});
  x=await m.act(0,'bankrupt');assert.equal(x.status,200);
  for(const player of x.state.players){
    const final=x.state.finalResults.standings.find(row=>row.id===player.id);
    assert.equal(player.worth,final.worth);assert.equal(player.deeds,final.deeds);
  }
  assert.equal(x.state.players[0].deeds,0);assert.equal(x.state.players[1].deeds,2);
});

test('snapshot revision persists across restart and increases for turns, practice reset, chat and files',async t=>{
  const m=await match(t);let before=(await m.resume()).state.revision;assert.ok(Number.isSafeInteger(before)&&before>0);
  for(const kind of ['roll','pass','end']){const x=await m.act(0,kind);assert.equal(x.status,200);assert.ok(x.state.revision>before);before=x.state.revision;}
  await m.edit(()=>{});let x=await m.resume();assert.equal(x.state.revision,before);
  x=await m.act(0,'reset');assert.equal(x.status,200);assert.ok(x.state.revision>before);before=x.state.revision;
  // Use the persisted fixture credential only within its private test directory.
  const create=await m.call('create',{name:'Revision host',capacity:2,rounds:0});
  const auth={code:create.code,token:create.token};let revision=create.state.revision;
  assert.equal((await m.call('chat',{...auth,text:'Catch up without resetting the room'})).status,200);
  x=await m.call('resume',auth);assert.ok(x.state.revision>revision);revision=x.state.revision;
  assert.equal((await m.call('attachment',{...auth,name:'hello.txt',data:Buffer.from('Synchronization fixture').toString('base64')})).status,200);
  x=await m.call('resume',auth);assert.ok(x.state.revision>revision);
});

test('paid escape locks 20× any roll, cannot be rerolled, and never shifts or awards a bonus',async t=>{
  const m=await match(t,{rolls:'12,7',modify:r=>{r.players[0].pos=8;r.players[0].penalty=3;r.players[0].streak=9;}});
  let x=await m.act(0,'bail-roll');assert.equal(x.status,200);assert.equal(x.state.phase,'bail');assert.equal(x.state.bailPending.value,12);assert.equal(x.state.bailPending.fee,240);assert.equal(x.state.players[0].cash,1500);assert.equal(x.state.players[0].pos,8);
  const at=x.state.lastRoll.at;assert.equal((await m.act(0,'roll')).status,400);assert.equal((await m.act(0,'bail-roll')).status,400);
  await m.edit(()=>{});x=await m.resume();assert.equal(x.state.bailPending.fee,240);
  x=await m.act(0,'pay-bail');assert.equal(x.status,200);assert.equal(x.state.players[0].board,0);assert.equal(x.state.players[0].streak,9);assert.equal(x.state.players[0].pos,4);assert.equal(x.state.lastRoll.at,at);assert.equal(x.state.lastRoll.shift,false);assert.equal(x.state.extraRoll,false);assert.equal(x.state.players[0].penalty,0);
  // Landing on Community Chest may award a cash card, so assert the fee from its ledger.
  assert.ok(x.state.log.some(s=>s.includes('paid $240')));assert.equal((await m.act(0,'pay-bail')).status,400);
});

test('a free Setback escape on 6 stays in the same world even at the ten-roll threshold',async t=>{
  const m=await match(t,{rolls:'6',modify:r=>{r.players[0].pos=8;r.players[0].board=2;r.players[0].streak=9;r.players[0].penalty=1;r.players[0].setbackAttempts=2;}});
  const x=await m.act(0,'roll');assert.equal(x.status,200);assert.equal(x.state.players[0].penalty,0);assert.equal(x.state.players[0].setbackAttempts,0);assert.equal(x.state.players[0].board,2);assert.equal(x.state.players[0].pos,14);assert.equal(x.state.players[0].streak,9);assert.equal(x.state.lastRoll.shift,false);assert.equal(x.state.extraRoll,false);
});

test('a Setback roll of 7 or 11 fails free escape and never grants a bonus',async t=>{
  const m=await match(t,{rolls:'7,11',modify:r=>{r.players[0].pos=8;r.players[0].penalty=3;}});
  let x=await m.act(0,'roll');assert.equal(x.state.players[0].penalty,2);assert.equal(x.state.players[0].pos,8);assert.equal(x.state.extraRoll,false);
  await m.edit(r=>{r.phase='roll';r.pending=null;});x=await m.act(0,'roll');assert.equal(x.state.players[0].penalty,1);assert.equal(x.state.players[0].pos,8);assert.equal(x.state.extraRoll,false);
});

test('Building Permits in both decks upgrade a chosen incomplete-set property once for free',async t=>{
  const m=await match(t,{rolls:'4,12',cards:'10,10',modify:r=>{r.owned['0-1']={owner:0,level:0,mortgage:false};r.owned['1-1']={owner:1,level:0,mortgage:false};}});
  const catalog=await fetch(m.base+'/api/cards').then(r=>r.json());for(const id of ['chest','weather'])assert.ok(catalog.decks.find(d=>d.id===id).cards.some(c=>c.perk==='building'&&c.active));
  let x=await m.act(0,'roll');assert.equal(x.state.pending.perk,'building');assert.equal((await m.act(0,'use-perk',{perk:'building',id:'0-1'})).status,400,'Resolve draw first');await m.act(0,'continue-card');assert.equal((await m.act(0,'upgrade',{id:'0-1'})).status,400,'Full set missing');
  x=await m.act(0,'use-perk',{perk:'building',id:'0-1'});assert.equal(x.status,200);assert.equal(x.state.owned['0-1'].level,1);assert.equal(x.state.players[0].cash,1500);assert.deepEqual(x.state.players[0].perks,[]);assert.equal(x.state.post.title,'Building Permit Used');assert.equal(x.state.post.id,'0-1');assert.match(x.state.post.message,/Chalets/);assert.equal((await m.act(0,'use-perk',{perk:'building',id:'0-1'})).status,400);assert.equal((await m.act(0,'upgrade',{id:'0-1'})).status,400,'Permit does not exempt future upgrades');
  await m.act(0,'end');x=await m.act(1,'roll');assert.equal(x.state.pending.perk,'building');await m.act(1,'continue-card');x=await m.act(1,'use-perk',{perk:'building',id:'1-1'});assert.equal(x.status,200);assert.equal(x.state.owned['1-1'].level,1);assert.equal(x.state.players[1].cash,1500);
});

test('a permit preview matches the authoritative free upgrade, net-worth increase and rent actually charged',async t=>{
  const {details}=require('../public/building-permit'),deed=require('../game-data.json').deeds.find(d=>d.id==='2-11');
  const m=await match(t,{rolls:'1',modify:r=>{r.phase='post';r.players[0].perks=['building'];r.owned[deed.id]={owner:0,level:2,mortgage:false};r.players[1].board=2;r.players[1].pos=10;}});
  const before=(await m.resume()).state,preview=details(deed,before.owned[deed.id]);
  const upgraded=(await m.act(0,'use-perk',{perk:'building',id:deed.id})).state;
  assert.equal(upgraded.players[0].cash,before.players[0].cash);
  assert.equal(upgraded.players[0].worth-before.players[0].worth,preview.nextValue-preview.value);
  assert.equal(upgraded.owned[deed.id].level,preview.nextLevel);assert.deepEqual(upgraded.players[0].perks,[]);
  await m.act(0,'end');const landing=(await m.act(1,'roll')).state;
  assert.equal(landing.phase,'rent');assert.equal(landing.pending.amount,preview.nextRent);
});

test('Building Permit rejects opponent, mortgage, Level 3, railroad and wrong player without consuming card',async t=>{
  const m=await match(t,{modify:r=>{r.phase='post';r.players[0].perks=['building'];for(const [id,owner,level,mortgage] of [['0-1',1,0,false],['0-3',0,0,true],['0-5',0,3,false],['0-2',0,0,false],['0-7',0,0,false]])r.owned[id]={owner,level,mortgage};}});
  for(const id of ['0-1','0-3','0-5','0-2','invalid']){const x=await m.act(0,'use-perk',{perk:'building',id});assert.equal(x.status,400);assert.deepEqual((await m.resume()).state.players[0].perks,['building']);}
  assert.equal((await m.act(1,'use-perk',{perk:'building',id:'0-7'})).status,403);const x=await m.act(0,'use-perk',{perk:'building',id:'0-7'});assert.equal(x.status,200);assert.equal(x.state.owned['0-7'].level,1);
});

test('one Bonus Roll action immediately rolls; duplicate old clicks cannot consume another bonus',async t=>{
  const m=await match(t,{rolls:'7,11,7'});
  let x=await m.act(0,'roll');const first=x.state.lastRoll.at;assert.equal((await m.act(0,'bonus-roll',{rollAt:first})).status,400,'Must finish landing');await m.resolve(0,x);
  assert.equal((await m.act(1,'bonus-roll',{rollAt:first})).status,403);
  x=await m.act(0,'bonus-roll',{rollAt:first});assert.equal(x.status,200);assert.equal(x.state.lastRoll.value,11);assert.equal(x.state.bonusCount,2);assert.equal(x.state.turn,0);assert.notEqual(x.state.phase,'roll');const second=x.state.lastRoll.at;
  await m.resolve(0,x);assert.equal((await m.act(0,'bonus-roll',{rollAt:first})).status,400,'A delayed duplicate must not trigger next bonus');assert.equal((await m.act(0,'bonus-roll')).status,400);
  x=await m.act(0,'bonus-roll',{rollAt:second});assert.equal(x.status,200);assert.equal(x.state.lastRoll.sentToSetback,true);assert.equal(x.state.extraRoll,false);assert.equal(x.state.players[0].penalty,3);assert.equal((await m.act(0,'bonus-roll',{rollAt:second})).status,400);
});

test('old saved flat-fee Setback payments migrate to 20× without rerolling or losing the room',async t=>{
  const m=await match(t,{modify:r=>{
    const p=r.players[0];p.pos=8;p.penalty=1;p.setbackAttempts=3;
    r.phase='bail';r.bailPending={value:2,fee:50};r.obligation={amount:50,creditor:null,description:'Old fee'};
    r.pending={kind:'bail',value:2,amount:50,playerId:p.id};r.lastRoll={value:2,playerId:p.id,previousBoard:0,board:0,previousPosition:8,position:8,noMove:true,shift:false,at:12345};
  }});
  let x=await m.resume();assert.equal(x.state.phase,'bail');assert.equal(x.state.pending.amount,40);assert.equal(x.state.bailPending.fee,40);assert.equal(x.state.lastRoll.at,12345);
  x=await m.act(0,'pay-bail');assert.equal(x.status,200);assert.equal(x.state.lastRoll.at,12345);assert.equal(x.state.lastRoll.value,2);assert.equal(x.state.players[0].cash,1460);assert.equal(x.state.players[0].pos,10);assert.equal(x.state.players[0].penalty,0);
});
