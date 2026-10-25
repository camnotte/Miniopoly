/* Read-only views of host-scored protection. Never award or spend tokens here. */
(()=>{
 'use strict';
 const icon='/art/evade-token.svg';
 const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=String(text);if(cls)n.className=cls;return n;};
 function badge(player){
  const protection=player.evade;if(!protection?.enabled)return null;
  const button=node('button',undefined,'evade-badge'+(protection.remaining?' has-tokens':''));button.type='button';button.dataset.evadeSeat=String(player.seat);
  const image=node('img');image.src=icon;image.alt='';button.append(image,node('span',player.out?'Unused':'Evade'),node('b',protection.remaining));
  button.title=player.out?protection.remaining+' unused tokens · This player is eliminated':protection.locked?protection.remaining+' evade tokens remaining':protection.remaining+' tokens ready for collapse · '+protection.points+' construction points';
  button.setAttribute('aria-label',player.name+' · '+button.title+' · Show evade rules');return button;
 }
 class Display{
  constructor({showBar=true}={}){
   this.root=showBar?document.getElementById('evadeTokenBar'):null;this.signature='';this.room=null;
   this.dialog=node('dialog',undefined,'evade-dialog');this.dialog.setAttribute('aria-labelledby','evadeDialogTitle');
   const header=node('header'),title=node('h2','Evade tokens');title.id='evadeDialogTitle';const close=node('button','×');close.type='button';close.setAttribute('aria-label','Close evade token details');close.onclick=()=>this.dialog.close();header.append(title,close);
   this.body=node('div',undefined,'evade-dialog-body');this.dialog.append(header,this.body);document.body.append(this.dialog);
   document.addEventListener('click',event=>{const trigger=event.target.closest?.('[data-evade-seat]');if(trigger)this.open(Number(trigger.dataset.evadeSeat));});
   document.addEventListener('keydown',event=>{if(event.key==='Escape'&&this.dialog.open){event.preventDefault();event.stopImmediatePropagation();this.dialog.close();}},true);
   this.dialog.addEventListener('click',event=>{if(event.target===this.dialog)this.dialog.close();});
  }
  refresh(room){
   const previous=this.room;this.room=room;
   if(previous?.code!==room?.code||previous?.matchId!==room?.matchId||room?.stage==='finished'||!room)this.dialog.close();
   if(!this.root){if(this.dialog.open)this.details();return;}
   this.root.hidden=!room||room.gameMode!=='express'||room.stage!=='playing';if(this.root.hidden)return;
   const signature=JSON.stringify([room.code,room.matchId,room.youId,room.players.map(p=>[p.id,p.name,p.out,p.evade])]);
   if(signature===this.signature)return;this.signature=signature;
   const heading=node('div',undefined,'evade-bar-heading'),copy=node('div'),title=node('strong','Evade tokens'),locked=room.players.some(p=>p.evade?.locked),enabled=room.players.some(p=>p.evade?.enabled),supported=room.players.every(p=>typeof p.evade?.enabled==='boolean');
   copy.append(title,node('small',!supported?'Host update required · Exit and restart the updated launcher':!enabled?'This saved match uses original rules · Start a new Express match for tokens':locked?'Protection locked · Second landing on the same void is fatal':'Ready for collapse · Based on your current properties and upgrades'));
   const image=node('img');image.src=icon;image.alt='';heading.append(image,copy);this.root.replaceChildren(heading);
   if(enabled){const list=node('div',undefined,'evade-player-tokens');for(const p of room.players){const chip=node('button',undefined,'evade-player-chip'+(p.id===room.youId?' is-you':'')+(p.out?' is-out':''));const prior=previous?.code===room.code&&previous?.matchId===room.matchId?previous.players.find(q=>q.id===p.id)?.evade?.remaining:undefined;if(prior!==undefined&&(p.evade?.remaining||0)>prior)chip.classList.add('evade-earned');chip.dataset.remaining=String(p.evade?.remaining||0);chip.type='button';chip.dataset.evadeSeat=String(p.seat);chip.style.setProperty('--evade-player-color',p.color);const image=node('img');image.src=icon;image.alt='';const name=node('span',p.name+(p.id===room.youId?' · You':'')),count=node('b',p.out?'OUT':p.evade?.remaining||0);chip.append(image,name,count);chip.setAttribute('aria-label',p.name+' · '+(p.out?'Eliminated':(p.evade?.remaining||0)+' evade tokens'+(locked?' remaining':' ready for collapse'))+' · Show details');list.append(chip);}this.root.append(list);}
   if(this.dialog.open)this.details();
  }
  open(seat){this.seat=seat;this.details();if(!this.dialog.open)this.dialog.showModal();}
  details(){
   const player=this.room?.players.find(p=>p.seat===this.seat),e=player?.evade;this.body.replaceChildren();if(!e?.enabled){this.body.append(node('p','This saved match uses the original collapse rules. Start a new Express match to earn evade tokens.'));return;}
   const hero=node('div',undefined,'evade-detail-hero'),img=node('img');img.src=icon;img.alt='Evade token';hero.append(img,node('div',player.name+' · '+e.remaining+' '+(e.locked?'remaining':'ready for collapse')));this.body.append(hero);
   this.body.append(node('p',player.out?'This player is eliminated. Unused tokens cannot protect a repeat landing on an already evaded void.':e.locked?'Tokens are active for this collapse.':'Tokens activate when collapse begins.'));
   this.body.append(node('p',e.properties+' properties + '+e.improved+' upgraded properties = '+e.points+' construction points.'));
   this.body.append(node('p','Every 3 points earns 1 token. You need at least 3 properties. Each upgraded property adds 1 bonus point regardless of its level. Maximum: 3 tokens.'));
   this.body.append(node('p',e.locked?'Your '+e.earned+' earned tokens were locked before collapse. Used: '+e.spent+'. Losing properties does not reduce this protection.':'This is your current qualifying total. Selling a deed or its last upgrade can reduce it before collapse. Your award locks just before the first wave.'));
   this.body.append(node('p','When you first land on a collapsed square, one token is used automatically and your piece floats above the void. A second landing on that same void is fatal, even if you have tokens. Crossing a void remains safe.'));
   if(e.rescued?.length)this.body.append(node('p','Already evaded: '+(e.rescuedNames||e.rescued).join(', ')+'. Returning to these voids is fatal.'));
  }
 }
 window.MiniopolyEvadeTokens={badge,Display};
})();
