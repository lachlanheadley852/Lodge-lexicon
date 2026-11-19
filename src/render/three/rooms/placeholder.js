/*
 * Placeholder room for every room that has no 3D builder yet: a plain 6 m x 6 m box with a sign and a
 * doorway back through the south wall, so travel never dead-ends. Delete a room's entry here when
 * its real builder lands in rooms/index.js.
 */
import * as THREE from 'three';
import {box,slab,glow,hitBox,hot,textPlane,wallRing} from './greybox.js';
import {ROOM_NAMES} from '../../../game/data.js';

/* Which doorway hotspot leads back out of each placeholder room (see TRAVEL in game/data.js). */
const BACK={hall:'toReflection',apprentice:'toHall2'};
const H=2.8, W=3, GAP=.6, DOOR_H=2.1, STONE=0x6b655d;

export function buildPlaceholder(S){
  const id=S.room, back=BACK[id];
  const root=new THREE.Group(), triggers=[];
  root.add(box(8,.1,8,0,-.05,0,0x4a453f), box(8,.1,8,0,H+.05,0,0x3d3934));
  root.add(slab(-W-.4,-W-.4,W+.4,-W,0,H,STONE));
  root.add(slab(-W-.4,-W,-W,W,0,H,STONE), slab(W,-W,W+.4,W,0,H,STONE));
  /* south wall, with a doorway when there is somewhere to go */
  root.add(slab(-W-.4,W,-GAP,W+.4,0,H,STONE), slab(GAP,W,W+.4,W+.4,0,H,STONE), slab(-GAP,W,GAP,W+.4,DOOR_H,H,STONE));
  const walls=wallRing(-W,-W,W,W).filter(w=>!(w[1]===W&&w[3]===W));
  walls.push([-W,W,-GAP,W],[GAP,W,W,W]);
  if(back){
    const way=new THREE.Group(); hot(back,way);
    const g=glow(new THREE.PlaneGeometry(GAP*2,DOOR_H),0xffcf7a,0,DOOR_H/2,W+.38,.7); g.rotation.y=Math.PI; g.userData.noPick=true; way.add(g);
    way.add(hitBox(GAP*2,DOOR_H,.4,0,DOOR_H/2,W+.2));
    root.add(way);
    walls.push([-GAP,W,-GAP,W+.4],[GAP,W,GAP,W+.4],[-GAP,W+.4,GAP,W+.4]);
    triggers.push({x1:-GAP,x2:GAP,z1:W+.05,z2:W+.4,hotspot:back});
  } else walls.push([-GAP,W,GAP,W]);

  const sign=textPlane(['This room is not built in 3D yet',ROOM_NAMES[id]||id],4,1.0,{color:'#d8ccb0',spacing:2,emissive:0x555048});
  sign.position.set(0,1.7,-W+.02); root.add(sign);
  const lamp=new THREE.PointLight(0xffc880,45,0,2); lamp.position.set(0,2.4,0); root.add(lamp);
  root.add(new THREE.AmbientLight(0x7a7668,18));

  return {group:root, plan:{walls,boxes:[],circles:[],zones:[]}, triggers, background:0x000000,
    spawns:{default:{x:0,z:1.6,yaw:0}}};
}
