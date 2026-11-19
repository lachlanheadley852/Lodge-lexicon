/*
 * Geometry helpers: shared, cached geometries with UVs scaled to metres (so a stone texture keeps
 * the same block size on every wall), and a small merge utility for static fittings.
 */
import * as THREE from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {mat,tileOf} from './materials.js';

const geos=new Map();
function shared(key,make){
  if(!geos.has(key)){const g=make(); g.userData.shared=true; geos.set(key,g);}
  return geos.get(key);
}
export function scaleUV(g,su,sv){
  const uv=g.attributes.uv; for(let i=0;i<uv.count;i++) uv.setXY(i,uv.getX(i)*su,uv.getY(i)*sv); uv.needsUpdate=true; return g;
}

/* Box with metre-scaled UVs. `tile` = metres per texture repeat. */
export function boxGeo(w,h,d,tile=1){
  return shared(`box${w},${h},${d},${tile}`,()=>{
    const g=new THREE.BoxGeometry(w,h,d), uv=g.attributes.uv;
    const ext=[[d,h],[d,h],[w,d],[w,d],[w,h],[w,h]];      /* px nx py ny pz nz */
    for(let f=0;f<6;f++) for(let i=0;i<4;i++){const k=f*4+i; uv.setXY(k,uv.getX(k)*ext[f][0]/tile,uv.getY(k)*ext[f][1]/tile);}
    return g;
  });
}
export function cylGeo(rt,rb,h,seg=16,tile=1){
  return shared(`cyl${rt},${rb},${h},${seg},${tile}`,()=>scaleUV(new THREE.CylinderGeometry(rt,rb,h,seg),Math.PI*2*Math.max(rt,rb)/tile,h/tile));
}
/* profile: [[radius,y],...] from bottom to top. */
export function latheGeo(profile,seg=24,tile=1){
  return shared(`lathe${JSON.stringify(profile)},${seg},${tile}`,()=>{
    const g=new THREE.LatheGeometry(profile.map(([r,y])=>new THREE.Vector2(r,y)),seg);
    let len=0; for(let i=1;i<profile.length;i++) len+=Math.hypot(profile[i][0]-profile[i-1][0],profile[i][1]-profile[i-1][1]);
    const rmax=Math.max(...profile.map(p=>p[0]));
    return scaleUV(g,Math.PI*2*rmax/tile,len/tile);
  });
}
export function sphereGeo(r,ws=18,hs=12){return shared(`sph${r},${ws},${hs}`,()=>new THREE.SphereGeometry(r,ws,hs));}
export function torusGeo(r,t,rs=8,ts=16){return shared(`tor${r},${t},${rs},${ts}`,()=>new THREE.TorusGeometry(r,t,rs,ts));}

/* Mesh from a geometry and a kit material name (or a Material). */
export function mesh(geo,m,x=0,y=0,z=0,{cast=true,receive=true}={}){
  const o=new THREE.Mesh(geo,typeof m==='string'?mat(m):m); o.position.set(x,y,z); o.castShadow=cast; o.receiveShadow=receive; return o;
}
/* Box mesh from its centre. matName's texture tile sets the UV scale. */
export function bx(w,h,d,matName,x=0,y=0,z=0,opts){return mesh(boxGeo(w,h,d,tileOf(matName)),matName,x,y,z,opts);}
export function cy(rt,rb,h,matName,x=0,y=0,z=0,seg=16,opts){return mesh(cylGeo(rt,rb,h,seg,tileOf(matName)),matName,x,y,z,opts);}
export function lathe(profile,matName,x=0,y=0,z=0,seg=24,opts){return mesh(latheGeo(profile,seg,tileOf(matName)),matName,x,y,z,opts);}

/* Bake a transform into a clone of a geometry (for merging). */
export function placed(geo,{pos=[0,0,0],rot=[0,0,0],scale=[1,1,1]}={}){
  const g=geo.clone(); const m=new THREE.Matrix4().compose(new THREE.Vector3(...pos),new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot)),new THREE.Vector3(...scale));
  g.applyMatrix4(m); return g;
}
/* Merge baked geometries (all must share attributes) into one Mesh with one material. */
export function merged(geometries,matName,opts){
  const gs=geometries.map(g=>g.index?g.toNonIndexed():g);
  const m=new THREE.Mesh(mergeGeometries(gs),typeof matName==='string'?mat(matName):matName);
  m.castShadow=opts?.cast??true; m.receiveShadow=opts?.receive??true; return m;
}
