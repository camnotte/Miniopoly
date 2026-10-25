/* Entry-page presentation; shared rules remain authoritative on the host. */
(()=>{
 'use strict';
 const modes=['classic','express','countdown'],rounds={classic:[0,10,12,15,20,30,50],express:[10,15,20],countdown:[10,15,20]},key='miniopoly_entry_rounds_v1';
 class EntryOptions{
  constructor({onChange}={}){
   this.root=document.getElementById('entryOptionsPanel');this.onChange=onChange;this.byMode={classic:10,express:10,countdown:10};
   try{const saved=JSON.parse(localStorage.getItem(key)||'null');for(const mode of modes)if(rounds[mode].includes(saved?.[mode]))this.byMode[mode]=saved[mode];}catch{}
   for(const radio of this.root.querySelectorAll('[name="entryModeChoice"]'))radio.onchange=()=>{if(radio.checked)this.select(radio.value);};
   for(const select of this.root.querySelectorAll('[data-mode-rounds]'))select.onchange=()=>{const mode=select.dataset.modeRounds;this.byMode[mode]=Number(select.value);this.select(mode);};
  }
  select(mode){if(!modes.includes(mode))return;document.getElementById('gameMode').value=mode;document.getElementById('rounds').value=String(this.byMode[mode]);this.sync();this.onChange?.();}
  sync(){
   const modeInput=document.getElementById('gameMode'),roundInput=document.getElementById('rounds'),mode=modes.includes(modeInput.value)?modeInput.value:'classic';let count=Number(roundInput.value);if(!rounds[mode].includes(count))count=10;
   modeInput.value=mode;roundInput.value=String(count);this.byMode[mode]=count;
   for(const row of this.root.querySelectorAll('[data-mode-row]')){const selected=row.dataset.modeRow===mode;row.classList.toggle('is-selected',selected);row.querySelector('input').checked=selected;row.querySelector('select').value=String(this.byMode[row.dataset.modeRow]);}
   const text=mode==='classic'?(count?'Standard uses the classic rules. Play '+count+' rounds; highest net worth wins. The last remaining player can win earlier.':'Standard uses the classic rules. Unlimited play continues until one player remains.'):mode==='express'?count+' building rounds, then World Collapse. Avoid fatal void landings until one player remains. Properties and upgrades earn evade tokens.':count+' building rounds, then Countdown. The void consumes owned properties; upgrades shield once. Losing your last property eliminates you, while void landings are safe.';
   this.root.querySelector('#entryModeDescription').textContent=text;
   try{localStorage.setItem(key,JSON.stringify(this.byMode));}catch{}
  }
  setJoin(join){this.root.classList.toggle('is-joining',join);this.root.querySelector('#entryMatchControls').disabled=join;this.root.querySelector('#entryJoinNotice').hidden=!join;this.root.querySelector('#entryOptionsIntro').textContent=join?'The host controls shared rules. Choose your own font below.':'Choose the rules before creating your room.';this.root.querySelector('#entryOptionsSummary').hidden=join;}
 }
 window.MiniopolyEntryOptions=EntryOptions;
})();
