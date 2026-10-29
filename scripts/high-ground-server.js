'use strict';
// Standalone LAN prototype. The same rules also run behind the main game server.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const root=path.resolve(__dirname,'..'),port=Number(process.env.PORT||3010),host=process.env.HOST||'0.0.0.0';
if(!Number.isInteger(port)||port<1||port>65535)throw Error('Choose a port from 1 to 65535.');
const engine=require('../lib/high-ground').store({directory:path.resolve(process.env.DATA_DIR||path.join(os.homedir(),'.miniopoly-wifi','high-ground-prototype'))});
const files={};for(const name of ['high-ground.html','high-ground.css','high-ground-client.js','high-ground-rules.js','property-development.js','property-development.css','avatars.js','avatars.css','font-preferences.js','font-preferences.css','fonts/nunito.ttf','fonts/american-captain.otf','art/avatars/players-v1.png','art/icons/dice.svg'])files['/'+name]=path.join(root,'public',name);
files['/']=files['/high-ground.html'];
function reply(res,status,body){const bytes=Buffer.from(JSON.stringify(body));res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Length':bytes.length});res.end(bytes);}
function urls(){return Object.values(os.networkInterfaces()).flat().filter(n=>n&&n.family==='IPv4'&&!n.internal).map(n=>'http://'+n.address+':'+port);}
const server=http.createServer(async(req,res)=>{
 try{
  if(req.headers.origin&&new URL(req.headers.origin).host!==req.headers.host)return reply(res,403,{error:'Cross-site requests are disabled.'});
  const url=new URL(req.url,'http://'+(req.headers.host||'localhost'));
  if(req.method==='GET'&&url.pathname==='/api/network')return reply(res,200,{urls:urls(),prototype:true});
  if(req.method==='POST'&&url.pathname==='/api/high-ground'){
   let bytes=0;const chunks=[];for await(const chunk of req){bytes+=chunk.length;if(bytes>4096)return reply(res,413,{error:'Request is too large.'});chunks.push(chunk);}
   let body;try{body=JSON.parse(Buffer.concat(chunks).toString());}catch{return reply(res,400,{error:'Send a valid prototype request.'});}
   return reply(res,200,engine.handle(body));
  }
  if(!['GET','HEAD'].includes(req.method)||!files[url.pathname])return reply(res,404,{error:'Not found'});
  const file=files[url.pathname],type={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.ttf':'font/ttf','.otf':'font/otf'}[path.extname(file)];
  const bytes=fs.readFileSync(file);res.writeHead(200,{'Content-Type':type,'Content-Length':bytes.length,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:bytes);
 }catch(error){if(!res.headersSent&&!res.destroyed)reply(res,error.status||500,{error:error.status?error.message:'Prototype host error.'});}
});
server.listen(port,host,()=>{
 const local='http://localhost:'+port;console.log('Miniopoly · High Ground prototype 1 · v0.3.93\nThis computer: '+local+'\nOn your Wi-Fi:\n'+urls().join('\n')+'\nKeep this window open while playing. Close it or press Ctrl+C to stop.');
 if(process.argv.includes('--open')){
  const {spawn}=require('node:child_process');const command=process.platform==='win32'?['cmd.exe',['/d','/s','/c','start "" "'+local+'"']]:process.platform==='darwin'?['open',[local]]:['xdg-open',[local]];
  const child=spawn(command[0],command[1],{stdio:'ignore',detached:true});child.on('error',()=>{});child.unref();
 }
});
server.on('error',error=>{console.error('Could not start High Ground: '+error.message);process.exitCode=1;});
