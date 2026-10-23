(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MiniopolyGravityPull=api;})(typeof window==='undefined'?globalThis:window,function(){
  'use strict';
  function previousLocation(pull,player){const member=pull?.players?.find(entry=>entry.playerId===player.id);return member?{board:member.previousBoard,pos:member.previousPosition}:null;}
  function animate({wrap,pull,players,anchor,art,onComplete}){
    const nodes=[],markers=[];let frame=null,stopped=false,start=null;
    const end=anchor(pull.position);if(!end){queueMicrotask(onComplete);return {cancel(){stopped=true;}};}
    const vortex=document.createElement('div');vortex.className='mini-gravity-vortex';vortex.style.left=end.x+'px';vortex.style.top=end.y+'px';vortex.setAttribute('aria-hidden','true');wrap.append(vortex);nodes.push(vortex);
    const title=document.createElement('div');title.className='mini-gravity-title';title.setAttribute('role','status');title.textContent='GRAVITY PULL · '+pull.players.length+' '+(pull.players.length===1?'player joins':'players join')+' the roller';wrap.append(title);nodes.push(title);
    pull.players.forEach((member,index)=>{
      const player=players.find(p=>p.id===member.playerId);if(!player)return;const from=anchor(member.previousPosition)||{x:end.x-100,y:end.y-100};
      const marker=document.createElement('div');marker.className='miniwifi-walking-piece mini-gravity-piece';marker.innerHTML=art(member.seat);marker.setAttribute('role','img');marker.setAttribute('aria-label',player.name+' pulled to the roller');
      marker.dataset.heading=['east','south','west','north'][Math.floor(member.previousPosition/4)];wrap.append(marker);nodes.push(marker);
      const angle=(index+1)*Math.PI*2/(pull.players.length+1);markers.push({marker,from,to:{x:end.x+Math.cos(angle)*12,y:end.y+Math.sin(angle)*10}});
    });
    function cleanup(){if(frame!==null)cancelAnimationFrame(frame);nodes.forEach(node=>node.remove());}
    function tick(now){
      if(stopped)return;if(start===null)start=now;const t=Math.min(1,(now-start)/900),ease=1-Math.pow(1-t,3);
      for(const {marker,from,to} of markers){const dx=from.x-to.x,dy=from.y-to.y,orbit=Math.sin(t*Math.PI)*.35;
        marker.style.left=(from.x+(to.x-from.x)*ease-dy*orbit*(1-t))+'px';marker.style.top=(from.y+(to.y-from.y)*ease+dx*orbit*(1-t))+'px';marker.style.opacity=String(Math.min(1,t*5));}
      if(t<1)frame=requestAnimationFrame(tick);else{cleanup();onComplete();}
    }
    frame=requestAnimationFrame(tick);return {cancel(){stopped=true;cleanup();}};
  }
  return {previousLocation,animate};
});
