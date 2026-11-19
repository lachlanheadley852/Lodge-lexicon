/*
 * Touch input for the first-person view. Only reacts to pointerType 'touch' (and pen), so mouse and
 * keyboard behaviour is untouched.
 *   - a touch that lands in the left 45% of the view and drags becomes a thumb-stick (floating base
 *     where the thumb landed); analogue speed, same cap as the keyboard
 *   - a touch that drags elsewhere looks around (same pitch clamp as the mouse, no pointer lock)
 *   - a short, small touch is a tap: raycast from that point (onTap(ndc))
 *   - the Reveal button highlights every hotspot while held
 */
const SLOP=10, TAP_MS=350, STICK_R=52, DEAD=.12, LOOK_SENS=.0048, LEFT_ZONE=.45;

const CSS=`
#touch3{position:absolute;inset:0;z-index:5;pointer-events:none;display:none}
body.touch #touch3{display:block}
#touch3 .base,#touch3 .knob{position:absolute;border-radius:50%;pointer-events:none;display:none}
#touch3 .base{width:${STICK_R*2}px;height:${STICK_R*2}px;margin:-${STICK_R}px 0 0 -${STICK_R}px;border:2px solid rgba(232,220,196,.35);background:rgba(10,8,12,.25)}
#touch3 .knob{width:44px;height:44px;margin:-22px 0 0 -22px;background:rgba(242,194,90,.45);border:2px solid rgba(242,194,90,.8)}
#touch3 .idle{position:absolute;left:22px;bottom:22px;width:70px;height:70px;border-radius:50%;border:2px dashed rgba(232,220,196,.22);pointer-events:none;transition:opacity .3s}
#touch3.active .idle{opacity:0}
#touch3 .reveal{position:absolute;right:12px;bottom:12px;min-width:76px;min-height:48px;padding:6px 12px;pointer-events:auto;touch-action:none;background:rgba(10,8,12,.7);border:1px solid #6b5a38;color:#e8dcc4;font:12px Georgia,serif;letter-spacing:.14em;text-transform:uppercase;border-radius:24px;-webkit-user-select:none;user-select:none}
#touch3 .reveal.held{border-color:#f2c25a;color:#f2c25a;background:rgba(42,33,20,.85)}
`;

export function createTouch(container,canvas,{controls,onTap,setHighlight,isTouch}){
  const style=document.createElement('style'); style.textContent=CSS; document.head.appendChild(style);
  const layer=document.createElement('div'); layer.id='touch3';
  layer.innerHTML='<div class="idle"></div><div class="base"></div><div class="knob"></div><button type="button" class="reveal">Reveal</button>';
  container.appendChild(layer);
  const base=layer.querySelector('.base'), knob=layer.querySelector('.knob'), reveal=layer.querySelector('.reveal');
  canvas.style.touchAction='none';
  if(isTouch()) document.body.classList.add('touch');

  const ptrs=new Map();   /* pointerId -> {x0,y0,x,y,t0,role:'pending'|'stick'|'look',zoneLeft} */
  let stickId=null;

  const isFinger=e=>e.pointerType==='touch'||e.pointerType==='pen';
  const local=e=>{const r=canvas.getBoundingClientRect(); return {x:e.clientX-r.left,y:e.clientY-r.top,w:r.width||1,h:r.height||1};};

  function place(el,x,y){el.style.left=x+'px'; el.style.top=y+'px';}
  function endStick(){stickId=null; base.style.display=knob.style.display='none'; layer.classList.remove('active'); controls.setStick(0,0);}

  canvas.addEventListener('pointerdown',e=>{
    if(!isFinger(e)) return;
    document.body.classList.add('touch');   /* a real touch happened: use the touch layout */
    try{canvas.setPointerCapture(e.pointerId);}catch(err){}
    const p=local(e);
    ptrs.set(e.pointerId,{x0:p.x,y0:p.y,x:p.x,y:p.y,t0:e.timeStamp,role:'pending',zoneLeft:p.x<p.w*LEFT_ZONE});
    e.preventDefault();
  });
  canvas.addEventListener('pointermove',e=>{
    const s=ptrs.get(e.pointerId); if(!s) return;
    const p=local(e), dx=p.x-s.x, dy=p.y-s.y; s.x=p.x; s.y=p.y;
    if(s.role==='pending'&&Math.hypot(p.x-s.x0,p.y-s.y0)>SLOP){
      if(s.zoneLeft&&stickId===null){s.role='stick'; stickId=e.pointerId; place(base,s.x0,s.y0); base.style.display=knob.style.display='block'; layer.classList.add('active');}
      else s.role='look';
    }
    if(s.role==='look') controls.look(dx*LOOK_SENS,dy*LOOK_SENS);
    else if(s.role==='stick'){
      let vx=p.x-s.x0, vy=p.y-s.y0; const d=Math.hypot(vx,vy);
      if(d>STICK_R){vx*=STICK_R/d; vy*=STICK_R/d;}
      place(knob,s.x0+vx,s.y0+vy);
      const m=Math.min(1,d/STICK_R), k=m<DEAD?0:(m-DEAD)/(1-DEAD);   /* analogue, with a small dead zone */
      const dd=Math.min(d,STICK_R)||1;
      controls.setStick(vx/dd*k,-vy/dd*k);
    }
    e.preventDefault();
  });
  function up(e,cancelled){
    const s=ptrs.get(e.pointerId); if(!s) return; ptrs.delete(e.pointerId);
    if(s.role==='stick'&&stickId===e.pointerId) endStick();
    else if(s.role==='pending'&&!cancelled&&e.timeStamp-s.t0<TAP_MS){
      const p=local(e); onTap({x:(p.x/p.w)*2-1,y:-(p.y/p.h)*2+1});
    }
  }
  canvas.addEventListener('pointerup',e=>{if(isFinger(e)) up(e,false);});
  canvas.addEventListener('pointercancel',e=>{if(isFinger(e)) up(e,true);});
  canvas.addEventListener('contextmenu',e=>{if(isFinger(e)) e.preventDefault();});

  /* Reveal: hold to highlight every hotspot (the Space equivalent). */
  const holdOff=()=>{reveal.classList.remove('held'); if(!document.getElementById('hintBtn').classList.contains('on')) setHighlight(false);};
  reveal.addEventListener('pointerdown',e=>{try{reveal.setPointerCapture(e.pointerId);}catch(err){} reveal.classList.add('held'); setHighlight(true); e.preventDefault();});
  reveal.addEventListener('pointerup',holdOff); reveal.addEventListener('pointercancel',holdOff);
  reveal.addEventListener('contextmenu',e=>e.preventDefault());

  return {};
}
