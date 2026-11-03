'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),rules=require('../public/cleanup-rules'),{deeds}=require('../game-data.json');let g,browser;
(async()=>{
 g=await require('./helpers/deals-host.cjs')();await g.edit(r=>{r.round=4;r.rounds=0;r.turn=2;r.phase='post';r.pending=null;r.obligation=null;r.owned={'0-6':{owner:0,level:0}};});
 browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const pages=[],frames=[],errors=[];
 for(const [i,seat]of g.seats.slice(0,2).entries()){
  const context=await browser.newContext({viewport:i?{width:390,height:700}:{width:1366,height:768}});await context.addInitScript(auth=>{localStorage.setItem('miniopoly_wifi_seat_v1',JSON.stringify(auth));localStorage.setItem('miniopoly_personal_options_v1',JSON.stringify({helper:false,sound:false,motion:'reduce'}));},{code:g.seats[0].code,token:seat.token});
  const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));pages.push(p);await p.goto(g.base);await p.waitForFunction(()=>boardReady&&!loading);const f=p.frames().find(f=>f.url().includes('board-v5-42'));frames.push(f);
  await p.evaluate(()=>document.getElementById('boardFrame').contentWindow.postMessage({type:'MINI_CLEANUP_VIEW',board:2},location.origin));await f.waitForFunction(()=>getDisplayBoard()===2);
 }
 await g.act(2,'end');for(const f of frames){await f.waitForFunction(()=>getDisplayBoard()===0);await f.getByRole('button',{name:'Stop following bot',exact:true}).waitFor();assert.match(await f.locator('.cleanup-bot-bubble').innerText(),/Clean Bot #1010/);}
 await frames[1].getByRole('button',{name:'Stop following bot',exact:true}).click();await frames[1].waitForFunction(()=>getDisplayBoard()===2);
 await pages[1].evaluate(()=>tradingCenter.open());assert(await pages[1].locator('.trading-dialog').isVisible());
 const r=(await g.resume()).state,q=rules.quote(r,deeds.find(d=>d.id==='0-6'));assert.equal((await g.act(0,'cleanup-house-call',{id:'0-6',choice:'book',quote:q.key})).status,200);
 for(const p of pages)await p.waitForFunction(()=>state.cleanup?.houseCall?.status==='completed');
 assert.deepEqual(await pages[0].evaluate(()=>state.cleanup.broadcasts),await pages[1].evaluate(()=>state.cleanup.broadcasts));assert(await pages[1].locator('.trading-dialog').isVisible());assert.equal(await frames[1].evaluate(()=>getDisplayBoard()),2);
 await frames[0].waitForFunction(()=>document.querySelector('.cleanup-bot-bubble')?.textContent.includes('Host requested priority'),{timeout:15000});
 const box=await frames[0].locator('.cleanup-bot-bubble').boundingBox();assert(box.width>100);fs.mkdirSync('/tmp/v03120-bot',{recursive:true});await pages[0].screenshot({path:'/tmp/v03120-bot/Bot-Broadcast.png'});
 await pages[1].locator('.trading-dialog>header').getByRole('button',{name:'Close',exact:true}).click();
 await frames[1].getByRole('button',{name:'Follow bot',exact:true}).click();await frames[1].waitForFunction(()=>getDisplayBoard()===0);
 // Exercise a cross-neighborhood teleport with reduced motion, then finish.
 for(const p of pages)await p.evaluate(()=>{stopRoomCatchup();feed?.close();feed=null;const s=structuredClone(state);s.cleanup.displayLocation=null;s.cleanup.board=1;s.cleanup.pos=0;s.cleanup.lastMove={id:'test-teleport',board:0,from:15,path:[0],pos:0};state=s;document.getElementById('boardFrame').contentWindow.postMessage({type:'MINI_SYNC',state:s},location.origin);});
 for(const f of frames)await f.waitForFunction(()=>getDisplayBoard()===1);
 // End a synthetic completed route to verify each browser restores its own saved preview.
 for(const p of pages)await p.evaluate(()=>{stopRoomCatchup();feed?.close();feed=null;const s=structuredClone(state);s.cleanup.active=false;s.cleanup.displayLocation=null;s.cleanup.lastMove=null;state=s;document.getElementById('boardFrame').contentWindow.postMessage({type:'MINI_SYNC',state:s},location.origin);});
 await frames[0].waitForFunction(()=>getDisplayBoard()===2,{timeout:15000});await frames[1].waitForFunction(()=>getDisplayBoard()===2,{timeout:15000});
 assert.deepEqual(errors,[]);console.log(JSON.stringify({bothPlayersFollow:true,sharedMessages:true,priorityBuyerAndDestination:true,stopFollowing:true,dialogPreserved:true,restorePreviousView:true,errors}));
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{await browser?.close();await g?.close();});
