/* Host-only test UI. Every capability is checked again by the game server. */
(()=>{'use strict';const make=(tag,text)=>{const n=document.createElement(tag);if(text)n.textContent=text;return n;};
 class DeveloperTools{
  constructor({send,getBusy}){
   this.send=send;this.getBusy=getBusy;this.button=document.getElementById('developerMenuButton');this.button.onclick=()=>this.open();
   this.dialog=make('dialog');this.dialog.className='developer-dialog';this.dialog.setAttribute('aria-labelledby','developerTitle');
   const header=make('header'),title=make('h2','Developer tools');title.id='developerTitle';const close=make('button','Close');close.type='button';close.onclick=()=>this.dialog.close();header.append(title,close);
   this.status=make('p');this.status.className='developer-status';this.status.setAttribute('role','status');
   const note=make('p','Using these controls makes this a developer test. Test results do not enter records. A fresh test resets cash, properties and turns but keeps player seats.');
   this.form=make('form');this.form.onsubmit=e=>{e.preventDefault();void this.run('settings');};
   const roundLabel=make('label','Round (1–200)'),dieLabel=make('label','Die result · whoever rolls next'),repeatLabel=make('label','Apply die result');
   this.round=make('input');this.round.type='number';this.round.min='1';this.round.max='200';this.round.step='1';this.round.required=true;this.round.value='1';roundLabel.append(this.round);
   this.die=make('select');for(let i=0;i<=12;i++){const option=make('option',i?String(i):'Random');option.value=String(i);this.die.append(option);}dieLabel.append(this.die);
   this.repeat=make('select');for(const [value,label] of [['once','Once'],['repeat','Every roll until cleared']]){const o=make('option',label);o.value=value;this.repeat.append(o);}repeatLabel.append(this.repeat);
   const grid=make('div');grid.className='developer-fields';grid.append(roundLabel,dieLabel,repeatLabel);
   const buttons=make('div');buttons.className='developer-actions';this.save=make('button','Save test controls');this.save.type='submit';this.start=make('button','Start fresh test at round');this.start.type='button';this.start.onclick=()=>{if(this.room.stage!=='lobby'&&!confirm('Start a fresh test? Current cash, properties and turns reset. Player seats stay the same.'))return;void this.run('start');};this.jump=make('button','Jump forward to round');this.jump.type='button';this.jump.onclick=()=>void this.run('jump');buttons.append(this.save,this.start,this.jump);
   this.form.append(grid,buttons,make('p','Forward jumps apply skipped round effects, including disaster waves, but do not simulate purchases, movement or GO rewards. Waves can end the test before your target round. Finish pending landings and bonus rolls before jumping. To go backward, start a fresh test.'));
   this.form.oninput=()=>{this.dirty=true;this.update(this.room);};this.dialog.append(header,this.status,note,this.form);document.body.append(this.dialog);this.dialog.addEventListener('close',()=>{this.dirty=false;document.querySelector('#phoneGameMenu > summary')?.focus({preventScroll:true});});
  }
  update(room){
   this.room=room;const host=!!room&&room.hostId===room.youId;this.button.hidden=!host;
   if(!host){if(this.dialog.open)this.dialog.close();return;}
   const dev=room.developer;this.status.textContent=(room.stage==='lobby'?'Waiting room':room.stage==='finished'?'Finished · Round '+room.round:'Current round '+room.round+(room.collapse?.wave?' · Wave '+room.collapse.wave:''))+' · '+(dev?.enabled?'Developer test':'Normal match')+(dev?.die?' · Die '+dev.die+(dev.repeat?' on every roll':' on next roll'):' · Random die');
   if(!this.dialog.open||!this.dirty)this.hydrate();
   this.save.disabled=this.sending||!['lobby','playing'].includes(room.stage)||this.getBusy();this.start.disabled=this.sending||room.players.length<2||this.getBusy();
   this.jump.disabled=this.sending||Number(this.round.value)<=room.round||room.stage!=='playing'||!['roll','post'].includes(room.phase)||!!room.pending||!!room.obligation||!!room.extraRoll||this.getBusy();
  }
  hydrate(){this.round.value=String(this.room.developer?.startRound||this.room.round||1);this.die.value=String(this.room.developer?.die||0);this.repeat.value=this.room.developer?.repeat?'repeat':'once';}
  open(){if(!this.room||this.button.hidden)return;this.dirty=false;this.hydrate();this.dialog.showModal();this.round.focus();}
  async run(action){if(this.sending||!this.form.reportValidity())return;this.sending=true;this.update(this.room);const developer={action,round:Number(this.round.value),die:Number(this.die.value)||null,repeat:this.repeat.value==='repeat'};try{await this.send(developer);this.dirty=false;this.update(this.room);}catch(error){this.status.textContent=error.message;}finally{this.sending=false;this.updateButtons();}}
  updateButtons(){const message=this.status.textContent;this.update(this.room);this.status.textContent=message;}
 }
 window.MiniopolyDeveloperTools=DeveloperTools;
})();
