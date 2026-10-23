'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const presentation=require('../public/landing-presentation');
const app=fs.readFileSync(path.join(__dirname,'../public/app.js'),'utf8');
const context={};vm.createContext(context);
vm.runInContext(app.slice(app.indexOf('function rankPlayersByWorth('),app.indexOf('function renderFloatingPlayers(')),context);
const rank=players=>Array.from(context.rankPlayersByWorth(players),row=>({id:row.player.id,rank:row.rank,tied:row.tied}));
const player=(id,seat,worth,cash=worth,deeds=0,out=false)=>({id,seat,worth,cash,deeds,out});

test('equal net worth shares rank regardless of cash, deeds, active seat or input order',()=>{
  const players=[player('c',2,1500,100,9),player('b',1,2000,2000,0),player('a',0,2000,500,7),player('d',3,1500,1500,0)];
  const before=structuredClone(players);
  assert.deepEqual(rank(players),[{id:'a',rank:1,tied:true},{id:'b',rank:1,tied:true},{id:'c',rank:3,tied:true},{id:'d',rank:3,tied:true}]);
  assert.deepEqual(players,before,'Ranking must not change gameplay seat order or finances');
  assert.deepEqual(rank([player('a',0,1500),player('b',1,'1500'),player('c',2,1499)]),[{id:'a',rank:1,tied:true},{id:'b',rank:1,tied:true},{id:'c',rank:3,tied:false}]);
});
test('ties form and break as net worth changes; bankrupt players stay last and unranked',()=>{
  const players=[player('a',0,1500),player('b',1,1500),player('c',2,9999,9999,0,true),player('d',3,1000)];
  players[1].worth+=1;
  assert.deepEqual(rank(players),[{id:'b',rank:1,tied:false},{id:'a',rank:2,tied:false},{id:'d',rank:3,tied:false},{id:'c',rank:null,tied:false}]);
  players[0].worth+=1;
  assert.deepEqual(rank(players).slice(0,3),[{id:'a',rank:1,tied:true},{id:'b',rank:1,tied:true},{id:'d',rank:3,tied:false}]);
  assert.equal(rank([player('a',0,0),player('b',1,0)])[1].rank,1);
});
test('standings keep a tie through movement and update together with money on arrival',()=>{
  const current={code:'ROOMAA',matchId:'match',stage:'playing',turn:0,players:[player('a',0,1500),player('b',1,1500)],log:[]};
  const incoming=structuredClone(current);incoming.lastRoll={at:123,playerId:'a',value:4};incoming.players[0].worth=1550;incoming.players[0].cash=1550;
  const hold=presentation.capture(current,incoming);
  assert.deepEqual(rank(presentation.project(incoming,hold).players),[{id:'a',rank:1,tied:true},{id:'b',rank:1,tied:true}]);
  assert.equal(presentation.arrived(incoming,hold,{rollAt:123,playerId:'a'}),true);
  assert.deepEqual(rank(presentation.project(incoming,null).players),[{id:'a',rank:1,tied:false},{id:'b',rank:2,tied:false}]);
});
