/* Degree II puzzle logic: hotspot descriptions and spoken-word results. No DOM, no audio. */
import {S} from './state.js';
import {NAMES} from './data.js';

const RN={LUM:'Light',KEL:'The weight of stone',HAL:'Your breath',MIR:'A sheen of water',RAS:'Heat',VEL:'A ghost-image of the past'};
const AT={SE:(R,n)=>`${R} spreads over ${n}, but nothing hidden shows itself.`,
  TU:(R,n)=>`${R} winds around ${n} and slips away. Nothing here is made to hold it.`,
  PA:(R,n)=>`${R} parts around ${n}, but nothing here is shut.`,
  MO:(R,n)=>`${R} settles over ${n} and goes still. Nothing here was moving.`,
  NE:(R,n)=>`${R} draws the seams of ${n} together, but nothing here is broken.`,
  KA:(R,n)=>`${R} gathers near ${n} and drifts a little way, with nowhere to go.`};
const MT={ON:' The word rings out doubled, but more of nothing is still nothing.',ES:' The word reaches far, but distance was not what this needed.'};
export function generic2(r,a,m,n){
  if(r==='VEL'&&a==='SE') return `${RN.VEL} flickers over ${n}, but nothing happened here worth remembering.`+(m?MT[m]:'');
  return AT[a](RN[r],n)+(m?MT[m]:'');
}
export function look2(t){
  const f=S.f;
  return {
    veil:f.veilStill?'The water hangs motionless in the arch, like a sheet of glass. Your reflection looks back at you.':'A curtain of water falls across the arch, from a slot in the stone above into a channel below. Something lies behind it.',
    pillarL:'A whole pillar, crowned with a globe.',
    pillarR:f.pillar?'Whole again, crowned like its twin.':'The second pillar is broken off at half its height. Its crown is gone.',
    crown:f.crownHere?'The carved crown of the broken pillar, lying at its foot.':'Across the chasm, on a narrow ledge, lies something round and carved. It looks like the crown of a pillar.',
    chasm:'A chasm splits the chamber. You cannot see the bottom, and it is far too wide to jump.',
    brazier:f.brazier?'The far brazier burns, lighting the ledge across the chasm.':'Across the chasm, barely visible, an iron brazier stands cold.',
    inner:'An inner door, with an empty pillar-shaped groove on either side. Carved above it: BETWEEN TWO PILLARS STANDING.',
    stair:'The winding stair you climbed. It turns out of sight below.',
    inscription:'Carved above the stair: THE FELLOWCRAFT LEARNS TO CARRY, TO MEND, AND TO STILL.',
    basin:f.read?'The basin\'s reflection reads: STILL THE WATER, THEN PART IT.':'A stone basin of water on a pedestal, beneath the carved letters.',
    mirrorText:'Letters are carved into the wall above the basin, but they run backwards.'
  }[t];
}
export function resolve2(r,a,m,t){
  const f=S.f, n=NAMES[t]||'the empty air', ra=r+a;
  if(t==='brazier'||t==='chasm'){
    if(ra==='RASKA'&&m==='ES'){ if(f.brazier) return 'The brazier already burns.'; f.brazier=true;
      return 'Heat gathers in your word and leaps across the chasm as a trail of embers. The far brazier roars alight, and its glow shows a narrow ledge on the far side, with something round and carved lying on it.'; }
    if(ra==='RASKA'&&m==='ON') return 'A thick trail of embers rolls out over the chasm and sinks into the dark. Stronger was not the problem. It is too far.';
    if(ra==='RASKA') return 'A trail of embers drifts out over the chasm and falls short, sinking into the dark. The brazier is too far for this word.';
    if(r==='RAS'&&m==='ES') return 'Heat leaps across the chasm, but it doesn\'t travel as fire. It needs to be carried.';
    if(ra==='LUMKA'&&m==='ES') return 'Light streaks across and splashes against the brazier, then fades. The brazier wants fire, not light.';
    if(ra==='HALKA'&&m==='ES') return 'Your voice crosses the chasm and comes back from stone. There is a ledge on the far side.';
    if(ra==='LUMSE'&&!f.brazier) return 'Light spreads over the chasm. For a moment you glimpse the far ledge, a cold brazier, and something round lying in the dark. Then it fades.';
  }
  if(t==='crown'&&!f.crownHere){
    if(ra==='KELKA'&&m==='ES'){ f.crownHere=true; return 'The weight of stone answers you from across the chasm. The carved crown lifts from the ledge, glides over the dark, and settles at the foot of the broken pillar behind you.'; }
    if(ra==='KELKA') return 'The carved crown rocks on the ledge, but your word fades before it can reach that far.';
    if(ra==='VELSE') return 'A ghost-image flickers: the crown sitting atop a pillar, before someone threw it into the dark.';
    if(ra==='LUMSE') return 'Light shows the carving clearly. It is the capital and globe of a pillar.';
    if(ra==='KELNE') return 'You feel the crown want to rejoin something, but it is on the far side of the chasm, nowhere near what it belongs to.';
  }
  if(t==='pillarR'||(t==='crown'&&f.crownHere)){
    if(ra==='KELNE'){
      if(f.pillar) return 'The pillar already stands whole.';
      if(!f.crownHere) return 'The cracks in the broken pillar draw together, but its top is gone. There is nothing to mend it to. Its crown must be somewhere.';
      if(m==='ON'){ f.pillar=true; S.fanfare=!!f.veilOpen; return 'Your word rings out doubled. The pillar\'s cracks seal, the crown rises from the floor and locks onto the broken top, and the second pillar stands whole again.'+(f.veilOpen?' Beyond the parted water, the inner door swings open.':''); }
      return 'The crown lifts and the cracks begin to close, but the word is not strong enough. The stone sags back. It needs more force.';
    }
    if(ra==='VELSE') return f.pillar?'You see the pillar as it always was. Whole.':'Ghost-images rise in sepia: the pillar whole, crowned with a globe. Then a figure in a dark robe strikes the crown loose and hurls it east, toward the chasm. The memory fades.';
    if(ra==='KELSE') return f.pillar?'The stone is whole and sound.':'Lines of force glow in the broken stone. The pillar is sound below, but its crown is missing.';
    if(ra==='KELKA'&&t==='crown') return 'The crown slides along the floor and stops at the pillar\'s foot. It is already where it belongs. It needs joining, not carrying.';
  }
  if(t==='veil'){
    if(ra==='MIRPA'){
      if(f.veilStill){ f.veilOpen=true; S.fanfare=!!f.pillar; return 'The stilled water splits down the middle like glass and parts. Beyond, a short passage leads to an inner door.'+(f.pillar?' Between the two standing pillars, it swings open.':''); }
      if(m==='ON') return 'The water parts wider for a heartbeat, then crashes back. However hard you push, it is falling too fast to stay open.';
      return 'The falling water parts for a moment and you glimpse a passage beyond. Then it rushes closed again before you can step through. It falls too fast to hold open.';
    }
    if(ra==='MIRMO'){ f.veilStill=true; return 'The falling water slows, then stops, hanging in the arch like a sheet of glass. Your own reflection looks back at you.'; }
    if(ra==='MIRSE') return f.veilStill?'The stilled water shows the truth behind it: a passage, and an inner door.':'The water shows its true depth. It is only a thin veil, and behind it is a passage.';
    if(ra==='RASMO') return 'Heat settles on the falling water and steam rises, but it keeps falling.';
    if(ra==='LUMSE') return 'Light scatters through the falling water into a hundred glints. You glimpse a passage beyond.';
    if(ra==='VELSE') return 'A ghost-image: a Fellowcraft before you raises a hand, and the water stops, then parts. The memory fades before you see the words.';
    if(ra==='KELPA') return 'There is no stone to open here. Only water.';
  }
  if(t==='basin'||t==='mirrorText'){
    if(ra==='MIRSE'){ f.read=true; return 'The basin\'s surface shows the true reflection of the backwards words on the wall: STILL THE WATER, THEN PART IT.'; }
    if(ra==='MIRMO') return 'The basin goes perfectly flat, but the letters on the wall are still backwards. You need the water\'s truth, not just its stillness.';
    if(ra==='LUMSE') return 'The letters glow, but they are cut backwards, meant to be read in a reflection.';
    if(ra==='VELSE') return 'A ghost-image: an initiate leaning over the basin, reading the wall in its water.';
  }
  if(t==='inner'&&!f.pillar) return 'Your word strikes the inner door and fades. Carved above it: BETWEEN TWO PILLARS STANDING.';
  if(t==='doorway') return 'The word drifts through the open door ahead of you. The way is open; you only need to walk through.';
  if(t==='stair'&&ra==='VELSE') return 'Ghost-images of initiates climbing, one after another, each pausing at the top to read the inscription.';
  if(t==='pillarL'&&ra==='VELSE') return 'This pillar has always stood. The memory is calm.';
  return generic2(r,a,m,n);
}
