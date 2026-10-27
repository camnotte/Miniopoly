'use strict';
(() => {
  function remainingRounds(state){
    return state?.stage==='playing'&&!(['express','countdown'].includes(state.gameMode)&&state.collapse?.wave>0)&&state.rounds>0?Math.max(0,state.rounds-state.round+1):null;
  }
  if(typeof module!=='undefined')module.exports={remainingRounds};
  if(typeof window==='undefined')return;
  window.MiniopolyMatchLifecycle=class {
    constructor({onReturn}){
      this.onReturn=onReturn;this.seen=new Set();
      this.notice=document.getElementById('roundCountdown');
      document.getElementById('roundCountdownClose').onclick=()=>{this.notice.hidden=true;};
      document.getElementById('returnToRooms').onclick=()=>this.returnNow();
    }
    returnNow(){
      if(!this.state||this.state.stage!=='finished')return;
      this.onReturn();
    }
    reset(){clearTimeout(this.noticeTimer);this.state=null;this.notice.hidden=true;}
    update(state,{busy=false}={}){
      this.state=state;
      if(state?.stage==='finished'){
        this.notice.hidden=true;
        document.getElementById('matchReturnCountdown').textContent='Match complete. Return to Create / Join when you are ready.';
        return;
      }
      const remaining=remainingRounds(state);
      if(remaining===null||remaining<1||remaining>5){this.notice.hidden=true;return;}
      const key=state.code+':'+state.matchId+':'+state.rounds+':'+state.round;
      if(busy||this.seen.has(key))return;
      try{if(sessionStorage.getItem('miniopoly_countdown_'+key)){this.seen.add(key);return;}sessionStorage.setItem('miniopoly_countdown_'+key,'seen');}catch{}
      this.seen.add(key);clearTimeout(this.noticeTimer);
      document.getElementById('roundCountdownNumber').textContent=String(remaining);
      document.getElementById('roundCountdownText').textContent=['express','countdown'].includes(state.gameMode)?(remaining===1?'Final building round!':state.gameMode==='countdown'?'Building rounds before tsunami':'Building rounds before collapse'):remaining===1?'Final round!':'Rounds remaining';
      document.getElementById('roundCountdownHint').textContent=['express','countdown'].includes(state.gameMode)?(state.gameMode==='countdown'?'Tsunami waves':'World Collapse')+' begins after round '+state.rounds+' · Last player standing wins':'Including this round · Match ends after round '+state.rounds;
      this.notice.hidden=false;this.noticeTimer=setTimeout(()=>{this.notice.hidden=true;},3500);
    }
  };
})();
