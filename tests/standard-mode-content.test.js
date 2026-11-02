'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),inspection=require('../public/property-inspection'),advisor=require('../public/player-advisor'),helper=require('../public/player-helper'),{deeds}=require('../game-data.json');
const words=/tsunami|disaster|flood|submerged|wave shield|wave path/i;
function room(){return {code:'CLASSIC',matchId:'match',gameMode:'classic',stage:'playing',phase:'roll',round:1,rounds:10,turn:0,turnNumber:0,youId:'a',players:[{id:'a',seat:0,name:'A',cash:1500,perks:[]},{id:'b',seat:1,name:'B',cash:1500,perks:[]}],owned:{'0-1':{owner:0,level:1},'0-6':{owner:0,level:1},'0-2':{owner:1,level:1}},collapse:null};}
test('Standard property details omit protection and disaster notes for homes, utilities and railroads',()=>{
 const r=room();for(const id of ['0-1','0-6','0-2']){assert.doesNotMatch(inspection.html(r,deeds,id),words);assert.equal(inspection.model(r,deeds,id).protection,'');assert(!inspection.html(r,deeds,id).includes('inspection-protection'));}
 assert.equal(inspection.model(r,deeds,'0-6').rows[1].rate,6);assert.equal(inspection.model(r,deeds,'0-1').currentRent,12);
});
test('Tsunami keeps its protection details and flood statuses',()=>{
 const r=room();r.gameMode='countdown';r.collapse={wave:1,lost:{},shieldSpent:{},temporary:{}};assert.match(inspection.html(r,deeds,'0-1'),/Protected/);assert(inspection.model(r,deeds,'0-6').protected);r.collapse.shieldSpent['0-6']=true;assert.match(inspection.html(r,deeds,'0-6'),/Unprotected/);
});
test('Standard lobby advice and helper tips remain mode-specific even with leftover disaster metadata',()=>{
 const r=room();r.stage='lobby';assert.doesNotMatch(JSON.stringify(advisor.advise(r,deeds)),words);r.stage='playing';r.collapse={wave:3,auction:{id:'auction'},lost:{'0-1':3},calm:true};const tip=helper.helperTip(r,deeds);assert.doesNotMatch(JSON.stringify(tip),words);assert.notEqual(tip.action,'storm');assert.notEqual(tip.action,'path');assert.notEqual(tip.action,'rebuild');
});
