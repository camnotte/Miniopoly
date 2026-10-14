'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),net=require('node:net'),{spawn}=require('node:child_process');
const folder=path.join(__dirname,'..');
async function freePort(){const srv=net.createServer();await new Promise(ok=>srv.listen(0,'127.0.0.1',ok));const n=srv.address().port;await new Promise(ok=>srv.close(ok));return n;}
async function start(port,data){const child=spawn(process.execPath,['server.js'],{cwd:folder,env:{...process.env,PORT:String(port),HOST:'127.0.0.1',DATA_DIR:data},stdio:'ignore'});const base=`http://127.0.0.1:${port}`;for(let i=0;i<80;i++){try{if((await fetch(base+'/api/network')).ok)return{base,child};}catch{}await new Promise(r=>setTimeout(r,40));}child.kill();throw Error('Server unavailable');}
async function stop(child){if(child.exitCode!=null)return;await new Promise(ok=>{child.once('exit',ok);child.kill();setTimeout(()=>child.kill('SIGKILL'),1700).unref();});}
async function post(base,route,data){const r=await fetch(base+'/api/'+route,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});return{status:r.status,body:await r.json()};}
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO0Sg6UAAAAASUVORK5CYII=','base64');
test('room photos/docs restricted to authenticated seats, persisted, no game state modification',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mini-attachment-')),port=await freePort();let svc=await start(port,dir);
 try{
  const host=(await post(svc.base,'create',{name:'Windows',capacity:2,rounds:20})).body;
  const guest=(await post(svc.base,'join',{code:host.code,name:'Mac'})).body;
  const file=await post(svc.base,'attachment',{code:guest.code,token:guest.token,name:'My board.png',data:png.toString('base64')});
  assert.equal(file.status,200,JSON.stringify(file));assert.equal(file.body.attachment.mime,'image/png');
  const state=(await post(svc.base,'resume',{code:host.code,token:host.token})).body.state;
  assert.equal(state.chat.length,1);assert.equal(state.chat[0].attachment.name,'My board.png');assert.equal(state.players[0].cash,1500);assert.equal(state.turn,0);
  const id=file.body.attachment.id;
  const good=await fetch(`${svc.base}/api/attachment/${id}?code=${host.code}&token=${encodeURIComponent(host.token)}`);
  assert.equal(good.status,200);assert.equal(good.headers.get('content-type'),'image/png');assert.deepEqual(Buffer.from(await good.arrayBuffer()),png);
  const fake=await fetch(`${svc.base}/api/attachment/${id}?code=${host.code}&token=incorrect`);assert.equal(fake.status,403);
  const other=(await post(svc.base,'create',{name:'Other',capacity:2,rounds:20})).body;
  const cross=await fetch(`${svc.base}/api/attachment/${id}?code=${other.code}&token=${encodeURIComponent(other.token)}`);assert.equal(cross.status,404);
  assert.equal((await post(svc.base,'attachment',{...host,name:'virus.html',data:Buffer.from('<script>bad</script>').toString('base64')})).status,400);
  assert.equal((await post(svc.base,'attachment',{...host,name:'fake.png',data:Buffer.from('not image').toString('base64')})).status,400);
  const pdf=await post(svc.base,'attachment',{...host,name:'rules.pdf',data:Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF\n').toString('base64')});assert.equal(pdf.status,200);
  const download=await fetch(`${svc.base}/api/attachment/${pdf.body.attachment.id}?code=${host.code}&token=${encodeURIComponent(host.token)}`);
  assert.equal(download.headers.get('content-disposition').startsWith('attachment;'),true);
  await stop(svc.child);svc=await start(port,dir);
  const restored=(await post(svc.base,'resume',{code:guest.code,token:guest.token})).body;
  assert.equal(restored.state.chat.length,2);
  const persisted=await fetch(`${svc.base}/api/attachment/${id}?code=${host.code}&token=${encodeURIComponent(host.token)}`);
  assert.equal(persisted.status,200);
 }finally{await stop(svc.child);fs.rmSync(dir,{recursive:true,force:true});}
});
test('worlds shortcut and leaderboard capsule + file chat controls included',()=>{
 const index=fs.readFileSync(path.join(folder,'public/index.html'),'utf8');
 const app=fs.readFileSync(path.join(folder,'public/app.js'),'utf8');
 const board=fs.readFileSync(path.join(folder,'public/board-v5-42.html'),'utf8');
 assert.match(index,/id="headerWorldsButton"/);
 assert.match(app,/MINI_OPEN_WORLDS/);
 assert.match(board,/data\.type==='MINI_OPEN_WORLDS'/);
 assert.match(board,/openWorldExplorer\(\)/);
 assert.match(board,/col-worth::before\{content:'NET WORTH'/);
 assert.match(board,/grid-column:4!important;grid-row:1!important/);
 for(const key of ['miniChatFile','MINI_CHAT_ATTACHMENT','MINI_CHAT_ATTACH_SUCCESS','mini-chat-image','mini-chat-file-link'])assert.ok(board.includes(key),key);
});
