/*
 * Shared materials. Ask for one by name; every call with the same name returns the same object, so
 * a room of fifty props compiles a handful of shaders. Textured surfaces use textures.js.
 */
import * as THREE from 'three';
import {textureSet,TILE} from './textures.js';

const cache=new Map();
const std=(o)=>new THREE.MeshStandardMaterial(o);

const textured=(name,extra={})=>{
  const t=textureSet(name);
  return std({map:t.map,roughnessMap:t.roughnessMap,roughness:1,normalMap:t.normalMap,normalScale:new THREE.Vector2(1.1,1.1),...extra});
};

const makers={
  stone:()=>textured('stone'),
  brick:()=>textured('brick',{normalScale:new THREE.Vector2(1.3,1.3)}),
  wood:()=>textured('wood'),
  darkwood:()=>textured('wood',{color:0x9c8470}),
  iron:()=>textured('iron',{metalness:.65}),
  plaster:()=>textured('plaster'),
  marble:()=>textured('marble',{normalScale:new THREE.Vector2(.6,.6)}),
  /* untextured */
  wax:()=>std({color:0xe6d9b8,roughness:.55,emissive:0x3a2208,emissiveIntensity:.25}),
  bone:()=>std({color:0xcfc4a6,roughness:.7}),
  brass:()=>std({color:0xb48c4c,roughness:.38,metalness:.85}),
  bronze:()=>std({color:0x8a6a3a,roughness:.42,metalness:.8}),
  steel:()=>std({color:0x8a8a8c,roughness:.35,metalness:.85}),
  flint:()=>std({color:0x25262a,roughness:.32,metalness:.1}),
  clay:()=>std({color:0x6e4a34,roughness:.8}),
  pewter:()=>std({color:0x8e9094,roughness:.4,metalness:.75}),
  bread:()=>std({color:0x9b7140,roughness:.9}),
  linen:()=>std({color:0xc9c0aa,roughness:.95,side:THREE.DoubleSide}),
  cloth:()=>std({color:0x5a1a1a,roughness:.95,side:THREE.DoubleSide}),
  rope:()=>std({color:0x9a8456,roughness:.95}),
  parchment:()=>std({color:0xcdbf98,roughness:.92}),
  leather:()=>std({color:0x4a2a1a,roughness:.7}),
  statue:()=>std({color:0xb9b4a8,roughness:.55}),
  coal:()=>std({color:0x1c1816,roughness:.9}),
  ash:()=>std({color:0x6a665e,roughness:1}),
  ember:()=>new THREE.MeshStandardMaterial({color:0x2a0c04,emissive:0xff4a10,emissiveIntensity:2.2,roughness:.9}),
  sand:()=>std({color:0xc9a460,roughness:.95}),
  glass:()=>std({color:0xa9c4c8,roughness:.08,metalness:0,transparent:true,opacity:.28,depthWrite:false}),
  water:()=>std({color:0x16323a,roughness:.04,metalness:.1,transparent:true,opacity:.85}),
  dust:()=>std({color:0x8c867a,roughness:1,transparent:true,opacity:.5,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1}),
  black:()=>new THREE.MeshBasicMaterial({color:0x030202}),
};

/* name -> shared material. */
export function mat(name){
  if(!cache.has(name)){
    if(!makers[name]) throw new Error('unknown kit material '+name);
    const m=makers[name](); m.userData.shared=true; m.name=name; cache.set(name,m);
  }
  return cache.get(name);
}
/* metres per texture repeat for a material name (1 for untextured ones) */
export const tileOf=name=>TILE[name==='darkwood'?'wood':name]||1;
