/* SVG word and glint effects, drawn on the renderer's fx layer. */
import {SYL} from '../../game/data.js';

const NS='http://www.w3.org/2000/svg';
let fxSvg=null;
export function setFxLayer(svg){fxSvg=svg;}

export function mk(tag,attrs){const e=document.createElementNS(NS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);return e;}
export function anim(e,frames,opts){e.style.transformBox='fill-box';e.style.transformOrigin='center';try{e.animate(frames,Object.assign({fill:'forwards',easing:'ease-out'},opts));}catch(err){}}
export function fxCore(g,r,a,p,d,k){
  const col=SYL[r].color;
  const glow=mk('circle',{cx:p.x,cy:p.y,r:70*k,fill:col,filter:'url(#blur)',opacity:0}); g.appendChild(glow);
  anim(glow,[{transform:'scale(.2)',opacity:.9},{transform:'scale(1.6)',opacity:0}],{duration:900,delay:d});
  for(let i=0;i<14;i++){
    let e, dx=(Math.random()-.5)*160*k, dy;
    if(r==='LUM'){e=mk('circle',{cx:p.x,cy:p.y,r:2+Math.random()*2,fill:col});dy=-60-Math.random()*120;}
    else if(r==='KEL'){e=mk('rect',{x:p.x,y:p.y,width:4,height:4,fill:col});dy=40+Math.random()*100;}
    else if(r==='HAL'){e=mk('path',{d:`M${p.x} ${p.y} q6 -10 0 -20 q-6 -10 0 -20`,stroke:col,'stroke-width':1.5,fill:'none'});dy=-40-Math.random()*80;dx*=1.4;}
    else if(r==='MIR'){e=mk('ellipse',{cx:p.x,cy:p.y,rx:8,ry:3,stroke:col,'stroke-width':1.5,fill:'none'});dy=(Math.random()-.5)*80;}
    else if(r==='RAS'){e=mk('circle',{cx:p.x,cy:p.y,r:1.5+Math.random()*2.5,fill:Math.random()<.5?col:'#ffd27a'});dy=-100-Math.random()*140;dx*=.6;}
    else {e=mk('rect',{x:p.x,y:p.y,width:14,height:10,stroke:col,'stroke-width':1,fill:'none'});dy=-30-Math.random()*60;}
    e.setAttribute('opacity',0); g.appendChild(e);
    anim(e,[{transform:'translate(0,0)',opacity:0},{opacity:1,offset:.2},{transform:`translate(${dx}px,${dy}px)`,opacity:0}],{duration:1200+Math.random()*600,delay:d+Math.random()*200});
  }
  d+=300;
  if(a==='SE'){[0,250].forEach(o=>{const c=mk('circle',{cx:p.x,cy:p.y,r:40*k,fill:'none',stroke:col,'stroke-width':3,opacity:0});g.appendChild(c);
    anim(c,[{transform:'scale(.3)',opacity:1},{transform:'scale(6)',opacity:0}],{duration:1300,delay:d+o});});}
  if(a==='TU'){[110,85,60].forEach((rr,i)=>{const c=mk('circle',{cx:p.x,cy:p.y,r:rr*k,fill:'none',stroke:col,'stroke-width':2.5,'stroke-dasharray':'12 8',opacity:0});g.appendChild(c);
    anim(c,[{transform:'scale(1.6) rotate(0deg)',opacity:0},{opacity:1,offset:.3},{transform:'scale(.35) rotate(200deg)',opacity:0}],{duration:1400,delay:d+i*120});});}
  if(a==='PA'){[-1,1].forEach(s=>{const l=mk('rect',{x:p.x-2,y:p.y-110*k,width:4,height:220*k,fill:col,opacity:0});g.appendChild(l);
    anim(l,[{transform:'translateX(0)',opacity:1},{transform:`translateX(${s*140*k}px)`,opacity:0}],{duration:1200,delay:d});});
    const f=mk('rect',{x:p.x-6,y:p.y-110*k,width:12,height:220*k,fill:col,filter:'url(#blur)',opacity:0});g.appendChild(f);
    anim(f,[{transform:'scaleX(1)',opacity:.9},{transform:'scaleX(20)',opacity:0}],{duration:1200,delay:d});}
  if(a==='MO'){for(let i=0;i<6;i++){const ang=i*60, l=mk('rect',{x:p.x-1.5,y:p.y-90*k,width:3,height:90*k,fill:col,opacity:0,transform:`rotate(${ang} ${p.x} ${p.y})`});g.appendChild(l);
      try{l.animate([{opacity:0},{opacity:1,offset:.15},{opacity:1,offset:.75},{opacity:0}],{duration:1600,delay:d,fill:'forwards'});}catch(e){}}
    let pts=''; for(let i=0;i<6;i++){const an=i*Math.PI/3; pts+=`${p.x+70*k*Math.cos(an)},${p.y+70*k*Math.sin(an)} `;}
    const hx=mk('polygon',{points:pts,fill:'none',stroke:col,'stroke-width':2.5,opacity:0}); g.appendChild(hx);
    anim(hx,[{transform:'scale(.2)',opacity:0},{transform:'scale(1)',opacity:1,offset:.25},{transform:'scale(1)',opacity:1,offset:.75},{transform:'scale(1)',opacity:0}],{duration:1600,delay:d});}
  if(a==='NE'){[-1,1].forEach(s=>{const arc=mk('path',{d:`M${p.x} ${p.y-60*k} A60 60 0 0 ${s>0?1:0} ${p.x} ${p.y+60*k}`,stroke:col,'stroke-width':3,fill:'none',opacity:0});g.appendChild(arc);
    anim(arc,[{transform:`translateX(${s*120*k}px)`,opacity:0},{opacity:1,offset:.3},{transform:'translateX(0)',opacity:1,offset:.8},{transform:'translateX(0)',opacity:0}],{duration:1400,delay:d});});}
  if(a==='KA'){for(let i=0;i<9;i++){const c=mk('circle',{cx:p.x,cy:p.y,r:4,fill:col,opacity:0});g.appendChild(c);
    anim(c,[{transform:'translate(0,0)',opacity:0},{opacity:1,offset:.2},{transform:`translate(${(i%2?1:-1)*(40+i*14)*k}px,${-20-i*6}px)`,opacity:0}],{duration:1100,delay:d+i*70});}}
}
export function fx(r,a,m,p){
  const g=mk('g',{}); fxSvg.appendChild(g);
  let d=0;
  if(m==='ES'){const from={x:480,y:540};
    const line=mk('line',{x1:from.x,y1:from.y,x2:p.x,y2:p.y,stroke:SYL[r].color,'stroke-width':3,'stroke-dasharray':'1200','stroke-dashoffset':'1200',opacity:.9}); g.appendChild(line);
    try{line.animate([{strokeDashoffset:1200,opacity:.9},{strokeDashoffset:0,opacity:.9,offset:.7},{strokeDashoffset:0,opacity:0}],{duration:700,fill:'forwards'});}catch(e){}
    d=450;}
  fxCore(g,r,a,p,d,1);
  if(m==='ON') fxCore(g,r,a,p,d+220,1.6);
  setTimeout(()=>g.remove(),3200);
}
export function glint(p,col){const g=mk('g',{});fxSvg.appendChild(g);const c=mk('circle',{cx:p.x,cy:p.y,r:50,fill:col,filter:'url(#blur)',opacity:0});g.appendChild(c);
  anim(c,[{transform:'scale(.3)',opacity:.8},{transform:'scale(1.8)',opacity:0}],{duration:1200});setTimeout(()=>g.remove(),1400);}
