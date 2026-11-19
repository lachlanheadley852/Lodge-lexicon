/*
 * Degree II: what you read when you click a hotspot with nothing in hand.
 * Checked top to bottom; the first match wins (so put the flag variants first).
 */
export default [
  {target:'veil', requires:['veilStill'],
    text:`The water hangs motionless in the arch, like a sheet of glass. Your reflection looks back at you.`},
  {target:'veil',
    text:`A curtain of water falls across the arch, from a slot in the stone above into a channel below. Something lies behind it.`},
  {target:'pillarL',
    text:`A whole pillar, crowned with a globe.`},
  {target:'pillarR', requires:['pillar'],
    text:`Whole again, crowned like its twin.`},
  {target:'pillarR',
    text:`The second pillar is broken off at half its height. Its crown is gone.`},
  {target:'crown', requires:['crownHere'],
    text:`The carved crown of the broken pillar, lying at its foot.`},
  {target:'crown',
    text:`Across the chasm, on a narrow ledge, lies something round and carved. It looks like the crown of a pillar.`},
  {target:'chasm',
    text:`A chasm splits the chamber. You cannot see the bottom, and it is far too wide to jump.`},
  {target:'brazier', requires:['brazier'],
    text:`The far brazier burns, lighting the ledge across the chasm.`},
  {target:'brazier',
    text:`Across the chasm, barely visible, an iron brazier stands cold.`},
  {target:'inner',
    text:`An inner door, with an empty pillar-shaped groove on either side. Carved above it: BETWEEN TWO PILLARS STANDING.`},
  {target:'stair',
    text:`The winding stair you climbed. It turns out of sight below.`},
  {target:'inscription',
    text:`Carved above the stair: THE FELLOWCRAFT LEARNS TO CARRY, TO MEND, AND TO STILL.`},
  {target:'basin', requires:['read'],
    text:`The basin's reflection reads: STILL THE WATER, THEN PART IT.`},
  {target:'basin',
    text:`A stone basin of water on a pedestal, beneath the carved letters.`},
  {target:'mirrorText',
    text:`Letters are carved into the wall above the basin, but they run backwards.`}
];
