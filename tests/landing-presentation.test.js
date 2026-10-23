'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const view=require('../public/landing-presentation');
function rooms(){
 const before={code:'ROOMAA',matchId:'match',stage:'playing',turn:0,lastRoll:null,players:[{id:'a',cash:1500,worth:1500,deeds:0,perks:[]},{id:'b',cash:1500,worth:1500,deeds:0,perks:[]}],log:['Previous turn']};
 const after=structuredClone(before);after.lastRoll={at:123,playerId:'a',value:4};after.players[0].cash+=50;after.players[0].worth+=50;after.players[0].perks=['building'];after.players[0].pos=4;after.log=['Found a lost wallet reward (+$50)',...before.log];
 return {before,after};
}
test('cash, net worth, perks and activity stay at previous values during movement without mutating authoritative state',()=>{
 const {before,after}=rooms(),copy=structuredClone(after),hold=view.capture(before,after),shown=view.project(after,hold);
 assert.equal(shown.players[0].cash,1500);assert.equal(shown.players[0].worth,1500);assert.deepEqual(shown.players[0].perks,[]);assert.deepEqual(shown.log,before.log);assert.equal(shown.players[0].pos,4,'Server destination stays intact');assert.deepEqual(after,copy);
 assert.ok(view.arrived(after,hold,{rollAt:123,playerId:'a'}));assert.equal(view.project(after,null).players[0].worth,1550);
});
test('chat/presence snapshots preserve a current financial hold and update connection metadata',()=>{
 const {before,after}=rooms(),hold=view.capture(before,after);after.revision=55;after.players[1].connected=true;after.chat=[{text:'Hi'}];const shown=view.project(after,hold);assert.equal(shown.players[0].cash,1500);assert.equal(shown.players[1].connected,true);assert.equal(shown.chat[0].text,'Hi');assert.equal(shown.revision,55);
});
test('stale arrival messages cannot release another roll, player, room or rematch',()=>{
 const {before,after}=rooms(),hold=view.capture(before,after);
 for(const event of [{rollAt:122,playerId:'a'},{rollAt:123,playerId:'b'}])assert.equal(view.arrived(after,hold,event),false);
 for(const change of [{code:'OTHER'},{matchId:'new-match'},{turn:1},{stage:'finished'},{lastRoll:{at:124,playerId:'a'}}]){const incoming={...after,...change};assert.equal(view.project(incoming,hold),incoming);assert.equal(view.arrived(incoming,hold,{rollAt:123,playerId:'a'}),false);}
});
test('world badges keep each player’s prior world through a shift or gravity pull, then reveal together on arrival',()=>{
 const {before,after}=rooms();before.players[0].board=0;before.players[1].board=2;
 after.players[0].board=1;after.players[1].board=1;
 const hold=view.capture(before,after),copy=structuredClone(after);
 assert.deepEqual(after.players.map(p=>view.worldForPlayer(after,hold,p)),[0,2]);
 assert.deepEqual(after.players.map(p=>view.worldForPlayer(after,null,p)),[1,1]);
 assert.deepEqual(after,copy,'Displayed worlds must not overwrite authoritative positions');
 const nextTurn={...after,turn:1};
 assert.deepEqual(nextTurn.players.map(p=>view.worldForPlayer(nextTurn,hold,p)),[1,1],'A stale hold cannot hide another turn’s world');
});

function artwork(){
 const fallback={hidden:false},images=[];
 const document={createElement(){
   const image={ownerDocument:document,hidden:true,naturalWidth:100,classList:{toggle(){}},removeAttribute(name){delete this[name];},replaceWith(){}};
   image.decode=()=>new Promise(resolve=>{image.finishDecode=resolve;});images.push(image);return image;
 }};
 const image=document.createElement('img');image.id='modalArt';return {view:new view.Artwork(image,fallback),images,fallback};
}
test('a replacement landing uses fresh hidden artwork until it has loaded and decoded, never the old player’s bitmap',async()=>{
 const {view:art,fallback}=artwork();
 art.show({key:'player-1:roll-1',source:'old-property',alt:'Old property'});
 const old=art.image,loaded=old.onload();old.finishDecode();await loaded;assert.equal(old.hidden,false);
 art.show({key:'player-2:roll-2',source:'new-property',alt:'New property'});
 const next=art.image;assert.notEqual(next,old);assert.equal(next.hidden,true);assert.equal(fallback.hidden,false);
 const loading=next.onload();assert.equal(next.hidden,true,'The new bitmap is still decoding');
 art.show({key:'player-2:roll-2',source:'new-property',alt:'New property'});assert.equal(art.image,next,'Chat and art refreshes must not restart loading');
 next.finishDecode();await loading;assert.equal(next.hidden,false);assert.equal(fallback.hidden,true);
});
test('late loads from another landing or a closed popup cannot replace the current artwork',async()=>{
 const {view:art,fallback}=artwork();
 art.show({key:'a',source:'old',alt:'Old'});const old=art.image,loading=old.onload();
 art.show({key:'b',source:'new',alt:'New'});old.finishDecode();await loading;
 assert.equal(art.image.hidden,true);assert.equal(fallback.hidden,false);
 const current=art.image,pending=current.onload();art.clear();current.finishDecode();await pending;
 assert.equal(current.hidden,true);assert.equal(fallback.hidden,false);
 art.show({key:'c',source:'broken',alt:'Broken'});art.image.onerror();assert.equal(art.image.hidden,true);assert.equal(fallback.hidden,false);
 art.show({key:'d',source:null,alt:'Waiting'});assert.equal(art.current,null);
});
test('authenticated viewer identity stays separate from the active player and held finances',()=>{
 const {before,after}=rooms();before.youId=after.youId='a';before.players[0].name=after.players[0].name='Dell PC';before.players[1].name=after.players[1].name='MacBook';
 before.players[0].cash=1500;before.players[1].cash=700;after.players[0].cash=900;after.players[1].cash=1500;
 const hold=view.capture(before,after),copy=structuredClone(after);
 assert.equal(view.project(after,hold).players[0].cash,1500,'Movement presentation may hold an earlier balance');
 assert.equal(view.viewer(after).name,'Dell PC');assert.equal(view.viewer(after).cash,900,'Authentication resolves the current viewer record, not an animation-held value');
 const other={...after,youId:'b',players:[...after.players].reverse()};assert.equal(view.viewer(other).name,'MacBook');assert.equal(view.viewer(other).cash,1500);
 assert.deepEqual(after,copy);
});
test('missing or ambiguous viewer identity never falls back to the roller or first player',()=>{
 const {after}=rooms();assert.equal(view.viewer(after),null);assert.equal(view.viewer({...after,youId:'unknown'}),null);
 assert.equal(view.viewer({...after,youId:'a',players:[after.players[0],{...after.players[0],cash:9876}]}),null);
 assert.equal(view.viewer(null),null);
});

test('minimizing a watched landing survives payment/card phases and live refreshes but never hides a new turn or your own decision',()=>{
 const watch=new view.WatchState(),{after}=rooms();after.youId='b';after.turnNumber=4;
 assert.equal(watch.sync(after,false),false);watch.minimize();assert.equal(watch.sync({...after,phase:'post',revision:40},false),true);
 watch.restore();assert.equal(watch.sync(after,false),false);watch.minimize();assert.equal(watch.sync({...after,lastRoll:{...after.lastRoll,at:124}},false),false);
 watch.minimize();assert.equal(watch.sync(after,true),false);
 for(const change of [{code:'OTHER'},{matchId:'rematch'},{turnNumber:5},{youId:'a'},{stage:'finished'}]){watch.sync(after,false);watch.minimize();assert.equal(watch.sync({...after,...change},false),false);}
 watch.sync(after,false);watch.minimize();assert.equal(watch.sync(null,false),false);
});
