/*
 * Placeholder room for every room that has no 3D builder yet: a plain 6 m x 6 m stone box with a sign and a
 * doorway back through the south wall, so travel never dead-ends. Delete a room's entry here when
 * its real builder lands in rooms/index.js.
 */
import * as THREE from 'three';
import * as K from '../kit/index.js';
import {ROOM_NAMES} from '../../../game/data.js';
import {hot,hotGroup,newPlan} from './util.js';

/* Which doorway hotspot leads back out of each placeholder room (see TRAVEL in game/data.js). */
const BACK={hall:'toReflection',apprentice:'toHall2'};
const H=2.8, W=3, GAP=.6, DOOR_H=2.1;

export function buildPlaceholder(S){
  const id=S.room, back=BACK[id];
  const root=new THREE.Group(), triggers=[];
  root.add(K.floor({w:7,d:7,material:'stone'}), K.ceiling({w:7,d:7,height:H,material:'stone'}));
  const put=(o,x,z,ry=0)=>{o.position.set(x,0,z); o.rotation.y=ry; root.add(o); return o;};
  put(K.wall({length:7,height:H}),0,-W-.2);
  put(K.wall({length:6,height:H}),-W-.2,0,Math.PI/2);
  put(K.wall({length:6,height:H}),W+.2,0,-Math.PI/2);
  put(K.wall({length:7,height:H,openings:back?[{x:0,width:GAP*2,height:DOOR_H}]:[]}),0,W+.2,Math.PI);

  const walls=[[-W,-W,W,-W],[-W,W,-W,-W],[W,-W,W,W]];
  if(back){
    walls.push([-W,W,-GAP,W],[GAP,W,W,W],[-GAP,W,-GAP,W+.4],[GAP,W,GAP,W+.4],[-GAP,W+.4,GAP,W+.4]);
    const way=hotGroup(back,undefined,GAP*2,DOOR_H,.3,0,DOOR_H/2,W+.2); root.add(way);
    const g=new THREE.Mesh(new THREE.PlaneGeometry(GAP*2,DOOR_H),new THREE.MeshBasicMaterial({color:0xffcf7a,toneMapped:false,fog:false}));
    g.position.set(0,DOOR_H/2,W+.38); g.rotation.y=Math.PI; g.userData.noPick=true; root.add(g);
    triggers.push({x1:-GAP,x2:GAP,z1:W+.05,z2:W+.4,hotspot:back});
  } else walls.push([-W,W,W,W]);

  const sign=K.textPanel({lines:['This room is not built in 3D yet',ROOM_NAMES[id]||id],w:3.6,h:.8});
  sign.position.set(0,1.3,-W); root.add(sign);
  const lamp=K.candle({height:.2,lit:true,shadow:false}); lamp.position.set(0,1.0,-W+.6); root.add(lamp);
  root.add(K.bx(.5,1.0,.5,'stone',0,.5,-W+.6));
  const atm=K.atmosphere('candlelit'); root.add(atm.group);
  const tick=K.collectUpdaters(root);

  const plan=newPlan(); plan.walls=walls; plan.boxes.push({x1:-.25,x2:.25,z1:-W+.35,z2:-W+.85});
  return {group:root, plan, triggers, fog:atm.fog, background:atm.background,
    spawns:{default:{x:0,z:1.6,yaw:0}}, update:tick, apply(){}};
}
