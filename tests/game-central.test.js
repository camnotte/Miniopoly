'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),net=require('node:net'),{spawn}=require('node:child_process');
const central=require('../lib/game-central'),seats=require('../public/seat-library'),{startConsole}=require('../scripts/host-online');
const root=path.join(__dirname,'..');
const storage=()=>{const data=new Map();return {getItem:key=>data.get(key)||null,setItem:(key,value)=>data.set(key,value),removeItem:key=>data.delete(key)};};
const seat=(code,letter)=>({code,token:letter.repeat(32)});
test('seat library migrates the current seat, retains multiple rooms and survives damaged storage',()=>{
 const s=storage(),a=seat('ABC234','a'),b=seat('DEF567','b');s.setItem(seats.CURRENT,JSON.stringify(a));assert.deepEqual(seats.list(s),[a]);
 seats.remember(s,b);s.setItem(seats.CURRENT,JSON.stringify(b));assert.deepEqual(seats.list(s),[b,a]);assert.deepEqual(seats.find(s,a.code),a);
 const updated={...b,token:'z'.repeat(32)};seats.remember(s,updated);assert.deepEqual(seats.find(s,b.code),updated);s.setItem(seats.CURRENT,JSON.stringify(b));
 seats.forget(s,a.code);assert.equal(seats.find(s,a.code),null);s.setItem(seats.KEY,'broken');assert.deepEqual(seats.list(s),[b]);
 s.setItem(seats.KEY,JSON.stringify([a,{...b,token:'bad'},{...a,token:'x'.repeat(32)}]));s.setItem(seats.CURRENT,'broken');assert.deepEqual(seats.list(s),[a]);
});
test('completed-match archive deduplicates legacy finals and preserves every mode without seat credentials',t=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mini-central-records-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
 const store=central.createRecordStore(dir),room={code:'ABC234',name:'Friday',rounds:0,round:6,worldShift:'gravity',players:[{id:'private-id',token:'private-token',avatar:'woman-4',avatarImage:'private-photo'}],finalResults:{matchId:'final-1',roundLimit:0,rounds:6,at:new Date().toISOString(),reason:'last-player',standings:[{id:'private-id',name:'Chris',worth:2000,cash:1500,deeds:2,seat:0}]}};
 store.record(room);store.record(room);assert.equal(store.list().length,1);assert.equal(store.list()[0].worldShift,'gravity');assert.equal(store.list()[0].standings[0].avatar,'woman-4');
 const copy=store.list();copy[0].standings[0].worth=1;assert.equal(store.list()[0].standings[0].worth,2000);
 for(const rounds of [10,12,15,20,30,50])store.record({...room,rounds,worldShift:'individual',finalResults:{...room.finalResults,matchId:'final-'+rounds,roundLimit:rounds}});
 const loaded=central.createRecordStore(dir);assert.equal(loaded.list().length,7);assert.equal(loaded.list()[0].roundsPlayed,6);
 assert.doesNotMatch(JSON.stringify(loaded.list()),/private-id|private-token|private-photo/);assert.equal(fs.existsSync(path.join(dir,'legendary.json')),false);
 loaded.record(room);assert.equal(loaded.list().length,7);
});
test('owner library is a summary with no player secrets and helper links are loopback only',t=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mini-central-owner-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
 fs.writeFileSync(path.join(dir,'rooms.json'),JSON.stringify({rooms:[{code:'ABC234',stage:'playing',round:5,rounds:20,hostId:'secret-id',players:[{id:'secret-id',token:'secret-token',name:'Host',avatarImage:'secret-photo'}]}]}));
 fs.writeFileSync(path.join(dir,'legendary.json'),JSON.stringify({10:[{name:'Chris',worth:1700,playerId:'secret-id'}]}));
 fs.writeFileSync(path.join(dir,'legendary-gravity.json'),JSON.stringify({10:[{name:'Gravity champion',worth:2200,playerId:'secret-gravity-id'}]}));
 const data=central.readOwnerLibrary(dir);assert.equal(data.rooms[0].code,'ABC234');assert.equal(data.legendary[10][0].worth,1700);assert.equal(data.legendaryGravity[10][0].worth,2200);assert.doesNotMatch(JSON.stringify(data),/secret-|hostId|avatarImage/);
 assert.equal(central.consoleURL('http://127.0.0.1:1234'),'http://127.0.0.1:1234');for(const url of ['https://attacker.test','http://127.0.0.1:1234/#secret','http://user@127.0.0.1:1234','http://127.0.0.1:1234/setup','http://192.168.0.87:1234'])assert.equal(central.consoleURL(url),'');
});
async function fixture(t){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mini-central-live-'));let child,base;
 async function stop(){if(child?.exitCode===null&&!child.signalCode){const exited=new Promise(r=>child.once('exit',r));child.kill();await exited;}}
 async function start(){const port=await new Promise(resolve=>{const server=net.createServer();server.listen(0,'127.0.0.1',()=>{const p=server.address().port;server.close(()=>resolve(p));});});base='http://127.0.0.1:'+port;
  child=spawn(process.execPath,['server.js'],{cwd:root,env:{...process.env,HOST:'127.0.0.1',PORT:String(port),DATA_DIR:dir,NODE_ENV:'test',TEST_ROLL_SEQUENCE:'1'},stdio:'ignore'});
  for(let i=0;i<120;i++){try{if((await fetch(base+'/api/network')).ok)return;}catch{}await new Promise(r=>setTimeout(r,30));}throw Error('Game did not start');}
 t.after(async()=>{await stop();fs.rmSync(dir,{recursive:true,force:true});});await start();
 const api=async(route,body)=>{const r=await fetch(base+'/api/'+route,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});return {status:r.status,...await r.json()};};
 return {dir,start,stop,api,get base(){return base;}};
}
test('live Game Central exposes only authenticated browser seats and reads never change the match',async t=>{
 const g=await fixture(t),a=await g.api('create',{name:'Dell PC',roomName:'Friday night',rounds:15}),b=await g.api('join',{code:a.code,name:'MacBook'}),other=await g.api('create',{name:'Other host'});
 await g.api('action',{code:a.code,token:a.token,kind:'start'});await g.api('action',{code:a.code,token:a.token,kind:'roll'});
 const before=fs.readFileSync(path.join(g.dir,'rooms.json'),'utf8');
 assert.deepEqual((await g.api('central',{seats:[]})).rooms,[]);assert.deepEqual((await g.api('central',{seats:[{code:a.code,token:other.token}]})).rooms,[]);
 const result=await g.api('central',{seats:[seat(a.code,'x'),{code:a.code,token:b.token}]});assert.equal(result.rooms.length,1);assert.equal(result.rooms[0].name,'Friday night');assert.equal(result.rooms[0].viewerName,'MacBook');assert.equal(result.rooms[0].viewerHost,false);
 assert.doesNotMatch(JSON.stringify(result),new RegExp(a.token+'|'+b.token+'|'+other.code));assert.equal(fs.readFileSync(path.join(g.dir,'rooms.json'),'utf8'),before);
 assert.equal((await g.api('central',{seats:Array(101).fill({})})).status,400);
 for(const url of ['/central','/game-central.js','/seat-library.js','/art/central/world-2.jpg','/art/central/property-0-1.jpg'])assert.equal((await fetch(g.base+url)).status,200,url);
 const response=await fetch(g.base+'/?central=1&setupConsole='+encodeURIComponent('http://127.0.0.1:1234'),{redirect:'manual'});assert.equal(response.status,302);assert.match(response.headers.get('location'),/^\/central\?/);
 await g.stop();await g.start();const resumed=await g.api('resume',{code:a.code,token:b.token});assert.equal(resumed.state.players[0].pos,1);assert.equal((await g.api('central',{seats:[{code:a.code,token:a.token}]})).rooms[0].round,1);
});
test('finished legacy games enter history once across restarts and room reset',async t=>{
 const g=await fixture(t),a=await g.api('create',{name:'Host',rounds:0,worldShift:'gravity'});await g.api('join',{code:a.code,name:'Guest'});await g.api('action',{code:a.code,token:a.token,kind:'start'});await g.stop();
 const file=path.join(g.dir,'rooms.json'),data=JSON.parse(fs.readFileSync(file));data.rooms[0].stage='finished';data.rooms[0].phase='finished';data.rooms[0].round=8;data.rooms[0].finalResults=null;fs.writeFileSync(file,JSON.stringify(data));
 await g.start();let result=await g.api('central',{seats:[]});assert.equal(result.records.length,1);assert.equal(result.records[0].roundLimit,0);assert.equal(result.records[0].worldShift,'gravity');assert.equal(result.records[0].roundsPlayed,8);assert.deepEqual(result.legendary,{10:[],15:[],20:[]});
 await g.api('action',{code:a.code,token:a.token,kind:'reset'});await g.stop();await g.start();result=await g.api('central',{seats:[]});assert.equal(result.records.length,1);assert.equal((await g.api('resume',{code:a.code,token:a.token})).state.stage,'playing');
});
test('host-PC Game Central requires its private token and same-origin request for all saved rooms',async t=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mini-owner-central-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
 fs.writeFileSync(path.join(dir,'rooms.json'),JSON.stringify({rooms:[{code:'ABC234',players:[{name:'Host',token:'secret'}]}]}));
 const app=await startConsole({env:{DATA_DIR:dir},controller:{status:()=>({phase:'stopped',mode:'local'}),stop:async()=>{}}});t.after(()=>app.close());const url=new URL(app.url),origin=url.origin,headers={Origin:origin,Authorization:'Bearer '+url.hash.slice(1)};
 assert.match(await fetch(origin).then(r=>r.text()),/Game Launcher/);assert.match(await fetch(origin+'/setup').then(r=>r.text()),/Host Game Setup/);
 assert.equal((await fetch(origin+'/api/central',{method:'POST',body:'{}'})).status,401);assert.equal((await fetch(origin+'/api/central',{method:'POST',headers:{...headers,Origin:'https://attacker.test'}})).status,403);
 const response=await fetch(origin+'/api/central',{method:'POST',headers,body:'{}'}),data=await response.json();assert.equal(response.status,200);assert.equal(data.role,'owner');assert.equal(data.rooms.length,1);assert.doesNotMatch(JSON.stringify(data),/secret|password|hostToken/);
});
