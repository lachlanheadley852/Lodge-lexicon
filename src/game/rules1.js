/* Degree I puzzle logic: item interactions, hotspot descriptions, spoken-word results. No DOM, no audio. */
import {S, give, takeAway, learn, addLog} from './state.js';
import {NAMES} from './data.js';
import {emit} from './events.js';

export function interactEarly(t){
  const f=S.f;
  const L={
    skull:()=>{ if(!f.flint){ f.flint=true; give('flint'); addLog('Took the flint from the skull.'); return f.lit?'Something hard is wedged between the skull\'s teeth. You work it free: a flint.':'In the dark, your hands find something smooth and cold on a table: a skull. Something hard is wedged between its teeth. You work it free: a flint.'; }
      return 'A human skull, set on the table to remind whoever waits here that every life ends.'; },
    candle:()=>f.lit?'The candle burns steadily. It is the only light in the room.':(f.flint?'A stub of candle in an iron holder. The flint might light it.':'Your fingers find a stub of candle in an iron holder. You have nothing to light it with.'),
    hourglass:()=>f.lit?'An hourglass. All the sand has run through. Your time of waiting is over.':'Something of glass and wood. You can\'t make it out in the dark.',
    bread:()=>f.lit?'A crust of bread and a bowl of water. The fare of one who has come to reflect.':'Something soft, and a bowl of water. You leave them be.',
    vitriol:()=>f.lit?'Letters cut into the wall: V.I.T.R.I.O.L. Below, smaller: Visit the interior of the earth, and by rectifying you will find the hidden stone.':'Letters are cut into the wall, but it is too dark to read them.',
    innerdoor:()=>'A heavy wooden door, locked. Light leaks in beneath it, from somewhere beyond.',
    entrance:()=>'The door you were led through. It was bricked shut while you were still blindfolded. The mortar is still damp.',
    inscription:()=>f.lit?'Carved above the bricked door: NONE RETURN THE WAY THEY CAME.':'Letters are carved above the bricked door. In the dark you trace them with your fingers: NONE RETURN THE WAY THEY CAME.',
    slab:()=>f.slab?(f.keyTaken?'The stone lies to one side. The hollow beneath it is empty now.':'The stone lies to one side. Something glints in the hollow beneath.'):f.lit?'One floor stone is cut differently from the rest, with a square carved into its face. It sits a finger\'s width proud of the floor. Far too heavy to lift by hand.':'Your foot catches on an uneven stone in the floor.',
    bar:()=>{ f.barTaken=true; give('bar'); addLog('Took the iron bar.'); return 'A rusted iron bar leans in the corner, one end hammered flat. You take it.'; },
    key:()=>{ f.keyTaken=true; give('key'); addLog('Took the iron key.'); return 'An iron key, cold and heavy, lies in the hollow. You take it.'; },
    book:()=>{ if(!f.dust){ f.dust=true; learn('HAL'); return 'A heavy book lies on the lectern under a thick layer of dust. You draw a breath and blow. The dust lifts away in a cloud, and as your breath leaves you, it carries a word: HAL.'; }
      return 'The book reads: "Each root names a thing. Each action shapes it. Speak them together and the thing will answer. Light, stone and breath are the Apprentice\'s roots; to open, to reveal and to bind, his actions."'; },
    statue:()=>{ if(!f.veil){ f.veil=true; learn('SE'); return 'You draw the black veil away. Beneath stands a carved Apprentice, eyes open, holding a coil of cord in both hands. As what was hidden is laid bare, a word comes to you: SE.'; }
      return 'A carved Apprentice, eyes open. '+(f.cordTaken?'His hands are empty now.':'He holds a coil of cord in both hands.'); },
    cord:()=>{ f.cordTaken=true; give('cord'); addLog('Took the cable-tow.'); return 'You lift the coil of cord from the statue\'s hands. A cable-tow: the cord an Apprentice is led by.'; },
    bell:()=>{ if(!f.tied) return 'A bell hangs high on the wall. Its rope has been cut off far out of reach.';
      if(!f.rung){ f.rung=true; emit('sound',{name:'bell'}); addLog('Rang the bell.'); S.fanfare=false; return 'You pull the cord. The bell sounds once, twice, three times. Beyond the great door, bolts draw back, one after another.'; }
      return 'The bell has done its work.'; },
    lodgeDoor:()=>f.rung?'':'A great double door, marked with the square and compass. It is bolted from the other side. Someone beyond must open it.'
  };
  return L[t]?L[t]():null;
}
export function useItem(k,t){
  const f=S.f, n=NAMES[t]||'that';
  if(k==='flint'){
    if(t==='candle'&&!f.lit){ f.lit=true; takeAway('flint'); learn('LUM'); addLog('Lit the candle.'); return 'You strike the flint against the iron holder. Sparks catch the wick, and as the flame rises, a word rises with it, as if the light itself had spoken: LUM.'; }
    if(t==='candle') return 'The candle is already lit.';
    return 'You strike the flint. Sparks scatter and die.';
  }
  if(k==='bar'){
    if(t==='slab'){ if(!f.lit) return 'It is too dark to see where to set the bar.'; if(f.slab) return 'The stone has already been moved.';
      f.slab=true; takeAway('bar'); emit('sound',{name:'thud'}); learn('KEL'); addLog('Lifted the floor stone.'); return 'You wedge the flat end of the bar under the stone and heave. It grinds aside, and its weight settles into you as a word, heavy and certain: KEL. In the hollow beneath, something glints.'; }
    if(t==='entrance') return 'You strike the bricks with the bar. Mortar dust falls, but they don\'t move. None return the way they came.';
    if(t==='innerdoor') return 'You try to force the door with the bar. The wood groans, but the lock holds.';
    if(t==='skull') return 'You think better of it.';
    return `The bar is no use on ${n}.`;
  }
  if(k==='key'){
    if(t==='innerdoor'){ f.open1=true; takeAway('key'); learn('PA'); addLog('Unlocked the inner door.'); return 'The key turns with a heavy clunk. As the door swings open and light spills in, a word comes to you: PA.'; }
    if(t==='entrance') return 'There is no lock here. Only bricks.';
    if(t==='lodgeDoor') return 'There is no keyhole on this side. It is bolted from within.';
    return `The key doesn\'t fit anything on ${n}.`;
  }
  if(k==='cord'){
    if(t==='bell'){ f.tied=true; takeAway('cord'); learn('TU'); addLog('Tied the cord to the bell.'); return 'You climb onto the bench and knot the cable-tow to the cut end of the bell-rope. As the knot pulls tight, a word binds itself to you: TU.'; }
    if(t==='lodgeDoor') return 'There is nothing to tie the cord to.';
    return `You can\'t think of a reason to tie the cord to ${n}.`;
  }
  return 'That does nothing.';
}

/* ================= DEGREE I: room 3 (words) ================= */
const G1={
  LUMSE:n=>`Light spreads over ${n}. Nothing hidden shows itself.`,
  LUMTU:n=>`Light clings to ${n} for a moment, then slips away. It needs something made to hold it.`,
  LUMPA:n=>`Light parts around ${n} like a curtain, then closes. Nothing here is shut by light.`,
  KELSE:n=>`Faint lines trace the stone around ${n}. Solid, plain masonry.`,
  KELTU:n=>`The stone around ${n} grips tighter. Nothing needed holding.`,
  KELPA:n=>`The stones near ${n} shudder, but there is no opening here to make.`,
  HALSE:n=>`You hear only the echo of your own breath around ${n}.`,
  HALTU:n=>`Your breath knots into a pale thread and fades. There is no voice near ${n} to hold.`,
  HALPA:n=>S.f.breath?`You almost release the old voice at ${n}, then hold it back. It belongs somewhere that is listening.`:`Your breath flows out toward ${n} and scatters.`
};
export function look1(t){
  const f=S.f;
  return {
    board:f.board?'The tracing board now reads: LIGHT WHERE THERE IS NONE · HEAR WHAT WAS LEFT · GIVE THE STONE ITS VOICE.':'A tracing board hangs above the altar. Whatever was written on it has faded almost to nothing.',
    altar:'A plain stone altar. Three squares and three circles are cut into its face: the sigils of the six syllables you know.',
    candles:'Two candles. Their light barely reaches past the altar.',
    pillarL:'One of two great pillars, each crowned with a globe. The initiate walks between them.',
    pillarR:'The second pillar, its globe carved with faint lines like a map of the heavens.',
    door:'A great stone door. Every seam between its stones runs toward the carved mouth at its center.',
    mouth:f.seal?'The ring of sigils around the mouth is broken. The stones are no longer held.':'A carved mouth, lips parted, inside a ring of glowing sigils. It looks as if it is waiting to be spoken into.',
    sconce:f.sconce?'Light burns in the sconce, bound there by your word.':'An iron sconce beside the alcove, made to hold a light. There is no candle in it, and no oil.',
    alcove:f.sconce?'A shallow alcove. A spiral is carved into its back wall.':'The alcove is too dark to see into.',
    whisper:(f.breath||f.seal)?'The spiral is still now. Whatever lingered here, you have taken with you.':f.whisper?'The words still hang around the spiral, fading slowly.':'A carved spiral. The air around it seems to stir, as if something was once said here.'
  }[t];
}
export function resolve1(r,a,m,t){
  const w=r+a, f=S.f, n=NAMES[t]||'the empty air';
  if(t==='board'&&w==='LUMSE'){ const was=f.board; f.board=true; return (was?'The inscription glows again':'Gold light spreads across the tracing board, and faded letters rise from the wood')+': LIGHT WHERE THERE IS NONE · HEAR WHAT WAS LEFT · GIVE THE STONE ITS VOICE.'; }
  if(t==='sconce'&&w==='LUMTU'){ if(f.sconce) return 'The light is already bound here. It burns steadily.'; f.sconce=true; return 'Threads of gold wind around the empty sconce, and the light stays, steady as a flame. The alcove is no longer dark.'; }
  if(t==='sconce'&&w==='LUMSE'&&!f.sconce) return 'Light flares in the empty cup for a moment, showing how it was made: a vessel for a light that does not burn on oil.';
  if(t==='alcove'&&!f.sconce){
    if(w==='LUMSE') return 'Light spreads into the alcove for a breath, showing a carved spiral on the back wall, then the dark swallows it again. The light needs to stay.';
    if(w==='LUMTU') return 'Light clings to the dark stone and slips off. It needs something made to hold it, like the empty sconce beside the alcove.';
    if(w==='HALSE') return 'Somewhere in the dark, a whisper stirs, but you cannot find where it comes from. You need to see.';
  }
  if(t==='whisper'){
    if(w==='HALSE'){ if(f.breath||f.seal) return 'Only silence now. You already carry the voice that was here.'; f.whisper=true; return 'Pale breath curls from the spiral, and a voice that is not yours whispers: "Let the stone hear the one who came before." The words hang in the air, fading.'; }
    if(w==='HALTU'){ if(f.breath||f.seal) return 'There is nothing left here to hold.'; if(!f.whisper) return 'Your breath knots around the spiral, but there is nothing in it. Something here must first be heard.'; f.breath=true; return 'Threads of pale breath wind around the lingering whisper and draw it into a small glowing knot. You carry the old voice with you.'; }
    if(w==='LUMSE') return 'Light fills the spiral\'s grooves. They are worn smooth, as if breath has passed over them for centuries.';
  }
  if(t==='mouth'){
    if(w==='HALPA'){ if(f.seal) return 'The mouth is silent. It has already heard what it needed.';
      if(f.breath){ f.seal=true; f.breath=false; return 'You release the knot of breath into the carved mouth. The old voice speaks from inside the stone, and the ring of sigils cracks and falls away.'; }
      return 'Your own breath flows into the carved mouth. The sigils flicker and stay. It does not know your voice.'; }
    if(w==='HALSE') return f.seal?'Silence in the stone.':'From deep in the stone comes the faint echo of a voice, waiting. The mouth wants to be spoken into, but not by you.';
    if(w==='HALTU') return 'Your breath knots around the carved lips and fades. The mouth has nothing to give; it is waiting to receive.';
  }
  if(t==='door'||t==='mouth'){
    if(w==='KELPA'){ if(!f.seal) return 'The stones shift and grind, then settle back. Something holds them: every seam runs to the sealed mouth.'; f.door=true; S.fanfare=true; return 'The stones of the door split down the middle and grind apart. Warm light pours in from a stair beyond.'; }
    if(w==='KELSE') return f.seal?'The outlines of the stones glow. Nothing holds them now.':'The outline of every stone glows, and you see what binds them: all the seams meet at the carved mouth, which is sealed like a lock waiting for a voice.';
    if(w==='KELTU') return 'The stones lock even tighter together. That is the opposite of what you want.';
  }
  /* earlier rooms */
  if(t==='entrance'){
    if(w==='KELPA') return 'The bricks shudder and dust sifts from the mortar, but they hold. NONE RETURN THE WAY THEY CAME. Whatever sealed this door was stronger than your word.';
    if(w==='KELSE') return 'Lines of force glow in the bricks. They are bound by something more than mortar.';
  }
  if(t==='vitriol'&&w==='LUMSE') return 'The letters glow. Beneath V.I.T.R.I.O.L., fainter words appear for a moment: the hidden stone is not only in the floor.';
  if(t==='book'&&w==='LUMSE') return 'Light runs across the pages. In the margin, in a different hand, someone has written: "Not all of it is here."';
  if(t==='lodgeDoor'&&w==='KELPA') return 'The great door is wood, not stone, and bolted from the other side. Your word finds nothing to move.';
  if(t==='bell'&&w==='HALSE') return 'The bell hums faintly with the echo of every time it has been rung.';
  if(t&&t.startsWith('to')) return 'The word drifts through the doorway and fades.';
  if(t==='doorway') return 'The word drifts up the stair ahead of you. The way is open; you only need to walk through.';
  if(t==='board'&&w==='KELSE') return 'The tracing board is wood, not stone. Your word slides off it.';
  return G1[w](n);
}
