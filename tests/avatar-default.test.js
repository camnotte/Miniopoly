'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),net=require('node:net'),{spawn}=require('node:child_process');
const {avatarDefaults}=require('../lib/avatar-default'),{avatarPNG}=require('./helpers/avatar');
const {hashPassword}=require('../lib/remote-access');
const {createController}=require('../scripts/host-online');
const vm=require('node:vm');
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const port=()=>new Promise(resolve=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p));});});
test('a private avatar preference survives mode/controller restarts and remembers explicit preset/removal choices',t=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mini-avatar-default-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
 const options={stateDir:dir,env:{DATA_DIR:path.join(dir,'saves')}};
 const local=createController({...options,initialMode:'local'}),key=local.status().avatarProfileKey,store=avatarDefaults(options.env.DATA_DIR),photo=avatarPNG();
 assert.match(key,/^[a-f0-9]{64}$/);assert.equal(store.request({key}).profile,null);
 store.request({key,profile:{avatar:'woman-3',photo,personal:true}});
 const online=createController({...options,initialMode:'online'});assert.equal(online.status().avatarProfileKey,key);
 assert.deepEqual(avatarDefaults(options.env.DATA_DIR).request({key}).profile,{avatar:'woman-3',photo,personal:true});
 store.request({key,profile:{avatar:'man-4',photo,personal:false}});assert.equal(avatarDefaults(options.env.DATA_DIR).request({key}).profile.personal,false,'A deliberate preset selection remains selected');
 store.request({key,profile:{avatar:'man-4',photo:null,personal:true}});assert.deepEqual(store.request({key}).profile,{avatar:'man-4',photo:null,personal:false},'Removing a photo cannot resurrect it in another mode');
});
test('avatar preference reads/writes require their own secret and validated bounded PNGs',t=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mini-avatar-private-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));const store=avatarDefaults(dir),key=store.key;
 store.request({key,profile:{avatar:'woman-1',photo:avatarPNG(),personal:true}});const before=fs.readFileSync(path.join(dir,'avatar-default.json'),'utf8');
 for(const value of [undefined,null,{}, {key:'a'.repeat(64)},{key:key+'x'},{key:42}])assert.throws(()=>store.request(value),{status:403});
 for(const photo of ['https://example.com/photo.png','data:image/svg+xml;base64,PHN2Zz4=','data:image/png;base64,AAAA'])assert.throws(()=>store.request({key,profile:{photo,personal:true}}),{status:400});
 assert.throws(()=>store.request({key,profile:null}),{status:400});assert.equal(fs.readFileSync(path.join(dir,'avatar-default.json'),'utf8'),before);
 assert.doesNotMatch(JSON.stringify(store.request({key})),new RegExp(key),'Responses never echo the private preference key');
});
test('damaged avatar preferences are preserved and disable only sharing, never hosting',t=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mini-avatar-damaged-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
 const file=path.join(dir,'avatar-default.json');fs.writeFileSync(file,'damaged optional preference');
 const store=avatarDefaults(dir);assert.equal(store.key,null);assert.throws(()=>store.request({key:'a'.repeat(64)}),{status:503});assert.equal(fs.readFileSync(file,'utf8'),'damaged optional preference');
 const controller=createController({stateDir:path.join(dir,'hosting'),env:{DATA_DIR:dir}});assert.equal(controller.status().phase,'stopped');assert.equal(controller.status().avatarProfileKey,null);
});
test('private launch fragments are removed even if browser storage is blocked; ordinary navigation hashes are retained',()=>{
 const source=fs.readFileSync(path.join(__dirname,'../public/avatar-default.js'),'utf8'),key='d'.repeat(64);
 for(const hash of ['#avatarProfile='+key,'#home&avatarProfile='+key]){
  let replaced;const sandbox={URLSearchParams,location:{hash,pathname:'/',search:'?new=1'},history:{state:{},replaceState:(_s,_t,value)=>{replaced=value;}},localStorage:{getItem(){throw Error('Blocked');},setItem(){throw Error('Blocked');}},window:{},Promise};
  vm.runInNewContext(source,sandbox);assert.equal(sandbox.window.MiniopolyAvatarDefault.enabled,true);assert.doesNotMatch(replaced,/avatarProfile|dddddd/);
 }
 let changed=false;const sandbox={URLSearchParams,location:{hash:'#home'},history:{replaceState(){changed=true;}},localStorage:{getItem:()=>null},window:{},Promise};vm.runInNewContext(source,sandbox);assert.equal(changed,false);assert.equal(sandbox.window.MiniopolyAvatarDefault.enabled,false);
});
test('local and password-protected online APIs share only an authorized avatar preference, never apply it to friends',async t=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mini-avatar-api-'));let child,base,online=false;const key=avatarDefaults(dir).key,photo=avatarPNG(),profile={avatar:'woman-2',photo,personal:true};
 const stop=async()=>{if(child?.exitCode===null&&!child.signalCode){const exited=new Promise(r=>child.once('exit',r));child.kill();await exited;}};
 t.after(async()=>{await stop();fs.rmSync(dir,{recursive:true,force:true});});
 async function start(remote){online=remote;const p=await port();base='http://127.0.0.1:'+p;child=spawn(process.execPath,['server.js'],{cwd:path.join(__dirname,'..'),env:{...process.env,HOST:'127.0.0.1',PORT:String(p),DATA_DIR:dir,...(remote?{MINIOPOLY_PUBLIC_URL:'https://127.0.0.1:'+p,MINIOPOLY_ACCESS_HASH:await hashPassword('private avatar test password'),MINIOPOLY_HOST_TOKEN:'test-health'}:{MINIOPOLY_PUBLIC_URL:'',MINIOPOLY_ACCESS_HASH:'',MINIOPOLY_HOST_TOKEN:''})},stdio:'ignore'});for(let i=0;i<100;i++){try{await fetch(base);return;}catch{}await pause(30);}throw Error('Server did not start');}
 async function request(route,body,cookie,extra={}){return fetch(base+route,{method:body?'POST':'GET',headers:{...(online?{'x-forwarded-proto':'https'}:{}),...(cookie?{Cookie:cookie}:{}),...(body?{'Content-Type':'application/json'}:{}),...extra},...(body?{body:JSON.stringify(body)}:{}),redirect:'manual'});}
 await start(false);let r=await request('/api/avatar-default',{key,profile});assert.equal(r.status,200);assert.deepEqual(await r.json(),{profile});
 assert.equal((await request('/api/avatar-default',{key:'b'.repeat(64)})).status,403);
 assert.equal((await request('/api/avatar-default',{key},null,{Origin:'https://attacker.test'})).status,403);
 let network=await (await request('/api/network')).text();assert.doesNotMatch(network,new RegExp(key+'|avatarProfile|'+photo.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
 const room=await (await request('/api/create',{name:'Friend'})).json();assert.equal(room.state.players[0].avatarImage,null,'A friend does not inherit the host photo');
 await stop();await start(true);
 assert.equal((await request('/api/avatar-default',{key})).status,401,'Knowing a preference key does not bypass the online password');
 const loginPage=await request('/?new=1');assert.match(await loginPage.text(),/avatar-default.js/);assert.equal((await request('/avatar-default.js')).status,200,'Login can retain the private launch fragment before authentication');
 const login=await fetch(base+'/remote/login',{method:'POST',headers:{'x-forwarded-proto':'https',Origin:base.replace('http:','https:'),'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({password:'private avatar test password'}),redirect:'manual'});assert.equal(login.status,303);const cookie=login.headers.get('set-cookie').split(';')[0];
 r=await request('/api/avatar-default',{key},cookie);assert.equal(r.status,200);assert.deepEqual(await r.json(),{profile});
 assert.equal((await request('/api/avatar-default',{key:'c'.repeat(64)},cookie)).status,403);
 network=await (await request('/api/network',null,cookie)).text();assert.doesNotMatch(network,new RegExp(key+'|avatarProfile'));
 const library=await (await request('/api/central',{seats:[]},cookie)).text();assert.doesNotMatch(library,new RegExp(key+'|avatarProfile|avatarImage'));
});
