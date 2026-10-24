'use strict';
// Build from the running game's actual card catalog, including a Markdown inventory.
// node scripts/build-card-review.js http://127.0.0.1:3000 /path/to/Miniopoly-Cards-Review.html
const fs=require('node:fs'),path=require('node:path');
async function main(){
  const source=process.argv[2],output=path.resolve(process.argv[3]||'Miniopoly-Cards-Review.html');
  if(!source)throw Error('Supply the running game URL, then an optional HTML output path.');
  const response=await fetch(new URL('/api/cards',source));if(!response.ok)throw Error('Could not read the game card catalog.');
  const catalog=await response.json();if(!Array.isArray(catalog.decks)||!['chest','weather','lucky','traffic','coastal'].every(id=>catalog.decks.some(deck=>deck.id===id)))throw Error('Incomplete card catalog.');
  const read=name=>fs.readFileSync(path.join(__dirname,'../public',name),'utf8');
  const index=read('index.html'),start=index.indexOf('<div id="cardReviewLayer"'),end=index.indexOf('<div id="legendaryLayer"',start);
  const markup=index.slice(start,end).replace(' hidden role="dialog" aria-modal="true"',' role="region"');
  const font=fs.readFileSync(path.join(__dirname,'../public/fonts/nunito.ttf')).toString('base64');
  const baseCSS="@font-face{font-family:Nunito;src:url(data:font/ttf;base64,"+font+") format('truetype');font-weight:200 1000;font-style:normal}*{box-sizing:border-box}[hidden]{display:none!important}body{margin:0;padding:26px;background:#234b49;color:#253f3d;font:500 16px/1.45 Nunito,system-ui,sans-serif}button,input,select{font:inherit}button{cursor:pointer}button:focus-visible,input:focus-visible,select:focus-visible{outline:3px solid #4684a5;outline-offset:3px}.card-review-dialog{margin:auto;max-height:none!important}.card-review-dialog #cardReviewClose{display:none!important}.card-review-dialog h2{margin:0}@media(max-width:700px){body{padding:0}.card-review-dialog{height:auto;min-height:100dvh}}";
  const json=JSON.stringify(catalog).replaceAll('<','\\u003c');
  const page='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Miniopoly · All Community and Chance Cards</title><style>'+read('game-update.css')+baseCSS+'</style></head><body data-card-review="standalone"><button id="cardReviewButton" hidden>View cards</button>'+markup+'<script id="cardCatalog" type="application/json">'+json+'</script><script>window.MINI_CARD_CATALOG=JSON.parse(document.getElementById("cardCatalog").textContent);</script><script>'+read('card-review.js')+'</script><script type="text/plain" id="nunitoLicense">'+read('fonts/Nunito-OFL.txt').replaceAll('<','&lt;')+'</script></body></html>';
  fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,page.replace('</body>',()=>'<script>'+read('build-info.js')+'</script></body>'));
  let inventory='# Miniopoly v'+require('../package.json').version+' — complete card inventory\n\n'+catalog.decks.reduce((n,d)=>n+d.cards.length,0)+' cards across '+catalog.decks.length+' decks. Community Chest and Chance both include Go to Setback and Building Permit.\n\n';
  for(const deck of catalog.decks){inventory+='## '+deck.name+' ('+deck.cards.length+')\n\nUsed by: '+deck.source+'.\n\n';for(const card of deck.cards)inventory+='- **'+card.title+'** — '+card.description+(card.active?'':' **Future feature; not usable yet.**')+'\n';inventory+='\n';}
  fs.writeFileSync(output.replace(/\.html$/i,'')+'-Inventory.md',inventory);
  console.log('Built '+output+' with '+catalog.decks.reduce((n,d)=>n+d.cards.length,0)+' cards and an accompanying inventory.');
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
