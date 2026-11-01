/* Private bid entry and storm preparation. Every decision is validated by the host. */
(function(){'use strict';
 const make=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
 window.MiniopolyTsunamiControls=class{
  constructor({send,onVisibility=()=>{},getBusy=()=>false,getAutoBusy=()=>false}){
   this.send=send;this.onVisibility=onVisibility;this.getBusy=getBusy;this.getAutoBusy=getAutoBusy;this.readResults=new window.MiniopolyHelper.ReadTracker('miniopoly_auction_read_v1');this.drafts=new Map();this.busy=false;
   this.button=make('button','Storm preparations','storm-preparations-button');this.button.type='button';this.button.hidden=true;this.button.onclick=()=>this.open(this.room?.collapse?.auction?'auction':this.pendingResult?'results':'prepare');
   this.layer=make('div',undefined,'storm-tools-layer');this.layer.hidden=true;this.layer.innerHTML='<section class="storm-tools-dialog" role="dialog" aria-modal="true" aria-labelledby="stormToolsTitle" tabindex="-1"><header><h2 id="stormToolsTitle"></h2><button type="button" class="storm-close" aria-label="Close storm preparations">×</button></header><div class="storm-tools-body"></div><p class="storm-tools-error" role="alert"></p><footer></footer></section>';
   document.body.append(this.layer);this.dialog=this.layer.firstElementChild;this.body=this.layer.querySelector('.storm-tools-body');this.footer=this.layer.querySelector('footer');this.error=this.layer.querySelector('[role=alert]');
   this.layer.querySelector('.storm-close').onclick=()=>this.close();this.layer.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();this.close();}if(e.key==='Tab'){const nodes=[...this.dialog.querySelectorAll('button,input')].filter(n=>!n.disabled&&!n.hidden&&n.getClientRects().length),first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}});
   this.boardTimer=make('button','','board-auction-timer');this.boardTimer.id='boardAuctionTimer';this.boardTimer.type='button';this.boardTimer.hidden=true;this.boardTimer.onclick=()=>this.open('auction');document.querySelector('.board-shell').insertBefore(this.boardTimer,document.querySelector('.board-frame-wrap'));
   this.landingButton=make('button','Auction results','landing-auction-button');this.landingButton.id='landingAuctionButton';this.landingButton.type='button';this.landingButton.hidden=true;this.landingButton.onclick=()=>this.open(this.room?.collapse?.auction?'auction':'results');document.getElementById('modalFooter').append(this.landingButton);
   this.clock=setInterval(()=>this.tick(),1000);
  }
  tick(){const a=this.room?.collapse?.auction;if(!a||this.boardTimer.hidden)return;const remaining=Math.max(0,Math.ceil((a.deadline-Date.now()-(this.serverOffset||0))/1000)),time=Math.floor(remaining/60)+':'+String(remaining%60).padStart(2,'0'),me=this.room.players.find(p=>p.id===this.room.youId),sent=a.submitted.includes(me?.seat);this.boardTimer.textContent='Auction '+time+' · '+(remaining===0?'Closing…':sent?'Bids sealed':'Bid now');if(this.landingButton)this.landingButton.textContent=this.boardTimer.textContent;this.boardTimer.classList.toggle('is-urgent',remaining>0&&remaining<=15);this.boardTimer.dataset.deadline=String(a.deadline);this.boardTimer.setAttribute('aria-label','Blind auction: '+remaining+' seconds left. '+(sent?'Bids sealed. Review auction.':'Open bidding.'));const node=this.layer.querySelector('.storm-time');if(node)node.textContent=remaining+'s remaining';
  }
  update(room,deeds){
   if(this.matchKey!==room?.code+':'+room?.matchId){this.matchKey=room?.code+':'+room?.matchId;this.historyOpen=false;}this.room=room;this.deeds=deeds;const active=room?.gameMode==='countdown'&&room.collapse?.rule==='directional-v1'&&room.stage==='playing',me=room?.players?.find(p=>p.id===room.youId),a=room?.collapse?.auction;
   this.button.hidden=!active||!!me?.out;this.boardTimer.hidden=!active||!!me?.out||!a;if(a)this.serverOffset=(a.serverNow||Date.now())-Date.now();this.tick();
   if(!active){this.landingButton.hidden=true;this.close(true);return;}
   const ruins=Object.keys(room.owned||{}).filter(id=>room.owned[id].owner===me.seat&&room.collapse.lost[id]);
   this.button.textContent=a?'Blind auction · '+a.submitted.length+'/'+room.players.filter(p=>!p.out).length:'Storm preparations · 🛡 '+(me.waveShields||0)+(ruins.length?' · Rebuild '+ruins.length:'');
   this.button.classList.toggle('storm-action-ready',!!a||room.turn===me.seat&&['roll','post'].includes(room.phase)&&(ruins.some(id=>(me.availableCash??me.cash)>=this.cost(id))||me.waveShields>0&&room.collapse.direction&&(room.collapse.endangered||[]).some(id=>room.owned[id]?.owner===me.seat&&!room.collapse.lost[id])&&!room.collapse.calm&&room.collapse.shieldUsed[me.seat]!==room.collapse.wave+1));
   const history=room.collapse.auctionHistory?.length?room.collapse.auctionHistory:room.collapse.lastAuction?[room.collapse.lastAuction]:[];
   this.pendingResult=history.find(result=>!this.readResults.has(room,result.id));this.landingButton.hidden=!active||!!me?.out||!a&&!this.pendingResult;if(!a)this.landingButton.textContent='Auction results';if(!a&&this.pendingResult)this.button.textContent='Auction results · Review outcome';
   if(this.getBusy()){this.layer.hidden=true;return;}
   const covered=this.getAutoBusy()||[...document.querySelectorAll('[role=dialog],dialog[open]')].some(n=>!this.layer.contains(n)&&n.getClientRects().length&&!n.closest('[hidden]'));
   if(!covered&&this.pendingResult&&(this.layer.hidden||this.tab!=='results')){this.resultId=this.pendingResult.id;this.open('results');}
   else if(!covered&&a&&!me.out&&this.seenAuction!==a.id){this.seenAuction=a.id;this.open('auction');}
   else if(!this.layer.hidden){if(this.tab==='auction'&&!a)this.tab='prepare';this.paint();}
  }
  cost(id){return Math.max(50,Math.ceil((this.deeds[id]?.price||0)/2));}
  open(tab){if(!this.room)return;this.previous=document.activeElement;this.tab=tab;this.seenAuction=this.room.collapse?.auction?.id||this.seenAuction;if(this.tab==='results'){const history=this.room.collapse.auctionHistory?.length?this.room.collapse.auctionHistory:this.room.collapse.lastAuction?[this.room.collapse.lastAuction]:[];this.pendingResult=history.find(result=>!this.readResults.has(this.room,result.id));this.resultId=this.pendingResult?.id||this.resultId||this.room.collapse.lastAuction?.id;}this.layer.hidden=false;this.paint();this.dialog.focus();this.onVisibility();}
  close(force=false){if(!force&&this.tab==='results'&&this.resultId)this.readResults.mark(this.room,this.resultId);const visible=!this.layer.hidden;this.layer.hidden=true;if(visible){this.previous?.focus?.();this.onVisibility();}}
  async act(kind,extra){if(this.busy)return;this.busy=true;this.error.textContent='';this.paint();try{await this.send(kind,extra);}catch(e){this.error.textContent=e.message;}finally{this.busy=false;this.paint();}}
  action(label,kind,extra,disabled=false){const b=make('button',label);b.type='button';b.disabled=this.busy||disabled;b.onclick=()=>this.act(kind,extra);return b;}
  paint(){
   if(this.layer.hidden||!this.room)return;
   const room=this.room,s=room.collapse,me=room.players.find(p=>p.id===room.youId),a=s.auction;
   const previousHistory=this.body.querySelector('.storm-auction-history');if(previousHistory&&previousHistory.dataset.auctionId===s.lastAuction?.id)this.historyOpen=previousHistory.open;else this.historyOpen=false;const scrollTop=this.body.scrollTop;
   const focusedId=this.layer.contains(document.activeElement)?document.activeElement.id:null;
   this.body.replaceChildren();this.footer.replaceChildren();this.layer.querySelector('.storm-close').hidden=false;
   this.layer.querySelector('h2').textContent=a&&this.tab==='auction'?'Blind redevelopment auction':'Storm preparations';
   if(a&&this.tab==='auction'){
    const sent=a.submitted.includes(me.seat);let draft=this.drafts.get(a.id);if(!draft){draft={};this.drafts.set(a.id,draft);if(this.drafts.size>8)this.drafts.delete(this.drafts.keys().next().value);}
    this.body.append(make('p','Turns continue while you bid. Close this window to play, then use the board timer to return. Only winners pay; buying a site does not rebuild it.'));
    this.body.append(make('p','Cash: $'+me.cash.toLocaleString('en-US')+' · Available: $'+(me.availableCash??me.cash).toLocaleString('en-US')+' · '+a.submitted.length+'/'+room.players.filter(p=>!p.out).length+' submitted'));
    this.body.append(make('p','Sealed bids reserve cash from purchases, upgrades and trades. Required payments take priority and can turn your bids into passes.'));if(s.auctionQueue?.length)this.body.append(make('p',s.auctionQueue.length+' later wave auction(s) queued; each gets its own 90 seconds.'));
    this.body.append(make('p',Math.max(0,Math.ceil((a.deadline-Date.now())/1000))+'s remaining','storm-time'));
    for(const lot of a.lots){const row=make('div',undefined,'storm-site-row'),label=make('label',this.deeds[lot.id]?.name||lot.id),description=make('small','Rebuild: $'+lot.rebuildCost+' · Rent $0 until rebuilt'),input=make('input');input.type='number';input.min='0';input.max=String(a.bidBudget??me.availableCash??me.cash);input.step='1';input.inputMode='numeric';input.id='storm-bid-'+lot.id;input.setAttribute('aria-label','Bid for '+(this.deeds[lot.id]?.name||lot.id));input.value=String((sent?a.yourBids?.[lot.id]:draft[lot.id])||0);input.disabled=sent||this.busy;label.htmlFor=input.id;input.oninput=()=>{draft[lot.id]=input.value;this.total();};row.append(label,description,input);this.body.append(row);}
    this.totalNode=make('p',undefined,'storm-bid-total');this.body.append(this.totalNode);this.total();
    if(sent){this.body.append(make('p','Your bids are sealed. Keep playing; missing bids become passes at the deadline.','storm-sealed'));const b=make('button','View board while waiting');b.onclick=()=>this.close();this.footer.append(b);}
    else{this.footer.append(this.action('Pass on all sites','tsunami-bid',{auction:a.id,bids:{}}));const submit=make('button','Seal my bids','primary');submit.type='button';submit.disabled=this.busy;submit.onclick=()=>{const bids=Object.fromEntries(a.lots.map(l=>[l.id,Number(draft[l.id]||0)]));void this.act('tsunami-bid',{auction:a.id,bids});};this.footer.append(submit);}
    if(a.yourCancellation)this.body.append(make('p',a.yourCancellation,'storm-tools-error'));if(!sent){const back=make('button','Return to board');back.onclick=()=>this.close();this.footer.append(back);}const prep=make('button','Storm preparations');prep.onclick=()=>{this.tab='prepare';this.paint();};this.footer.append(prep);this.body.scrollTop=scrollTop;this.tick();
    if(focusedId)document.getElementById(focusedId)?.focus();
    return;
   }
   if(this.tab==='results'){
    const result=(s.auctionHistory||[]).find(r=>r.id===this.resultId)||s.lastAuction,summary=window.MiniopolyHelper.auctionSummary(room,this.deeds,result);
    if(summary){this.resultId=summary.id;this.layer.querySelector('h2').textContent='Auction results · Wave '+summary.wave;
     this.body.append(make('p',summary.wins.length?'You acquired '+summary.wins.length+' redevelopment site'+(summary.wins.length===1?'':'s')+' for $'+summary.paid+'.':'You made no purchases. Unsuccessful bids cost you nothing.','storm-result-intro'));
     for(const lot of summary.lots){const row=make('section',undefined,'storm-result-lot'+(lot.you?' is-your-win':''));row.dataset.auctionResultDeed=lot.id;row.append(make('h3',lot.name),make('strong',lot.winner===null?'No positive bids · Bank keeps the site':(lot.you?'YOU · ':'')+lot.owner+' won for $'+lot.price),make('p',lot.winner===null?'The damaged site remains available for a later auction.':'Damaged site acquired · Rent and deed value stay $0 until rebuilt. Rebuild cost: $'+lot.rebuildCost+'.'));if(lot.tied)row.append(make('small','Tied highest bids · The host drew one winner at random.'));this.body.append(row);}
     const steps=make('section',undefined,'storm-winner-steps');steps.append(make('h3',summary.ruins.length?'Your next steps':'What happens next'));
     if(summary.ruins.length){const list=make('ol');for(const text of [summary.yourTurn?'You can rebuild now, before rolling or after resolving your landing.':'Wait for your turn. You can review your sites now.','Open Storm preparations → Rebuild auction sites.','Pay the displayed rebuilding cost: $'+summary.rebuildTotal+' for your '+summary.ruins.length+' site'+(summary.ruins.length===1?'':'s')+'. Base rent and deed value return; buildings start at zero.'])list.append(make('li',text));steps.append(list,make('p','Available cash: $'+summary.cash+(summary.cash<summary.rebuildTotal?' · You need $'+(summary.rebuildTotal-summary.cash)+' more to rebuild all sites. Save cash or sell/trade assets.': ' · Keep enough cash for rebuilding.')));
      const options=make('button','Show rebuilding options','primary');options.onclick=()=>{this.readResults.mark(room,summary.id);this.tab='prepare';this.paint();this.onVisibility();};this.footer.append(options);
     }else steps.append(make('p',summary.wins.length?'These sites have already been rebuilt, changed owners or been struck again. Review your current portfolio.':'Continue playing and save cash for defenses or the next redevelopment auction.'));
     this.body.append(steps);const done=make('button','Got it');done.onclick=()=>this.close();this.footer.append(done);this.body.scrollTop=scrollTop;return;
    }
   }
   const turn=room.turn===me.seat&&['roll','post'].includes(room.phase)&&!me.out;
   this.body.append(make('p',s.calm?(s.auction||s.auctionQueue?.length?'Calm seas · Finish bidding, then play a full recovery round before scoring.':'Calm seas · Recovery round '+s.recoveryRound+'. Rebuild before scoring.'):s.direction?'Sirens from the '+s.direction.toUpperCase()+' · '+(s.wave?'Next wave after this round.':'First wave after round '+room.rounds+'.'):'Build normally. Sirens begin in round '+(room.rounds-1)+'.'));
   if(!turn)this.body.append(make('p','Review now; use shields and rebuild on your turn.'));
   this.body.append(make('h3','Wave Shields · '+(me.waveShields||0)+' saved'));
   this.body.append(make('p','Protect one exposed property for the next wave, then the card expires. Its built-in shield is preserved. One card per player per wave; hold up to two.'));
   const exposed=s.endangered||[],own=Object.keys(room.owned||{}).filter(id=>room.owned[id].owner===me.seat);
   for(const id of own.filter(id=>exposed.includes(id)&&!s.lost[id])){const row=make('div',undefined,'storm-choice-row');row.append(make('span',this.deeds[id]?.name||id),this.action(s.temporary[id]===s.wave+1?'Protected · 1 WAVE':'Use Wave Shield','wave-shield',{id},!turn||!me.waveShields||s.shieldUsed[me.seat]===s.wave+1||s.calm));this.body.append(row);}
   if(!exposed.some(id=>own.includes(id)))this.body.append(make('p','No exposed properties in your portfolio.'));
   this.body.append(make('h3','Rebuild auction sites'));
   const ruins=own.filter(id=>s.lost[id]);if(!ruins.length)this.body.append(make('p','Win a submerged site in a blind auction to rebuild it.'));
   for(const id of ruins){const row=make('div',undefined,'storm-choice-row');row.append(make('span',this.deeds[id]?.name||id),this.action('Rebuild · $'+this.cost(id),'rebuild',{id},!turn||(me.availableCash??me.cash)<this.cost(id)));this.body.append(row);}
   if(s.lastAuction){const history=make('details',undefined,'storm-auction-history');history.dataset.auctionId=s.lastAuction.id;history.open=!!this.historyOpen;history.ontoggle=()=>{this.historyOpen=history.open;};const summary=make('summary','Last auction results');history.append(summary);for(const result of s.lastAuction.results){history.append(make('p',(this.deeds[result.id]?.name||result.id)+': '+(result.winner===null?'No bids':room.players[result.winner].name+' won for $'+result.price+(result.tied?' (random tie-break)':''))));history.append(make('small',result.bids.map(b=>room.players[b.seat].name+': $'+b.amount).join(' · ')));}const full=make('button','View full auction results');full.onclick=()=>{this.resultId=s.lastAuction.id;this.tab='results';this.paint();};history.append(full);this.body.append(history);}
   if(a){const bidding=make('button','Return to auction');bidding.onclick=()=>{this.tab='auction';this.paint();};this.footer.append(bidding);}
   const close=make('button','Back to board');close.onclick=()=>this.close();this.footer.append(close);this.body.scrollTop=scrollTop;
  }
  total(){if(!this.totalNode)return;const a=this.room.collapse.auction;if(!a)return;const draft=a.yourBids||this.drafts.get(a.id)||{},sum=a.lots.reduce((n,l)=>n+Number(draft[l.id]||0),0),me=this.room.players.find(p=>p.id===this.room.youId),cash=a.yourBids?me.cash:(a.bidBudget??me.availableCash??me.cash);this.totalNode.textContent='Combined bids: $'+sum+' · Keep cash for rebuilding.';this.totalNode.classList.toggle('is-over-budget',!Number.isSafeInteger(sum)||sum>cash||sum<0);}
 };
})();
