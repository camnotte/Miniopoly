'use strict';
(() => {
  const $=id=>document.getElementById(id);
  let decks=[],selected='chest',returnFocus=null,fetching=null;
  function tag(kind,className,text){const n=document.createElement(kind);n.className=className;n.textContent=text;return n;}
  function effect(card){return card.action==='setback'?'setback':card.perk?'keep':card.amount<0?'fee':'cash';}
  function render(){
    const tabs=$('cardReviewTabs');tabs.replaceChildren();
    for(const deck of decks){
      const button=tag('button','',deck.name+' · '+deck.cards.length);button.type='button';button.id='deck-tab-'+deck.id;
      button.setAttribute('role','tab');button.setAttribute('aria-controls','cardReviewRows');button.setAttribute('aria-selected',String(selected===deck.id));button.tabIndex=selected===deck.id?0:-1;
      button.onclick=()=>{selected=deck.id;render();$('deck-tab-'+selected).focus();};
      button.onkeydown=e=>{const index=decks.indexOf(deck),next=e.key==='ArrowRight'?(index+1)%decks.length:e.key==='ArrowLeft'?(index+decks.length-1)%decks.length:e.key==='Home'?0:e.key==='End'?decks.length-1:null;if(next!==null){e.preventDefault();selected=decks[next].id;render();$('deck-tab-'+selected).focus();}};
      tabs.append(button);
    }
    const deck=decks.find(d=>d.id===selected);if(!deck)return;
    $('cardReviewIntro').textContent=deck.name+' · '+deck.source;
    const search=$('cardSearch').value.trim().toLocaleLowerCase(),filter=$('cardEffect').value;
    const visible=deck.cards.filter(c=>(filter==='all'||effect(c)===filter)&&(!search||(c.title+' '+c.description).toLocaleLowerCase().includes(search)));
    $('cardReviewCount').textContent=visible.length+' of '+deck.cards.length+' cards · '+decks.reduce((n,d)=>n+d.cards.length,0)+' across all decks';
    const rows=$('cardReviewRows');rows.setAttribute('aria-labelledby','deck-tab-'+selected);rows.replaceChildren();
    for(const card of visible){
      const type=effect(card),article=tag('article','review-playing-card effect-'+type,''),label=tag('span','review-card-effect',type==='setback'?'GO TO SETBACK':type==='keep'?'KEEP THIS CARD':type==='fee'?'PAY THE BANK':'COLLECT FROM BANK');
      article.append(label,tag('span','review-card-symbol',card.emoji),tag('h3','',card.title),tag('p','',card.description));
      if(card.amount)article.append(tag('strong','review-card-amount',(card.amount<0?'−':'+')+'$'+Math.abs(card.amount)));
      if(!card.active)article.append(tag('span','review-card-planned','Future feature · not usable yet'));
      rows.append(article);
    }
    if(!visible.length)rows.append(tag('p','card-review-empty','No cards match. Clear the search or choose another effect.'));
  }
  async function open(deck='chest'){
    returnFocus=document.activeElement;selected=['chest','weather','lucky','traffic','community','coastal'].includes(deck)?deck:'chest';
    $('cardReviewLayer').hidden=false;$('cardSearch').value='';$('cardEffect').value='all';$('cardReviewClose').focus();
    try{if(!decks.length){fetching??=window.MINI_CARD_CATALOG?Promise.resolve(window.MINI_CARD_CATALOG):fetch('/api/cards').then(r=>{if(!r.ok)throw Error('Could not load the card decks.');return r.json();}).finally(()=>fetching=null);decks=(await fetching).decks;}render();}
    catch(error){$('cardReviewRows').replaceChildren(tag('p','',error.message));}
  }
  function close(){if(document.body.dataset.cardReview==='standalone')return;$('cardReviewLayer').hidden=true;returnFocus?.focus();}
  $('cardReviewClose').onclick=close;$('cardReviewButton').onclick=()=>open();
  $('cardReviewLayer').onclick=e=>{if(e.target===$('cardReviewLayer'))close();};
  $('cardReviewLayer').onkeydown=e=>{
    if(e.key==='Escape'){e.preventDefault();close();}
    if(e.key==='Tab'){
      const nodes=Array.from($('cardReviewLayer').querySelectorAll('button,input,select')).filter(n=>!n.disabled&&n.tabIndex!==-1),first=nodes[0],last=nodes[nodes.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    }
  };
  $('cardSearch').oninput=render;$('cardEffect').onchange=render;
  window.MiniopolyCards=Object.freeze({open,close});
  if(document.body.dataset.cardReview==='standalone')open();
})();
