'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const net=require('node:net');
const vm=require('node:vm');
const {spawn}=require('node:child_process');
const ROOT=path.join(__dirname,'..');

test('all three illustrated worlds load through the real server without exposing private files',async()=>{
  const socket=net.createServer();
  await new Promise(resolve=>socket.listen(0,'127.0.0.1',resolve));
  const port=socket.address().port;
  await new Promise(resolve=>socket.close(resolve));
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'miniopoly-art-'));
  const child=spawn(process.execPath,['server.js'],{
    cwd:ROOT,env:{...process.env,HOST:'127.0.0.1',PORT:String(port),DATA_DIR:dir},
    stdio:'ignore'
  });
  const base='http://127.0.0.1:'+port;
  try{
    let ready=false;
    for(let attempt=0;attempt<100;attempt++){
      if(child.exitCode!==null)throw Error('Graphics test server exited early');
      try{ready=(await fetch(base+'/api/network')).ok;}catch{}
      if(ready)break;
      await new Promise(resolve=>setTimeout(resolve,40));
    }
    assert.ok(ready,'the graphics test server started');
    const context={window:{}};
    vm.runInNewContext(fs.readFileSync(path.join(ROOT,'public/storybook.js'),'utf8'),context);
    const {propertyArt,worldScenery}=context.window.MiniopolyVisuals;
    const deeds=require('../game-data.json').deeds;
    const houses=deeds.filter(d=>d.type==='p');
    assert.equal(new Set(houses.map(d=>propertyArt(d.id))).size,22,'each house has distinct art across worlds');
    for(const deed of houses){
      const response=await fetch(base+propertyArt(deed.id));
      assert.equal(response.status,200,deed.name);
      assert.match(response.headers.get('content-type'),/^image\/svg\+xml/);
      const svg=await response.text();
      assert.match(svg,/<svg[\s\S]*<title[^>]*>/);
      const fragment=propertyArt(deed.id).split('#')[1];
      assert.ok(svg.includes('<view id="'+fragment+'"'),deed.name+' has an atlas view');
      assert.equal(response.headers.get('x-content-type-options'),'nosniff');
    }
    for(const deed of deeds.filter(d=>d.type!=='p'))assert.equal(propertyArt(deed.id),'');
    for(const id of ['9-1','0-99','__proto__','toString',null,undefined])assert.equal(propertyArt(id),'');
    assert.equal(new Set([0,1,2].map(i=>worldScenery(i).centerArt)).size,3,'each world has its own center');
    for(const world of [0,1,2]){
      const response=await fetch(base+worldScenery(world).centerArt);
      assert.equal(response.status,200,'world '+world+' center');
      assert.match(response.headers.get('content-type'),/^image\/svg\+xml/);
      assert.match(await response.text(),/<svg[\s\S]*<title[^>]*>/);
    }
    for(const world of [-1,3,1.5,'1',null])assert.equal(worldScenery(world),null);
    for(const font of ['fredoka','nunito']){
      const response=await fetch(base+'/fonts/'+font+'.ttf');
      assert.equal(response.status,200,font);
      assert.equal(response.headers.get('content-type'),'font/ttf');
      const bytes=Buffer.from(await response.arrayBuffer());
      assert.equal(bytes.readUInt32BE(0),0x00010000,'valid TrueType font');
    }
    const starResponse=await fetch(base+'/art/icons/upgrade-star.png');
    assert.equal(starResponse.status,200);
    assert.equal(starResponse.headers.get('content-type'),'image/png');
    const starBytes=Buffer.from(await starResponse.arrayBuffer());
    const boardSource=fs.readFileSync(path.join(ROOT,'public/board-v5-42.html'),'utf8');
    const originalStar=JSON.parse(boardSource.split('\n').find(line=>line.startsWith('const MINI_V52_STAR=')).slice('const MINI_V52_STAR='.length).replace(/;$/, ''));
    assert.deepEqual(starBytes,Buffer.from(originalStar.split(',')[1],'base64'),'deed collection uses the exact original Design Lab star');
    for(const route of ['/review','/review.css','/review.js','/review-board.js','/turn-panel-preview','/turn-panel-preview.css','/turn-panel-preview.js','/turn-panel-board.css','/floating-panel.css','/floating-panel.js','/live-panel.css','/storybook-board.css','/storybook-shell.css','/storybook.js','/art/richmond/marsh.svg',
      ...fs.readdirSync(path.join(ROOT,'public/art/icons')).map(name=>'/art/icons/'+name)]){
      const response=await fetch(base+route);
      assert.equal(response.status,200,route);
      assert.notEqual(response.headers.get('content-type'),'application/json');
      assert.ok((await response.text()).length>100);
    }
    for(const route of ['/server.js','/game-data.json','/saves/rooms.json','/art/richmond/missing.svg','/art/communities/missing.svg','/art/coastal/missing.svg','/art/coastal/../../server.js']){
      assert.equal((await fetch(base+route)).status,404,route);
    }
  }finally{
    if(child.exitCode===null&&child.signalCode===null){
      await new Promise(resolve=>{child.once('exit',resolve);child.kill();});
    }
    fs.rmSync(dir,{recursive:true,force:true});
  }
});
