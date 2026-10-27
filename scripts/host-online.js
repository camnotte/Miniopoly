'use strict';
// Local owner console. Public traffic reaches only Caddy -> password-protected game.
const http=require('node:http'),https=require('node:https'),tls=require('node:tls');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),net=require('node:net'),crypto=require('node:crypto');
const {spawn}=require('node:child_process');
const {hashPassword,validHash}=require('../lib/remote-access');
const {publicIPv4,caddyConfig,redact,firewallScript,localFirewallScript}=require('../lib/online-host-config');
const central=require('../lib/game-central');
const launcher=require('../lib/game-launcher');
const ROOT=path.resolve(__dirname,'..');
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function localAddresses(){const priority=ip=>ip.startsWith('192.168.')?0:ip.startsWith('10.')?1:2;return Object.values(os.networkInterfaces()).flat().filter(a=>a&&a.family==='IPv4'&&!a.internal).map(a=>a.address).sort((a,b)=>priority(a)-priority(b));}
function freePort(port){return new Promise((resolve,reject)=>{const s=net.createServer();s.once('error',()=>reject(Error('TCP port '+port+' is already in use. Stop the old game server or other web server first.')));s.listen(port,'0.0.0.0',()=>s.close(resolve));});}
function getPublicIP(){return new Promise((resolve,reject)=>{const req=https.get('https://api4.ipify.org',{timeout:8000},res=>{let body='';res.on('data',chunk=>{body+=chunk;if(body.length>100)req.destroy(Error('Unexpected address response.'));});res.on('end',()=>{try{if(res.statusCode!==200)throw Error('Could not check the public address.');resolve(publicIPv4(body));}catch(e){reject(e);}});});req.on('timeout',()=>req.destroy(Error('The public address check timed out.')));req.on('error',reject);});}
function gameReady(port,token,local=false){return new Promise(resolve=>{const req=http.get({host:'127.0.0.1',port,path:local?'/api/network':'/__host/health',headers:{'x-miniopoly-host-token':token},timeout:1500},res=>{res.resume();resolve(res.statusCode===200);});req.on('timeout',()=>req.destroy());req.on('error',()=>resolve(false));});}
function gameSettings(value={}){
  const worldShift=value.worldShift==='gravity'?'gravity':'individual',startingCash=[1000,1500,2000].includes(Number(value.startingCash))?Number(value.startingCash):1500;
  const result={hostName:String(value.hostName||'Host').trim().slice(0,18)||'Host',capacity:[2,3,4].includes(Number(value.capacity))?Number(value.capacity):4,rounds:[0,10,12,15,20,30,50].includes(Number(value.rounds))?Number(value.rounds):0,worldShift,startingCash,ranked:Boolean(value.ranked)&&[10,15,20].includes(Number(value.rounds))&&startingCash===1500};
  if(value.gameMode!==undefined||value.collapseRentBoost!==undefined){result.gameMode=['express','countdown'].includes(value.gameMode)?value.gameMode:'classic';result.collapseRentBoost=!!value.collapseRentBoost;}
  if(['express','countdown'].includes(result.gameMode)){if(![10,15,20].includes(result.rounds))result.rounds=10;result.ranked=false;}
  return result;
}
function trustedTLS(ip,port=443){return new Promise(resolve=>{
  // Connect locally, but validate the public IP's identity and the complete CA chain.
  const req=https.get({host:'127.0.0.1',port,path:'/',agent:false,servername:'',headers:{Host:ip},checkServerIdentity:(_host,cert)=>tls.checkServerIdentity(ip,cert),timeout:2500},res=>{res.resume();resolve(res.statusCode===200);});
  req.on('timeout',()=>req.destroy());req.on('error',()=>resolve(false));
});}
function verifyCaddy(exe,platform=process.platform){
  const manifest=require('../hosting/caddy-manifest.json'),entry=manifest.files[platform==='win32'?'windows':'linux'];
  if(!fs.existsSync(exe))throw Error('The bundled HTTPS tool is missing. Extract the complete Windows hosting ZIP, including hosting/tools.');
  if(crypto.createHash('sha512').update(fs.readFileSync(exe)).digest('hex')!==entry.sha512)throw Error('HTTPS tool verification failed. Extract a fresh copy of the original hosting ZIP.');
}
function openBrowser(url){if(process.platform==='win32')spawn('rundll32.exe',['url.dll,FileProtocolHandler',url],{stdio:'ignore',windowsHide:true}).unref();}
async function terminate(child){if(!child||child.exitCode!==null||child.signalCode!==null)return;await new Promise(resolve=>{const timer=setTimeout(()=>{child.kill('SIGKILL');resolve();},3000);child.once('exit',()=>{clearTimeout(timer);resolve();});child.kill('SIGTERM');});}
async function notifyGameStop(child){
  if(!child?.connected||!child.send||child.exitCode!==null)return;
  await new Promise(resolve=>{
    const id=crypto.randomUUID();let finished=false;
    const finish=()=>{if(finished)return;finished=true;clearTimeout(timer);child.off('message',onMessage);resolve();};
    const onMessage=value=>{if(value?.type==='miniopoly-stopping-ready'&&value.id===id)finish();};
    const timer=setTimeout(finish,500);child.on('message',onMessage);
    try{child.send({type:'miniopoly-prepare-stop',id},error=>{if(error)finish();});}catch{finish();}
  });
  // Let the already-written live notice pass through the HTTPS proxy before it closes.
  await sleep(100);
}
function createController(options={}){
  const stateDir=options.stateDir||path.join(os.homedir(),'.miniopoly-wifi','hosting');
  const exe=options.exe||path.join(ROOT,'hosting','tools',process.platform==='win32'?'caddy.exe':'caddy');
  const launch=options.spawn||spawn,probe=options.probe||trustedTLS,checkPort=options.checkPort||freePort;
  const gamePort=options.gamePort||3000,httpsPort=options.httpsPort||443,httpPort=options.httpPort||80;
  let config={},phase='stopped',error='',ipChanged='',game=null,proxy=null,monitor=null,probing=false,active=false;
  const logs=[];let busy=false,lastIPCheck=Date.now(),closing=false,inFlight=null,shutdownPromise=null;
  const configFile=path.join(stateDir,'config.json');
  const avatarDirectory=options.env?.DATA_DIR||process.env.DATA_DIR||path.join(stateDir,'avatar');
  const avatarDefault=require('../lib/avatar-default').avatarDefaults(avatarDirectory);
  try{const saved=JSON.parse(fs.readFileSync(configFile,'utf8'));if(saved&&typeof saved==='object'&&!Array.isArray(saved))config=saved;if(!validHash(config.passwordHash))delete config.passwordHash;}catch{}
  config.mode=options.initialMode||(['local','online'].includes(config.mode)?config.mode:options.defaultMode||'online');
  config.gameSettings=gameSettings(config.gameSettings);
  function log(message){logs.push(redact(message));while(logs.length>25)logs.shift();}
  function status(){const addresses=localAddresses(),localUrls=addresses.map(ip=>'http://'+ip+':'+gamePort),url=config.mode==='local'?'http://localhost:'+gamePort:config.ip?'https://'+config.ip:'';return {phase,error,mode:config.mode,avatarProfileKey:avatarDefault.key,gameSettings:config.gameSettings,autoOpen:config.autoOpen!==false,routerReady:!!config.routerReady,ip:config.ip||'',url,launchUrl:url?url+'/?hostSetup='+encodeURIComponent(JSON.stringify(config.gameSettings)):'',inviteUrl:config.mode==='local'?(localUrls[0]||url):url,localUrls,passwordConfigured:validHash(config.passwordHash),ipChanged,localAddresses:addresses,logs:[...logs]};}
  function saveConfig(){fs.mkdirSync(stateDir,{recursive:true,mode:0o700});fs.writeFileSync(configFile,JSON.stringify(config),{mode:0o600});}
  function settings(body){
    if(active)throw Error('Stop hosting before changing setup settings.');
    if(!['local','online'].includes(body.mode))throw Error('Choose Local Multiplayer or Online Players.');
    const ip=body.ip?publicIPv4(body.ip):config.ip;
    config={...config,mode:body.mode,ip,gameSettings:gameSettings(body.gameSettings),autoOpen:body.autoOpen===undefined?config.autoOpen!==false:body.autoOpen!==false,routerReady:body.routerReady===true};
    saveConfig();return status();
  }
  async function stop(){active=false;clearInterval(monitor);monitor=null;const p=proxy,g=game;proxy=null;game=null;await notifyGameStop(g);await terminate(p);await terminate(g);phase='stopped';ipChanged='';}
  function watch(child,name){child.on('error',e=>{if(!active)return;error=name+': '+e.message;log(error);phase='error';void stopAfterFailure();});child.on('exit',code=>{if(!active)return;error=name+' stopped (exit '+code+').';log(error);void stopAfterFailure();});
    child.stderr?.on('data',chunk=>log(chunk.toString()));
  }
  async function stopAfterFailure(){const reason=error;await stop();phase='error';error=reason;}
  async function tick(){if(!active||probing)return;if(config.mode==='local'){phase='ready';return;}probing=true;try{const ok=await probe(config.ip,httpsPort);if(active)phase=ipChanged?'address-changed':ok?'ready':'certificate';if(active&&Date.now()-lastIPCheck>=10*60*1000){lastIPCheck=Date.now();await checkIP().catch(()=>log('Public IP check unavailable; use Check my public IP if the link stops working.'));}}finally{probing=false;}}
  async function start(body){
    if(active)throw Error('Stop hosting before changing the address or password.');
    const mode=body.mode||config.mode,local=mode==='local';if(!['local','online'].includes(mode))throw Error('Choose Local Multiplayer or Online Players.');
    const ip=local?config.ip:publicIPv4(body.ip);if(!local&&body.routerReady!==true)throw Error('Confirm that TCP ports 80 and 443 forward to this Windows PC.');
    let passwordHash=config.passwordHash;
    if(!local&&body.password)passwordHash=await hashPassword(body.password);
    if(!local&&!validHash(passwordHash))throw Error('Choose a game password of at least 12 characters.');
    if(!local)verifyCaddy(exe,options.platform);
    for(const port of local?[gamePort]:[gamePort,httpPort,httpsPort])await checkPort(port);
    config={...config,mode,ip,passwordHash,autoOpen:body.autoOpen===undefined?config.autoOpen!==false:body.autoOpen!==false,routerReady:local?!!config.routerReady:body.routerReady===true,gameSettings:gameSettings(body.gameSettings||config.gameSettings)};saveConfig();
    if(!local)fs.writeFileSync(path.join(stateDir,'caddy.json'),JSON.stringify(caddyConfig({ip,storage:path.join(stateDir,'certificates'),gamePort,httpsPort,httpPort}),null,2),{mode:0o600});
    const hostToken=crypto.randomBytes(32).toString('hex');phase='starting';error='';ipChanged='';logs.length=0;active=true;
    try{
      const env={...process.env,...options.env,MINIOPOLY_AVATAR_DEFAULT_DIR:avatarDirectory,HOST:local?'0.0.0.0':'127.0.0.1',PORT:String(gamePort)};
      if(local){delete env.MINIOPOLY_PUBLIC_URL;delete env.MINIOPOLY_ACCESS_HASH;delete env.MINIOPOLY_HOST_TOKEN;}
      else Object.assign(env,{MINIOPOLY_PUBLIC_URL:'https://'+ip,MINIOPOLY_ACCESS_HASH:passwordHash,MINIOPOLY_HOST_TOKEN:hostToken});
      game=launch(process.execPath,[path.join(ROOT,'server.js')],{cwd:ROOT,env,stdio:['ignore','ignore','pipe','ipc'],windowsHide:true});watch(game,'Game server');
      let ready=false;for(let i=0;i<40&&active;i++){if(await gameReady(gamePort,hostToken,local)){ready=true;break;}await sleep(150);}
      if(!ready||!active)throw Error(error||'The private game server did not become ready.');
      if(local){phase='ready';return status();}
      proxy=launch(exe,['run','--config',path.join(stateDir,'caddy.json')],{cwd:ROOT,stdio:['ignore','ignore','pipe'],windowsHide:true});watch(proxy,'HTTPS server');
      phase='certificate';monitor=setInterval(()=>{void tick().catch(e=>log(e.message));},3000);monitor.unref();
      return status();
    }catch(e){error=e.message;await stopAfterFailure();throw e;}
  }
  async function checkIP(){const ip=await (options.getPublicIP||getPublicIP)();if(active&&ip!==config.ip){ipChanged=ip;phase='address-changed';}return {ip};}
  async function firewall(body={}){if(process.platform!=='win32')throw Error('The firewall helper runs on Windows only.');const local=(body.mode||config.mode)==='local';if(!local)verifyCaddy(exe);fs.mkdirSync(stateDir,{recursive:true,mode:0o700});
    const file=path.join(stateDir,'allow-firewall.ps1');fs.writeFileSync(file,local?localFirewallScript(process.execPath,gamePort):firewallScript(exe));
    // Encode arguments as PowerShell literals rather than interpolating shell commands.
    const quoted="'"+file.replaceAll("'","''")+"'";
    const elevation="$f="+quoted+"; $p=Start-Process powershell.exe -Verb RunAs -Wait -PassThru -ArgumentList ('-NoProfile -ExecutionPolicy Bypass -File '+[char]34+$f+[char]34); exit $p.ExitCode";
    await new Promise((resolve,reject)=>{const p=spawn('powershell.exe',['-NoProfile','-EncodedCommand',Buffer.from(elevation,'utf16le').toString('base64')],{windowsHide:true,stdio:'ignore'});p.once('error',reject);p.once('exit',code=>code===0?resolve():reject(Error('The firewall change was not completed. Accept the Windows administrator prompt or add the documented rule manually.')));});return {ok:true};
  }
  function command(action,body={}){
    if(closing)return Promise.reject(Error('Game Launcher is exiting.'));
    if(busy)return Promise.reject(Error('A hosting change is already running.'));
    busy=true;
    inFlight=(async()=>{try{if(action==='start')return await start(body);if(action==='stop'){await stop();return status();}if(action==='settings')return settings(body);if(action==='check-ip')return await checkIP();if(action==='firewall')return await firewall(body);throw Error('Unknown hosting action.');}finally{busy=false;}})();
    return inFlight;
  }
  function shutdown(){
    if(!shutdownPromise){closing=true;shutdownPromise=(async()=>{await inFlight?.catch(()=>{});await stop();})();}
    return shutdownPromise;
  }
  return {status,command,stop,tick,shutdown};
}
async function startConsole(options={}){
  const controller=options.controller||createController(options),token=crypto.randomBytes(32).toString('hex');
  let navigation={revision:0,target:'/#home'},closePromise=null;
  const equal=value=>typeof value==='string'&&Buffer.byteLength(value)===Buffer.byteLength(token)&&crypto.timingSafeEqual(Buffer.from(value),Buffer.from(token));
  const server=http.createServer(async(req,res)=>{
    res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');res.setHeader('X-Frame-Options','DENY');
    const origin='http://127.0.0.1:'+server.address().port;
    const send=(status,body,type='application/json')=>{res.writeHead(status,{'Content-Type':type});res.end(type==='application/json'?JSON.stringify(body):body);};
    if(req.headers.host!==new URL(origin).host)return send(403,{error:'Open the local owner console address.'});
    if(req.headers.origin&&req.headers.origin!==origin)return send(403,{error:'Cross-site requests are disabled.'});
    let pathname;try{pathname=new URL(req.url,origin).pathname;}catch{return send(400,{error:'Invalid request address.'});}
    if(req.method==='GET'&&['/','/host-ui.js','/fonts/nunito.ttf','/favicon.svg'].includes(pathname)){
      const item=pathname==='/'?['public/game-central.html','text/html; charset=utf-8']:pathname==='/host-ui.js'?['hosting/host-ui.js','application/javascript']:pathname==='/favicon.svg'?['public/art/icons/dice.svg','image/svg+xml']:['public/fonts/nunito.ttf','font/ttf'];
      res.setHeader('Content-Security-Policy',"default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; frame-ancestors 'none'; base-uri 'none'");
      return send(200,fs.readFileSync(path.join(ROOT,item[0])),item[1]);
    }
    const publicFiles=central.staticFiles();publicFiles['/setup']=['hosting/host-ui.html','text/html; charset=utf-8'];
    if(req.method==='GET'&&publicFiles[pathname]){
      const [file,type]=publicFiles[pathname];res.setHeader('Content-Security-Policy',"default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; frame-ancestors 'none'; base-uri 'none'");
      return send(200,fs.readFileSync(path.join(ROOT,file)),type);
    }
    if(!equal((req.headers.authorization||'').replace(/^Bearer /,'')))return send(401,{error:'Reopen the owner console from the hosting terminal.'});
    if(pathname==='/api/status'&&req.method==='GET')return send(200,controller.status());
    if(req.method==='POST'&&['/api/launcher/exit','/api/launcher/open'].includes(pathname)){
      if(req.headers.origin!==origin){req.resume();return send(403,{error:'Open the launcher on this PC.'});}
      try{
        if(pathname==='/api/launcher/exit'){
          req.resume();if(typeof options.onExit!=='function')return send(404,{error:'Use Exit Game in the Windows launcher.'});
          options.onExit();return send(200,{ok:true});
        }
        if(typeof options.onOpenGame!=='function'){req.resume();return send(404,{error:'The desktop launcher is unavailable.'});}
        let raw='';const timer=setTimeout(()=>req.destroy(),5000);timer.unref();try{for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>4096)throw Error('Request too large.');}}finally{clearTimeout(timer);}
        const status=controller.status(),address=new URL(JSON.parse(raw).url),expected=new URL(status.url);
        if(status.phase!=='ready'||address.origin!==expected.origin||address.pathname!=='/'||address.username||address.password)throw Error('Choose a game on this host.');
        options.onOpenGame(address.href);return send(200,{ok:true});
      }catch(error){return send(400,{error:error.message});}
    }
    if(pathname==='/api/launcher/navigation'&&req.method==='GET')return send(200,navigation);
    if(pathname==='/api/launcher/game'&&req.method==='POST'){
      req.resume();if(req.headers.origin!==origin)return send(403,{error:'Open the launcher on this PC.'});
      try{return send(200,{url:launcher.gameURL(controller.status(),origin)});}catch(error){return send(400,{error:error.message});}
    }
    if(pathname==='/api/launcher/navigate'&&req.method==='POST'){
      if(req.headers.origin!==origin){req.resume();return send(403,{error:'Open the launcher on this PC.'});}
      try{let raw='';const timer=setTimeout(()=>req.destroy(),5000);timer.unref();try{for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>256)throw Error('Request too large.');}}finally{clearTimeout(timer);}const body=JSON.parse(raw);navigation={revision:navigation.revision+1,target:launcher.navigation(body.target)};return send(200,navigation);}catch(error){return send(400,{error:error.message});}
    }
    if(pathname==='/api/central'&&req.method==='POST'){
      req.resume();
      if(req.headers.origin!==origin)return send(403,{error:'Open Game Central on this PC.'});
      const directory=options.env?.DATA_DIR||process.env.DATA_DIR||path.join(os.homedir(),'.miniopoly-wifi','saves');
      return send(200,{role:'owner',...central.readOwnerLibrary(directory),hosting:{...controller.status(),canExitLauncher:typeof options.onExit==='function'}});
    }
    if(req.method!=='POST'||!['/api/start','/api/stop','/api/settings','/api/check-ip','/api/firewall'].includes(pathname))return send(404,{error:'Not found.'});
    if(req.headers.origin!==origin)return send(403,{error:'Open this control in its local browser tab.'});
    try{let raw='';const timer=setTimeout(()=>req.destroy(),5000);timer.unref();try{for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>2048)throw Error('Request too large.');}}finally{clearTimeout(timer);}const body=JSON.parse(raw||'{}');send(200,await controller.command(pathname.slice(5),body));}catch(e){if(!res.destroyed)send(400,{error:e.message});}
  });
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  const url='http://127.0.0.1:'+server.address().port+'/#'+token;
  return {server,controller,url,close(){if(!closePromise)closePromise=(async()=>{await (controller.shutdown?controller.shutdown():controller.stop());server.closeAllConnections();await new Promise(resolve=>server.close(resolve));})();return closePromise;}};
}
if(require.main===module){if(Number(process.versions.node.split('.')[0])<18){console.error('Install Node.js LTS (version 18 or newer) before hosting.');process.exit(1);}startConsole({defaultMode:process.argv.includes('--setup')?'local':'online',initialMode:process.argv.includes('--online')?'online':undefined}).then(app=>{console.log('\nMiniopoly Host Game Setup\nKeep this terminal open while friends play.\nOwner setup page (keep private):\n'+app.url+'\n');openBrowser(app.url);let closing=false;for(const signal of ['SIGINT','SIGTERM','SIGHUP'])process.on(signal,async()=>{if(closing)return;closing=true;await app.close();process.exit(0);});}).catch(e=>{console.error(e.message);process.exitCode=1;});}
module.exports={createController,startConsole,verifyCaddy,trustedTLS,freePort,getPublicIP,gameSettings};
