/*
 * Device tiers: the one place that decides pixel ratio, antialiasing and shadows.
 * Detection uses capabilities (coarse pointer, screen size, cores, memory), never the user agent.
 * Override for testing with ?q=high|medium|low.
 *   high   desktop / large screens: pixel ratio 2, antialias, 512 shadow maps (the reference look)
 *   medium phones and tablets:      pixel ratio 1.5, antialias, 512 shadow maps (kept: candle shadows are the look)
 *   low    weak phones (<=4 cores or <=3 GB): pixel ratio 1.25, no antialias, 256 shadow maps
 */
export function isTouchDevice(){
  try{
    if(window.matchMedia&&window.matchMedia('(pointer: coarse)').matches) return true;
    return (navigator.maxTouchPoints||0)>0&&!!window.matchMedia&&!window.matchMedia('(any-pointer: fine)').matches;
  }catch(e){return false;}
}

export function detectQuality(){
  let forced=null;
  try{forced=new URLSearchParams(location.search).get('q');}catch(e){}
  const touch=isTouchDevice();
  const small=Math.min(screen.width||9999,screen.height||9999)<700;
  const cores=navigator.hardwareConcurrency||8, mem=navigator.deviceMemory||4;
  let tier=!touch?'high':((cores<=4||mem<=3)&&small?'low':'medium');
  if(forced==='high'||forced==='medium'||forced==='low') tier=forced;
  const t={
    high:{pixelRatio:2,antialias:true,shadows:true,shadowMapSize:512},
    medium:{pixelRatio:1.5,antialias:true,shadows:true,shadowMapSize:512},
    low:{pixelRatio:1.25,antialias:false,shadows:true,shadowMapSize:256}
  }[tier];
  return {tier,touch,...t};
}
