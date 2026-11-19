/*
 * Furniture and small props. Same conventions as structure.js: metres, x east, z south, y up,
 * origin at floor level, front faces +z. Small things (skull, key, flint...) have origin at the
 * surface they rest on, so place them at the table top height.
 */
import * as THREE from 'three';
import {mat} from './materials.js';
import {boxGeo,cylGeo,sphereGeo,torusGeo,mesh,bx,cy,lathe,placed,merged} from './geo.js';
import {candle,fire,LIGHT} from './lighting.js';
import {rng} from './textures.js';
import {finish,boxFootprint,circleFootprint,tween} from './util.js';

/* ---------- table, altar, lectern ---------- */
/* Plain wooden table. parts: top. topY = surface height. */
export function table({w=2.6,d=.8,h=.88}={}){
  const g=new THREE.Group(); g.name='table';
  const top=bx(w,.06,d,'darkwood',0,h-.03,0); g.add(top);
  for(const sx of[-1,1]) for(const sz of[-1,1]) g.add(bx(.08,h-.06,.08,'darkwood',sx*(w/2-.1),(h-.06)/2,sz*(d/2-.08)));
  g.add(bx(w-.2,.08,.04,'darkwood',0,h-.12,d/2-.08), bx(w-.2,.08,.04,'darkwood',0,h-.12,-d/2+.08));
  g.topY=h; return finish(g,{parts:{top},footprint:boxFootprint(w,d)});
}

/* Stone altar on a two-step plinth. parts: top, body. topY = surface height. */
export function altar({w=1.3,d=.8,h=1.05,cloth=false}={}){
  const g=new THREE.Group(); g.name='altar';
  g.add(bx(w+.3,.1,d+.3,'stone',0,.05,0));
  const body=bx(w,h-.22,d,'stone',0,.1+(h-.22)/2,0); g.add(body);
  const top=bx(w+.14,.12,d+.14,'stone',0,h-.06,0); g.add(top);
  if(cloth){const c=mesh(boxGeo(w*.7,.012,d+.22,1),'cloth',0,h+.006,0); g.add(c);}
  g.topY=h;
  return finish(g,{parts:{top,body},footprint:boxFootprint(w+.3,d+.3)});
}

/* page texture: ruled lines of "writing" */
let pageTex=null;
function pages(){
  if(pageTex) return pageTex;
  const c=document.createElement('canvas'); c.width=256; c.height=192; const g=c.getContext('2d');
  g.fillStyle='#cdbf98'; g.fillRect(0,0,256,192); const r=rng(14);
  g.strokeStyle='rgba(40,26,14,.75)'; g.lineWidth=1.4;
  for(let y=16;y<180;y+=9){let x=16; g.beginPath(); g.moveTo(x,y); while(x<236-r()*30){x+=3+r()*6; g.lineTo(x,y+(r()-.5)*2.6);} g.stroke();}
  pageTex=new THREE.CanvasTexture(c); pageTex.colorSpace=THREE.SRGBColorSpace; pageTex.userData.shared=true; return pageTex;
}
const pageMat=()=>{if(!pageMat.m){pageMat.m=new THREE.MeshStandardMaterial({map:pages(),roughness:.9}); pageMat.m.userData.shared=true;} return pageMat.m;};

/*
 * Reading lectern with a sloping desk. book: 'none' | 'closed' | 'open'; dusty: a grey film over
 * the desk and a closed book (an open book is read, so it is clean). setBook(s), setDusty(b) change it in place.
 * parts: desk, book. topY = height of the desk's middle.
 */
export function lectern({book='open',dusty=false}={}){
  const g=new THREE.Group(); g.name='lectern';
  g.add(bx(.5,.08,.4,'darkwood',0,.04,0));
  g.add(cy(.07,.09,.85,'darkwood',0,.5,0,10));
  const deskPivot=new THREE.Group(); deskPivot.position.set(0,1.05,0); deskPivot.rotation.x=.42; g.add(deskPivot);
  const desk=bx(.66,.04,.5,'darkwood',0,0,0); deskPivot.add(desk);
  deskPivot.add(bx(.66,.05,.04,'darkwood',0,.03,.23));          /* lip */
  const dustDesk=mesh(new THREE.PlaneGeometry(.64,.48),'dust',0,.0215,0,{cast:false}); dustDesk.rotation.x=-Math.PI/2; deskPivot.add(dustDesk);
  const bookGroup=new THREE.Group(); bookGroup.position.y=.02; deskPivot.add(bookGroup);
  const closed=new THREE.Group(), opened=new THREE.Group(); bookGroup.add(closed,opened);
  closed.add(bx(.3,.05,.22,'leather',0,.025,0));
  closed.add(bx(.27,.036,.2,'parchment',.01,.026,0,{cast:false}));
  const dustBook=bx(.315,.056,.235,'dust',0,.027,0,{cast:false}); closed.add(dustBook);
  const cover=bx(.46,.012,.26,'leather',0,.006,0); opened.add(cover);
  for(const s of[-1,1]){const p=new THREE.Mesh(new THREE.BoxGeometry(.2,.014,.23),pageMat()); p.position.set(s*.1,.02,0); p.rotation.z=-s*.07; p.receiveShadow=true; p.castShadow=true; opened.add(p);}
  const set=(s)=>{closed.visible=s==='closed'; opened.visible=s==='open'; bookGroup.visible=s!=='none'; g.bookState=s; dustBook.visible=g.dusty&&s==='closed';};
  g.setBook=set; g.setDusty=(b)=>{g.dusty=b; dustDesk.visible=b; set(g.bookState);};
  g.dusty=dusty; set(book); g.setDusty(dusty);
  g.topY=1.05;
  return finish(g,{parts:{desk,book:bookGroup},footprint:circleFootprint(.36)});
}

/* ---------- bell ---------- */
/*
 * Bell on an iron bracket that projects from a wall (the wall is at z=0, the bracket extends +z).
 * rope: 'hanging' (reaches hand height) | 'cut' (stub, with the severed length coiled on the floor) |
 * 'tied' (rope lashed up round the bell lip). ring() swings it for a few seconds.
 * parts: bell, rope, bracket. mountY = height of the bracket arm.
 */
export function bell({rope='hanging',mountY=2.3}={}){
  const g=new THREE.Group(); g.name='bell';
  const bracket=new THREE.Group();
  bracket.add(bx(.1,.34,.04,'iron',0,mountY,.02));
  bracket.add(bx(.045,.045,.62,'iron',0,mountY+.09,.31));
  const brace=bx(.03,.03,.5,'iron',0,mountY-.12,.22); brace.rotation.x=.55; bracket.add(brace);
  g.add(bracket);
  const swing=new THREE.Group(); swing.position.set(0,mountY+.07,.5); g.add(swing);
  const bellMesh=lathe([[0,0],[.05,0],[.06,-.03],[.07,-.1],[.1,-.2],[.15,-.3],[.185,-.36],[.2,-.38],[.185,-.385],[.15,-.36],[.12,-.3],[.07,-.2],[.05,-.1],[0,-.04]].reverse(),'bronze',0,0,0,24);
  bellMesh.material=mat('bronze'); swing.add(bellMesh);
  swing.add(cy(.014,.014,.1,'iron',0,.04,0,6));
  const clapper=mesh(sphereGeo(.04,10,8),'iron',0,-.36,0); swing.add(clapper);
  const ropeGroup=new THREE.Group(); swing.add(ropeGroup);
  const R=.011, add=(pts,r=R)=>{const t=mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p))),Math.max(8,pts.length*5),r,6),'rope'); ropeGroup.add(t); return t;};
  const base=mountY+.07;
  if(rope==='hanging'){
    add([[0,-.36,0],[.006,-.7,.01],[-.004,-.9,.0],[0,-(base-1.1),0]]);
    ropeGroup.add(mesh(sphereGeo(.03,8,6),'rope',0,-(base-1.08),0));
  } else if(rope==='cut'){
    add([[0,-.36,0],[.01,-.5,.01],[.02,-.62,.02]]);
    for(let i=0;i<5;i++){const f=mesh(new THREE.CylinderGeometry(.002,.004,.07,3),'rope',(i-2)*.007,-.65,.02); f.rotation.z=(i-2)*.25; ropeGroup.add(f);}
    /* the severed length on the floor, in loose loops (in world space, beside the bracket) */
    const floorCoil=new THREE.Group(); const pts=[]; for(let i=0;i<30;i++){const a=i*.45; const rr=.05+i*.006; pts.push([Math.cos(a)*rr*1.3,.012,Math.sin(a)*rr]);}
    const t=mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p))),90,.011,6),'rope'); floorCoil.add(t); floorCoil.position.set(.2,0,.9); g.add(floorCoil);
  } else { /* tied */
    const lash=mesh(torusGeo(.18,.013,6,24),'rope',0,-.35,0); lash.rotation.x=Math.PI/2; ropeGroup.add(lash);
    add([[.17,-.35,0],[.18,-.45,.02],[.15,-.55,.03]]);
    ropeGroup.add(mesh(sphereGeo(.026,8,6),'rope',.15,-.56,.03));
  }
  /* ringing: damped swing about the arm */
  let ringT=-1, amp=0;
  const prev=g.userData.update;
  g.userData.update=(t,dt)=>{
    if(prev) prev(t,dt);
    if(ringT<0) return; const e=t-ringT;
    swing.rotation.z=amp*Math.exp(-e*.8)*Math.sin(e*6.2); swing.rotation.x=.4*amp*Math.exp(-e*.8)*Math.sin(e*5.1);
    if(e>7){ringT=-1; swing.rotation.set(0,0,0);}
  };
  g.ring=()=>{ringT=(performance.now()/1000); amp=.28; g.ringStarted=true;};
  g.ringAt=(t)=>{ringT=t; amp=.28;};
  g.rope=rope;
  return finish(g,{parts:{bell:bellMesh,rope:ropeGroup,bracket,swing},footprint:null});
}

/* ---------- sconce ---------- */
/*
 * Iron wall sconce: back plate against the wall (z=0), arm reaching out to a cup at +z .3. Holds a
 * candle when `held`; the candle is alight when `lit`. setHeld(b) / setLit(b) update in place; the
 * light never leaves the scene so toggling cannot stall on a shader recompile.
 * y = height of the cup above the floor. parts: bracket, candle.
 */
export function sconce({y=1.7,held=true,lit=false,shadow=false}={}){
  const g=new THREE.Group(); g.name='sconce';
  const bracket=new THREE.Group(); g.add(bracket);
  bracket.add(bx(.09,.22,.025,'iron',0,y+.02,.012));
  const path=new THREE.CatmullRomCurve3([new THREE.Vector3(0,y,.02),new THREE.Vector3(0,y-.06,.14),new THREE.Vector3(0,y-.04,.27),new THREE.Vector3(0,y,.3)]);
  bracket.add(mesh(new THREE.TubeGeometry(path,12,.014,6),'iron'));
  bracket.add(lathe([[0,0],[.04,0],[.055,.03],[.065,.05],[.05,.045],[0,.035]],'iron',0,y,.3,14));
  const c=candle({height:.17,holder:'none',lit,shadow,seed:y*7}); c.position.set(0,y+.03,.3); g.add(c);
  g.candle=c;
  g.setHeld=(b)=>{g.held=b; c.userData.body.visible=b; if(!b) c.setLit(false);};
  g.setLit=(b)=>{g.lit=b; c.setLit(b&&g.held);};
  g.held=held; g.setHeld(held); g.setLit(lit);
  return finish(g,{parts:{bracket,candle:c},footprint:null});
}

/* ---------- small things ---------- */
/* A human skull, about 0.19 m tall. Origin at the base. */
export function skull(){
  const g=new THREE.Group(); g.name='skull';
  const cr=mesh(sphereGeo(.085,16,12),'bone',0,.115,0); cr.scale.set(.95,1,1.12); g.add(cr);
  g.add(mesh(sphereGeo(.06,12,8),'bone',0,.07,.035));
  const jaw=bx(.085,.03,.08,'bone',0,.035,.038); g.add(jaw);
  g.add(bx(.075,.022,.08,'bone',0,.058,.04));
  for(const s of[-1,1]){const e=mesh(sphereGeo(.02,8,6),'coal',s*.033,.108,.075,{cast:false}); e.scale.z=.6; g.add(e);}
  const nose=mesh(new THREE.ConeGeometry(.012,.026,3),'coal',0,.082,.088,{cast:false}); nose.rotation.x=Math.PI; g.add(nose);
  const teeth=[]; for(let i=-3;i<=3;i++) teeth.push(placed(boxGeo(.009,.012,.008,1),{pos:[i*.0105,.052,.083]}));
  g.add(merged(teeth,'bone'));
  return finish(g,{parts:{cranium:cr,jaw},footprint:null});
}

/* Hourglass, 0.24 m tall: wooden ends and posts, glass bulbs, sand. Origin at the base. */
export function hourglass(){
  const g=new THREE.Group(); g.name='hourglass';
  g.add(cy(.06,.065,.016,'darkwood',0,.008,0,16)); g.add(cy(.06,.055,.016,'darkwood',0,.232,0,16));
  for(let i=0;i<3;i++){const a=i*Math.PI*2/3; g.add(cy(.0045,.0045,.216,'darkwood',Math.cos(a)*.047,.12,Math.sin(a)*.047,6));}
  const bulb=lathe([[.004,0],[.03,.015],[.042,.045],[.03,.075],[.004,.1],[.003,.1]],'glass',0,0,0,16,{cast:false});
  const lo=bulb.clone(); lo.position.y=.024; const hi=bulb.clone(); hi.rotation.x=Math.PI; hi.position.y=.224;
  g.add(lo,hi);
  g.add(mesh(new THREE.ConeGeometry(.028,.032,12),'sand',0,.04,0,{cast:false}));
  const upper=mesh(new THREE.ConeGeometry(.026,.03,12),'sand',0,.172,0,{cast:false}); upper.rotation.x=Math.PI; g.add(upper);
  return finish(g,{parts:{glass:lo},footprint:null});
}

/* A trencher with a loaf and a bowl of water. parts: bread, bowl, water. */
export function breadAndWater({water=true,bread=true}={}){
  const g=new THREE.Group(); g.name='breadAndWater';
  g.add(cy(.17,.17,.018,'darkwood',0,.009,0,20));
  const loaf=new THREE.Group(); loaf.position.set(-.06,.018,.01);
  const body=mesh(sphereGeo(.075,14,10),'bread',0,.03,0); body.scale.set(1.25,.6,.8); loaf.add(body);
  for(const x of[-.04,0,.04]){const cut=bx(.004,.004,.07,'coal',x,.062,0,{cast:false}); cut.rotation.y=.9; loaf.add(cut);}
  loaf.visible=bread; g.add(loaf);
  const bowl=new THREE.Group(); bowl.position.set(.08,.018,-.01);
  bowl.add(lathe([[0,0],[.035,0],[.07,.03],[.085,.065],[.082,.066],[.066,.036],[.0,.012]].map(p=>p),'pewter',0,0,0,18));
  const w=mesh(new THREE.CircleGeometry(.07,18),'water',0,.04,0,{cast:false}); w.rotation.x=-Math.PI/2; w.visible=water; bowl.add(w);
  g.add(bowl);
  return finish(g,{parts:{bread:loaf,bowl,water:w},footprint:null});
}

/* Iron bar, 1.1 m by default. mode: 'leaning' (against a wall at z<0 side) | 'standing' | 'lying'. */
export function ironBar({length=1.1,mode='leaning'}={}){
  const g=new THREE.Group(); g.name='ironBar';
  const bar=new THREE.Group();
  bar.add(cy(.02,.02,length,'iron',0,length/2,0,10));
  bar.add(bx(.06,.07,.012,'iron',0,length-.02,0)); bar.add(bx(.06,.05,.016,'iron',0,.02,0));
  if(mode==='lying'){bar.rotation.z=Math.PI/2; bar.position.set(length/2,.02,0);}
  else if(mode==='leaning'){bar.rotation.x=-.1; bar.position.z=-.02;}
  g.add(bar);
  return finish(g,{parts:{bar},footprint:null});
}

/* Old iron key, 0.16 m long, lying flat. Origin at the surface. */
export function ironKey(){
  const g=new THREE.Group(); g.name='ironKey';
  const k=new THREE.Group();
  const bow=mesh(torusGeo(.028,.009,6,16),'bronze',-.06,0,0); bow.rotation.x=Math.PI/2; k.add(bow);
  k.add(bx(.12,.013,.013,'bronze',.02,0,0)); k.add(bx(.012,.016,.016,'bronze',-.03,0,0));
  k.add(bx(.03,.01,.016,'bronze',.07,0,.01)); k.add(bx(.012,.01,.03,'bronze',.058,0,.012));
  k.position.y=.011; k.rotation.y=.5; g.add(k);
  return finish(g,{parts:{key:k},footprint:null});
}

/* A flint nodule with a sharp edge. About 0.07 m. */
export function flint({seed=5}={}){
  const g=new THREE.Group(); g.name='flint';
  const geo=new THREE.IcosahedronGeometry(.03,0), r=rng(seed), p=geo.attributes.position;
  for(let i=0;i<p.count;i++){const k=.75+r()*.5; p.setXYZ(i,p.getX(i)*k*1.4,p.getY(i)*k*.6,p.getZ(i)*k);}
  geo.computeVertexNormals();
  const m=mesh(geo,'flint',0,.016,0); m.rotation.y=r()*3; g.add(m);
  return finish(g,{parts:{stone:m},footprint:null});
}

/* A coil of cord with a loose tail. Origin at the surface. */
export function cordCoil({loops=4,radius:rad=.08}={}){
  const g=new THREE.Group(); g.name='cordCoil';
  const pts=[]; for(let i=0;i<=loops*14;i++){const a=i/14*Math.PI*2; const rr=rad*(1+.04*Math.sin(i)); pts.push(new THREE.Vector3(Math.cos(a)*rr,.01+Math.floor(i/14)*.016+(i%14)*.0011,Math.sin(a)*rr*.92));}
  const last=pts.at(-1); for(let i=1;i<=8;i++) pts.push(new THREE.Vector3(last.x+i*.035,.011,last.z+Math.sin(i*.7)*.02+i*.012));
  const coil=mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),loops*28+20,.008,6),'rope'); g.add(coil);
  return finish(g,{parts:{coil},footprint:null});
}

/* ---------- statue, basin, brazier ---------- */
/*
 * Robed statue on a pedestal, about 1.85 m. veil: a linen drape over the figure; setVeil(b) lifts or
 * drops it (when off, a fallen heap lies at the foot). parts: statue, veil, pedestal, heap.
 */
export function veiledStatue({veil=true}={}){
  const g=new THREE.Group(); g.name='veiledStatue';
  const pedestal=new THREE.Group(); pedestal.add(bx(.7,.12,.7,'stone',0,.06,0),bx(.52,.62,.52,'stone',0,.43,0),bx(.64,.1,.64,'stone',0,.79,0)); g.add(pedestal);
  const statue=new THREE.Group(); statue.position.y=.84; g.add(statue);
  const robe=lathe([[0,0],[.2,0],[.19,.15],[.15,.5],[.13,.75],[.16,.88],[.13,.96],[.06,1.0],[0,1.0]],'statue',0,0,0,18); statue.add(robe);
  statue.add(mesh(sphereGeo(.075,14,10),'statue',0,1.07,0));
  const arm=bx(.05,.3,.05,'statue',.17,.84,.05); arm.rotation.z=.2; arm.rotation.x=-.5; statue.add(arm);
  const arm2=bx(.05,.3,.05,'statue',-.17,.84,.05); arm2.rotation.z=-.2; arm2.rotation.x=-.5; statue.add(arm2);
  /* the veil: a rippled shell a little wider than the figure, from the crown to the knees */
  const vg=new THREE.LatheGeometry([[0,1.16],[.1,1.1],[.19,.95],[.26,.7],[.3,.4],[.33,.12]].map(([r,y])=>new THREE.Vector2(r,y)),32);
  const vp=vg.attributes.position, rr=rng(9);
  for(let i=0;i<vp.count;i++){const x=vp.getX(i),z=vp.getZ(i),a=Math.atan2(z,x),k=1+.07*Math.sin(a*8+vp.getY(i)*3)+.03*Math.sin(a*13); vp.setX(i,x*k); vp.setZ(i,z*k); vp.setY(i,vp.getY(i)+(rr()-.5)*.006);}
  vg.computeVertexNormals();
  const veilMesh=new THREE.Mesh(vg,mat('linen')); veilMesh.castShadow=veilMesh.receiveShadow=true; statue.add(veilMesh);
  const heap=mesh(sphereGeo(.2,12,8),'linen',.5,.05,.35); heap.scale.set(1.4,.28,1); heap.rotation.y=.5; g.add(heap);
  g.setVeil=(b)=>{g.veiled=b; veilMesh.visible=b; heap.visible=!b;};
  g.setVeil(veil);
  return finish(g,{parts:{statue,veil:veilMesh,pedestal,heap},footprint:boxFootprint(.72,.72)});
}

/*
 * Stone basin on a pedestal, 1 m high, bowl 0.8 m across. water: a still, dark surface (setWater).
 * waterY = height of the water; hang a mirrored textPanel or a light reflection there.
 */
export function basin({water=true}={}){
  const g=new THREE.Group(); g.name='basin';
  const body=lathe([[0,0],[.28,0],[.28,.07],[.15,.13],[.11,.5],[.16,.64],[.24,.74],[.38,.86],[.42,.97],[.4,1.0],[.37,.99],[.34,.93],[.2,.86],[0,.85]],'stone',0,0,0,28); g.add(body);
  const w=mesh(new THREE.CircleGeometry(.345,28),'water',0,.93,0,{cast:false}); w.rotation.x=-Math.PI/2; w.visible=water; g.add(w);
  g.setWater=(b)=>{w.visible=b;}; g.waterY=.93;
  return finish(g,{parts:{bowl:body,water:w},footprint:circleFootprint(.43)});
}

/*
 * Iron tripod brazier ~1 m high. lit: coals glow and a flame with its own warm light burns (22 cd,
 * no shadows); cold: ash and dead coals. setLit(b) toggles in place. parts: bowl, fire.
 */
export function brazier({lit=false,shadow=false}={}){
  const g=new THREE.Group(); g.name='brazier';
  for(let i=0;i<3;i++){const a=i*Math.PI*2/3+.4, leg=cy(.016,.022,.95,'iron',Math.cos(a)*.2,.46,Math.sin(a)*.2,6); leg.rotation.set(Math.sin(a)*.2,0,-Math.cos(a)*.2); g.add(leg);}
  const hoop=mesh(torusGeo(.19,.012,6,18),'iron',0,.4,0); hoop.rotation.x=Math.PI/2; g.add(hoop);
  const bowl=lathe([[0,0],[.1,0],[.22,.06],[.31,.17],[.33,.2],[.31,.2],[.2,.12],[.0,.04]],'iron',0,.86,0,20); bowl.position.y=.78; g.add(bowl);
  const hot=new THREE.Group(), cold=new THREE.Group(); hot.position.y=cold.position.y=.88; g.add(hot,cold);
  const rr=rng(31);
  for(let i=0;i<12;i++){const a=rr()*7, d=rr()*.2, s=.03+rr()*.03;
    const c=new THREE.Mesh(new THREE.DodecahedronGeometry(s,0),mat('ember')); c.position.set(Math.cos(a)*d,rr()*.04,Math.sin(a)*d); c.rotation.set(rr()*3,rr()*3,0); hot.add(c);
    const k=new THREE.Mesh(new THREE.DodecahedronGeometry(s,0),mat(i%3?'coal':'ash')); k.position.copy(c.position); k.rotation.copy(c.rotation); k.castShadow=true; cold.add(k);}
  const f=fire({size:1,lit,shadow}); f.position.y=.9; g.add(f);
  g.setLit=(b)=>{g.lit=b; hot.visible=b; cold.visible=!b; f.setLit(b);};
  g.setLit(lit); g.fire=f;
  return finish(g,{parts:{bowl,fire:f},footprint:circleFootprint(.36)});
}
