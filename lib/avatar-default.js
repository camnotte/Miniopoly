'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const avatars=require('../public/avatars');
const {personalAvatar}=require('./player-avatar');

// A private preference capability, never a room credential or a public default.
// Both connection modes use the same file outside the installed game folder.
function avatarDefaults(directory){
 const file=path.join(directory,'avatar-default.json');
 const read=()=>JSON.parse(fs.readFileSync(file,'utf8'));
 let key;
 try{
  fs.mkdirSync(directory,{recursive:true});
  try{fs.writeFileSync(file,JSON.stringify({key:crypto.randomBytes(32).toString('hex'),profile:null}),{flag:'wx',mode:0o600});}catch(error){if(error.code!=='EEXIST')throw error;}
  key=read().key;
  if(typeof key!=='string'||!/^[a-f0-9]{64}$/.test(key))throw Error('Invalid preference.');
 }catch{
  // A damaged optional preference must never prevent hosting or load a new room.
  return {key:null,request(){throw Object.assign(Error('The shared avatar default is unavailable. Your saved browser avatar can still be used.'),{status:503});}};
 }
 function request(body){
  if(typeof body?.key!=='string'||!/^[a-f0-9]{64}$/.test(body.key)||!crypto.timingSafeEqual(Buffer.from(key),Buffer.from(body.key)))throw Object.assign(Error('Open the game from Start-Miniopoly to use your shared avatar.'),{status:403});
  const saved=read();
  if(Object.hasOwn(body,'profile')){
   const value=body.profile;
   if(!value||typeof value!=='object'||Array.isArray(value))throw Object.assign(Error('Choose a valid avatar preference.'),{status:400});
   const photo=personalAvatar(value.photo);
   saved.profile={avatar:avatars.resolve(value.avatar).id,photo,personal:Boolean(photo&&value.personal)};
   const temporary=file+'.'+process.pid+'.tmp';
   fs.writeFileSync(temporary,JSON.stringify(saved),{mode:0o600});fs.renameSync(temporary,file);
  }
  return {profile:saved.profile};
 }
 return {key,request};
}
module.exports={avatarDefaults};
