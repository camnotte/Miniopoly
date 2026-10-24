/* A browser preference only: fonts never change shared match rules or scores. */
(()=>{
  'use strict';
  const KEY='miniopoly_personal_options_v1';
  const choices=[
    {value:'nunito',label:'Nunito',family:'Nunito'},
    {value:'apple-chancery',label:'Apple Chancery',family:'Miniopoly Apple Chancery'},
    {value:'american-captain',label:'American Captain',family:'Miniopoly American Captain'}
  ];
  const valid=value=>choices.some(choice=>choice.value===value)?value:'nunito';
  function read(){try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');return saved&&typeof saved==='object'&&!Array.isArray(saved)?saved:{};}catch{return {};}}
  let selected=valid(read().font),effective='nunito',appleFamily='Miniopoly Apple Chancery',checking=false,pendingCheck;
  const available=new Set(['nunito']),listeners=new Set(),controls=new Set(),rechecks=new Set();
  function details(){return {value:selected,effective,family:effective==='apple-chancery'?appleFamily:choices.find(choice=>choice.value===effective).family};}
  // Native system fonts do not always appear as FontFace objects. Verify that
  // the requested face renders identically with two different fallback fonts.
  function rendersSystemFont(family){
    try{
      const context=document.createElement('canvas').getContext('2d');if(!context)return false;
      const measure=(font,text)=>{context.font='72px '+font;return context.measureText(text).width;};
      return ['mmmmWWlli0123456789','CHAMPION Game night'].every(text=>{
        const mono=measure('monospace',text),serif=measure('serif',text);
        const faceMono=measure(JSON.stringify(family)+', monospace',text),faceSerif=measure(JSON.stringify(family)+', serif',text);
        const missingMono=measure('"Miniopoly Missing Font Reference f8b246", monospace',text),missingSerif=measure('"Miniopoly Missing Font Reference f8b246", serif',text);
        return Math.abs(faceMono-faceSerif)<.1&&(Math.abs(faceMono-mono)>.5||Math.abs(faceSerif-serif)>.5)&&(Math.abs(faceMono-missingMono)>.5||Math.abs(faceSerif-missingSerif)>.5);
      });
    }catch{return false;}
  }
  function refreshControls(){
    for(const select of controls){
      for(const option of select.options){
        const choice=choices.find(choice=>choice.value===option.value);
        option.disabled=!available.has(choice.value);
        option.textContent=choice.label+(choice.value==='apple-chancery'&&!available.has(choice.value)?(checking?' · Checking…':' · Unavailable in this browser'):'');
      }
      select.value=effective;
      const help=select.closest('[data-font-setting]')?.querySelector('[data-font-help]');
      if(help)help.textContent=checking?'Checking available fonts…':!available.has('apple-chancery')?'Apple Chancery could not be accessed by this browser. On a Mac, enable it in Font Book and restart the browser, then check again.':'Applies only to this browser. Your choice is remembered for future games.';
    }
    for(const button of rechecks){button.disabled=checking;button.textContent=checking?'Checking fonts…':'Check fonts again';}
  }
  function apply(){
    effective=available.has(selected)?selected:'nunito';
    const {family}=details();
    document.documentElement.dataset.miniopolyFont=effective;
    document.documentElement.style.setProperty('--miniopoly-ui-font',JSON.stringify(family));
    refreshControls();
    for(const listener of listeners)listener(selected);
    window.dispatchEvent(new CustomEvent('miniopoly-font-change',{detail:details()}));
  }
  function checkFonts(){
    if(pendingCheck)return pendingCheck;
    checking=true;refreshControls();
    pendingCheck=Promise.all(choices.filter(choice=>choice.value!=='nunito').map(async choice=>{
      let loaded=false;
      try{const faces=await document.fonts.load('16px '+JSON.stringify(choice.family));loaded=faces.some(face=>face.status==='loaded');}catch{}
      if(choice.value==='apple-chancery'){
        appleFamily='Miniopoly Apple Chancery';
        if(!loaded){
          await document.fonts?.ready;
          const systemFamily=['Apple Chancery','Apple-Chancery','AppleChancery','Apple Chancery Regular'].find(rendersSystemFont);
          if(systemFamily){appleFamily=systemFamily;loaded=true;}
        }
      }
      if(loaded)available.add(choice.value);else available.delete(choice.value);
    })).then(()=>{checking=false;apply();return details();}).finally(()=>{pendingCheck=null;});
    return pendingCheck;
  }
  const ready=checkFonts();
  async function setPreference(value){
    await (pendingCheck||ready);
    if(!choices.some(choice=>choice.value===value)||!available.has(value))return false;
    selected=value;
    try{localStorage.setItem(KEY,JSON.stringify({...read(),font:selected}));}catch{}
    apply();return true;
  }
  function bindControls(root=document){
    for(const select of root.querySelectorAll('[data-font-preference]')){
      if(controls.has(select))continue;
      select.replaceChildren(...choices.map(choice=>{
        const option=document.createElement('option');option.value=choice.value;option.textContent=choice.label;return option;
      }));
      controls.add(select);
      select.addEventListener('change',()=>{void setPreference(select.value).then(changed=>{if(!changed)refreshControls();});});
    }
    for(const button of root.querySelectorAll('[data-font-recheck]')){
      if(rechecks.has(button))continue;
      rechecks.add(button);button.addEventListener('click',()=>{void checkFonts();});
    }
    refreshControls();
  }
  window.MiniopolyFontPreferences=Object.freeze({
    ready,bindControls,setPreference,checkFonts,getPreference:()=>selected,getEffective:()=>effective,
    canvasFamily:()=>JSON.stringify(details().family)+', Nunito, sans-serif',
    subscribe(listener){listeners.add(listener);return()=>listeners.delete(listener);}
  });
  window.addEventListener('storage',event=>{if(event.key===KEY||event.key===null){selected=valid(read().font);apply();}});
  apply();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>bindControls());else bindControls();
})();
