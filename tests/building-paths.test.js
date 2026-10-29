'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),net=require('node:net'),{spawn}=require('node:child_process');
const development=require('../public/property-development'),{deeds}=require('../game-data.json');
const root=path.resolve(__dirname,'..');
async function server(dir){const port=await new Promise(resolve=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p));});});const child=spawn(process.execPath,['server.js'],{cwd:root,env:{...process.env,HOST:'127.0.0.1',PORT:String(port),DATA_DIR:dir},stdio:'ignore'}),base='http://127.0.0.1:'+port;for(let i=0;i<160;i++){try{if((await fetch(base+'/api/network')).ok)return {child,base};}catch{}await new Promise(r=>setTimeout(r,25));}throw Error('Host did not start');}
async function stop(s){if(s?.child.exitCode===null){s.child.kill();await new Promise(r=>s.child.once('exit',r));}}
async function api(s,route,body){const response=await fetch(s.base+'/api/'+route,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});return {status:response.status,...await response.json()};}
test('development conversion consumes three buildings; six steps keep the standard cost basis and cannot overbuild',()=>{
 const o={level:0};for(let level=1;level<=6;level++){assert(development.develop(o));assert.equal(o.level,level);assert.equal(development.valueSteps(o),level);const slots=development.slots(level);assert.equal((slots.match(/is-filled/g)||[]).length,level>=4?level-3:level);}
 assert.equal(development.develop(o),false);let refunded=0;while(o.level)refunded+=development.remove(o);assert.equal(refunded,6);assert.equal(development.valueSteps(o),0);assert.equal(development.remove(o),0);
});
test('legacy development migration preserves ownership and value while applying the new Estate rent and cannot create extra resale cash',()=>{
 const room={owned:{a:{level:0},b:{level:1},c:{level:2},d:{level:3}},trades:[{status:'pending'}]},expectedRents=[1,2,4,20];assert(development.migrate(room));
 assert.deepEqual(Object.values(room.owned).map(o=>o.level),[0,1,3,4]);assert.deepEqual(Object.values(room.owned).map(development.valueSteps),[0,1,2,3]);assert.deepEqual(Object.values(room.owned).map(o=>development.multipliers[o.level]),expectedRents);assert.equal(room.trades[0].status,'expired');
 const before=structuredClone(room);assert(!development.migrate(room));assert.deepEqual(room,before);
 for(const [key,expected] of [['c',2],['d',3]]){let refund=0;while(room.owned[key].level)refund+=development.remove(room.owned[key]);assert.equal(refund,expected);}
});
test('a flood damages value once, including migrated Estates, while a spent seawall remains spent',()=>{
 const room={owned:{a:{level:3}}};development.migrate(room);assert.equal(development.valueSteps(room.owned.a),3);development.remove(room.owned.a,{damage:true});assert.equal(room.owned.a.level,3);assert.equal(development.valueSteps(room.owned.a),2);
});
test('a normal host builds 1, 2, 3 Houses/Chalets, builds up to three Estates, enforces sets and preserves legacy saves',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mini-building-paths-'));let s;
 try{
  s=await server(dir);const a=await api(s,'create',{name:'Cam',rounds:10}),b=await api(s,'join',{code:a.code,name:'Mac'});await api(s,'action',{code:a.code,token:a.token,kind:'start'});await stop(s);
  const file=path.join(dir,'rooms.json'),saved=JSON.parse(fs.readFileSync(file)),r=saved.rooms.find(r=>r.code===a.code);r.phase='post';r.players[0].cash=5000;r.owned={};for(const d of deeds.filter(d=>d.type==='p'&&d.color==='Brown'))r.owned[d.id]={owner:0,level:0,mortgage:false};fs.writeFileSync(file,JSON.stringify(saved));s=await server(dir);
  const act=(token,kind,extra={})=>api(s,'action',{code:a.code,token,kind,...extra});let result;
  for(const id of ['0-1','1-1']){
   for(let level=1;level<=6;level++){result=await act(a.token,'upgrade',{id});assert.equal(result.status,200,result.error);assert.equal(result.state.owned[id].level,level);assert.equal(development.valueSteps(result.state.owned[id]),level);assert.match(result.state.log[0],new RegExp(level>=4?'Estate':id==='1-1'?'Chalet':'House'));}
   const before=result.state.players[0].cash;assert.equal((await act(a.token,'upgrade',{id})).status,400);assert.equal((await api(s,'resume',{code:a.code,token:a.token})).state.players[0].cash,before);
  }
  assert.equal(result.state.players[0].cash,4400);assert.equal((await act(b.token,'upgrade',{id:'2-1'})).status,403);
  result=await act(a.token,'sell-upgrade',{id:'0-1'});assert.equal(result.state.owned['0-1'].level,5);assert.equal(result.state.players[0].cash,4425);
  await stop(s);const legacy=JSON.parse(fs.readFileSync(file)),old=legacy.rooms.find(r=>r.code===a.code);delete old.developmentRule;old.owned={'0-1':{owner:0,level:3,mortgage:false}};old.players[0].cash=1000;old.phase='post';fs.writeFileSync(file,JSON.stringify(legacy));s=await server(dir);
  const restored=await api(s,'resume',{code:a.code,token:a.token});assert.equal(restored.state.owned['0-1'].level,4);assert.equal(restored.state.owned['0-1'].developmentValueSteps,3);assert.equal(restored.state.players[0].worth,1135);
  const sold=await api(s,'action',{code:a.code,token:a.token,kind:'sell-upgrade',id:'0-1'});assert.equal(sold.status,200);assert.equal(sold.state.players[0].cash,1025);assert.equal(sold.state.owned['0-1'].level,3);assert.equal(sold.state.players[0].worth,1135);
  await stop(s);s=await server(dir);const resumed=await api(s,'resume',{code:a.code,token:a.token});assert.equal(resumed.state.owned['0-1'].level,3);assert.equal(resumed.state.owned['0-1'].developmentValueSteps,2);assert.equal(resumed.state.players[0].worth,1135);
 }finally{await stop(s);fs.rmSync(dir,{recursive:true,force:true});}
});

test('v0.3.89 saves retain every stage and the funded ledger when adding Estate capacity',()=>{
 const room={developmentRule:'three-buildings-v1',owned:{a:{level:3,developmentFundedLevels:[1,3],developmentValueSteps:2},b:{level:4,developmentFundedLevels:[1,3,4],developmentValueSteps:3}},trades:[{status:'pending'}]};
 const before=structuredClone(room.owned);assert(development.migrate(room));assert.deepEqual(room.owned,before);assert.equal(room.trades[0].status,'expired');
 development.develop(room.owned.b);development.develop(room.owned.b);assert.equal(room.owned.b.level,6);assert.equal(development.valueSteps(room.owned.b),5);
 let refund=0;while(room.owned.b.level)refund+=development.remove(room.owned.b);assert.equal(refund,5);assert(!development.migrate(room));
});

test('actual Estate rents settle correctly in Standard, World Collapse and Tsunami, including all three worlds',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mini-estate-rents-'));let s;
 try{
  s=await server(dir);
  for(const [gameMode,id] of [['classic','0-1'],['express','1-1'],['countdown','2-13']]){
   const a=await api(s,'create',{name:'Cam',capacity:2,gameMode,rounds:10}),b=await api(s,'join',{code:a.code,name:'Mac'});
   const act=(token,kind,extra={})=>api(s,'action',{code:a.code,token,kind,...extra});await act(a.token,'start');await act(a.token,'developer',{developer:{action:'settings',die:1,repeat:true}});
   const deed=deeds.find(d=>d.id===id);
   for(const [level,multiplier] of [[4,20],[5,30],[6,40]]){
    await stop(s);const file=path.join(dir,'rooms.json'),data=JSON.parse(fs.readFileSync(file)),r=data.rooms.find(r=>r.code===a.code);
    Object.assign(r,{phase:'roll',turn:1,pending:null,post:null,lastRoll:null,obligation:null});r.players.forEach(p=>{p.cash=10000;p.penalty=0;p.streak=0;});r.players[1].board=deed.board;r.players[1].pos=deed.pos-1;r.owned[id]={owner:0,level,mortgage:false};fs.writeFileSync(file,JSON.stringify(data));s=await server(dir);
    const landed=await act(b.token,'roll');assert.equal(landed.status,200);assert.equal(landed.state.phase,'rent');assert.equal(landed.state.pending.amount,deed.base*multiplier);assert.equal(landed.state.players[0].cash,10000);
    const paid=await act(b.token,'pay');assert.equal(paid.status,200);assert.equal(paid.state.players[0].cash,10000+deed.base*multiplier);assert.equal(paid.state.players[1].cash,10000-deed.base*multiplier);
   }
   // A permit adds a third Estate for free, but a fourth Estate is rejected.
   await stop(s);const file=path.join(dir,'rooms.json'),data=JSON.parse(fs.readFileSync(file)),r=data.rooms.find(r=>r.code===a.code);r.phase='post';r.turn=0;r.pending=null;r.players[0].cash=1000;r.players[0].perks=['building','building'];r.owned[id]={owner:0,level:5,mortgage:false};fs.writeFileSync(file,JSON.stringify(data));s=await server(dir);
   const built=await act(a.token,'use-perk',{id,perk:'building'});assert.equal(built.status,200);assert.equal(built.state.owned[id].level,6);assert.equal(built.state.players[0].cash,1000);assert.equal((await act(a.token,'use-perk',{id,perk:'building'})).status,400);
  }
 }finally{await stop(s);fs.rmSync(dir,{recursive:true,force:true});}
});
test('a tsunami removes exactly one development from each Estate tier and cannot renew its protection',()=>{
 const countdown=require('../lib/countdown-mode');
 for(const level of [4,5,6]){
  const r={gameMode:'countdown',round:11,rounds:10,owned:{'0-1':{owner:0,level},'1-1':{owner:1,level:0}},players:[{name:'Cam',perks:[]},{name:'Mac',perks:[]}],log:[],collapse:{wave:0,endangered:['0-1'],lost:{},shieldSpent:{}}};
  countdown.startRound(r);assert.equal(r.owned['0-1'].level,level-1);assert.equal(development.valueSteps(r.owned['0-1']),level-1);assert(r.collapse.shieldSpent['0-1']);
  development.develop(r.owned['0-1']);r.round=12;r.collapse.endangered=['0-1'];countdown.startRound(r);assert.equal(r.owned['0-1'],undefined);assert.equal(r.collapse.lost['0-1'],2);
 }
});
