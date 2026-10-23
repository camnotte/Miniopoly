'use strict';
const crypto=require('node:crypto');
const {promisify}=require('node:util');
const scrypt=promisify(crypto.scrypt);
const {consoleURL}=require('./game-central');
const COOKIE='__Host-miniopoly-access';

async function hashPassword(password){
  if(typeof password!=='string'||password.length<12||password.length>128)throw Error('Use a game password of 12–128 characters.');
  const salt=crypto.randomBytes(16).toString('hex'),hash=await scrypt(password,salt,32);
  return salt+':'+hash.toString('hex');
}
function validHash(value){return typeof value==='string'&&/^[a-f0-9]{32}:[a-f0-9]{64}$/.test(value);}
async function checkPassword(password,encoded){
  if(!validHash(encoded)||typeof password!=='string'||password.length>128)return false;
  const [salt,expected]=encoded.split(':'),actual=await scrypt(password,salt,32);
  return crypto.timingSafeEqual(actual,Buffer.from(expected,'hex'));
}
function equal(a,b){const x=Buffer.from(a||''),y=Buffer.from(b||'');return x.length===y.length&&crypto.timingSafeEqual(x,y);}
function setupDefaults(raw){
  try{
    if(typeof raw!=='string'||raw.length>512)return '';
    const v=JSON.parse(raw);if(!v||typeof v!=='object'||Array.isArray(v))return '';
    const rounds=[0,10,12,15,20,30,50].includes(Number(v.rounds))?Number(v.rounds):0;
    const worldShift=v.worldShift==='gravity'?'gravity':'individual',startingCash=[1000,1500,2000].includes(Number(v.startingCash))?Number(v.startingCash):1500;
    return JSON.stringify({hostName:typeof v.hostName==='string'?v.hostName.trim().slice(0,18):'Host',capacity:[2,3,4].includes(Number(v.capacity))?Number(v.capacity):4,rounds,worldShift,startingCash,ranked:v.ranked===true&&[10,15,20].includes(rounds)&&startingCash===1500});
  }catch{return '';}
}
function createRemoteAccess({publicUrl,passwordHash,hostToken,sessionMs=12*60*60*1000}){
  if(!publicUrl)return null;
  const site=new URL(publicUrl);
  if(site.protocol!=='https:'||site.username||site.password||site.pathname!=='/'||site.search||site.hash||!validHash(passwordHash)||!hostToken)throw Error('Remote hosting needs a valid HTTPS address, password hash, and local host token.');
  const sessions=new Map(),attempts=new Map();let hashing=0;
  const security={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin','X-Frame-Options':'SAMEORIGIN','Content-Security-Policy':"frame-ancestors 'self'"};
  const send=(res,status,body,headers={})=>{res.writeHead(status,{...security,'Content-Type':'text/html; charset=utf-8',...headers});res.end(body);};
  const clearCookie=COOKIE+'=; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=0';
  function expire(key){const entry=sessions.get(key);if(entry){clearTimeout(entry.timer);for(const stream of entry.streams)stream.end();sessions.delete(key);}}
  function page(message='',room='',setup='',navigation={}){
    room=/^[A-Z0-9]{6}$/.test(room)?room:'';
    const nav='<input type="hidden" name="central" value="'+(navigation.central?'1':'0')+'"><input type="hidden" name="new" value="'+(navigation.newGame?'1':'0')+'"><input type="hidden" name="restore" value="'+(navigation.restore?'1':'0')+'"><input type="hidden" name="roomName" value="'+encodeURIComponent(String(navigation.roomName||'').replace(/[\x00-\x1f\x7f]/g,'').slice(0,40))+'"><input type="hidden" name="setupConsole" value="'+encodeURIComponent(consoleURL(navigation.setupConsole))+'">';
    return '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Private Miniopoly game</title><script defer src="/avatar-default.js?v=0.3.46"></script><link rel="icon" href="/art/icons/dice.svg"><style>@font-face{font-family:Nunito;src:url(/fonts/nunito.ttf);font-weight:200 1000}*{box-sizing:border-box}body{margin:0;min-height:100dvh;display:grid;place-items:center;padding:24px;background:#234b49;color:#253f3d;font:500 17px/1.5 Nunito,system-ui,sans-serif}main{width:min(440px,100%);padding:32px;background:#fbf9f2;border:1px solid #dae0ce;border-radius:22px}h1{font-size:30px;font-weight:700;margin:0 0 10px}p{color:#62725f}label{display:grid;gap:8px;font-weight:600}input,button{font:inherit;border-radius:10px;padding:12px;width:100%}input{border:1px solid #b8c8ac;background:#fffef8;color:#253f3d}button{margin-top:17px;border:0;background:#315d4c;color:#fff6df;font-weight:700;cursor:pointer}.message{color:#904d3c;font-size:15px}</style><main><h1>Private Miniopoly game</h1><p>Enter the game password your host shared with you.</p>'+(message?'<p class="message" role="alert">'+message+'</p>':'')+'<form method="post" action="/remote/login">'+nav+'<input type="hidden" name="hostSetup" value="'+encodeURIComponent(setupDefaults(setup))+'"><input type="hidden" name="room" value="'+room+'"><label>Game password<input name="password" type="password" minlength="12" maxlength="128" autocomplete="current-password" required autofocus></label><button type="submit">Join the private game</button></form><p style="font-size:13px">You’ll enter your room code after signing in.</p></main></html>';
  }
  function findSession(req){
    const cookie=(req.headers.cookie||'').split(';').map(c=>c.trim()).find(c=>c.startsWith(COOKIE+'='));
    if(!cookie)return null;
    const value=cookie.slice(COOKIE.length+1);if(!/^[a-f0-9]{64}$/.test(value))return null;
    const key=crypto.createHash('sha256').update(value).digest('hex'),entry=sessions.get(key);
    if(!entry)return null;if(entry.expires<=Date.now()){expire(key);return null;}return key;
  }
  async function handle(req,res,url){
    for(const [name,value] of Object.entries(security))res.setHeader(name,value);
    // Only the local launcher may probe readiness. There is no game-auth bypass.
    if(url.pathname==='/__host/health'){
      if(equal(req.headers['x-miniopoly-host-token'],hostToken)&&['127.0.0.1','::1','::ffff:127.0.0.1'].includes(req.socket.remoteAddress))send(res,200,'ready',{'Content-Type':'text/plain'});
      else send(res,404,'Not found');return true;
    }
    if(req.headers.host!==site.host){send(res,421,'Use the configured HTTPS game address.');return true;}
    if(req.headers['x-forwarded-proto']!=='https'){send(res,400,'This private game requires HTTPS.');return true;}
    if(url.pathname==='/fonts/nunito.ttf'||url.pathname==='/art/icons/dice.svg'||url.pathname==='/avatar-default.js')return false;
    if(url.pathname==='/remote/login'&&req.method==='POST'){
      if(req.headers.origin!==site.origin){send(res,403,'Cross-site sign-in is disabled.');return true;}
      const now=Date.now();for(const [key,value] of attempts)if(value.until<=now)attempts.delete(key);
      const ip=String(req.headers['x-forwarded-for']||req.socket.remoteAddress).split(',')[0].trim();
      const attempt=attempts.get(ip)||{count:0,until:now+5*60*1000};
      if(attempt.count>=8||attempts.size>=1000||hashing>=2){send(res,429,page('Too many attempts. Please wait a few minutes.'),{'Retry-After':'300'});return true;}
      attempt.count++;attempts.set(ip,attempt);
      let body='';const timeout=setTimeout(()=>req.destroy(),5000);timeout.unref();try{for await(const chunk of req){body+=chunk.toString();if(Buffer.byteLength(body)>4096)throw Error('Too large');}}catch{if(!res.destroyed)send(res,400,page('Could not read that sign-in.'));return true;}finally{clearTimeout(timeout);}
      const form=new URLSearchParams(body),room=/^[A-Z0-9]{6}$/.test(form.get('room')||'')?form.get('room'):'';
      let setup='';try{setup=setupDefaults(decodeURIComponent(form.get('hostSetup')||''));}catch{}
      const navigation={central:form.get('central')==='1',newGame:form.get('new')==='1',restore:form.get('restore')==='1',roomName:'',setupConsole:''};try{navigation.setupConsole=consoleURL(decodeURIComponent(form.get('setupConsole')||''));navigation.roomName=decodeURIComponent(form.get('roomName')||'').replace(/[\x00-\x1f\x7f]/g,'').slice(0,40);}catch{}
      if(hashing>=2){send(res,429,page('Sign-in is busy. Try again shortly.',room,setup));return true;}
      let ok=false;hashing++;try{ok=await checkPassword(form.get('password'),passwordHash);}finally{hashing--;}
      if(!ok){send(res,401,page('That password did not match. Try again.',room,setup,navigation));return true;}
      attempts.delete(ip);
      if(sessions.size>=64){send(res,503,page('The private game has reached its sign-in limit.'));return true;}
      const value=crypto.randomBytes(32).toString('hex'),key=crypto.createHash('sha256').update(value).digest('hex');
      const entry={expires:Date.now()+sessionMs,streams:new Set(),timer:setTimeout(()=>expire(key),sessionMs)};entry.timer.unref();sessions.set(key,entry);
      const target=new URLSearchParams();if(room)target.set('room',room);if(setup)target.set('hostSetup',setup);
      if(navigation.central)target.set('central','1');if(navigation.setupConsole)target.set('setupConsole',navigation.setupConsole);
      if(navigation.newGame)target.set('new','1');if(navigation.restore)target.set('restore','1');if(navigation.roomName)target.set('roomName',navigation.roomName);
      send(res,303,'',{'Location':'/'+(target.size?'?'+target:''),'Set-Cookie':COOKIE+'='+value+'; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age='+Math.floor(sessionMs/1000)});return true;
    }
    const key=findSession(req);req.remoteAccessSession=key;
    if(url.pathname==='/remote/logout'&&req.method==='POST'){
      if(req.headers.origin!==site.origin){send(res,403,'Cross-site sign-out is disabled.');return true;}
      if(key)expire(key);send(res,303,'',{'Location':'/','Set-Cookie':clearCookie});return true;
    }
    if(key)return false;
    if(url.pathname.startsWith('/api/')){send(res,401,JSON.stringify({error:'Please sign into the private game again.'}),{'Content-Type':'application/json; charset=utf-8'});return true;}
    if(req.method==='GET'&&['/','/central'].includes(url.pathname))send(res,200,page('',url.searchParams.get('room')||'',url.searchParams.get('hostSetup')||'',{central:url.pathname==='/central'||url.searchParams.get('central')==='1',newGame:url.searchParams.get('new')==='1',restore:url.searchParams.get('restore')==='1',roomName:url.searchParams.get('roomName'),setupConsole:url.searchParams.get('setupConsole')}));
    else send(res,303,'',{'Location':'/'});
    return true;
  }
  function trackStream(req,res){const entry=sessions.get(req.remoteAccessSession);if(entry){entry.streams.add(res);res.once('close',()=>entry.streams.delete(res));}}
  function close(){for(const key of sessions.keys())expire(key);}
  return {handle,trackStream,close,publicUrl:site.origin};
}
module.exports={hashPassword,checkPassword,validHash,createRemoteAccess};
