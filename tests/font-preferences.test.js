'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../public/font-preferences.js'),'utf8');
const KEY='miniopoly_personal_options_v1';
function browsers(saved){
  const values=new Map(saved===undefined?[]:[[KEY,typeof saved==='string'?saved:JSON.stringify(saved)]]),instances=[];
  function open({apple=false,american=true}={}){
    const events=new Map(),styles=new Map(),window={};
    const localStorage={getItem:key=>values.get(key)??null,setItem(key,value){values.set(key,value);for(const other of instances)if(other.window!==window)other.emit('storage',{key});}};
    function emit(name,event){for(const listener of events.get(name)||[])listener(event);}
    window.addEventListener=(name,listener)=>{if(!events.has(name))events.set(name,[]);events.get(name).push(listener);};
    window.dispatchEvent=event=>emit(event.type,event);
    const document={readyState:'complete',querySelectorAll:()=>[],documentElement:{dataset:{},style:{setProperty:(name,value)=>styles.set(name,value)}},fonts:{async load(font){
      if(font.includes('American Captain')?american:apple)return [{status:'loaded'}];
      throw Error('Font is unavailable on this device');
    }}};
    const context={window,document,localStorage,CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail;}}};
    const instance={window,document,styles,context,emit};instances.push(instance);
    vm.runInNewContext(source,context);instance.api=window.MiniopolyFontPreferences;
    return instance;
  }
  return {open,stored:()=>JSON.parse(values.get(KEY)||'null')};
}
test('a saved font is restored and resolves to the bundled face without replacing other preferences',async()=>{
  const data={sound:false,volume:35,motion:'reduce',font:'american-captain'},group=browsers(data),page=group.open();
  await page.api.ready;
  assert.equal(page.api.getEffective(),'american-captain');
  assert.equal(page.document.documentElement.dataset.miniopolyFont,'american-captain');
  assert.equal(page.styles.get('--miniopoly-ui-font'),'"Miniopoly American Captain"');
  assert.deepEqual(group.stored(),data);
});
test('changing fonts preserves sound, volume and motion and rejects unavailable or unknown choices',async()=>{
  const group=browsers({sound:false,volume:25,motion:'reduce'}),page=group.open();await page.api.ready;
  assert.equal(await page.api.setPreference('american-captain'),true);
  assert.deepEqual(group.stored(),{sound:false,volume:25,motion:'reduce',font:'american-captain'});
  assert.equal(await page.api.setPreference('apple-chancery'),false);
  assert.equal(await page.api.setPreference('invented-font'),false);
  assert.equal(page.api.getEffective(),'american-captain');
  assert.equal(await page.api.setPreference('nunito'),true);
  assert.equal(page.api.getEffective(),'nunito');
});
test('an installed Apple Chancery face is selectable and is used for canvas text too',async()=>{
  const page=browsers().open({apple:true});await page.api.ready;
  assert.equal(await page.api.setPreference('apple-chancery'),true);
  assert.equal(page.api.getEffective(),'apple-chancery');
  assert.match(page.api.canvasFamily(),/^"Miniopoly Apple Chancery"/);
});
test('a board iframe or another game tab follows the browser font without requiring a room update',async()=>{
  const group=browsers(),parent=group.open(),board=group.open();await Promise.all([parent.api.ready,board.api.ready]);
  await parent.api.setPreference('american-captain');
  assert.equal(board.api.getEffective(),'american-captain');
  await board.api.setPreference('nunito');
  assert.equal(parent.api.getEffective(),'nunito');
});
test('malformed settings and missing fonts retain a usable default',async()=>{
  for(const saved of ['broken JSON','[]','null',JSON.stringify({font:'not-a-font'})]){
    const page=browsers(saved).open();await page.api.ready;assert.equal(page.api.getEffective(),'nunito');
  }
  const page=browsers({font:'apple-chancery'}).open();await page.api.ready;
  assert.equal(page.api.getEffective(),'nunito');
});
test('changing sound or volume after a font selection does not overwrite that font',async()=>{
  const group=browsers({sound:true,volume:100,motion:'system'}),page=group.open();await page.api.ready;await page.api.setPreference('american-captain');
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../public/game-options.js'),'utf8'),page.context);
  const ui=Object.create(page.window.MiniopolyGameOptions.prototype);
  Object.assign(ui,{personal:{sound:true,volume:100,motion:'system',font:'nunito'},personalControls(){},onPreferences(){}});
  ui.updatePersonal({volume:60});
  assert.equal(group.stored().font,'american-captain');assert.equal(group.stored().volume,60);
});
