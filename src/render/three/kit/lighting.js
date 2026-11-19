/*
 * Lighting for candlelit stone. This module owns every renderer-wide lighting decision so the
 * rooms never fiddle with tone mapping or units:
 *
 *   setupRenderer(gl)     colour space, tone mapping, exposure, shadow map type
 *   candle(opts)          wax candle + animated flame + flickering point light (optionally shadowed)
 *   fire(opts)            the same flame at brazier size
 *   spill(opts)           faint cool spot of light, for light under a door or moonlight through a slit
 *   fill(opts)            a small shadowless point light (glow from a doorway, a lit sconce)
 *   atmosphere(preset)    ambient/hemisphere floor + fog + background: 'candlelit' | 'dark' | 'moonlit' | 'clear'
 *   collectUpdaters(root) one function that runs every `userData.update(t,dt)` under root
 *
 * Units: three.js physical lights. Point/spot intensity is candela, ambient intensity is
 * irradiance. Real candles are ~1 cd, far too dim for a game screen, so LIGHT.candle is ~6.5 cd and
 * exposure is 1; walls 1 m from a flame reach a bright warm tone, walls 3 m away sit in deep
 * shadow, and the ambient floor keeps shapes faintly readable in the far corners.
 */
import * as THREE from 'three';
import {mat} from './materials.js';
import {latheGeo,sphereGeo,cylGeo} from './geo.js';

export const LIGHT={
  candle:6.5,            /* cd, one candle */
  candleColor:0xffb066,
  brazier:22,            /* cd, a lit brazier */
  sconceFill:2.2,        /* cd, shadowless fill near a sconce */
  doorFill:3,            /* cd, glow through an open doorway */
  spill:2.0,             /* cd, cool spill under a door */
  spillColor:0x8fa6d8,
  exposure:1.05,
  shadowMapSize:512,
  maxShadowCasters:2
};

export function setupRenderer(gl){
  gl.outputColorSpace=THREE.SRGBColorSpace;
  gl.toneMapping=THREE.ACESFilmicToneMapping;
  gl.toneMappingExposure=LIGHT.exposure;
  gl.shadowMap.enabled=true;
  gl.shadowMap.type=THREE.PCFShadowMap;       /* r187: PCF is already the soft filter */
  return gl;
}

/* ---------- shared flame assets ---------- */
let flameAssets=null;
function assets(){
  if(flameAssets) return flameAssets;
  const c=document.createElement('canvas'); c.width=c.height=128; const g=c.getContext('2d');
  const gr=g.createRadialGradient(64,64,0,64,64,64);
  gr.addColorStop(0,'rgba(255,190,100,.9)'); gr.addColorStop(.25,'rgba(255,140,60,.38)'); gr.addColorStop(.6,'rgba(255,100,30,.08)'); gr.addColorStop(1,'rgba(255,80,20,0)');
  g.fillStyle=gr; g.fillRect(0,0,128,128);
  const glowTex=new THREE.CanvasTexture(c); glowTex.colorSpace=THREE.SRGBColorSpace; glowTex.userData.shared=true;
  const prof=[[0,0],[.5,.08],[.78,.3],[.62,.58],[.3,.82],[0,1]];
  flameAssets={
    outerGeo:latheGeo(prof,10), innerGeo:latheGeo(prof,8),
    outer:new THREE.MeshBasicMaterial({color:0xff9a3c,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false,fog:false}),
    inner:new THREE.MeshBasicMaterial({color:0xfff0b8,transparent:true,opacity:.95,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false,fog:false}),
    glow:new THREE.SpriteMaterial({map:glowTex,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false,fog:false})
  };
  for(const m of[flameAssets.outer,flameAssets.inner,flameAssets.glow]) m.userData.shared=true;
  return flameAssets;
}

/* Build a flame: returns {root, update(t), setLit(b)}; height h metres. */
function makeFlame(h,glowSize,seed){
  const a=assets(), root=new THREE.Group();
  const outer=new THREE.Mesh(a.outerGeo,a.outer), inner=new THREE.Mesh(a.innerGeo,a.inner);
  const w=h*.28; outer.scale.set(w,h,w); inner.scale.set(w*.5,h*.55,w*.5);
  const glow=new THREE.Sprite(a.glow); glow.scale.set(glowSize,glowSize,1); glow.position.y=h*.45;
  for(const o of[outer,inner,glow]){o.userData.noPick=true; o.castShadow=false; o.receiveShadow=false; root.add(o);}
  return {root,outer,inner,glow,h,w,glowSize,seed};
}
function flick(t,s){return 1+.07*Math.sin(t*11+s)+.045*Math.sin(t*17.3+s*2.1)+.035*Math.sin(t*4.9+s*3.7)+.02*Math.sin(t*29+s*5);}

/*
 * A wax candle with a flame. Origin at the base of the candle; flame tip at ~`height`+flame.
 * opts: height(.2) radius(.022) lit(true) shadow(false) intensity seed holder('dish'|'none')
 * Returns a Group with .light, .setLit(bool), .lit, and userData.update(t) (animated flicker).
 */
export function candle(opts={}){
  const {height=.2,radius=.022,lit=true,shadow=false,intensity=LIGHT.candle,seed=Math.random()*100,holder='dish',shadowSize=LIGHT.shadowMapSize}=opts;
  const g=new THREE.Group(); g.name='candle';
  const body=new THREE.Group(); g.add(body); g.userData.body=body;   /* wax, wick and holder: hide without touching the light */
  const wax=new THREE.Mesh(latheGeo([[0,0],[radius*1.15,0],[radius*1.08,height*.5],[radius,height*.92],[radius*.75,height*.98],[radius*.4,height*1.0],[0,height*.97]],14),mat('wax'));
  wax.castShadow=false; wax.receiveShadow=true; body.add(wax);
  const wick=new THREE.Mesh(cylGeo(.0025,.0025,.02,4),mat('coal')); wick.position.y=height+.008; wick.castShadow=false; body.add(wick);
  if(holder==='dish'){
    const dish=new THREE.Mesh(latheGeo([[0,0],[.06,0],[.068,.008],[.07,.02],[.05,.012],[.03,.01],[0,.01]],18),mat('pewter')); dish.castShadow=false; dish.receiveShadow=true; body.add(dish);
    wax.position.y=.008; wick.position.y+=.008;
  }
  const top=height+(holder==='dish'?.008:0);
  const f=makeFlame(.045,.34,seed); f.root.position.y=top+.012; g.add(f.root);
  const light=new THREE.PointLight(LIGHT.candleColor,intensity,0,2); light.position.y=top+.04; g.add(light);
  if(shadow){
    light.castShadow=true; light.shadow.mapSize.set(shadowSize,shadowSize);
    light.shadow.camera.near=.06; light.shadow.camera.far=9; light.shadow.bias=-.0015; light.shadow.normalBias=.02; light.shadow.radius=4;
  }
  g.light=light; g.lit=lit; g.flameWorldHeight=top+.04;
  g.setLit=(on)=>{
    g.lit=on; f.root.visible=on;
    light.intensity=on?intensity:0;
    if(shadow) light.shadow.autoUpdate=on;       /* an unlit candle costs no shadow pass */
  };
  g.userData.update=(t)=>{
    if(!g.lit) return;
    const k=flick(t,seed);
    light.intensity=intensity*k;
    f.outer.scale.set(f.w*(1+.12*(k-1)*5),f.h*k,f.w*(1+.12*(k-1)*5)); f.inner.scale.set(f.w*.5,f.h*.55*k,f.w*.5);
    f.root.rotation.z=.05*Math.sin(t*3.1+seed); f.root.rotation.x=.05*Math.sin(t*2.3+seed*1.7);
    f.glow.scale.setScalar(f.glowSize*(.92+.2*k));
  };
  g.setLit(lit);
  return g;
}

/*
 * A bigger flame with its own warm light, for a brazier or torch. opts: size(1) lit intensity shadow
 * Returns a Group with .setLit and userData.update. Origin at the base of the flame.
 */
export function fire(opts={}){
  const {size=1,lit=true,intensity=LIGHT.brazier,seed=Math.random()*100,shadow=false}=opts;
  const g=new THREE.Group(); g.name='fire';
  const flames=[];
  for(let i=0;i<3;i++){
    const f=makeFlame(.28*size*(i===0?1:.7),.9*size,seed+i*3); f.root.position.set((i-1)*.07*size*(i?1:0),0,(i?(i-1.5)*.08*size:0)); g.add(f.root); flames.push(f);
    if(i) f.glow.visible=false;
  }
  const light=new THREE.PointLight(0xff8a38,intensity,0,2); light.position.y=.3*size; g.add(light);
  if(shadow){light.castShadow=true; light.shadow.mapSize.set(512,512); light.shadow.camera.near=.1; light.shadow.camera.far=12; light.shadow.bias=-.002; light.shadow.normalBias=.03;}
  g.light=light; g.lit=lit;
  g.setLit=(on)=>{g.lit=on; g.visible=on; light.intensity=on?intensity:0; if(shadow) light.shadow.autoUpdate=on;};
  g.userData.update=(t)=>{
    if(!g.lit) return;
    const k=flick(t,seed); light.intensity=intensity*(.9+.2*k*.5+.1*(k-1)*4);
    flames.forEach((f,i)=>{const kk=flick(t*1.3+i*2.1,f.seed); f.outer.scale.set(f.w*(1+(kk-1)*2),f.h*kk,f.w*(1+(kk-1)*2)); f.inner.scale.set(f.w*.5,f.h*.55*kk,f.w*.5); f.root.rotation.z=.12*Math.sin(t*2.7+f.seed);});
  };
  g.setLit(lit);
  return g;
}

/*
 * A faint cool light for light under a door or moonlight: a wide spot, no shadows.
 * opts: x,y,z (position), tx,ty,tz (what it points at; default straight down), color, intensity,
 * angle(rad), distance. Returns the SpotLight; add its `.target` to the scene too (this does it
 * for you by parenting it to the light's parent via the returned group).
 */
export function spill(opts={}){
  const {x=0,y=1,z=0,tx=x,ty=0,tz=z,color=LIGHT.spillColor,intensity=LIGHT.spill,angle=1.15,distance=7}=opts;
  const g=new THREE.Group(); g.name='spill';
  const s=new THREE.SpotLight(color,intensity,distance,angle,1,2); s.position.set(x,y,z); s.target.position.set(tx,ty,tz); s.castShadow=false;
  g.add(s,s.target); g.light=s; return g;
}

/* A small shadowless point light (doorway glow, sconce fill). */
export function fill(opts={}){
  const {x=0,y=1.2,z=0,color=0xffb060,intensity=LIGHT.doorFill,distance=6}=opts;
  const l=new THREE.PointLight(color,intensity,distance,2); l.position.set(x,y,z); l.castShadow=false; return l;
}

/* ---------- atmosphere presets ---------- */
const PRESETS={
  /* a lit room: warm floor so far corners stay readable, soft haze */
  candlelit:{ambient:[0x54402e,.7],hemi:[0x6a5848,0x1a130e,.85],fog:[0x0b0806,.055],background:0x040302},
  /* an unlit room: almost nothing but a faint cold floor; shapes only appear near a light */
  dark:{ambient:[0x2a3048,.06],hemi:[0x303850,0x0a0a0c,.04],fog:[0x020203,.14],background:0x000000},
  moonlit:{ambient:[0x3a4868,.5],hemi:[0x607090,0x14141c,.4],fog:[0x0a0e18,.04],background:0x05070c},
  clear:{ambient:[0x504030,.4],hemi:[0x605040,0x1a130e,.3],fog:null,background:0x040302}
};
/* Returns {group, fog, background}. Add `group` to the room; hand `fog` and `background` back in the room descriptor. */
export function atmosphere(preset='candlelit'){
  const p=PRESETS[preset]; if(!p) throw new Error('unknown atmosphere '+preset);
  const group=new THREE.Group(); group.name='atmosphere:'+preset;
  group.add(new THREE.AmbientLight(p.ambient[0],p.ambient[1]));
  group.add(new THREE.HemisphereLight(p.hemi[0],p.hemi[1],p.hemi[2]));
  return {group,fog:p.fog?new THREE.FogExp2(p.fog[0],p.fog[1]):null,background:p.background};
}

/* Run every userData.update(t,dt) found under root. Call once after building, then call the result each frame. */
export function collectUpdaters(root){
  const fns=[]; root.traverse(o=>{if(typeof o.userData.update==='function') fns.push(o.userData.update);});
  return (t,dt)=>{for(const f of fns) f(t,dt);};
}
