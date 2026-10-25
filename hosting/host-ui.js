'use strict';
const el=id=>document.getElementById(id);
let token=location.hash.slice(1)||sessionStorage.getItem('miniopoly_host_console');
if(token){sessionStorage.setItem('miniopoly_host_console',token);history.replaceState(null,'',location.pathname+location.search);}
window.name='miniopoly-owner-setup';
const entry=new URLSearchParams(location.search);
const requestedMode=entry.get('mode');
let requestedSettings=null;try{requestedSettings=JSON.parse(entry.get('settings')||'null');}catch{}
function launchTarget(value){
 const url=new URL(value.launchUrl||value.url);url.searchParams.set('central','1');url.searchParams.set('setupConsole',location.origin);
 if(value.avatarProfileKey)url.hash='avatarProfile='+value.avatarProfileKey;
 if(entry.get('resume')){url.searchParams.delete('central');url.searchParams.set('resume',entry.get('resume'));url.searchParams.set('room',entry.get('resume'));}
 else if(entry.get('create')==='1'){url.searchParams.delete('central');url.searchParams.set('new','1');}
 return url.href;
}
let current=null,busy=false,hydrated=false,saveTimer=null,savePending=null,gameWindow=null,openedForRun=false;
const mode=()=>el('modeOnline').checked?'online':'local';
const draft=()=>({mode:mode(),ip:el('ip').value.trim(),routerReady:el('routerReady').checked,autoOpen:el('autoOpen').checked,gameSettings:{gameMode:el('gameMode').value,collapseRentBoost:el('collapseRentBoost').checked,hostName:el('hostName').value,capacity:Number(el('capacity').value),rounds:Number(el('rounds').value),startingCash:Number(el('startingCash').value),worldShift:el('worldShift').value,ranked:el('ranked').checked}});
async function api(action,body){const res=await fetch('/api/'+action,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+token,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});const value=await res.json();if(!res.ok)throw Error(value.error||'Request failed.');return value;}
function message(value){el('message').textContent=value;}
function render(value){
 current=value;
 if(!hydrated){hydrated=true;const editable=['stopped','error'].includes(value.phase),selected=editable&&['local','online'].includes(requestedMode)?requestedMode:value.mode;el('modeOnline').checked=selected==='online';el('modeLocal').checked=selected!=='online';el('ip').value=value.ip||'';el('routerReady').checked=!!value.routerReady;el('autoOpen').checked=value.autoOpen!==false;const s={...(value.gameSettings||{}),...(editable&&requestedSettings&&typeof requestedSettings==='object'?requestedSettings:{})};el('gameMode').value=s.gameMode==='express'?'express':'classic';el('collapseRentBoost').checked=!!s.collapseRentBoost;el('hostName').value=String(s.hostName||'Host').slice(0,18);el('capacity').value=String([2,3,4].includes(Number(s.capacity))?s.capacity:4);el('rounds').value=String([0,10,12,15,20,30,50].includes(Number(s.rounds))?s.rounds:0);el('ranked').checked=!!s.ranked;el('startingCash').value=String([1000,1500,2000].includes(Number(s.startingCash))?s.startingCash:1500);el('worldShift').value=s.worldShift==='gravity'?'gravity':'individual';}
 const express=['express','countdown'].includes(el('gameMode').value);el('expressHelp').hidden=!express;el('collapseRentOption').hidden=!express||el('gameMode').value==='countdown';for(const option of el('rounds').options)option.disabled=express&&![10,15,20].includes(Number(option.value));if(express&&![10,15,20].includes(Number(el('rounds').value)))el('rounds').value='10';
 const online=mode()==='online',live=!['stopped','error'].includes(value.phase),ready=value.phase==='ready';
 el('onlineOptions').hidden=!online;el('localHelp').hidden=online;el('onlineHint').hidden=!online;
 const texts={stopped:['Hosting stopped',online?'Start hosting to prepare your private online game.':'Start hosting for players on your home Wi-Fi.'],starting:['Starting your game','Your saved match defaults are ready.'],certificate:['Preparing HTTPS','The first trusted certificate can take a few minutes. Check TCP 80/443 and Windows Firewall if it keeps waiting.'],ready:online?['Online game ready','Test the link on your phone with Wi-Fi off, then invite friends.']:['Local Multiplayer ready','Everyone joins through your home Wi-Fi. Open the game and create or resume your room.'],error:['Hosting stopped after an error','Check the message and connection details below.'],'address-changed':['Public IP changed','Stop hosting, check the new address, then restart.']};
 const text=texts[value.phase]||texts.error;el('status').textContent=text[0];el('status').classList.toggle('ready',ready);el('statusHelp').textContent=text[1]+(value.ipChanged?' New address: '+value.ipChanged:'');
 el('link').textContent=value.inviteUrl||value.url||'Your game link appears here.';el('shareHelp').textContent=online?'Share the HTTPS link and password privately. In the game, create a room and copy its invitation link.':'Share this Wi-Fi link, then your room code or invitation. Your player name and match settings are filled in on the host PC.';
 el('logs').textContent=[value.error,...(value.logs||[])].filter(Boolean).join('\n')||'No hosting activity yet.';el('localIP').textContent=(value.localAddresses||[]).join(' or ')||'check ipconfig';
 el('password').required=online&&!value.passwordConfigured;el('passwordHelp').textContent=value.passwordConfigured?'Password remembered securely. Leave blank to keep it.':'Choose at least 12 characters and share privately.';el('ip').required=online;el('routerReady').required=online;
 for(const id of ['modeLocal','modeOnline','gameMode','collapseRentBoost','hostName','capacity','rounds','startingCash','worldShift','autoOpen','start'])el(id).disabled=busy||live;
 for(const id of ['ip','password','routerReady'])el(id).disabled=busy||live||!online;
 el('detect').disabled=busy||!online;
 const ranked=!express&&[10,15,20].includes(Number(el('rounds').value))&&Number(el('startingCash').value)===1500;el('ranked').disabled=busy||live||!ranked;if(!ranked)el('ranked').checked=false;
 el('open').textContent=entry.get('resume')?'Resume saved game':entry.get('create')==='1'?'Continue to Create Room':'Open game';
 el('start').textContent=online?'Start Online Players':'Start Local Multiplayer';el('stop').disabled=busy||!live;for(const id of ['copy','open'])el(id).disabled=busy||!ready;el('firewall').disabled=busy;
 if(ready&&gameWindow&&!gameWindow.closed&&!openedForRun){openedForRun=true;gameWindow.location.replace(launchTarget(value));}
}
async function refresh(){try{render(await api('status'));}catch(e){message(e.message);}}
async function run(action,body){busy=true;if(current)render(current);try{const result=await api(action,body);message('');return result;}catch(e){message(e.message);return null;}finally{busy=false;await refresh();}}
function saveDraft(){clearTimeout(saveTimer);if(!hydrated||busy||!['stopped','error'].includes(current?.phase))return;el('savedStatus').textContent='Saving settings…';saveTimer=setTimeout(()=>{savePending=api('settings',draft()).then(value=>{render(value);el('savedStatus').textContent='Settings remembered.';}).catch(e=>{el('savedStatus').textContent=e.message;});},350);}
for(const id of ['modeLocal','modeOnline','gameMode','collapseRentBoost','hostName','capacity','rounds','startingCash','worldShift','ranked','ip','routerReady','autoOpen'])el(id).addEventListener('change',()=>{if(current)render(current);saveDraft();});
el('hostName').addEventListener('input',saveDraft);
el('setup').addEventListener('submit',async event=>{
 event.preventDefault();clearTimeout(saveTimer);openedForRun=false;
 if(el('autoOpen').checked){gameWindow=window.open('','miniopoly-game');if(gameWindow){try{if(gameWindow.location.href==='about:blank'){gameWindow.document.title='Preparing Miniopoly';const p=gameWindow.document.createElement('p');p.textContent='Preparing your Miniopoly game. Keep Game Launcher open until hosting is ready.';gameWindow.document.body.append(p);}}catch{}}}
 await savePending;
 const result=await run('start',{...draft(),password:el('password').value});
 if(result){el('password').value='';el('savedStatus').textContent='Settings remembered.';}else{if(gameWindow&&!gameWindow.closed)gameWindow.close();gameWindow=null;}
});
el('stop').onclick=()=>run('stop',{});
el('firewall').onclick=async()=>{if(await run('firewall',{mode:mode()}))message('Windows firewall rule added for '+(mode()==='local'?'Local Multiplayer':'Online Players')+' on Private networks.');};
el('detect').onclick=async()=>{const result=await run('check-ip',{});if(result){if(['stopped','error'].includes(current?.phase)){el('ip').value=result.ip;saveDraft();}else message('Current public IP: '+result.ip);}};
el('copy').onclick=async()=>{const link=current.inviteUrl||current.url;try{await navigator.clipboard.writeText(link);message('Player link copied.'+(mode()==='online'?' Share the password separately.':''));}catch{message('Copy this player link: '+link);}};
el('open').onclick=()=>window.open(launchTarget(current),'miniopoly-game');
refresh();setInterval(refresh,2500);
