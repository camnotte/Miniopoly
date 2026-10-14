'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),net=require('node:net'),{spawn}=require('node:child_process');
const folder=path.join(__dirname,'..');
async function port(){const server=net.createServer();return new Promise((ok,err)=>{server.on('error',err);server.listen(0,'127.0.0.1',()=>{const n=server.address().port;server.close(()=>ok(n));});});}
async function serverStart(portNumber,data){const child=spawn(process.execPath,['server.js'],{cwd:folder,env:{...process.env,PORT:String(portNumber),HOST:'127.0.0.1',DATA_DIR:data},stdio:'ignore'});const base='http://127.0.0.1:'+portNumber;for(let i=0;i<100;i++){if(child.exitCode!==null)throw Error('Server exited');try{if((await fetch(base+'/api/network')).ok)return{base,child};}catch{}await new Promise(r=>setTimeout(r,35));}child.kill();throw Error('Server unavailable');}
async function stop(child){if(!child||child.exitCode!==null)return;await new Promise(ok=>{child.once('exit',ok);child.kill();setTimeout(()=>child.kill('SIGKILL'),1800).unref();});}
async function api(base,route,data){const response=await fetch(base+'/api/'+route,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});return{status:response.status,body:await response.json()};}
async function eventually(check,limit=3000){const start=Date.now();while(Date.now()-start<limit){if(check())return;await new Promise(r=>setTimeout(r,30));}throw Error('Timed out waiting for chat event');}
function listen(base,creds){const abort=new AbortController(),states=[];const started=(async()=>{try{const r=await fetch(base+'/api/events?code='+creds.code+'&token='+encodeURIComponent(creds.token),{signal:abort.signal});assert.equal(r.status,200);const reader=r.body.getReader(),decoder=new TextDecoder();let buffer='';while(true){const {done,value}=await reader.read();if(done)break;buffer+=decoder.decode(value,{stream:true});const batches=buffer.split('\n\n');buffer=batches.pop();for(const item of batches){const found=item.match(/^data: (.*)$/m);if(item.startsWith('event: state\n')&&found)states.push(JSON.parse(found[1]));}}}catch(e){if(e.name!=='AbortError')throw e;}})();return{abort,started,states};}
test('private chat reaches two seats, rejects outsiders and spam, survives host restart',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mini-chat-'));const n=await port();let svc=await serverStart(n,dir);let a,b;
 try{
  const h=(await api(svc.base,'create',{name:'Windows',capacity:2,rounds:20})).body;
  const m=(await api(svc.base,'join',{code:h.code,name:'MacBook'})).body;
  a=listen(svc.base,h);b=listen(svc.base,m);
  await eventually(()=>a.states.length>0&&b.states.length>0);
  const text='Hello Mac! <script>alert(1)</script> & friends';
  const sent=await api(svc.base,'chat',{code:h.code,token:h.token,text});
  assert.equal(sent.status,200);
  await eventually(()=>a.states.some(x=>x.chat?.at(-1)?.text===text)&&b.states.some(x=>x.chat?.at(-1)?.text===text));
  const snapshot=a.states.at(-1);assert.equal(snapshot.chat[0].name,'Windows');assert.equal(snapshot.chat[0].text,text);
  assert.equal(snapshot.players[0].cash,1500);assert.equal(snapshot.turn,0);
  const forged=await api(svc.base,'chat',{code:h.code,token:'not-your-seat',text:'Intruder'});assert.equal(forged.status,403);
  const blank=await api(svc.base,'chat',{code:m.code,token:m.token,text:'   \n'});assert.equal(blank.status,400);
  const long=await api(svc.base,'chat',{code:m.code,token:m.token,text:'a'.repeat(281)});assert.equal(long.status,400);
  const good=await api(svc.base,'chat',{code:m.code,token:m.token,text:'Hi Windows!'});assert.equal(good.status,200);
  const tooFast=await api(svc.base,'chat',{code:m.code,token:m.token,text:'Spam'});assert.equal(tooFast.status,429);
  await eventually(()=>a.states.some(x=>x.chat?.length===2)&&b.states.some(x=>x.chat?.length===2));
  a.abort.abort();b.abort.abort();await stop(svc.child);svc=await serverStart(n,dir);
  const resumed=await api(svc.base,'resume',{code:h.code,token:m.token});assert.equal(resumed.status,200);
  assert.equal(resumed.body.state.chat.length,2);assert.equal(resumed.body.state.chat[1].name,'MacBook');
  const restarted=await api(svc.base,'action',{code:h.code,token:h.token,kind:'start'});assert.equal(restarted.status,200);
  assert.equal(restarted.body.state.chat.length,2,'chat stays across start game');
  const reset=await api(svc.base,'action',{code:h.code,token:h.token,kind:'reset'});assert.equal(reset.status,200);
  assert.equal(reset.body.state.code,h.code);assert.equal(reset.body.state.chat.length,2,'chat remains in the same room between test matches');
 }finally{a?.abort.abort();b?.abort.abort();await stop(svc.child);fs.rmSync(dir,{recursive:true,force:true});}
});
test('chat UI is embedded in responsive board and uses safe text rendering',()=>{
 const board=fs.readFileSync(path.join(folder,'public/board-v5-42.html'),'utf8');
 const app=fs.readFileSync(path.join(folder,'public/app.js'),'utf8');
 const page=fs.readFileSync(path.join(folder,'public/index.html'),'utf8');
 for(const id of ['miniChatTab','miniChatMessages','miniChatForm','miniChatInput','miniLiveInfo'])assert.ok(board.includes('id="'+id+'"'),id);
 assert.match(board,/mini-chat-message/);assert.match(board,/body\.textContent=item\.text/);assert.match(board,/MINI_CHAT_SEND/);
 assert.match(board,/MINI_CHAT_STATE/);assert.match(board,/MINI_CHAT_TAB/);
 assert.match(board,/MINI_OPEN_CHAT/);assert.match(app,/api\('chat'/);assert.match(page,/id="headerChatButton"/);
 assert.match(board,/sidebar\[data-mini-aux="chat"\]/);assert.ok(board.includes('WAITING FOR '+"'"));
});
