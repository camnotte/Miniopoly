/* Keep the host's avatar preference across Local and Online game addresses. */
(() => {
 'use strict';
 const storageKey='miniopoly_avatar_default_key_v1';
 let key='';
 try{
  const fragment=new URLSearchParams(location.hash.slice(1)),incoming=fragment.get('avatarProfile');
  if(incoming&&/^[a-f0-9]{64}$/.test(incoming)){
   key=incoming;try{localStorage.setItem(storageKey,incoming);}catch{}
  }
  if(fragment.has('avatarProfile')){
   fragment.delete('avatarProfile');const rest=fragment.toString();
   history.replaceState(history.state,'',location.pathname+location.search+(rest?'#'+rest:''));
  }
  if(!key)key=localStorage.getItem(storageKey)||'';
 }catch{}
 const enabled=/^[a-f0-9]{64}$/.test(key);
 async function request(profile){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),5000);
  try{
   const response=await fetch('/api/avatar-default',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({key,...(profile===undefined?{}:{profile})}),signal:controller.signal});
   const value=await response.json();if(!response.ok)throw Error(value.error||'Could not remember your avatar.');return value.profile;
  }finally{clearTimeout(timer);}
 }
 let writes=Promise.resolve();
 window.MiniopolyAvatarDefault={enabled,load:()=>enabled?request():Promise.resolve(null),save(profile){
  if(!enabled)return Promise.resolve();
  writes=writes.catch(()=>{}).then(()=>request(profile));return writes;
 }};
})();
