'use strict';
(() => {
  function turnKey(state){
    if(state?.stage!=='playing'||state.phase!=='roll')return '';
    const player=state.players?.[state.turn];
    return player?[state.code,state.matchId,state.turnNumber,state.round,player.id,state.bonusCount||0].join(':'):'';
  }
  function roundStatus(state){
    if(!state)return '';
    if(['express','countdown'].includes(state.gameMode))return state.collapse?.wave?(state.gameMode==='countdown'?'Tsunami':'World Collapse')+' · Wave '+state.collapse.wave:'Building round '+state.round+' of '+state.rounds;
    return 'Round '+state.round+(state.rounds?' of '+state.rounds:' · Unlimited');
  }
  if(typeof module!=='undefined')module.exports={turnKey,roundStatus};
  if(typeof window==='undefined')return;
  window.MiniopolyLiveExperience=class {
    constructor({sendMessage,sendAttachment,onChatToggle}){
      this.sendMessage=sendMessage;this.sendAttachment=sendAttachment;this.onChatToggle=onChatToggle;
      this.node=id=>document.getElementById(id);this.chatOpen=false;this.room='';this.lastTurn='';this.readId=null;this.chatSignature='';this.chatIds=[];this.modalAttributes=new Map();
      this.launcher=this.node('roomChatLauncher');this.panel=this.node('roomChatPanel');this.notice=this.node('turnAnnouncement');
      this.movableChat=new window.MiniopolyMovableChat(this.panel,this.launcher);
      this.launcher.addEventListener('click',()=>this.setChat(!this.chatOpen));
      this.node('roomChatClose').addEventListener('click',()=>this.setChat(false));
      this.panel.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();this.setChat(false);}});
      const form=this.node('roomChatForm'),input=this.node('roomChatInput');
      form.addEventListener('submit',async e=>{e.preventDefault();const text=input.value.trim();if(!text||this.sending)return;this.sending=true;this.status('Sending…');this.node('roomChatSend').disabled=true;
        try{await this.sendMessage(text);if(input.value.trim()===text)input.value='';this.status('Private to this room · 280 characters');}catch(error){this.status(error.message||'Message could not be sent. Your draft is kept.');}
        finally{this.sending=false;this.node('roomChatSend').disabled=false;}
      });
      input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();form.requestSubmit();}});
      this.node('roomChatFile').addEventListener('change',async e=>{
        const file=e.target.files?.[0];e.target.value='';if(!file)return;
        if(file.size>2*1024*1024||!(/\.(png|jpe?g|gif|webp|pdf|txt)$/i).test(file.name)){this.status('Choose PNG, JPG, GIF, WebP, PDF or TXT, up to 2 MB.');return;}
        this.status('Sharing '+file.name+'…');
        try{const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.onerror=()=>reject(Error('Could not read that file.'));reader.readAsDataURL(file);});await this.sendAttachment({name:file.name,data});this.status('File shared with this room.');}catch(error){this.status(error.message||'File could not be shared.');}
      });
      const reposition=()=>this.position();addEventListener('resize',reposition);addEventListener('scroll',reposition,{passive:true});
      window.visualViewport?.addEventListener('resize',reposition);window.visualViewport?.addEventListener('scroll',reposition);
      this.resizeObserver=new ResizeObserver(reposition);this.resizeObserver.observe(this.node('boardFrame'));
      this.modalObserver=new MutationObserver(()=>this.updateModalSemantics());this.modalObserver.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','aria-modal']});
    }
    status(text){this.node('roomChatStatus').textContent=text;}
    resetRoom(){
      this.chatOpen=false;this.panel.hidden=true;this.launcher.hidden=true;this.notice.hidden=true;
      this.room='';this.lastTurn='';this.readId=null;this.chatSignature='';this.chatIds=[];
      this.node('roomChatInput').value='';this.node('roomChatMessages').replaceChildren();this.node('boardDieDock').hidden=true;
      this.node('roomChatUnread').hidden=true;this.launcher.setAttribute('aria-expanded','false');this.updateModalSemantics();
    }
    openChat(){if(this.state)this.setChat(true);}
    setChat(open){
      this.chatOpen=Boolean(open&&this.state);this.panel.hidden=!this.chatOpen;this.launcher.setAttribute('aria-expanded',String(this.chatOpen));
      if(this.chatOpen){this.previousFocus=document.activeElement;this.readId=this.state.chat?.at(-1)?.id||null;this.renderChat();const messages=this.node('roomChatMessages');messages.scrollTop=messages.scrollHeight;this.position();requestAnimationFrame(()=>this.node('roomChatInput').focus({preventScroll:true}));}
      this.updateModalSemantics();this.onChatToggle?.(this.chatOpen);
      if(!this.chatOpen){const candidate=this.previousFocus;const dialog=[...document.querySelectorAll('[role=dialog]')].find(d=>d.getClientRects().length&&d.getAttribute('aria-modal')==='true');const target=candidate?.isConnected&&candidate.getClientRects().length&&(!dialog||dialog.contains(candidate))?candidate:dialog?.querySelector('button:not(:disabled)')||this.launcher;target.focus({preventScroll:true});}
      this.updateUnread();
    }
    updateModalSemantics(){
      if(this.chatOpen||document.querySelector('.property-overview:not([hidden]),.permit-detail-layer:not([hidden]),.game-options-layer:not([hidden])')){for(const dialog of document.querySelectorAll('[aria-modal="true"]')){this.modalAttributes.set(dialog,'true');dialog.setAttribute('aria-modal','false');}}
      else{for(const [dialog,value] of this.modalAttributes)if(dialog.isConnected)dialog.setAttribute('aria-modal',value);this.modalAttributes.clear();}
    }
    updateUnread(){
      const messages=this.state?.chat||[];if(this.chatOpen)this.readId=messages.at(-1)?.id||null;
      const last=messages.at(-1)?.id,unread=last&&last!==this.readId;const badge=this.node('roomChatUnread');badge.hidden=!unread;badge.textContent=unread?'New':'';
    }
    renderChat(){
      const state=this.state;if(!state)return;
      const signature=JSON.stringify([state.youId,(state.chat||[]).map(m=>m.id)]);if(signature===this.chatSignature){this.updateUnread();return;}
      this.chatSignature=signature;const ids=(state.chat||[]).map(m=>m.id),append=this.chatIds.length>0&&this.chatIds.every((id,i)=>ids[i]===id);const incoming=append?(state.chat||[]).slice(this.chatIds.length):(state.chat||[]);this.chatIds=ids;const list=this.node('roomChatMessages'),nearBottom=list.scrollHeight-list.scrollTop-list.clientHeight<80;
      const fragment=document.createDocumentFragment();
      if(!state.chat?.length){const empty=document.createElement('p');empty.className='room-chat-empty';empty.textContent='Say hello to the players in this room.';fragment.append(empty);}
      for(const message of incoming){
        const box=document.createElement('article');box.className='room-chat-message'+(message.playerId===state.youId?' mine':'');
        const name=document.createElement('strong');name.textContent=(message.name||'Player')+(message.playerId===state.youId?' (You)':'');
        const body=document.createElement('p');body.textContent=message.text||'';box.append(name,body);
        if(message.attachment){const file=message.attachment,url='/api/attachment/'+encodeURIComponent(file.id)+'?code='+encodeURIComponent(this.auth.code)+'&token='+encodeURIComponent(this.auth.token);
          const link=document.createElement('a');link.href=url;link.download=file.name||'attachment';link.referrerPolicy='no-referrer';link.textContent=(file.name||'Shared file')+' · '+Math.max(1,Math.round(file.size/1024))+' KB';box.append(link);
          if(file.image){const image=document.createElement('img');image.src=url;image.alt='Shared by '+(message.name||'player')+': '+file.name;image.loading='lazy';image.referrerPolicy='no-referrer';box.append(image);}
        }
        const date=new Date(message.at),time=document.createElement('time');if(Number.isFinite(date.getTime())){time.dateTime=date.toISOString();time.textContent=date.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});}box.append(time);fragment.append(box);
      }
      if(append)list.append(fragment);else list.replaceChildren(fragment);if(nearBottom)list.scrollTop=list.scrollHeight;this.updateUnread();
    }
    update({state,auth,boardReady,animating,loading,rollPending=false,diceSpinning=false}){
      this.state=state;this.auth=auth;this.launcher.hidden=!auth||!state;
      if(!state||!auth){this.panel.hidden=true;this.chatOpen=false;this.notice.hidden=true;this.lastTurn='';this.room='';this.updateModalSemantics();return;}
      if(this.room!==state.code){this.room=state.code;this.readId=null;this.chatSignature='';this.chatIds=[];this.lastTurn='';this.node('roomChatInput').value='';}
      this.renderChat();this.updateModalSemantics();
      const round=this.node('turnRoundStatus');if(round)round.textContent=roundStatus(state);
      const key=turnKey(state);
      if(boardReady&&(diceSpinning||rollPending)){const player=state.players[state.turn];this.node('turnAnnouncementName').textContent=player.name+'’s turn';this.notice.style.setProperty('--turn-player',player.color||'#6caa7b');this.notice.hidden=false;this.node('turnAnnouncementLabel').textContent='ROLLING';this.node('turnAnnouncementHint').textContent='The die is rolling…';this.position();return;}
      if(!key||animating){this.notice.hidden=true;return;}
      if(boardReady&&!loading&&key!==this.lastTurn){
        this.lastTurn=key;const player=state.players[state.turn],mine=player.id===state.youId;
        this.node('turnAnnouncementName').textContent=player.name+'’s turn';
        this.node('turnAnnouncementLabel').textContent=state.bonusCount?'BONUS ROLL':mine?'YOUR TURN':'NEXT PLAYER';
        this.node('turnAnnouncementHint').textContent=state.bonusCount?'Another roll earned · 7 or 11':mine?'You’re ready to roll!':'Waiting for '+player.name+' to roll';
        this.notice.style.setProperty('--turn-player',player.color||'#6caa7b');this.notice.hidden=false;
        this.notice.classList.remove('is-announcing');void this.notice.offsetWidth;this.notice.classList.add('is-announcing');
        this.position();
      }
      // Restore the same ready-turn notice after a failed roll or temporary playback.
      if(boardReady&&!loading&&key===this.lastTurn){this.notice.hidden=false;this.position();}
    }
    position(){
      const vp=window.visualViewport;const height=vp?.height||innerHeight,width=vp?.width||innerWidth;
      this.panel.classList.toggle('is-short',height<420);
      const bottom=Math.max(0,innerHeight-(vp?.offsetTop||0)-height),right=Math.max(0,innerWidth-(vp?.offsetLeft||0)-width);
      document.documentElement.style.setProperty('--ui-visible-height',height+'px');document.documentElement.style.setProperty('--ui-visible-width',width+'px');document.documentElement.style.setProperty('--ui-safe-bottom',bottom+'px');document.documentElement.style.setProperty('--ui-safe-right',right+'px');
      this.movableChat.position();
      const frame=this.node('boardFrame'),board=frame.contentDocument?.getElementById('board');if(!board)return;
      const f=frame.getBoundingClientRect(),b=board.getBoundingClientRect(),wrap=this.node('boardFrame').parentElement.getBoundingClientRect(),scale=f.width/(frame.clientWidth||f.width);
      const center=board.querySelector('.center'),chest=center?.querySelector('.deck-chest'),chance=center?.querySelector('.deck-weather'),dock=this.node('boardDieDock');
      if(center&&chest&&chance){const c=center.getBoundingClientRect(),gap=Math.max(32,chance.offsetLeft-chest.offsetLeft-chest.offsetWidth),size=Math.max(32,Math.min(96,(gap-12)*scale,c.width*scale*.24)),y=(chest.offsetTop+chest.offsetHeight/2+chance.offsetTop+chance.offsetHeight/2)/2;dock.style.left=(f.left-wrap.left+(c.left+c.width/2)*scale)+'px';dock.style.top=(f.top-wrap.top+(c.top+y)*scale)+'px';dock.style.setProperty('--board-die-size',size+'px');
       this.notice.style.left=(f.left-wrap.left+(c.left+c.width/2)*scale)+'px';this.notice.style.top=(f.top-wrap.top+(c.top+c.height*.43)*scale)+'px';this.notice.style.width=Math.max(115,Math.min(280,c.width*scale-18))+'px';}
      else{this.notice.style.left=(f.left-wrap.left+(b.left+b.width/2)*scale)+'px';this.notice.style.top=(f.top-wrap.top+(b.top+b.height/2)*scale)+'px';this.notice.style.width=Math.max(120,Math.min(280,b.width*scale*.56))+'px';}
    }
  };
})();
