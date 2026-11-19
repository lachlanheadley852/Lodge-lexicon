/*
 * The Hall of Instruction (Degree I, room 2), built from the kit. A long candlelit hall, 4 m wide and
 * 10 m long, 3.6 m high. Axes: x east, z south, y up, metres; the interior is x in [-2,2], z in [-5,5].
 *
 *   north  the great double door with square and compass (`lodgeDoor`; opens when f.rung -> `toLodge`,
 *          light beyond); the lectern with the dusty book stands before it
 *   east   the veiled statue (veil lifts when f.veil) holding the cord until f.cordTaken
 *   west   the bell high on its bracket, rope cut short (the cord ties on when f.tied; it rings when
 *          f.rung turns on), and a bench below it
 *   south  the doorway back to the Chamber (`toReflection`), plank door ajar, dim warm light beyond
 * Candles in sconces along both walls. Built once per entry; apply(S) updates in place.
 */
import * as THREE from 'three';
import * as K from '../kit/index.js';
import {hot,setHot,hotGroup,newPlan,fillPlan,fillTriggers,glowMaterial} from './util.js';

const HW=2, HL=5, H=3.6, T=.4;       /* half-width, half-length, ceiling, wall thickness */
const DOOR_W=2.2, DOOR_H=2.6;        /* the great door */
const BELL_Z=1.0;

export function buildHall(S){
  const root=new THREE.Group();
  const plan=newPlan(), triggers=[];
  const put=(o,x,y,z,ry=0,parent=root)=>{o.position.set(x,y,z); o.rotation.y=ry; parent.add(o); return o;};

  /* ---- shell ---- */
  root.add(K.floor({w:4.8,d:10.8,material:'marble'}));
  root.add(K.ceiling({w:4.8,d:10.8,height:H,material:'stone',beams:true}));
  put(K.wall({length:4,height:H,thickness:T,openings:[{x:0,width:DOOR_W,height:DOOR_H}]}),0,0,-HL-T/2);
  put(K.wall({length:10.8,height:H,thickness:T}),-HW-T/2,0,0,Math.PI/2);
  put(K.wall({length:10.8,height:H,thickness:T}),HW+T/2,0,0,-Math.PI/2);
  const back=put(K.archDoorway({length:4,height:H,thickness:T,width:1.2,openingHeight:2.2,state:'door',doorOpen:1}),0,0,HL+T/2,Math.PI);

  /* ---- north: the great door and what lies beyond it ---- */
  const great=put(K.doubleDoor({width:DOOR_W,height:DOOR_H}),0,0,-HL-T/2);
  hot(great,'lodgeDoor');
  const toLodge=hotGroup('toLodge',undefined,DOOR_W,DOOR_H,.3,0,DOOR_H/2,0); great.add(toLodge);
  const lodge=new THREE.Group(); root.add(lodge);
  lodge.add(K.bx(2.9,.1,2.4,'marble',0,-.05,-HL-T/2-1.2,{cast:false}));
  lodge.add(K.bx(.1,2.8,2.4,'stone',-1.45,1.4,-HL-T/2-1.2,{cast:false}), K.bx(.1,2.8,2.4,'stone',1.45,1.4,-HL-T/2-1.2,{cast:false}));
  const glow=new THREE.Mesh(new THREE.PlaneGeometry(2.9,2.8),glowMaterial());
  glow.position.set(0,1.4,-HL-T/2-2.4); glow.userData.noPick=true; lodge.add(glow);
  const lodgeFill=K.fill({x:0,y:1.6,z:-HL-1,intensity:0,distance:7}); root.add(lodgeFill);

  /* the lectern, with the dusty book */
  const lectern=put(K.lectern({book:'closed',dusty:true}),-.75,0,-3.4);
  hot(lectern,'book',f=>!f.dust); lectern.add(K.hitVolume(.75,.55,.6,0,1.15,0));
  K.addToPlan(plan,lectern);
  const staticCircles=[...plan.circles];

  /* ---- east: the veiled statue and the cord ---- */
  const stand=put(new THREE.Group(),HW-.45,0,-.9,-Math.PI/2);
  const statue=K.veiledStatue({veil:true});
  hot(statue,'statue',f=>!f.veil); statue.add(K.hitVolume(.76,2.0,.76,0,1.0,0)); stand.add(statue);
  const cord=hotGroup('cord',true,.4,.4,.5,0,1.5,.3); stand.add(cord);
  const coil=K.cordCoil({loops:3,radius:.075}); coil.rotation.x=Math.PI/2; coil.position.set(0,1.5,.21); cord.add(coil);
  root.updateMatrixWorld(true); K.addToPlan(plan,statue);   /* the statue's own footprint, in world space */
  const statueBoxes=[...plan.boxes];

  /* ---- west: the bell on its bracket, and a bench under it ---- */
  const bellCut=put(K.bell({rope:'cut',mountY:2.9}),-HW,0,BELL_Z,Math.PI/2);
  const bellTied=put(K.bell({rope:'hanging',mountY:2.9}),-HW,0,BELL_Z,Math.PI/2);
  for(const [b,len,cy] of[[bellCut,.75,-.325],[bellTied,1.95,-.91]]){
    const hv=K.hitVolume(.5,len,.5,0,cy,0); b.parts.swing.add(hv);
    hot(hv,'bell',f=>!!f.tied&&!f.rung);
  }
  const bench=put(new THREE.Group(),-HW+.3,0,BELL_Z);
  bench.add(K.bx(.44,.06,1.5,'darkwood',0,.44,0));
  bench.add(K.bx(.4,.41,.07,'darkwood',0,.205,.65), K.bx(.4,.41,.07,'darkwood',0,.205,-.65));
  const benchBox={x1:-HW,x2:-HW+.54,z1:BELL_Z-.78,z2:BELL_Z+.78};

  /* ---- south: the way back ---- */
  const toRefl=hotGroup('toReflection',undefined,1.2,2.2,.3,0,1.1,HL+.2); root.add(toRefl);
  const dim=new THREE.Group(); root.add(dim);
  dim.add(K.bx(1.6,.1,1.5,'stone',0,-.05,HL+1.15,{cast:false}));
  dim.add(K.bx(.1,2.4,1.5,'stone',-.85,1.2,HL+1.15,{cast:false}), K.bx(.1,2.4,1.5,'stone',.85,1.2,HL+1.15,{cast:false}));
  const dimWall=new THREE.Mesh(new THREE.PlaneGeometry(1.6,2.4),new THREE.MeshBasicMaterial({color:0x4b3016,toneMapped:false,fog:false}));
  dimWall.position.set(0,1.2,HL+1.9); dimWall.rotation.y=Math.PI; dimWall.userData.noPick=true; dim.add(dimWall);
  root.add(K.fill({x:0,y:1.5,z:HL+.8,intensity:1.2,distance:4.5,color:0xffa84e}));

  /* ---- candles along the walls (two cast shadows, the rest are cheap) ---- */
  const sconces=[[-1,-3.4,true],[-1,3.0],[1,-2.6,true],[1,1.3],[1,3.5]];
  for(const [side,z,shadow] of sconces){
    const s=K.sconce({y:1.7,held:true,lit:true,shadow:!!shadow}); s.position.set(side*HW,0,z); s.rotation.y=-side*Math.PI/2; root.add(s);
  }

  /* ---- light ---- */
  const atm=K.atmosphere('candlelit'); root.add(atm.group);
  const tick=K.collectUpdaters(root);

  /* ---- state ---- */
  let first=true, wasRung=false;
  function apply(S){
    const f=S.f, animate=!first;
    lectern.setDusty(!f.dust); lectern.setBook(f.dust?'open':'closed');
    statue.setVeil(!f.veil);
    cord.visible=!!f.veil&&!f.cordTaken;
    bellCut.visible=!f.tied; bellTied.visible=!!f.tied;
    if(f.rung&&!wasRung&&animate){bellCut.ring(); bellTied.ring();}
    wasRung=!!f.rung;

    great.setOpen(f.rung?1:0,animate?2.4:0);
    setHot(great,f.rung?null:'lodgeDoor');
    toLodge.visible=!!f.rung; lodge.visible=!!f.rung;
    lodgeFill.intensity=f.rung?K.LIGHT.doorFill:0;

    const walls=[[-HW,-HL,-HW,HL],[HW,-HL,HW,HL],
      [-HW,-HL,-DOOR_W/2,-HL],[DOOR_W/2,-HL,HW,-HL],
      [-HW,HL,-.6,HL],[.6,HL,HW,HL],
      [-.6,HL,-.6,HL+1.4],[.6,HL,.6,HL+1.4],[-.6,HL+1.4,.6,HL+1.4]];
    const trig=[{x1:-.6,x2:.6,z1:HL+.7,z2:HL+1.4,hotspot:'toReflection'}];
    if(f.rung){
      walls.push([-DOOR_W/2,-HL,-DOOR_W/2,-HL-2.2],[DOOR_W/2,-HL,DOOR_W/2,-HL-2.2],[-DOOR_W/2,-HL-2.2,DOOR_W/2,-HL-2.2]);
      trig.push({x1:-DOOR_W/2,x2:DOOR_W/2,z1:-HL-2.2,z2:-HL-1.0,hotspot:'toLodge'});
    } else walls.push([-DOOR_W/2,-HL,DOOR_W/2,-HL]);
    fillPlan(plan,{walls,boxes:[...statueBoxes,benchBox],circles:staticCircles}); fillTriggers(triggers,trig);
    first=false;
  }
  apply(S);

  return {
    group:root, plan, triggers, fog:atm.fog, background:atm.background,
    /* from the Chamber: just inside the south doorway, facing up the hall; from the Apprentice's Chamber: just inside the great door */
    spawns:{default:{x:0,z:HL-.9,yaw:0},reflection:{x:0,z:HL-.9,yaw:0},apprentice:{x:0,z:-HL+.8,yaw:Math.PI}},
    update(t){tick(t);},
    apply
  };
}
