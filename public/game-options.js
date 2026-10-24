(()=>{
  'use strict';
  const KEY='miniopoly_personal_options_v1',rounds=[0,10,12,15,20,30,50];
  const summary=room=>(room.gameMode==='express'?'Express · World Collapse · ':'Classic · ')+(room.rounds?room.rounds+' rounds':'Unlimited rounds')+' · '+(room.worldShift==='gravity'?'Gravity Pull':'Individual shifts')+' · $'+(room.startingCash??1500).toLocaleString('en-US')+' starting cash';
  const optionValue=(field,value)=>field==='gameMode'?(value==='express'?'Express · World Collapse':'Classic'):field==='collapseRentBoost'?(value?'Rent +50% during collapse':'Normal rent'):field==='rounds'?(value?value+' rounds':'Unlimited'):field==='worldShift'?(value==='gravity'?'Gravity Pull':'Individual'):'$'+Number(value).toLocaleString('en-US');
  class GameOptions{
    constructor({getData,onSave,onPreferences}){
      Object.assign(this,{getData,onSave,onPreferences});let saved;try{saved=JSON.parse(localStorage.getItem(KEY)||'null');}catch{}
      this.personal={font:window.MiniopolyFontPreferences?.getPreference()||'nunito',sound:saved?.sound!==false,volume:Number.isFinite(saved?.volume)?Math.max(0,Math.min(100,saved.volume)):100,motion:saved?.motion==='reduce'?'reduce':'system'};this.last=null;this.saving=false;
      this.layer=document.createElement('div');this.layer.id='gameOptionsLayer';this.layer.className='game-options-layer';this.layer.hidden=true;
      this.layer.innerHTML=`<section class="game-options-dialog" role="dialog" aria-modal="false" aria-labelledby="gameOptionsTitle"><header><div><p>YOUR TABLE · YOUR WAY TO PLAY</p><h2 id="gameOptionsTitle">Game Options</h2></div><button type="button" data-options-close aria-label="Close Game Options">×</button></header><div class="game-options-body"><form id="matchOptionsForm"><h3>Match rules <span>Shared with everyone</span></h3><p data-options-help></p><label>Game mode<select name="gameMode"><option value="classic">Classic</option><option value="express">Express · World Collapse</option></select></label><label data-collapse-rent><input type="checkbox" name="collapseRentBoost"> Final Showdown · 50% more rent during collapse</label><div class="game-options-grid"><label><span data-options-length>Match length</span><select name="rounds"></select></label><label>Starting cash<select name="startingCash"><option value="1000">$1,000</option><option value="1500">$1,500</option><option value="2000">$2,000</option></select></label></div><label>World shift<select name="worldShift"><option value="individual">Individual · Only the roller shifts</option><option value="gravity">Gravity Pull · Same world and square</option></select></label><p class="game-options-rule" data-options-rule></p><p class="game-options-small">A 6 or 12, or ten rolls without a shift, triggers a world shift. Escape rolls never shift worlds. Starting cash locks when play starts. The host can change world shift for the next roll.</p><button type="submit" class="game-options-save">Save match options</button><p class="game-options-status" role="status" aria-live="polite"></p></form><section class="game-options-personal"><h3>Your device <span>Remembered in this browser</span></h3><div data-font-setting><label>Game font<select data-font-preference aria-label="Game font"></select></label><p class="game-options-small" data-font-help></p><button type="button" data-font-recheck>Check fonts again</button></div><label class="options-check"><input type="checkbox" data-personal-sound> Sound enabled</label><label>Volume <span data-volume-label></span><input type="range" min="0" max="100" step="5" data-personal-volume></label><label>Motion<select data-personal-motion><option value="system">Follow device preference</option><option value="reduce">Reduced motion</option></select></label><p class="game-options-small">Reduced motion skips the dice spin, world fades and Gravity Pull animation. Moves and results still apply.</p></section></div></section>`;
      document.body.append(this.layer);window.MiniopolyFontPreferences?.bindControls(this.layer);window.MiniopolyFontPreferences?.subscribe(value=>{this.personal.font=value;});this.panel=this.layer.querySelector('section');this.form=this.layer.querySelector('form');this.closeButton=this.layer.querySelector('[data-options-close]');this.status=this.layer.querySelector('.game-options-status');
      for(const value of rounds){const option=document.createElement('option');option.value=String(value);option.textContent=value?value+' rounds':'Unlimited · Until one player remains';this.form.elements.rounds.append(option);}
      this.closeButton.onclick=()=>this.close(true);this.layer.onclick=event=>{if(event.target===this.layer)this.close(true);};
      this.form.onchange=()=>{this.dirty=true;this.rule();};
      this.form.onsubmit=event=>{event.preventDefault();return this.save();};
      this.layer.querySelector('[data-personal-sound]').onchange=event=>this.updatePersonal({sound:event.target.checked});
      this.layer.querySelector('[data-personal-volume]').oninput=event=>this.updatePersonal({volume:Number(event.target.value)});
      this.layer.querySelector('[data-personal-motion]').onchange=event=>this.updatePersonal({motion:event.target.value});
      document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!this.layer.hidden&&!event.target.closest?.('#roomChatPanel')){event.preventDefault();event.stopPropagation();this.close(true);}},true);
      this.media=matchMedia('(prefers-reduced-motion: reduce)');this.media.addEventListener('change',()=>this.onPreferences(this.personal));
      this.notice=document.createElement('div');this.notice.className='game-options-notice';this.notice.setAttribute('role','status');this.notice.setAttribute('aria-live','polite');this.notice.setAttribute('aria-atomic','true');this.notice.hidden=true;
      this.notice.innerHTML='<header><strong>Game Options Updated</strong><button type="button" aria-label="Dismiss game options announcement">×</button></header><p class="options-notice-by"></p><ul></ul><p class="options-notice-timing"></p><p class="options-notice-summary"></p>';
      this.notice.querySelector('button').onclick=()=>{this.notice.hidden=true;clearTimeout(this.timer);};document.body.append(this.notice);
      document.addEventListener('visibilitychange',()=>{clearTimeout(this.timer);if(!document.hidden){this.announce(this.getData());if(!this.notice.hidden)this.scheduleNotice();}});this.personalControls();
    }
    get reducedMotion(){return this.personal.motion==='reduce'||this.media.matches;}
    personalControls(){this.layer.querySelector('[data-personal-sound]').checked=this.personal.sound;this.layer.querySelector('[data-personal-volume]').value=String(this.personal.volume);this.layer.querySelector('[data-volume-label]').textContent=this.personal.volume+'%';this.layer.querySelector('[data-personal-motion]').value=this.personal.motion;}
    updatePersonal(changes){Object.assign(this.personal,changes);this.personal.font=window.MiniopolyFontPreferences?.getPreference()||this.personal.font;try{localStorage.setItem(KEY,JSON.stringify(this.personal));}catch{}this.personalControls();this.onPreferences(this.personal);}
    rule(){const express=this.form.elements.gameMode.value==='express';this.layer.querySelector('[data-collapse-rent]').hidden=!express;this.layer.querySelector('[data-options-length]').textContent=express?'Building rounds before collapse':'Match length';for(const option of this.form.elements.rounds.options)option.disabled=express&&![10,15,20].includes(Number(option.value));if(express&&![10,15,20].includes(Number(this.form.elements.rounds.value)))this.form.elements.rounds.value='10';this.layer.querySelector('[data-options-rule]').textContent=this.form.elements.worldShift.value==='gravity'?'Gravity Pull brings eligible players to the roller’s exact world and destination square. Only the roller resolves the landing. Players held in Setback stay put; pulled players receive no GO payment.':'Individual shifts move only the roller to the next world. Everyone else keeps their world and square.';}
    open(trigger){this.returnFocus=trigger||document.activeElement;this.code=this.getData()?.code;this.layer.hidden=false;this.status.textContent=this.saving?'Saving match options…':'';this.dirty=false;this.refresh(true);this.closeButton.focus({preventScroll:true});}
    async save(){
      const room=this.getData();if(this.saving||!room||room.hostId!==room.youId||!['lobby','playing'].includes(room.stage))return;
      const options={gameMode:this.form.elements.gameMode.value,collapseRentBoost:this.form.elements.collapseRentBoost.checked,rounds:Number(this.form.elements.rounds.value),startingCash:Number(this.form.elements.startingCash.value),worldShift:this.form.elements.worldShift.value};
      const request={controller:new AbortController(),options};this.saveRequest=request;this.saving=true;this.dirty=false;
      this.status.textContent='Saving match options…';this.refresh();
      const timer=setTimeout(()=>request.controller.abort(),10000);
      try{
        await this.onSave(options,{signal:request.controller.signal});
        if(request.controller.signal.aborted)throw new Error('Save confirmation interrupted.');
        if(this.saveRequest===request)this.status.textContent='Match options saved.';
      }catch(error){
        if(this.saveRequest===request)this.status.textContent=request.controller.signal.aborted?'No confirmation from the host. Check the current rules before trying again.':error.message;
      }finally{
        clearTimeout(timer);
        if(this.saveRequest===request){this.saveRequest=null;this.saving=false;this.refresh(true);}
      }
    }
    scheduleNotice(){clearTimeout(this.timer);this.timer=setTimeout(()=>this.notice.hidden=true,10000);}
    announce(room){
      const update=room?.optionsChange;if(!update?.id)return;
      const key='miniopoly_options_notice_'+room.code,identity=room.code+':'+update.id;
      if(this.observedAnnouncement===identity)return;
      try{if(localStorage.getItem(key)===update.id){this.observedAnnouncement=identity;return;}}catch{}
      if(document.hidden)return;
      this.observedAnnouncement=identity;try{localStorage.setItem(key,update.id);}catch{}
      this.notice.querySelector('.options-notice-by').textContent=(update.by||'The host')+' changed the match rules.';
      const list=this.notice.querySelector('ul');list.replaceChildren();
      const labels={rounds:'Match length',worldShift:'World shift',startingCash:'Starting cash',gameMode:'Game mode',collapseRentBoost:'Final Showdown'};
      for(const change of update.changes||[]){if(!labels[change.field])continue;const item=document.createElement('li');item.textContent=labels[change.field]+': '+optionValue(change.field,change.before)+' → '+optionValue(change.field,change.after);list.append(item);}
      this.notice.querySelector('.options-notice-timing').textContent=update.stage==='lobby'?'These rules apply when the match starts.':update.changes?.some(change=>change.field==='worldShift')?'World shift changes apply from the next roll.':'The new round limit applies to this match; the current round finishes normally.';
      this.notice.querySelector('.options-notice-summary').textContent='Current rules: '+summary(room);this.notice.hidden=false;this.scheduleNotice();
    }
    refresh(force=false){
      const room=this.getData();
      if(this.last?.code!==room?.code){this.notice.hidden=true;clearTimeout(this.timer);}
      this.announce(room);
      this.last=room?{code:room.code,matchId:room.matchId,summary:summary(room)}:null;
      if(this.layer.hidden)return;
      if(this.code!==room?.code||room?.stage==='finished'){this.close();return;}
      this.form.hidden=!room;if(!room)return;
      const displayed=this.saveRequest?.options||room;
      const signature=JSON.stringify([room.code,room.matchId,room.rounds,room.startingCash,room.worldShift,room.gameMode,room.collapseRentBoost,this.saveRequest?.options]);
      if(force||signature!==this.signature){this.signature=signature;this.form.elements.gameMode.value=displayed.gameMode||'classic';this.form.elements.collapseRentBoost.checked=!!displayed.collapseRentBoost;this.form.elements.rounds.value=String(displayed.rounds);this.form.elements.startingCash.value=String(displayed.startingCash??1500);this.form.elements.worldShift.value=displayed.worldShift||'individual';this.dirty=false;}
      const host=room.hostId===room.youId,lobby=room.stage==='lobby';
      this.form.elements.gameMode.disabled=!host||!lobby||this.saving;this.form.elements.collapseRentBoost.disabled=!host||!lobby||this.saving;this.form.elements.rounds.disabled=!host||this.saving||(!lobby&&room.gameMode==='express');this.form.elements.startingCash.disabled=!host||!lobby||this.saving;this.form.elements.worldShift.disabled=!host||this.saving;
      for(const option of this.form.elements.rounds.options)option.disabled=!lobby&&Number(option.value)>0&&Number(option.value)<room.round;
      const save=this.form.querySelector('button');save.hidden=!host;save.disabled=this.saving;save.textContent=this.saving?'Saving…':'Save match options';this.form.setAttribute('aria-busy',String(this.saving));
      const hostName=room.players?.find(player=>player.id===room.hostId)?.name||'The host';
      this.layer.querySelector('[data-options-help]').textContent=this.saving?'Saving match options… The controls will become available when the request finishes.':host?(lobby?'You are the host. Choose the rules before starting. Saving rule changes makes this a practice match.':(room.gameMode==='express'?'Express mode, building rounds and Final Showdown are locked. World shift may change for the next roll. ':'You are the host. You can change rounds and world shift. ')+ ' World shift changes apply from the next roll; a roll already underway finishes with its original rules. Starting cash stays fixed. Changes make this a practice match.'):hostName+' sets these shared rules. You can adjust sound and motion below.';this.rule();
      if(room.gameMode==='express')this.layer.querySelector('[data-options-rule]').textContent+=' Express starts with two homes and a permit; GO awards another available home. '+room.rounds+' building rounds precede collapse. Land on a void and you are out; last player standing wins.';
    }
    close(restore=false){this.layer.hidden=true;this.dirty=false;if(restore){const target=this.returnFocus?.isConnected?this.returnFocus:document.getElementById('gameOptionsButton');target?.focus({preventScroll:true});}}
    reset(){const request=this.saveRequest;this.saveRequest=null;this.saving=false;request?.controller.abort();this.close();this.last=null;this.notice.hidden=true;clearTimeout(this.timer);}
  }
  window.MiniopolyGameOptions=GameOptions;window.miniopolyOptionsSummary=summary;
})();
