/* One catalog for room saves, the player picker and the illustrated board. */
(function(root,factory){
  const avatars=factory();
  if(typeof module==='object'&&module.exports)module.exports=avatars;
  else root.MiniopolyAvatars=avatars;
})(typeof window==='undefined'?globalThis:window,function(){
  'use strict';
  const names=['Copper grin','Amber glasses','Curly daydreamer','Silver smile','Teal glasses','Silver laughter','Braided smile','Cobalt glasses','Lavender glance','Auburn joy'];
  const items=names.map((name,index)=>Object.freeze({id:(index<5?'man-':'woman-')+(index%5+1),name,index}));
  const legacy=['👨🏽','👩🏻','👨🏿','👩🏾','🧑🏼','👩🏼‍🦱','👨🏻‍🦰','👩🏿‍🦱'];
  const replacements=[0,5,4,9,2,8,1,6];
  function resolve(value,seat=0){
    const found=items.find(item=>item.id===value);
    if(found)return found;
    const old=legacy.indexOf(value);
    const fallback=Number.isInteger(seat)&&seat>=0?seat:0;
    return items[old>=0?replacements[old]:fallback%items.length];
  }
  const maxImageBytes=64*1024,maxImageLength=22+4*Math.ceil(maxImageBytes/3);
  function isPersonalImage(image){return typeof image==='string'&&image.length<=maxImageLength&&/^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/.test(image);}
  function html(value,seat=0,image){
    if(isPersonalImage(image))return `<img class="game-avatar is-personal" src="${image}" alt="Personal avatar" width="192" height="192">`;
    const item=resolve(value,seat),x=(item.index%5)*25,y=item.index<5?0:100;
    return `<span class="game-avatar" role="img" aria-label="${item.name} avatar" data-avatar="${item.id}" style="--avatar-x:${x}%;--avatar-y:${y}%"></span>`;
  }
  return Object.freeze({items:Object.freeze(items),resolve,html,isPersonalImage,maxImageBytes,maxImageLength});
});
