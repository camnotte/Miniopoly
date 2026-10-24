'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),net=require('node:net'),{spawn}=require('node:child_process');
const pieces=require('../public/game-pieces');
const pause=ms=>new Promise(r=>setTimeout(r,ms));
test('piece choices are bounded, retain old seat defaults and skip occupied pieces',()=>{
 assert.equal(pieces.items.length,10);assert.equal(new Set(pieces.items.map(p=>p.symbol)).size,10);
 const players=[];for(const symbol of ['🚗','🐱','🐶','📱']){const piece=pieces.choose(undefined,players);assert.equal(piece,symbol);players.push({piece,name:'Player'});}
 assert.equal(pieces.choose(undefined,[{piece:'🐱',name:'Host'}]),'🚗');assert.equal(pieces.choose('🐶',[]),'🐶');
 for(const value of [null,'unknown-car','<img src=x onerror=alert(1)>',{},''])assert.throws(()=>pieces.choose(value),{status:400});
 assert.throws(()=>pieces.choose('🐶',[{piece:'🐶',name:'Chris'}]),{status:409,message:'Dog is already chosen by Chris. Choose another piece.'});
});
async function fixture(t){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mini-pieces-'));let child,base;
 async function stop(){if(child?.exitCode===null&&!child.signalCode){const done=new Promise(r=>child.once('exit',r));child.kill();await done;}}
 async function start(){const port=await new Promise(resolve=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const n=s.address().port;s.close(()=>resolve(n));});});base='http://127.0.0.1:'+port;child=spawn(process.execPath,['server.js'],{cwd:path.join(__dirname,'..'),env:{...process.env,HOST:'127.0.0.1',PORT:String(port),DATA_DIR:dir,NODE_ENV:'test',TEST_ROLL_SEQUENCE:'1'},stdio:'ignore'});for(let i=0;i<100;i++){try{if((await fetch(base+'/api/network')).ok)return;}catch{}await pause(30);}throw Error('Game did not start');}
 t.after(async()=>{await stop();fs.rmSync(dir,{recursive:true,force:true});});await start();
 return {dir,start,stop,async api(route,body){const response=await fetch(base+'/api/'+route,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});return {status:response.status,data:await response.json()};},get base(){return base;}};
}
test('create/join save custom pieces; concurrent claims admit one winner and never silently substitute',async t=>{
 const g=await fixture(t),host=(await g.api('create',{name:'Host',capacity:4,piece:'🐶'})).data;
 assert.equal(host.state.players[0].piece,'🐶');
 const claims=await Promise.all(['A','B'].map(name=>g.api('join',{code:host.code,name,piece:'🚀'})));
 assert.deepEqual(claims.map(r=>r.status).sort(),[200,409]);const winner=claims.find(r=>r.status===200).data;
 assert.deepEqual(winner.state.players.map(p=>p.piece),['🐶','🚀']);assert.match(claims.find(r=>r.status===409).data.error,/already chosen/);
 const next=await g.api('join',{code:host.code,name:'Other',piece:'car'});assert.equal(next.status,200);assert.equal(next.data.state.players[2].piece,'car');
 const before=(await g.api('resume',{code:host.code,token:host.token})).data.state;
 for(const piece of ['bogus',null,{},'<svg>'])assert.equal((await g.api('join',{code:host.code,name:'Invalid',piece})).status,400);
 const after=(await g.api('resume',{code:host.code,token:host.token})).data.state;assert.deepEqual(after,before,'Rejected selections add no player, revision or financial change');
 const a=await g.api('action',{code:host.code,token:host.token,kind:'start'});assert.equal(a.status,200);assert.equal(a.data.state.players[0].piece,'🐶');
 await g.stop();await g.start();const restored=(await g.api('resume',{code:host.code,token:host.token})).data;assert.deepEqual(restored.state.players.map(p=>p.piece),['🐶','🚀','car']);
 const reset=(await g.api('action',{code:host.code,token:host.token,kind:'reset'})).data;assert.deepEqual(reset.state.players.map(p=>p.piece),['🐶','🚀','car']);
});
test('room piece availability is read-only and reveals only names/pieces; live rooms and hostile origins are rejected',async t=>{
 const g=await fixture(t),host=(await g.api('create',{name:'Host',piece:'🎮'})).data;
 const before=fs.readFileSync(path.join(g.dir,'rooms.json'),'utf8');
 for(let i=0;i<3;i++){const result=await g.api('pieces',{code:host.code});assert.equal(result.status,200);assert.deepEqual(result.data,{code:host.code,capacity:4,players:[{name:'Host',piece:'🎮'}]});}
 assert.equal(fs.readFileSync(path.join(g.dir,'rooms.json'),'utf8'),before);assert.equal((await g.api('pieces',{code:'ZZZZZZ'})).status,404);
 const cross=await fetch(g.base+'/api/pieces',{method:'POST',headers:{Origin:'https://attacker.test','Content-Type':'application/json'},body:JSON.stringify({code:host.code})});assert.equal(cross.status,403);
 await g.api('join',{code:host.code,name:'Friend',piece:'📱'});await g.api('action',{code:host.code,token:host.token,kind:'start'});assert.equal((await g.api('pieces',{code:host.code})).status,409);
});
test('older rooms without a piece field retain their original Car/Cat/Dog/Tablet assignment and money',async t=>{
 const g=await fixture(t),host=(await g.api('create',{name:'Host',capacity:4})).data;
 for(const name of ['Two','Three','Four'])await g.api('join',{code:host.code,name});await g.api('action',{code:host.code,token:host.token,kind:'start'});await g.stop();
 const file=path.join(g.dir,'rooms.json'),saved=JSON.parse(fs.readFileSync(file));for(const p of saved.rooms[0].players)delete p.piece;fs.writeFileSync(file,JSON.stringify(saved));await g.start();
 const state=(await g.api('resume',{code:host.code,token:host.token})).data.state;assert.deepEqual(state.players.map(p=>p.piece),['🚗','🐱','🐶','📱']);assert.deepEqual(state.players.map(p=>[p.cash,p.pos,p.board]),Array.from({length:4},()=>[1500,0,0]));
});

test('school bus can be selected, remains exclusive, and survives restart alongside the old car save key',async t=>{
 const g=await fixture(t),host=(await g.api('create',{name:'Legacy car',piece:'car'})).data;
 const joined=await g.api('join',{code:host.code,name:'Bus rider',piece:'school-bus'});assert.equal(joined.status,200);
 const before=(await g.api('resume',{code:host.code,token:host.token})).data.state;
 const denied=await g.api('join',{code:host.code,name:'Other bus',piece:'school-bus'});assert.equal(denied.status,409);assert.match(denied.data.error,/School bus.*already chosen/);
 assert.deepEqual((await g.api('resume',{code:host.code,token:host.token})).data.state,before);
 await g.stop();await g.start();
 const restored=(await g.api('resume',{code:host.code,token:host.token})).data.state;
 assert.deepEqual(restored.players.map(p=>p.piece),['car','school-bus']);assert.deepEqual(restored.players.map(p=>[p.cash,p.pos,p.board]),[[1500,0,0],[1500,0,0]]);
 const bad=await g.api('join',{code:host.code,name:'Truck',piece:'monster-truck'});assert.equal(bad.status,400);
});
