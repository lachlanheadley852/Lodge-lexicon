/*
 * Three.js first-person renderer. Implements the renderer interface (see ../interface.js).
 * Walking and looking happen here, so it declares usesTurning:false and never calls onTurn.
 *
 * Files: controls.js (pointer lock, walking), collision.js (floor plans), hud.js (crosshair, hint,
 * fade), fx.js (placeholder word effects), rooms/ (per-room builders; greybox for now).
 */
import * as THREE from 'three';
import {NAMES, ROOM_NAMES} from '../../game/data.js';
import {say} from '../../game/index.js';
import {createControls, EYE_HEIGHT} from './controls.js';
import {triggerAt} from './collision.js';
import {createHud} from './hud.js';
import {createFx} from './fx.js';
import {buildRoom} from './rooms/index.js';
import {setupRenderer} from './kit/lighting.js';

const REACH=2.5;          /* items must be used within this distance (words have no limit) */
const MAX_PIXEL_RATIO=2;
const HINT_FREE='Click to look around · WASD to walk · Tab for grimoire';
const HINT_FREE_CASTING='Click the view to look, then click your target';
const HINT_LOCKED='Tab: grimoire and items · Esc: put away · Hold Space: show hotspots';

export function createThreeRenderer(){
  let container=null, canvas=null, gl=null, hud=null, controls=null, fx=null;
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(70,16/9,.05,40);
  camera.rotation.order='YXZ';
  const raycaster=new THREE.Raycaster(); raycaster.far=40;
  const centre=new THREE.Vector2(0,0);

  let clickHandler=()=>{};
  let lastState=null, roomId=null, room=null;
  let hotspots=[];          /* [{id,obj,box,helper}] for the current room */
  let highlight=false, casting=false;
  let hovered=null;         /* {id,distance,point} under the crosshair */
  let triggered=false;      /* a doorway trigger already fired; wait for the room to change */
  let last=performance.now(), frame=0;
  const tmp=new THREE.Vector3(), frustum=new THREE.Frustum(), pv=new THREE.Matrix4();

  /* ---------- room lifecycle ---------- */
  function disposeRoom(){
    if(!room) return;
    scene.remove(room.group);
    room.group.traverse(o=>{   /* kit geometry, materials and textures are shared across rooms: keep them */
      if(o.geometry&&!o.geometry.userData.shared) o.geometry.dispose();
      const m=o.material;
      if(m&&!Array.isArray(m)&&!m.userData.shared&&m.map&&!m.map.userData.shared) m.map.dispose();
      if(o.isLight&&o.shadow&&o.shadow.map) o.shadow.map.dispose();
    });
    for(const h of hotspots){scene.remove(h.helper); h.helper.geometry.dispose();}
    hotspots=[];
  }
  function collectHotspots(){
    room.group.updateMatrixWorld(true);
    room.group.traverse(o=>{
      if(!o.userData.hotspot) return;
      const box=new THREE.Box3().setFromObject(o);
      const helper=new THREE.Box3Helper(box,0xffe08a);
      helper.material.depthTest=false; helper.material.transparent=true; helper.material.toneMapped=false;
      helper.renderOrder=999; helper.visible=false; scene.add(helper);
      hotspots.push({id:o.userData.hotspot,obj:o,box,helper});
    });
  }
  /* spawn: false keeps the player where they stand; otherwise place them (at the doorway they came
     through if `fromRoom` has a spawn here, else the default). fade: cut to black and fade in. */
  function enterRoom(S,{spawn=false,fromRoom=null,fade=false}={}){
    disposeRoom();
    room=buildRoom(S); roomId=S.room; triggered=false;
    scene.add(room.group); scene.background=new THREE.Color(room.background||0); scene.fog=room.fog||null;
    collectHotspots();
    hud.setRoomName(ROOM_NAMES[S.room]||'');
    if(spawn){const sp=(fromRoom&&room.spawns[fromRoom])||room.spawns.default; controls.place(sp.x,sp.z,sp.yaw,0);}
    if(fade) hud.fadeIn(700);
  }

  /* ---------- picking ---------- */
  function hotspotOf(o){for(;o;o=o.parent) if(o.userData.hotspot) return o.userData.hotspot; return null;}
  /* First thing along the ray from the camera through ndc. Walls block hotspots behind them. */
  function pick(ndc,far=40){
    if(!room) return null;
    raycaster.setFromCamera(ndc,camera); raycaster.far=far;
    for(const h of raycaster.intersectObject(room.group,true)){
      if(h.object.userData.noPick) continue;
      return {id:hotspotOf(h.object),distance:h.distance,point:h.point};
    }
    return null;
  }
  function updateHover(){
    hovered=pick(centre);
    const id=hovered&&hovered.id;
    const tooFar=!!id&&!!lastState&&!!lastState.sel&&hovered.distance>REACH;
    hud.setLabel(id?(NAMES[id]||id):'',tooFar);
  }
  function updateHighlight(){
    if(!highlight||!room){for(const h of hotspots) h.helper.visible=false; return;}
    camera.updateMatrixWorld(); pv.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse); frustum.setFromProjectionMatrix(pv);
    for(const h of hotspots){
      let vis=frustum.intersectsBox(h.box);
      if(vis){ /* hide it when a wall is in the way */
        h.box.getCenter(tmp); const d=tmp.distanceTo(camera.position);
        raycaster.set(camera.position,tmp.clone().sub(camera.position).normalize()); raycaster.far=d;
        for(const hit of raycaster.intersectObject(room.group,true)){
          if(hit.object.userData.noPick) continue;
          if(hotspotOf(hit.object)!==h.id&&hit.distance<d-.4) vis=false; break;
        }
      }
      h.helper.visible=vis;
    }
  }

  /* World point in front of the camera, for words spoken at nothing. */
  function airPoint(){return camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(3).add(camera.position);}
  function pointFor(world){
    const p=world.clone().project(camera), r=container.getBoundingClientRect();
    return {x:(p.x*.5+.5)*r.width, y:(.5-p.y*.5)*r.height, world:{x:world.x,y:world.y,z:world.z}};
  }

  /* The player clicked (pointer-locked) or walked into a doorway: route like a 2D click. */
  function doClick(){
    const h=pick(centre), id=h?h.id:null, world=h?h.point:airPoint();
    if(id&&lastState&&lastState.sel&&h.distance>REACH){say('That is too far to reach. Step closer.'); return;}
    clickHandler(id,pointFor(world));
  }
  function checkTriggers(){
    if(triggered||!room||casting) return;
    const t=triggerAt(room.triggers,controls.pose.x,controls.pose.z);
    if(t){triggered=true; clickHandler(t.hotspot,pointFor(airPoint())); setTimeout(()=>{triggered=false;},1500);}
  }

  /* ---------- frame ---------- */
  function resize(){
    const w=container.clientWidth||1, h=container.clientHeight||1;
    gl.setPixelRatio(Math.min(window.devicePixelRatio||1,MAX_PIXEL_RATIO));
    gl.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix();
  }
  function syncCamera(){
    const p=controls.pose;
    camera.position.set(p.x,EYE_HEIGHT,p.z); camera.rotation.set(p.pitch,p.yaw,0); camera.updateMatrixWorld();
  }
  function tick(now){
    requestAnimationFrame(tick);
    const dt=Math.min(.05,(now-last)/1000); last=now; frame++;
    if(room){
      controls.update(dt,room.plan);
      checkTriggers();
      if(room.update) room.update(now/1000);
    }
    syncCamera();
    updateHover(); updateHighlight(); fx.update();
    /* an overlay (intro, ending) needs the mouse: give it back */
    if(controls.locked&&frame%10===0&&container.querySelector('.overlay:not(.hidden)')) controls.unlock();
    gl.render(scene,camera);
  }
  function refreshHint(){
    hud.setHint(controls.locked?HINT_LOCKED:(casting?HINT_FREE_CASTING:HINT_FREE));
  }

  /* ---------- renderer interface ---------- */
  const api={
    usesTurning:false,
    mount(el){
      container=el;
      canvas=document.createElement('canvas'); canvas.className='three'; canvas.tabIndex=-1;
      container.insertAdjacentElement('afterbegin',canvas);
      gl=new THREE.WebGLRenderer({canvas,antialias:true});
      setupRenderer(gl);   /* colour space, tone mapping, exposure, shadows: all owned by kit/lighting.js */
      hud=createHud(container);
      fx=createFx(scene);
      controls=createControls(canvas,{onLockChange(){refreshHint();}});
      canvas.addEventListener('click',()=>{ if(controls.locked) doClick(); else controls.lock(); });
      document.addEventListener('keydown',e=>{
        if(e.key!=='Tab'||e.ctrlKey||e.metaKey||e.altKey) return;
        if(controls.locked){e.preventDefault(); controls.unlock();}
        else if(document.activeElement===document.body||document.activeElement===canvas){e.preventDefault(); controls.lock();}
      });
      new ResizeObserver(resize).observe(container); resize();
      refreshHint();
      requestAnimationFrame(tick);
      if(import.meta.env.DEV) installDebug();
    },
    show(S){
      const fresh=S!==lastState; lastState=S;
      if(!room) enterRoom(S,{spawn:true});
      else if(fresh) enterRoom(S,{spawn:true,fade:true});                            /* chapter (re)start */
      else if(S.room!==roomId) enterRoom(S,{spawn:true,fromRoom:roomId,fade:true});  /* travelled */
      else enterRoom(S,{});                                                          /* flags changed: rebuild in place */
      refreshHint();
    },
    setHighlight(on){highlight=!!on;},
    setCasting(on){casting=!!on; hud.setCasting(casting); if(controls) refreshHint();},
    playWordFx(word,targetId,point){fx.playWord(word,worldOf(targetId,point));},
    playGlint(targetId,point){fx.playGlint(worldOf(targetId,point));},
    onClick(fn){clickHandler=fn;},
    onTurn(){/* never fires: the player turns with the mouse */}
  };
  function worldOf(targetId,point){
    if(point&&point.world) return new THREE.Vector3(point.world.x,point.world.y,point.world.z);
    const h=hotspots.find(o=>o.id===targetId);
    return h?h.box.getCenter(new THREE.Vector3()):airPoint();
  }

  /* ---------- dev-only debug hook (stripped from production builds) ---------- */
  function installDebug(){
    window.__lodge3d={
      scene, camera, gl,
      state:()=>({pose:{...controls.pose},room:roomId,hovered:hovered&&{id:hovered.id,distance:hovered.distance},locked:controls.locked,hotspots:hotspots.map(h=>h.id)}),
      teleport(x,z,yaw){controls.teleport(x,z,room.plan); if(yaw!==undefined) controls.pose.yaw=yaw;},
      look(yaw,pitch=0){controls.pose.yaw=yaw; controls.pose.pitch=pitch;},
      /* aim the camera at a hotspot's centre */
      lookAt(id){
        const h=hotspots.find(o=>o.id===id); if(!h) return false;
        const c=h.box.getCenter(new THREE.Vector3()), p=controls.pose;
        const dx=c.x-p.x, dz=c.z-p.z, dy=c.y-EYE_HEIGHT;
        p.yaw=Math.atan2(-dx,-dz); p.pitch=Math.atan2(dy,Math.hypot(dx,dz)); return true;
      },
      /* same path as a pointer-locked click on the crosshair */
      clickCenter(){syncCamera(); updateHover(); doClick();},
      freeKeys(on=true){controls.freeKeys=on;},
      /* simulate holding keys (f,b,l,r) for N seconds at 60 fps; no rAF needed (hidden panes do not run it) */
      step(seconds,keys){
        const code={f:'KeyW',b:'KeyS',l:'KeyA',r:'KeyD'}; controls.freeKeys=true;
        for(const k of keys) document.dispatchEvent(new KeyboardEvent('keydown',{code:code[k]}));
        for(let i=0;i<seconds*60;i++){controls.update(1/60,room.plan); checkTriggers();}
        for(const k of keys) document.dispatchEvent(new KeyboardEvent('keyup',{code:code[k]}));
        return {...controls.pose};
      }
    };
  }
  return api;
}
