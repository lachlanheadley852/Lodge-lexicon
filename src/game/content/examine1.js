/*
 * Degree I: what you read when you click a hotspot with nothing in hand. Some of these also give
 * an item or teach a syllable. Checked top to bottom; the first match wins.
 * `room` limits a rule to those rooms. A rule that matches with empty text (text:``) says nothing.
 */
const EARLY=['reflection','hall'];

export default [
  /* --- Room 1: the Chamber of Reflection --- */
  {room:EARLY, target:'skull', requires:['!flint','lit'], sets:['flint'],
    effects:[{give:'flint'}, {log:'Took the flint from the skull.'}],
    text:`Something hard is wedged between the skull's teeth. You work it free: a flint.`},
  {room:EARLY, target:'skull', requires:['!flint'], sets:['flint'],
    effects:[{give:'flint'}, {log:'Took the flint from the skull.'}],
    text:`In the dark, your hands find something smooth and cold on a table: a skull. Something hard is wedged between its teeth. You work it free: a flint.`},
  {room:EARLY, target:'skull',
    text:`A human skull, set on the table to remind whoever waits here that every life ends.`},

  {room:EARLY, target:'candle', requires:['lit'],
    text:`The candle burns steadily. It is the only light in the room.`},
  {room:EARLY, target:'candle', requires:['flint'],
    text:`A stub of candle in an iron holder. The flint might light it.`},
  {room:EARLY, target:'candle',
    text:`Your fingers find a stub of candle in an iron holder. You have nothing to light it with.`},

  {room:EARLY, target:'hourglass', requires:['lit'],
    text:`An hourglass. All the sand has run through. Your time of waiting is over.`},
  {room:EARLY, target:'hourglass',
    text:`Something of glass and wood. You can't make it out in the dark.`},

  {room:EARLY, target:'bread', requires:['lit'],
    text:`A crust of bread and a bowl of water. The fare of one who has come to reflect.`},
  {room:EARLY, target:'bread',
    text:`Something soft, and a bowl of water. You leave them be.`},

  {room:EARLY, target:'vitriol', requires:['lit'],
    text:`Letters cut into the wall: V.I.T.R.I.O.L. Below, smaller: Visit the interior of the earth, and by rectifying you will find the hidden stone.`},
  {room:EARLY, target:'vitriol',
    text:`Letters are cut into the wall, but it is too dark to read them.`},

  {room:EARLY, target:'innerdoor',
    text:`A heavy wooden door, locked. Light leaks in beneath it, from somewhere beyond.`},
  {room:EARLY, target:'entrance',
    text:`The door you were led through. It was bricked shut while you were still blindfolded. The mortar is still damp.`},

  {room:EARLY, target:'inscription', requires:['lit'],
    text:`Carved above the bricked door: NONE RETURN THE WAY THEY CAME.`},
  {room:EARLY, target:'inscription',
    text:`Letters are carved above the bricked door. In the dark you trace them with your fingers: NONE RETURN THE WAY THEY CAME.`},

  {room:EARLY, target:'slab', requires:['slab','keyTaken'],
    text:`The stone lies to one side. The hollow beneath it is empty now.`},
  {room:EARLY, target:'slab', requires:['slab'],
    text:`The stone lies to one side. Something glints in the hollow beneath.`},
  {room:EARLY, target:'slab', requires:['lit'],
    text:`One floor stone is cut differently from the rest, with a square carved into its face. It sits a finger's width proud of the floor. Far too heavy to lift by hand.`},
  {room:EARLY, target:'slab',
    text:`Your foot catches on an uneven stone in the floor.`},

  {room:EARLY, target:'bar', sets:['barTaken'], effects:[{give:'bar'}, {log:'Took the iron bar.'}],
    text:`A rusted iron bar leans in the corner, one end hammered flat. You take it.`},
  {room:EARLY, target:'key', sets:['keyTaken'], effects:[{give:'key'}, {log:'Took the iron key.'}],
    text:`An iron key, cold and heavy, lies in the hollow. You take it.`},

  /* --- Room 2: the Hall of Instruction --- */
  {room:EARLY, target:'book', requires:['!dust'], sets:['dust'], effects:[{learn:'HAL'}],
    text:`A heavy book lies on the lectern under a thick layer of dust. You draw a breath and blow. The dust lifts away in a cloud, and as your breath leaves you, it carries a word: HAL.`},
  {room:EARLY, target:'book',
    text:`The book reads: "Each root names a thing. Each action shapes it. Speak them together and the thing will answer. Light, stone and breath are the Apprentice's roots; to open, to reveal and to bind, his actions."`},

  {room:EARLY, target:'statue', requires:['!veil'], sets:['veil'], effects:[{learn:'SE'}],
    text:`You draw the black veil away. Beneath stands a carved Apprentice, eyes open, holding a coil of cord in both hands. As what was hidden is laid bare, a word comes to you: SE.`},
  {room:EARLY, target:'statue', requires:['cordTaken'],
    text:`A carved Apprentice, eyes open. His hands are empty now.`},
  {room:EARLY, target:'statue',
    text:`A carved Apprentice, eyes open. He holds a coil of cord in both hands.`},

  {room:EARLY, target:'cord', sets:['cordTaken'], effects:[{give:'cord'}, {log:'Took the cable-tow.'}],
    text:`You lift the coil of cord from the statue's hands. A cable-tow: the cord an Apprentice is led by.`},

  {room:EARLY, target:'bell', requires:['!tied'],
    text:`A bell hangs high on the wall. Its rope has been cut off far out of reach.`},
  {room:EARLY, target:'bell', requires:['!rung'], sets:['rung'], effects:[{sound:'bell'}, {log:'Rang the bell.'}],
    text:`You pull the cord. The bell sounds once, twice, three times. Beyond the great door, bolts draw back, one after another.`},
  {room:EARLY, target:'bell',
    text:`The bell has done its work.`},

  {room:EARLY, target:'lodgeDoor', requires:['rung'], text:``},
  {room:EARLY, target:'lodgeDoor',
    text:`A great double door, marked with the square and compass. It is bolted from the other side. Someone beyond must open it.`},

  /* --- Room 3: the Apprentice's Chamber (and any room, for hotspots not listed above) --- */
  {target:'board', requires:['board'],
    text:`The tracing board now reads: LIGHT WHERE THERE IS NONE · HEAR WHAT WAS LEFT · GIVE THE STONE ITS VOICE.`},
  {target:'board',
    text:`A tracing board hangs above the altar. Whatever was written on it has faded almost to nothing.`},
  {target:'altar',
    text:`A plain stone altar. Three squares and three circles are cut into its face: the sigils of the six syllables you know.`},
  {target:'candles',
    text:`Two candles. Their light barely reaches past the altar.`},
  {target:'pillarL',
    text:`One of two great pillars, each crowned with a globe. The initiate walks between them.`},
  {target:'pillarR',
    text:`The second pillar, its globe carved with faint lines like a map of the heavens.`},
  {target:'door',
    text:`A great stone door. Every seam between its stones runs toward the carved mouth at its center.`},
  {target:'mouth', requires:['seal'],
    text:`The ring of sigils around the mouth is broken. The stones are no longer held.`},
  {target:'mouth',
    text:`A carved mouth, lips parted, inside a ring of glowing sigils. It looks as if it is waiting to be spoken into.`},
  {target:'sconce', requires:['sconce'],
    text:`Light burns in the sconce, bound there by your word.`},
  {target:'sconce',
    text:`An iron sconce beside the alcove, made to hold a light. There is no candle in it, and no oil.`},
  {target:'alcove', requires:['sconce'],
    text:`A shallow alcove. A spiral is carved into its back wall.`},
  {target:'alcove',
    text:`The alcove is too dark to see into.`},
  {target:'whisper', requires:['breath|seal'],
    text:`The spiral is still now. Whatever lingered here, you have taken with you.`},
  {target:'whisper', requires:['whisper'],
    text:`The words still hang around the spiral, fading slowly.`},
  {target:'whisper',
    text:`A carved spiral. The air around it seems to stir, as if something was once said here.`}
];
