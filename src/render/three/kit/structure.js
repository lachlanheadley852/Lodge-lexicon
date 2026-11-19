/*
 * Architecture builders: floor, ceiling, wall, arched doorway, plank door, double door, pillar,
 * carved text panel. Conventions (all builders): metres, x east, z south, y up, origin at floor
 * level and centred in x/z, "front" faces +z. See README.md.
 */
import * as THREE from 'three';
import {mat,tileOf} from './materials.js';
import {boxGeo,cylGeo,latheGeo,sphereGeo,torusGeo,mesh,bx,cy,lathe,placed,merged,scaleUV} from './geo.js';
import {carvedTextSet,rng} from './textures.js';
import {finish,boxFootprint,circleFootprint,hitVolume,tween} from './util.js';

/* ---------- floor and ceiling ---------- */
/* Floor slab whose top is at y=0. material: marble (chequer) | stone | wood | brick. */
export function floor({w=5,d=5,material='marble',thickness=.1}={}){
  const g=new THREE.Group(); g.name='floor';
  const m=bx(w,thickness,d,material,0,-thickness/2,0,{cast:false}); g.add(m);
  return finish(g,{parts:{surface:m}});
}
/* Ceiling slab whose underside is at `height`. beams: add crossing timber beams. */
export function ceiling({w=5,d=5,height=2.8,material='stone',thickness=.15,beams=false}={}){
  const g=new THREE.Group(); g.name='ceiling';
  g.add(bx(w,thickness,d,material,0,height+thickness/2,0,{cast:true}));
  if(beams){const n=Math.max(2,Math.round(w/1.4)); for(let i=0;i<n;i++) g.add(bx(.22,.24,d,'darkwood',-w/2+(i+.5)*w/n,height-.12,0));}
  return finish(g);
}

/* ---------- walls ---------- */
const arcOutline=(p,cx,w,h)=>{const r=w/2, sp=h-r; p.moveTo(cx-r,0); p.lineTo(cx-r,sp); p.absarc(cx,sp,r,Math.PI,0,true); p.lineTo(cx+r,0); p.lineTo(cx-r,0); return p;};
function extrudeShape(shape,depth,tile){
  const g=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:14});
  g.translate(0,0,-depth/2); scaleUV(g,1/tile,1/tile); return g;
}

/*
 * Wall segment along x, `thickness` deep, centred on z=0. openings: [{x,width,height,arch}] cut
 * through it (x is the opening's centre along the wall; arch gives a round top, `height` to the apex).
 * Footprint(s): solid pieces between the openings.
 */
export function wall({length=3,height=2.8,thickness=.4,material='stone',openings=[]}={}){
  const g=new THREE.Group(); g.name='wall';
  const tile=tileOf(material);
  let body;
  if(!openings.length) body=bx(length,height,thickness,material,0,height/2,0);
  else{
    const s=new THREE.Shape(); s.moveTo(-length/2,0); s.lineTo(length/2,0); s.lineTo(length/2,height); s.lineTo(-length/2,height); s.lineTo(-length/2,0);
    for(const o of openings){
      const p=new THREE.Path();
      if(o.arch) arcOutline(p,o.x,o.width,o.height);
      else{p.moveTo(o.x-o.width/2,0); p.lineTo(o.x-o.width/2,o.height); p.lineTo(o.x+o.width/2,o.height); p.lineTo(o.x+o.width/2,0); p.lineTo(o.x-o.width/2,0);}
      s.holes.push(p);
    }
    body=mesh(extrudeShape(s,thickness,tile),material);
  }
  g.add(body);
  const sorted=[...openings].sort((a,b)=>a.x-b.x), feet=[]; let cursor=-length/2;
  for(const o of sorted){ if(o.x-o.width/2>cursor+.01) feet.push({type:'box',x1:cursor,z1:-thickness/2,x2:o.x-o.width/2,z2:thickness/2}); cursor=o.x+o.width/2; }
  if(cursor<length/2-.01) feet.push({type:'box',x1:cursor,z1:-thickness/2,x2:length/2,z2:thickness/2});
  return finish(g,{parts:{body},footprint:boxFootprint(length,thickness),footprints:feet});
}

/* ---------- doors ---------- */
function ironFittings(w,h,{studs=true,straps=[.22,.75],both=true}={}){
  const parts=[], sides=both?[1,-1]:[1];
  for(const side of sides){
    const z=side*.04;
    for(const f of straps){
      parts.push(placed(boxGeo(w*.94,.07,.012,.5),{pos:[w/2,h*f,z]}));
      if(studs) for(let x=.1;x<w-.05;x+=.16) parts.push(placed(sphereGeo(.013,6,4),{pos:[x,h*f+.0,z+side*.007]}));
    }
    parts.push(placed(boxGeo(.09,.16,.012,.5),{pos:[w*.86,h*.46,z]}));
  }
  return merged(parts,'iron');
}
/*
 * Plank door with iron straps and studs. Hinge on the left edge (x=-width/2); setOpen(v, seconds)
 * swings it 0 (shut) .. 1 (open about 100 degrees, away from the viewer toward -z). arched: round top.
 */
export function plankDoor({width=1.1,height=2.0,thickness=.07,arched=false,open=0}={}){
  const g=new THREE.Group(); g.name='plankDoor';
  const hinge=new THREE.Group(); hinge.position.set(-width/2,0,0); g.add(hinge);
  let leaf;
  if(arched){
    const s=new THREE.Shape(), r=width/2, sp=height-r; s.moveTo(0,0); s.lineTo(0,sp); s.absarc(r,sp,r,Math.PI,0,true); s.lineTo(width,0); s.lineTo(0,0);
    leaf=mesh(extrudeShape(s,thickness,1),'darkwood');
  } else leaf=bx(width,height,thickness,'darkwood',width/2,height/2,0);
  hinge.add(leaf);
  const iron=ironFittings(width,arched?height-width/2:height); hinge.add(iron);
  const ring=mesh(torusGeo(.045,.007,6,14),'iron',width*.84,height*.46,thickness/2+.03); ring.rotation.x=0; hinge.add(ring);
  const ring2=ring.clone(); ring2.position.z=-thickness/2-.03; hinge.add(ring2);
  const a=tween(g,v=>{hinge.rotation.y=v*1.75;},open);
  g.setOpen=(v,seconds=0)=>a.set(v,seconds); g.openAmount=()=>a.get();
  return finish(g,{parts:{leaf,hinge,iron,ring}});
}

/* Square-and-compass emblem, gold on transparent, drawn once. */
let emblemTex=null;
function emblem(){
  if(emblemTex) return emblemTex;
  const c=document.createElement('canvas'); c.width=c.height=256; const g=c.getContext('2d');
  g.lineCap='round'; g.lineJoin='round'; g.strokeStyle='#d6b25a'; g.fillStyle='#d6b25a';
  g.lineWidth=13;
  g.beginPath(); g.moveTo(128,34); g.lineTo(66,200); g.moveTo(128,34); g.lineTo(190,200); g.stroke();             /* compass legs */
  g.lineWidth=7; g.beginPath(); g.arc(128,150,40,Math.PI*1.12,Math.PI*1.88); g.stroke();                          /* arc between them */
  g.beginPath(); g.arc(128,34,12,0,7); g.fill();                                                                  /* pivot */
  g.lineWidth=13; g.beginPath(); g.moveTo(60,92); g.lineTo(128,222); g.lineTo(196,92); g.stroke();                /* square (apex down) */
  g.lineWidth=5; g.fillStyle='#a8863a'; g.beginPath(); g.arc(128,146,9,0,7); g.fill();                            /* the G-less centre boss */
  emblemTex=new THREE.CanvasTexture(c); emblemTex.colorSpace=THREE.SRGBColorSpace; emblemTex.anisotropy=8; emblemTex.userData.shared=true;
  return emblemTex;
}

/*
 * Stone door frame with two wooden leaves, iron bands, and a square-and-compass emblem across the
 * join. setOpen(v, seconds) swings both leaves 0..1 away from the viewer (toward -z). The frame is
 * `width` wide inside; put it in a wall() opening of that width and `height`.
 */
export function doubleDoor({width=2.2,height=2.6,thickness=.1,emblem:hasEmblem=true,open=0}={}){
  const g=new THREE.Group(); g.name='doubleDoor';
  const fw=.24;
  g.add(bx(fw,height+fw,.5,'stone',-width/2-fw/2,(height+fw)/2,0));
  g.add(bx(fw,height+fw,.5,'stone',width/2+fw/2,(height+fw)/2,0));
  g.add(bx(width+fw*2,fw,.5,'stone',0,height+fw/2,0));
  const half=width/2, leaves=[];
  const hingeL=new THREE.Group(); hingeL.position.set(-half,0,0);
  const hingeR=new THREE.Group(); hingeR.position.set(half,0,0);
  for(const [hinge,dir] of[[hingeL,1],[hingeR,-1]]){
    const lf=bx(half,height,thickness,'darkwood',dir*half/2,height/2,0); hinge.add(lf);
    const bands=ironFittings(half,height,{straps:[.12,.5,.88]}); if(dir<0) bands.rotation.y=Math.PI; hinge.add(bands);
    if(hasEmblem){
      /* half of the emblem on each leaf, its centre line at the join */
      const t=emblem().clone(); t.repeat.set(.5,1); t.offset.set(dir>0?0:.5,0); t.needsUpdate=true;
      const m=new THREE.MeshStandardMaterial({map:t,transparent:true,alphaTest:.4,metalness:.7,roughness:.45,polygonOffset:true,polygonOffsetFactor:-2});
      const e=new THREE.Mesh(new THREE.PlaneGeometry(.4,.8),m); e.position.set(dir*(half-.2),height*.58,thickness/2+.004); hinge.add(e);
    }
    hinge.add(mesh(torusGeo(.05,.008,6,14),'iron',dir*(half-.1),height*.46,thickness/2+.03));
    leaves.push(lf);
  }
  g.add(hingeL,hingeR);
  const a=tween(g,v=>{hingeL.rotation.y=v*1.7; hingeR.rotation.y=-v*1.7;},open);
  g.setOpen=(v,seconds=0)=>a.set(v,seconds); g.openAmount=()=>a.get();
  return finish(g,{parts:{leftLeaf:leaves[0],rightLeaf:leaves[1],leftHinge:hingeL,rightHinge:hingeR},footprint:null});
}

/*
 * Wall segment with a round-arched doorway in its middle.
 * state: 'open' (just the arch), 'bricked' (brick infill, recessed), 'door' (plank door in the arch).
 * parts: body, ring (arch stones), fill (bricks), door (plankDoor group), opening (empty Object3D at
 * the middle of the opening: attach a hotspot hit volume). door.setOpen(v) works in 'door' state.
 * setState(s) switches in place.
 */
export function archDoorway({length=3,height=2.8,thickness=.4,width=1.2,openingHeight=2.2,state='open',doorOpen=0,material='stone'}={}){
  const g=new THREE.Group(); g.name='archDoorway';
  const w=wall({length,height,thickness,material,openings:[{x:0,width,height:openingHeight,arch:true}]});
  g.add(w);
  /* arch ring: a band of stone round the opening, a touch proud of the wall */
  const outer=new THREE.Shape(); arcOutline(outer,0,width+.36,openingHeight+.18);
  const ringHole=new THREE.Path(); arcOutline(ringHole,0,width,openingHeight); outer.holes.push(ringHole);
  const ring=mesh(extrudeShape(outer,thickness+.08,tileOf(material)),material); g.add(ring);
  /* brick infill */
  const fillShape=new THREE.Shape(); arcOutline(fillShape,0,width,openingHeight);
  const fill=mesh(extrudeShape(fillShape,.22,tileOf('brick')),'brick',0,0,-thickness/2+.11+.02); g.add(fill);
  const door=plankDoor({width:width-.04,height:openingHeight-.02,arched:true,open:doorOpen}); door.position.set(0,0,-thickness/2+.12); g.add(door);
  const opening=new THREE.Object3D(); opening.position.set(0,openingHeight/2,0); g.add(opening);
  const set=(s)=>{fill.visible=s==='bricked'; door.visible=s==='door'; g.state=s;};
  g.setState=set; set(state);
  g.setDoorOpen=(v,sec)=>door.setOpen(v,sec);
  return finish(g,{parts:{body:w.parts.body,ring,fill,door,opening},footprint:w.footprint,footprints:w.footprints});
}

/* ---------- pillar ---------- */
function jagged(geo,amount,seed){
  const r=rng(seed), p=geo.attributes.position; let maxY=-Infinity; for(let i=0;i<p.count;i++) maxY=Math.max(maxY,p.getY(i));
  for(let i=0;i<p.count;i++) if(p.getY(i)>maxY-.001) p.setY(i,p.getY(i)-r()*amount);
  p.needsUpdate=true; geo.computeVertexNormals(); return geo;
}
function globeMesh(r){
  const globe=mesh(sphereGeo(r,20,14),'bronze');
  const eq=mesh(torusGeo(r*1.003,r*.025,6,28),'brass'); eq.rotation.x=Math.PI/2;
  const mer=mesh(torusGeo(r*1.003,r*.025,6,28),'brass'); mer.rotation.y=Math.PI/2; mer.rotation.x=.4;
  const gr=new THREE.Group(); gr.add(globe,eq,mer); return gr;
}
/*
 * Pillar with square plinth, shaft, flared capital and a globe. height = floor to top of capital.
 * setBroken(bool) / setBrokenAt not combined: `breakHeight` sets where the shaft snaps. When broken
 * the shaft ends jagged at breakHeight and the upper part lies fallen on the floor (toward +x).
 * parts: shaft, capital, globe, fallen.
 */
export function pillar({height=2.6,radius=.24,globe=true,broken=false,breakHeight=1.2,material='stone'}={}){
  const g=new THREE.Group(); g.name='pillar';
  const plinthH=.2, capH=.3, shaftTop=height-capH, r=radius;
  const standing=new THREE.Group(), snapped=new THREE.Group(), fallen=new THREE.Group();
  /* shared base */
  const base=new THREE.Group();
  base.add(bx(r*2.5,plinthH,r*2.5,material,0,plinthH/2,0));
  base.add(lathe([[r*1.35,0],[r*1.32,.05],[r*1.05,.09],[r*1.0,.1]],material,0,plinthH,0,20));
  g.add(base);
  const shaftBottom=plinthH+.1;
  /* standing shaft + capital + globe */
  const shaft=lathe([[r*1.0,0],[r*1.02,(shaftTop-shaftBottom)*.35],[r*.94,shaftTop-shaftBottom]],material,0,shaftBottom,0,22); standing.add(shaft);
  const cap=new THREE.Group(); cap.position.y=shaftTop;
  cap.add(lathe([[r*.94,0],[r*1.1,.04],[r*1.3,.16],[r*1.42,.24],[r*1.42,.27]],material,0,0,0,22));
  cap.add(bx(r*3.1,.06,r*3.1,material,0,capH-.03,0));
  standing.add(cap);
  const gr=r*.9, globeObj=globe?globeMesh(gr):null; if(globeObj){globeObj.position.y=height+gr*.92; standing.add(globeObj);}
  /* snapped stump */
  const stumpGeo=jagged(new THREE.CylinderGeometry(r*.96,r*1.01,breakHeight-shaftBottom,22,2,false),.12,7); scaleUV(stumpGeo,Math.PI*2*r/tileOf(material),(breakHeight-shaftBottom)/tileOf(material));
  snapped.add(mesh(stumpGeo,material,0,shaftBottom+(breakHeight-shaftBottom)/2,0));
  /* the fallen length, lying along +x with its capital and globe */
  const len=Math.min(1.5,height-breakHeight);
  const fshaft=mesh(jagged(new THREE.CylinderGeometry(r*.94,r*.96,len,20,2),.1,3),material); fshaft.rotation.z=Math.PI/2; fshaft.position.set(r*2.6+len/2,r*.95,r*.9); fallen.add(fshaft);
  const fcap=new THREE.Group(); fcap.add(lathe([[r*.94,0],[r*1.1,.04],[r*1.3,.16],[r*1.42,.24],[r*1.42,.27]],material,0,0,0,18),bx(r*3.1,.06,r*3.1,material,0,.27,0)); fcap.rotation.z=-Math.PI/2; fcap.position.set(r*2.6+len+.02,r*1.45,r*.9); fcap.rotation.y=.3; fallen.add(fcap);
  if(globe){const fg=globeMesh(gr); fg.position.set(r*2.6+len+.45,gr,r*1.7); fallen.add(fg);}
  const rr=rng(21);
  for(let i=0;i<7;i++){const s=.04+rr()*.07, ch=mesh(new THREE.DodecahedronGeometry(s,0),material,(rr()-.2)*r*3,s*.7,(rr()-.2)*r*3.5); ch.rotation.set(rr()*3,rr()*3,0); ch.scale.y=.7; fallen.add(ch);}
  g.add(standing,snapped,fallen);
  g.setBroken=(b)=>{
    standing.visible=!b; snapped.visible=b; fallen.visible=b; g.broken=b;
    g.footprint=circleFootprint(r*1.35);
    g.footprints=b?[circleFootprint(r*1.35),{type:'box',x1:r*1.8,z1:r*.1,x2:r*2.6+len+.7,z2:r*1.9}]:[circleFootprint(r*1.35)];
  };
  g.setBroken(broken);
  g.topY=height+(globe?gr*1.8:0);
  return finish(g,{parts:{shaft,capital:cap,globe:globeObj||cap,fallen,base},footprint:g.footprint,footprints:g.footprints});
}

/* ---------- carved text panel ---------- */
const panelGeos=new Map(), panelMats=new Map();
/*
 * Stone panel with incised lettering on its +z face. lines: string or array of lines. mirrored:
 * the text reads reversed (as seen in water). w,h,depth in metres. Needs a canvas with a serif font.
 */
export function textPanel({lines='',w=1.6,h=.5,depth=.06,mirrored=false,material='stone',spacing=.08}={}){
  const g=new THREE.Group(); g.name='textPanel';
  const key=`${w},${h},${depth},${material}`;
  if(!panelGeos.has(key)){
    const geo=boxGeo(w,h,depth,tileOf(material)).clone(), uv=geo.attributes.uv, ref=new THREE.BoxGeometry(w,h,depth).attributes.uv;
    for(let i=16;i<20;i++) uv.setXY(i,ref.getX(i),ref.getY(i));   /* front face: the texture spans it whole */
    geo.userData.shared=true; panelGeos.set(key,geo);
  }
  const set=carvedTextSet({lines,mirrored,aspect:w/h,spacing});
  const mk=JSON.stringify([lines,mirrored,w,h,spacing]);
  if(!panelMats.has(mk)){const m=new THREE.MeshStandardMaterial({map:set.map,normalMap:set.normalMap,normalScale:new THREE.Vector2(1.2,1.2),roughness:.9}); m.userData.shared=true; panelMats.set(mk,m);}
  const side=mat(material);
  const body=new THREE.Mesh(panelGeos.get(key),[side,side,side,side,panelMats.get(mk),side]);
  body.position.y=h/2; body.castShadow=body.receiveShadow=true; g.add(body);
  return finish(g,{parts:{face:body},footprint:null});
}
