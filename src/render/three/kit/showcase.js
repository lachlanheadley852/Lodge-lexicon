/*
 * Dev-only showcase: a dim stone gallery with every kit builder on display, lit by candles.
 * Open /src/render/three/kit/showcase.html under `npm run dev`. Not linked from index.html, so
 * it is not part of the production build.
 */
import * as THREE from 'three';
import * as K from './index.js';

const canvas=document.getElementById('c');
const gl=new THREE.WebGLRenderer({canvas,antialias:true});
gl.setPixelRatio(Math.min(devicePixelRatio||1,2));
K.setupRenderer(gl);
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(70,1,.05,60); camera.rotation.order='YXZ';

const world=new THREE.Group(); scene.add(world);
const things={};            /* named handles for the panel */
const candles=[];

/* ---------- the hall: x -13..13, z -5..5, height 3.2 ---------- */
const HALL_H=3.2;
const fl=K.floor({w:26.4,d:10.4,material:'marble'}); world.add(fl);
const cl=K.ceiling({w:26.4,d:10.4,height:HALL_H,material:'stone',beams:true}); world.add(cl);

function put(obj,x,y=0,z=0,ry=0){obj.position.set(x,y,z); obj.rotation.y=ry; world.add(obj); return obj;}

/* back wall in segments */
put(K.archDoorway({length:4,height:HALL_H,state:'open'}),-11,0,-5);
things.bricked=put(K.archDoorway({length:4,height:HALL_H,state:'bricked'}),-7,0,-5);
things.doorway=put(K.archDoorway({length:4,height:HALL_H,state:'door'}),-3,0,-5);
put(K.wall({length:4,height:HALL_H,openings:[{x:0,width:2.3,height:2.6}]}),1,0,-5);
things.double=put(K.doubleDoor({width:2.2,height:2.6}),1,0,-5);
const panelWall=put(K.wall({length:4,height:HALL_H}),5,0,-5);
const vitriol=K.textPanel({lines:'V · I · T · R · I · O · L',w:1.9,h:.38}); put(vitriol,5,1.9,-4.78);
const mirror=K.textPanel({lines:['VISITA INTERIORA','TERRAE'],w:1.9,h:.6,mirrored:true}); put(mirror,5,1.0,-4.78);
put(K.wall({length:4,height:HALL_H}),9,0,-5);
put(K.wall({length:2,height:HALL_H}),12,0,-5);
/* the bell on its bracket */
things.bell=put(K.bell({rope:'hanging'}),9,0,-4.8);
/* side and front walls */
put(K.wall({length:10,height:HALL_H}),-13,0,0,Math.PI/2);
put(K.wall({length:10,height:HALL_H}),13,0,0,Math.PI/2);
put(K.wall({length:26.4,height:HALL_H,material:'brick'}),0,0,5.2);

/* ---------- furniture and set pieces ---------- */
things.pillar=put(K.pillar({height:2.7,globe:true}),-10.5,0,-2.2);
things.pillarBroken=put(K.pillar({height:2.7,globe:true,broken:true,breakHeight:1.2}),-7,0,-2.2);
put(K.altar(),-3,0,-2);
put(K.candle({height:.24,shadow:false,seed:3}),-3,1.05,-2);
const t1=put(K.table({w:2.4,d:.8}),1,0,-2.4);
things.hotspotSkull=K.markHotspot(put(K.skull(),.2,t1.topY,-2.4,.3),'skull');
put(K.hourglass(),.7,t1.topY,-2.5);
things.bread=put(K.breadAndWater(),1.5,t1.topY,-2.35);
const mainCandle=K.candle({height:.24,shadow:true,seed:11}); put(mainCandle,1.0,t1.topY,-2.2);
things.lectern=put(K.lectern({book:'open'}),5,0,-1.4);
things.statue=put(K.veiledStatue({veil:true}),8.3,0,-2.2);
things.basin=put(K.basin(),11,0,-2.2);
const mir2=K.textPanel({lines:'SEEK',w:.6,h:.2,mirrored:true}); put(mir2,11,.95,-2.0,0); mir2.rotation.x=-Math.PI/2+.001; mir2.position.y=.935;
mir2.visible=false;

/* front row: table of small things, braziers */
const t2=put(K.table({w:2.6,d:.8}),-1,0,2.4);
const skull2=put(K.skull(),-1.9,t2.topY,2.3,2.8);
const key=put(K.ironKey(),-1.1,t2.topY,2.4);
put(K.flint(),-.6,t2.topY,2.3);
put(K.cordCoil(),-.1,t2.topY,2.4);
put(K.ironBar({mode:'lying'}),.1,t2.topY+.02,2.62);
K.markHotspot(key,'key');
const candle2=K.candle({height:.2,shadow:true,seed:5}); put(candle2,-1.5,t2.topY,2.2);
things.brazier=put(K.brazier({lit:true}),-8.5,0,2.4);
put(K.brazier({lit:false}),-5.5,0,2.4);
put(K.ironBar({mode:'leaning'}),3.2,0,4.85,0);
things.plankDoorSolo=put(K.plankDoor({width:1.1,height:2.1}),6.5,0,3.4,Math.PI);
things.sconces=[-9,-1,3,7,11].map(x=>put(K.sconce({y:1.7,held:true,lit:true}),x,0,-4.78));
things.sconces.push(put(K.sconce({y:1.7,held:false,lit:false}),12.6,0,-1,-Math.PI/2));
things.sconces[5].position.set(12.78,0,-1);
things.sconces.push(put(K.sconce({y:1.7,held:true,lit:true}),-12.78,0,2.5,Math.PI/2));

/* gather candles and flickers */
world.traverse(o=>{if(o.name==='candle') candles.push(o);});
/* some candle lights are many; report */
let lightCount=0; world.traverse(o=>{if(o.isLight) lightCount++;});

const atm={current:K.atmosphere('candlelit')}; scene.add(atm.current.group); scene.background=new THREE.Color(atm.current.background); scene.fog=atm.current.fog;
/* a cool spill under the sealed door, to show the preset */
const spill=K.spill({x:-3,y:.15,z:-4.3,tx:-3,ty:0,tz:-2.6,color:0xffc27a,intensity:1.2,angle:1.3}); world.add(spill);

const tick=K.collectUpdaters(world);

/* ---------- hotspots ---------- */
K.markPart(things.doorway,'door','doorway-door'); K.markPart(things.double,'leftLeaf','great-door');
K.markPart(things.statue,'veil','veil'); K.markPart(things.lectern,'book','book');
K.markPart(things.bell,'bell','bell'); K.markPart(things.pillarBroken,'shaft','pillar-shaft');
K.markPart(things.basin,'bowl','basin');
const ray=new THREE.Raycaster(); ray.far=8; const hoverEl=document.getElementById('hover');
function hotspotOf(o){for(;o;o=o.parent) if(o.userData.hotspot) return o.userData.hotspot; return null;}

/* ---------- camera ---------- */
const pose={x:-2,y:1.6,z:3.8,yaw:0,pitch:-.05};
const stations=[
  ['Doorways',{x:-7,y:1.6,z:1.5,yaw:0,pitch:.0}],
  ['Doors',{x:-1,y:1.6,z:2,yaw:0,pitch:0}],
  ['Pillars',{x:-8.8,y:1.7,z:2,yaw:0,pitch:.05}],
  ['Altar & table',{x:-1.2,y:1.6,z:1.2,yaw:0,pitch:-.12}],
  ['Lectern & text',{x:5,y:1.6,z:2.5,yaw:0,pitch:0}],
  ['Statue & basin',{x:9.7,y:1.6,z:2,yaw:0,pitch:-.05}],
  ['Small things',{x:-1,y:1.7,z:1,yaw:0,pitch:-.7}],
  ['Braziers',{x:-7,y:1.6,z:4,yaw:0,pitch:-.1}],
  ['Bell & sconces',{x:9,y:1.6,z:-1,yaw:0,pitch:.15}]
];
const go=(p)=>Object.assign(pose,p);
const keys=new Set(); let drag=false;
addEventListener('keydown',e=>keys.add(e.code)); addEventListener('keyup',e=>keys.delete(e.code));
canvas.addEventListener('pointerdown',e=>{drag=true; canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointerup',()=>drag=false);
canvas.addEventListener('pointermove',e=>{
  if(drag){pose.yaw-=e.movementX*.004; pose.pitch=Math.max(-1.4,Math.min(1.4,pose.pitch-e.movementY*.004));}
  mouse.x=e.offsetX/canvas.clientWidth*2-1; mouse.y=-(e.offsetY/canvas.clientHeight*2-1);
});
const mouse=new THREE.Vector2(0,0);
function move(dt){
  const sp=(keys.has('ShiftLeft')?6:2.6)*dt, f=(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0), s=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0);
  pose.x+=(-Math.sin(pose.yaw)*f+Math.cos(pose.yaw)*s)*sp; pose.z+=(-Math.cos(pose.yaw)*f-Math.sin(pose.yaw)*s)*sp;
  pose.y+=((keys.has('KeyE')?1:0)-(keys.has('KeyQ')?1:0))*sp;
  pose.x=Math.max(-12.6,Math.min(12.6,pose.x)); pose.z=Math.max(-4.6,Math.min(4.8,pose.z));
}

/* ---------- panel ---------- */
const panel=document.getElementById('panel');
function h(tag,props={},...kids){const e=Object.assign(document.createElement(tag),props); for(const k of kids) e.append(k); return e;}
const title=t=>panel.append(h('h4',{textContent:t}));
function check(label,on,fn){const i=h('input',{type:'checkbox',checked:on}); i.onchange=()=>fn(i.checked); panel.append(h('label',{},i,' '+label)); fn(on);}
function btn(label,fn){panel.append(h('button',{textContent:label,onclick:fn}));}
const lightsOn={candles:true,sconces:true};
title('Light');
check('Candles lit',true,on=>{for(const c of candles){ if(c.parent&&c.parent.name==='sconce') continue; c.setLit(on);} });
check('Sconces lit',true,on=>{for(const s of things.sconces) s.setLit(on);});
check('Brazier lit',true,on=>things.brazier.setLit(on));
check('Door spill light',true,on=>{spill.visible=on;});
panel.append(h('div',{},'Atmosphere: ',(()=>{
  const s=h('select',{}); for(const n of['candlelit','dark','moonlit','clear']) s.append(h('option',{textContent:n}));
  s.onchange=()=>{scene.remove(atm.current.group); atm.current=K.atmosphere(s.value); scene.add(atm.current.group); scene.background=new THREE.Color(atm.current.background); scene.fog=atm.current.fog;}; return s;})()));
const ex=h('input',{type:'range',min:.4,max:2.2,step:.05,value:K.LIGHT.exposure}); ex.oninput=()=>{gl.toneMappingExposure=+ex.value; exl.textContent=ex.value;};
const exl=h('span',{textContent:K.LIGHT.exposure}); panel.append(h('div',{},'Exposure ',exl,ex));
check('Shadows',true,on=>{gl.shadowMap.enabled=on; scene.traverse(o=>{if(o.material) o.material.needsUpdate=true;});});
title('Doors and openings');
check('Plank door open',false,on=>things.doorway.setDoorOpen(on?1:0,.9));
check('Great door open',false,on=>things.double.setOpen(on?1:0,1.2));
check('Free door open',false,on=>things.plankDoorSolo.setOpen(on?1:0,.9));
panel.append(h('div',{},'Doorway 2: ',(()=>{const s=h('select',{}); for(const n of['bricked','open','door']) s.append(h('option',{textContent:n})); s.onchange=()=>things.bricked.setState(s.value); return s;})()));
title('Pillars and statue');
check('Pillar broken',true,on=>things.pillarBroken.setBroken(on));
check('Whole pillar broken',false,on=>things.pillar.setBroken(on));
check('Statue veiled',true,on=>things.statue.setVeil(on));
check('Basin water',true,on=>things.basin.setWater(on));
title('Lectern and bell');
panel.append(h('div',{},'Book: ',(()=>{const s=h('select',{}); for(const n of['open','closed','none']) s.append(h('option',{textContent:n})); s.onchange=()=>things.lectern.setBook(s.value); return s;})()));
check('Dusty',false,on=>things.lectern.setDusty(on));
btn('Ring bell',()=>things.bell.ring());
panel.append(h('div',{},'Rope: ',(()=>{const s=h('select',{}); for(const n of['hanging','cut','tied']) s.append(h('option',{textContent:n})); s.onchange=()=>{
  const old=things.bell, nb=K.bell({rope:s.value}); nb.position.copy(old.position); world.remove(old); world.add(nb); things.bell=nb; K.markPart(nb,'bell','bell'); rebuildTick();}; return s;})()));
title('Camera');
for(const [n,p] of stations) btn(n,()=>go(p));
let tickFn=tick; function rebuildTick(){tickFn=K.collectUpdaters(world);}

/* ---------- loop ---------- */
function resize(){const w=innerWidth,h2=innerHeight; gl.setSize(w,h2,false); camera.aspect=w/h2; camera.updateProjectionMatrix();}
addEventListener('resize',resize); resize();
const fpsEl=document.getElementById('fps'); let frames=0,acc=0,last=performance.now(),fps=0,worst=0;
function frame(now){
  requestAnimationFrame(frame);
  const dt=Math.min(.1,(now-last)/1000); last=now; frames++; acc+=dt; worst=Math.max(worst,dt);
  if(acc>=.5){fps=frames/acc; fpsEl.textContent=`${fps.toFixed(0)} fps · worst ${(worst*1000).toFixed(0)} ms · ${gl.info.render.calls} calls · ${(gl.info.render.triangles/1000).toFixed(0)}k tris · ${lightCount} lights`; frames=0; acc=0; worst=0;}
  move(dt); tickFn(now/1000,dt);
  camera.position.set(pose.x,pose.y,pose.z); camera.rotation.set(pose.pitch,pose.yaw,0);
  ray.setFromCamera(mouse,camera); const hit=ray.intersectObject(world,true).find(i=>!i.object.userData.noPick&&i.object.visible);
  hoverEl.textContent=hit&&hotspotOf(hit.object)?'hotspot: '+hotspotOf(hit.object):'';
  gl.info.reset(); gl.render(scene,camera);
}
requestAnimationFrame(frame);
window.__showcase={scene,camera,gl,pose,go,things,K,stations,fps:()=>fps,
  /* run n frames synchronously (hidden panes do not run rAF) and return average ms per frame */
  bench(n=120){const t0=performance.now(); for(let i=0;i<n;i++){const t=performance.now()/1000; tickFn(t,1/60); camera.position.set(pose.x,pose.y,pose.z); camera.rotation.set(pose.pitch,pose.yaw,0); gl.render(scene,camera);} gl.getContext().finish(); return (performance.now()-t0)/n;},
  frameNow(){tickFn(performance.now()/1000,1/60); camera.position.set(pose.x,pose.y,pose.z); camera.rotation.set(pose.pitch,pose.yaw,0); gl.render(scene,camera);}};
