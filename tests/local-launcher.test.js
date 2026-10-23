'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),net=require('node:net');
const {spawn}=require('node:child_process'),{localEnvironment}=require('../scripts/start-local');
const root=path.join(__dirname,'..'),pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const remote={MINIOPOLY_PUBLIC_URL:'https://8.8.8.8',MINIOPOLY_ACCESS_HASH:'a'.repeat(32)+':'+ 'b'.repeat(64),MINIOPOLY_HOST_TOKEN:'local-launcher-test-token'};
const freePort=()=>new Promise(resolve=>{const server=net.createServer();server.listen(0,'127.0.0.1',()=>{const port=server.address().port;server.close(()=>resolve(port));});});
async function stop(child){if(child.exitCode!==null||child.signalCode)return;const done=new Promise(resolve=>child.once('exit',resolve));child.kill();await done;}
async function ready(url,options={}){for(let i=0;i<100;i++){try{const response=await fetch(url,options);if(response.status===200)return response;}catch{}await pause(30);}throw Error('Test game did not become ready.');}

test('local launcher clears inherited online credentials without changing the input or saved-directory selection',()=>{
  const input={...remote,HOST:'127.0.0.1',DATA_DIR:'retained-room-directory',MINIOPOLY_AVATAR_DEFAULT_DIR:'retained-photo-directory'},copy={...input};
  const env=localEnvironment(input);assert.deepEqual(input,copy);assert.equal(env.HOST,'0.0.0.0');assert.equal(env.PORT,'3000');
  for(const key of Object.keys(remote))assert.equal(env[key],undefined);
  assert.equal(env.DATA_DIR,input.DATA_DIR);assert.equal(env.MINIOPOLY_AVATAR_DEFAULT_DIR,input.MINIOPOLY_AVATAR_DEFAULT_DIR);
  assert.equal(localEnvironment({PORT:'3210'}).PORT,'3210');assert.throws(()=>localEnvironment({PORT:'invalid'}),/Set PORT/);
});

test('actual local launcher serves HTTP and creates rooms even with an inherited HTTPS-only environment',async t=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mini-local-start-')),port=await freePort();
  const child=spawn(process.execPath,['scripts/start-local.js'],{cwd:root,env:{...process.env,...remote,HOST:'127.0.0.1',PORT:String(port),DATA_DIR:dir},stdio:'ignore'});
  t.after(async()=>{await stop(child);fs.rmSync(dir,{recursive:true,force:true});});
  const network=await (await ready('http://127.0.0.1:'+port+'/api/network')).json();assert.equal(network.remote,false);assert.equal(network.publicUrl,null);
  assert.equal((await fetch('http://127.0.0.1:'+port)).status,200);
  const response=await fetch('http://127.0.0.1:'+port+'/api/create',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Local host'})});assert.equal(response.status,200);const room=await response.json();assert.equal(room.state.players[0].name,'Local host');assert.ok(fs.existsSync(path.join(dir,'rooms.json')));
});

test('an occupied online backend is reported and left running; localhost never bypasses its HTTPS guard',async t=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mini-local-busy-')),port=await freePort(),base='http://127.0.0.1:'+port;
  const online=spawn(process.execPath,['server.js'],{cwd:root,env:{...process.env,...remote,HOST:'127.0.0.1',PORT:String(port),DATA_DIR:dir},stdio:'ignore'});
  let local;t.after(async()=>{if(local)await stop(local);await stop(online);fs.rmSync(dir,{recursive:true,force:true});});
  await ready(base+'/__host/health',{headers:{'x-miniopoly-host-token':remote.MINIOPOLY_HOST_TOKEN}});assert.equal((await fetch(base)).status,421);
  local=spawn(process.execPath,['scripts/start-local.js'],{cwd:root,env:{...process.env,PORT:String(port),DATA_DIR:dir},stdio:['ignore','pipe','pipe']});let output='';local.stdout.on('data',chunk=>output+=chunk);local.stderr.on('data',chunk=>output+=chunk);
  const code=await new Promise(resolve=>local.once('exit',resolve));assert.equal(code,1);assert.match(output,/already in use/);assert.match(output,/Stop hosting/);assert.doesNotMatch(output,/Host opens:/);
  assert.equal(online.exitCode,null);assert.equal((await fetch(base)).status,421);assert.equal((await ready(base+'/__host/health',{headers:{'x-miniopoly-host-token':remote.MINIOPOLY_HOST_TOKEN}})).status,200);
});
