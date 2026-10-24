'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
function fixture(){
 const timers=new Map(),context={window:{},AbortController,setTimeout:(fn)=>{const key={};timers.set(key,fn);return key;},clearTimeout:key=>timers.delete(key)};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../public/game-options.js'),'utf8'),context);
 const ui=Object.create(context.window.MiniopolyGameOptions.prototype),room={code:'ROOMAA',stage:'playing',matchId:'one',hostId:'host',youId:'host',rounds:20,startingCash:1500,worldShift:'individual'};
 Object.assign(ui,{getData:()=>room,saving:false,status:{textContent:''},form:{elements:{gameMode:{value:'classic'},collapseRentBoost:{checked:false},rounds:{value:'15'},startingCash:{value:'1500'},worldShift:{value:'gravity'}}},refresh(){},close(){},notice:{hidden:true}});
 return {ui,room,timers};
}
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};
test('option values are captured before refresh and only one shared save is submitted',async()=>{
 const {ui,timers}=fixture(),pending=deferred();let calls=0,submitted;
 ui.refresh=()=>{ui.form.elements.worldShift.value='individual';};
 ui.onSave=async options=>{calls++;submitted=options;await pending.promise;};
 const work=ui.save();assert.equal(ui.saving,true);assert.equal(ui.saveRequest.options.worldShift,'gravity');
 await ui.save();assert.equal(calls,1);assert.equal(submitted.worldShift,'gravity');assert.equal(submitted.rounds,15);
 pending.resolve();await work;assert.equal(ui.saving,false);assert.equal(ui.saveRequest,null);assert.equal(ui.status.textContent,'Match options saved.');assert.equal(timers.size,0);
});
test('failed saves restore editing and expose the server error',async()=>{
 const {ui,timers}=fixture();ui.onSave=async()=>{throw Error('Connection lost');};await ui.save();
 assert.equal(ui.saving,false);assert.equal(ui.saveRequest,null);assert.equal(ui.status.textContent,'Connection lost');assert.equal(timers.size,0);
});
test('the ten-second save deadline aborts the request, restores editing and never automatically retries',async()=>{
 const {ui,timers}=fixture();let calls=0,signal;
 ui.onSave=(_options,request)=>{calls++;signal=request.signal;return new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(Error('Aborted')),{once:true}));};
 const work=ui.save();assert.equal(timers.size,1);[...timers.values()][0]();await work;
 assert.equal(signal.aborted,true);assert.equal(ui.saving,false);assert.equal(calls,1);assert.match(ui.status.textContent,/No confirmation/);assert.equal(timers.size,0);
});
test('room departure clears a pending lock and late completion cannot unlock or overwrite a later save',async()=>{
 const {ui,room}=fixture(),first=deferred(),second=deferred();let signal;
 ui.onSave=(_options,request)=>{signal=request.signal;return first.promise;};
 const old=ui.save();ui.reset();assert.equal(signal.aborted,true);assert.equal(ui.saving,false);
 room.code='ROOMBB';room.matchId='two';ui.onSave=()=>second.promise;const current=ui.save();
 first.resolve();await old;assert.equal(ui.saving,true);assert.equal(ui.saveRequest.options.worldShift,'gravity');assert.equal(ui.status.textContent,'Saving match options…');
 second.resolve();await current;assert.equal(ui.saving,false);assert.equal(ui.status.textContent,'Match options saved.');
});
test('a response finishing after the deadline cannot report an aborted save as confirmed',async()=>{
 const {ui,timers}=fixture(),pending=deferred();ui.onSave=()=>pending.promise;
 const work=ui.save();[...timers.values()][0]();pending.resolve();await work;
 assert.equal(ui.saving,false);assert.match(ui.status.textContent,/No confirmation/);
});
test('guests and completed matches cannot submit shared settings through the form',async()=>{
 const {ui,room}=fixture();let calls=0;ui.onSave=async()=>calls++;
 room.youId='guest';await ui.save();room.youId='host';room.stage='finished';await ui.save();assert.equal(calls,0);assert.equal(ui.saving,false);
});
