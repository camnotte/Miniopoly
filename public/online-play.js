'use strict';
// A seat file is private: it contains only this player's reconnect credential.
function updateSeatTools(){
  el('saveSeat').disabled=!auth;
  el('seatToolsSummary').textContent=auth?'Keep your player seat safe':'Restore a saved player seat';
}
el('saveSeat').addEventListener('click',()=>{
  if(!auth)return;
  const player=state?.players.find(p=>p.id===state.youId);
  const data={format:'miniopoly-seat-v1',code:auth.code,token:auth.token,name:player?.name||'Player'};
  const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='Miniopoly-seat-'+auth.code+'.json';a.hidden=true;document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(url);a.remove();},1000);
  showError('Seat saved. Keep this file private; use Restore seat if the game link changes.');
});
el('restoreSeat').addEventListener('click',()=>el('seatFile').click());
el('seatFile').addEventListener('change',async event=>{
  const file=event.target.files?.[0];event.target.value='';if(!file)return;
  if(auth){showError('You already have a seat here. Use a separate browser profile to restore another player.');return;}
  try{
    if(file.size>2048)throw Error('Choose a Miniopoly seat file, not a game save.');
    const saved=JSON.parse(await file.text());
    if(saved.format!=='miniopoly-seat-v1'||!/^[A-Z2-9]{6}$/.test(saved.code)||!/^[A-Za-z0-9_-]{32}$/.test(saved.token))throw Error('That is not a valid Miniopoly seat file.');
    saveAuth(await api('resume',{code:saved.code,token:saved.token}));showError('Your saved player seat has been restored.');
  }catch(e){showError(e.message||'Could not restore that seat.');}
});
el('remoteLogout').addEventListener('submit',()=>{stopRoomCatchup();if(feed){feed.close();feed=null;}});
