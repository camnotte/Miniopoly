'use strict';
// Package the artwork comparison and its original animated GIFs into one HTML.
// Usage: node scripts/build-special-spaces-preview.js /path/to/preview.html
const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'../public');
const output=path.resolve(process.argv[2]||'Miniopoly-Special-Spaces-Review.html');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const files=[
  ['art/special-preview/scenery.svg','image/svg+xml'],
  ['art/special-preview/rail-idle.png','image/png'],['art/special-preview/rail-active.gif','image/gif'],
  ['art/special-preview/chest-idle.png','image/png'],['art/special-preview/chest-active.gif','image/gif'],
  ['art/special-preview/setback.svg','image/svg+xml'],['art/richmond/neighborhoods.svg','image/svg+xml']
];
const embedded=Object.fromEntries(files.map(([name,mime])=>['/'+name,{mime,data:fs.readFileSync(path.join(root,name)).toString('base64')}]));
const data=(name,mime)=>'data:'+mime+';base64,'+fs.readFileSync(path.join(root,name)).toString('base64');
const css=read('special-spaces-preview.css').replaceAll('/fonts/nunito.ttf',data('fonts/nunito.ttf','font/ttf'));
let page=read('special-spaces-preview.html')
  .replace('<link rel="stylesheet" href="/special-spaces-preview.css">',()=>'<style>'+css+'</style>')
  .replace('<script defer src="/special-spaces-preview.js"></script>','')
  .replaceAll('/art/icons/dice.svg',data('art/icons/dice.svg','image/svg+xml'))
  .replaceAll('href="/review"','href="#sampleHeading"')
  .replace('← Graphics review','↓ View samples');
const assetJSON=JSON.stringify(embedded).replaceAll('<','\\u003c');
const loader='<script id="embeddedArtwork" type="application/json">'+assetJSON+'</script>'
  +'<script>window.MINI_SPECIAL_EMBEDDED=JSON.parse(document.getElementById("embeddedArtwork").textContent);</script>';
page=page.replace('</body>',()=>'<script id="nunitoLicense" type="text/plain">'+read('fonts/Nunito-OFL.txt').replaceAll('<','&lt;')+'</script>'+loader+'<script>'+read('special-spaces-preview.js')+'</script></body>');
fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,page);
console.log('Saved '+output+' ('+fs.statSync(output).size.toLocaleString()+' bytes; original GIFs embedded).');
