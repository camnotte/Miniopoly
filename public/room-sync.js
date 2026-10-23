'use strict';
// Every transport shares the same seat and revision checks before updating UI.
(() => {
  function sameSeat(a,b){return Boolean(a&&b&&a.code===b.code&&a.token===b.token);}
  function acceptsSnapshot(current,incoming,activeAuth,requestAuth){
    if(!sameSeat(activeAuth,requestAuth)||!incoming||incoming.code!==activeAuth.code)return false;
    if(!Number.isSafeInteger(incoming.revision)||incoming.revision<0)return false;
    if(!Array.isArray(incoming.players)||!incoming.players.some(p=>p.id===incoming.youId))return false;
    if(current?.code===incoming.code){
      if(current.youId!==incoming.youId)return false;
      if(Number.isSafeInteger(current.revision)&&incoming.revision<current.revision)return false;
    }
    return true;
  }
 const KEY='miniopoly_session_notice_v1';
 function message(kind,details={}){
  if(kind==='reset')return {kind,title:details.host?'You reset the game':'The host reset the game',body:'All seats'+(details.code?' in room '+details.code:'')+' were released. '+(details.host?'Create a new room to choose different game options.':'Wait for the host’s new room code, then join the new game.')+' Your avatar and game-piece preferences are kept.',action:details.host?'Create a new game':'Join a new game',code:details.code||'',host:!!details.host};
  if(kind==='stopped')return {kind,title:'Host stopped hosting',body:'Your seat and saved game are kept. Leave this tab open—we’ll reconnect automatically when hosting resumes.',action:'Try reconnecting now'};
  if(kind==='lost')return {kind,title:'Connection lost—reconnecting',body:'We can’t reach the host right now. This does not mean the game was reset. Keep this tab open; there’s no need to refresh.',action:'Try reconnecting now'};
  if(kind==='update')return {kind,title:'Restart the Windows host',body:'The running server did not recognize the reset request. The game has not been reset. Stop hosting, exit the launcher, then reopen Start-Miniopoly.bat and start hosting. Reload both game pages afterward.',action:'Got it'};
  return {kind:'error',title:'Game reset did not complete',body:details.error||'The host did not confirm the reset. Your seat has been kept. Check the connection and try again.',action:'Got it'};
 }
 class Notice {
  constructor(node,{storage,onAction}={}){this.node=node;this.storage=storage;this.onAction=onAction;this.kind='';this.value=null;this.signature='';
   node.querySelector('[data-session-action]').onclick=()=>{const value=this.value;if(value)this.onAction?.(value);};
   node.querySelector('[data-session-dismiss]').onclick=()=>this.clear();
   try{const value=JSON.parse(storage?.getItem(KEY)||'null');if(value?.kind==='reset')this.show('reset',{code:/^[A-Z2-9]{6}$/.test(value.code)?value.code:'',host:value.host===true});}catch{}
  }
  show(kind,details={}){
   // A connection failure or late reply must never overwrite a confirmed reset.
   if(this.kind==='reset'&&kind!=='reset')return;
   if(this.kind==='stopped'&&kind==='lost')return;
   const value=message(kind,details),signature=JSON.stringify(value);if(signature===this.signature)return;
   this.kind=value.kind;this.value=value;this.signature=signature;this.node.dataset.kind=value.kind;
   this.node.querySelector('[data-session-title]').textContent=value.title;
   this.node.querySelector('[data-session-body]').textContent=value.body;
   this.node.querySelector('[data-session-action]').textContent=value.action;
   this.node.querySelector('[data-session-dismiss]').hidden=['lost','stopped'].includes(value.kind);
   this.node.querySelector('[data-session-symbol]').textContent=value.kind==='reset'?'↻':value.kind==='stopped'?'Ⅱ':'!';
   this.node.hidden=false;
   if(value.kind==='reset')try{this.storage?.setItem(KEY,JSON.stringify({kind:'reset',code:value.code,host:value.host}));}catch{}
  }
  connected(){if(['lost','stopped'].includes(this.kind))this.clear();}
  clear(){this.kind='';this.value=null;this.signature='';this.node.hidden=true;try{this.storage?.removeItem(KEY);}catch{}}
 }
  const api={sameSeat,acceptsSnapshot,Notice,message,KEY};
  if(typeof module!=='undefined')module.exports=api;
  if(typeof window!=='undefined')window.MiniopolyRoomSync=api;
})();
