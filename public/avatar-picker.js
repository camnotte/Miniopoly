(function(){
  'use strict';
  const avatars=window.MiniopolyAvatars;
  const remember=(key,value)=>{try{if(value===null)localStorage.removeItem(key);else localStorage.setItem(key,value);}catch{}};
  const read=key=>{try{return localStorage.getItem(key);}catch{return null;}};
  async function preparePhoto(file){
    if(!file||!['image/png','image/jpeg','image/webp'].includes(file.type))throw Error('Choose a PNG, JPG or WebP photo.');
    if(file.size>8*1024*1024)throw Error('Choose a photo smaller than 8 MB.');
    const url=URL.createObjectURL(file),image=new Image();
    try{
      image.src=url;await image.decode();
      if(!image.naturalWidth||!image.naturalHeight||image.naturalWidth*image.naturalHeight>40e6)throw Error('Choose a smaller photo (under 40 megapixels).');
      const side=Math.min(image.naturalWidth,image.naturalHeight),canvas=document.createElement('canvas');
      for(const size of [192,160,128]){
        canvas.width=canvas.height=size;
        const context=canvas.getContext('2d');context.imageSmoothingQuality='high';
        context.drawImage(image,(image.naturalWidth-side)/2,(image.naturalHeight-side)/2,side,side,0,0,size,size);
        const result=canvas.toDataURL('image/png');
        if(avatars.isPersonalImage(result))return result;
      }
      throw Error('This image is too detailed. Try a simpler or smaller photo.');
    }catch(error){
      if(error.name==='EncodingError')throw Error('This photo could not be opened. Try another PNG, JPG or WebP.');
      throw error;
    }finally{URL.revokeObjectURL(url);}
  }
  class AvatarPicker{
    constructor(pieces=null){
      this.pieces=pieces;this.submitting=false;this.entryEnabled=true;this.busy=false;
      this.avatar=avatars.resolve(read('miniopoly_avatar_v1')).id;
      this.photo=read('miniopoly_avatar_photo_v1');if(!avatars.isPersonalImage(this.photo))this.photo=null;
      this.personal=Boolean(this.photo&&read('miniopoly_avatar_use_photo_v1')==='yes');
      this.dialog=document.createElement('dialog');this.dialog.id='avatarChooser';this.dialog.className='entry-chooser';this.dialog.setAttribute('aria-labelledby','avatarChooserTitle');
      this.dialog.innerHTML=`<section class="entry-chooser-content"><header><div><h2 id="avatarChooserTitle">Choose your avatar</h2><p>Your portrait appears beside your player name.</p></div><button type="button" data-avatar-close aria-label="Close avatar choices">×</button></header><div class="avatar-chooser-tabs" role="tablist" aria-label="Avatar categories"><button type="button" role="tab" id="avatarMenTab" data-avatar-group="men" aria-controls="avatarMenPanel">Male avatars</button><button type="button" role="tab" id="avatarWomenTab" data-avatar-group="women" aria-controls="avatarWomenPanel">Female avatars</button><button type="button" role="tab" id="avatarPhotoTab" data-avatar-group="photo" aria-controls="avatarPhotoPanel">Your Photo</button></div><div class="entry-chooser-body"><div id="avatarMenPanel" role="tabpanel" aria-labelledby="avatarMenTab" class="avatar-choice-grid" data-avatar-panel="men"></div><div id="avatarWomenPanel" role="tabpanel" aria-labelledby="avatarWomenTab" class="avatar-choice-grid" data-avatar-panel="women" hidden></div><div id="avatarPhotoPanel" role="tabpanel" aria-labelledby="avatarPhotoTab" data-avatar-panel="photo" hidden><div class="chooser-photo-preview" data-avatar-photo-preview></div><p class="chooser-photo-help">PNG, JPG or WebP · up to 8 MB. Your photo is shared with players in your room.</p><div class="chooser-photo-actions"><button type="button" data-avatar-replace>Upload photo</button><button type="button" data-avatar-photo>Use this photo</button><button type="button" data-avatar-remove>Remove photo</button><input type="file" data-avatar-upload accept="image/png,image/jpeg,image/webp" aria-label="Upload personal avatar" hidden></div></div><p class="chooser-status" data-avatar-dialog-status role="status" aria-live="polite"></p></div><footer>Choose a portrait to use it. Confirm your selection on the setup screen.</footer></section>`;
      document.body.append(this.dialog);
      this.views=['create','join'].map(form=>{
        const root=document.getElementById(form+'AvatarPicker'),node=document.getElementById(form+'Form');
        const view={form,root,node,confirmedKey:null,trigger:root.querySelector('[data-avatar-open]')};
        view.trigger.onclick=()=>this.openChooser(view);
        const genders=[...root.querySelectorAll('[data-avatar-gender]')];
        for(const button of genders){
          button.onclick=()=>this.chooseGender(button.dataset.avatarGender);
          button.onkeydown=event=>{
            if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
            event.preventDefault();const next=event.key==='Home'?genders[0]:event.key==='End'?genders[1]:genders[(genders.indexOf(button)+1)%2];next.focus();this.chooseGender(next.dataset.avatarGender);
          };
        }
        root.querySelector('[data-avatar-confirm]').onclick=()=>{
          if(this.busy||this.submitting||this.pieces&&!this.pieces.isReady(view.form))return;
          view.confirmedKey=this.selectionKey(view.form);this.persist();this.updateConfirmation();
        };
        return view;
      });
      this.dialog.querySelector('[data-avatar-close]').onclick=()=>this.closeChooser();
      this.dialog.onclick=event=>{if(event.target===this.dialog)this.closeChooser();};
      this.tabs=[...this.dialog.querySelectorAll('[data-avatar-group]')];
      for(const tab of this.tabs){tab.onclick=()=>this.selectGroup(tab.dataset.avatarGroup);tab.onkeydown=event=>{
        if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
        event.preventDefault();const visible=this.tabs.filter(button=>!button.hidden&&!button.disabled),index=visible.indexOf(tab),next=event.key==='Home'?0:event.key==='End'?visible.length-1:(index+(event.key==='ArrowLeft'?-1:1)+visible.length)%visible.length;this.selectGroup(visible[next].dataset.avatarGroup);visible[next].focus();
      };}
      for(const item of avatars.items){
        const button=document.createElement('button');button.type='button';button.className='avatar-choice';button.dataset.avatarChoice=item.id;button.innerHTML=avatars.html(item.id)+'<strong></strong><span class="choice-check" aria-hidden="true">✓</span>';button.querySelector('strong').textContent=item.name;
        button.onclick=()=>{this.choose(item.id);this.closeChooser();};
        this.dialog.querySelector('[data-avatar-panel="'+(item.id.startsWith('man-')?'men':'women')+'"]').append(button);
      }
      this.dialog.querySelector('[data-avatar-replace]').onclick=()=>this.dialog.querySelector('[data-avatar-upload]').click();
      this.dialog.querySelector('[data-avatar-upload]').onchange=event=>void this.upload(event.target);
      this.dialog.querySelector('[data-avatar-photo]').onclick=()=>{if(this.photo){this.choose('personal');this.closeChooser();}};
      this.dialog.querySelector('[data-avatar-remove]').onclick=()=>this.removePhoto();
      window.addEventListener('pagehide',()=>this.closeChooser());
      this.selectGroup('men');this.render();void this.restoreDefault();
    }
    openChooser(view){
      if(this.busy||this.submitting||!this.entryEnabled)return;
      this.pieces?.closeChooser();
      this.selectGroup(this.personal?'photo':this.avatar.startsWith('woman-')?'women':'men');this.dialog.showModal();
    }
    closeChooser(){if(this.dialog.open)this.dialog.close();}
    presetGroup(){return this.avatar.startsWith('woman-')?'women':'men';}
    chooseGender(gender){
      if(this.busy||this.submitting||!this.entryEnabled||!['male','female'].includes(gender))return;
      const prefix=gender==='female'?'woman-':'man-';
      if(!this.personal&&this.avatar.startsWith(prefix))return;
      this.choose(avatars.items.find(item=>item.id.startsWith(prefix)).id);
    }
    selectGroup(group){
      const preset=this.presetGroup();this.group=group==='photo'?'photo':preset;
      for(const tab of this.tabs){
        tab.hidden=tab.dataset.avatarGroup!==preset&&tab.dataset.avatarGroup!=='photo';
        const active=tab.dataset.avatarGroup===this.group;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;
      }
      this.dialog.querySelectorAll('[data-avatar-panel]').forEach(panel=>panel.hidden=panel.dataset.avatarPanel!==this.group);
      this.dialog.querySelector('#avatarChooserTitle').textContent=this.group==='photo'?'Your photo':'Choose a '+(preset==='women'?'female':'male')+' avatar';
    }
    setEntryEnabled(value){this.entryEnabled=value;if(!value)this.closeChooser();}
    async restoreDefault(){
      if(!window.MiniopolyAvatarDefault?.enabled)return;
      this.setBusy(true);this.status('Loading your saved avatar…');
      try{
        const profile=await window.MiniopolyAvatarDefault.load();
        if(profile){
          this.avatar=avatars.resolve(profile.avatar).id;
          this.photo=avatars.isPersonalImage(profile.photo)?profile.photo:null;
          this.personal=Boolean(this.photo&&profile.personal);
          this.resetConfirmation();this.persist(false);this.render();
        }else if(this.photo||read('miniopoly_avatar_v1')){
          await window.MiniopolyAvatarDefault.save({avatar:this.avatar,photo:this.photo,personal:this.personal});
        }else{
          // An unused address must not overwrite a photo saved at the other one.
          this.status('Choose your avatar. Your selection will be remembered for Local and Online.');return;
        }
        this.status('Saved for Local and Online. Confirm your avatar and piece below.');
      }catch{this.status('Using your avatar saved at this game address. The shared default is unavailable.',true);}
      finally{this.setBusy(false);}
    }
    selection(){return {avatar:this.avatar,avatarImage:this.personal?this.photo:null};}
    selectionKey(form){return JSON.stringify([this.personal?this.photo:this.avatar,form&&this.pieces?this.pieces.selection(form):null]);}
    isConfirmed(form){return !this.busy&&(!this.pieces||this.pieces.isReady(form))&&this.views.find(view=>view.form===form)?.confirmedKey===this.selectionKey(form);}
    requireConfirmation(form){
      if(this.isConfirmed(form))return true;
      if(this.pieces&&!this.pieces.isReady(form))this.pieces.focus(form);else if(!this.busy)this.views.find(view=>view.form===form)?.root.querySelector('[data-avatar-confirm]').focus();
      return false;
    }
    resetConfirmation(form){for(const view of this.views)if(!form||view.form===form)view.confirmedKey=null;this.updateConfirmation();}
    updateConfirmation(){
      for(const view of this.views){
        const confirmed=this.isConfirmed(view.form),button=view.root.querySelector('[data-avatar-confirm]');
        view.root.querySelector('.avatar-review').classList.toggle('is-confirmed',confirmed);
        view.root.querySelector('[data-avatar-confirm-status]').textContent=this.busy?'Preparing your avatar…':confirmed?'✓ Avatar and piece confirmed':this.pieces&&!this.pieces.isReady(view.form)?'Choose an available piece before confirming.':'Confirm your avatar and piece before continuing.';
        button.textContent=confirmed?'Confirmed':'Confirm selection';button.disabled=this.busy||this.submitting||confirmed||Boolean(this.pieces&&!this.pieces.isReady(view.form));
        view.node.querySelector('button[type="submit"]').disabled=this.submitting||!confirmed;
      }
    }
    render(){this.updateSelection();}
    updateSelection(){
      const selected=this.personal?'personal':this.avatar;
      for(const view of this.views){
        view.root.querySelector('[data-avatar-current]').innerHTML=avatars.html(this.avatar,0,this.personal?this.photo:null);
        const name=this.personal?'Your photo':avatars.resolve(this.avatar).name;view.root.querySelector('[data-avatar-selected]').textContent=name;
        view.trigger.setAttribute('aria-label','Choose '+(this.presetGroup()==='women'?'female':'male')+' avatars or your photo, selected '+name);view.trigger.disabled=this.busy||this.submitting;
        for(const button of view.root.querySelectorAll('[data-avatar-gender]')){
          button.setAttribute('aria-pressed',String(!this.personal&&(button.dataset.avatarGender==='female')===(this.presetGroup()==='women')));button.disabled=this.busy||this.submitting;
        }
      }
      for(const button of this.dialog.querySelectorAll('[data-avatar-choice]')){button.setAttribute('aria-pressed',String(button.dataset.avatarChoice===selected));button.disabled=this.busy||this.submitting;}
      this.dialog.querySelector('[data-avatar-photo-preview]').innerHTML=this.photo?avatars.html(this.avatar,0,this.photo):'<span class="empty-photo" aria-hidden="true">+</span><span>No photo added yet</span>';
      this.dialog.querySelector('[data-avatar-replace]').textContent=this.photo?'Replace photo':'Upload photo';
      this.dialog.querySelector('[data-avatar-remove]').hidden=!this.photo;this.dialog.querySelector('[data-avatar-photo]').hidden=!this.photo;
      this.selectGroup((this.dialog.open&&this.group==='photo')||this.personal?'photo':this.presetGroup());
      this.updateConfirmation();
    }
    persist(sync=true){
      remember('miniopoly_avatar_v1',this.avatar);
      remember('miniopoly_avatar_photo_v1',this.photo);
      remember('miniopoly_avatar_use_photo_v1',this.personal?'yes':'no');
      if(sync)window.MiniopolyAvatarDefault?.save({avatar:this.avatar,photo:this.photo,personal:this.personal}).catch(()=>this.status('Saved for this game address. Could not update your Local / Online default; try selecting it again.',true));
    }
    choose(id){
      if(this.busy||this.submitting)return;
      const previous=this.selectionKey();this.personal=id==='personal'&&Boolean(this.photo);
      if(!this.personal)this.avatar=avatars.resolve(id).id;
      if(previous!==this.selectionKey())this.resetConfirmation();
      this.persist();this.updateSelection();this.status('');
    }
    status(message,error=false){
      for(const node of [...this.views.map(view=>view.root.querySelector('[data-avatar-status]')),this.dialog.querySelector('[data-avatar-dialog-status]')]){node.textContent=message;node.classList.toggle('is-error',error);}
    }
    setSubmitting(value){if(this.submitting===value)return;this.submitting=value;if(value)this.closeChooser();this.setBusy(this.busy);}
    setBusy(value){
      this.busy=value;this.pieces?.setBusy(value||this.submitting);
      for(const view of this.views){view.trigger.disabled=value||this.submitting;view.root.querySelectorAll('[data-avatar-gender]').forEach(button=>button.disabled=value||this.submitting);}
      this.dialog.querySelectorAll('button:not([data-avatar-close]),input').forEach(input=>input.disabled=value||this.submitting);
      this.updateConfirmation();
    }
    async upload(input){
      const file=input.files?.[0];if(!file||this.busy||this.submitting)return;
      this.setBusy(true);this.status('Preparing your photo…');
      try{
        this.photo=await preparePhoto(file);this.personal=true;this.resetConfirmation();this.persist();this.render();this.status('Your photo is ready. Confirm your selection below to continue.');this.closeChooser();
      }catch(error){this.status(error.message||'Could not open this photo. Try another image.',true);}
      finally{input.value='';this.setBusy(false);}
    }
    removePhoto(){
      if(this.busy||this.submitting)return;
      if(this.personal)this.resetConfirmation();this.photo=null;this.personal=false;this.persist();this.render();this.status('Photo removed. A game avatar is selected.');
      this.dialog.querySelector('[data-avatar-replace]').focus();
    }
  }
  window.MiniopolyAvatarPicker=AvatarPicker;
})();
