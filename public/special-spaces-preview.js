'use strict';
// An artwork review only: no room, game action, or replacement GIF is created.
(() => {
  const root='/art/special-preview/';
  const samples=Object.freeze({
    rail:{name:'Coastal Express',category:'RAILROAD',idle:'rail-idle.png',active:'rail-active.gif',setting:'rail-setting',duration:2500,
      title:'A railway in its neighborhood.',description:'The existing crossing and its flashing lights sit in a small station setting with live oaks, tracks and marsh grass.',
      motion:'The original crossing GIF plays in both tiles. The new setting stays in place.',
      preserve:'Original crossing illustration and GIF preserved. Scenery and the tile frame are the proposed changes.',
      kicker:'Railroad',detail:'Available to buy or pass.'},
    chest:{name:'Community Chest',category:'COMMUNITY EVENT',idle:'chest-idle.png',active:'chest-active.gif',setting:'chest-setting',duration:2500,
      title:'The same chest, in a community garden.',description:'A sunlit courtyard connects the chest to the illustrated neighborhoods. The chest keeps the same size and position as its opening animation starts.',
      motion:'The original chest GIF plays in both tiles. The proposed tile aligns the closed chest before the lid opens.',
      preserve:'Original chest image and GIF preserved, including the opening lid and gold coins.',
      kicker:'Community Chest',detail:'A sample card is ready to review.'},
    setback:{name:'Setback',category:'PENALTY SPACE',idle:'setback.svg',active:null,setting:'setback-setting',duration:2100,
      title:'A detour beside the marsh.',description:'The original cone and detour sign sit on a neighborhood road. Setback currently has a static tile and an animated landing notice; this sample preserves that combination.',
      motion:'Setback has no tile GIF in the current game. Its original sign stays still while the existing landing notice shakes into view.',
      preserve:'Existing Setback sign and landing-notice motion preserved. This sample does not introduce a new Setback GIF.',
      kicker:'Setback Zone',detail:'Sample landing · review the Setback decision.'}
  });
  const el=id=>document.getElementById(id),cache=new Map(),gifCache=new Map();
  let kind='rail',sequence=0,timers=[],playURL=null;
  function imageSource(path){
    const [base,fragment]=path.split('#'),embedded=window.MINI_SPECIAL_EMBEDDED?.[base];
    if(!embedded)return path;
    if(!cache.has(base)){
      const binary=atob(embedded.data),bytes=new Uint8Array(binary.length);
      for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
      const blob=new Blob([bytes],{type:embedded.mime});cache.set(base,{blob,url:URL.createObjectURL(blob)});
    }
    return cache.get(base).url+(fragment?'#'+fragment:'');
  }
  async function gifBlob(path){
    if(!gifCache.has(path))gifCache.set(path,fetch(imageSource(path)).then(response=>{
      if(!response.ok)throw Error('Animation could not be loaded.');return response.blob();
    }));
    return gifCache.get(path);
  }
  function footer(proposed){
    const foot=document.createElement('div');foot.className='sample-footer';
    if(kind==='rail'){
      for(const [label,value] of [['PRICE','$200'],['RENT','$25+']]){
        const column=document.createElement('span'),small=document.createElement('small'),price=document.createElement('b');
        small.textContent=label;price.textContent=value;column.append(small,price);foot.append(column);
      }
    }else if(proposed)foot.textContent=kind==='chest'?'DRAW A CARD':'PENALTY SPACE';
    return foot;
  }
  function tile(node,proposed){
    const sample=samples[kind];node.dataset.kind=kind;node.classList.remove('is-landing','is-playing-gif');
    node.setAttribute('aria-label',(proposed?'Proposed ':'Current ')+sample.name+' artwork');
    const heading=document.createElement('div');heading.className='sample-title';heading.textContent=sample.name;
    const scene=document.createElement('div');scene.className='sample-scene';
    if(proposed){const bg=new Image();bg.className='scene-background';bg.alt='';bg.src=imageSource(root+'scenery.svg#'+sample.setting);scene.append(bg);}
    const object=new Image();object.className='special-object';object.alt=sample.name+' idle illustration';object.src=imageSource(root+sample.idle);scene.append(object);
    node.replaceChildren(heading,scene,footer(proposed));
  }
  function tiles(){tile(el('currentTile'),false);tile(el('proposedTile'),true);tile(el('contextTile'),true);}
  function clearPlayback(){
    sequence++;for(const timer of timers)clearTimeout(timer);timers=[];
    if(playURL){URL.revokeObjectURL(playURL);playURL=null;}
    el('landingNotice').hidden=true;el('landingNotice').classList.remove('animate');el('idleNotice').hidden=false;
    el('playLanding').disabled=false;
    for(const id of ['stepLand','stepAnimate','stepIdle'])el(id).classList.remove('active');
  }
  function showIdle(completed=false){
    clearPlayback();tiles();el('playbackState').textContent='Idle artwork';
    el('stepIdle').classList.add('active');
    if(completed)el('playbackAnnouncement').textContent='Landing playback complete. '+samples[kind].name+' returned to its idle artwork.';
  }
  function select(next){
    if(!Object.hasOwn(samples,next))return;
    kind=next;showIdle();const sample=samples[kind];
    for(const button of document.querySelectorAll('[data-sample]'))button.setAttribute('aria-pressed',String(button.dataset.sample===kind));
    el('sampleHeading').textContent=sample.name;el('sampleCategory').textContent=sample.category;
    el('designTitle').textContent=sample.title;el('designDescription').textContent=sample.description;
    el('motionDescription').textContent=sample.motion;el('preservationDescription').textContent=sample.preserve;
    el('noticeKicker').textContent=sample.kicker;el('noticeTitle').textContent=sample.name;el('noticeDetail').textContent=sample.detail;
    el('landingNotice').dataset.kind=kind;
  }
  async function play(){
    clearPlayback();tiles();const token=sequence,sample=samples[kind],animate=el('previewMotion').checked;
    el('playLanding').disabled=true;el('playbackState').textContent='Preparing landing…';
    try{
      let blob=null;if(sample.active&&animate)blob=await gifBlob(root+sample.active);
      if(token!==sequence)return;
      if(blob)playURL=URL.createObjectURL(new Blob([blob],{type:'image/gif'}));
      for(const id of ['currentTile','proposedTile','contextTile']){
        const target=el(id);target.classList.add('is-landing');
        if(playURL){target.classList.add('is-playing-gif');const object=target.querySelector('.special-object');object.src=playURL;object.alt=sample.name+' original landing GIF';}
      }
      el('stepIdle').classList.remove('active');el('stepLand').classList.add('active');el('stepAnimate').classList.add('active');
      el('playbackState').textContent=!animate?'Landing · still preview':sample.active?'Landing · original GIF':'Landing · existing notice';
      el('landingNotice').hidden=false;el('idleNotice').hidden=true;
      el('landingNotice').classList.toggle('animate',animate);
      el('playbackAnnouncement').textContent=sample.name+' landing preview. '+(!animate?'Motion disabled.':sample.active?'Playing the original GIF.':'Playing the existing landing notice.');
      timers.push(setTimeout(()=>{if(sequence===token){el('landingNotice').hidden=true;el('idleNotice').hidden=false;}},2100));
      timers.push(setTimeout(()=>{if(sequence===token)showIdle(true);},sample.duration));
    }catch(error){
      if(token!==sequence)return;
      showIdle();el('playbackState').textContent='Playback unavailable';el('playbackAnnouncement').textContent=error.message;
    }
  }
  for(const image of document.querySelectorAll('[data-property]'))image.src=imageSource('/art/richmond/neighborhoods.svg#'+image.dataset.property);
  for(const button of document.querySelectorAll('[data-sample]'))button.addEventListener('click',()=>select(button.dataset.sample));
  el('playLanding').addEventListener('click',play);el('showIdle').addEventListener('click',()=>showIdle());
  el('previewMotion').checked=!matchMedia('(prefers-reduced-motion: reduce)').matches;
  el('previewMotion').addEventListener('change',()=>showIdle());
  select(kind);
})();
