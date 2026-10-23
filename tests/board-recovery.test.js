'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {sameSeat}=require('../public/room-sync');
const app=fs.readFileSync(path.join(__dirname,'../public/app.js'),'utf8');
const source=app.slice(app.indexOf('async function restoreLiveBoard('),app.indexOf('function connect('));
function harness(){
 const calls=[],frame={src:'https://game.example/board-v5-42.html?v=current',getAttribute:()=>true,contentWindow:{location:{replace:url=>calls.push(['replace',url])}}},menu={open:true};
 const ctx={auth:{code:'ROOMAA',token:'private-seat'},loading:false,state:{revision:5},animationSafetyTimer:1,worldTransitionKey:'old',financialHold:{},animating:true,diceSpinning:true,boardView:{preview:true},boardReady:true,boardModalOpen:true,artRequested:new Set(['0-1']),AbortController,setTimeout:()=>2,window:{MiniopolyRoomSync:{sameSeat}},el:id=>id==='boardFrame'?frame:menu,
  stopRoomCatchup:()=>calls.push(['stop']),setLoading:on=>{ctx.loading=on;calls.push(['loading',on]);},api:async(route,auth)=>{calls.push(['api',route,auth]);return {state:{revision:6}};},applyRoomState:(incoming,options)=>{calls.push(['apply',options]);ctx.state=incoming;},clearTimeout:()=>{},setConnectionStatus:on=>calls.push(['status',on]),ensureBoard:()=>calls.push(['ensure']),connect:()=>calls.push(['connect']),showError:error=>calls.push(['error',error]),wakeRoomConnection:()=>calls.push(['wake'])};
 vm.createContext(ctx);vm.runInContext(source,ctx);return {ctx,calls,frame,menu};
}
test('restoring a board reads the saved room and replaces only its presentation without adding browser history',async()=>{
 const h=harness();await h.ctx.restoreLiveBoard();
 assert.deepEqual(h.calls.filter(c=>c[0]==='api').map(c=>c[1]),['resume'],'No reset, roll, payment or other mutation');
 assert.equal(h.ctx.state.revision,6);assert.equal(h.ctx.animating,false);assert.equal(h.ctx.diceSpinning,false);assert.equal(h.ctx.financialHold,null);assert.equal(h.ctx.worldTransitionKey,'');assert.equal(h.ctx.boardView,null);assert.equal(h.ctx.boardReady,false);assert.equal(h.menu.open,false);assert.equal(h.ctx.loading,false);
 assert.deepEqual(h.calls.find(c=>c[0]==='replace'),['replace',h.frame.src]);assert.ok(h.calls.find(c=>c[0]==='apply')[1].catchUp);assert.equal(h.calls.at(-1)[0],'connect');
});
test('a failed host read preserves the displayed board and saved seat and resumes live updates',async()=>{
 const h=harness(),auth=h.ctx.auth;h.ctx.api=async()=>{throw Error('Host unavailable')};await h.ctx.restoreLiveBoard();
 assert.equal(h.ctx.auth,auth);assert.equal(h.ctx.boardReady,true);assert.equal(h.ctx.state.revision,5);assert.equal(h.ctx.animating,true);assert.ok(!h.calls.some(c=>c[0]==='replace'));assert.match(h.calls.find(c=>c[0]==='error')[1],/saved match has not been reset/);assert.equal(h.ctx.loading,false);assert.equal(h.calls.at(-1)[0],'connect');
});
test('a delayed restore reply cannot rebuild a newly selected room or seat',async()=>{
 const h=harness();let resolve;h.ctx.api=()=>new Promise(r=>{resolve=r});const pending=h.ctx.restoreLiveBoard();h.ctx.auth={code:'OTHERB',token:'new-seat'};resolve({state:{revision:6}});await pending;
 assert.equal(h.ctx.state.revision,5);assert.ok(!h.calls.some(c=>['apply','replace','connect'].includes(c[0])));
});
test('Back/Forward cache restoration rebuilds the board; ordinary pageshow only reconnects',()=>{
 const h=harness();h.ctx.restoreLiveBoard=()=>h.calls.push(['restore']);h.ctx.handleRoomPageShow({persisted:true});h.ctx.handleRoomPageShow({persisted:false});h.ctx.loading=true;h.ctx.handleRoomPageShow({persisted:true});assert.deepEqual(h.calls,[['restore'],['wake'],['wake']]);
});
