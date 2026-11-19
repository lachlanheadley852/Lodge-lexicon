/*
 * Greybox Chamber of Reflection (Degree I, room 1). Mirrors the 2D rfNorth/East/South/West views:
 * north table with the skull, candle, hourglass and bread, with VITRIOL above it; east inner door;
 * south bricked entrance and inscription; west floor slab, key hollow and the iron bar in the corner.
 * Axes: x east, z south, y up, metres. Room interior is 5 m x 5 m, 2.8 m high.
 */
import * as THREE from 'three';
import {box,slab,cyl,sphere,glow,hitBox,hot,textPlane,mat,wallRing} from './greybox.js';
import * as K from '../kit/index.js';

const H=2.8, W=2.5;          /* ceiling height, half-width of the interior */
const GAP=0.6;               /* half-width of the east doorway */
const DOOR_H=2.1;
const STONE=0x6b655d, DARK=0x1a1512;

function group(id){const g=new THREE.Group(); if(id) hot(id,g); return g;}

export function buildReflection(S){
  const f=S.f;
  const root=new THREE.Group();
  const triggers=[];
  const animated=[];  /* fns(t) run every frame */

  /* ---- shell (kit stone) ---- */
  const sb=(x1,z1,x2,z2,y1,y2)=>K.bx(Math.abs(x2-x1),y2-y1,Math.abs(z2-z1),'stone',(x1+x2)/2,(y1+y2)/2,(z1+z2)/2);
  root.add(K.bx(7,.1,7,'stone',0,-.05,0));                       /* floor */
  root.add(K.bx(7,.1,7,'stone',0,H+.05,0));                      /* ceiling */
  root.add(sb(-3,-3,3,-W,0,H));                                   /* north */
  root.add(sb(-3,W,3,3,0,H));                                     /* south */
  root.add(sb(-3,-W,-W,W,0,H));                                   /* west */
  root.add(sb(W,-3,3.2,-GAP,0,H));                                /* east, either side of the doorway */
  root.add(sb(W,GAP,3.2,3,0,H));
  root.add(sb(W,-GAP,3.2,GAP,DOOR_H,H));                          /* lintel */
  root.add(sb(2.9,-GAP,3.2,GAP,0,H));                             /* back of the doorway recess */

  const walls=wallRing(-W,-W,W,W).filter(w=>!(w[0]===W&&w[2]===W));
  walls.push([W,-W,W,-GAP],[W,GAP,W,W]);
  const plan={walls,boxes:[{x1:-1.3,z1:-2.4,x2:1.3,z2:-1.6}],circles:[],zones:[]};

  /* ---- north: lettering and the table ---- */
  const vit=group('vitriol');
  const vitText=textPlane('V·I·T·R·I·O·L',2.4,.36,{spacing:14}); vitText.position.set(0,2.05,-W+.02); vit.add(vitText);
  vit.add(hitBox(2.6,.55,.12,0,2.05,-W+.06));
  root.add(vit);

  const table=K.table({w:2.6,d:.8,h:.92}); table.position.set(0,0,-2.0); root.add(table);

  const TOP=.92;
  const skull=group('skull');
  const bone=K.skull(); bone.position.set(-.85,TOP,-2.0); bone.rotation.y=.25; skull.add(bone);
  if(!f.flint){
    const shard=box(.05,.012,.03,-.85,TOP+.007,-1.9,0xe8e4dc,{emissive:0x888070,emissiveIntensity:.6});
    shard.rotation.y=.6; skull.add(shard);
    const m=shard.material.clone(); shard.material=m;   /* own material so only the shard pulses */
    animated.push(t=>{m.emissiveIntensity=.5+.5*Math.sin(t*2.2);});
  }
  skull.add(hitBox(.34,.34,.34,-.85,TOP+.1,-1.95));
  root.add(skull);

  const candle=group('candle');
  const wax=K.candle({height:.22,lit:f.lit,shadow:true,seed:3});   /* the room's one shadow caster */
  wax.position.set(0,TOP,-2.0); candle.add(wax);
  candle.add(hitBox(.24,.4,.24,0,TOP+.2,-2.0));
  root.add(candle);

  const hg=group('hourglass');
  const sand=K.hourglass(); sand.position.set(.55,TOP,-2.0); hg.add(sand);
  hg.add(hitBox(.2,.3,.2,.55,TOP+.1,-2.0));
  root.add(hg);

  const bread=group('bread');
  const fare=K.breadAndWater(); fare.position.set(1.0,TOP,-2.0); bread.add(fare);
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
    root.add(K.fill({x:2.7,y:1.4,z:0,intensity:K.LIGHT.doorFill,distance:6}));
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
    /* light from the hall seeping under the door: a faint warm spill raking across the floor */
    root.add(K.spill({x:W-.15,y:.12,z:0,tx:W-1.6,ty:0,tz:0,color:0xffc27a,intensity:K.LIGHT.spill,angle:1.3,distance:5}));
  }

  /* ---- south: bricked entrance and inscription ---- */
  const ent=group('entrance');
  ent.add(K.bx(1.4,2.0,.12,'brick',0,1.0,W-.06));
  const archTop=K.cy(.7,.7,.12,'brick',0,2.0,W-.06,20); archTop.rotation.x=Math.PI/2; ent.add(archTop);
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
      const iron=K.ironKey(); iron.position.set(SX,0,SZ); key.add(iron);
      key.add(hitBox(.32,.2,.3,SX-.02,.08,SZ));
      root.add(key);
    }
  } else slabBox.add(box(1,.1,.9,SX,.05,SZ,0x3a332c));
  root.add(slabBox);

  if(f.lit&&!f.barTaken){
    const bar=group('bar');
    const rod=K.ironBar({length:1.1,mode:'leaning'}); rod.position.set(-W+.14,0,-W+.2); bar.add(rod);
    bar.add(hitBox(.35,1.2,.35,-W+.12,.6,-W+.15));
    root.add(bar);
  }

  /* ---- light ---- */
  /* kit atmosphere: a faint floor of light so corners stay readable once the candle burns; almost
     none while it is dark, so only the strip under the door and its spill show anything */
  const atm=K.atmosphere(f.lit?'candlelit':'dark'); root.add(atm.group);
  const tick=K.collectUpdaters(root);

  return {
    group:root, plan, triggers,
    background:atm.background, fog:atm.fog,
    spawns:{default:{x:0,z:1.4,yaw:0},hall:{x:2.05,z:0,yaw:Math.PI/2}},
    update(t){tick(t); for(const fn of animated) fn(t);}
  };
}
