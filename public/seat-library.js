(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MiniopolySeats=api;})(typeof window==='undefined'?globalThis:window,function(){
 'use strict';const KEY='miniopoly_seat_library_v1',CURRENT='miniopoly_wifi_seat_v1';
 const valid=s=>!!s&&typeof s.code==='string'&&/^[A-Z2-9]{6}$/.test(s.code)&&typeof s.token==='string'&&/^[A-Za-z0-9_-]{32}$/.test(s.token);
 function list(storage){
  let stored=[],current=null;
  try{stored=JSON.parse(storage.getItem(KEY)||'[]');}catch{}
  try{current=JSON.parse(storage.getItem(CURRENT)||'null');}catch{}
  const items=Array.isArray(stored)?stored:[];
  if(valid(current))items.unshift(current);
  const codes=new Set();return items.filter(s=>{if(!valid(s)||codes.has(s.code))return false;codes.add(s.code);return true;}).slice(0,100).map(s=>({code:s.code,token:s.token}));
 }
 function remember(storage,seat){if(!valid(seat))return;const seats=list(storage).filter(s=>s.code!==seat.code);seats.unshift({code:seat.code,token:seat.token});try{storage.setItem(KEY,JSON.stringify(seats.slice(0,100)));const current=JSON.parse(storage.getItem(CURRENT)||'null');if(current?.code===seat.code)storage.setItem(CURRENT,JSON.stringify({code:seat.code,token:seat.token}));}catch{}}
 function forget(storage,code){try{storage.setItem(KEY,JSON.stringify(list(storage).filter(s=>s.code!==code)));const current=JSON.parse(storage.getItem(CURRENT)||'null');if(current?.code===code)storage.removeItem(CURRENT);}catch{}}
 function find(storage,code){return list(storage).find(s=>s.code===code)||null;}
 return {KEY,CURRENT,valid,list,remember,forget,find};
});
