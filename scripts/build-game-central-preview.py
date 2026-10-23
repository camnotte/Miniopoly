#!/usr/bin/env python3
"""Build an offline Game Central design review; never touches live game state."""
from pathlib import Path
import base64,io,json,xml.etree.ElementTree as ET
from PIL import Image
import sys
ROOT=Path(__file__).resolve().parent.parent
DESIGN=ROOT/'design/game-central'
def jpeg(im,size):
 im=im.convert('RGB');im.thumbnail(size,Image.Resampling.LANCZOS);b=io.BytesIO();im.save(b,format='JPEG',quality=86,optimize=True);return 'data:image/jpeg;base64,'+base64.b64encode(b.getvalue()).decode()
def svg_image(path):
 tree=ET.parse(path).getroot();image=next(n for n in tree if n.tag.endswith('image'));return tree,Image.open(io.BytesIO(base64.b64decode(image.attrib['href'].split(',')[1])))
data=json.loads((ROOT/'game-data.json').read_text());data['scenes']=[];data['art']={};data['avatars']=[]
for world,directory in enumerate(['richmond','communities','coastal']):
 center=['marsh','commons','estuary'][world]
 _,image=svg_image(ROOT/f'public/art/{directory}/{center}.svg');data['scenes'].append(jpeg(image,(1350,1020)))
 tree,image=svg_image(ROOT/f'public/art/{directory}/neighborhoods.svg')
 views=[n for n in tree if n.tag.endswith('view')]
 for deed,view in zip([d for d in data['deeds'] if d['board']==world and d['type']=='p'],views):
  x,y,w,h=map(int,view.attrib['viewBox'].split());data['art'][deed['id']]=jpeg(image.crop((x,y,x+w,y+h)),(512,384))
avatars=Image.open(ROOT/'public/art/avatars/players-v1.png');w,h=avatars.size
for i in range(10):data['avatars'].append(jpeg(avatars.crop(((i%5)*w//5,(i//5)*h//2,(i%5+1)*w//5,(i//5+1)*h//2)),(180,180)))
if '--assets' in sys.argv:
 outdir=ROOT/'public/art/central';outdir.mkdir(parents=True,exist_ok=True)
 def save_asset(url,name):
  (outdir/(name+'.jpg')).write_bytes(base64.b64decode(url.split(',')[1]));return '/art/central/'+name+'.jpg'
 data['scenes']=[save_asset(url,'world-'+str(i)) for i,url in enumerate(data['scenes'])]
 data['avatars']=[save_asset(url,'avatar-'+str(i)) for i,url in enumerate(data['avatars'])]
 data['art']={key:save_asset(url,'property-'+key) for key,url in data['art'].items()}
 (ROOT/'public/game-central-data.js').write_text('window.MiniopolyCentralData='+json.dumps(data,separators=(',',':'))+';\n')
 print('Game Central production thumbnails and catalog built.');sys.exit(0)
font=base64.b64encode((ROOT/'public/fonts/nunito.ttf').read_bytes()).decode()
html=(DESIGN/'index.template.html').read_text().replace('/*__FONT__*/',"@font-face{font-family:Nunito;src:url(data:font/ttf;base64,"+font+") format('truetype');font-weight:200 1000;font-display:swap}").replace('/*__CSS__*/',(DESIGN/'game-central.css').read_text()).replace('/*__DATA__*/',json.dumps(data,separators=(',',':'))).replace('/*__JS__*/',(DESIGN/'game-central.js').read_text())
# Retain the bundled font license in the standalone review artifact.
html=html.replace('<!--FONT_LICENSE-->','<!--\n'+(ROOT/'public/fonts/Nunito-OFL.txt').read_text()+'\n-->')
out=Path('/workspace/Miniopoly-Game-Central-Mockup.html');out.write_text(html);out.chmod(0o644)
print(f'{out}: {out.stat().st_size:,} bytes; Nunito, scenery and property/portrait artwork embedded. No external requests or live API calls.')
