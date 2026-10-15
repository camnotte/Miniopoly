'use strict';
// Create a single-file review that contains the real board, fonts and artwork.
// Usage: node scripts/build-turn-panel-preview.js /path/to/output.html
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'../public');
const output=path.resolve(process.argv[2]||'Miniopoly-Floating-Turn-Panel.html');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const data=(name,mime)=>'data:'+mime+';base64,'+fs.readFileSync(path.join(root,name)).toString('base64');
const scenes={};
for(const world of ['richmond','communities','coastal']){
  for(const name of fs.readdirSync(path.join(root,'art',world)).filter(name=>name.endsWith('.svg'))){
    scenes['/art/'+world+'/'+name]=read('art/'+world+'/'+name);
  }
}
function css(name){
  let source=read(name);
  source=source.replaceAll('/fonts/nunito.ttf',data('fonts/nunito.ttf','font/ttf'));
  for(const asset of Object.keys(scenes))source=source.replaceAll(asset,data(asset.slice(1),'image/svg+xml'));
  return source;
}
const preamble='const EMBEDDED_SCENES='+JSON.stringify(scenes)+';'
  +'const EMBEDDED_URLS=Object.fromEntries(Object.entries(EMBEDDED_SCENES).map(([name,svg])=>[name,URL.createObjectURL(new Blob([svg],{type:"image/svg+xml"}))]));'
  +'const EMBEDDED_GO='+JSON.stringify([1,2,3].map(n=>data('go-world-'+n+'.webp','image/webp')))+';'
  +'const REVIEW_PARENT_ORIGIN=window.parent.location.origin;';
const catalog=read('storybook.js')+'\nconst LOCAL_VISUALS=window.MiniopolyVisuals;'
  +'window.MiniopolyVisuals=Object.freeze({...LOCAL_VISUALS,upgradeStar:'+JSON.stringify(data('art/icons/upgrade-star.png','image/png'))+','
  +'propertyArt(id){const source=LOCAL_VISUALS.propertyArt(id);if(!source)return "";const [name,fragment]=source.split("#");return EMBEDDED_URLS[name]+"#"+fragment;},'
  +'worldScenery(index){const scenery=LOCAL_VISUALS.worldScenery(index);return scenery?{...scenery,centerArt:EMBEDDED_URLS[scenery.centerArt]}:null;}});';
let board=read('board-v5-42.html')
  .replace('<link rel="stylesheet" href="/storybook-board.css">',()=>'<style>'+css('storybook-board.css')+'</style>')
  .replace('<script src="/storybook.js"></script>',()=>'<script>'+preamble+catalog+'</script>')
  .replace('<script defer src="/review-board.js"></script>','')
  .replace('src="/go-world-${displayBoard+1}.webp"','src="${EMBEDDED_GO[displayBoard]}"');
board=board.replaceAll('location.origin',"(REVIEW_PARENT_ORIGIN==='null'?'*':REVIEW_PARENT_ORIGIN)");
board=board.replace("const REVIEW_PARENT_ORIGIN=window.parent.(REVIEW_PARENT_ORIGIN==='null'?'*':REVIEW_PARENT_ORIGIN);",'const REVIEW_PARENT_ORIGIN=window.parent.location.origin;');
const split=board.indexOf('</head>');
let head=board.slice(0,split).replace(/@import\s+url\([^)]*\)\s*;/g,'').replace(/<link\b[^>]*href=["']https?:\/\/[^>]*>/g,'');
head+='<style id="turnPanelBoardStyle">'+read('turn-panel-board.css')+'</style>';
board=head+board.slice(split);
const hook=read('review-board.js')
  .replace("  if(new URLSearchParams(location.search).get('review')!=='graphics')return;",'')
  .replace('event.origin!==location.origin','event.origin!==REVIEW_PARENT_ORIGIN');
board=board.replace('</body>',()=>'<script>'+hook+'</script></body>');
let page=read('turn-panel-preview.html')
  .replace('<link rel="stylesheet" href="/floating-panel.css">',()=>'<style>'+css('floating-panel.css')+'</style>')
  .replace('<link rel="stylesheet" href="/turn-panel-preview.css">',()=>'<style>'+css('turn-panel-preview.css')+'</style>')
  .replace('<script defer src="/turn-panel-preview.js"></script>','')
  .replaceAll('/art/icons/dice.svg',data('art/icons/dice.svg','image/svg+xml'))
  .replaceAll('href="/review"','href="#previewWorldName"')
  .replace('← Graphics review','↓ View board')
  .replace('src="/board-v5-42.html?review=graphics"','src="about:blank"');
const controller=read('turn-panel-preview.js').replaceAll('},location.origin)',"},location.origin==='null'?'*':location.origin)");
const source=JSON.stringify(board).replaceAll('<','\\u003c');
const loader='<script id="offlineBoardSource" type="application/json">'+source+'</script>'
  +'<script>const offlineDocument=document.getElementById("previewBoard").contentDocument;offlineDocument.open();offlineDocument.write(JSON.parse(document.getElementById("offlineBoardSource").textContent));offlineDocument.close();</script>';
page=page.replace('</body>',()=>'<script id="nunitoLicense" type="text/plain">'+read('fonts/Nunito-OFL.txt').replaceAll('<','&lt;')+'</script>'+loader+'<script>'+controller+'</script></body>');
fs.mkdirSync(path.dirname(output),{recursive:true});
fs.writeFileSync(output,page);
console.log('Saved '+output+' ('+fs.statSync(output).size.toLocaleString()+' bytes).');
