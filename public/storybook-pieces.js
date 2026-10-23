/* Hand-drawn vector pieces. Stored symbols remain stable save-file keys, never visible emoji. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MiniopolyStorybookPieces=api;})(typeof window==='undefined'?globalThis:window,function(){
 'use strict';
 const kinds=Object.freeze({'🚗':'blimp','📱':'airplane','🦖':'trex','🛵':'shoes','🚀':'battleship','🎮':'hat','car':'car'});
 const stroke='stroke="#294c50" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"';
 function blimp(){return `<svg viewBox="10 5 580 390" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><g ${stroke}>
 <path d="M126 112 40 44 52 151 25 212 132 209" fill="#ea9a57"/><path d="m64 74 58 57-64 10M59 195l65-9" fill="none" stroke="#ffc783" stroke-width="10"/>
 <path d="M120 83C217 15 433 35 531 130Q579 176 531 220C433 300 208 310 116 235Q52 184 120 83Z" fill="#55b6b0"/>
 <path d="M118 106C236 36 443 61 528 139Q545 154 546 169C415 91 224 97 93 154Q96 126 118 106Z" fill="#bde6cb" stroke="none"/>
 <path d="M91 184C229 217 436 219 550 173Q553 199 519 226C388 296 208 294 116 235Q91 214 91 184Z" fill="#32988e" stroke="none"/>
 <path d="M137 102Q94 164 142 232M230 64Q194 166 224 267M348 59Q359 170 348 273M460 92Q487 169 461 248" fill="none" stroke="#3c918c" stroke-width="4" opacity=".65"/>
 <path d="M262 272 274 305M373 274l-9 32" fill="none"/><path d="M255 305h132l-11 39q-2 13-20 14h-67q-17-1-23-14Z" fill="#e8b36b"/>
 <path d="M265 316h110" stroke="#ffe1a1" stroke-width="9"/><path d="M284 320h22v18h-22Zm40 0h22v18h-22Z" fill="#5d9fac" stroke-width="4"/>
 <path d="M288 358v13m67-13v13"/><ellipse cx="288" cy="375" rx="12" ry="7" fill="#34484d"/><ellipse cx="355" cy="375" rx="12" ry="7" fill="#34484d"/>
 <g transform="translate(243 328)"><g class="blimp-propeller"><path d="M0-22V22" stroke="#334852" stroke-width="10"/><path d="M0-20V-8" stroke="#e8d6b8" stroke-width="6"/></g><circle r="5" fill="#ecc478" stroke-width="3"/></g>
 <path d="M183 104Q222 83 257 81" fill="none" stroke="#e7f4d8" stroke-width="12"/>
 </g></svg>`;}
 function airplane(){return `<svg viewBox="5 5 580 390" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><g ${stroke}>
 <path d="m123 169-39-95q-4-13-21-12L40 67l22 119" fill="#d86550"/><path d="m65 81 20 60" stroke="#ffb08a" stroke-width="9"/>
 <path d="m207 163 63-108q8-15 26-12l50 10-20 111" fill="#4ba8ae"/><path d="m277 66-49 86" stroke="#a9e0d1" stroke-width="10"/>
 <path d="M68 160Q120 140 206 151L421 152Q474 154 515 197Q486 233 419 235L197 220Q113 210 68 183Z" fill="#fff0ca"/>
 <path d="M87 184Q210 210 459 210l48-10q-24 33-88 35L197 220Q122 209 87 184Z" fill="#d9c99b" stroke="none"/>
 <path d="M191 156q7-36 49-37h56l30 35" fill="#72b6c7"/><path d="m245 122-3 32m45-32 15 32" stroke="#315460" stroke-width="5"/><path d="m211 143 21-13" stroke="#d5f1e3" stroke-width="7"/>
 <path d="m210 207 95 90q12 11 30 5l52-20-83-70" fill="#4ba8ae"/><path d="m239 227 79 60 31-8" fill="none" stroke="#91d7cc" stroke-width="10"/>
 <path d="m100 174-66 26 7 18 119-21" fill="#d86550"/>
 <path d="M455 157q26 8 57 38l-19 17-53-2Z" fill="#d86550"/>
 <path d="m292 248 10 70m101-87 7 71"/><circle cx="302" cy="323" r="20" fill="#344850"/><circle cx="410" cy="309" r="16" fill="#344850"/><circle cx="302" cy="323" r="7" fill="#d2daca" stroke-width="3"/>
 <g transform="translate(520 195)"><g class="plane-propeller"><path d="M0-64V64" stroke="#344850" stroke-width="16"/><path d="M0-59v21m0 76v21" stroke="#e7bf71" stroke-width="10"/></g><circle r="11" fill="#f7cc75" stroke-width="4"/></g>
 <path d="m352 168 48 2" stroke="#fff9e8" stroke-width="8"/>
 </g></svg>`;}
 function trex(){const leg=(x,far)=>`<g transform="translate(${x} 271)"><g class="trex-leg ${far?'trex-far-leg':'trex-near-leg'}"><path d="M0-12Q-19 33-4 68l16 30h68q7-18-17-23L40 62q4-36-11-74Z" fill="${far?'#428d72':'#6bbf86'}"/><path d="m48 83 1 12m18-12 1 12" fill="none" stroke="#e5e6ae" stroke-width="7"/></g></g>`;return `<svg viewBox="5 5 580 390" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><g ${stroke}>
 <g class="trex-body"><g transform="translate(218 218)"><g class="trex-tail"><path d="M0 0Q-96 34-162-92Q-154 5-92 54L-4 73Z" fill="#59a477"/></g></g>
 ${leg(303,true)}<path d="M173 253q-4-79 84-111l77-20q71 11 78 86l-34 73q-22 65-109 56-79-9-96-84Z" fill="#72bc7e"/>
 <path d="M304 183q69 4 67 72-4 48-53 62l-32-1q30-40 18-133Z" fill="#d8dd9b" stroke="none"/>
 <path d="m198 199-20-27 40 4-8-34 37 11 5-33 31 22 19-32 18 28" fill="#e4c768" stroke-width="4"/>
 <path d="m366 206 30 25 26-2m-29-7 1 17m-13-8 1 11" fill="none" stroke="#428a67" stroke-width="15"/>
 ${leg(244,false)}<g class="trex-head"><path d="M319 182q-5-86 55-111 43-20 88 12 44-1 66 31l26 34q-3 40-53 50l-74 3-37 35Z" fill="#7bc98b"/>
 <path d="M392 171q56 18 138-2-6 33-65 33l-40-1-36 24Z" fill="#c2db97" stroke="none"/>
 <ellipse cx="428" cy="112" rx="20" ry="25" fill="#fff7d9" stroke-width="4"/><ellipse cx="436" cy="116" rx="9" ry="14" fill="#294c50" stroke="none"/><circle cx="438" cy="110" r="4" fill="white" stroke="none"/>
 <path d="m412 80 24-3" fill="none" stroke-width="5"/><circle cx="514" cy="133" r="5" fill="#356b55" stroke="none"/>
 <path d="M443 164q31 16 71-1" fill="none" stroke-width="5"/><path d="m466 170 7 12 8-11m13-1 6 10 7-12" fill="#fff6cf" stroke-width="3"/>
 <circle cx="418" cy="156" r="9" fill="#91d79a" stroke="none"/><path d="M353 104q8-11 20-16" fill="none" stroke="#b0e2a2" stroke-width="9"/>
 </g></g></g></svg>`;}
 function shoe(far){return `<g class="shoe-step ${far?'shoe-far':'shoe-near'}"><path d="M73 125 149 88q21-9 39 4l66 56 90 27q31 8 34 41H65q-20-14-5-36Z" fill="${far?'#d58058':'#4c9da7'}"/><path d="m104 115 45 27 37-30-16-19" fill="${far?'#f6bd80':'#b7e1d2'}"/><path d="M68 201q70 18 135 8l175-3v26q-106 22-215 7l-99-2q-18-6-15-25Z" fill="#fff1d0"/><path d="M73 222q87 14 157 9l131-10" fill="none" stroke="#b3bdac" stroke-width="4"/>
 <path d="m173 133 43-3m-23 18 44-4m-25 19 44-6" stroke="#fff7df" stroke-width="9"/><path d="m147 175 16 13q44-4 69-15" fill="none" stroke="${far?'#ad593c':'#286a79'}" stroke-width="10"/>
 <path d="M280 181q25-3 49 12M77 153l-8 29" fill="none" stroke="${far?'#f8c18c':'#8ed0ce'}" stroke-width="8"/>
 </g>`;}
 function shoes(){return `<svg viewBox="0 0 590 390" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><g ${stroke}><g transform="translate(60 -5) scale(.9)">${shoe(true)}</g><g transform="translate(65 100)">${shoe(false)}</g></g></svg>`;}
 function battleship(){return `<svg viewBox="0 0 640 400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
 <g class="ship-water"><path d="M51 302Q-14 309 24 336q30 19 113 19l108 15q110 15 221-3l113-12q71-7 47-34-18-21-98-23Z" fill="#74c7cc" opacity=".7"/><path d="M61 320q83-15 152 4t150 4 176-10" fill="none" stroke="#b9e8dd" stroke-width="10" stroke-linecap="round"/><g class="ship-calm-ripples" fill="none" stroke="#398eab" stroke-width="4" stroke-linecap="round" opacity=".7"><path d="M62 342q31 7 61 0m89 15q42 8 82 0m104-12q44 9 90 0m55-14 35-4"/></g></g>
 <g class="ship-wake" fill="none" stroke-linecap="round"><path class="wake-stream" d="M7 307Q80 288 159 310M10 330Q87 345 169 334" stroke="#effbf0" stroke-width="9" stroke-dasharray="26 18"/><path class="wake-stream wake-bow" d="M573 294q18 6 43 18m-37-7q12 12 30 18" stroke="#fff9de" stroke-width="7" stroke-dasharray="18 12"/><g class="wake-bubbles" fill="#edf9e9" stroke="none"><circle cx="125" cy="321" r="5"/><circle cx="71" cy="309" r="4"/><circle cx="44" cy="334" r="5"/></g></g>
 <g class="ship-body" ${stroke}>
 <g class="ship-steam" fill="#edf0df" stroke="#a7b7ad" stroke-width="3"><g class="steam-puff puff-one"><circle cx="293" cy="91" r="17"/><circle cx="308" cy="74" r="20"/><circle cx="324" cy="87" r="15"/></g><g class="steam-puff puff-two"><circle cx="362" cy="95" r="15"/><circle cx="378" cy="79" r="20"/><circle cx="394" cy="94" r="15"/></g><g class="steam-puff puff-three"><circle cx="295" cy="89" r="16"/><circle cx="312" cy="71" r="18"/></g></g>
 <path d="M74 241 516 226l91 8-42 68q-65 22-169 22H146q-44-6-72-83Z" fill="#537e96"/>
 <path d="M94 278q156 27 310 14l176-22-16 32q-65 22-169 22H146q-33-6-52-46Z" fill="#294e69" stroke="none"/>
 <path d="M107 295q223 28 465-11" fill="none" stroke="#da916b" stroke-width="9"/>
 <path d="M74 241 118 217l391-7 98 24-98 22-393 7Z" fill="#e5d7ae"/>
 <path d="m100 240 404-9 76 5-76 12-386 4Z" fill="#bcc8bb" stroke="none"/>
 <path d="M214 225v-61l113-5 26 65Z" fill="#91b2b6"/>
 <path d="M235 163V123h68l19 38Z" fill="#b5d2cf"/>
 <path d="m226 122 83-3 13 12-91 3Z" fill="#456a80"/>
 <path d="M239 143h17m12-1h17m12 0h6" stroke="#31556d" stroke-width="10"/>
 <path d="M282 201v-90h29v90m42 6v-89h30v90" fill="#e8b379"/>
 <path d="M279 112h35m36 7h36" stroke="#355569" stroke-width="12"/>
 <path d="M227 124V42m-32 21h61m-45 20h34m-40 37 21-36 32 78" fill="none" stroke-width="4"/>
 <path d="M229 44q22-15 42-3l-3 21q-18-12-39 2Z" fill="#ce765d" stroke-width="4"/>
 <path d="M411 192V83m-22 20h42m-32 18h24m-36 73 24-47 31 56" fill="none" stroke-width="4"/>
 <ellipse cx="411" cy="85" rx="19" ry="7" fill="#bad6ce" stroke-width="4"/>
 <path d="M391 225v-32h52l20 31" fill="#86a5ad"/>
 <g fill="#9cb7bb" stroke-width="4"><path d="M461 230v-20q27-18 50 0l13 20Z"/><path d="M141 239v-19q24-17 46-1l14 20Z"/></g>
 <path d="m495 211 59-8m-56 16 61-6m-395 11-49-5m51 13-50-4" stroke="#35576b" stroke-width="8"/>
 <g fill="#e8d7a7" stroke-width="3"><circle cx="174" cy="279" r="6"/><circle cx="213" cy="281" r="6"/><circle cx="252" cy="282" r="6"/><circle cx="291" cy="282" r="6"/><circle cx="330" cy="281" r="6"/><circle cx="369" cy="279" r="6"/></g>
 <path d="m550 254-2 29m-12-12q9 21 23-2m-14-16 7-1" fill="none" stroke="#d2dfd0" stroke-width="4"/>
 <g fill="none" stroke="#55797e" stroke-width="3"><path d="M91 233v-16m22 10v-18m24 17v-17m23 17v-17m352 15v-20m24 25v-19m23 24v-19m23 22v-18M94 221l66-6m351-3 71 17"/></g>
 <path d="m331 239 39-1m-179 4h21" stroke="#fff1cd" stroke-width="5"/>
 </g></svg>`;}
 function car(){const wheel=(x)=>`<g transform="translate(${x} 302)"><circle r="45" fill="#31434d"/><circle r="30" fill="#adc7bf" stroke-width="5"/><g class="car-wheel-spokes"><path d="M0-23V23M-23 0h46M-16-16l32 32m-32 0 32-32" stroke="#587980" stroke-width="5"/></g><circle r="10" fill="#f1c178" stroke-width="4"/></g>`;return `<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><g ${stroke}>
 <path d="M73 249q7-39 55-46l48-76q14-23 44-24h116q33 2 55 32l52 70 69 20q30 11 32 47l-2 31H72Z" fill="#c96353"/>
 <path d="M106 246q53-30 117-29l208 1 80 23q13 5 20 19l-6 28H91Z" fill="#e5916b" stroke="none"/>
 <path d="M155 202 195 137q9-12 27-12h47v80Zm133 3v-80h43q21 2 39 25l37 55Z" fill="#8fc6ce" stroke-width="5"/>
 <path d="m186 184 25-39h22m78-2h18q16 0 30 23" fill="none" stroke="#d8eee1" stroke-width="9"/>
 <path d="M282 218v61m-154-60 5 49m270-50 18 59" fill="none" stroke="#a44e48" stroke-width="4"/>
 <path d="M304 234h24m-129 1h23" stroke="#ffe0a0" stroke-width="7"/>
 <path d="M72 276H55v30h72q8-64 57-64 51 0 58 64h160q8-64 57-64 51 0 58 64h39v-28h-14" fill="#3e747b"/>
 <path d="m72 286 40 2m149 0 120-1m141-2h17" stroke="#93c7bd" stroke-width="6"/>
 ${wheel(184)}${wheel(459)}
 <path d="M524 244h19v24h-24Z" fill="#fff1b6" stroke-width="4"/><path d="M76 241h17v25H74Z" fill="#af4d47" stroke-width="4"/>
 <path d="m398 180 18-5 12 13-18 9" fill="#3e747b" stroke-width="4"/>
 <path d="M227 111h87" fill="none" stroke="#f3b88b" stroke-width="8"/>
 </g></svg>`;}
 function hat(){return `<svg viewBox="15 5 550 390" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><g class="hat-body" ${stroke}>
 <ellipse cx="286" cy="307" rx="215" ry="55" fill="#393b56"/><path d="M75 303q18 47 211 48 178-1 212-42" fill="none" stroke="#242b43" stroke-width="13"/>
 <path d="M151 89q132-43 270 0l-23 212q-109 37-220-1Z" fill="#3e415f"/>
 <path d="M165 109q47 17 84 18l-4 166-54-2Z" fill="#5c607b" stroke="none"/><path d="m391 117 18-9-23 184-25 5Z" fill="#292f48" stroke="none"/>
 <ellipse cx="286" cy="87" rx="135" ry="40" fill="#656883"/><ellipse cx="286" cy="84" rx="111" ry="23" fill="#4d526e" stroke="none"/><path d="M196 78q82-22 169-1" fill="none" stroke="#8e92a4" stroke-width="7"/>
 <path d="M175 246q112 34 229-1l-6 47q-109 36-218 0Z" fill="#b76a61"/><path d="M183 252q103 28 211-1" fill="none" stroke="#df9c7c" stroke-width="8"/>
 <path d="M319 258q-20-18-40 2l8 30q20-13 35-4l16-26q-7-17-19-2Z" fill="#d58a75" stroke-width="4"/><circle cx="316" cy="269" r="9" fill="#f1bf89" stroke-width="3"/>
 </g><g class="hat-sparkles" fill="#edc66d" stroke="#b6934d" stroke-width="2"><path d="m455 74 8 17 19 7-19 7-8 18-7-18-18-7 18-7Z"/><path d="m111 151 5 12 14 5-14 5-5 12-5-12-13-5 13-5Z"/></g></svg>`;}
 const renderers={blimp,airplane,trex,shoes,battleship,hat,car};
 function kind(symbol){return typeof symbol==='string'&&Object.prototype.hasOwnProperty.call(kinds,symbol)?kinds[symbol]:null;}
 function flying(symbol){return ['blimp','airplane'].includes(kind(symbol));}
 function heading(from,to,fallback='east'){
  if(!from||!to)return fallback;const dx=to.x-from.x,dy=to.y-from.y;if(!Number.isFinite(dx)||!Number.isFinite(dy)||Math.max(Math.abs(dx),Math.abs(dy))<.01)return fallback;
  return Math.abs(dx)>=Math.abs(dy)?dx>=0?'east':'west':dy>=0?'south':'north';
 }
 function art(symbol,state='normal'){
  const name=kind(symbol);if(!name)return '';state=['normal','moving','small','setback'].includes(state)?state:'normal';
  return `<span class="token-art storybook-piece ${name}-piece${name==='car'?' car-rig':''} state-${state}${state==='moving'?' is-moving':''}" data-piece-kind="${name}"${flying(symbol)?' data-flight="true"':''}><span class="piece-ground-shadow"></span><span class="piece-elevation"><span class="piece-facing">${renderers[name]()}</span></span></span>`;
 }
 return Object.freeze({art,kind,flying,heading});
});
