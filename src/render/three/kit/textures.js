/*
 * Code-made textures. Every surface is painted on a canvas the first time it is asked for and
 * cached, so rooms that never use brick never pay for it. Each set has a colour map, a roughness
 * map and a normal map (derived from a painted height map), so surfaces catch a moving candle.
 *
 * Textures tile. `tile` (metres per repeat) is baked into geometry UVs by geometry.js, never into
 * texture.repeat, so one texture and one material serve every size of wall.
 */
import * as THREE from 'three';

/* ---------- small deterministic helpers ---------- */
export function rng(seed){let s=seed>>>0||1; return()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0; return s/4294967296;};}

/* tileable value noise: lattice of n x n random values, smooth-interpolated, wraps at n */
function makeNoise(n,seed){
  const r=rng(seed), g=new Float32Array(n*n); for(let i=0;i<g.length;i++) g[i]=r();
  return(u,v)=>{ /* u,v in 0..1 */
    const x=u*n, y=v*n, x0=Math.floor(x), y0=Math.floor(y), fx=x-x0, fy=y-y0;
    const sx=fx*fx*(3-2*fx), sy=fy*fy*(3-2*fy);
    const a=g[(y0%n)*n+(x0%n)], b=g[(y0%n)*n+((x0+1)%n)], c=g[((y0+1)%n)*n+(x0%n)], d=g[((y0+1)%n)*n+((x0+1)%n)];
    return a+(b-a)*sx+(c-a)*sy+(a-b-c+d)*sx*sy;
  };
}
function fbm(seed){
  const n1=makeNoise(6,seed), n2=makeNoise(14,seed+1), n3=makeNoise(34,seed+2), n4=makeNoise(90,seed+3);
  return(u,v)=>n1(u,v)*.4+n2(u,v)*.3+n3(u,v)*.2+n4(u,v)*.1;
}

function canvas(size){const c=document.createElement('canvas'); c.width=c.height=size; return c;}

/* height canvas (grey) -> normal map pixels, wrapping at the edges */
function normalFromHeight(hd,size,strength){
  const out=new ImageData(size,size), h=(x,y)=>hd[(((y+size)%size)*size+((x+size)%size))*4]/255;
  for(let y=0;y<size;y++) for(let x=0;x<size;x++){
    const dx=(h(x+1,y-1)+2*h(x+1,y)+h(x+1,y+1))-(h(x-1,y-1)+2*h(x-1,y)+h(x-1,y+1));
    const dy=(h(x-1,y+1)+2*h(x,y+1)+h(x+1,y+1))-(h(x-1,y-1)+2*h(x,y-1)+h(x+1,y-1));
    let nx=-dx*strength, ny=dy*strength, nz=1; const l=Math.hypot(nx,ny,nz); nx/=l; ny/=l; nz/=l;
    const i=(y*size+x)*4; out.data[i]=(nx*.5+.5)*255; out.data[i+1]=(ny*.5+.5)*255; out.data[i+2]=(nz*.5+.5)*255; out.data[i+3]=255;
  }
  return out;
}
function blur(hd,size){ /* one cheap 3x3 box blur pass on the red channel */
  const o=new Uint8ClampedArray(hd.length);
  for(let y=0;y<size;y++) for(let x=0;x<size;x++){
    let s=0; for(let j=-1;j<=1;j++) for(let i=-1;i<=1;i++) s+=hd[((((y+j)+size)%size)*size+(((x+i)+size)%size))*4];
    const v=s/9, k=(y*size+x)*4; o[k]=o[k+1]=o[k+2]=v; o[k+3]=255;
  }
  return o;
}

function toTexture(c,srgb){
  const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.anisotropy=8;
  t.colorSpace=srgb?THREE.SRGBColorSpace:THREE.NoColorSpace; t.userData.shared=true; return t;
}

/*
 * Build a texture set. paint(c,h,size) draws the colour on c and the same shapes as grey height on h.
 * Then per-pixel grain is applied: colour multiplied by noise, height perturbed, roughness derived.
 */
function buildSet(size,{paint,seed=1,grain=.18,hgrain=.2,rough=.85,rvar=.12,heightRough=.12,strength=3,blurH=true}){
  const cc=canvas(size), hc=canvas(size), c=cc.getContext('2d'), h=hc.getContext('2d');
  paint(c,h,size);
  const cd=c.getImageData(0,0,size,size), hd=h.getImageData(0,0,size,size);
  const n=fbm(seed), rc=canvas(size), rd=new ImageData(size,size), r2=rng(seed+99);
  for(let y=0;y<size;y++) for(let x=0;x<size;x++){
    const i=(y*size+x)*4, u=x/size, v=y/size, nv=n(u,v), fine=r2();
    const k=1+(nv-.5)*grain*2+(fine-.5)*grain*.5;
    cd.data[i]*=k; cd.data[i+1]*=k; cd.data[i+2]*=k;
    const hv=hd.data[i]+(nv-.5)*255*hgrain+(fine-.5)*255*hgrain*.35;
    hd.data[i]=hd.data[i+1]=hd.data[i+2]=Math.max(0,Math.min(255,hv));
    const rr=rough+(nv-.5)*rvar*2+(1-hd.data[i]/255)*heightRough;
    rd.data[i]=rd.data[i+2]=255; rd.data[i+1]=Math.max(.05,Math.min(1,rr))*255; rd.data[i+3]=255;
  }
  c.putImageData(cd,0,0);
  rc.getContext('2d').putImageData(rd,0,0);
  const hdata=blurH?blur(hd.data,size):hd.data;
  const nc=canvas(size); nc.getContext('2d').putImageData(normalFromHeight(hdata,size,strength),0,0);
  return {map:toTexture(cc,true),roughnessMap:toTexture(rc,false),normalMap:toTexture(nc,false)};
}

/* paint helper: a rectangle in colour and the matching height */
function rect(c,h,x,y,w,hh,col,ht){
  c.fillStyle=col; c.fillRect(x,y,w,hh);
  h.fillStyle=`rgb(${ht},${ht},${ht})`; h.fillRect(x,y,w,hh);
}
const shade=(base,k)=>`rgb(${Math.round(base[0]*k)},${Math.round(base[1]*k)},${Math.round(base[2]*k)})`;

/* ---------- the texture sets ---------- */
const makers={
  /* dressed stone blocks: 5 courses of ashlar, offset joints. Tile 1.5 m. */
  stone(){
    return buildSet(1024,{seed:11,grain:.22,hgrain:.22,rough:.88,strength:4,paint(c,h,s){
      c.fillStyle='#2b2723'; c.fillRect(0,0,s,s); h.fillStyle='#202020'; h.fillRect(0,0,s,s);
      const r=rng(5), courses=5, ch=s/courses, mortar=7;
      for(let row=0;row<courses;row++){
        let x=-r()*180; const y=row*ch;
        while(x<s){
          const w=190+r()*170, k=.82+r()*.3, tint=r();
          const base=tint<.3?[134,126,112]:tint<.7?[128,128,122]:[120,116,108];
          rect(c,h,x+mortar/2,y+mortar/2,w-mortar,ch-mortar,shade(base,k),150+r()*70);
          /* chisel marks */
          c.strokeStyle='rgba(0,0,0,.08)'; c.lineWidth=1;
          for(let i=0;i<7;i++){const yy=y+mortar+r()*(ch-2*mortar); c.beginPath(); c.moveTo(x+mortar,yy); c.lineTo(x+w-mortar,yy+(r()-.5)*5); c.stroke();}
          x+=w;
        }
      }
      /* wrap the last block across the seam: repaint the left edge strip from the right overshoot is skipped; the noise hides it */
    }});
  },
  /* rough brick: small red-brown bricks, running bond. Tile 1.2 m. */
  brick(){
    return buildSet(1024,{seed:23,grain:.25,hgrain:.28,rough:.93,strength:5,paint(c,h,s){
      c.fillStyle='#3a342e'; c.fillRect(0,0,s,s); h.fillStyle='#1c1c1c'; h.fillRect(0,0,s,s);
      const r=rng(9), rows=16, bh=s/rows, bw=s/5, gap=6;
      for(let row=0;row<rows;row++){
        const off=(row%2)*bw/2;
        for(let i=-1;i<6;i++){
          const k=.65+r()*.5, rr=88+r()*40, base=[rr,rr*.64,rr*.55];
          const x=i*bw+off;
          rect(c,h,x+gap/2,row*bh+gap/2,bw-gap,bh-gap,shade(base,k),140+r()*90);
        }
      }
    }});
  },
  /* wood planks: vertical boards with grain and gaps. Tile 1 m. */
  wood(){
    return buildSet(512,{seed:37,grain:.12,hgrain:.12,rough:.72,rvar:.15,strength:3,paint(c,h,s){
      const r=rng(3), planks=5, pw=s/planks;
      for(let i=0;i<planks;i++){
        const k=.8+r()*.35, base=[92,62,38];
        rect(c,h,i*pw+2,0,pw-4,s,shade(base,k),170);
        /* grain streaks */
        for(let g=0;g<26;g++){
          const gx=i*pw+4+r()*(pw-8); c.strokeStyle=`rgba(30,16,6,${.07+r()*.14})`; c.lineWidth=1+r()*1.5;
          c.beginPath(); c.moveTo(gx,0); c.bezierCurveTo(gx+(r()-.5)*10,s*.3,gx+(r()-.5)*10,s*.7,gx+(r()-.5)*6,s); c.stroke();
          h.strokeStyle=`rgba(0,0,0,.18)`; h.lineWidth=1; h.beginPath(); h.moveTo(gx,0); h.lineTo(gx+(r()-.5)*6,s); h.stroke();
        }
        /* a knot */
        if(r()<.6){const kx=i*pw+pw*.5, ky=r()*s; c.fillStyle='rgba(25,12,4,.55)'; c.beginPath(); c.ellipse(kx,ky,6,11,0,0,7); c.fill();
          h.fillStyle='rgba(0,0,0,.5)'; h.beginPath(); h.ellipse(kx,ky,6,11,0,0,7); h.fill();}
      }
      c.fillStyle='#120b06'; for(let i=0;i<planks;i++) c.fillRect(i*pw-2,0,4,s);
      h.fillStyle='#000'; for(let i=0;i<planks;i++) h.fillRect(i*pw-2,0,4,s);
    }});
  },
  /* dark iron: pitted, scaled, a little rust. Tile 0.5 m. */
  iron(){
    return buildSet(512,{seed:51,grain:.3,hgrain:.45,rough:.55,rvar:.25,heightRough:.3,strength:3,paint(c,h,s){
      c.fillStyle='#34312f'; c.fillRect(0,0,s,s); h.fillStyle='#808080'; h.fillRect(0,0,s,s);
      const r=rng(8);
      for(let i=0;i<160;i++){ /* rust and pits */
        const x=r()*s, y=r()*s, rad=2+r()*12;
        c.fillStyle=r()<.5?'rgba(96,52,28,.35)':'rgba(10,10,10,.35)'; c.beginPath(); c.arc(x,y,rad,0,7); c.fill();
        h.fillStyle='rgba(0,0,0,.35)'; h.beginPath(); h.arc(x,y,rad*.6,0,7); h.fill();
      }
    }});
  },
  /* plaster: pale lime wash, hairline cracks, stains. Tile 1.5 m. */
  plaster(){
    return buildSet(512,{seed:63,grain:.14,hgrain:.3,rough:.92,rvar:.06,strength:2.2,paint(c,h,s){
      c.fillStyle='#8c8372'; c.fillRect(0,0,s,s); h.fillStyle='#909090'; h.fillRect(0,0,s,s);
      const r=rng(4);
      for(let i=0;i<5;i++){ /* damp stains */
        const x=r()*s,y=r()*s,rad=40+r()*90, g=c.createRadialGradient(x,y,0,x,y,rad); g.addColorStop(0,'rgba(60,50,36,.28)'); g.addColorStop(1,'rgba(60,50,36,0)');
        c.fillStyle=g; c.fillRect(x-rad,y-rad,rad*2,rad*2);
      }
      for(let i=0;i<7;i++){ /* cracks */
        let x=r()*s,y=r()*s; c.strokeStyle='rgba(30,24,16,.5)'; h.strokeStyle='rgba(0,0,0,.6)'; c.lineWidth=h.lineWidth=1.2;
        c.beginPath(); h.beginPath(); c.moveTo(x,y); h.moveTo(x,y);
        for(let k=0;k<12;k++){x+=(r()-.5)*28; y+=r()*22; c.lineTo(x,y); h.lineTo(x,y);} c.stroke(); h.stroke();
      }
    }});
  },
  /* worn black-and-white marble chequer. Texture holds 2x2 squares; tile 1 m, so squares are 0.5 m. */
  marble(){
    return buildSet(1024,{seed:77,grain:.1,hgrain:.07,rough:.38,rvar:.18,heightRough:.5,strength:1.6,blurH:true,paint(c,h,s){
      const q=s/2, r=rng(12);
      for(let y=0;y<2;y++) for(let x=0;x<2;x++){
        const white=(x+y)%2===0, base=white?[186,182,174]:[34,33,36];
        rect(c,h,x*q,y*q,q,q,shade(base,1),150);
        /* veins */
        for(let v=0;v<5;v++){
          let vx=x*q+r()*q, vy=y*q+r()*q; c.strokeStyle=white?`rgba(110,108,112,${.15+r()*.2})`:`rgba(110,110,120,${.1+r()*.15})`; c.lineWidth=1+r()*1.8;
          c.beginPath(); c.moveTo(vx,vy); for(let k=0;k<9;k++){vx+=(r()-.3)*50; vy+=(r()-.5)*40; c.lineTo(vx,vy);} c.stroke();
        }
      }
      /* joints between the squares */
      c.fillStyle='rgba(20,18,16,.8)'; h.fillStyle='#000';
      for(const p of[0,q]){c.fillRect(p-2,0,4,s); c.fillRect(0,p-2,s,4); h.fillRect(p-2,0,4,s); h.fillRect(0,p-2,s,4);}
      /* wear: scuffs and a polished path */
      for(let i=0;i<220;i++){const x=r()*s,y=r()*s,w=4+r()*40; c.fillStyle=`rgba(${r()<.5?'230,226,216':'10,10,10'},${.05+r()*.07})`; c.fillRect(x,y,w,2+r()*3);}
    }});
  }
};

const cache=new Map();
/* name: stone | brick | wood | iron | plaster | marble. Returns {map,roughnessMap,normalMap}. */
export function textureSet(name){
  if(!cache.has(name)){
    if(!makers[name]) throw new Error('unknown texture '+name);
    cache.set(name,makers[name]());
  }
  return cache.get(name);
}
/* Metres per texture repeat. */
export const TILE={stone:1.5,brick:1.2,wood:1,iron:.5,plaster:1.5,marble:1};

/* ---------- carved lettering ---------- */
const panelCache=new Map();
/*
 * Incised text on stone as a texture set. lines: string or array. mirrored: reversed left-right
 * (the text is read in water). Returns {map,normalMap,roughnessMap}, cached by arguments.
 */
export function carvedTextSet({lines,mirrored=false,aspect=3,font='Georgia, "Times New Roman", serif',spacing=.08,weight=600,seed=3}){
  const arr=Array.isArray(lines)?lines:[lines];
  const key=JSON.stringify([arr,mirrored,aspect,font,spacing,weight,seed]);
  if(panelCache.has(key)) return panelCache.get(key);
  const w=1024, hgt=Math.max(128,Math.round(1024/aspect)), mk=()=>{const c=document.createElement('canvas'); c.width=w; c.height=hgt; return c;};
  const cc=mk(), hc=mk(), c=cc.getContext('2d'), h=hc.getContext('2d');
  /* stone ground */
  c.fillStyle='#7d786d'; c.fillRect(0,0,w,hgt); h.fillStyle='#b0b0b0'; h.fillRect(0,0,w,hgt);
  const r=rng(seed);
  for(let i=0;i<500;i++){c.fillStyle=`rgba(${r()<.5?'0,0,0':'255,250,235'},${.03+r()*.05})`; c.fillRect(r()*w,r()*hgt,2+r()*14,1+r()*4);}
  const draw=(ctx,col)=>{
    ctx.save(); if(mirrored){ctx.translate(w,0); ctx.scale(-1,1);}
    ctx.fillStyle=col; ctx.textAlign='center'; ctx.textBaseline='middle';
    let size=hgt/arr.length*.62; ctx.font=`${weight} ${size}px ${font}`; if('letterSpacing' in ctx) ctx.letterSpacing=(size*spacing)+'px';
    const widest=Math.max(...arr.map(l=>ctx.measureText(l).width));
    if(widest>w*.9){size*=w*.9/widest; ctx.font=`${weight} ${size}px ${font}`; if('letterSpacing' in ctx) ctx.letterSpacing=(size*spacing)+'px';}
    arr.forEach((l,i)=>ctx.fillText(l,w/2,hgt*(i+.5)/arr.length));
    ctx.restore();
  };
  draw(c,'rgba(22,18,14,.78)');            /* lettering is dark in the cut */
  draw(h,'#101010');                        /* and low in the height map */
  h.filter='blur(2px)'; h.drawImage(hc,0,0); h.filter='none';
  const hd=h.getImageData(0,0,w,hgt).data, nrm=new ImageData(w,hgt), g=(x,y)=>hd[((Math.max(0,Math.min(hgt-1,y)))*w+Math.max(0,Math.min(w-1,x)))*4]/255;
  for(let y=0;y<hgt;y++) for(let x=0;x<w;x++){
    let nx=-(g(x+1,y)-g(x-1,y))*7, ny=(g(x,y+1)-g(x,y-1))*7; const l=Math.hypot(nx,ny,1); nx/=l; ny/=l; const nz=1/l, i=(y*w+x)*4;
    nrm.data[i]=(nx*.5+.5)*255; nrm.data[i+1]=(ny*.5+.5)*255; nrm.data[i+2]=(nz*.5+.5)*255; nrm.data[i+3]=255;
  }
  const nc=mk(); nc.getContext('2d').putImageData(nrm,0,0);
  const tex=(cv,srgb)=>{const t=new THREE.CanvasTexture(cv); t.anisotropy=8; t.colorSpace=srgb?THREE.SRGBColorSpace:THREE.NoColorSpace; t.userData.shared=true; return t;};
  const set={map:tex(cc,true),normalMap:tex(nc,false)};
  panelCache.set(key,set); return set;
}
