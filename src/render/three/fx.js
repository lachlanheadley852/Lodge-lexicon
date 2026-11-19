/*
 * 3D word effects (3D6). Every part of a spoken word leaves a trace in world space at the target:
 *   root      -> particles + soft glow + a short point light, in the root colour
 *   action    -> a shape that starts ~0.3 s after the particles (billboards that face the camera)
 *   modifier  -> -ES beam from the speaker's hand to the target first; -ON plays the core twice
 * Mirrors src/render/svg/fx.js. Everything is additive sprites/planes using small generated canvas
 * textures (shared, disposed in dispose()); per-effect materials are disposed when the effect ends.
 * The renderer calls playWord(word, pos), playGlint(pos), update(dt).
 */
import * as THREE from 'three';
import {SYL} from '../../game/data.js';

/* ---------- tuning table (seconds, metres) ---------- */
export const TUNING={
  glow:{size:1.6, dur:.9},
  light:{peak:5, dur:1.0, dist:6, lift:.35},       /* lift: metres toward the camera */
  particles:{count:16},
  actionDelay:.3,
  es:{dur:.45, dots:28, size:.09, hold:.25, drop:[.14,-.34,-.5]},  /* beam start in camera space */
  on:{delay:.22, scale:1.6},
  root:{
    LUM:{size:[.07,.12], life:[1.2,1.8], up:[.5,1.3], spread:.5, grav:0},
    KEL:{size:[.05,.09], life:[1.0,1.5], up:[.2,.6], spread:.5, grav:-2.4},
    HAL:{size:[.3,.5],  life:[1.5,2.1], up:[.35,.8], spread:.55, grav:0, outward:1.5},
    MIR:{rings:6, size:[1.0,1.8], life:[1.1,1.6], tilt:1.05},
    RAS:{size:[.05,.1], life:[1.0,1.5], up:[1.2,2.6], spread:.4, grav:0},
    VEL:{size:[.3,.42], life:[1.5,2.1], up:[.2,.55], spread:.6, grav:0}
  },
  action:{
    SE:{size:3.2, dur:1.3, gap:.25},
    TU:{sizes:[2.4,1.8,1.3], dur:1.4, gap:.12},
    PA:{height:2.2, slide:1.5, dur:1.2},
    MO:{size:2.2, dur:1.6},
    NE:{size:1.6, slide:1.3, dur:1.4},
    KA:{dots:9, dur:1.1, gap:.07, step:.28}
  },
  glint:{size:.9, dur:1.1, stars:6}
};

/* ---------- generated textures (white on transparent; tinted by material colour) ---------- */
const TEXDEFS={
  glow:(c,s)=>{const g=c.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.35,'rgba(255,255,255,.4)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,s,s);},
  spark:(c,s)=>{const g=c.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.25,'rgba(255,255,255,.85)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,s,s);},
  star:(c,s)=>{TEXDEFS.glow(c,s);c.strokeStyle='#fff';c.lineWidth=s*.03;c.beginPath();c.moveTo(s*.5,s*.04);c.lineTo(s*.5,s*.96);c.moveTo(s*.04,s*.5);c.lineTo(s*.96,s*.5);c.stroke();},
  grit:(c,s)=>{c.fillStyle='#fff';c.shadowColor='#fff';c.shadowBlur=s*.1;c.fillRect(s*.28,s*.28,s*.44,s*.44);},
  ring:(c,s)=>{c.strokeStyle='#fff';c.shadowColor='#fff';c.shadowBlur=s*.04;c.lineWidth=s*.035;c.beginPath();c.arc(s/2,s/2,s*.45,0,7);c.stroke();},
  dash:(c,s)=>{c.strokeStyle='#fff';c.shadowColor='#fff';c.shadowBlur=s*.04;c.lineWidth=s*.04;c.setLineDash([s*.07,s*.05]);c.beginPath();c.arc(s/2,s/2,s*.45,0,7);c.stroke();},
  wisp:(c,s)=>{c.strokeStyle='#fff';c.shadowColor='#fff';c.shadowBlur=s*.06;c.lineCap='round';c.lineWidth=s*.05;c.beginPath();c.moveTo(s*.5,s*.95);c.bezierCurveTo(s*.1,s*.75,s*.9,s*.55,s*.5,s*.4);c.bezierCurveTo(s*.2,s*.28,s*.7,s*.15,s*.5,s*.05);c.stroke();},
  frame:(c,s)=>{c.strokeStyle='#fff';c.shadowColor='#fff';c.shadowBlur=s*.03;c.lineWidth=s*.035;c.strokeRect(s*.1,s*.15,s*.8,s*.7);c.lineWidth=s*.015;c.strokeRect(s*.2,s*.27,s*.6,s*.46);},
  line:(c,s)=>{const g=c.createLinearGradient(0,0,s,0);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.5,'rgba(255,255,255,1)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,s,s);},
  arcL:(c,s)=>{c.strokeStyle='#fff';c.shadowColor='#fff';c.shadowBlur=s*.04;c.lineWidth=s*.05;c.lineCap='round';c.beginPath();c.arc(s/2,s/2,s*.42,Math.PI/2,Math.PI*1.5);c.stroke();},
  arcR:(c,s)=>{c.strokeStyle='#fff';c.shadowColor='#fff';c.shadowBlur=s*.04;c.lineWidth=s*.05;c.lineCap='round';c.beginPath();c.arc(s/2,s/2,s*.42,-Math.PI/2,Math.PI/2);c.stroke();},
  spokes:(c,s)=>{c.strokeStyle='#fff';c.shadowColor='#fff';c.shadowBlur=s*.03;c.lineWidth=s*.022;c.beginPath();for(let i=0;i<6;i++){const a=i*Math.PI/3;c.moveTo(s/2,s/2);c.lineTo(s/2+Math.cos(a)*s*.46,s/2+Math.sin(a)*s*.46);}c.stroke();},
  hex:(c,s)=>{c.strokeStyle='#fff';c.shadowColor='#fff';c.shadowBlur=s*.04;c.lineWidth=s*.035;c.lineJoin='round';c.beginPath();for(let i=0;i<6;i++){const a=i*Math.PI/3;c.lineTo(s/2+Math.cos(a)*s*.36,s/2+Math.sin(a)*s*.36);}c.closePath();c.stroke();}
};
const rnd=(a,b)=>a+Math.random()*(b-a);
const rr=r=>rnd(r[0],r[1]);

export function createFx(scene,camera){
  const layer=new THREE.Group(); layer.name='wordFx'; layer.userData.noPick=true; scene.add(layer);
  const textures={}, casts=[];
  const plane=new THREE.PlaneGeometry(1,1);
  const noRay=()=>{};
  const camRight=new THREE.Vector3(), camUp=new THREE.Vector3(), camPos=new THREE.Vector3();

  /* two lights kept in the scene at zero intensity, so the shader light count never changes
     while casting (adding/removing lights would recompile every lit material) */
  const lights=[0,1].map(()=>{const l=new THREE.PointLight(0xffffff,0,TUNING.light.dist,2); l.userData.noPick=true; layer.add(l); return l;});
  let lightNext=0;

  function tex(name){
    if(!textures[name]){
      const w=128, cv=document.createElement('canvas'); cv.width=cv.height=w;
      TEXDEFS[name](cv.getContext('2d'),w);
      const t=new THREE.CanvasTexture(cv); t.colorSpace=THREE.SRGBColorSpace; textures[name]=t;
    }
    return textures[name];
  }
  const baseMat={transparent:true,depthWrite:false,depthTest:false,blending:THREE.AdditiveBlending,fog:false,toneMapped:false};

  function newSprite(name,color,w,h){
    const m=new THREE.SpriteMaterial({...baseMat,map:tex(name),color});
    const s=new THREE.Sprite(m); s.scale.set(w,h===undefined?w:h,1); s.raycast=noRay; s.renderOrder=998; s.visible=false;
    layer.add(s); return s;
  }
  function newFlat(name,color){
    const m=new THREE.MeshBasicMaterial({...baseMat,map:tex(name),color,side:THREE.DoubleSide});
    const s=new THREE.Mesh(plane,m); s.raycast=noRay; s.renderOrder=998; s.visible=false; layer.add(s); return s;
  }
  /* an item shows only between start and start+dur; fn(u, obj) positions it for u in 0..1 */
  function add(cast,obj,start,dur,fn){cast.items.push({obj,start,dur,fn});}
  const fade=(u,inU=.15)=>Math.min(u/inU,1)*(1-u);

  /* ---------- the core of a word: glow, root particles, action shape ---------- */
  function core(cast,root,action,p,delay,k){
    const col=new THREE.Color(SYL[root].color), T=TUNING;
    const g=newSprite('glow',col,1,1);
    add(cast,g,delay,T.glow.dur,(u,o)=>{o.position.copy(p); o.scale.setScalar(T.glow.size*k*(.3+1.3*u)); o.material.opacity=.9*(1-u)*(1-u);});
    const n=Math.round(T.particles.count*(k>1?1.25:1)), cfg=T.root[root];
    if(root==='MIR'){
      const faceY=Math.atan2(camPos.x-p.x,camPos.z-p.z);
      for(let i=0;i<cfg.rings;i++){
        const f=newFlat('ring',col), life=rr(cfg.life), sz=rr(cfg.size)*k;
        const off=new THREE.Vector3(rnd(-.25,.25),rnd(-.15,.15),rnd(-.25,.25)).multiplyScalar(k);
        f.rotation.set(-cfg.tilt+rnd(-.12,.12),faceY,0,'YXZ');
        add(cast,f,delay+i*.12,life,(u,o)=>{o.position.copy(p).add(off); o.scale.setScalar(sz*(.12+.88*Math.sqrt(u))); o.material.opacity=Math.min(u/.1,1)*(1-u);});
      }
      for(let i=0;i<6;i++){
        const s=newSprite('spark',col,.06,.06), a=Math.random()*6.28, v=rnd(.2,.6)*k, life=rnd(.8,1.2);
        add(cast,s,delay+rnd(0,.3),life,(u,o)=>{const t=u*life; o.position.set(p.x+Math.cos(a)*v*t,p.y+(.9*t-1.6*t*t)*k,p.z+Math.sin(a)*v*t); o.material.opacity=1-u;});
      }
    } else {
      for(let i=0;i<n;i++){
        const life=rr(cfg.life), size=rr(cfg.size)*(k>1?1.2:1), a=Math.random()*6.28, sp=rnd(.1,1)*cfg.spread*k*(cfg.outward||1);
        const vx=Math.cos(a)*sp, vz=Math.sin(a)*sp, vy=rr(cfg.up)*(k>1?1.2:1), gy=cfg.grav||0;
        const sway=Math.random()*6.28, spin=rnd(-1.5,1.5);
        let s;
        if(root==='LUM'||root==='RAS') s=newSprite('spark',root==='RAS'&&Math.random()<.5?new THREE.Color('#ffd27a'):col,size,size);
        else if(root==='KEL') s=newSprite('grit',col.clone().multiplyScalar(.85),size*2.2,size*2.2);
        else if(root==='HAL') s=newSprite('wisp',col,size*.7,size);
        else s=newSprite('frame',col,size*1.4,size);
        const y0=gy?rnd(.05,.3):0;
        add(cast,s,delay+rnd(0,.2),life,(u,o)=>{
          const t=u*life;
          o.position.set(p.x+vx*t,p.y+y0+vy*t+.5*gy*t*t,p.z+vz*t);
          if(root==='HAL'){o.position.addScaledVector(camRight,Math.sin(t*4+sway)*.07); o.material.rotation=Math.sin(t*3+sway)*.5; o.scale.set(size*.7*(.6+u),size*(.6+u),1);}
          if(root==='VEL') o.material.rotation=spin*.25*t;
          let op=fade(u);
          if(root==='RAS') op*=.55+.45*Math.random();
          o.material.opacity=op*(root==='HAL'?.6:root==='VEL'?.75:1);
        });
      }
    }
    action_(cast,action,col,p,delay+T.actionDelay,k);
  }

  function action_(cast,a,col,p,d,k){
    const A=TUNING.action[a];
    if(a==='SE'){
      [0,A.gap].forEach(o=>{const s=newSprite('ring',col,1);
        add(cast,s,d+o,A.dur,(u,x)=>{x.position.copy(p); x.scale.setScalar(A.size*k*(.08+.92*Math.pow(u,.6))); x.material.opacity=Math.min(u/.08,1)*(1-u);});});
    } else if(a==='TU'){
      A.sizes.forEach((sz,i)=>{const s=newSprite('dash',col,1);
        add(cast,s,d+i*A.gap,A.dur,(u,x)=>{x.position.copy(p); x.scale.setScalar(sz*k*(1.6-1.25*u)); x.material.rotation=u*3.5*(i%2?-1:1); x.material.opacity=Math.min(u/.3,1)*(1-u*u);});});
    } else if(a==='PA'){
      const H=A.height*k;
      [-1,1].forEach(sd=>{const s=newSprite('line',col,.14*k,H);
        add(cast,s,d,A.dur,(u,x)=>{x.position.copy(p).addScaledVector(camRight,sd*A.slide*k*u); x.material.opacity=1-u*u;});});
      const f=newSprite('glow',col,1,1);
      add(cast,f,d,A.dur,(u,x)=>{x.position.copy(p); x.scale.set(.3*k+2.2*k*u,H,1); x.material.opacity=.8*(1-u)*(1-u);});
    } else if(a==='MO'){
      const sp=newSprite('spokes',col,A.size*k), hx=newSprite('hex',col,A.size*k);
      const env=u=>u<.25?u/.25:u<.75?1:1-(u-.75)/.25;   /* appear, freeze, vanish */
      add(cast,sp,d,A.dur,(u,x)=>{x.position.copy(p); x.material.opacity=env(u);});
      add(cast,hx,d,A.dur,(u,x)=>{x.position.copy(p); x.scale.setScalar(A.size*k*(u<.25?.2+.8*(u/.25):1)); x.material.opacity=env(u);});
    } else if(a==='NE'){
      [[-1,'arcL'],[1,'arcR']].forEach(([sd,t])=>{const s=newSprite(t,col,A.size*k);
        add(cast,s,d,A.dur,(u,x)=>{const e=u<.55?1-Math.pow(1-u/.55,3):1; x.position.copy(p).addScaledVector(camRight,sd*A.slide*k*(1-e));
          x.material.opacity=u<.2?u/.2:u<.8?1:1-(u-.8)/.2;});});
    } else if(a==='KA'){
      for(let i=0;i<A.dots;i++){const sd=i%2?1:-1, s=newSprite('spark',col,.14*k);
        add(cast,s,d+i*A.gap,A.dur,(u,x)=>{x.position.copy(p).addScaledVector(camRight,sd*(.15+(i+1)*A.step*u)*k).addScaledVector(camUp,(.1+i*.04)*u*k);
          x.scale.setScalar(.14*k*(1-.4*u)); x.material.opacity=Math.min(u/.2,1)*(1-u);});}
    }
  }

  function beam(cast,root,p){
    const col=new THREE.Color(SYL[root].color), E=TUNING.es;
    const from=new THREE.Vector3(...E.drop).applyMatrix4(camera.matrixWorld);
    for(let i=0;i<E.dots;i++){
      const f=i/(E.dots-1), s=newSprite('spark',col,E.size), pos=new THREE.Vector3().lerpVectors(from,p,f);
      add(cast,s,f*E.dur*.7,E.dur*.3+E.hold,(u,x)=>{x.position.copy(pos); x.scale.setScalar(E.size*(1.3-.6*u)); x.material.opacity=1-u;});
    }
    const hd=newSprite('glow',col,.35);
    add(cast,hd,0,E.dur,(u,x)=>{x.position.lerpVectors(from,p,Math.min(u/.7,1)); x.material.opacity=u<.7?1:1-(u-.7)/.3;});
  }

  function startLight(cast,color,p,delay,k){
    const l=lights[lightNext++%lights.length]; l.color.set(color);
    l.position.copy(p).addScaledVector(camPos.clone().sub(p).normalize(),TUNING.light.lift);
    cast.lights.push({l,start:delay,peak:TUNING.light.peak*k});
  }

  function newCast(){
    camera.updateMatrixWorld(); camPos.setFromMatrixPosition(camera.matrixWorld);
    camRight.setFromMatrixColumn(camera.matrixWorld,0).normalize(); camUp.setFromMatrixColumn(camera.matrixWorld,1).normalize();
    const c={t:0,items:[],lights:[]}; casts.push(c); return c;
  }
  function dispose(it){layer.remove(it.obj); it.obj.material.dispose();}
  function endCast(c){for(const it of c.items) if(!it.dead){dispose(it); it.dead=true;} for(const L of c.lights) L.l.intensity=0;}

  const api={
    playWord(word,pos){
      if(!word||!SYL[word.root]) return;
      const p=pos.clone(), c=newCast(), T=TUNING, color=SYL[word.root].color;
      let d=0;
      if(word.mod==='ES'){beam(c,word.root,p); d=T.es.dur;}
      core(c,word.root,word.action,p,d,1); startLight(c,color,p,d,1);
      if(word.mod==='ON'){core(c,word.root,word.action,p,d+T.on.delay,T.on.scale); startLight(c,color,p,d+T.on.delay,T.on.scale);}
    },
    playGlint(pos){
      const p=pos.clone(), c=newCast(), col=new THREE.Color('#ffd98a'), G=TUNING.glint;
      const g=newSprite('glow',col,1);
      add(c,g,0,G.dur,(u,o)=>{o.position.copy(p); o.scale.setScalar(G.size*(.3+u)); o.material.opacity=.85*(1-u)*(1-u);});
      for(let i=0;i<G.stars;i++){
        const a=i/G.stars*6.28+rnd(0,.5), r=rnd(.12,.4), s=newSprite('star',col,.2);
        add(c,s,rnd(0,.25),G.dur-.2,(u,o)=>{o.position.copy(p).addScaledVector(camRight,Math.cos(a)*r*u).addScaledVector(camUp,Math.sin(a)*r*u+.12*u);
          o.scale.setScalar(.22*(.5+.5*Math.sin(u*9+i))+.05); o.material.opacity=1-u;});
      }
      startLight(c,'#ffd98a',p,0,.4);
    },
    update(dt=1/60){
      if(!casts.length) return;
      dt=Math.min(dt,.05);
      for(let i=casts.length-1;i>=0;i--){
        const c=casts[i]; c.t+=dt; let alive=0;
        for(const it of c.items){
          if(it.dead) continue;
          const u=(c.t-it.start)/it.dur;
          if(u>=1){dispose(it); it.dead=true; continue;}
          alive++;
          if(u<0){it.obj.visible=false; continue;}
          it.obj.visible=true; it.fn(u,it.obj);
        }
        for(const L of c.lights){
          const u=(c.t-L.start)/TUNING.light.dur;
          L.l.intensity=u<0||u>=1?0:L.peak*Math.pow(1-u,2)*Math.min(u/.05,1);
          if(u<1) alive++;
        }
        if(!alive){casts.splice(i,1); for(const L of c.lights) L.l.intensity=0;}
      }
    },
    clear(){for(const c of casts) endCast(c); casts.length=0;},
    dispose(){api.clear(); for(const k in textures) textures[k].dispose(); plane.dispose(); scene.remove(layer);},
    get active(){return casts.length;},       /* dev/inspection only */
    layer
  };
  if(import.meta.env&&import.meta.env.DEV) window.__lodgeFx=api;
  return api;
}
