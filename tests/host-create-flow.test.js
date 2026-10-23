'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
function launch(query,origin='https://8.8.8.8'){
 const source=fs.readFileSync(path.join(root,'hosting/host-ui.js'),'utf8'),start=source.indexOf('function launchTarget('),end=source.indexOf('\nlet current=',start);
 const sandbox={URL,entry:new URLSearchParams(query),location:{origin:'http://127.0.0.1:1234'}};vm.createContext(sandbox);vm.runInContext(source.slice(start,end),sandbox);
 const settings={hostName:'Dell PC',capacity:2,rounds:10,startingCash:1500,worldShift:'gravity',ranked:true};
 return new URL(sandbox.launchTarget({url:origin,launchUrl:origin+'/?hostSetup='+encodeURIComponent(JSON.stringify(settings))}));
}
test('Host a game continues directly to Create Room after either Local or Online hosting becomes ready',()=>{
 for(const origin of ['http://localhost:3000','https://8.8.8.8']){
  const url=launch('mode=online&create=1',origin);assert.equal(url.origin,origin);assert.equal(url.searchParams.get('new'),'1');assert.equal(url.searchParams.has('central'),false);assert.equal(url.searchParams.get('setupConsole'),'http://127.0.0.1:1234');assert.equal(url.hash,'');
  const settings=JSON.parse(url.searchParams.get('hostSetup'));assert.equal(settings.worldShift,'gravity');assert.equal(settings.ranked,true);
 }
});
test('general setup opens Game Central, saved-game resume takes priority and invalid create flags do nothing',()=>{
 for(const query of ['', 'create=true','create=https://attacker.test']){const url=launch(query);assert.equal(url.searchParams.get('central'),'1');assert.equal(url.searchParams.has('new'),false);}
 const url=launch('resume=ABC234&create=1');assert.equal(url.searchParams.get('room'),'ABC234');assert.equal(url.searchParams.get('resume'),'ABC234');assert.equal(url.searchParams.has('new'),false);assert.equal(url.searchParams.has('central'),false);
});
test('Game Central carries new-game intent to setup while keeping the owner token in the private helper fragment',()=>{
 const source=fs.readFileSync(path.join(root,'public/game-central.js'),'utf8'),start=source.indexOf('function setup('),end=source.indexOf('\nfunction gameURL',start);let opened;
 for(const owner of [true,false]){
  const sandbox={URL,isOwner:()=>owner,mode:()=> 'local',location:{origin:'http://127.0.0.1:1234'},ownerToken:'a'.repeat(64),localStorage:{getItem:()=> 'http://127.0.0.1:1234'},window:{open:url=>{opened=new URL(url);return {};}}};vm.createContext(sandbox);vm.runInContext(source.slice(start,end),sandbox);
  sandbox.setup('online','',true);assert.equal(opened.pathname,'/setup');assert.equal(opened.searchParams.get('mode'),'online');assert.equal(opened.searchParams.get('create'),'1');assert.equal(opened.hash,owner?'#'+'a'.repeat(64):'');
  sandbox.setup('local');assert.equal(opened.searchParams.has('create'),false);
 }
});
