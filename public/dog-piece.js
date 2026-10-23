/* Layered vector artwork keeps the dog's walking animation sharp at board size. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MiniopolyDogPiece=api;})(typeof window==='undefined'?globalThis:window,function(){
 'use strict';
 function art(state='normal'){
  state=['normal','moving','small','setback'].includes(state)?state:'normal';
  const leg=(x,front,far)=>`<g transform="translate(${x} 327)"><g class="dog-leg ${front?'dog-front-leg':'dog-back-leg'} ${far?'dog-far-leg':'dog-near-leg'}"><path d="M0-9Q-14 44 4 103" fill="none" stroke="${far?'#b98a5e':'#fff0d1'}" stroke-width="49" stroke-linecap="round"/><path d="M-18 25Q-6 44-12 62" fill="none" stroke="${far?'#94623f':'#dfba82'}" stroke-width="12" stroke-linecap="round"/><ellipse cx="17" cy="105" rx="38" ry="20" fill="${far?'#d1b18b':'#fff8e8'}" stroke="#68442e" stroke-width="6"/><path d="M21 103v13m13-13v10" stroke="${far?'#a07c5d':'#d1ad7f'}" stroke-width="4" stroke-linecap="round"/></g></g>`;
  return `<span class="token-art dog-art dog-rig state-${state}${state==='moving'?' is-moving':''}"><svg viewBox="20 35 720 445" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
   <ellipse cx="367" cy="458" rx="294" ry="17" fill="#173c35" opacity=".18"/>
   <g class="dog-body" stroke="#68442e" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
    <g transform="translate(190 283)"><g class="dog-tail"><path d="M0 0C-69-13-116-56-121-132" fill="none" stroke="#68442e" stroke-width="45"/><path d="M0 0C-69-13-116-56-121-132" fill="none" stroke="#d18a44" stroke-width="31"/><path d="M-112-95Q-120-115-121-132" fill="none" stroke="#fff3d8" stroke-width="32"/></g></g>
    ${leg(264,false,true)}${leg(475,true,true)}
    <path d="M171 286Q185 200 290 199L414 201Q474 198 503 249L500 337Q484 389 404 395L264 394Q175 384 171 286Z" fill="#e3ac66"/>
    <path d="M220 216Q263 197 324 203L409 205Q451 211 470 252Q458 315 404 323L310 317Q245 293 220 216Z" fill="#594033" stroke="none"/>
    <path d="M245 219Q298 202 364 215" fill="none" stroke="#8c6750" stroke-width="11"/>
    <path d="M438 250Q486 242 497 286L492 342Q472 387 421 392Q457 335 438 250Z" fill="#fff0d1" stroke="none"/>
    <path d="M218 357Q264 384 338 381" fill="none" stroke="#f2c68a" stroke-width="13"/>
    ${leg(218,false,false)}${leg(453,true,false)}
    <path d="M463 290Q451 251 462 211L505 181Q545 212 533 277L503 321Z" fill="#e3ac66"/>
    <path d="M486 244Q511 260 536 261" fill="none" stroke="#183f3c" stroke-width="25"/>
    <path d="M486 242Q511 256 536 257" fill="none" stroke="#3f9b91" stroke-width="14"/>
    <circle cx="519" cy="282" r="15" fill="#e7b64c" stroke="#875d2e" stroke-width="5"/><path d="m514 282 4 4 7-9" fill="none" stroke="#fff2be" stroke-width="4"/>
    <g class="dog-head">
     <path d="M465 214Q444 178 462 128Q480 74 531 76Q581 71 600 118L620 173Q636 183 671 191Q705 201 701 232Q700 260 664 271L579 274Q525 274 498 245Z" fill="#df9d54"/>
     <path d="M529 80Q550 114 541 156Q535 187 557 211L589 220Q567 188 579 154Q575 105 552 82Z" fill="#fff4dc" stroke="none"/>
     <path d="M559 199Q594 182 623 190L674 202Q702 210 696 236Q690 262 656 267L595 264Q558 258 559 229Z" fill="#fff4dc" stroke="none"/>
     <path d="M483 118Q445 89 429 128Q415 160 432 223Q442 255 462 243Q487 228 492 175Z" fill="#9f5c32"/>
     <g class="dog-ear"><path d="M473 118Q441 105 436 144Q431 177 448 219" fill="none" stroke="#bd7842" stroke-width="16"/></g>
     <ellipse cx="582" cy="161" rx="17" ry="22" fill="#fff9e9" stroke="none"/><ellipse cx="588" cy="165" rx="10" ry="15" fill="#2e2a25" stroke="none"/><circle cx="591" cy="159" r="4.5" fill="#fff" stroke="none"/>
     <path d="M568 130Q580 124 591 131" fill="none" stroke="#87502f" stroke-width="6"/>
     <path d="M682 200Q703 200 706 212Q707 225 687 232Q674 228 671 217Q672 206 682 200Z" fill="#302e2a" stroke="#302e2a" stroke-width="5"/><path d="M684 207h10" stroke="#9d9f92" stroke-width="5"/>
     <path d="M632 252Q631 279 644 279Q660 278 653 252" fill="#e28e82" stroke="#9f5b45" stroke-width="4"/>
     <path d="M605 239Q626 259 654 246Q668 240 679 240" fill="none" stroke="#68442e" stroke-width="6"/>
     <circle cx="607" cy="221" r="3" fill="#b58b63" stroke="none"/><circle cx="619" cy="216" r="3" fill="#b58b63" stroke="none"/>
    </g>
   </g>
  </svg></span>`;
 }
 return Object.freeze({art});
});
