/*
 * Shared helpers for kit builders: hotspot marking, collision footprints, and tiny tweens.
 *
 * Footprints: a builder sets `group.footprint` to {type:'box',x1,z1,x2,z2} or {type:'circle',x,z,r}
 * in the group's LOCAL x/z (metres), or null for things you cannot bump into. Props with several
 * pieces (a wall with a doorway) also set `group.footprints` (an array). After you position and
 * rotate the group, `footprintsWorld(group)` gives world-space shapes and `addToPlan(plan,group)`
 * pushes them into a collision plan ({boxes,circles}).
 */
import * as THREE from 'three';

/* Tag an object (the whole prop or one of its parts) as the hotspot `id`. Returns the object. */
export function markHotspot(obj,id){obj.userData.hotspot=id; return obj;}
/* Tag a named sub-part: markPart(door,'leaf','innerdoor'). */
export function markPart(group,partName,id){
  const p=group.parts&&group.parts[partName]; if(!p) throw new Error('no part '+partName); return markHotspot(p,id);
}
/* Invisible, pickable box: forgiving hit area for small props. Add it to the prop. */
export function hitVolume(w,h,d,x=0,y=0,z=0){
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshBasicMaterial({visible:false}));
  m.position.set(x,y,z); m.userData.hitOnly=true; return m;
}

export const boxFootprint=(w,d,cx=0,cz=0)=>({type:'box',x1:cx-w/2,z1:cz-d/2,x2:cx+w/2,z2:cz+d/2});
export const circleFootprint=(r,cx=0,cz=0)=>({type:'circle',x:cx,z:cz,r});

const _v=new THREE.Vector3();
/* World-space footprints of a positioned group (array of {type:'box'|'circle'}). Rotation gives the enclosing axis-aligned box. */
export function footprintsWorld(group){
  group.updateMatrixWorld(true);
  const list=group.footprints||(group.footprint?[group.footprint]:[]), out=[];
  const sc=Math.max(group.getWorldScale(_v).x,.0001);
  for(const f of list){
    if(f.type==='circle'){_v.set(f.x,0,f.z).applyMatrix4(group.matrixWorld); out.push({type:'circle',x:_v.x,z:_v.z,r:f.r*sc});}
    else{
      let x1=Infinity,z1=Infinity,x2=-Infinity,z2=-Infinity;
      for(const [x,z] of[[f.x1,f.z1],[f.x2,f.z1],[f.x2,f.z2],[f.x1,f.z2]]){_v.set(x,0,z).applyMatrix4(group.matrixWorld); x1=Math.min(x1,_v.x); x2=Math.max(x2,_v.x); z1=Math.min(z1,_v.z); z2=Math.max(z2,_v.z);}
      out.push({type:'box',x1,z1,x2,z2});
    }
  }
  return out;
}
/* Push a positioned prop's footprints into a collision plan (see ../collision.js). */
export function addToPlan(plan,group){
  plan.boxes=plan.boxes||[]; plan.circles=plan.circles||[];
  for(const f of footprintsWorld(group)){
    if(f.type==='circle') plan.circles.push({x:f.x,z:f.z,r:f.r}); else plan.boxes.push({x1:f.x1,z1:f.z1,x2:f.x2,z2:f.z2});
  }
  return plan;
}

/*
 * Animated scalar: tween(group, apply, initial) returns {set(v,seconds=0), get()}. It runs from the
 * group's userData.update(t), so collectUpdaters(root) drives it. Seconds 0 jumps at once.
 */
export function tween(group,apply,initial=0){
  const st={v:initial,target:initial,speed:0,lastT:null}; apply(initial);
  const prev=group.userData.update;
  group.userData.update=(t,dt)=>{
    if(prev) prev(t,dt);
    const d=st.lastT===null?1/60:Math.min(.1,Math.max(0,t-st.lastT)); st.lastT=t;
    if(st.v===st.target) return;
    const step=st.speed*d, diff=st.target-st.v;
    st.v=Math.abs(diff)<=step?st.target:st.v+Math.sign(diff)*step; apply(st.v);
  };
  return {
    set(v,seconds=0){st.target=v; if(!seconds){st.v=v; apply(v);} else st.speed=Math.abs(v-st.v)/seconds;},
    get:()=>st.v
  };
}
/* Finish a prop: set parts (named sub-objects for hotspots) and footprint. */
export function finish(g,{parts={},footprint=null,footprints=null}={}){
  g.parts=parts; g.footprint=footprint; if(footprints) g.footprints=footprints; return g;
}
