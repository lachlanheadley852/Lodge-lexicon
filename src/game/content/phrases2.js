/*
 * Degree II: phrase tables for the generated reply to a word no rule in words2.js matched.
 * The reply is built as  ACTION template (with the ROOT noun phrase) + MODIFIER tail.
 *   {R} = the root's noun phrase (ROOTS), {n} = what the word was spoken at.
 */
export const ROOTS={
  LUM:'Light', KEL:'The weight of stone', HAL:'Your breath', MIR:'A sheen of water', RAS:'Heat', VEL:'A ghost-image of the past'
};
export const ACTIONS={
  SE:`{R} spreads over {n}, but nothing hidden shows itself.`,
  TU:`{R} winds around {n} and slips away. Nothing here is made to hold it.`,
  PA:`{R} parts around {n}, but nothing here is shut.`,
  MO:`{R} settles over {n} and goes still. Nothing here was moving.`,
  NE:`{R} draws the seams of {n} together, but nothing here is broken.`,
  KA:`{R} gathers near {n} and drifts a little way, with nowhere to go.`
};
/* Special cases: a whole root+action pair with its own template (the modifier tail is still added). */
export const PAIRS={
  'VEL-SE':`{R} flickers over {n}, but nothing happened here worth remembering.`
};
/* A word carrying the Lost Word that nothing answered. {W} is built from the (flipped) meanings, e.g. "ruin, shut". */
export const INVERTED=`The word runs dark: {W}. Nothing at {n} answers it yet.`;
export const MODIFIERS={
  ON:` The word rings out doubled, but more of nothing is still nothing.`,
  ES:` The word reaches far, but distance was not what this needed.`
};
