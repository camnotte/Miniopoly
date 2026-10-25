'use strict';
const crypto=require('node:crypto'),{status}=require('../public/portal-recovery');
function damage(piece){
 const causes={
  car:['Hot debris flattened your police car’s tires. Repairs are needed.','Burning embers damaged your police car’s engine. Repairs are needed.'],
  'school-bus':['Hot debris flattened the school bus’s tires. Repairs are needed.','Burning embers damaged the school bus’s engine. Repairs are needed.'],
  '🚀':['Burning debris damaged the battleship’s hull. Repairs are needed.','Embers damaged the battleship’s engine. Repairs are needed.'],
  '📱':['Hot debris damaged the airplane’s landing gear. Repairs are needed.','Embers damaged the airplane’s engine. Repairs are needed.'],
  '🚗':['Flying embers scorched the blimp’s fabric. Repairs are needed.','Embers damaged the blimp’s propeller. Repairs are needed.'],
  '🛵':['Hot embers burned through your shoes’ soles. Replacements are needed.','Walking through hot debris caused burns. Medical treatment is needed.'],
  '🎮':['Hot embers scorched the Top Hat. Repairs are needed.','Ember smoke made you ill. Medical treatment is needed.'],
  '🐱':['Ember smoke made your cat ill. Veterinary treatment is needed.','Hot debris hurt your cat’s paws. Veterinary treatment is needed.'],
  '🐶':['Ember smoke made your dog ill. Veterinary treatment is needed.','Hot debris hurt your dog’s paws. Veterinary treatment is needed.'],
  '🦖':['Ember smoke made your T-Rex ill. Medical treatment is needed.','Hot debris injured your T-Rex’s feet. Medical treatment is needed.']
 };
 const choices=causes[piece]||['Ember smoke made you ill. Medical treatment is needed.'];return choices[crypto.randomInt(choices.length)];
}
function charge(room,player,id){const heat=status(room,id);if(!heat)return null;const amount=crypto.randomInt(heat.min,heat.max+1),cause=damage(player.piece);return {...heat,id,amount,cause,message:cause+' Pay $'+amount+' to the bank. '+(heat.age===0?'This property has just returned from the void; the embers are hottest.':'This property is cooling; damage fees are lower in its second recovered round.')+' Normal rent or a purchase decision follows this fee.'};}
module.exports={status,charge};
