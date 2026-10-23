'use strict';
// Runs only inside the host's dedicated desktop browser profile, never on guest game pages.
(() => {
 const query=new URLSearchParams(location.search);
 if(query.get('desktop')==='1')sessionStorage.setItem('miniopoly_desktop_launcher','1');
 if(sessionStorage.getItem('miniopoly_desktop_launcher')!=='1')return;
 window.MiniopolyDesktopLauncher=true;
 let reading=false;
 async function poll(){
  const token=sessionStorage.getItem('miniopoly_host_console');if(!token||reading)return;reading=true;
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),3000);
  try{const response=await fetch('/api/launcher/navigation',{headers:{Authorization:'Bearer '+token},signal:controller.signal});if(!response.ok)return;
   const value=await response.json(),prior=Number(sessionStorage.getItem('miniopoly_launcher_navigation')||0);
   if(value.revision>prior&&['/#home','/#saves','/#learn','/#ranks','/#host','/setup'].includes(value.target)){
    sessionStorage.setItem('miniopoly_launcher_navigation',String(value.revision));
    if(location.pathname+location.hash!==value.target)location.assign(value.target);
   }
  }catch{}finally{clearTimeout(timer);reading=false;}
 }
 setInterval(poll,1000);window.addEventListener('pageshow',poll);void poll();
})();
