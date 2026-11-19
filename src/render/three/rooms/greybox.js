/*
 * Greybox building blocks. 3D2 will replace these with the textured kit; room builders only
 * rely on the small surface below, so swapping the geometry later stays local.
 */
import * as THREE from 'three';

const mats=new Map();
export function mat(color=0x777068,opts={}){
  const key=color+JSON.stringify(opts);
  if(!mats.has(key)) mats.set(key,new THREE.MeshStandardMaterial({color,roughness:.95,metalness:0,...opts}));
  return mats.get(key);
}
function finish(m,{shadow=true}={}){m.castShadow=shadow; m.receiveShadow=true; return m;}

/* Box from its centre. */
export function box(w,h,d,x,y,z,color,opts){
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(color,opts)); m.position.set(x,y,z); return finish(m);
}
/* Box from two floor corners and a height range. */
export function slab(x1,z1,x2,z2,y1,y2,color,opts){
  return box(Math.abs(x2-x1),y2-y1,Math.abs(z2-z1),(x1+x2)/2,(y1+y2)/2,(z1+z2)/2,color,opts);
}
export function cyl(r,h,x,y,z,color,seg=16,opts){
  const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,seg),mat(color,opts)); m.position.set(x,y,z); return finish(m);
}
export function sphere(r,x,y,z,color,opts){
  const m=new THREE.Mesh(new THREE.SphereGeometry(r,16,12),mat(color,opts)); m.position.set(x,y,z); return finish(m);
}
/* Unlit glowing mesh (flame, light strip, doorway glow). Never casts or receives shadows. */
export function glow(geometry,color,x,y,z,opacity=1){
  const m=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({color,transparent:opacity<1,opacity,fog:false}));
  m.position.set(x,y,z); m.userData.noPick=true; return m;
}
/* Invisible, pickable volume: gives small things a forgiving hit area. */
export function hitBox(w,h,d,x,y,z){
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshBasicMaterial({visible:false}));
  m.position.set(x,y,z); m.userData.hitOnly=true; return m;
}
/* Tag an Object3D as the hotspot `id`. */
export function hot(id,obj){obj.userData.hotspot=id; return obj;}

/* A plane carrying canvas-drawn text (lit like stone, so unlit rooms keep it dark). */
export function textPlane(text,w,h,{color='#a8977a',font='Georgia,serif',spacing=8,facing=1,emissive=0}={}){
  const cw=1024, ch=Math.max(64,Math.round(1024*h/w));
  const c=document.createElement('canvas'); c.width=cw; c.height=ch;
  const g=c.getContext('2d'); g.clearRect(0,0,cw,ch);
  const lines=Array.isArray(text)?text:[text];
  let size=ch/lines.length*.7;
  g.fillStyle=color; g.textAlign='center'; g.textBaseline='middle';
  if('letterSpacing' in g) g.letterSpacing=spacing+'px';
  g.font=`${size}px ${font}`;
  const widest=Math.max(...lines.map(l=>g.measureText(l).width));
  if(widest>cw*.94){size*=cw*.94/widest; g.font=`${size}px ${font}`;}   /* shrink to fit the plane */
  lines.forEach((l,i)=>g.fillText(l,cw/2,ch*(i+.5)/lines.length));
  const tex=new THREE.CanvasTexture(c); tex.colorSpace=THREE.SRGBColorSpace; tex.anisotropy=4;
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:tex,transparent:true,roughness:1,
    emissive:new THREE.Color(emissive),emissiveMap:emissive?tex:null,side:THREE.DoubleSide,depthWrite:false}));
  if(facing<0) m.rotation.y=Math.PI;
  m.receiveShadow=true; return m;
}

/* Bounding data for the helpers the room builders share. */
export function wallRing(x1,z1,x2,z2){
  return [[x1,z1,x2,z1],[x2,z1,x2,z2],[x2,z2,x1,z2],[x1,z2,x1,z1]];
}
