'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {startConnectionTest,MESSAGE,MAX_DURATION}=require('../scripts/connection-test');

test('connection diagnostic serves fixed text, rejects other paths/methods, and stops automatically',async()=>{
  const server=startConnectionTest({host:'127.0.0.1',port:0,durationMs:2000});
  await new Promise((resolve,reject)=>{server.once('listening',resolve);server.once('error',reject);});
  const base='http://127.0.0.1:'+server.address().port;
  try{
    const home=await fetch(base);assert.equal(home.status,200);assert.equal(await home.text(),MESSAGE);
    const head=await fetch(base,{method:'HEAD'});assert.equal(head.status,200);assert.equal(await head.text(),'');
    for(const path of ['/server.js','/saves/rooms.json','/../server.js','/api/create']){
      const response=await fetch(base+path);assert.equal(response.status,404);assert.equal(await response.text(),'Not found.\n');
    }
    const post=await fetch(base,{method:'POST',body:'unused'});assert.equal(post.status,405);
    const stopped=new Promise(resolve=>server.once('close',resolve));await stopped;
    assert.equal(server.listening,false);await assert.rejects(fetch(base));
  }finally{if(server.listening)server.stopConnectionTest();}
});

test('connection diagnostic has a ten-minute maximum and can be stopped early',async()=>{
  assert.throws(()=>startConnectionTest({durationMs:MAX_DURATION+1}),/ten minutes/);
  const server=startConnectionTest({host:'127.0.0.1',port:0});
  await new Promise((resolve,reject)=>{server.once('listening',resolve);server.once('error',reject);});
  const closed=new Promise(resolve=>server.once('close',resolve));server.stopConnectionTest();await closed;
  assert.equal(server.listening,false);
});
