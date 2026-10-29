(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MiniopolyBuildingPermit=api;})(typeof window==='undefined'?globalThis:window,function(){
  'use strict';
  const development=typeof module==='object'&&module.exports?require('./property-development'):window.MiniopolyDevelopment;
  const multipliers=development.multipliers;
  function details(deed,ownership,multiplier=1,upgradeMultiplier=1){
    if(!deed||deed.type!=='p'||!ownership||ownership.lost||ownership.mortgage)return null;
    const level=Number(ownership.level)||0;if(!Number.isInteger(level)||level<0||level>=development.MAX)return null;
    const rentBoost=multiplier;const rents=multipliers.map(multiplier=>Math.ceil(deed.base*multiplier*rentBoost)),value=deed.price+development.valueSteps(ownership)*deed.upgradeCost/2;
    return {id:deed.id,name:deed.name,board:deed.board,color:deed.color,price:deed.price,level,nextLevel:level+1,rents,
      rent:rents[level],nextRent:rents[level+1],rentGain:rents[level+1]-rents[level],upgradeCost:deed.upgradeCost*upgradeMultiplier,
      value:Math.round(value),nextValue:Math.round(value+deed.upgradeCost/2),valueGain:deed.upgradeCost/2};
  }
  function candidates(deeds,room,seat,sort='price'){
    return deeds.filter(deed=>room.owned?.[deed.id]?.owner===seat).map(deed=>details(deed,room.owned[deed.id],room.gameMode==='express'&&room.collapse?.wave>0&&room.collapseRentBoost?1.5:1,room.upgradeCostMultiplier||1)).filter(Boolean)
      .sort((a,b)=>(sort==='rent'?b.rentGain-a.rentGain:0)||b.price-a.price||b.rentGain-a.rentGain||a.id.localeCompare(b.id));
  }
  if(typeof document==='undefined')return {details,candidates};
  const node=(tag,value,className)=>{const element=document.createElement(tag);if(value!==undefined)element.textContent=value;if(className)element.className=className;return element;};
  const money=value=>'$'+Number(value).toLocaleString('en-US');
  class Info{
    constructor({getData,getDeeds,getArt,worlds}){
      Object.assign(this,{getData,getDeeds,getArt,worlds});this.target=null;this.signature='';
      this.layer=node('div',undefined,'permit-detail-layer');this.layer.id='buildingPermitDetails';this.layer.hidden=true;
      this.panel=node('section',undefined,'permit-detail-dialog');this.panel.setAttribute('role','dialog');this.panel.setAttribute('aria-modal','false');this.panel.setAttribute('aria-labelledby','permitDetailTitle');
      this.header=node('header');const heading=node('div');heading.append(node('p','BUILDING PERMIT · UPGRADE PREVIEW','permit-detail-eyebrow'));
      this.title=node('h2');this.title.id='permitDetailTitle';heading.append(this.title);
      this.closeButton=node('button','×');this.closeButton.type='button';this.closeButton.setAttribute('aria-label','Close upgrade details');this.closeButton.onclick=()=>this.close(true);
      this.header.append(heading,this.closeButton);this.content=node('div',undefined,'permit-detail-content');
      const footer=node('footer');footer.append(node('p','Choose “Use Building Permit · Free” in the property list when you’re ready.'));
      const back=node('button','Back to properties');back.type='button';back.onclick=()=>this.close(true);footer.append(back);
      this.panel.append(this.header,this.content,footer);this.layer.append(this.panel);document.body.append(this.layer);
      this.layer.addEventListener('click',event=>{if(event.target===this.layer)this.close(true);});
      document.addEventListener('click',event=>{const button=event.target.closest?.('[data-permit-info]');if(button)this.open(button.dataset.permitInfo,button);});
      document.addEventListener('keydown',event=>{if(event.key==='Escape'&&document.getElementById('gameOptionsLayer')?.hidden!==false&&!this.layer.hidden&&!event.target.closest?.('#roomChatPanel')){event.preventDefault();event.stopPropagation();this.close(true);}},true);
    }
    open(id,trigger){
      const room=this.getData(),player=room?.players.find(p=>p.id===room.youId);if(!player)return;
      this.target={id,seat:player.seat,code:room.code,matchId:room.matchId};this.returnFocus=trigger;this.refresh();
      if(!this.layer.hidden){this.panel.scrollTop=0;this.closeButton.focus({preventScroll:true});}
    }
    refresh(){
      if(!this.target)return;const room=this.getData(),target=this.target,player=room?.players.find(p=>p.seat===target.seat);
      const deed=this.getDeeds().find(d=>d.id===target.id),ownership=room?.owned?.[target.id],info=details(deed,ownership,room?.gameMode==='express'&&room.collapse?.wave>0&&room.collapseRentBoost?1.5:1,room?.upgradeCostMultiplier||1);
      if(!room||room.code!==target.code||room.matchId!==target.matchId||room.stage!=='playing'||room.turn!==target.seat||!['roll','post'].includes(room.phase)||!player?.perks?.includes('building')||ownership?.owner!==target.seat||!info){this.close();return;}
      const signature=JSON.stringify([info,player.penalty]);
      if(signature!==this.signature){
        this.signature=signature;this.title.textContent=info.name;this.content.replaceChildren();
        this.content.append(node('p',(this.worlds[info.board]||'World '+(info.board+1))+' · '+info.color+' set · '+window.MiniopolyDevelopment.name(info.level,info)+' → '+window.MiniopolyDevelopment.name(info.nextLevel,info),'permit-detail-location'));
        const layout=node('div',undefined,'permit-detail-layout'),art=node('div',undefined,'permit-detail-art'),image=node('img');image.src=this.getArt(info.id);image.alt=info.name+' property illustration';art.append(image);
        const summary=node('div',undefined,'permit-detail-summary'),rents=node('div',undefined,'permit-detail-rents');
        for(const [label,value] of [['Current rent',info.rent],['After upgrade',info.nextRent]]){const stat=node('div');stat.append(node('span',label),node('strong',money(value)));rents.append(stat);}
        summary.append(node('h3','Rent per landing'),rents,node('p','+'+money(info.rentGain)+' more rent per landing','permit-detail-gain'));
        const costs=node('dl',undefined,'permit-detail-costs');
        for(const [label,value] of [['Deed price',money(info.price)],['Paid upgrade cost'+(room.upgradeCostMultiplier===2?' · Tsunami 2×':''),money(info.upgradeCost)],['You pay with permit','$0']]){const stat=node('div');stat.append(node('dt',label),node('dd',value));costs.append(stat);}
        summary.append(costs);layout.append(art,summary);this.content.append(layout);
        const value=node('section',undefined,'permit-detail-value');value.append(node('h3','Property value in net worth'),node('strong',money(info.value)+' → '+money(info.nextValue)),node('span','+'+money(info.valueGain)+' with this free upgrade'));
        value.append(node('p','Deed price + half the standard cost of each upgrade. Tsunami construction surcharges do not increase resale or net worth.'));this.content.append(value);
        const table=node('table');table.className='permit-detail-table';const caption=node('caption','Rent at each level'),head=node('thead'),hr=node('tr');
        hr.append(node('th','Development'),node('th','Rent per landing'));head.append(hr);const body=node('tbody');
        for(let level=0;level<info.rents.length;level++){const tr=node('tr');tr.className=level===info.level?'is-current':level===info.nextLevel?'is-next':'';tr.append(node('th',window.MiniopolyDevelopment.name(level,info)+(level===info.level?' · Current':level===info.nextLevel?' · With permit':'')),node('td',money(info.rents[level])));body.append(tr);}
        table.append(caption,head,body);this.content.append(table);
        if(player.penalty>0)this.content.append(node('p','Rent collection is paused while you are in Setback. These rates apply after you leave.','permit-detail-paused'));
      }
      this.layer.hidden=false;
    }
    close(restore=false){
      this.layer.hidden=true;this.target=null;this.signature='';
      if(restore){const target=this.returnFocus?.isConnected?this.returnFocus:document.querySelector('[data-permit-info="'+this.returnFocus?.dataset.permitInfo+'"]');target?.focus({preventScroll:true});}
    }
  }
  return {details,candidates,Info};
});
