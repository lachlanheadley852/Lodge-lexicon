/*
 * The Chamber of Reflection (Degree I, room 1), built from the kit. A low stone cell, 5 m x 5 m, 2.7 m
 * high. Axes: x east, z south, y up, metres; the interior is x,z in [-2.5, 2.5].
 *
 *   north  table (skull with the flint, candle, hourglass, bread and water) with VITRIOL carved above
 *   east   locked plank door (opens when f.open1 -> doorway `toHall`, warm light beyond)
 *   south  bricked arch `entrance` with the inscription above it
 *   west   a dim painting, the loose floor stone `slab` (moves aside to show a hollow and the `key`),
 *          the iron `bar` leaning in the north-west corner (seen only once the candle is lit)
 *
 * Built once per entry; apply(S) moves everything to the flags in place. Dark until f.lit: only the
 * strip of light under the east door and whatever it reaches.
 */
import * as THREE from 'three';
import * as K from '../kit/index.js';
import {hot,setHot,hotGroup,newPlan,fillPlan,fillTriggers,switchableAtmosphere,ease,glowMaterial} from './util.js';

const W=2.5, H=2.7, T=.4;           /* half-width, ceiling height, wall thickness */
const TOP=.92, TABLE_Z=-2.05;       /* table-top height; table centre line */
const DOOR_W=1.1, DOOR_H=2.0;       /* east doorway */
const SX=-1.7, SZ=.2, SLAB_SLIDE=1.25;   /* the floor stone */

let paintingTex=null;
function painting(){
  if(paintingTex) return paintingTex;
  const c=document.createElement('canvas'); c.width=256; c.height=192; const g=c.getContext('2d');
  g.fillStyle='#1c1612'; g.fillRect(0,0,256,192);
  g.strokeStyle='rgba(120,100,76,.55)'; g.lineWidth=2; g.lineJoin='round';
  g.beginPath(); g.moveTo(10,150); g.lineTo(60,92); g.lineTo(84,120); g.lineTo(118,60); g.lineTo(158,118); g.lineTo(188,86); g.lineTo(246,150); g.stroke();
  g.strokeStyle='rgba(120,100,76,.3)'; g.beginPath(); g.moveTo(0,160); g.quadraticCurveTo(128,140,256,162); g.stroke();
  g.fillStyle='rgba(150,120,80,.25)'; g.beginPath(); g.arc(196,44,13,0,7); g.fill();
  paintingTex=new THREE.CanvasTexture(c); paintingTex.colorSpace=THREE.SRGBColorSpace; paintingTex.userData.shared=true;
  return paintingTex;
}

export function buildReflection(S){
  const root=new THREE.Group();
  const plan=newPlan(), triggers=[];
  const staticBoxes=[];

  /* ---- shell ---- */
  root.add(K.floor({w:5.8,d:5.8,material:'stone'}));
  root.add(K.ceiling({w:5.8,d:5.8,height:H,material:'stone'}));
  const put=(o,x,y,z,ry=0)=>{o.position.set(x,y,z); o.rotation.y=ry; root.add(o); return o;};
  put(K.wall({length:5.8,height:H,thickness:T}),0,0,-W-T/2);                                   /* north */
  put(K.wall({length:5,height:H,thickness:T}),-W-T/2,0,0,Math.PI/2);                          /* west */
  const east=put(K.archDoorway({length:5,height:H,thickness:T,width:DOOR_W,openingHeight:DOOR_H,state:'door'}),W+T/2,0,0,-Math.PI/2);
  const south=put(K.archDoorway({length:5.8,height:H,thickness:T,width:1.3,openingHeight:1.9,state:'bricked'}),0,0,W+T/2,Math.PI);

  /* ---- north: VITRIOL and the table ---- */
  const vit=hotGroup('vitriol',undefined,2.6,.5,.12,0,1.9,-W+.06);
  const vitText=K.textPanel({lines:'V · I · T · R · I · O · L',w:2.4,h:.36}); vitText.position.set(0,1.72,-W+.03); vit.add(vitText);
  root.add(vit);

  const table=put(K.table({w:2.6,d:.8,h:TOP}),0,0,TABLE_Z);
  K.addToPlan(plan,table); staticBoxes.push(...plan.boxes);

  const skullHot=hotGroup('skull',f=>!f.flint,.34,.34,.34,-.85,TOP+.11,TABLE_Z+.04);
  const bone=K.skull(); bone.position.set(-.85,TOP,TABLE_Z); bone.rotation.y=.35; skullHot.add(bone);
  const flint=K.flint(); flint.scale.setScalar(1.5); flint.position.set(-.85+.03,TOP+.043,TABLE_Z+.085); flint.rotation.y=.35;
  const glintMat=new THREE.MeshStandardMaterial({color:0x4a4c52,roughness:.3,emissive:0xb9ad92,emissiveIntensity:.3});
  flint.traverse(o=>{if(o.isMesh) o.material=glintMat;});
  skullHot.add(flint); root.add(skullHot);

  const candleHot=hotGroup('candle',undefined,.26,.42,.26,0,TOP+.2,TABLE_Z);
  const wax=K.candle({height:.22,lit:false,shadow:true,seed:3,intensity:9.5});    /* the room's one shadow caster */
  wax.position.set(0,TOP,TABLE_Z); candleHot.add(wax); root.add(candleHot);

  const hgHot=hotGroup('hourglass',undefined,.2,.3,.2,.55,TOP+.12,TABLE_Z);
  const sand=K.hourglass(); sand.position.set(.55,TOP,TABLE_Z); hgHot.add(sand); root.add(hgHot);

  const breadHot=hotGroup('bread',undefined,.5,.2,.28,1.0,TOP+.07,TABLE_Z);
  const fare=K.breadAndWater(); fare.position.set(1.0,TOP,TABLE_Z); fare.rotation.y=.2; breadHot.add(fare); root.add(breadHot);

  /* ---- south: the bricked entrance and its inscription ---- */
  const op=south.parts.opening; op.add(K.hitVolume(1.5,2.1,.3)); op.children.at(-1).userData.hotspot='entrance';
  hot(south.parts.fill,'entrance');
  const ins=hotGroup('inscription',undefined,3.5,.4,.12,0,2.38,W-.06);
  const insText=K.textPanel({lines:'NONE RETURN THE WAY THEY CAME',w:3.2,h:.26}); insText.position.set(0,2.25,W-.03); insText.rotation.y=Math.PI; ins.add(insText);
  root.add(ins);

  /* ---- west: a dim painting, the floor stone, the key, the bar ---- */
  const frame=new THREE.Group(); frame.position.set(-W+.03,1.55,.95); frame.rotation.y=Math.PI/2; root.add(frame);
  frame.add(K.bx(1.3,1.0,.05,'darkwood',0,0,0));
  const canvasPic=new THREE.Mesh(new THREE.PlaneGeometry(1.14,.84),new THREE.MeshStandardMaterial({map:painting(),roughness:1})); canvasPic.position.z=.027; canvasPic.receiveShadow=true; frame.add(canvasPic);

  const slabHot=hotGroup('slab',undefined,1.05,.07,1.0,0,.035,0);   /* the pit (and, when shut, the stone) */
  slabHot.position.set(SX,0,SZ);
  const pit=new THREE.Mesh(new THREE.PlaneGeometry(.92,.82),new THREE.MeshStandardMaterial({color:0x14100d,roughness:1})); pit.rotation.x=-Math.PI/2; pit.position.y=.004; pit.userData.noPick=true; slabHot.add(pit);
  for(const [w,d,x,z] of[[.98,.04,0,.43],[.98,.04,0,-.43],[.04,.86,.47,0],[.04,.86,-.47,0]]) slabHot.add(K.bx(w,.012,d,'stone',x,.006,z,{cast:false}));
  const stone=new THREE.Group(); slabHot.add(stone);
  stone.add(K.bx(1,.07,.9,'stone',0,.035,0));
  for(const [w,d,x,z] of[[.46,.025,0,.23],[.46,.025,0,-.23],[.025,.46,.23,0],[.025,.46,-.23,0]]) stone.add(K.bx(w,.01,d,'coal',x,.0705,z,{cast:false}));
  root.add(slabHot);

  const keyHot=hotGroup('key',true,.34,.2,.34,0,.06,0); keyHot.position.set(SX-.02,0,SZ);
  const key=K.ironKey(); key.position.y=.004; keyHot.add(key);
  const keyMat=new THREE.MeshStandardMaterial({color:0xb08a4a,roughness:.4,metalness:.6,emissive:0x7a5a22,emissiveIntensity:.55});   /* a glint in the dark hollow */
  key.traverse(o=>{if(o.isMesh) o.material=keyMat;}); root.add(keyHot);

  const barHot=hotGroup('bar',true,.34,1.2,.34,0,.6,0); barHot.position.set(-W+.12,0,-1.45); barHot.rotation.y=Math.PI/2;   /* leans on the west wall, past the end of the table so the candle reaches it */
  const rod=K.ironBar({length:1.1,mode:'leaning'}); barHot.add(rod); root.add(barHot);
  const rust=new THREE.MeshStandardMaterial({color:0x7a4a2c,roughness:.75,metalness:.15});   /* rusted: bare metal would read black with no environment to reflect */
  rod.traverse(o=>{if(o.isMesh){o.material=rust; o.scale.x*=1.5; o.scale.z*=1.5;}});

  /* ---- east: the door, the strip of light beneath it, and what lies beyond ---- */
  const leaf=east.parts.door;                                  /* the plank door, hotspot `innerdoor` while locked */
  const toHall=hotGroup('toHall',undefined,.35,DOOR_H,DOOR_W,W+.2,DOOR_H/2,0); root.add(toHall);
  const strip=new THREE.Mesh(new THREE.PlaneGeometry(DOOR_W,.035),new THREE.MeshBasicMaterial({color:0xffcf7a,toneMapped:false,fog:false}));
  strip.position.set(W+.24,.02,0); strip.rotation.y=-Math.PI/2; strip.userData.noPick=true; root.add(strip);
  const pool=new THREE.Mesh(new THREE.PlaneGeometry(1.5,1.0),new THREE.MeshBasicMaterial({color:0xffcf7a,transparent:true,opacity:.07,depthWrite:false,fog:false}));
  pool.rotation.x=-Math.PI/2; pool.position.set(W-.8,.004,0); pool.userData.noPick=true; root.add(pool);
  const spill=K.spill({x:W-.15,y:.12,z:0,tx:W-1.6,ty:0,tz:0,color:0xffc27a,intensity:K.LIGHT.spill,angle:1.3,distance:5});
  root.add(spill);
  /* beyond the open door: a short passage ending in warm light */
  const beyond=new THREE.Group(); root.add(beyond);
  beyond.add(K.bx(1.2,.1,DOOR_W+.4,'stone',W+.75,-.05,0,{cast:false}));
  beyond.add(K.bx(1.3,2.4,.12,'stone',W+.75,1.2,DOOR_W/2+.06,{cast:false}), K.bx(1.3,2.4,.12,'stone',W+.75,1.2,-DOOR_W/2-.06,{cast:false}));
  const glowWall=new THREE.Mesh(new THREE.PlaneGeometry(DOOR_W+.2,2.3),glowMaterial());
  glowWall.position.set(W+1.35,1.15,0); glowWall.rotation.y=-Math.PI/2; glowWall.userData.noPick=true; beyond.add(glowWall);
  const doorFill=K.fill({x:W+.25,y:1.3,z:0,intensity:0,distance:6}); root.add(doorFill);

  /* ---- light ---- */
  const atm=switchableAtmosphere(); root.add(atm.group);
  /* candle light bouncing off the ceiling and walls: a soft shadowless fill that only exists while the candle burns,
     so the far corners (slab, bar, south wall) are readable */
  const bounce=K.fill({x:-.2,y:2.3,z:.2,intensity:0,distance:8,color:0xffb870}); root.add(bounce);
  const tick=K.collectUpdaters(root);

  /* ---- state ---- */
  let slabOff=0, slabTarget=0, lastT=null, first=true;
  function apply(S){
    const f=S.f, animate=!first;
    atm.set(!!f.lit);
    wax.setLit(!!f.lit); bounce.intensity=f.lit?K.LIGHT.doorFill*1.3:0;

    flint.visible=!f.flint;
    barHot.visible=!!f.lit&&!f.barTaken;
    keyHot.visible=!!f.slab&&!f.keyTaken;
    pit.visible=!!f.slab;
    slabTarget=f.slab?SLAB_SLIDE:0; if(!animate){slabOff=slabTarget; stone.position.z=slabOff;}

    east.setDoorOpen(f.open1?1:0,animate?1.4:0);
    setHot(leaf,f.open1?null:'innerdoor');
    toHall.visible=!!f.open1;
    beyond.visible=!!f.open1; strip.visible=!f.open1; pool.visible=!f.open1;
    spill.light.intensity=f.open1?0:K.LIGHT.spill;
    doorFill.intensity=f.open1?K.LIGHT.doorFill:0;

    /* collision: the walls, the door plane (shut) or the passage (open), and the moved stone */
    const walls=[[-W,-W,W,-W],[-W,W,-W,-W],[W,W,-W,W],[W,-W,W,-DOOR_W/2],[W,DOOR_W/2,W,W]];
    const triggerList=[];
    if(f.open1){
      walls.push([W,-DOOR_W/2,W+.4,-DOOR_W/2],[W,DOOR_W/2,W+.4,DOOR_W/2],[W+.4,-DOOR_W/2,W+.4,DOOR_W/2]);
      triggerList.push({x1:W+.05,x2:W+.4,z1:-DOOR_W/2,z2:DOOR_W/2,hotspot:'toHall'});
    } else walls.push([W,-DOOR_W/2,W,DOOR_W/2]);
    const boxes=[...staticBoxes];
    if(f.slab) boxes.push({x1:SX-.5,x2:SX+.5,z1:SZ+SLAB_SLIDE-.45,z2:SZ+SLAB_SLIDE+.45});
    fillPlan(plan,{walls,boxes,circles:[]}); fillTriggers(triggers,triggerList);
    first=false;
  }
  apply(S);

  return {
    group:root, plan, triggers, fog:atm.fog,
    get background(){return atm.background;},
    /* arriving from the hall: just inside the east door, facing west into the room */
    spawns:{default:{x:0,z:1.5,yaw:0},hall:{x:W-.6,z:0,yaw:Math.PI/2}},
    update(t){
      const dt=lastT===null?0:Math.min(.1,t-lastT); lastT=t;
      slabOff=ease(slabOff,slabTarget,dt,2.4); if(Math.abs(slabOff-slabTarget)<.002) slabOff=slabTarget;
      stone.position.z=slabOff;
      tick(t,dt);
      glintMat.emissiveIntensity=.35+.3*Math.sin(t*2.2);
    },
    apply
  };
}
