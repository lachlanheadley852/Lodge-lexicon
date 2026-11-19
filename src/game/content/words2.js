/*
 * Degree II: what happens when a word is spoken at a hotspot.
 * Rules are checked top to bottom; the first match wins. See README.md for the fields.
 * Anything not matched here falls through to the generated reply (phrases2.js, generic2.js).
 * Word shapes: 'RAS-KA-ES' exact, 'RAS-KA' no modifier, 'RAS-KA-*' any modifier, 'RAS-*-ES' any action.
 */
export default [
  /* --- the far brazier (and the chasm in front of it): RAS-KA-ES lights it --- */
  {target:['brazier','chasm'], word:'RAS-KA-ES', requires:['brazier'],
    text:`The brazier already burns.`},
  {target:['brazier','chasm'], word:'RAS-KA-ES', sets:['brazier'],
    text:`Heat gathers in your word and leaps across the chasm as a trail of embers. The far brazier roars alight, and its glow shows a narrow ledge on the far side, with something round and carved lying on it.`},
  {target:['brazier','chasm'], word:'RAS-KA-ON',
    text:`A thick trail of embers rolls out over the chasm and sinks into the dark. Stronger was not the problem. It is too far.`},
  {target:['brazier','chasm'], word:'RAS-KA-*',
    text:`A trail of embers drifts out over the chasm and falls short, sinking into the dark. The brazier is too far for this word.`},
  {target:['brazier','chasm'], word:'RAS-*-ES',
    text:`Heat leaps across the chasm, but it doesn't travel as fire. It needs to be carried.`},
  {target:['brazier','chasm'], word:'LUM-KA-ES',
    text:`Light streaks across and splashes against the brazier, then fades. The brazier wants fire, not light.`},
  {target:['brazier','chasm'], word:'HAL-KA-ES',
    text:`Your voice crosses the chasm and comes back from stone. There is a ledge on the far side.`},
  {target:['brazier','chasm'], word:'LUM-SE-*', requires:['!brazier'],
    text:`Light spreads over the chasm. For a moment you glimpse the far ledge, a cold brazier, and something round lying in the dark. Then it fades.`},

  /* --- the crown on the far ledge: KEL-KA-ES carries it across --- */
  {target:'crown', requires:['!crownHere'], word:'KEL-KA-ES', sets:['crownHere'],
    text:`The weight of stone answers you from across the chasm. The carved crown lifts from the ledge, glides over the dark, and settles at the foot of the broken pillar behind you.`},
  {target:'crown', requires:['!crownHere'], word:'KEL-KA-*',
    text:`The carved crown rocks on the ledge, but your word fades before it can reach that far.`},
  {target:'crown', requires:['!crownHere'], word:'VEL-SE-*',
    text:`A ghost-image flickers: the crown sitting atop a pillar, before someone threw it into the dark.`},
  {target:'crown', requires:['!crownHere'], word:'LUM-SE-*',
    text:`Light shows the carving clearly. It is the capital and globe of a pillar.`},
  {target:'crown', requires:['!crownHere'], word:'KEL-NE-*',
    text:`You feel the crown want to rejoin something, but it is on the far side of the chasm, nowhere near what it belongs to.`},

  /* --- the broken pillar (and the crown once it lies at its foot): KEL-NE-ON mends it --- */
  {target:['pillarR',{id:'crown',requires:['crownHere']}], word:'KEL-NE-*', requires:['pillar'],
    text:`The pillar already stands whole.`},
  {target:['pillarR',{id:'crown',requires:['crownHere']}], word:'KEL-NE-*', requires:['!crownHere'],
    text:`The cracks in the broken pillar draw together, but its top is gone. There is nothing to mend it to. Its crown must be somewhere.`},
  {target:['pillarR',{id:'crown',requires:['crownHere']}], word:'KEL-NE-ON', requires:['veilOpen'], sets:['pillar'], effects:[{fanfare:true}],
    text:`Your word rings out doubled. The pillar's cracks seal, the crown rises from the floor and locks onto the broken top, and the second pillar stands whole again. Beyond the parted water, the inner door swings open.`},
  {target:['pillarR',{id:'crown',requires:['crownHere']}], word:'KEL-NE-ON', sets:['pillar'],
    text:`Your word rings out doubled. The pillar's cracks seal, the crown rises from the floor and locks onto the broken top, and the second pillar stands whole again.`},
  {target:['pillarR',{id:'crown',requires:['crownHere']}], word:'KEL-NE-*',
    text:`The crown lifts and the cracks begin to close, but the word is not strong enough. The stone sags back. It needs more force.`},
  {target:['pillarR',{id:'crown',requires:['crownHere']}], word:'VEL-SE-*', requires:['pillar'],
    text:`You see the pillar as it always was. Whole.`},
  {target:['pillarR',{id:'crown',requires:['crownHere']}], word:'VEL-SE-*',
    text:`Ghost-images rise in sepia: the pillar whole, crowned with a globe. Then a figure in a dark robe strikes the crown loose and hurls it east, toward the chasm. The memory fades.`},
  {target:['pillarR',{id:'crown',requires:['crownHere']}], word:'KEL-SE-*', requires:['pillar'],
    text:`The stone is whole and sound.`},
  {target:['pillarR',{id:'crown',requires:['crownHere']}], word:'KEL-SE-*',
    text:`Lines of force glow in the broken stone. The pillar is sound below, but its crown is missing.`},
  {target:'crown', word:'KEL-KA-*', requires:['crownHere'],
    text:`The crown slides along the floor and stops at the pillar's foot. It is already where it belongs. It needs joining, not carrying.`},

  /* --- the water veil: MIR-MO stills it, then MIR-PA parts it --- */
  {target:'veil', word:'MIR-PA-*', requires:['veilStill','pillar'], sets:['veilOpen'], effects:[{fanfare:true}],
    text:`The stilled water splits down the middle like glass and parts. Beyond, a short passage leads to an inner door. Between the two standing pillars, it swings open.`},
  {target:'veil', word:'MIR-PA-*', requires:['veilStill'], sets:['veilOpen'],
    text:`The stilled water splits down the middle like glass and parts. Beyond, a short passage leads to an inner door.`},
  {target:'veil', word:'MIR-PA-ON',
    text:`The water parts wider for a heartbeat, then crashes back. However hard you push, it is falling too fast to stay open.`},
  {target:'veil', word:'MIR-PA-*',
    text:`The falling water parts for a moment and you glimpse a passage beyond. Then it rushes closed again before you can step through. It falls too fast to hold open.`},
  {target:'veil', word:'MIR-MO-*', sets:['veilStill'],
    text:`The falling water slows, then stops, hanging in the arch like a sheet of glass. Your own reflection looks back at you.`},
  {target:'veil', word:'MIR-SE-*', requires:['veilStill'],
    text:`The stilled water shows the truth behind it: a passage, and an inner door.`},
  {target:'veil', word:'MIR-SE-*',
    text:`The water shows its true depth. It is only a thin veil, and behind it is a passage.`},
  {target:'veil', word:'RAS-MO-*',
    text:`Heat settles on the falling water and steam rises, but it keeps falling.`},
  {target:'veil', word:'LUM-SE-*',
    text:`Light scatters through the falling water into a hundred glints. You glimpse a passage beyond.`},
  {target:'veil', word:'VEL-SE-*',
    text:`A ghost-image: a Fellowcraft before you raises a hand, and the water stops, then parts. The memory fades before you see the words.`},
  {target:'veil', word:'KEL-PA-*',
    text:`There is no stone to open here. Only water.`},

  /* --- the basin and the backwards letters: MIR-SE reads them --- */
  {target:['basin','mirrorText'], word:'MIR-SE-*', sets:['read'],
    text:`The basin's surface shows the true reflection of the backwards words on the wall: STILL THE WATER, THEN PART IT.`},
  {target:['basin','mirrorText'], word:'MIR-MO-*',
    text:`The basin goes perfectly flat, but the letters on the wall are still backwards. You need the water's truth, not just its stillness.`},
  {target:['basin','mirrorText'], word:'LUM-SE-*',
    text:`The letters glow, but they are cut backwards, meant to be read in a reflection.`},
  {target:['basin','mirrorText'], word:'VEL-SE-*',
    text:`A ghost-image: an initiate leaning over the basin, reading the wall in its water.`},

  /* --- the rest --- */
  {target:'inner', requires:['!pillar'],
    text:`Your word strikes the inner door and fades. Carved above it: BETWEEN TWO PILLARS STANDING.`},
  {target:'doorway',
    text:`The word drifts through the open door ahead of you. The way is open; you only need to walk through.`},
  {target:'stair', word:'VEL-SE-*',
    text:`Ghost-images of initiates climbing, one after another, each pausing at the top to read the inscription.`},
  {target:'pillarL', word:'VEL-SE-*',
    text:`This pillar has always stood. The memory is calm.`}
];
