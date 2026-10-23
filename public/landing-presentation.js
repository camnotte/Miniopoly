'use strict';
// Keep authoritative room snapshots intact; reveal financial changes on arrival.
(() => {
  function capture(current,incoming){
    if(!current||!incoming?.lastRoll)return null;
    return {code:incoming.code,matchId:incoming.matchId,rollAt:incoming.lastRoll.at,playerId:incoming.lastRoll.playerId,
      festivalFund:current.festivalFund??0,owned:Object.fromEntries(Object.entries(current.owned||{}).map(([id,owner])=>[id,{...owner}])),foreclosures:(current.foreclosures||[]).map(item=>({...item})),
      locations:current.players.map(p=>({id:p.id,board:p.board})),
      players:current.players.map(p=>({id:p.id,cash:p.cash,worth:p.worth,deeds:p.deeds,perks:[...(p.perks||[])]})),log:[...(current.log||[])]};
  }
  function matches(room,hold){return Boolean(hold&&room?.stage==='playing'&&room.code===hold.code&&room.matchId===hold.matchId&&room.lastRoll?.at===hold.rollAt&&room.players[room.turn]?.id===hold.playerId);}
  function project(room,hold){
    if(!matches(room,hold))return room;
    const finances=new Map(hold.players.map(p=>[p.id,p]));
    return {...room,festivalFund:hold.festivalFund??0,owned:hold.owned,foreclosures:hold.foreclosures,players:room.players.map(p=>({...p,...finances.get(p.id)})),log:hold.log};
  }
  function arrived(room,hold,event){return matches(room,hold)&&event.rollAt===hold.rollAt&&event.playerId===hold.playerId;}
  function worldForPlayer(room,hold,player){
    const previous=matches(room,hold)&&hold.locations?.find(location=>location.id===player.id);
    return previous?previous.board:player.board;
  }
  // Resolve identity and cash together from the authenticated snapshot. Never
  // use the active seat, array position or an animation-held balance here.
  function viewer(room){
    if(!room?.youId||!Array.isArray(room.players))return null;
    const matches=room.players.filter(player=>player.id===room.youId);
    return matches.length===1?matches[0]:null;
  }
  // A read-only viewer can hide one roll's landing without hiding a later
  // player's decision, a rematch, or their own required transaction.
  class WatchState {
    constructor(){this.key='';this.minimized=false;}
    sync(room,myTurn){
      const player=room?.players?.[room.turn];
      const key=room?.stage==='playing'&&player?[room.code,room.matchId,room.youId,room.turnNumber,player.id,room.lastRoll?.at].join(':'):'';
      if(!key||key!==this.key||myTurn)this.minimized=false;
      this.key=key;return this.minimized;
    }
    minimize(){if(this.key)this.minimized=true;}
    restore(){this.minimized=false;}
  }
  // A new image element cannot paint the previous landing's decoded bitmap
  // while the replacement is loading (notably when Safari reuses an <img>).
  class Artwork {
    constructor(image,fallback){this.image=image;this.fallback=fallback;this.current=null;}
    clear(){
      this.current=null;this.image.onload=null;this.image.onerror=null;
      this.image.hidden=true;this.image.removeAttribute('src');this.fallback.hidden=false;
    }
    show({key,source,alt,motion=false}){
      if(!source){this.clear();return;}
      if(this.current?.key===key&&this.current.source===source){
        this.image.alt=alt;this.image.classList.toggle('is-illustrated-motion',motion);return;
      }
      this.clear();
      const image=this.image.ownerDocument.createElement('img');
      image.id=this.image.id;image.alt=alt;image.hidden=true;image.decoding='async';
      image.classList.toggle('is-illustrated-motion',motion);
      this.image.replaceWith(image);this.image=image;
      const current={key,source,image};this.current=current;
      image.onload=async()=>{
        try{await image.decode?.();}catch{ /* A loaded GIF can still be displayed. */ }
        if(this.current!==current||!image.naturalWidth)return;
        image.hidden=false;this.fallback.hidden=true;
      };
      image.onerror=()=>{if(this.current===current){image.hidden=true;this.fallback.hidden=false;}};
      image.src=source;
    }
  }
  const api={capture,project,matches,arrived,worldForPlayer,viewer,WatchState,Artwork};
  if(typeof module!=='undefined')module.exports=api;
  if(typeof window!=='undefined')window.MiniopolyLandingPresentation=api;
})();
