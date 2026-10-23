'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../public/board-v5-42.html'),'utf8');
const fn=source.slice(source.indexOf('function miniWifiVisibleLocation('),source.indexOf('function miniWifiInspectionBusy('));
function view(hold=null,moving=null,world=null,gravity=null){const ctx={window:{MiniopolyGravityPull:require('../public/gravity-pull')},miniWifiGravityHold:gravity,miniWifiRollHold:hold,miniWifiAnimation:moving,miniWifiVisualBoard:world};vm.createContext(ctx);vm.runInContext(fn,ctx);return ctx;}
test('parked occupancy preserves each player’s world and position',()=>{const v=view();for(const p of [{board:0,pos:2},{board:1,pos:2},{board:2,pos:6}])assert.equal(JSON.stringify(v.miniWifiVisibleLocation(p,0)),JSON.stringify(p));});
test('die and shift presentation reserve the starting square, never the authoritative destination',()=>{const v=view({index:0,roll:{previousPosition:0,board:1}},null,0),p={board:1,pos:6};assert.equal(JSON.stringify(v.miniWifiVisibleLocation(p,0)),JSON.stringify({board:0,pos:0}));v.miniWifiVisualBoard=null;assert.equal(JSON.stringify(v.miniWifiVisibleLocation(p,0)),JSON.stringify({board:1,pos:0}));assert.deepEqual(p,{board:1,pos:6});});
test('moving piece reserves no destination artwork space until arrival; other players remain parked',()=>{const p={board:0,pos:2},v=view({index:0,roll:{previousPosition:0,board:0}},{node:{}});assert.equal(v.miniWifiVisibleLocation(p,0),null);assert.equal(JSON.stringify(v.miniWifiVisibleLocation({board:1,pos:2},1)),JSON.stringify({board:1,pos:2}));v.miniWifiRollHold=null;v.miniWifiAnimation=null;assert.equal(JSON.stringify(v.miniWifiVisibleLocation(p,0)),JSON.stringify(p));});
test('pulled pieces keep their old world/square through the roll, reserve no space during the pull and appear at the destination on arrival',()=>{
  const player={id:'guest',board:1,pos:7},gravity={pull:{players:[{playerId:'guest',previousBoard:2,previousPosition:15}]},playing:false},v=view(null,null,null,gravity);
  assert.equal(JSON.stringify(v.miniWifiVisibleLocation(player,1)),JSON.stringify({board:2,pos:15}));
  gravity.playing=true;assert.equal(v.miniWifiVisibleLocation(player,1),null);
  v.miniWifiGravityHold=null;assert.equal(JSON.stringify(v.miniWifiVisibleLocation(player,1)),JSON.stringify({board:1,pos:7}));assert.deepEqual(player,{id:'guest',board:1,pos:7});
});
