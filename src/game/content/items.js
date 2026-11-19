/*
 * Using a carried item on a hotspot. Checked top to bottom; the first match wins.
 * Fields: item, target, requires, sets, clears, effects, text (see README.md).
 * {n} is the target's name ("that" if it has none). A rule with no target matches anything.
 */
export default [
  /* --- flint --- */
  {item:'flint', target:'candle', requires:['!lit'], sets:['lit'],
    effects:[{take:'flint'}, {learn:'LUM'}, {log:'Lit the candle.'}],
    text:`You strike the flint against the iron holder. Sparks catch the wick, and as the flame rises, a word rises with it, as if the light itself had spoken: LUM.`},
  {item:'flint', target:'candle',
    text:`The candle is already lit.`},
  {item:'flint',
    text:`You strike the flint. Sparks scatter and die.`},

  /* --- iron bar --- */
  {item:'bar', target:'slab', requires:['!lit'],
    text:`It is too dark to see where to set the bar.`},
  {item:'bar', target:'slab', requires:['slab'],
    text:`The stone has already been moved.`},
  {item:'bar', target:'slab', sets:['slab'],
    effects:[{take:'bar'}, {sound:'thud'}, {learn:'KEL'}, {log:'Lifted the floor stone.'}],
    text:`You wedge the flat end of the bar under the stone and heave. It grinds aside, and its weight settles into you as a word, heavy and certain: KEL. In the hollow beneath, something glints.`},
  {item:'bar', target:'entrance',
    text:`You strike the bricks with the bar. Mortar dust falls, but they don't move. None return the way they came.`},
  {item:'bar', target:'innerdoor',
    text:`You try to force the door with the bar. The wood groans, but the lock holds.`},
  {item:'bar', target:'skull',
    text:`You think better of it.`},
  {item:'bar',
    text:`The bar is no use on {n}.`},

  /* --- iron key --- */
  {item:'key', target:'innerdoor', sets:['open1'],
    effects:[{take:'key'}, {learn:'PA'}, {log:'Unlocked the inner door.'}],
    text:`The key turns with a heavy clunk. As the door swings open and light spills in, a word comes to you: PA.`},
  {item:'key', target:'entrance',
    text:`There is no lock here. Only bricks.`},
  {item:'key', target:'lodgeDoor',
    text:`There is no keyhole on this side. It is bolted from within.`},
  {item:'key',
    text:`The key doesn't fit anything on {n}.`},

  /* --- cable-tow --- */
  {item:'cord', target:'bell', sets:['tied'],
    effects:[{take:'cord'}, {learn:'TU'}, {log:'Tied the cord to the bell.'}],
    text:`You climb onto the bench and knot the cable-tow to the cut end of the bell-rope. As the knot pulls tight, a word binds itself to you: TU.`},
  {item:'cord', target:'lodgeDoor',
    text:`There is nothing to tie the cord to.`},
  {item:'cord',
    text:`You can't think of a reason to tie the cord to {n}.`},

  /* --- anything else --- */
  {text:`That does nothing.`}
];
