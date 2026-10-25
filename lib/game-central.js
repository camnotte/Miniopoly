'use strict';
const fs=require('node:fs'),path=require('node:path');
const avatars=require('../public/avatars');
const finite=value=>Number.isFinite(Number(value))?Number(value):0;
const text=(value,length=80)=>typeof value==='string'?value.replace(/[\x00-\x1f\x7f]/g,'').slice(0,length):'';
function roomSummary(room,viewer=null){
 const players=(room.players||[]).slice(0,4);
 return {gameMode:['express','countdown'].includes(room.gameMode)?room.gameMode:'classic',collapseWave:room.collapse?.wave||0,code:room.code,name:text(room.name)||'Room '+room.code,stage:room.stage,round:finite(room.round),rounds:finite(room.rounds),capacity:finite(room.capacity),worldShift:room.worldShift==='gravity'?'gravity':'individual',startingCash:room.startingCash||1500,ranked:!!room.ranked,
  updatedAt:finite(room.updatedAt),turnName:text(players[room.turn]?.name),viewerName:viewer?.name||'',viewerHost:viewer?.id===room.hostId,
  players:players.map((p,seat)=>({seat,name:text(p.name,18),avatar:avatars.resolve(p.avatar,seat).id,board:[0,1,2].includes(p.board)?p.board:0,cash:finite(p.cash),out:!!p.out}))};
}
function cleanRecord(value){
 if(!value||typeof value.matchId!=='string'||!Array.isArray(value.standings)||!value.standings.length||value.standings.length>4)return null;
 const rounds=finite(value.roundLimit);if(![0,10,12,15,20,30,50].includes(rounds))return null;
 return {gameMode:['express','countdown'].includes(value.gameMode)?value.gameMode:'classic',collapseRentBoost:!!value.collapseRentBoost,matchId:text(value.matchId),roomCode:text(value.roomCode,6),name:text(value.name)||'Completed game',roundLimit:rounds,startingCash:[1000,1500,2000].includes(Number(value.startingCash))?Number(value.startingCash):1500,roundsPlayed:finite(value.roundsPlayed),worldShift:value.worldShift==='gravity'?'gravity':'individual',ranked:!!value.ranked,at:text(value.at,40),reason:text(value.reason,30),
  standings:value.standings.map((p,index)=>({name:text(p.name,18),avatar:avatars.resolve(p.avatar,index).id,worth:finite(p.worth),cash:finite(p.cash),deeds:finite(p.deeds),bankrupt:!!p.bankrupt,outReason:['collapse','countdown'].includes(p.outReason)?p.outReason:p.bankrupt?'bankruptcy':null,seat:finite(p.seat),place:value.gameMode==='countdown'&&Number.isSafeInteger(p.place)&&p.place>=1&&p.place<=4?p.place:index+1}))};
}
function readRecords(directory){
 try{const data=JSON.parse(fs.readFileSync(path.join(directory,'match-records.json'),'utf8'));return (Array.isArray(data.matches)?data.matches:[]).slice(0,2000).map(cleanRecord).filter(Boolean);}catch{return [];}
}
function createRecordStore(directory){
 let records=readRecords(directory);
 return {list:()=>records.map(r=>structuredClone(r)),record(room){
  if(!room.finalResults||records.some(r=>r.matchId===room.finalResults.matchId))return;
  const final=room.finalResults;
  const next=cleanRecord({gameMode:room.gameMode,collapseRentBoost:room.collapseRentBoost,matchId:final.matchId,roomCode:room.code,name:room.name||'Room '+room.code,roundLimit:final.roundLimit??room.rounds,roundsPlayed:room.round,worldShift:room.worldShift,startingCash:room.startingCash,ranked:final.legendaryEligible,at:final.at,reason:final.reason,
   standings:final.standings.map(p=>({...p,avatar:room.players?.find(player=>player.id===p.id)?.avatar}))});
  if(!next)return;
  records.unshift(next);records=records.slice(0,2000);
  try{fs.mkdirSync(directory,{recursive:true});const file=path.join(directory,'match-records.json'),temp=file+'.'+process.pid+'.tmp';
   fs.writeFileSync(temp,JSON.stringify({format:1,matches:records},null,2),{mode:0o600});fs.renameSync(temp,file);
  }catch(error){console.error('Could not save completed-match history: '+error.message);}
 }};
}
function readOwnerLibrary(directory){
 let rooms=[];
 try{const data=JSON.parse(fs.readFileSync(path.join(directory,'rooms.json'),'utf8'));rooms=(data.rooms||[]).filter(r=>/^[A-Z2-9]{6}$/.test(r.code)&&Array.isArray(r.players)).slice(0,100).map(r=>roomSummary(r));}catch{}
 function records(filename){
  const result={10:[],15:[],20:[]};
  try{const data=JSON.parse(fs.readFileSync(path.join(directory,filename),'utf8'));for(const n of [10,15,20])result[n]=(Array.isArray(data[n])?data[n]:[]).slice(0,3).map(p=>({name:text(p.name,18),worth:finite(p.worth),at:text(p.at,40),rounds:n,seat:finite(p.seat)}));}catch{}
  return result;
 }
 return {rooms,legendary:records('legendary.json'),legendaryGravity:records('legendary-gravity.json'),records:readRecords(directory)};
}
function consoleURL(value){
 try{const u=new URL(value);return u.protocol==='http:'&&u.hostname==='127.0.0.1'&&Number(u.port)>0&&!u.username&&!u.password&&u.pathname==='/'&&!u.search&&!u.hash?u.origin:'';}catch{return '';}
}
function staticFiles(){
 const files={'/avatar-default.js':['public/avatar-default.js','application/javascript'],'/central':['public/game-central.html','text/html; charset=utf-8'],'/game-central.css':['public/game-central.css','text/css'],'/game-central.js':['public/game-central.js','application/javascript'],'/game-central-data.js':['public/game-central-data.js','application/javascript'],'/seat-library.js':['public/seat-library.js','application/javascript'],'/fonts/nunito.ttf':['public/fonts/nunito.ttf','font/ttf'],'/favicon.svg':['public/art/icons/dice.svg','image/svg+xml']};
 files['/launcher-bridge.js']=['public/launcher-bridge.js','application/javascript'];
 for(const name of ['build-info.js','font-preferences.js'])files['/'+name]=['public/'+name,'application/javascript'];
 files['/font-preferences.css']=['public/font-preferences.css','text/css'];
 files['/fonts/american-captain.otf']=['public/fonts/american-captain.otf','font/otf'];
 const data=require('../game-data.json');
 const names=[...Array.from({length:10},(_,i)=>'avatar-'+i),...Array.from({length:3},(_,i)=>'world-'+i),...data.deeds.filter(d=>d.type==='p').map(d=>'property-'+d.id)];
 for(const name of names)files['/art/central/'+name+'.jpg']=['public/art/central/'+name+'.jpg','image/jpeg'];
 return files;
}
module.exports={roomSummary,cleanRecord,readRecords,createRecordStore,readOwnerLibrary,consoleURL,staticFiles};
