'use strict';
const net=require('node:net'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto'),{spawn}=require('node:child_process');
const {startConsole}=require('./host-online');
const pipeName=()=> '\\\\.\\pipe\\miniopoly-launcher-'+crypto.createHash('sha256').update(os.homedir()).digest('hex').slice(0,24);
function receiveShow(socket,onShow){
 let input='',handled=false;socket.setEncoding('utf8');socket.setTimeout(4000,()=>socket.destroy());
 socket.on('error',()=>{});
 socket.on('data',chunk=>{
  if(handled)return;input+=chunk;
  if(input.length>128){handled=true;socket.end('error\n');return;}
  const end=input.indexOf('\n');if(end<0)return;handled=true;
  if(input.slice(0,end).trim()!=='show'){socket.end('error\n');return;}
  try{onShow();socket.end('queued\n');}catch{socket.end('error\n');}
 });
}
function requestShow(address){
 return new Promise((resolve,reject)=>{
  const client=net.connect(address),timer=setTimeout(()=>finish(Error('The running launcher did not answer. Use its tray icon to Show Launcher.')),4500);let answer='',finished=false;
  function finish(error){if(finished)return;finished=true;clearTimeout(timer);client.destroy();error?reject(error):resolve();}
  client.setEncoding('utf8');client.once('connect',()=>client.write('show\n'));
  client.on('data',chunk=>{answer+=chunk;if(answer.length>128)return finish(Error('The launcher returned an invalid response.'));if(answer.includes('\n'))finish(answer.split('\n')[0]==='queued'?null:Error('The launcher could not show its window.'));});
  client.once('error',finish);client.once('end',()=>finish(Error('Exit the older launcher from its tray icon, then start it again.')));
 });
}
async function main(){
 if(Number(process.versions.node.split('.')[0])<18)throw Error('Install Node.js LTS (version 18 or newer) before opening Game Launcher.');
 if(process.platform!=='win32')throw Error('The floating desktop launcher runs on Windows. Use node scripts/host-online.js --setup for browser hosting.');
 let desktop=null,app=null,closing=false,showPending=false;
 const broker=net.createServer(socket=>receiveShow(socket,()=>{if(desktop?.stdin.writable)desktop.stdin.write('{"action":"show"}\n');else showPending=true;}));
 const owns=await new Promise((resolve,reject)=>{broker.once('error',error=>error.code==='EADDRINUSE'?resolve(false):reject(error));broker.listen(pipeName(),()=>resolve(true));});
 if(!owns){await requestShow(pipeName());return;}
 async function close(){if(closing)return;closing=true;if(app)await app.close();broker.close();}
 try{
  const sendDesktop=command=>{if(!desktop?.stdin.writable)throw Error('The desktop launcher is unavailable.');desktop.stdin.write(JSON.stringify(command)+'\n');};
  app=await startConsole({defaultMode:'local',initialMode:process.argv.includes('--online')?'online':undefined,onExit:()=>sendDesktop({action:'exit'}),onOpenGame:url=>sendDesktop({action:'open',url})});
  desktop=spawn('powershell.exe',['-NoProfile','-STA','-ExecutionPolicy','Bypass','-File',path.join(__dirname,'../hosting/game-launcher.ps1')],{cwd:path.join(__dirname,'..'),windowsHide:true,stdio:['pipe','ignore','inherit']});
  desktop.stdin.on('error',()=>{});
  desktop.stdin.write(JSON.stringify({version:require('../package.json').version,url:app.url,root:path.join(__dirname,'..'),stateDirectory:path.join(os.homedir(),'.miniopoly-wifi','hosting')})+'\n');
  if(showPending)desktop.stdin.write('{"action":"show"}\n');
  desktop.once('exit',()=>{void close();});desktop.once('error',()=>{void close();});
  for(const signal of ['SIGINT','SIGTERM'])process.on(signal,async()=>{desktop?.kill();await close();});
 }catch(error){await close();throw error;}
}
if(require.main===module)main().catch(error=>{console.error(error.message);process.exitCode=1;});
module.exports={pipeName,receiveShow,requestShow};
