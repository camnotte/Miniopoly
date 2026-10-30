/* Entry-page presentation; shared rules remain authoritative on the host. */
(()=>{
 'use strict';
 const modes=['classic','express','countdown'],rounds={classic:[0,10,12,15,20,30,50],express:[10,15,20],countdown:[10,15,20]},key='miniopoly_entry_rounds_v1';
 class EntryOptions{
  constructor({onChange}={}){
   this.root=document.getElementById('entryOptionsPanel');this.onChange=onChange;this.byMode={classic:10,express:10,countdown:10};
   try{const saved=JSON.parse(localStorage.getItem(key)||'null');for(const mode of modes)if(rounds[mode].includes(saved?.[mode]))this.byMode[mode]=saved[mode];}catch{}
   this.modeSelect=this.root.querySelector('#entryModeSelect');this.roundSelect=this.root.querySelector('#entryRoundsSelect');
   this.modeSelect.onchange=()=>this.select(this.modeSelect.value);
   this.roundSelect.onchange=()=>{const mode=document.getElementById('gameMode').value;this.byMode[mode]=Number(this.roundSelect.value);this.select(mode);};
  }
  select(mode){if(!modes.includes(mode))return;document.getElementById('gameMode').value=mode;document.getElementById('rounds').value=String(this.byMode[mode]);this.sync();this.onChange?.();}
  sync(){
   const modeInput=document.getElementById('gameMode'),roundInput=document.getElementById('rounds'),mode=modes.includes(modeInput.value)?modeInput.value:'classic';let count=Number(roundInput.value);if(!rounds[mode].includes(count))count=10;
   modeInput.value=mode;roundInput.value=String(count);this.byMode[mode]=count;
   this.modeSelect.value=mode;
   if(this.roundSelect.dataset.mode!==mode){this.roundSelect.replaceChildren(...rounds[mode].filter(value=>value!==0).concat(rounds[mode].includes(0)?[0]:[]).map(value=>{const option=document.createElement('option');option.value=String(value);option.textContent=value?String(value):'Unlimited';return option;}));this.roundSelect.dataset.mode=mode;}
   this.roundSelect.value=String(count);this.roundSelect.setAttribute('aria-label',mode==='classic'?'Standard rounds':(mode==='express'?'World Collapse':'Disaster Season · Tsunami')+' building rounds');
   const text=mode==='classic'?(count?'Highest net worth wins after '+count+' rounds. The last survivor can win earlier.':'Unlimited play continues until one player remains.'):mode==='express'?'Build for '+count+' rounds, then avoid fatal voids. Last survivor wins.':'Tsunami scenario: build for '+count+' rounds, then protect your properties. Lose your last property and you are out. Other disaster types and insurance are planned.';
   this.root.querySelector('#entryModeDescription').textContent=text;
   try{localStorage.setItem(key,JSON.stringify(this.byMode));}catch{}
  }
  setJoin(join){this.root.classList.toggle('is-joining',join);this.root.querySelector('#entryMatchControls').disabled=join;this.root.querySelector('#entryJoinNotice').hidden=!join;this.root.querySelector('#entryOptionsIntro').textContent=join?'The host controls shared rules. Choose your own font below.':'Choose the rules before creating your room.';this.root.querySelector('#entryOptionsSummary').hidden=join;}
 }
 window.MiniopolyEntryOptions=EntryOptions;
})();
