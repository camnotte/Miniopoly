/* Release identity stays visible as views, overlays and launcher pages change. */
(()=>{
  'use strict';
  const version='0.3.68';
  document.title=document.title.replace(/\bv\d+\.\d+\.\d+\b/g,'v'+version);
  window.MiniopolyBuildInfo=Object.freeze({version});
  // The parent game owns the badge when this board is embedded.
  if(window.self!==window.top)return;
  const style=document.createElement('style');
  style.textContent=`.miniopoly-build-version{position:fixed;right:max(8px,env(safe-area-inset-right));bottom:max(5px,env(safe-area-inset-bottom));z-index:2147483647;box-sizing:border-box;display:block;width:max-content;max-width:calc(100vw - 16px);padding:3px 7px;border:1px solid #82968b;border-radius:6px;background:#fff9eb;color:#234b41;font:700 11px/1.3 system-ui,sans-serif;letter-spacing:normal;text-transform:none;white-space:nowrap;pointer-events:none;box-shadow:0 1px 3px #102a4226}dialog .miniopoly-build-version{position:sticky;bottom:0;margin:10px 0 0 auto}@media print{.miniopoly-build-version{position:static;margin:8px 0 0 auto}}`;
  document.head.append(style);
  function badge(container){
    if(container.querySelector(':scope > .miniopoly-build-version'))return;
    const label=document.createElement('small');label.className='miniopoly-build-version';
    label.textContent='Miniopoly v'+version;label.setAttribute('aria-label','Game version '+version);
    container.append(label);
  }
  function refresh(){badge(document.body);for(const dialog of document.querySelectorAll('dialog'))badge(dialog);}
  function start(){refresh();new MutationObserver(refresh).observe(document.body,{childList:true,subtree:true});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
