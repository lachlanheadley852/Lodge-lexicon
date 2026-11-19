export function defs(){return `<defs>
<pattern id="stone" width="120" height="60" patternUnits="userSpaceOnUse"><rect width="120" height="60" fill="#29231f"/>
<path d="M0 1H120M0 30H120M0 59H120M40 0V30M100 0V30M10 30V60M70 30V60" stroke="#191513" stroke-width="2"/></pattern>
<pattern id="brick" width="40" height="20" patternUnits="userSpaceOnUse"><rect width="40" height="20" fill="#221c19"/>
<path d="M0 1H40M0 10H40M20 1V10M0 10V20M40 10V20" stroke="#120f0e" stroke-width="1.5"/></pattern>
<pattern id="plank" width="30" height="300" patternUnits="userSpaceOnUse"><rect width="30" height="300" fill="#3a2a1e"/><path d="M1 0V300" stroke="#1f160f" stroke-width="2"/></pattern>
<radialGradient id="vig" cx="50%" cy="45%" r="72%"><stop offset="50%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity=".9"/></radialGradient>
<radialGradient id="candle"><stop offset="0" stop-color="#ffcf7a" stop-opacity=".45"/><stop offset="1" stop-color="#ffcf7a" stop-opacity="0"/></radialGradient>
<radialGradient id="warm"><stop offset="0" stop-color="#ffd98a" stop-opacity=".8"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/></radialGradient>
<radialGradient id="fire"><stop offset="0" stop-color="#ffb060" stop-opacity=".85"/><stop offset="1" stop-color="#ff7a30" stop-opacity="0"/></radialGradient>
<radialGradient id="alcoveLit" cx="50%" cy="55%" r="65%"><stop offset="0" stop-color="#6b5434"/><stop offset="1" stop-color="#1c1610"/></radialGradient>
<linearGradient id="stair" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe2a0"/><stop offset="1" stop-color="#7a5524"/></linearGradient>
<linearGradient id="dimway" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a3826"/><stop offset="1" stop-color="#15100b"/></linearGradient>
<linearGradient id="chasmG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000"/><stop offset=".85" stop-color="#000"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
<linearGradient id="ice" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#cfeef5" stop-opacity=".75"/><stop offset=".5" stop-color="#7fb7c6" stop-opacity=".55"/><stop offset="1" stop-color="#cfeef5" stop-opacity=".7"/></linearGradient>
<filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<clipPath id="archClip"><path d="M378 400 V212 A102 102 0 0 1 582 212 V400Z"/></clipPath>
</defs>`;}
export function walls(){return `<rect width="960" height="392" fill="url(#stone)"/><rect width="960" height="392" fill="#000" opacity=".35"/>`;}
export function floor(c1='#121014',c2='#5e574b'){
  const vx=480,vy=170,top=392,bot=540,rows=6,cols=12; let s='';
  const ys=[];for(let i=0;i<=rows;i++) ys.push(top+(bot-top)*Math.pow(i/rows,1.5));
  const xb=j=>-520+j*(2000/cols);
  const X=(j,y)=>vx+(xb(j)-vx)*(y-vy)/(bot-vy);
  for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){
    const y1=ys[i],y2=ys[i+1];
    s+=`<polygon points="${X(j,y1)},${y1} ${X(j+1,y1)},${y1} ${X(j+1,y2)},${y2} ${X(j,y2)},${y2}" fill="${(i+j)%2?c1:c2}" stroke="#141110" stroke-width="1"/>`;
  }
  return s+`<rect y="392" width="960" height="148" fill="#000" opacity=".35"/>`;
}
export function plainFloor(){return floor('#26201c','#2c2520');}
export function candle(x,y){return `<circle cx="${x}" cy="${y-30}" r="80" fill="url(#candle)"/><rect x="${x-5}" y="${y-30}" width="10" height="30" fill="#d8ccb0"/><ellipse class="flame" cx="${x}" cy="${y-40}" rx="4" ry="10" fill="#ffd27a"/>`;}
export function hot(id,inner){return `<g class="hot" data-id="${id}">${inner}</g>`;}
export function vignette(){return `<rect width="960" height="540" fill="url(#vig)" pointer-events="none"/>`;}
export function dark(op){return `<rect width="960" height="540" fill="#000" opacity="${op}" pointer-events="none"/>`;}
export function pillar(x,id){return hot(id,`<rect x="${x}" y="110" width="60" height="285" fill="#3b332d" stroke="#1b1715" stroke-width="2"/>
  <path d="M${x+15} 115V390M${x+30} 115V390M${x+45} 115V390" stroke="#2a2420" stroke-width="2"/>
  <rect x="${x-10}" y="94" width="80" height="18" fill="#4a4038"/><rect x="${x-10}" y="392" width="80" height="14" fill="#4a4038"/>
  <circle cx="${x+30}" cy="70" r="23" fill="#463c34" stroke="#8a7a60" stroke-width="2"/>
  <path d="M${x+7} 70H${x+53}M${x+30} 47V93" stroke="#8a7a60" stroke-width="1" opacity=".6"/>`);}
