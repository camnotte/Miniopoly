'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),net=require('node:net'),{spawn}=require('node:child_process');
const root=path.join(__dirname,'..'),rules=require('../lib/match-options');
async function game(t,{rolls='6',cards='1',settings={},count=2}={}){
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mini-options-'));let child,base;
  async function start(){const port=await new Promise(resolve=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p));});});base='http://127.0.0.1:'+port;
    child=spawn(process.execPath,['server.js'],{cwd:root,env:{...process.env,HOST:'127.0.0.1',PORT:String(port),DATA_DIR:dir,NODE_ENV:'test',TEST_ROLL_SEQUENCE:rolls,TEST_CARD_SEQUENCE:cards},stdio:'ignore'});
    for(let i=0;i<100;i++){try{if((await fetch(base+'/api/network')).ok)return;}catch{}await new Promise(r=>setTimeout(r,25));}throw Error('Host did not start');}
  async function stop(){if(child?.exitCode===null&&!child.signalCode){child.kill();await new Promise(resolve=>child.once('exit',resolve));}}
  t.after(async()=>{await stop();fs.rmSync(dir,{recursive:true,force:true});});await start();
  const api=async(route,body)=>{const res=await fetch(base+'/api/'+route,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});return {status:res.status,...await res.json()};};
  const a=await api('create',{name:'Host',capacity:count,...settings});assert.equal(a.status,200);const seats=[a];for(let i=1;i<count;i++)seats.push(await api('join',{code:a.code,name:'Guest '+i}));
  const act=(seat,kind,extra={})=>api('action',{code:a.code,token:seats[seat].token,kind,...extra}),resume=()=>api('resume',{code:a.code,token:a.token});
  async function edit(fn){await stop();const file=path.join(dir,'rooms.json'),data=JSON.parse(fs.readFileSync(file));fn(data.rooms.find(r=>r.code===a.code));fs.writeFileSync(file,JSON.stringify(data));await start();}
  return {a,seats,act,resume,edit,api};
}
test('shared settings validate atomically, require the host and lock starting cash at start',async t=>{
  const g=await game(t,{settings:{worldShift:'gravity',startingCash:2000,rounds:20}});
  assert.equal(g.a.state.worldShift,'gravity');assert.ok((await g.resume()).state.players.every(p=>p.cash===2000));assert.equal(g.a.state.ranked,false);
  assert.equal((await g.act(1,'set-options',{options:{rounds:10}})).status,403);
  for(const options of [{startingCash:9999,rounds:10},{worldShift:'everyone'},{rounds:-1},{worldShift:'gravity',bad:true}])assert.equal((await g.act(0,'set-options',{options})).status,400);
  assert.equal((await g.resume()).state.rounds,20);
  let x=await g.act(0,'set-options',{options:{rounds:15,worldShift:'individual',startingCash:1000}});assert.equal(x.status,200);assert.ok(x.state.players.every(p=>p.cash===1000));
  x=await g.act(0,'start');assert.ok(x.state.players.every(p=>p.cash===1000));
  assert.equal((await g.act(0,'set-options',{options:{startingCash:1500}})).status,400);
  await g.edit(r=>r.round=16);assert.equal((await g.act(0,'set-options',{options:{rounds:10}})).status,400);
  x=await g.act(0,'set-options',{options:{rounds:0}});assert.equal(x.status,200);assert.equal(x.state.rounds,0);assert.equal(x.state.round,16);assert.match(x.state.log[0],/Unlimited/);
  for(const settings of [{startingCash:0},{worldShift:'bad'},{rounds:999}])assert.equal((await g.api('create',{name:'Invalid',...settings})).status,400);
});
test('live world-shift switches apply on the next roll and preserve an already-settled roll in both directions',async t=>{
  const g=await game(t,{rolls:'6,6,6'});await g.act(0,'start');await g.edit(r=>r.players[1].pos=2);
  let x=await g.act(0,'roll');assert.equal(x.state.lastRoll.worldShift,'individual');assert.equal(x.state.lastRoll.gravityPull,undefined);
  const first=structuredClone(x.state.lastRoll),positions=x.state.players.map(p=>[p.board,p.pos,p.cash]);
  x=await g.act(0,'set-options',{options:{worldShift:'gravity'}});assert.equal(x.status,200);assert.equal(x.state.worldShift,'gravity');assert.deepEqual(x.state.lastRoll,first);assert.deepEqual(x.state.players.map(p=>[p.board,p.pos,p.cash]),positions);
  const notice=x.state.optionsChange;assert.equal(notice.by,'Host');assert.equal(notice.stage,'playing');assert.deepEqual(notice.changes,[{field:'worldShift',before:'individual',after:'gravity'}]);assert.match(x.state.log[0],/next roll/);
  x=await g.act(0,'set-options',{options:{worldShift:'gravity'}});assert.equal(x.state.optionsChange.id,notice.id,'No-op saves do not generate announcements');
  assert.equal((await g.act(1,'set-options',{options:{worldShift:'individual'}})).status,403);assert.equal((await g.resume()).state.optionsChange.id,notice.id);
  await g.act(0,'pass');await g.act(0,'end');x=await g.act(1,'roll');assert.equal(x.state.lastRoll.worldShift,'gravity');assert.ok(x.state.lastRoll.gravityPull);assert.ok(x.state.players.every(p=>p.board===1&&p.pos===8));
  const gravity=structuredClone(x.state.lastRoll);x=await g.act(0,'set-options',{options:{worldShift:'individual'}});assert.equal(x.status,200);assert.deepEqual(x.state.lastRoll,gravity);assert.notEqual(x.state.optionsChange.id,notice.id);
  const savedNotice=structuredClone(x.state.optionsChange);await g.edit(()=>{});assert.deepEqual((await g.resume()).state.optionsChange,savedNotice,'The announcement survives host restart');
  await g.act(1,'end');x=await g.act(0,'roll');assert.equal(x.state.lastRoll.worldShift,'individual');assert.equal(x.state.lastRoll.gravityPull,undefined);assert.equal(x.state.players[1].board,1);assert.equal(x.state.players[1].pos,8);
});
test('round-limit edits and the existing Unlimited action publish announcements without altering personal or player data',async t=>{
  const g=await game(t,{settings:{rounds:20}});await g.act(0,'start');const players=(await g.resume()).state.players;
  let x=await g.act(0,'set-options',{options:{rounds:15}});assert.equal(x.status,200);assert.deepEqual(x.state.optionsChange.changes,[{field:'rounds',before:20,after:15}]);const id=x.state.optionsChange.id;
  assert.equal((await g.act(0,'set-options',{options:{startingCash:2000}})).status,400);assert.equal((await g.resume()).state.optionsChange.id,id);
  x=await g.act(0,'extend-match');assert.equal(x.status,200);assert.notEqual(x.state.optionsChange.id,id);assert.deepEqual(x.state.optionsChange.changes,[{field:'rounds',before:15,after:0}]);assert.equal(x.state.rounds,0);assert.deepEqual(x.state.players,players);
});
for(const value of [6,12])test('Gravity Pull on '+value+' shares the exact destination without GO rewards for pulled players; detained/bankrupt seats stay put',async t=>{
  const g=await game(t,{rolls:String(value),settings:{worldShift:'gravity'},count:4});await g.act(0,'start');
  await g.edit(r=>{r.players[0].pos=16-value;r.players[0].cash=500;r.players[1].board=2;r.players[1].pos=15;r.players[1].cash=700;r.players[1].streak=7;r.players[2].board=2;r.players[2].pos=8;r.players[2].penalty=3;r.players[3].out=true;r.players[3].board=0;r.players[3].pos=3;});
  const x=await g.act(0,'roll'),[a,b,c,d]=x.state.players;assert.equal(x.status,200);assert.equal(a.board,1);assert.equal(a.pos,0);assert.equal(a.cash,700);
  assert.equal(b.board,1);assert.equal(b.pos,0);assert.equal(b.cash,700);assert.equal(b.streak,0);
  assert.equal(c.board,2);assert.equal(c.pos,8);assert.equal(c.penalty,3);assert.equal(d.board,0);assert.equal(d.pos,3);
  assert.deepEqual(x.state.lastRoll.gravityPull.players,[{playerId:b.id,seat:1,previousBoard:2,previousPosition:15}]);
  const at=x.state.lastRoll.at;await g.edit(()=>{});const saved=(await g.resume()).state;assert.equal(saved.worldShift,'gravity');assert.equal(saved.players[1].pos,0);assert.equal(saved.lastRoll.at,at);
});
test('the ten-roll fallback also pulls, and only the roller draws a card',async t=>{
  const g=await game(t,{rolls:'4',cards:'1',settings:{worldShift:'gravity'}});await g.act(0,'start');
  await g.edit(r=>{r.players[0].board=1;r.players[0].pos=10;r.players[0].streak=9;r.players[1].board=0;r.players[1].pos=15;});
  let x=await g.act(0,'roll');assert.equal(x.state.lastRoll.shift,true);assert.equal(x.state.lastRoll.board,2);assert.equal(x.state.lastRoll.position,14);assert.equal(x.state.phase,'card');assert.equal(x.state.pending.playerId,x.state.players[0].id);
  assert.equal(x.state.players[1].board,2);assert.equal(x.state.players[1].pos,14);assert.equal(x.state.players[1].cash,1500);
  x=await g.act(0,'continue-card');assert.equal(x.state.players[0].cash,1625);assert.equal(x.state.players[1].cash,1500);
});
test('Gravity Pull incurs one rent obligation for the roller even when the property owner is pulled there too',async t=>{
  const g=await game(t,{settings:{worldShift:'gravity'}});await g.act(0,'start');await g.edit(r=>{r.players[0].pos=1;r.owned['1-7']={owner:1,level:0,mortgage:false};r.players[1].board=2;r.players[1].pos=9;});
  let x=await g.act(0,'roll');assert.equal(x.state.phase,'rent');assert.equal(x.state.pending.amount,18);assert.equal(x.state.pending.playerId,x.state.players[0].id);assert.equal(x.state.players[1].pos,7);
  x=await g.act(0,'pay');assert.equal(x.state.players[0].cash,1482);assert.equal(x.state.players[1].cash,1518);assert.equal(x.state.phase,'post');
  x=await g.act(0,'end');assert.equal(x.state.turn,1);assert.equal(x.state.lastRoll,null);assert.equal(x.state.players[1].pos,7,'Turn handoff does not move anyone');
});
test('Individual shifts and escape rolls never pull other players',async t=>{
  const g=await game(t,{rolls:'6,6'});await g.act(0,'start');let x=await g.act(0,'roll');assert.equal(x.state.lastRoll.shift,true);assert.equal(x.state.lastRoll.gravityPull,undefined);assert.equal(x.state.players[1].board,0);
  await g.edit(r=>{r.worldShift='gravity';r.turn=0;r.phase='roll';r.pending=null;r.lastRoll=null;r.players[0].board=0;r.players[0].pos=8;r.players[0].penalty=3;r.players[1].board=2;r.players[1].pos=5;});
  x=await g.act(0,'roll');assert.equal(x.state.lastRoll.shift,false);assert.equal(x.state.lastRoll.gravityPull,undefined);assert.equal(x.state.players[0].penalty,0);assert.equal(x.state.players[1].board,2);assert.equal(x.state.players[1].pos,5);
});
test('old saves acquire standard defaults without changing balances or positions',async t=>{
  const g=await game(t);await g.act(0,'start');await g.edit(r=>{delete r.worldShift;delete r.startingCash;r.players[0].cash=321;r.players[0].pos=9;});
  const x=(await g.resume()).state;assert.equal(x.worldShift,'individual');assert.equal(x.startingCash,1500);assert.equal(x.players[0].cash,321);assert.equal(x.players[0].pos,9);
  assert.deepEqual(rules.parse(),{rounds:0,startingCash:1500,worldShift:'individual'});
});
