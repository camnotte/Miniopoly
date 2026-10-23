/* Decorative fireworks only. Festival balances always come from the host. */
(function(root){'use strict';root.MiniopolyFestivalCelebration={fireworks(document){
 const layer=document.createElement('div');layer.className='festival-fireworks';layer.setAttribute('aria-hidden','true');
 for(let burst=0;burst<3;burst++){const group=document.createElement('span');group.className='festival-burst';group.style.setProperty('--burst-x',[31,69,50][burst]+'%');group.style.setProperty('--burst-y',[46,48,34][burst]+'%');group.style.setProperty('--burst-delay',burst*.3+'s');
  for(let i=0;i<14;i++){const spark=document.createElement('i');spark.style.setProperty('--angle',(i*360/14)+'deg');spark.style.setProperty('--distance',(80+(i%3)*25)+'px');spark.style.setProperty('--spark-color',['#ffe5a2','#efba68','#88d3bb'][i%3]);group.append(spark);}layer.append(group);
 }return layer;
}};})(window);
