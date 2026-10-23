'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),net=require('node:net');
const {Notice,message,KEY}=require('../public/room-sync'),{createController}=require('../scripts/host-online');
function fixture(){const items=new Map(),fields=new Map(),storage={getItem:k=>items.get(k)||null,setItem:(k,v)=>items.set(k,v),removeItem:k=>items.delete(k)},node={hidden:true,dataset:{},querySelector:s=>{if(!fields.has(s))fields.set(s,{textContent:'',hidden:false});return fields.get(s);}};return {node,storage,fields};}
test('confirmed reset is persistent, names the room and offers the correct host/guest action',()=>{
 const f=fixture();let action;const n=new Notice(f.node,{storage:f.storage,onAction:v=>action=v});n.show('reset',{code:'RBZ53B'});assert.equal(f.node.hidden,false);assert.equal(f.fields.get('[data-session-title]').textContent,'The host reset the game');assert.match(f.fields.get('[data-session-body]').textContent,/RBZ53B/);assert.equal(f.fields.get('[data-session-action]').textContent,'Join a new game');n.show('lost');n.connected();assert.equal(n.kind,'reset');assert.equal(f.node.hidden,false);
 const restored=new Notice(f.node,{storage:f.storage});assert.equal(restored.kind,'reset');assert.equal(restored.value.code,'RBZ53B');f.fields.get('[data-session-dismiss]').onclick();assert.equal(f.storage.getItem(KEY),null);
 const h=fixture(),hn=new Notice(h.node,{storage:h.storage,onAction:v=>action=v});hn.show('reset',{code:'RBZ53B',host:true});h.fields.get('[data-session-action]').onclick();assert.equal(action.host,true);assert.equal(action.action,'Create a new game');assert.equal(hn.value.title,'You reset the game');
});
test('explicit stopped notice survives generic failures; recovered connection clears it without losing a seat',()=>{
 const f=fixture(),n=new Notice(f.node,{storage:f.storage});n.show('stopped');assert.equal(n.kind,'stopped');assert.match(n.value.body,/seat and saved game are kept/);n.show('lost');assert.equal(n.kind,'stopped');assert.equal(f.fields.get('[data-session-dismiss]').hidden,true);assert.equal(f.storage.getItem(KEY),null);n.connected();assert.equal(f.node.hidden,true);assert.equal(n.kind,'');
 n.show('lost');assert.match(n.value.body,/does not mean the game was reset/);n.connected();assert.equal(f.node.hidden,true);
 const update=message('update');assert.match(update.body,/game has not been reset/);assert.match(update.body,/Start-Miniopoly/);
});
const port=()=>new Promise(resolve=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const n=s.address().port;s.close(()=>resolve(n));});});
test('controller announces stopping over live streams before terminating the server and preserves saved seats on restart',async t=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mini-stop-notice-')),gamePort=await port(),controller=createController({stateDir:dir+'/host',defaultMode:'local',gamePort,env:{DATA_DIR:dir+'/saves'}}),base='http://127.0.0.1:'+gamePort;
 t.after(async()=>{await controller.stop();fs.rmSync(dir,{recursive:true,force:true});});await controller.command('start',{mode:'local',autoOpen:false});
 const api=async(route,body)=>{const r=await fetch(base+'/api/'+route,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});assert.equal(r.status,200);return r.json();};
 const host=await api('create',{name:'Host'}),guest=await api('join',{code:host.code,name:'MacBook'});await api('action',{code:host.code,token:host.token,kind:'start'});const responses=[];
 for(const seat of [host,guest]){const res=await fetch(base+'/api/events?code='+seat.code+'&token='+seat.token);responses.push(res.text());}
 // Clients cannot fake the private controller message with an HTTP request.
 assert.equal((await fetch(base+'/__host/prepare-stop',{method:'POST',body:'{}'})).status,404);
 await controller.command('stop');for(const value of await Promise.all(responses)){assert.match(value,/event: host-stopping/);assert.match(value,/host-stopped/);assert.doesNotMatch(value,/room-closed/);}
 const saved=JSON.parse(fs.readFileSync(dir+'/saves/rooms.json'));assert.equal(saved.rooms[0].players.length,2);assert.deepEqual(saved.closedRooms,[]);
 await controller.command('start',{mode:'local',autoOpen:false});const resumed=await api('resume',{code:host.code,token:guest.token});assert.equal(resumed.state.youId,guest.state.youId);assert.equal(resumed.state.hostingStopping,false);assert.equal(resumed.state.stage,'playing');
});
