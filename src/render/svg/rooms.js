/* Room views for the SVG renderer. Each view takes the game state and returns an SVG string. */
import {walls, floor, plainFloor, candle, hot, vignette, dark, pillar} from './helpers.js';

export function rfNorth(S){
  const f=S.f; let s=walls()+plainFloor();
  s+=hot('vitriol',`<rect x="320" y="125" width="320" height="50" fill="transparent"/><text x="480" y="160" text-anchor="middle" font-family="Georgia,serif" font-size="24" letter-spacing="8" fill="#a8977a">V·I·T·R·I·O·L</text>`);
  s+=`<rect x="300" y="300" width="400" height="14" fill="#3a2e24"/><rect x="315" y="314" width="14" height="84" fill="#2a2018"/><rect x="671" y="314" width="14" height="84" fill="#2a2018"/>`;
  let sk=`<ellipse cx="390" cy="272" rx="24" ry="21" fill="#cfc4a8"/><rect x="378" y="284" width="24" height="16" rx="4" fill="#bfb497"/><ellipse cx="381" cy="272" rx="6" ry="7" fill="#1a1512"/><ellipse cx="399" cy="272" rx="6" ry="7" fill="#1a1512"/><path d="M380 292 H400 M384 288 V296 M390 288 V296 M396 288 V296" stroke="#6b6250" stroke-width="1.5"/>`;
  if(!f.flint) sk+=`<path d="M388 292 L392 289 L395 293 L391 296Z" fill="#e8e4dc" class="pulse"/>`;
  s+=hot('skull',sk);
  let c=`<ellipse cx="480" cy="300" rx="20" ry="5" fill="#2a2420" stroke="#5a4c40"/><rect x="475" y="268" width="10" height="32" fill="#d8ccb0"/><path d="M480 268 V262" stroke="#1a1512" stroke-width="1.5"/>`;
  if(f.lit) c=`<circle cx="480" cy="240" r="260" fill="url(#candle)"/>`+c+`<ellipse class="flame" cx="480" cy="254" rx="5" ry="12" fill="#ffd27a"/>`;
  s+=hot('candle',c);
  s+=hot('hourglass',`<rect x="565" y="252" width="34" height="6" fill="#4a3a2a"/><rect x="565" y="294" width="34" height="6" fill="#4a3a2a"/><path d="M570 258 L594 258 L582 276 L594 294 L570 294 L582 276Z" fill="#8fa3a8" opacity=".5" stroke="#c9d5d8"/><path d="M574 292 L590 292 L582 284Z" fill="#c9a86a"/>`);
  s+=hot('bread',`<path d="M622 300 Q640 280 660 300Z" fill="#8a6a3e"/><ellipse cx="676" cy="296" rx="14" ry="5" fill="#3a3530"/><ellipse cx="676" cy="294" rx="11" ry="3" fill="#2f5560"/>`);
  if(!f.lit) s+=dark(.8);
  return s;
}
export function rfEast(S){
  const f=S.f; let s=walls()+plainFloor();
  if(f.open1){
    s+=hot('toHall',`<rect x="400" y="170" width="160" height="228" fill="url(#stair)" opacity=".85"/><circle cx="480" cy="300" r="140" fill="url(#warm)" opacity=".5"/>`);
    s+=`<polygon points="400,170 340,190 340,410 400,398" fill="url(#plank)" stroke="#1f160f" stroke-width="2"/>`;
  } else {
    s+=hot('innerdoor',`<rect x="400" y="170" width="160" height="228" fill="url(#plank)" stroke="#1f160f" stroke-width="3"/>
      <rect x="400" y="200" width="160" height="10" fill="#1d1a18"/><rect x="400" y="350" width="160" height="10" fill="#1d1a18"/>
      <rect x="525" y="270" width="22" height="34" fill="#2a2622" stroke="#5a4c40"/><circle cx="536" cy="282" r="3.5" fill="#000"/><rect x="534.5" y="283" width="3" height="10" fill="#000"/>`);
    s+=`<rect x="400" y="396" width="160" height="4" fill="#ffcf7a" opacity=".8"/>`;
  }
  s+=`<rect x="392" y="162" width="176" height="238" fill="none" stroke="#3b332d" stroke-width="10"/>`;
  if(!f.lit){ s+=dark(.82); if(!f.open1) s+=`<rect x="400" y="396" width="160" height="4" fill="#ffcf7a" opacity=".9"/><ellipse cx="480" cy="410" rx="120" ry="14" fill="#ffcf7a" opacity=".12"/>`; }
  return s;
}
export function rfSouth(S){
  const f=S.f; let s=walls()+plainFloor();
  s+=hot('inscription',`<rect x="300" y="115" width="360" height="40" fill="transparent"/><text x="480" y="142" text-anchor="middle" font-family="Georgia,serif" font-size="17" letter-spacing="4" fill="#a8977a">NONE RETURN THE WAY THEY CAME</text>`);
  s+=hot('entrance',`<path d="M400 400 V255 A80 80 0 0 1 560 255 V400Z" fill="url(#brick)" stroke="#4d4238" stroke-width="7"/><path d="M405 300 H555 M410 340 H550" stroke="#6b5f52" stroke-width="1" opacity=".5"/>`);
  if(!f.lit) s+=dark(.82);
  return s;
}
export function rfWest(S){
  const f=S.f; let s=walls()+plainFloor();
  s+=`<rect x="300" y="190" width="120" height="90" fill="#1a1512" stroke="#3b332d" stroke-width="6"/><path d="M330 260 Q345 215 360 240 Q375 205 390 260" stroke="#6b5f52" fill="none" stroke-width="2" opacity=".6"/>`;
  if(f.slab){
    s+=hot('slab',`<polygon points="420,440 540,440 560,490 400,490" fill="#050404" stroke="#3a332c" stroke-width="2"/><polygon points="575,445 690,445 712,494 555,494" fill="#3a332c" stroke="#1b1715" stroke-width="2"/><rect x="615" y="456" width="50" height="26" fill="none" stroke="#5a4c40"/>`);
    if(!f.keyTaken) s+=hot('key',`<rect x="455" y="452" width="50" height="30" fill="transparent"/><circle cx="470" cy="467" r="6" fill="none" stroke="#b8a37a" stroke-width="2.5"/><path d="M476 467 H496 M490 467 V473 M494 467 V472" stroke="#b8a37a" stroke-width="2.5"/>`);
  } else {
    s+=hot('slab',`<polygon points="420,440 540,440 560,490 400,490" fill="#3a332c" stroke="#5a4c40" stroke-width="2"/><polygon points="455,452 505,452 513,478 447,478" fill="none" stroke="#7a6b58" stroke-width="2"/>`);
  }
  if(f.lit&&!f.barTaken) s+=hot('bar',`<rect x="690" y="240" width="60" height="160" fill="transparent"/><path d="M705 398 L738 250" stroke="#6b3f22" stroke-width="7" stroke-linecap="round"/><path d="M734 246 L744 240 L742 254Z" fill="#6b3f22"/>`);
  if(!f.lit) s+=dark(.82);
  return s;
}

/* ================= DEGREE I · room 2: the Hall of Instruction ================= */
export function hlNorth(S){
  const f=S.f; let s=walls()+floor();
  if(f.rung){
    s+=hot('toLodge',`<rect x="390" y="130" width="180" height="265" fill="url(#stair)"/><circle cx="480" cy="270" r="160" fill="url(#warm)" opacity=".55"/>`);
    s+=`<rect x="384" y="124" width="192" height="276" fill="none" stroke="#4a3f36" stroke-width="10"/>`;
  } else {
    s+=hot('lodgeDoor',`<rect x="390" y="130" width="180" height="265" fill="url(#plank)" stroke="#1f160f" stroke-width="3"/><path d="M480 130 V395" stroke="#1f160f" stroke-width="4"/>
      <g stroke="#b89a5a" stroke-width="3" fill="none" opacity=".8"><path d="M480 196 L452 266 M480 196 L508 266"/><path d="M452 248 L480 276 L508 248"/><circle cx="480" cy="196" r="4"/></g>`);
    s+=`<rect x="384" y="124" width="192" height="276" fill="none" stroke="#4a3f36" stroke-width="10"/>`;
  }
  let lect=`<rect x="232" y="300" width="16" height="95" fill="#3a2a1e"/><rect x="214" y="390" width="52" height="8" fill="#2a2018"/><polygon points="196,300 284,300 292,284 188,284" fill="#3a2a1e" stroke="#1f160f"/>`;
  if(f.dust) lect+=`<path d="M200 282 Q240 268 240 282 Q240 268 280 282 L276 270 Q240 256 240 270 Q240 256 204 270Z" fill="#d8ccb0" stroke="#8a7a60"/><path d="M212 274 H232 M248 274 H268 M214 278 H232" stroke="#6b5f52" stroke-width="1"/>`;
  else lect+=`<rect x="205" y="268" width="70" height="16" fill="#6d655a" stroke="#4a443c"/><g fill="#9a938a" opacity=".6"><circle cx="220" cy="270" r="2"/><circle cx="245" cy="272" r="1.5"/><circle cx="262" cy="269" r="2"/></g>`;
  s+=hot('book',lect);
  s+=candle(660,395)+`<rect x="654" y="365" width="12" height="30" fill="#2d2622"/>`;
  return s;
}
export function hlEast(S){
  const f=S.f; let s=walls()+floor();
  let st=`<rect x="420" y="340" width="120" height="55" fill="#3b332d" stroke="#1b1715" stroke-width="2"/>`;
  if(f.veil){
    st+=`<circle cx="480" cy="180" r="20" fill="#6b6359"/><polygon points="452,202 508,202 528,340 432,340" fill="#5d564d"/><path d="M462 230 Q480 250 498 230" stroke="#4a443c" stroke-width="6" fill="none"/>`;
    st+=`<circle cx="474" cy="176" r="2" fill="#2a2420"/><circle cx="486" cy="176" r="2" fill="#2a2420"/>`;
  } else {
    st+=`<path d="M455 340 Q440 250 462 190 Q470 150 480 152 Q490 150 498 190 Q520 250 505 340Z" fill="#141014" stroke="#2a2430"/><path d="M468 200 Q465 270 470 338 M492 200 Q497 270 490 338" stroke="#2a2430" fill="none"/>`;
  }
  s+=hot('statue',st);
  if(f.veil&&!f.cordTaken) s+=hot('cord',`<circle cx="480" cy="258" r="16" fill="none" stroke="#a07a45" stroke-width="3"/><circle cx="480" cy="258" r="10" fill="none" stroke="#a07a45" stroke-width="3"/><circle cx="480" cy="258" r="4" fill="none" stroke="#a07a45" stroke-width="3"/>`);
  return s+candle(330,395)+candle(630,395);
}
export function hlWest(S){
  const f=S.f; let s=walls()+floor();
  let b=`<path d="M380 110 H480 V132" stroke="#1a1614" stroke-width="7" fill="none"/><path d="M450 200 Q450 140 480 135 Q510 140 510 200 L522 212 H438Z" fill="#8a7346" stroke="#5a4a2a" stroke-width="2"/><circle cx="480" cy="214" r="6" fill="#5a4a2a"/>`;
  b+=`<path d="M480 214 V240" stroke="#a07a45" stroke-width="4"/><path d="M476 240 L484 244 L478 248" stroke="#a07a45" stroke-width="2" fill="none"/>`;
  if(f.tied) b+=`<circle cx="480" cy="246" r="5" fill="#a07a45"/><path d="M480 246 Q486 310 480 380" stroke="#a07a45" stroke-width="4" fill="none"/>`;
  else b+=`<rect x="440" y="130" width="80" height="120" fill="transparent"/>`;
  s+=hot('bell',b);
  s+=`<rect x="560" y="360" width="110" height="18" fill="#3a2a1e"/><rect x="566" y="378" width="10" height="20" fill="#2a2018"/><rect x="654" y="378" width="10" height="20" fill="#2a2018"/>`;
  return s+candle(300,395);
}
export function hlSouth(S){
  let s=walls()+floor();
  s+=hot('toReflection',`<rect x="400" y="170" width="160" height="228" fill="url(#dimway)"/><circle cx="480" cy="300" r="60" fill="url(#candle)"/>`);
  s+=`<rect x="392" y="162" width="176" height="238" fill="none" stroke="#3b332d" stroke-width="10"/><polygon points="400,170 340,190 340,410 400,398" fill="url(#plank)" stroke="#1f160f" stroke-width="2"/>`;
  return s+candle(300,395)+candle(660,395);
}

/* ================= DEGREE I · room 3: the Apprentice's Chamber ================= */
export function c1North(S){
  const f=S.f; let s=walls()+floor()+pillar(170,'pillarL')+pillar(730,'pillarR');
  let board=`<rect x="370" y="105" width="220" height="155" fill="#33281d" stroke="#8a6b3a" stroke-width="5"/><rect x="384" y="119" width="192" height="127" fill="#2a2018"/>`;
  if(f.board){
    board+=`<g filter="url(#glow)" fill="#f2c25a" font-family="Georgia,serif" font-size="12" letter-spacing="2" text-anchor="middle">
      <text x="480" y="150">LIGHT WHERE</text><text x="480" y="166">THERE IS NONE</text>
      <text x="480" y="192">HEAR WHAT</text><text x="480" y="208">WAS LEFT</text>
      <text x="480" y="232">GIVE THE STONE ITS VOICE</text></g>`;
  } else board+=`<g stroke="#c9a86a" fill="none" opacity=".1"><rect x="455" y="140" width="50" height="50"/><circle cx="480" cy="165" r="38"/><path d="M400 225H560"/></g>`;
  s+=hot('board',board);
  s+=hot('altar',`<rect x="380" y="300" width="200" height="95" fill="#3a312a"/><rect x="365" y="290" width="230" height="14" fill="#4b4037"/>
    <g stroke="#8a7a60" fill="none" opacity=".35">${[0,1,2].map(i=>`<rect x="${405+i*30}" y="330" width="16" height="16"/>`).join('')}${[0,1,2].map(i=>`<circle cx="${503+i*30}" cy="338" r="8"/>`).join('')}</g>`);
  s+=hot('candles',candle(405,290)+candle(555,290));
  return s;
}
export function c1East(S){
  const f=S.f; let s=walls()+floor();
  s+=`<rect x="262" y="330" width="16" height="65" fill="#2d2622"/><rect x="682" y="330" width="16" height="65" fill="#2d2622"/>`+candle(270,330)+candle(690,330);
  const arch="M330 400 V210 A150 150 0 0 1 630 210 V400 Z";
  if(f.door){
    let st=`<path d="${arch}" fill="url(#stair)"/>`;
    for(let i=0;i<6;i++) st+=`<path d="M${350+i*8} ${395-i*30}H${610-i*8}" stroke="#8a6230" stroke-width="2" opacity=".6"/>`;
    st+=`<circle cx="480" cy="230" r="160" fill="url(#warm)" opacity=".6"/>`;
    s+=hot('doorway',st)+`<path d="${arch}" fill="none" stroke="#6f6152" stroke-width="8"/>`;
  } else {
    s+=hot('door',`<path d="${arch}" fill="#332b26" stroke="#6f6152" stroke-width="8"/>
      <g stroke="#1e1915" stroke-width="2" fill="none"><path d="M330 300H630M330 350H630M333 250H627M480 70V230M480 280V400M405 250V300M555 250V300M405 350V400M555 350V400M380 300V350M580 300V350"/></g>`);
    let m=`<ellipse cx="480" cy="255" rx="46" ry="20" fill="#0e0b0a"/><path d="M434 255 Q480 228 526 255 M434 255 Q480 282 526 255" stroke="#5a4c40" stroke-width="4" fill="none"/>`;
    if(!f.seal){
      m+=`<circle class="pulse" cx="480" cy="255" r="72" fill="none" stroke="#b89a5a" stroke-width="3" stroke-dasharray="10 8"/>`;
      for(let i=0;i<8;i++){const a=i*Math.PI/4, x=480+84*Math.cos(a), y=255+84*Math.sin(a); m+=`<rect x="${x-5}" y="${y-5}" width="10" height="10" fill="none" stroke="#b89a5a" stroke-width="1.5" transform="rotate(45 ${x} ${y})"/>`;}
    } else m+=`<g stroke="#5a4c40" stroke-width="2" opacity=".7"><path d="M400 230 L420 236M560 280 L540 274M470 175 L474 190M492 330 L488 316"/></g>`;
    s+=hot('mouth',m);
  }
  return s;
}
export function c1South(S){
  let s=walls()+floor();
  s+=hot('toHall2',`<path d="M400 400 V255 A80 80 0 0 1 560 255 V400Z" fill="url(#dimway)" stroke="#4d4238" stroke-width="7"/><circle cx="480" cy="330" r="50" fill="url(#candle)"/>`);
  return s+candle(330,395)+candle(630,395);
}
export function c1West(S){
  const f=S.f; let s=walls()+floor();
  s+=`<path d="M350 400 V225 A130 130 0 0 1 610 225 V400Z" fill="#3b332d" stroke="#1b1715" stroke-width="2"/>`;
  s+=hot('alcove',`<path d="M372 400 V228 A108 108 0 0 1 588 228 V400Z" fill="${f.sconce?'url(#alcoveLit)':'#040303'}"/>`);
  if(f.sconce){
    let d=''; for(let t=0;t<=6*Math.PI;t+=0.15){const r=3+3*t; d+=(t?'L':'M')+(480+r*Math.cos(t)).toFixed(1)+' '+(285+r*Math.sin(t)).toFixed(1);}
    const taken=f.breath||f.seal;
    let w=`<circle cx="480" cy="285" r="62" fill="transparent"/><path d="${d}" fill="none" stroke="#c9b48a" stroke-width="3" opacity="${taken?.35:.85}"/>`;
    if(f.whisper&&!taken) w+=`<g class="wisp" stroke="#cfe6ff" stroke-width="2" fill="none" opacity=".7"><path d="M450 240 q10 -20 0 -40 q-10 -20 5 -35"/><path d="M500 236 q-8 -18 4 -36 q10 -16 0 -34"/></g>`;
    s+=hot('whisper',w);
  }
  let sc=`<path d="M262 250 H292 V232" stroke="#1a1614" stroke-width="7" fill="none"/><path d="M276 232 H308 L300 214 H284 Z" fill="#2a2420" stroke="#5a4c40" stroke-width="2"/>`;
  if(f.sconce) sc=`<circle cx="292" cy="205" r="110" fill="url(#warm)"/>`+sc+`<circle class="pulse" cx="292" cy="205" r="11" fill="#ffe08a" filter="url(#glow)"/>`;
  else sc+=`<rect x="250" y="190" width="70" height="70" fill="transparent"/>`;
  s+=hot('sconce',sc);
  if(!f.sconce) s+=dark(.25);
  return s;
}

/* ================= DEGREE II views ================= */
export function crownShape(x,y,tilt){return `<g transform="rotate(${tilt} ${x} ${y})"><rect x="${x-38}" y="${y-8}" width="76" height="16" fill="#4a4038" stroke="#1b1715"/><circle cx="${x}" cy="${y-30}" r="22" fill="#463c34" stroke="#8a7a60" stroke-width="2"/><path d="M${x-22} ${y-30}H${x+22}M${x} ${y-52}V${y-8}" stroke="#8a7a60" opacity=".6"/></g>`;}
export function c2North(S){
  const f=S.f; let s=walls()+floor()+pillar(170,'pillarL');
  if(f.pillar) s+=pillar(730,'pillarR');
  else s+=hot('pillarR',`<rect x="730" y="250" width="60" height="145" fill="#3b332d" stroke="#1b1715" stroke-width="2"/><polygon points="730,250 742,238 752,252 766,232 778,247 790,240 790,252 730,252" fill="#3b332d" stroke="#1b1715"/><path d="M745 255V390M760 255V390M775 255V390" stroke="#2a2420" stroke-width="2"/><rect x="720" y="392" width="80" height="14" fill="#4a4038"/>`);
  if(f.crownHere&&!f.pillar) s+=hot('crown',crownShape(845,385,-18));
  s+=`<path d="M360 400 V210 A120 120 0 0 1 600 210 V400Z" fill="#3b332d" stroke="#6f6152" stroke-width="6"/><rect x="370" y="398" width="220" height="14" fill="#1d2a2e"/>`;
  if(f.veilOpen){
    s+=`<path d="M378 400 V212 A102 102 0 0 1 582 212 V400Z" fill="#0b0908"/><g clip-path="url(#archClip)"><rect x="378" y="100" width="22" height="300" fill="url(#ice)"/><rect x="560" y="100" width="22" height="300" fill="url(#ice)"/></g>`;
    if(f.pillar) s+=hot('doorway',`<rect x="440" y="250" width="80" height="145" fill="url(#stair)"/><circle cx="480" cy="300" r="110" fill="url(#warm)" opacity=".7"/>`);
    else s+=hot('inner',`<rect x="440" y="250" width="80" height="145" fill="#3a2f27" stroke="#5a4c40" stroke-width="3"/><rect x="424" y="270" width="10" height="125" fill="none" stroke="#5a4c40" stroke-dasharray="4 4"/><rect x="526" y="270" width="10" height="125" fill="none" stroke="#5a4c40" stroke-dasharray="4 4"/>`);
  } else if(f.veilStill){
    s+=hot('veil',`<path d="M378 400 V212 A102 102 0 0 1 582 212 V400Z" fill="url(#ice)"/><g stroke="#ffffff" opacity=".5" stroke-width="1.5"><path d="M400 380 L450 300 L430 240M520 390 L540 320 L500 260 L520 200M470 330 L490 280"/></g>`);
  } else {
    let lines=''; for(let x=384;x<580;x+=9) lines+=`<path class="fall" d="M${x} 100 V400" stroke="#9fd7e4" stroke-width="2" opacity="${0.35+((x*7)%5)/10}" style="animation-delay:-${(x%13)/26}s"/>`;
    s+=hot('veil',`<path d="M378 400 V212 A102 102 0 0 1 582 212 V400Z" fill="#244d59" opacity=".85"/><g clip-path="url(#archClip)">${lines}</g>`);
  }
  return s;
}
export function c2East(S){
  const f=S.f; let s=walls();
  s+=`<rect x="0" y="330" width="960" height="34" fill="#3b332d"/><path d="M0 330H960" stroke="#5a4c40" stroke-width="2"/>`;
  s+=floor();
  s+=hot('chasm',`<rect x="0" y="362" width="960" height="108" fill="url(#chasmG)"/><path d="M0 470 L120 466 L240 472 L380 465 L520 471 L660 466 L800 472 L960 467" stroke="#5e574b" stroke-width="3" fill="none"/>`);
  let br=`<path d="M670 330 L680 290 M710 330 L700 290 M690 330 V290" stroke="#2a2420" stroke-width="4"/><path d="M655 290 Q690 315 725 290 Z" fill="#2d2622" stroke="#5a4c40" stroke-width="2"/>`;
  if(f.brazier) br=`<circle cx="690" cy="270" r="200" fill="url(#fire)"/>`+br+`<ellipse class="flame" cx="690" cy="272" rx="14" ry="26" fill="#ff9a40"/><ellipse class="flame" cx="680" cy="278" rx="8" ry="16" fill="#ffd27a" style="animation-delay:-.5s"/><ellipse class="flame" cx="701" cy="279" rx="7" ry="14" fill="#ffd27a" style="animation-delay:-1s"/>`;
  else br+=`<rect x="645" y="270" width="90" height="62" fill="transparent"/>`;
  s+=hot('brazier',br);
  if(f.brazier&&!f.crownHere) s+=hot('crown',crownShape(300,322,12));
  if(!f.brazier) s+=`<rect width="960" height="365" fill="#000" opacity=".6" pointer-events="none"/>`;
  return s;
}
export function c2South(S){
  let s=walls()+floor();
  s+=hot('inscription',`<rect x="190" y="105" width="580" height="44" fill="transparent"/><text x="480" y="134" text-anchor="middle" font-family="Georgia,serif" font-size="15" letter-spacing="3" fill="#a8977a">THE FELLOWCRAFT LEARNS TO CARRY, TO MEND, AND TO STILL</text>`);
  let st=`<ellipse cx="480" cy="420" rx="150" ry="55" fill="#080607"/>`;
  for(let i=0;i<6;i++){const a=-Math.PI+i*0.45; st+=`<path d="M480 420 L${480+150*Math.cos(a)} ${420+55*Math.sin(a)}" stroke="#4a4038" stroke-width="3"/>`;}
  st+=`<circle cx="480" cy="420" r="14" fill="#3b332d"/><path d="M330 420 A150 55 0 0 1 630 420" stroke="#5e574b" stroke-width="4" fill="none"/>`;
  s+=hot('stair',st);
  return s+candle(300,395)+candle(660,395);
}
export function c2West(S){
  const f=S.f; let s=walls()+floor();
  s+=hot('mirrorText',`<rect x="250" y="120" width="460" height="44" fill="transparent"/><text transform="translate(960,0) scale(-1,1)" x="480" y="150" text-anchor="middle" font-family="Georgia,serif" font-size="20" letter-spacing="4" fill="#a8977a">STILL THE WATER, THEN PART IT</text>`);
  let b=`<rect x="455" y="300" width="50" height="95" fill="#3b332d"/><rect x="435" y="388" width="90" height="12" fill="#4a4038"/><path d="M400 280 Q480 330 560 280 Z" fill="#3b332d" stroke="#5a4c40" stroke-width="2"/><ellipse cx="480" cy="282" rx="78" ry="12" fill="${f.read?'#6fd0e2':'#2f6170'}" opacity="${f.read?.8:1}"/>`;
  if(f.read) b+=`<text x="480" y="286" text-anchor="middle" font-family="Georgia,serif" font-size="8" letter-spacing="1" fill="#0d2a33">STILL THE WATER, THEN PART IT</text>`;
  s+=hot('basin',b);
  return s+candle(320,395)+candle(640,395);
}

/* Views per room: [North, East, South, West]. */
export const ROOM_VIEWS={
  reflection:[rfNorth,rfEast,rfSouth,rfWest],
  hall:[hlNorth,hlEast,hlSouth,hlWest],
  apprentice:[c1North,c1East,c1South,c1West],
  middle:[c2North,c2East,c2South,c2West]
};
