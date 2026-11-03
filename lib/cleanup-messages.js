'use strict';
const crypto=require('node:crypto');
const lines={
 start:['Clean Bot #1010 activated. Dirt, your time is up.','Clean Bot #1010 reporting for duty. Please secure loose garden gnomes.'],
 moving:['Cleaning activated. Now moving to {property}.','Clean Bot #1010 proceeding to inspect {property}.','Next stop: {property}. Bringing brushes and questionable enthusiasm.','Proceeding to {property}. This is my version of a vacation.','Maintenance incoming at {property}. No dust bunny left behind.'],
 inspection:['Inspection underway at {property}. Awaiting {owner}’s maintenance decision.','{property}: awaiting instructions from {owner}. My broom is getting impatient.'],
 maintained:['{property} cleaned. Full condition restored; dirt has left the chat.','Maintenance complete at {property}. Fresh pavement, fresh rent.'],
 renovated:['{property} renovated. Condition restored and temporary rent bonus activated.'],
 closed:['{property} temporarily closed. My broom will respect the barricade.'],
 booked:['{owner} booked priority maintenance at {property}. Rerouting after the current inspection.'],
 housecall:['{owner} requested priority maintenance at {property}. Clean Bot #1010 dispatched!'],
 complete:['Priority maintenance complete at {property}. Thank you for choosing robot over elbow grease.'],
 teleport:['Lap complete. Teleporting to {property}. No fuel receipts required.'],
 end:['Route complete. Returning to recharge—and judge your landscaping.','All three neighborhoods visited. My brushes deserve a holiday.']
};
function announce(room,kind,{property='',owner='',board=room.cleanup.board,pos=room.cleanup.pos}={}){
 const c=room.cleanup,pool=lines[kind];if(!c||!pool)return;
 const previous=c.broadcasts?.at(-1),alternatives=pool.filter(t=>t!==previous?.template),options=alternatives.length?alternatives:pool,template=options[crypto.randomInt(options.length)];
 const text=template.replaceAll('{property}',property).replaceAll('{owner}',owner);
 const message={id:crypto.randomUUID(),kind,text,board,pos,at:Date.now(),template};
 c.broadcasts=[...(c.broadcasts||[]),message].slice(-12);room.log.unshift(text);return message;
}
module.exports={announce};
