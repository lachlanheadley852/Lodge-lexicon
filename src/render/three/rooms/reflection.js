/*
 * Greybox Chamber of Reflection (Degree I, room 1). Mirrors the 2D rfNorth/East/South/West views:
 * north table with the skull, candle, hourglass and bread, with VITRIOL above it; east inner door;
 * south bricked entrance and inscription; west floor slab, key hollow and the iron bar in the corner.
 * Axes: x east, z south, y up, metres. Room interior is 5 m x 5 m, 2.8 m high.
 */
import * as THREE from 'three';
import {box,slab,cyl,sphere,glow,hitBox,hot,textPlane,mat,wallRing} from './greybox.js';

const H=2.8, W=2.5;          /* ceiling height, half-width of the interior */
const GAP=0.6;               /* half-width of the east doorway */
const DOOR_H=2.1;
const STONE=0x6b655d, DARK=0x1a1512;
const CANDLE=60;             /* candle light intensity (candela) */

function group(id){const g=new THREE.Group(); if(id) hot(id,g); return g;}

export function buildReflection(S){
  const f=S.f;
  const root=new THREE.Group();
  const triggers=[];
  const animated=[];  /* fns(t) run every frame */

  /* ---- shell ---- */
  root.add(box(7,.1,7,0,-.05,0,0x4a453f));                       /* floor */
  root.add(box(7,.1,7,0,H+.05,0,0x3d3934));                      /* ceiling */
  root.add(slab(-3,-3,3,-W,0,H,STONE));                          /* north */
  root.add(slab(-3,W,3,3,0,H,STONE));                            /* south */
  root.add(slab(-3,-W,-W,W,0,H,STONE));                          /* west */
  root.add(slab(W,-3,3.2,-GAP,0,H,STONE));                       /* east, either side of the doorway */
  root.add(slab(W,GAP,3.2,3,0,H,STONE));
  root.add(slab(W,-GAP,3.2,GAP,DOOR_H,H,STONE));                 /* lintel */
  root.add(slab(2.9,-GAP,3.2,GAP,0,H,STONE));                    /* back of the doorway recess */

  const walls=wallRing(-W,-W,W,W).filter(w=>!(w[0]===W&&w[2]===W));
  walls.push([W,-W,W,-GAP],[W,GAP,W,W]);
  const plan={walls,boxes:[{x1:-1.3,z1:-2.4,x2:1.3,z2:-1.6}],circles:[],zones:[]};

  /* ---- north: lettering and the table ---- */
  const vit=group('vitriol');
  const vitText=textPlane('V·I·T·R·I·O·L',2.4,.36,{spacing:14}); vitText.position.set(0,2.05,-W+.02); vit.add(vitText);
  vit.add(hitBox(2.6,.55,.12,0,2.05,-W+.06));
  root.add(vit);

  root.add(box(2.6,.08,.8,0,.88,-2.0,0x3a2e24));                 /* table top */
  for(const x of[-1.2,1.2]) for(const z of[-2.3,-1.7]) root.add(box(.07,.88,.07,x,.44,z,0x2a2018));

  const TOP=.92;
  const skull=group('skull');
  skull.add(sphere(.1,-.85,TOP+.12,-2.0,0xcfc4a8));
  skull.add(box(.09,.05,.08,-.85,TOP+.03,-1.97,0xbfb497));
  skull.add(sphere(.022,-.88,TOP+.13,-1.92,0x1a1512)); skull.add(sphere(.022,-.82,TOP+.13,-1.92,0x1a1512));
  if(!f.flint){
    const shard=box(.05,.012,.03,-.85,TOP+.007,-1.9,0xe8e4dc,{emissive:0x888070,emissiveIntensity:.6});
    shard.rotation.y=.6; skull.add(shard);
    const m=shard.material.clone(); shard.material=m;   /* own material so only the shard pulses */
    animated.push(t=>{m.emissiveIntensity=.5+.5*Math.sin(t*2.2);});
  }
  skull.add(hitBox(.34,.34,.34,-.85,TOP+.1,-1.95));
  root.add(skull);

  const candle=group('candle');
  candle.add(cyl(.09,.02,0,TOP+.01,-2.0,0x2a2420));
  const stick=cyl(.025,.22,0,TOP+.12,-2.0,0xd8ccb0); stick.castShadow=false; candle.add(stick);
  candle.add(hitBox(.24,.4,.24,0,TOP+.2,-2.0));
  root.add(candle);
  let candleLight=null, flame=null;
  if(f.lit){
    flame=glow(new THREE.SphereGeometry(.03,10,8),0xffd27a,0,TOP+.27,-2.0); flame.scale.set(1,1.8,1); candle.add(flame);
    candleLight=new THREE.PointLight(0xffb765,CANDLE,0,2); candleLight.position.set(0,TOP+.34,-2.0);
    candleLight.castShadow=true; candleLight.shadow.mapSize.set(1024,1024); candleLight.shadow.bias=-.003; candleLight.shadow.camera.near=.05; candleLight.shadow.camera.far=12; candleLight.shadow.radius=3;
    root.add(candleLight);
    animated.push(t=>{const k=1+.07*Math.sin(t*13)+.05*Math.sin(t*7.3+1); candleLight.intensity=CANDLE*k; flame.scale.set(1,1.8*k,1);});
  }

  const hg=group('hourglass');
  hg.add(cyl(.06,.015,.55,TOP+.008,-2.0,0x4a3a2a)); hg.add(cyl(.06,.015,.55,TOP+.2,-2.0,0x4a3a2a));
  const glass=new THREE.MeshStandardMaterial({color:0x8fa3a8,transparent:true,opacity:.5,roughness:.2});
  const lo=new THREE.Mesh(new THREE.CylinderGeometry(.01,.045,.09,12),glass); lo.position.set(.55,TOP+.065,-2.0);
  const hi=new THREE.Mesh(new THREE.CylinderGeometry(.045,.01,.09,12),glass); hi.position.set(.55,TOP+.155,-2.0);
  hg.add(lo,hi,cyl(.03,.03,.55,TOP+.03,-2.0,0xc9a86a));
  hg.add(hitBox(.2,.3,.2,.55,TOP+.1,-2.0));
  root.add(hg);

  const bread=group('bread');
  bread.add(box(.2,.07,.11,.9,TOP+.035,-2.0,0x8a6a3e));
  bread.add(cyl(.04,.08,1.12,TOP+.04,-2.0,0x2f5560));
  bread.add(hitBox(.5,.2,.25,1.0,TOP+.06,-2.0));
  root.add(bread);

  /* ---- east: the inner door ---- */
  root.add(slab(W-.05,-GAP-.08,W+.05,-GAP,0,DOOR_H+.08,0x3b332d));   /* frame */
  root.add(slab(W-.05,GAP,W+.05,GAP+.08,0,DOOR_H+.08,0x3b332d));
  if(f.open1){
    const way=group('toHall');
    way.add(glow(new THREE.PlaneGeometry(GAP*2,DOOR_H),0xffcf7a,2.88,DOOR_H/2,0,.75));
    way.children[0].rotation.y=-Math.PI/2; way.children[0].userData.noPick=true;
    way.add(hitBox(.4,DOOR_H,GAP*2,2.7,DOOR_H/2,0));
    root.add(way);
    const warm=new THREE.PointLight(0xffb765,3,6,2); warm.position.set(2.7,1.4,0); root.add(warm);
    walls.push([W,-GAP,2.9,-GAP],[W,GAP,2.9,GAP],[2.9,-GAP,2.9,GAP]);
    triggers.push({x1:W-.05,x2:2.9,z1:-GAP,z2:GAP,hotspot:'toHall'});
  } else {
    const door=group('innerdoor');
    door.add(box(.12,DOOR_H,GAP*2,W+.06,DOOR_H/2,0,0x3a2a1c));
    door.add(box(.14,.1,GAP*2,W+.06,1.6,0,0x1d1a18)); door.add(box(.14,.1,GAP*2,W+.06,.5,0,0x1d1a18));
    door.add(box(.08,.3,.2,W-.02,1.05,-.4,0x2a2622));    /* lock plate */
    walls.push([W,-GAP,W,GAP]);
    root.add(door);
    /* the line of light under the door, the player's only landmark in the dark */
    const strip=glow(new THREE.PlaneGeometry(GAP*2,.035),0xffcf7a,W-.001,.02,0,.9); strip.rotation.y=-Math.PI/2; root.add(strip);
    const spill=glow(new THREE.PlaneGeometry(1.6,1.0),0xffcf7a,W-.8,.004,0,.07); spill.rotation.x=-Math.PI/2; root.add(spill);
    const seep=new THREE.PointLight(0xffcf7a,.9,4,2); seep.position.set(W-.2,.1,0); root.add(seep);
  }

  /* ---- south: bricked entrance and inscription ---- */
  const ent=group('entrance');
  ent.add(box(1.4,2.0,.12,0,1.0,W-.06,0x5a4a3e));
  const archTop=new THREE.Mesh(new THREE.CylinderGeometry(.7,.7,.12,20),mat(0x5a4a3e)); archTop.rotation.x=Math.PI/2; archTop.position.set(0,2.0,W-.06);
  archTop.castShadow=archTop.receiveShadow=true; ent.add(archTop);
  ent.add(hitBox(1.5,2.8,.3,0,1.4,W-.1));
  root.add(ent);
  const ins=group('inscription');
  const insText=textPlane('NONE RETURN THE WAY THEY CAME',3.4,.3,{spacing:5,facing:-1}); insText.position.set(0,2.3,W-.02); ins.add(insText);
  ins.add(hitBox(3.5,.5,.12,0,2.3,W-.06));
  root.add(ins);

  /* ---- west: the old niche, the slab, the key and the bar ---- */
  root.add(box(.05,.9,1.3,-W+.02,1.5,-.9,DARK));
  const SX=-1.7, SZ=.2;
  const pit=new THREE.Mesh(new THREE.PlaneGeometry(.95,.85),new THREE.MeshBasicMaterial({color:0x050404})); pit.rotation.x=-Math.PI/2; pit.position.set(SX,.006,SZ); pit.userData.noPick=true;
  const slabBox=group('slab');
  if(f.slab){
    root.add(pit);
    slabBox.add(box(1,.1,.9,SX,.05,SZ+1.15,0x3a332c));
    if(!f.keyTaken){
      const key=group('key');
      const ring=new THREE.Mesh(new THREE.TorusGeometry(.035,.009,8,14),mat(0xb8a37a,{metalness:.5,roughness:.5})); ring.rotation.x=Math.PI/2; ring.position.set(SX-.1,.03,SZ); ring.castShadow=true;
      key.add(ring, box(.16,.014,.014,SX,.03,SZ,0xb8a37a,{metalness:.5,roughness:.5}), box(.014,.014,.04,SX+.06,.03,SZ+.02,0xb8a37a));
      key.add(hitBox(.32,.2,.3,SX-.02,.08,SZ));
      root.add(key);
    }
  } else slabBox.add(box(1,.1,.9,SX,.05,SZ,0x3a332c));
  root.add(slabBox);

  if(f.lit&&!f.barTaken){
    const bar=group('bar');
    const rod=cyl(.022,1.1,0,0,0,0x6b3f22,10); rod.position.set(-W+.1,.55,-W+.12); rod.rotation.z=-.1; bar.add(rod);
    bar.add(box(.07,.07,.02,-W+.04,1.07,-W+.12,0x6b3f22));
    bar.add(hitBox(.35,1.2,.35,-W+.12,.6,-W+.15));
    root.add(bar);
  }

  /* ---- light ---- */
  root.add(new THREE.AmbientLight(f.lit?0x7a6a58:0x3a3a48,f.lit?16:.6));
  root.add(new THREE.HemisphereLight(0x6a6258,0x201a14,f.lit?5:.05));

  return {
    group:root, plan, triggers,
    background:0x000000,
    spawns:{default:{x:0,z:1.4,yaw:0},hall:{x:2.05,z:0,yaw:Math.PI/2}},
    update(t){for(const fn of animated) fn(t);}
  };
}
