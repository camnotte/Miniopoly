'use strict';
// Only fixed, same-origin destinations may be sent to the private launcher window.
const destinations=Object.freeze({home:'/#home',saves:'/#saves',learn:'/#learn',ranks:'/#ranks',host:'/#host',setup:'/setup'});
function navigation(target){if(!Object.hasOwn(destinations,target))throw Error('Choose a launcher destination.');return destinations[target];}
function gameURL(status,consoleOrigin){
 if(status.phase!=='ready'||!status.url)throw Error('Start hosting before opening the game.');
 const url=new URL('/',status.url);url.searchParams.set('hostSetup',JSON.stringify(status.gameSettings||{}));
 url.searchParams.set('setupConsole',consoleOrigin);
 if(status.avatarProfileKey)url.hash='avatarProfile='+status.avatarProfileKey;
 return url.href;
}
module.exports={navigation,gameURL};
