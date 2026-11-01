'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),net=require('node:net'),{spawn}=require('node:child_process');
const festival=require('../public/community-festival'),view=require('../public/landing-presentation');
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
test('80/20, 70/30 and 60/40 pay every dollar for two, three or four players, with turn-order rounding',()=>{
 for(const count of [2,3,4])for(let total=0;total<=500;total++)for(let visitor=0;visitor<count;visitor++){
  const players=Array.from({length:count},(_,seat)=>({id:'p'+seat,name:'Player '+seat})),rows=festival.shares(total,players,visitor);
  assert.equal(rows[0].seat,visitor);assert.equal(rows[0].amount,Number(BigInt(total)*BigInt(10-count)/10n));assert.equal(rows.reduce((sum,row)=>sum+row.amount,0),total);assert.ok(rows.every(row=>Number.isSafeInteger(row.amount)&&row.amount>=0));
  assert.deepEqual(rows.slice(1).map(r=>r.seat),Array.from({length:count-1},(_,i)=>(visitor+i+1)%count));
 }
 const players=[{name:'A'},{name:'B'},{name:'C'},{name:'D'}];assert.deepEqual(festival.shares(225,players,1).map(r=>[r.seat,r.amount]),[[1,135],[2,30],[3,30],[0,30]]);
 assert.deepEqual(festival.shares(100,players,2).map(r=>[r.seat,r.amount]),[[2,60],[3,14],[0,13],[1,13]]);
 assert.equal(festival.shares(Number.MAX_SAFE_INTEGER,players,0)[0].amount,Number(BigInt(Number.MAX_SAFE_INTEGER)*3n/5n));
});
test('only nonbankrupt players share, including Setback and other worlds; invalid input cannot mint money',()=>{
 const room={festivalFund:300,players:[{id:'a',name:'A',cash:100,board:1},{id:'b',name:'B',cash:200,board:2,penalty:3},{id:'c',name:'C',cash:0,out:true},{id:'d',name:'D',cash:300,board:0}]};
 const result=festival.distribute(room,0);assert.deepEqual(result.shares.map(p=>p.amount),[210,45,45]);assert.deepEqual(room.players.map(p=>p.cash),[310,245,0,345]);assert.equal(room.festivalFund,0);
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
test('Taxes and other bank debts enter the fund only on payment; bankruptcy contributes remaining cash',async t=>{
 const g=await fixture(t);
 for(const [board,pos,amount] of [[0,13,100],[1,14,100],[2,14,125]]){await g.seed(r=>{r.players[0].board=board;r.players[0].pos=pos;r.festivalFund=50;});const due=await g.act(0,'roll');assert.equal(due.state.festivalFund,50);assert.equal((await g.act(1,'pay')).status,403);const paid=await g.act(0,'pay');assert.equal(paid.state.festivalFund,50+amount);assert.equal(paid.state.players[0].cash,1500-amount);assert.equal((await g.act(0,'pay')).status,400);assert.equal((await g.resume()).state.festivalFund,50+amount);}
 await g.seed(r=>{r.phase='rent';r.festivalFund=225;r.obligation={amount:50,creditor:null,description:'Community Chest: Community fundraiser'};r.pending={kind:'rent',amount:50,creditor:null,creditorName:'the Bank',playerId:r.players[0].id};});assert.equal((await g.act(0,'pay')).state.festivalFund,275);
 await g.seed(r=>{r.players[0].board=0;r.players[0].pos=13;r.players[0].cash=1;});await g.act(0,'roll');assert.equal((await g.act(0,'pay')).status,400);assert.equal((await g.resume()).state.festivalFund,0);await g.act(0,'bankrupt');assert.equal((await g.resume(1)).state.festivalFund,1);
});
test('Festival is paid once across restart/refresh and acknowledgment; reset clears it and empty visits pay nothing',async t=>{
 const g=await fixture(t,4);await g.seed(r=>{r.festivalFund=300;r.players[1].board=2;r.players[1].penalty=3;r.players[3].out=true;});
 let x=await g.act(0,'roll');assert.equal(x.state.phase,'card');assert.equal(x.state.pending.effect,'festival');assert.equal(x.state.festivalFund,0);assert.deepEqual(x.state.players.map(p=>p.cash),[1710,1545,1545,1500]);const id=x.state.lastFestival.id;
 assert.equal((await g.act(1,'continue-card')).status,403);assert.equal((await g.act(0,'roll')).status,400);
 await g.edit(()=>{});x=await g.resume(1);assert.equal(x.state.pending.festival.id,id);assert.deepEqual(x.state.players.map(p=>p.cash),[1710,1545,1545,1500]);
 x=await g.act(0,'continue-card');assert.equal(x.state.phase,'post');assert.equal(x.state.post.festival.id,id);assert.equal((await g.act(0,'continue-card')).status,400);assert.deepEqual(x.state.players.map(p=>p.cash),[1710,1545,1545,1500]);
 x=await g.act(0,'reset');assert.equal(x.state.festivalFund,0);assert.equal(x.state.lastFestival,null);await g.seed();x=await g.act(0,'roll');assert.equal(x.state.pending.festival.total,0);assert.deepEqual(x.state.players.map(p=>p.cash),[1500,1500,1500,1500]);
});
test('Gravity Pull onto Festival creates one distribution; detained recipients stay in their world',async t=>{
 const g=await fixture(t,3,'6');await g.seed(r=>{r.worldShift='gravity';r.festivalFund=300;r.players[0].board=0;r.players[0].pos=14;r.players[2].board=2;r.players[2].penalty=3;});const x=await g.act(0,'roll');assert.equal(x.state.players[0].board,1);assert.equal(x.state.players[0].pos,4);assert.equal(x.state.lastRoll.gravityPull.players.length,1);assert.deepEqual(x.state.players.map(p=>p.cash),[1910,1545,1545]);assert.equal(x.state.players[2].board,2);assert.equal(x.state.festivalFund,0);assert.equal(x.state.pending.festival.shares.length,3);
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

test('rent pays 90 percent to the landlord and 10 percent to the fund; Setback still funds it fully',async t=>{
 const g=await fixture(t,2,'3');await g.seed(r=>{r.phase='rent';r.obligation={amount:120,creditor:1,description:'Copper Lane rent'};r.pending={kind:'rent',amount:120,creditor:1,playerId:r.players[0].id};r.festivalFund=10;});let x=await g.act(0,'pay');assert.equal(x.state.festivalFund,22);assert.deepEqual(x.state.players.map(p=>p.cash),[1380,1608]);assert.equal(x.state.post.festivalContribution,12);assert.match(x.state.post.message,/Community Festival/);assert.equal((await g.act(0,'pay')).status,400);assert.equal((await g.resume()).state.festivalFund,22);
 await g.seed(r=>{r.players[0].board=0;r.players[0].pos=8;r.players[0].penalty=3;});x=await g.act(0,'bail-roll');assert.equal(x.state.bailPending.fee,60);assert.equal(x.state.festivalFund,0);x=await g.act(0,'pay-bail');assert.equal(x.state.festivalFund,60);assert.equal(x.state.players[0].cash,1440);assert.equal(x.state.players[1].cash,1500);
});
test('waived card penalties do not fund the pot, voluntary purchases do not fund it, and overflow cannot partially charge a debt',async t=>{
 const g=await fixture(t,2);await g.seed(r=>{r.phase='card';r.players[0].perks=['helping'];r.pending={kind:'card',title:'Test fee',description:'Test fee',source:'Community Chest',amount:-150,playerId:r.players[0].id};});let x=await g.act(0,'continue-card');assert.equal(x.state.obligation.amount,50);assert.equal(x.state.festivalFund,0);x=await g.act(0,'pay');assert.equal(x.state.festivalFund,50);assert.equal(x.state.players[0].cash,1450);
 await g.seed(r=>{r.phase='purchase';r.pending={id:'0-1',price:60,playerId:r.players[0].id};r.owned={};r.festivalFund=25;});x=await g.act(0,'buy');assert.equal(x.state.festivalFund,25);assert.equal(x.state.players[0].cash,1440);
 await g.seed(r=>{r.phase='rent';r.festivalFund=Number.MAX_SAFE_INTEGER;r.obligation={amount:50,creditor:1,description:'Test rent'};r.pending={kind:'rent',amount:50,creditor:1,playerId:r.players[0].id};});assert.equal((await g.act(0,'pay')).status,400);x=await g.resume();assert.equal(x.state.players[0].cash,1500);assert.equal(x.state.players[1].cash,1500);assert.equal(x.state.festivalFund,Number.MAX_SAFE_INTEGER);assert.equal(x.state.phase,'rent');
});
test('payout metadata preserves the actual split and large funds use exact integer arithmetic for every player count',()=>{
 for(const count of [2,3,4]){const players=Array.from({length:count},(_,i)=>({id:String(i),name:String(i),cash:0})),r={players,festivalFund:1000};let result=festival.distribute(r,0);assert.equal(result.visitorPercent,100-count*10);assert.equal(result.sharedPercent,count*10);assert.equal(result.shares[0].amount,(100-count*10)*10);const rows=festival.shares(Number.MAX_SAFE_INTEGER,players,0);assert.equal(rows[0].amount,Number(BigInt(Number.MAX_SAFE_INTEGER)*BigInt(10-count)/10n));assert.equal(rows.reduce((n,x)=>n+BigInt(x.amount),0n),BigInt(Number.MAX_SAFE_INTEGER));}
});

test('net worth includes deed value plus half the standard cost of retained improvements, even with Tsunami construction pricing',async t=>{
 const g=await fixture(t,2);for(const gameMode of ['classic','countdown']){await g.seed(r=>{r.gameMode=gameMode;r.collapse=gameMode==='countdown'?require('../lib/countdown-mode').initialize():null;r.owned={'0-1':{owner:0,level:6,developmentFundedLevels:[1,2,3,4,5,6]}};r.players[0].cash=1000;});const s=(await g.resume()).state;assert.equal(s.players[0].worth,1210);assert.equal(s.players[0].deeds,1);}
});
test('rent bankruptcy splits remaining cash 90/10 while preserving the existing deed-collateral transfer',async t=>{
 const g=await fixture(t,2);await g.seed(r=>{r.phase='rent';r.players[0].cash=80;r.owned={'0-1':{owner:1,level:0},'0-3':{owner:0,level:0}};r.obligation={amount:120,creditor:1,description:'Unpaid property rent'};r.pending={kind:'rent',amount:120,creditor:1,playerId:r.players[0].id};});const x=await g.act(0,'bankrupt');assert.equal(x.state.festivalFund,8);assert.equal(x.state.players[0].cash,0);assert.equal(x.state.players[1].cash,1572);assert.equal(x.state.owned['0-3'].owner,1);assert.equal(x.state.players[0].out,true);assert.equal(x.state.stage,'finished');
});


test('90/10 rent preserves every dollar and rounds only the Festival share, including safe-integer limits',()=>{
 for(const amount of [...Array.from({length:1000},(_,i)=>i),Number.MAX_SAFE_INTEGER,Number.MAX_SAFE_INTEGER-6]){const split=festival.paymentShares(amount,0);assert.equal(split.isRent,true);assert.equal(split.festival,Number((BigInt(amount)+5n)/10n));assert.equal(split.owner+split.festival,amount);assert.equal(festival.paymentShares(amount,null).festival,amount);assert.equal(festival.paymentShares(amount,null).owner,0);}
 assert.deepEqual(festival.paymentShares(120,1),{isRent:true,owner:108,festival:12});assert.deepEqual(festival.paymentShares(6,1),{isRent:true,owner:5,festival:1});for(const amount of [-1,1.5,NaN,Infinity,'60'])assert.throws(()=>festival.paymentShares(amount,1));
});
test('rent recipient overflow cannot partially debit the payer or credit the Festival',async t=>{
 const g=await fixture(t,2);await g.seed(r=>{r.phase='rent';r.players[1].cash=Number.MAX_SAFE_INTEGER;r.festivalFund=20;r.obligation={amount:100,creditor:1,description:'Rent'};r.pending={kind:'rent',amount:100,creditor:1,playerId:r.players[0].id};});assert.equal((await g.act(0,'pay')).status,400);const s=(await g.resume()).state;assert.equal(s.players[0].cash,1500);assert.equal(s.players[1].cash,Number.MAX_SAFE_INTEGER);assert.equal(s.festivalFund,20);assert.equal(s.phase,'rent');
});
