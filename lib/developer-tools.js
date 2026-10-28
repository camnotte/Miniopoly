'use strict';
function parse(input){
 const bad=message=>{throw Object.assign(Error(message),{status:400})};
 if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!['action','round','die','repeat'].includes(k)))bad('Choose valid developer controls.');
 if(!['settings','start','jump'].includes(input.action))bad('Choose a developer action.');
 const round=input.round??1,die=input.die??null,repeat=input.repeat??false;
 if(!Number.isSafeInteger(round)||round<1||round>200)bad('Choose a round from 1 to 200.');
 if(die!==null&&(!Number.isInteger(die)||die<1||die>12))bad('Choose Random or a die value from 1 to 12.');
 if(typeof repeat!=='boolean')bad('Choose once or every roll.');
 return {action:input.action,round,die,repeat:die!==null&&repeat};
}
function draw(room){
 const dev=room.developer;
 if(!dev?.enabled||!Number.isInteger(dev.die)||dev.die<1||dev.die>12)return null;
 const value=dev.die;if(!dev.repeat)dev.die=null;return value;
}
module.exports={parse,draw};
