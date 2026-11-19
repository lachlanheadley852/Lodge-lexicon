/*
 * Per-room 2D floor plan and circle-vs-plan collision (x east, z south, metres).
 *
 * plan = {
 *   walls:  [[x1,z1,x2,z2], ...]            line segments you cannot cross
 *   boxes:  [{x1,z1,x2,z2}, ...]            axis-aligned footprints (props, tables)
 *   circles:[{x,z,r}, ...]                  round footprints (pillars, stands)
 *   zones:  [[[x,z],[x,z],...], ...]        no-walk polygons (chasm, pits) for later rooms
 * }
 * The player is a circle of radius `r`; resolve() slides it along whatever it touches.
 */
function nearestOnSegment(px,pz,x1,z1,x2,z2){
  const dx=x2-x1, dz=z2-z1, l2=dx*dx+dz*dz;
  let t=l2?((px-x1)*dx+(pz-z1)*dz)/l2:0; t=Math.max(0,Math.min(1,t));
  return [x1+t*dx,z1+t*dz];
}
function pushFromSegment(p,r,x1,z1,x2,z2){
  const [cx,cz]=nearestOnSegment(p.x,p.z,x1,z1,x2,z2);
  let dx=p.x-cx, dz=p.z-cz; const d=Math.hypot(dx,dz);
  if(d>=r) return;
  if(d<1e-6){ /* exactly on the line: push along the segment normal */
    dx=-(z2-z1); dz=x2-x1; const l=Math.hypot(dx,dz)||1; p.x=cx+dx/l*r; p.z=cz+dz/l*r; return;
  }
  p.x=cx+dx/d*r; p.z=cz+dz/d*r;
}
function insidePoly(x,z,poly){
  let c=false;
  for(let i=0,j=poly.length-1;i<poly.length;j=i++){
    const [xi,zi]=poly[i],[xj,zj]=poly[j];
    if((zi>z)!==(zj>z)&&x<(xj-xi)*(z-zi)/(zj-zi)+xi) c=!c;
  }
  return c;
}

/* Push the point p={x,z} out of everything in the plan (mutates and returns p). */
export function resolve(plan,p,r){
  for(let pass=0;pass<4;pass++){
    for(const w of plan.walls||[]) pushFromSegment(p,r,w[0],w[1],w[2],w[3]);
    for(const b of plan.boxes||[]){
      const cx=Math.max(b.x1,Math.min(b.x2,p.x)), cz=Math.max(b.z1,Math.min(b.z2,p.z));
      const dx=p.x-cx, dz=p.z-cz, d=Math.hypot(dx,dz);
      if(d>=r) continue;
      if(d>1e-6){p.x=cx+dx/d*r; p.z=cz+dz/d*r;}
      else{ /* centre inside the box: leave by the nearest face */
        const o=[[p.x-b.x1,-1,0],[b.x2-p.x,1,0],[p.z-b.z1,0,-1],[b.z2-p.z,0,1]].sort((a,c)=>a[0]-c[0])[0];
        p.x+=o[1]*(o[0]+r); p.z+=o[2]*(o[0]+r);
      }
    }
    for(const c of plan.circles||[]){
      const dx=p.x-c.x, dz=p.z-c.z, d=Math.hypot(dx,dz), m=c.r+r;
      if(d>=m) continue;
      if(d>1e-6){p.x=c.x+dx/d*m; p.z=c.z+dz/d*m;} else p.x=c.x+m;
    }
    for(const poly of plan.zones||[]){
      const inside=insidePoly(p.x,p.z,poly);
      let best=null;
      for(let i=0,j=poly.length-1;i<poly.length;j=i++){
        const [cx,cz]=nearestOnSegment(p.x,p.z,poly[j][0],poly[j][1],poly[i][0],poly[i][1]);
        const d=Math.hypot(p.x-cx,p.z-cz);
        if(!best||d<best.d) best={d,cx,cz};
      }
      if(!best) continue;
      if(inside){
        const dx=best.cx-p.x, dz=best.cz-p.z, l=Math.hypot(dx,dz)||1;
        p.x=best.cx+dx/l*r; p.z=best.cz+dz/l*r;
      } else if(best.d<r){
        const dx=p.x-best.cx, dz=p.z-best.cz, l=Math.hypot(dx,dz)||1;
        p.x=best.cx+dx/l*r; p.z=best.cz+dz/l*r;
      }
    }
  }
  return p;
}

/* Is point (x,z) inside any trigger rect {x1,z1,x2,z2,hotspot}? Returns the trigger or null. */
export function triggerAt(triggers,x,z){
  for(const t of triggers||[]) if(x>=t.x1&&x<=t.x2&&z>=t.z1&&z<=t.z2) return t;
  return null;
}
