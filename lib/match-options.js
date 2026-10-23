'use strict';
const ROUNDS=[0,10,12,15,20,30,50],CASH=[1000,1500,2000];
function parse(input={},current={}){
  const bad=()=>Object.assign(Error('Choose valid rounds, starting cash and world-shift options.'),{status:400});
  if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(key=>!['rounds','startingCash','worldShift'].includes(key)))throw bad();
  const rounds=input.rounds===undefined?(current.rounds??0):Number(input.rounds);
  const startingCash=input.startingCash===undefined?(current.startingCash??1500):Number(input.startingCash);
  const worldShift=input.worldShift===undefined?(current.worldShift??'individual'):input.worldShift;
  if(!ROUNDS.includes(rounds)||!CASH.includes(startingCash)||!['individual','gravity'].includes(worldShift))throw bad();
  return {rounds,startingCash,worldShift};
}
function standard(room){return (room.worldShift??'individual')==='individual'&&(room.startingCash??1500)===1500;}
function rankedSettings(room){return [10,15,20].includes(Number(room.rounds))&&['individual','gravity'].includes(room.worldShift??'individual')&&(room.startingCash??1500)===1500;}
function gravityPull(room,roller){
  if(room.worldShift!=='gravity')return null;
  const players=[];
  room.players.forEach((player,seat)=>{
    if(player===roller||player.out||player.penalty>0)return;
    players.push({playerId:player.id,seat,previousBoard:player.board,previousPosition:player.pos});
    player.board=roller.board;player.pos=roller.pos;player.streak=0;
  });
  return players.length?{board:roller.board,position:roller.pos,players}:null;
}
module.exports={ROUNDS,CASH,parse,standard,rankedSettings,gravityPull};
