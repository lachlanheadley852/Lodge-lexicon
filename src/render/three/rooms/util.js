/*
 * Small helpers shared by the room builders.
 *
 * A room builder `(S) => room` returns
 *   group, plan, triggers, spawns, background, fog, update(t)
 *   apply(S)   moves the room to the flags in S.f IN PLACE (nothing is rebuilt): toggles visibility,
 *              calls kit setters, rewrites the collision plan and triggers (same objects, new contents)
 * `three/index.js` builds a room once per entry, then calls apply(S) after every flag change and
 * re-collects the hotspots (anything hidden, or with no hotspot id, is not pickable).
 */
import * as THREE from 'three';
import * as K from '../kit/index.js';

/*
 * Make obj the hotspot `id`. reach: true, or a function of the flags (f) => boolean, says clicking it
 * handles something physically and so needs the same reach as using an item (see three/index.js).
 * Looking at far things and speaking words never need reach: leave reach out for those.
 */
export function hot(obj,id,reach){
  obj.userData.hotspot=id;
  if(reach!==undefined) obj.userData.reach=reach;
  return obj;
}
/* Turn a hotspot on (id) or off (null): an off object is still drawn, but the picker ignores it as a hotspot. */
export function setHot(obj,id){
  if(id) obj.userData.hotspot=id; else delete obj.userData.hotspot;
}

/* A hotspot group: an empty group tagged `id` with an invisible, forgiving hit volume. */
export function hotGroup(id,reach,w,h,d,x,y,z){
  const g=new THREE.Group(); hot(g,id,reach);
  if(w) g.add(K.hitVolume(w,h,d,x,y,z));
  return g;
}

/* Collision plan with room for in-place rewrites. */
export const newPlan=()=>({walls:[],boxes:[],circles:[],zones:[]});
/* Replace a plan's contents (keeps the object the controls already hold). */
export function fillPlan(plan,{walls=[],boxes=[],circles=[]}){
  plan.walls=walls; plan.boxes=boxes; plan.circles=circles;
}
/* Replace the contents of the triggers array in place. */
export function fillTriggers(triggers,list){triggers.length=0; triggers.push(...list);}

/* The four walls of a rectangle as segments, leaving out any listed gaps. */
export function rectWalls(x1,z1,x2,z2){
  return {
    n:[x1,z1,x2,z1], e:[x2,z1,x2,z2], s:[x2,z2,x1,z2], w:[x1,z2,x1,z1]
  };
}

/*
 * One atmosphere whose lights change in place between two kit presets (for a room that is dark until
 * a candle is lit): same lights, no shader recompile. set(true) = lit preset. Add `.group` to the
 * room; use `.fog` and the `.background` getter in the room descriptor.
 */
export function switchableAtmosphere(litPreset='candlelit',darkPreset='dark'){
  const lit=K.atmosphere(litPreset), dark=K.atmosphere(darkPreset);
  const pick=(a)=>({amb:a.group.children.find(o=>o.isAmbientLight),hemi:a.group.children.find(o=>o.isHemisphereLight)});
  const L=pick(lit), D=pick(dark);
  const fog=lit.fog, litFog=[lit.fog.color.clone(),lit.fog.density], darkFog=[dark.fog.color.clone(),dark.fog.density];
  const api={group:lit.group, fog, background:dark.background};
  const litVals={amb:[L.amb.color.clone(),L.amb.intensity],hemi:[L.hemi.color.clone(),L.hemi.groundColor.clone(),L.hemi.intensity]};
  const darkVals={amb:[D.amb.color.clone(),D.amb.intensity],hemi:[D.hemi.color.clone(),D.hemi.groundColor.clone(),D.hemi.intensity]};
  api.set=(on)=>{
    const v=on?litVals:darkVals;
    L.amb.color.copy(v.amb[0]); L.amb.intensity=v.amb[1];
    L.hemi.color.copy(v.hemi[0]); L.hemi.groundColor.copy(v.hemi[1]); L.hemi.intensity=v.hemi[2];
    const [c,d]=on?litFog:darkFog; fog.color.copy(c); fog.density=d;
    api.background=on?lit.background:dark.background;
  };
  return api;
}

/* Ease a number towards a target with a time constant (per second). */
export const ease=(v,target,dt,rate=3)=>v+(target-v)*Math.min(1,dt*rate);

/* Unlit warm glow for the light beyond an open door: brighter in the middle, shared by every room. */
let glowMat=null;
export function glowMaterial(){
  if(glowMat) return glowMat;
  const c=document.createElement('canvas'); c.width=c.height=64; const g=c.getContext('2d');
  const gr=g.createRadialGradient(32,32,2,32,32,46); gr.addColorStop(0,'#ffd890'); gr.addColorStop(.6,'#e09a48'); gr.addColorStop(1,'#a2601f');
  g.fillStyle=gr; g.fillRect(0,0,64,64);
  const map=new THREE.CanvasTexture(c); map.colorSpace=THREE.SRGBColorSpace; map.userData.shared=true;
  glowMat=new THREE.MeshBasicMaterial({map,toneMapped:false,fog:false}); glowMat.userData.shared=true;
  return glowMat;
}
