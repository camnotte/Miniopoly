from pathlib import Path
import xml.etree.ElementTree as E
import base64
out=Path(__file__).resolve().parent.parent
src=out/'source'
E.register_namespace('','http://www.w3.org/2000/svg')
svg=E.fromstring((src/'ship-base.svg').read_text())
for child in list(svg):
 if child.get('class')=='concept-bow-split':svg.remove(child)
svg.set('viewBox','-35 0 710 410');svg.set('class','wake-ship-svg')
# The front point is local x584,y283; every foam path runs toward decreasing x.
back='''<g xmlns="http://www.w3.org/2000/svg" class="bow-water-back" fill="none" stroke-linecap="round">
<path d="M585 282C485 251 237 240 48 279L50 314Q333 315 585 289Z" fill="#6dcbd1" opacity=".5"/>
<path class="flow-path far-flow" d="M585 282C482 251 230 249 45 282" stroke="#c5ffff" stroke-width="6" stroke-dasharray="28 14 6 9"/>
</g>'''
front='''<g xmlns="http://www.w3.org/2000/svg" class="bow-water-front" fill="none" stroke-linecap="round">
<path d="M586 282C503 328 258 369 35 339L20 363C244 407 493 356 586 290Z" fill="#79dcdf" opacity=".55"/>
<path d="M584 286C496 335 267 384 28 350" stroke="#9febed" stroke-width="19" opacity=".4"/>
<path class="flow-path near-flow" d="M584 286C496 335 267 384 28 350" stroke="#f1fff4" stroke-width="8" stroke-dasharray="35 10 9 10 17 8"/>
<path class="flow-path inner-flow" d="M582 284C481 319 261 350 51 322" stroke="#dafff4" stroke-width="5" stroke-dasharray="23 9 5 11"/>
<path class="flow-path outer-flow" d="M556 310C407 375 196 393 12 368" stroke="#c0f6f0" stroke-width="3" stroke-dasharray="31 13 7 9" opacity=".8"/>
<g class="flow-particles"/>
</g>'''
fade='<defs xmlns="http://www.w3.org/2000/svg"><linearGradient id="wake-fade" x1="0" y1="0" x2="620" y2="0" gradientUnits="userSpaceOnUse"><stop stop-color="white" stop-opacity="0"/><stop offset=".22" stop-color="white" stop-opacity=".35"/><stop offset=".52" stop-color="white"/></linearGradient><mask id="wake-fade-mask" maskUnits="userSpaceOnUse" x="-35" y="0" width="710" height="410"><rect x="-35" width="710" height="410" fill="url(#wake-fade)"/></mask></defs>'
back=back.replace('class="bow-water-back"','class="bow-water-back" mask="url(#wake-fade-mask)"')
front=front.replace('class="bow-water-front"','class="bow-water-front" mask="url(#wake-fade-mask)"')
svg.insert(0,E.fromstring(fade));svg.insert(1,E.fromstring(back));svg.append(E.fromstring(front))
svgtext=E.tostring(svg,encoding='unicode')
(out/'Battleship-Wake.svg').write_text(svgtext)
font=base64.b64encode(Path('/workspace/Miniopoly/public/fonts/nunito.ttf').read_bytes()).decode()
css=(src/'style.css').read_text().replace('FONT_DATA','data:font/ttf;base64,'+font)
html=(src/'index.html').read_text().replace('<!-- SHIP -->',svgtext).replace('/* STYLE */',css).replace('/* OCEAN */',(src/'ocean.js').read_text()).replace('/* MOTION */',(src/'motion.js').read_text())
(out/'Battleship-Wake-Mockup.html').write_text(html)
print('Built standalone mockup',len(html),'bytes')
