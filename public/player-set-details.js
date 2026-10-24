/* Read-only, nonmodal property-set details; chat remains above this panel. */
(()=>{
  'use strict';
  const text=(tag,value,className)=>{const node=document.createElement(tag);node.textContent=value;if(className)node.className=className;return node;};
  class PlayerSetDetails{
    constructor(provider,worlds){
      this.provider=provider;this.worlds=worlds;this.target=null;this.pinned=false;this.timer=null;this.skipFocus=null;
      this.panel=document.createElement('section');this.panel.id='playerSetDetails';this.panel.className='player-set-details';this.panel.hidden=true;this.panel.setAttribute('role','dialog');this.panel.setAttribute('aria-labelledby','playerSetDetailsTitle');
      const header=document.createElement('header');this.title=text('h2','','');this.title.id='playerSetDetailsTitle';
      this.closeButton=text('button','×');this.closeButton.type='button';this.closeButton.setAttribute('aria-label','Close property set details');this.closeButton.onclick=()=>this.close(true);
      header.append(this.title,this.closeButton);this.summary=text('p','','set-detail-summary');this.list=document.createElement('ul');this.panel.append(header,this.summary,this.list);document.body.append(this.panel);
      const chip=event=>event.target.closest?.('.player-set-chip');
      document.addEventListener('pointerover',event=>{const button=chip(event);if(button&&event.pointerType==='mouse'&&!button.contains(event.relatedTarget)&&!this.pinned)this.open(button);});
      document.addEventListener('pointerout',event=>{const button=chip(event);if(button&&!button.contains(event.relatedTarget))this.delayClose();});
      document.addEventListener('focusin',event=>{const button=chip(event);if(!button)return;if(this.skipFocus===button){this.skipFocus=null;return;}if(!this.pinned)this.open(button);});
      document.addEventListener('focusout',()=>this.delayClose());
      document.addEventListener('click',event=>{const button=chip(event);if(!button)return;if(this.anchor===button&&this.pinned)this.close();else this.open(button,true);});
      document.addEventListener('pointerdown',event=>{if(!chip(event)&&!this.panel.contains(event.target))this.close();});
      document.addEventListener('keydown',event=>{if(event.key==='Escape'&&this.target){event.preventDefault();this.close(true);}});
      this.panel.addEventListener('pointerenter',()=>clearTimeout(this.timer));this.panel.addEventListener('pointerleave',()=>this.delayClose());
      document.addEventListener('scroll',()=>this.position(),true);window.addEventListener('resize',()=>this.position());
    }
    delayClose(){clearTimeout(this.timer);if(!this.pinned)this.timer=setTimeout(()=>{if(!this.panel.matches(':hover')&&!this.panel.contains(document.activeElement)&&document.activeElement!==this.anchor)this.close();},180);}
    open(button,pin=false){
      clearTimeout(this.timer);
      if(this.anchor&&this.anchor!==button)this.anchor.setAttribute('aria-expanded','false');
      this.anchor=button;this.target={seat:Number(button.dataset.playerSeat),color:button.dataset.setColor,room:button.dataset.room};this.pinned=pin;
      this.refresh();
    }
    refresh(){
      if(!this.target)return;
      const data=this.provider(this.target);if(!data){this.close();return;}
      const anchor=document.querySelector(`.player-set-chip[data-player-seat="${this.target.seat}"][data-set-color="${this.target.color}"]`);
      if(!anchor||anchor.dataset.room!==this.target.room){this.close();return;}
      this.anchor=anchor;anchor.setAttribute('aria-expanded','true');
      const signature=JSON.stringify(data);
      if(signature!==this.signature){
        this.signature=signature;const {player,group}=data;
        this.title.textContent=group.other?'Other deeds · '+group.count+' owned':group.color+' set · '+group.count+'/'+group.total;
        this.summary.textContent=player.name+' · '+(group.other?'Owned railroads and utilities.':group.complete?(group.mortgaged?'Complete set. Lift mortgages before standard upgrades.':'✓ Complete set across the worlds.'):(group.total-group.count)+' '+(group.total-group.count===1?'property':'properties')+' missing.');
        this.list.replaceChildren();
        for(const member of group.members){
          const row=document.createElement('li'),name=text('strong',member.name),world=text('small',this.worlds[member.board]||'World '+(member.board+1));
          const owner=member.lost?'LOST · $0 value · No rent':member.owned?'Owned by '+player.name:member.ownerName?'Owned by '+member.ownerName:member.foreclosed?'Bank foreclosure':'Available';
          const state=text('span',owner+(member.mortgaged?' · Mortgaged':'')+(member.level?' · Level '+member.level:''),'set-member-status');
          row.className=member.owned?'set-member-owned':member.ownerName?'set-member-opponent':'';row.append(name,world,state);this.list.append(row);
        }
      }
      this.panel.hidden=false;this.position();
    }
    position(){
      if(!this.target||this.panel.hidden)return;
      if(!this.anchor?.isConnected){this.close();return;}
      const rect=this.anchor.getBoundingClientRect(),width=this.panel.offsetWidth,height=this.panel.offsetHeight;
      this.panel.style.left=Math.max(10,Math.min(innerWidth-width-10,rect.left+rect.width/2-width/2))+'px';
      this.panel.style.top=Math.max(10,Math.min(innerHeight-height-10,rect.top>=height+12?rect.top-height-8:rect.bottom+8))+'px';
    }
    close(restore=false){
      clearTimeout(this.timer);const anchor=this.anchor;
      anchor?.setAttribute('aria-expanded','false');this.panel.hidden=true;this.target=null;this.pinned=false;this.signature=null;
      if(restore&&anchor?.isConnected){this.skipFocus=anchor;anchor.focus({preventScroll:true});queueMicrotask(()=>{this.skipFocus=null;});}
    }
  }
  window.MiniopolyPlayerSetDetails=PlayerSetDetails;
})();
