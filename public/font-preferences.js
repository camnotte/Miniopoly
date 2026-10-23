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
  let selected=valid(read().font),effective='nunito';
  const available=new Set(['nunito']),listeners=new Set(),controls=new Set();
  function details(){return {value:selected,effective,family:choices.find(choice=>choice.value===effective).family};}
  function refreshControls(){
    for(const select of controls){
      for(const option of select.options){
        const choice=choices.find(choice=>choice.value===option.value);
        option.disabled=!available.has(choice.value);
        option.textContent=choice.label+(choice.value==='apple-chancery'&&!available.has(choice.value)?' · Not installed':'');
      }
      select.value=effective;
      const help=select.closest('[data-font-setting]')?.querySelector('[data-font-help]');
      if(help)help.textContent=!available.has('apple-chancery')?'Applies only to this browser. Apple Chancery requires the font to be installed on this device.':'Applies only to this browser. Your choice is remembered for future games.';
    }
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
  const ready=Promise.all(choices.filter(choice=>choice.value!=='nunito').map(async choice=>{
    try{const faces=await document.fonts.load('16px '+JSON.stringify(choice.family));if(faces.some(face=>face.status==='loaded'))available.add(choice.value);}catch{}
  })).then(()=>{apply();return details();});
  async function setPreference(value){
    await ready;
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
    refreshControls();
  }
  window.MiniopolyFontPreferences=Object.freeze({
    ready,bindControls,setPreference,getPreference:()=>selected,getEffective:()=>effective,
    canvasFamily:()=>JSON.stringify(choices.find(choice=>choice.value===effective).family)+', Nunito, sans-serif',
    subscribe(listener){listeners.add(listener);return()=>listeners.delete(listener);}
  });
  window.addEventListener('storage',event=>{if(event.key===KEY||event.key===null){selected=valid(read().font);apply();}});
  apply();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>bindControls());else bindControls();
})();
