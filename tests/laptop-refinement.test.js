'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const dir=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(dir,p),'utf8');
const shell=read('public/index.html'), css=read('public/styles.css'), js=read('public/app.js'), board=read('public/board-v5-42.html');
test('single header, authoritative controls, and sound toggle',()=>{
 for(const key of ['id="gameSessionHead"','id="topbar"','id="wifiSoundButton"','id="rollButton"','id="endButton"','PROTOTYPE v'+require('../package.json').version])assert.ok(shell.includes(key),key);
 assert.match(js,/insertBefore\(sessionHead/);
 assert.match(js,/MINI_PLAYER_PREFERENCES/);
 assert.match(js,/MINI_WIFI_SOUND_STATE/);
});
test('laptop board/leaderboard group and stacked readable money',()=>{
 assert.match(board,/\.mini52-leader-row \.col-worth::before\{content:'NET WORTH'/);
 assert.match(board,/\.mini52-leader-row \.col-cash::before\{content:'CASH'/);
 assert.match(board,/\.control-rail\{display:none!important\}/);
 assert.match(board,/justify-content:center!important/);
 assert.match(css,/height:calc\(100dvh - 108px\)/);
});
test('spectator turn guidance only while roll is allowed for other player',()=>{
 assert.match(board,/st\?\.phase==='roll'/);
 assert.match(board,/mini-wifi-spectator/);
 assert.match(board,/WAITING FOR PLAYER TO ROLL/);
});
