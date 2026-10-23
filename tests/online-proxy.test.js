'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),https=require('node:https'),tls=require('node:tls'),net=require('node:net');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {spawn,execFileSync}=require('node:child_process');
const {hashPassword}=require('../lib/remote-access'),{caddyConfig}=require('../lib/online-host-config');
const exe=process.env.MINIOPOLY_TEST_CADDY,ROOT=path.join(__dirname,'..'),IP='8.8.8.8',PASSWORD='test private table password';
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const port=()=>new Promise(r=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>r(p));});});
async function stop(p){if(!p||p.exitCode!==null||p.signalCode!==null)return;await new Promise(r=>{p.once('exit',r);p.kill();});}
function certificates(dir){
 const run=args=>execFileSync('openssl',args,{cwd:dir,stdio:'ignore'});
 run(['req','-x509','-newkey','rsa:2048','-nodes','-keyout','ca.key','-out','ca.pem','-subj','/CN=Miniopoly local test CA','-days','2','-addext','basicConstraints=critical,CA:TRUE']);
 run(['req','-newkey','rsa:2048','-nodes','-keyout','server.key','-out','server.csr','-subj','/CN=Miniopoly proxy test']);
 fs.writeFileSync(path.join(dir,'extensions'),'subjectAltName=IP:8.8.8.8,IP:127.0.0.1\nbasicConstraints=CA:FALSE\nextendedKeyUsage=serverAuth\n');
 run(['x509','-req','-in','server.csr','-CA','ca.pem','-CAkey','ca.key','-CAcreateserial','-out','server.pem','-days','2','-extfile','extensions']);
}
test('real HTTPS proxy preserves two-player SSE, protected artwork and private local health',{skip:!exe,timeout:30000},async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'miniopoly-https-'));let game,proxy,streamA,streamB;const logs=[];
 try{
  certificates(dir);const [gamePort,httpsPort,httpPort]=await Promise.all([port(),port(),port()]);const ca=fs.readFileSync(path.join(dir,'ca.pem'));
  const config=caddyConfig({ip:IP,storage:path.join(dir,'storage'),gamePort,httpsPort,httpPort});
  // Fixture-only certificate: never change production ACME configuration or disable TLS checks.
  config.apps.tls={certificates:{load_files:[{certificate:path.join(dir,'server.pem'),key:path.join(dir,'server.key')} ]}};
  config.apps.http.servers.miniopoly.automatic_https={disable:true};
  const file=path.join(dir,'caddy-test.json');fs.writeFileSync(file,JSON.stringify(config));
  game=spawn(process.execPath,['server.js'],{cwd:ROOT,env:{...process.env,HOST:'127.0.0.1',PORT:String(gamePort),DATA_DIR:path.join(dir,'saves'),MINIOPOLY_PUBLIC_URL:'https://'+IP,MINIOPOLY_ACCESS_HASH:await hashPassword(PASSWORD),MINIOPOLY_HOST_TOKEN:'local-fixture-token',NODE_ENV:'test',TEST_ROLL_SEQUENCE:'7'},stdio:['ignore','ignore','pipe']});game.stderr.on('data',b=>logs.push(b.toString()));
  proxy=spawn(exe,['run','--config',file],{stdio:['ignore','ignore','pipe']});proxy.stderr.on('data',b=>logs.push(b.toString()));
  const options={host:'127.0.0.1',port:httpsPort,servername:'',ca,checkServerIdentity:(_h,cert)=>tls.checkServerIdentity(IP,cert)};
  const request=(route='/',method='GET',data=null,cookie=null)=>new Promise((resolve,reject)=>{const req=https.request({...options,path:route,method,headers:{Host:IP,Origin:'https://'+IP,...(cookie?{Cookie:cookie}:{}),...(data?{'Content-Type':route==='/remote/login'?'application/x-www-form-urlencoded':'application/json'}:{})}},res=>{let body='';res.on('data',b=>body+=b);res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,body}));});req.on('error',reject);if(data)req.write(data);req.end();});
  let ready=false;for(let i=0;i<100;i++){try{const r=await request();if(r.status===200){ready=true;break;}}catch{}await pause(50);}assert.ok(ready,logs.join('\n'));
  assert.equal((await request('/api/network')).status,401);assert.equal((await request('/board-v5-42.html')).status,303);
  assert.equal((await request('/__host/health','GET')).status,404);
  const login=async()=>{const r=await request('/remote/login','POST',new URLSearchParams({password:PASSWORD}).toString());assert.equal(r.status,303);return r.headers['set-cookie'][0].split(';')[0];};
  const a=await login(),b=await login();assert.notEqual(a,b);
  assert.match((await request('/central','GET',null,a)).body,/Game Launcher/);
  for(const route of ['/game-central.js','/game-central-data.js','/seat-library.js','/art/central/world-0.jpg'])assert.equal((await request(route,'GET',null,a)).status,200,route);
  assert.equal((await request('/api/central','POST',JSON.stringify({seats:[]}))).status,401);
  const api=async(route,body,cookie)=>{const r=await request('/api/'+route,'POST',JSON.stringify(body),cookie);assert.equal(r.status,200,r.body);return JSON.parse(r.body);};
  const host=await api('create',{name:'Windows host',capacity:2,rounds:0},a),join=await api('join',{code:host.code,name:'Remote friend'},b);
  assert.equal((await request('/api/pieces','POST',JSON.stringify({code:host.code}))).status,401);
  const pieceAvailability=await api('pieces',{code:host.code},b);assert.deepEqual(pieceAvailability.players,[{name:'Windows host',piece:'🚗'},{name:'Remote friend',piece:'🐱'}]);assert.deepEqual(Object.keys(pieceAvailability).sort(),['capacity','code','players']);
  const library=await api('central',{seats:[{code:host.code,token:host.token}]},a);assert.equal(library.rooms[0].viewerName,'Windows host');assert.equal(library.connection.remote,true);assert.doesNotMatch(JSON.stringify(library),new RegExp(host.token+'|'+join.token));
  const messagesA=[],messagesB=[];
  function stream(seat,cookie,messages){const req=https.get({...options,path:'/api/events?code='+seat.code+'&token='+seat.token,headers:{Host:IP,Cookie:cookie}},res=>{assert.equal(res.statusCode,200);assert.equal(res.headers['content-type'],'text/event-stream; charset=utf-8');assert.equal(res.headers['content-encoding'],undefined);let pending='';res.on('data',chunk=>{pending+=chunk;const frames=pending.split('\n\n');pending=frames.pop();for(const frame of frames){const match=frame.match(/^data: (.*)$/m);if(match)messages.push(JSON.parse(match[1]));}});});req.on('error',()=>{});return req;}
  streamA=stream(host,a,messagesA);streamB=stream(join,b,messagesB);
  async function until(fn){for(let i=0;i<100;i++){if(fn())return;await pause(25);}assert.fail('Live state was not flushed through HTTPS.');}
  await until(()=>messagesA.length&&messagesB.length);
  await api('action',{code:host.code,token:host.token,kind:'start'},a);
  await until(()=>messagesA.at(-1).stage==='playing'&&messagesB.at(-1).stage==='playing');
  const roll=await api('action',{code:host.code,token:host.token,kind:'roll'},a);assert.equal(roll.state.lastRoll.value,7);
  await until(()=>messagesA.at(-1).lastRoll?.value===7&&messagesB.at(-1).lastRoll?.value===7);
  for(const route of ['/board-v5-42.html','/portfolio-preview','/online-play.js'])assert.equal((await request(route,'GET',null,a)).status,200,route);
  const network=JSON.parse((await request('/api/network','GET',null,a)).body);assert.equal(network.remote,true);assert.deepEqual(network.urls,['https://'+IP]);
  assert.equal((await request('/remote/logout','POST','',b)).status,303);assert.equal((await request('/api/network','GET',null,b)).status,401);
  // Real launcher probe accepts this explicitly trusted CA, but rejects an unknown CA.
  const probe=execFileSync(process.execPath,['-e',"require('./scripts/host-online').trustedTLS('"+IP+"',"+httpsPort+").then(ok=>process.exit(ok?0:1))"],{cwd:ROOT,env:{...process.env,NODE_EXTRA_CA_CERTS:path.join(dir,'ca.pem')}});assert.equal(probe.length,0);
  const untrusted=await require('../scripts/host-online').trustedTLS(IP,httpsPort);assert.equal(untrusted,false);
 }finally{streamA?.destroy();streamB?.destroy();await stop(proxy);await stop(game);fs.rmSync(dir,{recursive:true,force:true});}
});
