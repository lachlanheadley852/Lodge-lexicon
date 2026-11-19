/*
 * First-person controls: pointer-lock mouse look and WASD / arrow-key walking with collision.
 * Owns the player pose (x, z, yaw, pitch); the renderer applies it to the camera.
 * Arrow keys walk here (up/down = forward/back, left/right = strafe); they never turn the view.
 */
import {resolve} from './collision.js';

export const EYE_HEIGHT=1.6;
const RADIUS=.28;          /* player body, metres */
const SPEED=2.2;           /* calm walking pace, m/s */
const ACCEL=14;            /* how quickly speed follows the keys (1/s) */
const SENSITIVITY=.0022;   /* radians per pixel of mouse movement */
const MAX_PITCH=Math.PI/2-.15;

const KEYMAP={KeyW:'f',ArrowUp:'f',KeyS:'b',ArrowDown:'b',KeyA:'l',ArrowLeft:'l',KeyD:'r',ArrowRight:'r'};

export function createControls(canvas,{onLockChange}){
  const pose={x:0,z:0,yaw:0,pitch:0};
  const down=new Set();
  const vel={x:0,z:0};
  let locked=false;
  const stick={x:0,y:0};   /* touch thumb-stick: x right, y forward, each -1..1 (length capped at 1) */
  let freeKeys=false;   /* dev hook: let the keys work without pointer lock */

  function setLocked(v){ if(v===locked) return; locked=v; if(!v){down.clear();} onLockChange(v); }
  document.addEventListener('pointerlockchange',()=>setLocked(document.pointerLockElement===canvas));

  document.addEventListener('mousemove',e=>{
    if(!locked) return;
    pose.yaw-=e.movementX*SENSITIVITY;
    pose.pitch=Math.max(-MAX_PITCH,Math.min(MAX_PITCH,pose.pitch-e.movementY*SENSITIVITY));
  });
  document.addEventListener('keydown',e=>{
    const k=KEYMAP[e.code]; if(!k||e.ctrlKey||e.metaKey||e.altKey) return;
    if(locked||freeKeys){down.add(k); e.preventDefault();}
  });
  document.addEventListener('keyup',e=>{const k=KEYMAP[e.code]; if(k) down.delete(k);});
  window.addEventListener('blur',()=>down.clear());

  return {
    pose,
    get locked(){return locked;},
    set freeKeys(v){freeKeys=!!v;},
    lock(){ try{ const p=canvas.requestPointerLock(); if(p&&p.catch) p.catch(()=>{}); }catch(err){} },
    unlock(){ try{document.exitPointerLock();}catch(err){} },
    setStick(x,y){stick.x=x; stick.y=y;},
    /* look by dyaw/dpitch radians (touch drag); pitch clamped like the mouse */
    look(dx,dy){pose.yaw-=dx; pose.pitch=Math.max(-MAX_PITCH,Math.min(MAX_PITCH,pose.pitch-dy));},
    place(x,z,yaw,pitch=0){pose.x=x;pose.z=z;pose.yaw=yaw;pose.pitch=pitch;vel.x=vel.z=0;},
    /* Advance the walk by dt seconds against `plan`. Returns true if the player moved. */
    update(dt,plan){
      const fwd=(down.has('f')?1:0)-(down.has('b')?1:0), side=(down.has('r')?1:0)-(down.has('l')?1:0);
      /* forward = (-sin yaw, -cos yaw); right = (cos yaw, -sin yaw) */
      let tx=-Math.sin(pose.yaw)*fwd+Math.cos(pose.yaw)*side, tz=-Math.cos(pose.yaw)*fwd-Math.sin(pose.yaw)*side;
      const l=Math.hypot(tx,tz); if(l>0){tx=tx/l*SPEED; tz=tz/l*SPEED;}
      const sl=Math.hypot(stick.x,stick.y);
      if(sl>0&&l===0){   /* analogue: same cap (SPEED) as the keys at full tilt */
        const sm=Math.min(1,sl), sx=stick.x/sl, sy=stick.y/sl;
        tx=(-Math.sin(pose.yaw)*sy+Math.cos(pose.yaw)*sx)*SPEED*sm; tz=(-Math.cos(pose.yaw)*sy-Math.sin(pose.yaw)*sx)*SPEED*sm;
      }
      const a=Math.min(1,ACCEL*dt);
      vel.x+=(tx-vel.x)*a; vel.z+=(tz-vel.z)*a;
      if(Math.abs(vel.x)<.001&&Math.abs(vel.z)<.001) return false;
      /* small sub-steps so a slow frame cannot tunnel through a thin wall */
      const steps=Math.max(1,Math.ceil(Math.hypot(vel.x,vel.z)*dt/.1));
      for(let i=0;i<steps;i++){pose.x+=vel.x*dt/steps; pose.z+=vel.z*dt/steps; resolve(plan,pose,RADIUS);}
      return true;
    },
    /* Move to (x,z) through the collision plan (used by the dev hook). */
    teleport(x,z,plan){pose.x=x;pose.z=z;if(plan) resolve(plan,pose,RADIUS);}
  };
}
