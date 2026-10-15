'use strict';
const test=require('node:test'), assert=require('node:assert/strict'), fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'public/index.html'),'utf8');
const styles=fs.readFileSync(path.join(root,'public/styles.css'),'utf8');
const app=fs.readFileSync(path.join(root,'public/app.js'),'utf8');
const board=fs.readFileSync(path.join(root,'public/board-v5-42.html'),'utf8');
test('compact and focus layouts have visible controls and a live iframe',()=>{
 assert.match(html,/PROTOTYPE v0\.3\.12/);
 for(const id of ['focusButton','turnPanel','compactRoll','resetTurnPanelButton','inviteDetails','activityDetails','boardFrame','rollButton','endButton']) assert.ok(html.includes('id="'+id+'"'),id);
 assert.match(styles,/body\.in-game \.session-layout\{grid-template-columns:194px/);
 assert.match(styles,/body\.board-focus \.room-sidebar\{display:none/);
 assert.match(styles,/height:calc\(100dvh - 108px\)/);
 assert.match(app,/function setBoardFocus\(focus\)/);
 assert.match(app,/el\('compactRoll'\)\.onclick/);
 assert.ok(!html.includes('id="focusRollButton"')&&!html.includes('id="focusEndButton"'),'one set of turn controls serves normal and full-board views');
 assert.match(app,/MINI_LAYOUT_MODE/);
});
test('embedded world board remains same artwork with tabs and laptop fit',()=>{
 assert.match(board,/data-mini-aux-target="perks"/);
 assert.match(board,/data-mini-aux-target="log"/);
 assert.match(board,/data-mini-aux-target="worlds"/);
 assert.match(board,/html\.mini-wifi-board-focus \.control-rail/);
 assert.match(board,/calc\(\(100dvh - 34px\)\*1\.09\)/);
 for(const cls of ['mini-go-card','mini519-richmond','miniWifiAnimateDiceThenMove','miniWifiRevealSpecial']) assert.ok(board.includes(cls),cls);
});
