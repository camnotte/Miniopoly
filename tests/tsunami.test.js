'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{WaveTracker,tileStatus}=require('../public/tsunami'),view=require('../public/express-view');
function room(wave=0){return {code:'ABC234',matchId:'match',stage:'playing',gameMode:'countdown',round:10+wave,rounds:10,owned:{'0-1':{owner:0,level:2}},collapse:{wave,lost:{},endangered:['0-1'],shieldSpent:{}}};}
test('a tsunami plays only once for a new authoritative wave, never for reconnects, old snapshots or world switches',()=>{
 const t=new WaveTracker(),r=room();assert.equal(t.update(r),false);r.collapse.wave=1;assert.equal(t.update(r),true);assert.equal(t.update(structuredClone(r)),false);assert.equal(t.update(room(0)),false);r.collapse.wave=2;r.stage='finished';assert.equal(t.update(r),true);assert.equal(t.update(r),false);
 const resumed=new WaveTracker();assert.equal(resumed.update(r),false);r.matchId='rematch';r.stage='playing';r.collapse.wave=0;assert.equal(t.update(r),false);r.collapse.wave=1;assert.equal(t.update(r),true);r.gameMode='express';assert.equal(t.update(r),false);
});
test('water labels reflect host protection and submersion without changing ownership, shields, money or rules',()=>{
 const r=room(),before=structuredClone(r);assert.match(tileStatus(r,'0-1').label,/FLOOD PROTECTED/);assert.deepEqual(r,before);r.collapse.shieldSpent['0-1']=true;assert.equal(tileStatus(r,'0-1').label,'NEXT WAVE');r.collapse.lost['0-1']=1;assert.equal(tileStatus(r,'0-1').label,'SUBMERGED · SAFE');assert.equal(tileStatus(r,'0-3'),null);r.gameMode='express';assert.equal(tileStatus(r,'0-1'),null);
});
test('Tsunami warns about water and survival while World Collapse keeps earthquake and portal rules',()=>{
 for(let round=6;round<=10;round++){const r=room();r.round=round;const s=view.stage(r);assert(s.warning>0);assert(!/crack|rumbl|earthquake|void/i.test(s.title+s.hint));assert.match(s.hint,/tsunami/);}
 const r=room(2);assert.match(view.stage(r).title,/Tsunami · Wave 2/);assert.match(view.stage(r).hint,/flood protection/);r.gameMode='express';assert.match(view.stage(r).hint,/portal/);
});
test('seawall impact tracks actual shield spending once across worlds, renders, resets and reloads',()=>{
 const {ProtectionTracker}=require('../public/tsunami'),t=new ProtectionTracker(),r=room();
 r.owned['2-3']={owner:1,level:1};assert.deepEqual(t.update(r),[]);
 const before=structuredClone(r);assert.deepEqual(t.update(r),[]);assert.deepEqual(r,before);
 r.collapse.wave=1;r.collapse.shieldSpent['2-3']=true;r.owned['2-3'].level=0;
 assert.deepEqual(t.update(r),['2-3']);assert.deepEqual(t.update(structuredClone(r)),[]);
 assert.deepEqual(t.update(before),[]);assert.deepEqual(t.update(r),[]);
 // Fresh loads and a changed match do not replay an old wall breaking.
 assert.deepEqual(new ProtectionTracker().update(r),[]);r.matchId='rematch';assert.deepEqual(t.update(r),[]);
 r.gameMode='express';assert.deepEqual(t.update(r),[]);r.gameMode='classic';assert.deepEqual(t.update(r),[]);
});
test('selling a protected home or re-upgrading a spent shield does not create a seawall impact',()=>{
 const {ProtectionTracker}=require('../public/tsunami'),t=new ProtectionTracker(),r=room();t.update(r);
 delete r.owned['0-1'];assert.deepEqual(t.update(r),[]);r.collapse.wave=1;assert.deepEqual(t.update(r),[]);
 r.owned['0-1']={owner:0,level:3};r.collapse.shieldSpent['0-1']=true;assert.deepEqual(t.update(r),[]);
 r.collapse.wave=2;assert.deepEqual(t.update(r),[]);assert.equal(require('../public/tsunami').hasProtection(r,'0-1'),false);
});
test('a board can initialize before its first room snapshot arrives',()=>{
 const board={dataset:{world:'0'},classList:{toggle(){}},querySelector(){return null},querySelectorAll(){return []}};
 assert.doesNotThrow(()=>require('../public/tsunami').decorateBoard(board,null));
});
