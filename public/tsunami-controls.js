/* Private bid entry and storm preparation. Every decision is validated by the host. */
(function(){'use strict';
 const make=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
 window.MiniopolyTsunamiControls=class{
  constructor({send,onVisibility=()=>{}}){
   this.send=send;this.onVisibility=onVisibility;this.drafts=new Map();this.busy=false;
   this.button=make('button','Storm preparations','storm-preparations-button');this.button.type='button';this.button.hidden=true;this.button.onclick=()=>this.open('prepare');
   this.layer=make('div',undefined,'storm-tools-layer');this.layer.hidden=true;this.layer.innerHTML='<section class="storm-tools-dialog" role="dialog" aria-modal="true" aria-labelledby="stormToolsTitle" tabindex="-1"><header><h2 id="stormToolsTitle"></h2><button type="button" class="storm-close" aria-label="Close storm preparations">×</button></header><div class="storm-tools-body"></div><p class="storm-tools-error" role="alert"></p><footer></footer></section>';
   document.body.append(this.layer);this.dialog=this.layer.firstElementChild;this.body=this.layer.querySelector('.storm-tools-body');this.footer=this.layer.querySelector('footer');this.error=this.layer.querySelector('[role=alert]');
   this.layer.querySelector('.storm-close').onclick=()=>this.close();this.layer.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();this.close();}if(e.key==='Tab'){const nodes=[...this.dialog.querySelectorAll('button,input')].filter(n=>!n.disabled&&!n.hidden&&n.getClientRects().length),first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}});
   this.clock=setInterval(()=>{const node=this.layer.querySelector('.storm-time');if(node&&this.room?.collapse?.auction)node.textContent=Math.max(0,Math.ceil((this.room.collapse.auction.deadline-Date.now())/1000))+'s remaining';},1000);
  }
  update(room,deeds){
   this.room=room;this.deeds=deeds;const active=room?.gameMode==='countdown'&&room.collapse?.rule==='directional-v1'&&room.stage==='playing',me=room?.players?.find(p=>p.id===room.youId),a=room?.collapse?.auction;
   this.button.hidden=!active||!!me?.out;
   if(!active){this.close(true);return;}
   const ruins=Object.keys(room.owned||{}).filter(id=>room.owned[id].owner===me.seat&&room.collapse.lost[id]);
   this.button.textContent=a?'Blind auction · '+a.submitted.length+'/'+room.players.filter(p=>!p.out).length:'Storm preparations · 🛡 '+(me.waveShields||0)+(ruins.length?' · Rebuild '+ruins.length:'');
   this.button.classList.toggle('storm-action-ready',!!a||room.turn===me.seat&&['roll','post'].includes(room.phase)&&(ruins.some(id=>me.cash>=this.cost(id))||me.waveShields>0&&room.collapse.direction&&(room.collapse.endangered||[]).some(id=>room.owned[id]?.owner===me.seat&&!room.collapse.lost[id])&&!room.collapse.calm&&room.collapse.shieldUsed[me.seat]!==room.collapse.wave+1));
   if(a&&!me.out&&this.seenAuction!==a.id){this.seenAuction=a.id;this.open('auction');}
   else if(!this.layer.hidden){if(this.tab==='auction'&&!a)this.tab='prepare';this.paint();}
  }
  cost(id){return Math.max(50,Math.ceil((this.deeds[id]?.price||0)/2));}
  open(tab){if(!this.room)return;this.previous=document.activeElement;this.tab=this.room.collapse?.auction?'auction':tab;this.layer.hidden=false;this.paint();this.dialog.focus();this.onVisibility();}
  close(force=false){const a=this.room?.collapse?.auction,me=this.room?.players?.find(p=>p.id===this.room.youId);if(!force&&a&&!a.submitted.includes(me?.seat))return;const visible=!this.layer.hidden;this.layer.hidden=true;if(visible){this.previous?.focus?.();this.onVisibility();}}
  async act(kind,extra){if(this.busy)return;this.busy=true;this.error.textContent='';this.paint();try{await this.send(kind,extra);}catch(e){this.error.textContent=e.message;}finally{this.busy=false;this.paint();}}
  action(label,kind,extra,disabled=false){const b=make('button',label);b.type='button';b.disabled=this.busy||disabled;b.onclick=()=>this.act(kind,extra);return b;}
  paint(){
   if(this.layer.hidden||!this.room)return;
   const room=this.room,s=room.collapse,me=room.players.find(p=>p.id===room.youId),a=s.auction;
   const focusedId=this.layer.contains(document.activeElement)?document.activeElement.id:null;
   this.body.replaceChildren();this.footer.replaceChildren();this.layer.querySelector('.storm-close').hidden=!!a&&!a.submitted.includes(me.seat);
   this.layer.querySelector('h2').textContent=a?'Blind redevelopment auction':'Storm preparations';
   if(a){
    const sent=a.submitted.includes(me.seat);let draft=this.drafts.get(a.id);if(!draft){draft={};this.drafts.set(a.id,draft);if(this.drafts.size>8)this.drafts.delete(this.drafts.keys().next().value);}
    this.body.append(make('p','Bid secretly or enter $0 to pass. Only winners pay. Buying a site does not rebuild it.'));
    this.body.append(make('p','Available cash: $'+me.cash.toLocaleString('en-US')+' · '+a.submitted.length+'/'+room.players.filter(p=>!p.out).length+' submitted'));
    this.body.append(make('p',Math.max(0,Math.ceil((a.deadline-Date.now())/1000))+'s remaining','storm-time'));
    for(const lot of a.lots){const row=make('div',undefined,'storm-site-row'),label=make('label',this.deeds[lot.id]?.name||lot.id),description=make('small','Rebuild: $'+lot.rebuildCost+' · Rent $0 until rebuilt'),input=make('input');input.type='number';input.min='0';input.max=String(me.cash);input.step='1';input.inputMode='numeric';input.id='storm-bid-'+lot.id;input.setAttribute('aria-label','Bid for '+(this.deeds[lot.id]?.name||lot.id));input.value=String((sent?a.yourBids?.[lot.id]:draft[lot.id])||0);input.disabled=sent||this.busy;label.htmlFor=input.id;input.oninput=()=>{draft[lot.id]=input.value;this.total();};row.append(label,description,input);this.body.append(row);}
    this.totalNode=make('p',undefined,'storm-bid-total');this.body.append(this.totalNode);this.total();
    if(sent){this.body.append(make('p','Your bids are sealed. Waiting for the others; missing bids become passes at the deadline.','storm-sealed'));const b=make('button','View board while waiting');b.onclick=()=>this.close();this.footer.append(b);}
    else{this.footer.append(this.action('Pass on all sites','tsunami-bid',{auction:a.id,bids:{}}));const submit=make('button','Seal my bids','primary');submit.type='button';submit.disabled=this.busy;submit.onclick=()=>{const bids=Object.fromEntries(a.lots.map(l=>[l.id,Number(draft[l.id]||0)]));void this.act('tsunami-bid',{auction:a.id,bids});};this.footer.append(submit);}
    if(focusedId)document.getElementById(focusedId)?.focus();
    return;
   }
   const turn=room.turn===me.seat&&['roll','post'].includes(room.phase)&&!me.out;
   this.body.append(make('p',s.calm?'Calm seas · Final recovery round. Rebuild before final net-worth scoring.':s.direction?'Sirens from the '+s.direction.toUpperCase()+' · '+(s.wave?'Next wave after this round.':'First wave after round '+room.rounds+'.'):'Build normally. Sirens begin in round '+(room.rounds-1)+'.'));
   if(!turn)this.body.append(make('p','Review now; use shields and rebuild on your turn.'));
   this.body.append(make('h3','Wave Shields · '+(me.waveShields||0)+' saved'));
   this.body.append(make('p','Protect one exposed property for the next wave, then the card expires. Its built-in shield is preserved. One card per player per wave; hold up to two.'));
   const exposed=s.endangered||[],own=Object.keys(room.owned||{}).filter(id=>room.owned[id].owner===me.seat);
   for(const id of own.filter(id=>exposed.includes(id)&&!s.lost[id])){const row=make('div',undefined,'storm-choice-row');row.append(make('span',this.deeds[id]?.name||id),this.action(s.temporary[id]===s.wave+1?'Protected · 1 WAVE':'Use Wave Shield','wave-shield',{id},!turn||!me.waveShields||s.shieldUsed[me.seat]===s.wave+1||s.calm));this.body.append(row);}
   if(!exposed.some(id=>own.includes(id)))this.body.append(make('p','No exposed properties in your portfolio.'));
   this.body.append(make('h3','Rebuild auction sites'));
   const ruins=own.filter(id=>s.lost[id]);if(!ruins.length)this.body.append(make('p','Win a submerged site in a blind auction to rebuild it.'));
   for(const id of ruins){const row=make('div',undefined,'storm-choice-row');row.append(make('span',this.deeds[id]?.name||id),this.action('Rebuild · $'+this.cost(id),'rebuild',{id},!turn||me.cash<this.cost(id)));this.body.append(row);}
   if(s.lastAuction){const history=make('details'),summary=make('summary','Last auction results');history.append(summary);for(const result of s.lastAuction.results){history.append(make('p',(this.deeds[result.id]?.name||result.id)+': '+(result.winner===null?'No bids':room.players[result.winner].name+' won for $'+result.price+(result.tied?' (random tie-break)':''))));history.append(make('small',result.bids.map(b=>room.players[b.seat].name+': $'+b.amount).join(' · ')));}this.body.append(history);}
   const close=make('button','Back to board');close.onclick=()=>this.close();this.footer.append(close);
  }
  total(){if(!this.totalNode)return;const a=this.room.collapse.auction;if(!a)return;const draft=a.yourBids||this.drafts.get(a.id)||{},sum=a.lots.reduce((n,l)=>n+Number(draft[l.id]||0),0),cash=this.room.players.find(p=>p.id===this.room.youId).cash;this.totalNode.textContent='Combined bids: $'+sum+' · Keep cash for rebuilding.';this.totalNode.classList.toggle('is-over-budget',!Number.isSafeInteger(sum)||sum>cash||sum<0);}
 };
})();
