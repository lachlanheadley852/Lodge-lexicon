/*
 * Degree I: what happens when a word is spoken at a hotspot.
 * Rules are checked top to bottom; the first match wins. See README.md for the fields.
 * Anything not matched here falls through to the plain replies in generic1.js.
 * In Degree I there are no modifiers, so every word ends in -* (any modifier).
 */
export default [
  /* --- the tracing board --- */
  {target:'board', word:'LUM-SE-*', requires:['board'],
    text:`The inscription glows again: LIGHT WHERE THERE IS NONE · HEAR WHAT WAS LEFT · GIVE THE STONE ITS VOICE.`},
  {target:'board', word:'LUM-SE-*', sets:['board'],
    text:`Gold light spreads across the tracing board, and faded letters rise from the wood: LIGHT WHERE THERE IS NONE · HEAR WHAT WAS LEFT · GIVE THE STONE ITS VOICE.`},

  /* --- the sconce and the alcove --- */
  {target:'sconce', word:'LUM-TU-*', requires:['sconce'],
    text:`The light is already bound here. It burns steadily.`},
  {target:'sconce', word:'LUM-TU-*', sets:['sconce'],
    text:`Threads of gold wind around the empty sconce, and the light stays, steady as a flame. The alcove is no longer dark.`},
  {target:'sconce', word:'LUM-SE-*', requires:['!sconce'],
    text:`Light flares in the empty cup for a moment, showing how it was made: a vessel for a light that does not burn on oil.`},
  {target:'alcove', word:'LUM-SE-*', requires:['!sconce'],
    text:`Light spreads into the alcove for a breath, showing a carved spiral on the back wall, then the dark swallows it again. The light needs to stay.`},
  {target:'alcove', word:'LUM-TU-*', requires:['!sconce'],
    text:`Light clings to the dark stone and slips off. It needs something made to hold it, like the empty sconce beside the alcove.`},
  {target:'alcove', word:'HAL-SE-*', requires:['!sconce'],
    text:`Somewhere in the dark, a whisper stirs, but you cannot find where it comes from. You need to see.`},

  /* --- the spiral: hear the whisper, then hold it --- */
  {target:'whisper', word:'HAL-SE-*', requires:['breath|seal'],
    text:`Only silence now. You already carry the voice that was here.`},
  {target:'whisper', word:'HAL-SE-*', sets:['whisper'],
    text:`Pale breath curls from the spiral, and a voice that is not yours whispers: "Let the stone hear the one who came before." The words hang in the air, fading.`},
  {target:'whisper', word:'HAL-TU-*', requires:['breath|seal'],
    text:`There is nothing left here to hold.`},
  {target:'whisper', word:'HAL-TU-*', requires:['!whisper'],
    text:`Your breath knots around the spiral, but there is nothing in it. Something here must first be heard.`},
  {target:'whisper', word:'HAL-TU-*', sets:['breath'],
    text:`Threads of pale breath wind around the lingering whisper and draw it into a small glowing knot. You carry the old voice with you.`},
  {target:'whisper', word:'LUM-SE-*',
    text:`Light fills the spiral's grooves. They are worn smooth, as if breath has passed over them for centuries.`},

  /* --- the carved mouth: release the held breath --- */
  {target:'mouth', word:'HAL-PA-*', requires:['seal'],
    text:`The mouth is silent. It has already heard what it needed.`},
  {target:'mouth', word:'HAL-PA-*', requires:['breath'], sets:['seal'], clears:['breath'],
    text:`You release the knot of breath into the carved mouth. The old voice speaks from inside the stone, and the ring of sigils cracks and falls away.`},
  {target:'mouth', word:'HAL-PA-*',
    text:`Your own breath flows into the carved mouth. The sigils flicker and stay. It does not know your voice.`},
  {target:'mouth', word:'HAL-SE-*', requires:['seal'],
    text:`Silence in the stone.`},
  {target:'mouth', word:'HAL-SE-*',
    text:`From deep in the stone comes the faint echo of a voice, waiting. The mouth wants to be spoken into, but not by you.`},
  {target:'mouth', word:'HAL-TU-*',
    text:`Your breath knots around the carved lips and fades. The mouth has nothing to give; it is waiting to receive.`},

  /* --- the stone door --- */
  {target:['door','mouth'], word:'KEL-PA-*', requires:['!seal'],
    text:`The stones shift and grind, then settle back. Something holds them: every seam runs to the sealed mouth.`},
  {target:['door','mouth'], word:'KEL-PA-*', sets:['door'], effects:[{fanfare:true}],
    text:`The stones of the door split down the middle and grind apart. Warm light pours in from a stair beyond.`},
  {target:['door','mouth'], word:'KEL-SE-*', requires:['seal'],
    text:`The outlines of the stones glow. Nothing holds them now.`},
  {target:['door','mouth'], word:'KEL-SE-*',
    text:`The outline of every stone glows, and you see what binds them: all the seams meet at the carved mouth, which is sealed like a lock waiting for a voice.`},
  {target:['door','mouth'], word:'KEL-TU-*',
    text:`The stones lock even tighter together. That is the opposite of what you want.`},

  /* --- earlier rooms --- */
  {target:'entrance', word:'KEL-PA-*',
    text:`The bricks shudder and dust sifts from the mortar, but they hold. NONE RETURN THE WAY THEY CAME. Whatever sealed this door was stronger than your word.`},
  {target:'entrance', word:'KEL-SE-*',
    text:`Lines of force glow in the bricks. They are bound by something more than mortar.`},
  {target:'vitriol', word:'LUM-SE-*',
    text:`The letters glow. Beneath V.I.T.R.I.O.L., fainter words appear for a moment: the hidden stone is not only in the floor.`},
  {target:'book', word:'LUM-SE-*',
    text:`Light runs across the pages. In the margin, in a different hand, someone has written: "Not all of it is here."`},
  {target:'lodgeDoor', word:'KEL-PA-*',
    text:`The great door is wood, not stone, and bolted from the other side. Your word finds nothing to move.`},
  {target:'bell', word:'HAL-SE-*',
    text:`The bell hums faintly with the echo of every time it has been rung.`},

  /* --- doorways --- */
  {target:['toHall','toReflection','toLodge','toHall2'],
    text:`The word drifts through the doorway and fades.`},
  {target:'doorway',
    text:`The word drifts up the stair ahead of you. The way is open; you only need to walk through.`},
  {target:'board', word:'KEL-SE-*',
    text:`The tracing board is wood, not stone. Your word slides off it.`}
];
