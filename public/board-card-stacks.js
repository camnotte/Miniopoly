'use strict';
(() => {
  // The shared board file keeps its original artwork and movement implementation.
  // Enhance the existing, arrival-gated Festival reveal without replaying a roll.
  const festivalStyle=document.createElement('link');festivalStyle.rel='stylesheet';festivalStyle.href='/festival-celebration.css?v=0.3.57';document.head.append(festivalStyle);
  function decorateFestival(){
    const overlay=document.querySelector('.miniwifi-special-overlay'),card=overlay?.querySelector('[data-kind="festival"]');
    if(!card||overlay.querySelector('.festival-fireworks')||!window.MiniopolyFestivalCelebration||window.miniWifiReduceMotion||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    overlay.append(window.MiniopolyFestivalCelebration.fireworks(document));
  }
  const festivalScript=document.createElement('script');festivalScript.src='/festival-celebration.js?v=0.3.57';festivalScript.onload=decorateFestival;document.head.append(festivalScript);
  const originalReveal=window.miniWifiRevealSpecial;
  window.miniWifiRevealSpecial=function(){originalReveal.apply(this,arguments);decorateFestival();};
  let state=null;
  const rules='<p><strong>Community Festival:</strong> paid Town Tax and Storm Fund payments build one shared fund. The visitor receives 60%; other nonbankrupt players split 40%, including those in Setback and other worlds. The fund resets to zero.</p><p><strong>7 or 11 earns another roll.</strong> Resolve the landing first. A third consecutive 7-or-11 roll sends you directly to Setback without a GO bonus for that move.</p><p><strong>Setback:</strong> landing on the square is just visiting. A card or three qualifying rolls can send you there. Rent collection pauses while you are held. Roll 6 or 12 to leave free, choose a paid escape roll costing 20 times its result, forfeit an undeveloped unmortgaged deed, or use an escape card. After three failed free attempts, pay 20 times the locked roll. Escape rolls do not shift worlds or award a bonus.</p><p><strong>Match length:</strong> play until one player remains, or choose a fixed round limit. The last player standing wins; fixed matches rank remaining players by net worth.</p>';
  const originalRules=window.openRules;
  window.openRules=function(){if(document.documentElement.classList.contains('mini-live-turn-panel'))window.header('How to play',rules);else originalRules?.apply(this,arguments);};
  function render(){
    const center=document.querySelector('#board > .center');
    if(!center||!document.documentElement.classList.contains('mini-live-turn-panel'))return;
    let heading=center.querySelector('.mini-world-name');
    if(!heading){heading=document.createElement('div');heading.className='mini-world-name';center.append(heading);}
    heading.textContent=['Richmond Hill','The Communities','Coastal Georgia'][Number(document.getElementById('board').dataset.world)||0];
    let stacks=center.querySelector('.mini-card-stacks');
    if(!stacks){
      stacks=document.createElement('div');stacks.className='mini-card-stacks';
      for(const [deck,label,symbol] of [['chest','Community','✦'],['weather','Chance','?']]){
        const button=document.createElement('button');button.type='button';button.className='mini-card-stack deck-'+deck;
        button.dataset.deck=deck;button.setAttribute('aria-label','Review '+(deck==='chest'?'Community Chest':'Chance')+' cards');
        const icon=document.createElement('span');icon.className='deck-symbol';icon.textContent=symbol;icon.setAttribute('aria-hidden','true');
        const title=document.createElement('strong');title.textContent=label;const caption=document.createElement('small');caption.textContent='View cards';
        button.append(icon,title,caption);button.onclick=()=>window.parent.postMessage({type:'MINI_CARD_REVIEW',deck},location.origin);stacks.append(button);
      }
      center.append(stacks);
    }
    let fund=center.querySelector('.mini-festival-fund');
    if(!fund){fund=document.createElement('aside');fund.className='mini-festival-fund';fund.setAttribute('role','status');fund.setAttribute('aria-label','Community Festival shared fund');fund.innerHTML='<span>Festival fund</span><strong></strong><small>60% visitor · 40% shared</small>';center.append(fund);}
    const amount='$'+Number(state?.festivalFund||0).toLocaleString('en-US');if(fund.querySelector('strong').textContent!==amount)fund.querySelector('strong').textContent=amount;
    fund.title='Paid Town Tax and Storm Fund charges build this fund. Land on Community Festival in The Communities to share it.';
    const source=state?.phase==='card'?state.pending?.source:'';
    const mode=document.getElementById('modeInfo');
    if(mode&&state)mode.textContent=state.rounds?'Round '+state.round+' of '+state.rounds+' · 7 / 11 bonus rolls':'Until one player remains · Round '+state.round;
    stacks.querySelectorAll('button').forEach(button=>button.classList.toggle('is-drawing',button.dataset.deck==='chest'?/Community Chest|Coastal Bonus/.test(source):/CHANCE|Lucky|Traffic/.test(source)));
    const tile=document.querySelector('#board .tile[data-position="8"]');
    if(tile){tile.title='Setback: landing here is just visiting. Only three consecutive 7-or-11 rolls or a card send you here.';tile.setAttribute('data-help',tile.title);tile.onclick=()=>window.header('Setback · just visiting unless sent here',rules);}
  }
  window.MiniopolyCardStacks=Object.freeze({render});
  window.addEventListener('message',event=>{if(event.source!==window.parent||event.origin!==location.origin)return;if(event.data?.type==='MINI_SYNC')state=event.data.state;if(['MINI_SYNC','MINI_LAYOUT_MODE'].includes(event.data?.type))render();});
  render();
})();
