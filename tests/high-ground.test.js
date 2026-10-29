'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {store}=require('../lib/high-ground'),rules=require('../public/high-ground-rules');
function fixture(options={}){
 let n=0;const engine=store({random:max=>(n++)%max,...options});
 const a=engine.handle({kind:'create',name:'Cam',avatar:'man-1',buildingRounds:5}),b=engine.handle({kind:'join',code:a.code,name:'Mac',avatar:'woman-3'});
 const resume=seat=>engine.handle({kind:'resume',code:a.code,token:[a,b][seat].token}).state;
 const act=(seat,kind,extra={})=>engine.handle({kind,code:a.code,token:[a,b][seat].token,revision:resume(seat).revision,...extra}).state;
 act(0,'start');for(let seat=0;seat<2;seat++)act(seat,'refuge',{property:Object.keys(resume(seat).owned).find(id=>resume(seat).owned[id]===seat)});
 return {engine,a,b,resume,act,internal:engine.rooms.get(a.code)};
}
test('High Ground seats are private, saved independently, and actions reject stale or unauthenticated requests',()=>{
 const f=fixture();const publicState=f.resume(0);assert(publicState.players.every(p=>!('token' in p)));assert.equal(publicState.players[1].avatar,'woman-3');
 assert.throws(()=>f.engine.handle({kind:'resume',code:f.a.code,token:'wrong'}),/Restore/);
 assert.throws(()=>f.engine.handle({kind:'roll',code:f.a.code,token:f.a.token,revision:1}),/room changed/);
 assert.throws(()=>f.act(1,'test',{control:'round'}),/Only the host/);
 assert.throws(()=>f.act(1,'roll'),/Wait for your turn/);
 assert.equal(f.resume(0).players[0].cash,1200);
});
test('one permit pays for one construction action; it does not bypass turn or per-round limits',()=>{
 const f=fixture(),r=f.act(0,'build',{construction:'raise',permit:true});assert.equal(r.players[0].height,2);assert.equal(r.players[0].cash,1200);assert.equal(r.players[0].permits,0);
 assert.throws(()=>f.act(0,'build',{construction:'reinforce',permit:false}),/already used/);
 assert.throws(()=>f.act(1,'build',{construction:'raise',permit:true}),/Wait for your turn/);
 f.act(0,'roll');f.act(0,'end');const before=f.act(1,'roll');const next=f.act(1,'end');assert.equal(next.round,2);assert(!next.players[0].built);assert.equal(next.players[0].cash,before.players[0].cash+120);
});
test('the first wave waits for all building rounds, removes income properties, and damages elevated supports',()=>{
 const f=fixture();for(let seat=0;seat<2;seat++)f.engine.rooms.get(f.a.code).players[seat].height=4;
 let state;for(let i=0;i<4;i++)state=f.act(0,'test',{control:'round'});assert.equal(state.wave,0);assert.equal(state.round,5);
 const target=state.forecast.target;state=f.act(0,'test',{control:'round'});assert.equal(state.wave,1);assert.equal(state.round,6);assert(state.lost.includes(target));assert(!Object.hasOwn(state.owned,target));assert.equal(state.players[0].strength,1);assert.equal(state.stage,'playing');
});
test('failed refuges pause for evacuation, salvage loses height, and the second failure eliminates',()=>{
 const f=fixture();for(let i=0;i<5;i++)f.act(0,'test',{control:'round'});let state=f.resume(0);
 assert(state.resolvingWave);assert(state.players.every(p=>p.awaitingEvac));assert.equal(state.stage,'playing');assert.throws(()=>f.act(0,'roll'),/evacuation decisions/);
 for(let seat=0;seat<2;seat++){state=f.act(seat,'refuge',{property:Object.keys(state.owned).find(id=>state.owned[id]===seat)});}
 assert(!state.resolvingWave);assert.equal(state.round,6);assert(state.players.every(p=>p.evacUsed&&p.height===1&&p.strength===2));
 state=f.act(0,'test',{control:'round'});assert.equal(state.stage,'finished');assert(state.players.every(p=>p.out));assert.deepEqual(state.winners,[0,1]);
});
test('after the final wave height and supports decide; extra cash does not break exact ties',()=>{
 const f=fixture();let state;
 for(let i=0;i<9;i++){
  const raw=f.engine.rooms.get(f.a.code);raw.players.forEach((p,seat)=>{p.height=6;p.strength=4;p.maxStrength=4;p.cash=seat?9999:0;});
  state=f.act(0,'test',{control:'round'});
 }
 assert.equal(state.wave,5);assert.equal(state.stage,'finished');assert.deepEqual(state.winners,[0,1]);assert.equal(state.players[0].strength,1);
});
test('a final evacuation is resolved before victory and cannot turn a submerged destination into a winner',()=>{
 const f=fixture();let state;
 for(let i=0;i<8;i++){f.engine.rooms.get(f.a.code).players.forEach(p=>{p.height=5;p.strength=4;p.maxStrength=4;});f.act(0,'test',{control:'round'});}
 const raw=f.engine.rooms.get(f.a.code);raw.players[0].strength=1;raw.players[1].strength=4;
 const extra=f.resume(0).catalog.find(d=>!Object.hasOwn(raw.owned,d.id)&&!raw.lost.includes(d.id)&&raw.forecast.target!==d.id);raw.owned[extra.id]=0;
 state=f.act(0,'test',{control:'round'});assert.equal(state.wave,5);assert(state.resolvingWave);assert.equal(state.stage,'playing');
 state=f.act(0,'refuge',{property:Object.keys(state.owned).find(id=>state.owned[id]===0)});assert.equal(state.stage,'finished');assert(state.players[0].out);assert.deepEqual(state.winners,[1]);
});
test('cash/property trades are private, recipient-approved and atomic',()=>{
 const f=fixture(),property=Object.keys(f.resume(0).owned).find(id=>f.resume(0).owned[id]===1&&f.resume(0).players[1].refuge!==id);
 let state=f.act(0,'trade',{property,amount:100});const offer=state.offers[0];assert.equal(state.owned[property],1);assert.throws(()=>f.act(0,'respond',{offer:offer.id,choice:'accept'}),/no longer available/);
 state=f.act(1,'respond',{offer:offer.id,choice:'accept'});assert.equal(state.owned[property],0);assert.equal(state.players[0].cash,1100);assert.equal(state.players[1].cash,1300);
 assert.throws(()=>f.act(1,'respond',{offer:offer.id,choice:'accept'}),/no longer available/);
 assert.throws(()=>f.act(0,'trade',{property:state.players[1].refuge,amount:100}),/supporting property/);
});
test('offers recheck current funds and cannot partially transfer a property on failure',()=>{
 const f=fixture(),property=Object.keys(f.resume(0).owned).find(id=>f.resume(0).owned[id]===1&&f.resume(0).players[1].refuge!==id);
 const offered=f.act(0,'trade',{property,amount:1100});f.act(0,'build',{construction:'raise',permit:false});
 assert.throws(()=>f.act(1,'respond',{offer:offered.offers[0].id,choice:'accept'}),/no longer available/);
 const after=f.resume(0);assert.equal(after.owned[property],1);assert.equal(after.players[0].cash,1000);assert.equal(after.players[1].cash,1200);
});
test('prototype persistence restores seats and revisions without touching main room saves',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'high-ground-test-'));try{
  fs.writeFileSync(path.join(dir,'rooms.json'),'main-save-sentinel');const f=fixture({directory:dir});f.act(0,'build',{construction:'raise',permit:true});
  const restored=store({directory:dir}).handle({kind:'resume',code:f.a.code,token:f.a.token}).state;assert.equal(restored.players[0].height,2);assert.equal(fs.readFileSync(path.join(dir,'rooms.json'),'utf8'),'main-save-sentinel');
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('the practice bot acts once per turn and can complete a match without a second human',()=>{
 let n=0;const e=store({random:max=>(n++)%max});const a=e.handle({kind:'create',name:'Cam',buildingRounds:5,demo:true});
 const act=(kind,extra={})=>{const revision=e.handle({kind:'resume',code:a.code,token:a.token}).state.revision;return e.handle({kind,code:a.code,token:a.token,revision,...extra}).state;};
 let state=act('start');state=act('refuge',{property:Object.keys(state.owned).find(id=>state.owned[id]===0)});
 for(let i=0;i<15&&state.stage==='playing';i++){
  if(state.players[0].awaitingEvac){state=act('refuge',{property:Object.keys(state.owned).find(id=>state.owned[id]===0)});if(state.stage==='finished')break;}
  if(state.players[0].out)break;state=act('roll');state=act('end');
  assert(state.stage==='finished'||state.turn===0||state.resolvingWave);
 }
 assert.equal(state.stage,'finished');assert(state.winners.includes(1));
});
test('personal advice follows height, support damage, cash, permits, off-turn status and evacuation',()=>{
 const f=fixture();let r=f.resume(0);assert.match(rules.advice(r,0).text,/Building Permit/);
 r.players[0].permits=0;r.players[0].cash=0;assert.match(rules.advice(r,0).text,/need \$200/);
 r.players[0].cash=1200;r.players[0].height=4;r.players[0].strength=1;assert.deepEqual(rules.advice(r,0).actions,['repair','forecast']);
 r.turn=1;assert.match(rules.advice(r,0).text,/on our turn/);
 r.players[0].awaitingEvac=true;assert.deepEqual(rules.advice(r,0).actions,['refuge']);
 r.players[0].awaitingEvac=false;r.players[0].height=6;r.players[0].strength=4;assert.match(rules.advice(r,0).text,/maximum height/);
});
test('four players get distinct three-world portfolios and private offers stay between participants',()=>{
 const e=store(),a=e.handle({kind:'create',name:'One',buildingRounds:5}),seats=[a];
 for(const name of ['Two','Three','Four'])seats.push(e.handle({kind:'join',code:a.code,name}));
 let r=e.handle({kind:'resume',code:a.code,token:a.token}).state;
 r=e.handle({kind:'start',code:a.code,token:a.token,revision:r.revision}).state;assert.equal(Object.keys(r.owned).length,12);
 for(let seat=0;seat<4;seat++)assert.deepEqual(r.catalog.filter(d=>r.owned[d.id]===seat).map(d=>d.board),[0,1,2]);
 const property=Object.keys(r.owned).find(id=>r.owned[id]===1);
 r=e.handle({kind:'trade',code:a.code,token:a.token,revision:r.revision,property,amount:100}).state;assert.equal(r.offers.length,1);
 assert.equal(e.handle({kind:'resume',code:a.code,token:seats[2].token}).state.offers.length,0);
 assert.equal(e.handle({kind:'resume',code:a.code,token:seats[1].token}).state.offers.length,1);
});
test('evacuation freezes trading and host advance resolves pending decisions without applying two waves',()=>{
 const f=fixture();for(let i=0;i<5;i++)f.act(0,'test',{control:'round'});assert(f.resume(0).resolvingWave);
 assert.throws(()=>f.act(0,'trade',{property:'1-3',amount:100}),/evacuation decisions/);
 const r=f.act(0,'test',{control:'round'});assert.equal(r.round,6);assert.equal(r.wave,1);assert(!r.resolvingWave);assert(r.players.every(p=>p.evacUsed));
});
test('forced die is host-authorized, not exposed in public state, and consumed once',()=>{
 const f=fixture();const r=f.act(0,'test',{control:'die',value:6});assert(!Object.hasOwn(r,'testDie'));
 const moved=f.act(0,'roll');assert.equal(moved.lastMove.die,6);assert.equal(f.engine.rooms.get(f.a.code).testDie,null);
 assert.throws(()=>f.act(0,'roll'),/already rolled/);
});
