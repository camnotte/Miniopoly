'use strict';
// Usage: node scripts/build-portfolio-preview.js /path/to/Miniopoly-Property-Portfolio-Preview.html
// Bundle the real deed catalog, original artwork, font, and interactions into one HTML.
const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'../public'),output=path.resolve(process.argv[2]||'Miniopoly-Property-Portfolio-Preview.html');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const data=(name,mime)=>'data:'+mime+';base64,'+fs.readFileSync(path.join(root,name)).toString('base64');
const files=[...['richmond','communities','coastal'].map(world=>['art/'+world+'/neighborhoods.svg','image/svg+xml']),['art/icons/upgrade-star.png','image/png']];
const artwork=Object.fromEntries(files.map(([name,mime])=>['/'+name,{mime,data:fs.readFileSync(path.join(root,name)).toString('base64')}]));
const game=JSON.parse(fs.readFileSync(path.join(__dirname,'../game-data.json'),'utf8'));
const css=read('portfolio-preview.css').replaceAll('/fonts/nunito.ttf',data('fonts/nunito.ttf','font/ttf'));
let page=read('portfolio-preview.html').replace('<link rel="stylesheet" href="/portfolio-preview.css">',()=>'<style>'+css+'</style>')
  .replace('<script defer src="/storybook.js"></script>','').replace('<script defer src="/portfolio-preview.js"></script>','')
  .replaceAll('/art/icons/dice.svg',data('art/icons/dice.svg','image/svg+xml'));
const bundle=JSON.stringify({catalog:{deeds:game.deeds},artwork}).replaceAll('<','\\u003c');
const loader='<script id="portfolioBundle" type="application/json">'+bundle+'</script><script>const portfolioBundle=JSON.parse(document.getElementById("portfolioBundle").textContent);window.MINI_PORTFOLIO_DATA=portfolioBundle.catalog;window.MINI_PORTFOLIO_ASSETS=portfolioBundle.artwork;</script>';
page=page.replace('</body>',()=>'<script type="text/plain" id="nunitoLicense">'+read('fonts/Nunito-OFL.txt').replaceAll('<','&lt;')+'</script>'+loader+'<script>'+read('storybook.js')+'</script><script>'+read('portfolio-preview.js')+'</script></body>');
fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,page);
console.log('Saved '+output+' ('+fs.statSync(output).size.toLocaleString()+' bytes; all 28 deeds and artwork embedded).');
