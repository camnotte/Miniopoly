(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MiniopolyDevelopment=api;})(typeof window==='undefined'?globalThis:window,function(){
 'use strict';
 const names=['Houses','Chalets','Condos','Estates'];
 const normalize=value=>Math.max(0,Math.min(3,Math.floor(Number(value)||0)));
 const name=value=>names[normalize(value)];
 function art(value){
  const level=normalize(value),windows='<path d="M25 42h8v9h-8zm20 0h8v9h-8z" fill="#ffe3a0" stroke="#426465" stroke-width="1.5"/>';
  const houses='<path d="M10 38 39 15 68 38" fill="#bc785b" stroke="#694b40" stroke-width="3"/><path d="M18 36h42v29H18Z" fill="#e8d7a4" stroke="#426465" stroke-width="2"/>'+windows+'<path d="M35 49h9v16h-9Z" fill="#3e7c76"/>';
  const chalet='<path d="M6 44 39 5 73 44 65 48 39 19 14 48Z" fill="#8e5342" stroke="#62453b" stroke-width="2"/><path d="M18 36 39 15 60 36v29H18Z" fill="#dbbb80" stroke="#46675c" stroke-width="2"/>'+windows+'<path d="M14 54h50M19 48v13m10-13v13m20-13v13m10-13v13" stroke="#76583c" stroke-width="3"/><path d="M36 27h7v8h-7Z" fill="#ffe4a1"/>';
  const condos='<path d="M9 18h26v47H9Zm35-9h25v56H44Z" fill="#e0d9b8" stroke="#486f6b" stroke-width="2"/><path d="M7 17h30M42 8h29" stroke="#417b7b" stroke-width="5"/><path d="M15 26h6v7h-6zm12 0h5v7h-5zm-12 14h6v7h-6zm12 0h5v7h-5zm23-21h6v7h-6zm10 0h5v7h-5zm-10 14h6v7h-6zm10 0h5v7h-5zm-10 14h6v7h-6zm10 0h5v7h-5z" fill="#ecbe68"/><path d="M31 63q8-14 16 0" fill="#93c5b4" stroke="#4e8f80" stroke-width="2"/>';
  const estates='<path d="M6 37 22 23 36 35 40 14 57 22 73 37" fill="#596a75" stroke="#3c5b62" stroke-width="3"/><path d="M12 36h54v29H12ZM32 25h17v40H32Z" fill="#f0dfb1" stroke="#8b7549" stroke-width="2"/><path d="M35 49q6-9 12 0v16H35Z" fill="#34766c"/><path d="M19 43h7v12h-7zm36 0h7v12h-7z" fill="#efc76c"/><path d="M9 66v-9m59 9v-9M8 59h19m26 0h17M16 58v9m8-9v9m32-9v9m8-9v9" stroke="#b58b3c" stroke-width="3"/><path d="M40 15V4l12 4-12 5" stroke="#947632" fill="#eac15e"/>';
  return '<svg viewBox="0 0 80 72" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><ellipse cx="40" cy="66" rx="37" ry="5" fill="#4b796b22"/>'+[houses,chalet,condos,estates][level]+'</svg>';
 }
 function html(value,compact=false){const level=normalize(value);return '<span class="development-badge'+(compact?' is-compact':'')+'" data-development="'+level+'" role="img" aria-label="'+name(level)+'">'+art(level)+'<b>'+name(level)+'</b></span>';}
 function badge(value){const holder=document.createElement('span');holder.innerHTML=html(value);return holder.firstElementChild;}
 const forHeight=height=>height>=5?3:height>=3?2:height>=2?1:0;
 return {names,normalize,name,art,html,badge,forHeight};
});
