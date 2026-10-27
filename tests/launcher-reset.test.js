'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),net=require('node:net'),{spawn}=require('node:child_process');
const {startConsole,createController}=require('../scripts/host-online'),launcher=require('../lib/game-launcher'),seats=require('../public/seat-library');
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function fixture(t){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mini-launcher-reset-'));let child,base;
 async function stop(){if(child?.exitCode===null&&!child.signalCode){const done=new Promise(resolve=>child.once('exit',resolve));child.kill();await done;}}
 async function start(){const port=await new Promise(resolve=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const n=s.address().port;s.close(()=>resolve(n));});});base='http://127.0.0.1:'+port;
  child=spawn(process.execPath,['server.js'],{cwd:path.join(__dirname,'..'),env:{...process.env,HOST:'127.0.0.1',PORT:String(port),DATA_DIR:dir,NODE_ENV:'test',TEST_ROLL_SEQUENCE:'1'},stdio:'ignore'});
  for(let i=0;i<100;i++){try{if((await fetch(base+'/api/network')).ok)return;}catch{}await pause(30);}throw Error('Game did not start.');
 }
 t.after(async()=>{await stop();fs.rmSync(dir,{recursive:true,force:true});});await start();
 async function api(route,body){const r=await fetch(base+'/api/'+route,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});return {status:r.status,...await r.json()};}
 return {dir,start,stop,api,get base(){return base;}};
}
test('host releases all seats, closes every live stream and persists revocation for offline players',async t=>{
 const g=await fixture(t),host=await g.api('create',{name:'Host',capacity:4,rounds:10}),guest=await g.api('join',{code:host.code,name:'Guest'}),offline=await g.api('join',{code:host.code,name:'Offline'}),other=await g.api('create',{name:'Other room'});
 const auth=s=>({code:s.code,token:s.token}),action=(s,kind)=>g.api('action',{...auth(s),kind});
 await action(host,'start');await action(host,'roll');
 assert.equal((await action(guest,'forget-all-seats')).status,403);
 assert.equal((await g.api('resume',auth(host))).state.players.length,3);
 const aborts=[],streams=[];
 for(const seat of [host,guest,guest]){const controller=new AbortController();aborts.push(controller);const response=await fetch(g.base+'/api/events?code='+seat.code+'&token='+seat.token,{signal:controller.signal});assert.equal(response.status,200);streams.push(response.text());}
 t.after(()=>aborts.forEach(c=>c.abort()));
 const result=await action(host,'forget-all-seats');assert.equal(result.status,200);assert.equal(result.roomClosed.code,host.code);
 for(const text of await Promise.all(streams)){assert.match(text,/event: room-closed/);assert.match(text,/host-reset/);assert.doesNotMatch(text,new RegExp(host.token+'|'+guest.token));}
 for(const seat of [host,guest,offline])for(const route of ['resume','action','chat'])assert.equal((await g.api(route,{...auth(seat),kind:'roll',text:'late'})).status,410);
 assert.equal((await g.api('join',{code:host.code,name:'Late join'})).status,404);
 assert.equal((await g.api('resume',auth(other))).status,200);
 const stored=JSON.parse(fs.readFileSync(path.join(g.dir,'rooms.json')));assert.equal(stored.rooms.length,1);assert.deepEqual(stored.closedRooms.map(r=>r.code),[host.code]);assert.doesNotMatch(JSON.stringify(stored.closedRooms),new RegExp(host.token+'|'+offline.token));
 await g.stop();await g.start();assert.equal((await g.api('resume',auth(offline))).status,410);
 assert.equal((await g.api('central',{seats:[auth(offline),auth(other)]})).rooms.length,1);
 const fresh=await g.api('create',{name:'Host',rounds:20,worldShift:'gravity',startingCash:2000});assert.notEqual(fresh.code,host.code);assert.equal(fresh.state.rounds,20);assert.equal(fresh.state.worldShift,'gravity');assert.equal(fresh.state.players[0].cash,2000);assert.equal(fresh.state.players.length,1);assert.deepEqual(fresh.state.owned,{});
});
test('host reset works in the lobby and does not erase completed records',async t=>{
 const g=await fixture(t),a=await g.api('create',{name:'Host'});await g.api('join',{code:a.code,name:'Guest'});
 const recordFile=path.join(g.dir,'match-records.json');fs.writeFileSync(recordFile,JSON.stringify({format:1,matches:[{matchId:'old-match',roundLimit:10,standings:[{name:'Champion',worth:2500}],worldShift:'individual'}]}));
 const before=fs.readFileSync(recordFile,'utf8');assert.equal((await g.api('action',{code:a.code,token:a.token,kind:'forget-all-seats'})).status,200);assert.equal(fs.readFileSync(recordFile,'utf8'),before);
});
test('forgetting the current seat cannot be reimported from the legacy current-seat key',()=>{
 const data=new Map(),storage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};
 const a={code:'ABC234',token:'a'.repeat(32)},b={code:'DEF567',token:'b'.repeat(32)};
 storage.setItem(seats.CURRENT,JSON.stringify(a));seats.remember(storage,b);seats.forget(storage,a.code);
 assert.equal(storage.getItem(seats.CURRENT),null);assert.equal(seats.find(storage,a.code),null);assert.deepEqual(seats.list(storage),[b]);
});
test('launcher navigation is fixed and private, and game launches carry only the avatar capability',async t=>{
 const state={phase:'ready',mode:'local',url:'http://localhost:3000',inviteUrl:'http://192.168.0.87:3000',avatarProfileKey:'avatar-only',gameSettings:{rounds:20}};
 const app=await startConsole({controller:{status:()=>state,stop:async()=>{}}});t.after(()=>app.close());
 const u=new URL(app.url),origin=u.origin,headers={Authorization:'Bearer '+u.hash.slice(1),Origin:origin,'Content-Type':'application/json'};
 async function api(route,body={},h=headers){const response=await fetch(origin+'/api/launcher/'+route,{method:'POST',headers:h,body:JSON.stringify(body)});return {status:response.status,...await response.json()};}
 assert.equal((await api('navigate',{target:'saves'},{})).status,401);
 assert.equal((await api('navigate',{target:'saves'},{...headers,Origin:'https://evil.test'})).status,403);
 for(const target of ['https://evil.test','/__host','__proto__','constructor'])assert.equal((await api('navigate',{target})).status,400);
 const nav=await api('navigate',{target:'saves'});assert.equal(nav.target,'/#saves');assert.equal(nav.revision,1);
 const read=await fetch(origin+'/api/launcher/navigation',{headers}).then(r=>r.json());assert.equal(read.revision,1);
 const game=await api('game'),target=new URL(game.url);assert.equal(target.origin,state.url);assert.equal(target.searchParams.get('setupConsole'),origin);assert.equal(target.hash,'#avatarProfile=avatar-only');assert.doesNotMatch(game.url,new RegExp(u.hash.slice(1)));
 assert.equal((await fetch(origin+'/launcher-bridge.js')).status,200);
 assert.throws(()=>launcher.gameURL({...state,phase:'stopped'},origin));assert.equal(launcher.navigation('setup'),'/setup');
});
test('only authenticated local owner requests can exit the desktop launcher or open this host game',async t=>{
 const calls=[],state={phase:'ready',url:'http://localhost:3000',gameSettings:{}};
 const app=await startConsole({controller:{status:()=>state,stop:async()=>{}},onExit:()=>calls.push('exit'),onOpenGame:url=>calls.push(url)});t.after(()=>app.close());
 const u=new URL(app.url),origin=u.origin,headers={Authorization:'Bearer '+u.hash.slice(1),Origin:origin,'Content-Type':'application/json'};
 const send=(path,body={},h=headers)=>fetch(origin+'/api/launcher/'+path,{method:'POST',headers:h,body:JSON.stringify(body)});
 assert.equal((await send('exit',{},{})).status,401);assert.equal((await send('exit',{}, {...headers,Origin:'http://other.invalid'})).status,403);
 assert.equal((await send('exit',{}, {Authorization:headers.Authorization})).status,403);assert.deepEqual(calls,[]);
 assert.equal((await send('open',{url:'https://other.invalid/'})).status,400);assert.equal((await send('open',{url:state.url+'/private'})).status,400);assert.deepEqual(calls,[]);
 assert.equal((await send('open',{url:state.url+'/?room=ABC234'})).status,200);assert.equal(calls[0],state.url+'/?room=ABC234');
 const central=await fetch(origin+'/api/central',{method:'POST',headers,body:'{}'}).then(r=>r.json());assert.equal(central.hosting.canExitLauncher,true);
 assert.equal((await send('exit')).status,200);assert.equal(calls.at(-1),'exit');
 const plain=await startConsole({controller:{status:()=>state,stop:async()=>{}}});t.after(()=>plain.close());const p=new URL(plain.url);
 assert.equal((await fetch(p.origin+'/api/launcher/exit',{method:'POST',headers:{Authorization:'Bearer '+p.hash.slice(1),Origin:p.origin},body:'{}'})).status,404);
});
test('exiting during a pending start waits for it and leaves no managed host behind',async t=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mini-exit-start-'));let release;
 const gate=new Promise(resolve=>release=resolve),port=await new Promise(resolve=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const port=s.address().port;s.close(()=>resolve(port));});});
 const controller=createController({stateDir:path.join(dir,'hosting'),gamePort:port,env:{DATA_DIR:path.join(dir,'saves')},checkPort:()=>gate,defaultMode:'local'});
 t.after(async()=>{await controller.shutdown();fs.rmSync(dir,{recursive:true,force:true});});
 const starting=controller.command('start',{mode:'local'}),closing=controller.shutdown();release();await starting;await closing;
 assert.equal(controller.status().phase,'stopped');await assert.rejects(controller.command('start',{mode:'local'}),/exiting/);
 await assert.rejects(fetch('http://127.0.0.1:'+port+'/api/network'));
});
