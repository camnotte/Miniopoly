'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),net=require('node:net'),{spawn}=require('node:child_process');
const festival=require('../public/community-festival'),view=require('../public/landing-presentation');
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
test('60/40 pays every dollar for two, three or four players, with turn-order rounding',()=>{
 for(const count of [2,3,4])for(let total=0;total<=500;total++)for(let visitor=0;visitor<count;visitor++){
  const players=Array.from({length:count},(_,seat)=>({id:'p'+seat,name:'Player '+seat})),rows=festival.shares(total,players,visitor);
  assert.equal(rows[0].seat,visitor);assert.equal(rows[0].amount,Math.floor(total*.6));assert.equal(rows.reduce((sum,row)=>sum+row.amount,0),total);assert.ok(rows.every(row=>Number.isSafeInteger(row.amount)&&row.amount>=0));
  assert.deepEqual(rows.slice(1).map(r=>r.seat),Array.from({length:count-1},(_,i)=>(visitor+i+1)%count));
 }
 const players=[{name:'A'},{name:'B'},{name:'C'},{name:'D'}];assert.deepEqual(festival.shares(225,players,1).map(r=>[r.seat,r.amount]),[[1,135],[2,30],[3,30],[0,30]]);
 assert.deepEqual(festival.shares(100,players,2).map(r=>[r.seat,r.amount]),[[2,60],[3,14],[0,13],[1,13]]);
 assert.equal(festival.shares(Number.MAX_SAFE_INTEGER,players,0)[0].amount,Number(BigInt(Number.MAX_SAFE_INTEGER)*3n/5n));
});
test('only nonbankrupt players share, including Setback and other worlds; invalid input cannot mint money',()=>{
 const room={festivalFund:300,players:[{id:'a',name:'A',cash:100,board:1},{id:'b',name:'B',cash:200,board:2,penalty:3},{id:'c',name:'C',cash:0,out:true},{id:'d',name:'D',cash:300,board:0}]};
 const result=festival.distribute(room,0);assert.deepEqual(result.shares.map(p=>p.amount),[180,60,60]);assert.deepEqual(room.players.map(p=>p.cash),[280,260,0,360]);assert.equal(room.festivalFund,0);
 for(const value of [-1,NaN,Infinity,'300'])assert.throws(()=>festival.shares(value,room.players,0));assert.throws(()=>festival.shares(300,room.players,2));
 for(const value of [undefined,-1,NaN,'300'])assert.equal(festival.fund(value),0);
});
test('tax funding is identified by the exact paid tax source, including a saved old obligation',()=>{
 assert.equal(festival.taxName({creditor:null,amount:100,description:'Town Tax · $100'}),'Town Tax');assert.equal(festival.taxName({creditor:null,amount:125,description:'Storm Fund · $125'}),'Storm Fund');
 for(const ob of [{creditor:0,amount:100,description:'Town Tax · $100'},{creditor:null,amount:50,description:'Town Tax · $100'},{creditor:null,amount:100,description:'Community Chest: Town Tax'},{creditor:null,amount:100,description:'Setback escape'},null])assert.equal(festival.taxName(ob),null);
});
test('fund reset and all-player payouts stay hidden until visual arrival without altering authoritative state',()=>{
 const before={code:'ABCDEF',matchId:'m',stage:'playing',turn:0,festivalFund:300,players:[{id:'a',cash:1000},{id:'b',cash:1500}],owned:{},log:[]},after=structuredClone(before);
 Object.assign(after,{lastRoll:{at:1,playerId:'a'},festivalFund:0});after.players[0].cash+=180;after.players[1].cash+=120;
 const hold=view.capture(before,after),shown=view.project(after,hold);assert.equal(shown.festivalFund,300);assert.deepEqual(shown.players.map(p=>p.cash),[1000,1500]);assert.equal(after.festivalFund,0);assert.deepEqual(after.players.map(p=>p.cash),[1180,1620]);assert.equal(view.project(after,null).festivalFund,0);
});
async function fixture(t,count=3,rolls='1'){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mini-festival-'));let child,base;
 async function stop(){if(child?.exitCode===null&&!child.signalCode){const done=new Promise(resolve=>child.once('exit',resolve));child.kill();await done;}}
 async function start(){const port=await new Promise(resolve=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p));});});base='http://127.0.0.1:'+port;child=spawn(process.execPath,['server.js'],{cwd:path.join(__dirname,'..'),env:{...process.env,HOST:'127.0.0.1',PORT:String(port),DATA_DIR:dir,NODE_ENV:'test',TEST_ROLL_SEQUENCE:rolls,TEST_CARD_SEQUENCE:'11,12,13,14,15,16'},stdio:'ignore'});for(let i=0;i<100;i++){try{if((await fetch(base+'/api/network')).ok)return;}catch{}await pause(25);}throw Error('Server did not start');}
 t.after(async()=>{await stop();fs.rmSync(dir,{recursive:true,force:true});});await start();
 async function call(route,body){const r=await fetch(base+'/api/'+route,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});return {status:r.status,...await r.json()};}
 const a=await call('create',{name:'Visitor',capacity:4}),seats=[a];for(let i=1;i<count;i++)seats.push(await call('join',{code:a.code,name:'Player '+i}));
 const act=(seat,kind,extra={})=>call('action',{code:a.code,token:seats[seat].token,kind,...extra});assert.equal((await act(0,'start')).status,200);
 const resume=(seat=0)=>call('resume',{code:a.code,token:seats[seat].token});
 async function edit(fn){await stop();const file=path.join(dir,'rooms.json'),data=JSON.parse(fs.readFileSync(file));fn(data.rooms.find(r=>r.code===a.code));fs.writeFileSync(file,JSON.stringify(data));await start();}
 async function seed(fn){await edit(r=>{Object.assign(r,{phase:'roll',stage:'playing',turn:0,pending:null,post:null,obligation:null,lastRoll:null,testRollIndex:0,festivalFund:0});r.players.forEach((p,i)=>Object.assign(p,{cash:1500,board:1,pos:i?0:3,penalty:0,out:false,perks:[],streak:0}));fn?.(r);});}
 return {act,resume,edit,seed,call,get base(){return base;}};
}
test('Town Tax in either world and Storm Fund contribute only on successful payment; other fees do not',async t=>{
 const g=await fixture(t);
 for(const [board,pos,amount] of [[0,13,100],[1,14,100],[2,14,125]]){await g.seed(r=>{r.players[0].board=board;r.players[0].pos=pos;r.festivalFund=50;});const due=await g.act(0,'roll');assert.equal(due.state.festivalFund,50);assert.equal((await g.act(1,'pay')).status,403);const paid=await g.act(0,'pay');assert.equal(paid.state.festivalFund,50+amount);assert.equal(paid.state.players[0].cash,1500-amount);assert.equal((await g.act(0,'pay')).status,400);assert.equal((await g.resume()).state.festivalFund,50+amount);}
 await g.seed(r=>{r.phase='rent';r.festivalFund=225;r.obligation={amount:50,creditor:null,description:'Community Chest: Community fundraiser'};r.pending={kind:'rent',amount:50,creditor:null,creditorName:'the Bank',playerId:r.players[0].id};});assert.equal((await g.act(0,'pay')).state.festivalFund,225);
 await g.seed(r=>{r.players[0].board=0;r.players[0].pos=13;r.players[0].cash=1;});await g.act(0,'roll');assert.equal((await g.act(0,'pay')).status,400);assert.equal((await g.resume()).state.festivalFund,0);await g.act(0,'bankrupt');assert.equal((await g.resume(1)).state.festivalFund,0);
});
test('Festival is paid once across restart/refresh and acknowledgment; reset clears it and empty visits pay nothing',async t=>{
 const g=await fixture(t,4);await g.seed(r=>{r.festivalFund=300;r.players[1].board=2;r.players[1].penalty=3;r.players[3].out=true;});
 let x=await g.act(0,'roll');assert.equal(x.state.phase,'card');assert.equal(x.state.pending.effect,'festival');assert.equal(x.state.festivalFund,0);assert.deepEqual(x.state.players.map(p=>p.cash),[1680,1560,1560,1500]);const id=x.state.lastFestival.id;
 assert.equal((await g.act(1,'continue-card')).status,403);assert.equal((await g.act(0,'roll')).status,400);
 await g.edit(()=>{});x=await g.resume(1);assert.equal(x.state.pending.festival.id,id);assert.deepEqual(x.state.players.map(p=>p.cash),[1680,1560,1560,1500]);
 x=await g.act(0,'continue-card');assert.equal(x.state.phase,'post');assert.equal(x.state.post.festival.id,id);assert.equal((await g.act(0,'continue-card')).status,400);assert.deepEqual(x.state.players.map(p=>p.cash),[1680,1560,1560,1500]);
 x=await g.act(0,'reset');assert.equal(x.state.festivalFund,0);assert.equal(x.state.lastFestival,null);await g.seed();x=await g.act(0,'roll');assert.equal(x.state.pending.festival.total,0);assert.deepEqual(x.state.players.map(p=>p.cash),[1500,1500,1500,1500]);
});
test('Gravity Pull onto Festival creates one distribution; detained recipients stay in their world',async t=>{
 const g=await fixture(t,3,'6');await g.seed(r=>{r.worldShift='gravity';r.festivalFund=300;r.players[0].board=0;r.players[0].pos=14;r.players[2].board=2;r.players[2].penalty=3;});const x=await g.act(0,'roll');assert.equal(x.state.players[0].board,1);assert.equal(x.state.players[0].pos,4);assert.equal(x.state.lastRoll.gravityPull.players.length,1);assert.deepEqual(x.state.players.map(p=>p.cash),[1880,1560,1560]);assert.equal(x.state.players[2].board,2);assert.equal(x.state.festivalFund,0);assert.equal(x.state.pending.festival.shares.length,3);
});
test('old rooms start with an empty fund and keep an already drawn bonus; legacy pending tax can fund it',async t=>{
 const g=await fixture(t,2);await g.edit(r=>{delete r.festivalFund;delete r.lastFestival;r.phase='card';r.players[0].cash=1600;r.pending={kind:'card',source:'Community Bonus',title:'Neighborhood Grant',description:'Collected $100.',amount:100,playerId:r.players[0].id};});let x=await g.resume();assert.equal(x.state.festivalFund,0);assert.equal(x.state.pending.title,'Neighborhood Grant');assert.equal(x.state.players[0].cash,1600);await g.act(0,'continue-card');
 await g.edit(r=>{delete r.festivalFund;r.phase='rent';r.obligation={amount:100,creditor:null,description:'Town Tax · $100'};r.pending={kind:'rent',amount:100,creditor:null,playerId:r.players[0].id};});x=await g.act(0,'pay');assert.equal(x.state.festivalFund,100);assert.equal(x.state.players[0].cash,1500);
 const catalog=await fetch(g.base+'/api/cards').then(r=>r.json()),chest=catalog.decks.find(d=>d.id==='chest');for(const perk of ['volunteer','helping','tow','escape','building','swap'])assert.ok(chest.cards.some(c=>c.perk===perk));assert.equal(catalog.decks.some(d=>d.id==='community'),false);
});
test('former bonus rewards and perks can actually be drawn from Community Chest, including full inventory conversion',async t=>{
 const g=await fixture(t,2);
 for(const [index,title,perk,amount]of [[0,'Neighborhood Grant',null,100],[1,'Community Bake Sale',null,75],[2,'Volunteer Crew','volunteer',0],[3,'Helping Hand','helping',0],[4,'Tow Voucher','tow',0],[5,'Swap Favor','swap',0]]){
  await g.seed(r=>{r.players[0].board=0;r.players[0].pos=3;r.testCardIndex=index;});const x=await g.act(0,'roll');assert.equal(x.state.pending.title,title);assert.equal(x.state.pending.source,'Community Chest');assert.equal(x.state.players[0].cash,1500+amount);if(perk)assert.ok(x.state.players[0].perks.includes(perk));assert.equal(x.state.festivalFund,0);
 }
 await g.seed(r=>{r.players[0].board=0;r.players[0].pos=3;r.testCardIndex=2;r.players[0].perks=['building','escape'];});const x=await g.act(0,'roll');assert.equal(x.state.players[0].cash,1550);assert.deepEqual(x.state.players[0].perks,['building','escape']);assert.match(x.state.pending.description,/inventory full/);
});
