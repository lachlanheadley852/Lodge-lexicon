/*
 * Other text the player reads that is not a reply to a puzzle: the end-of-degree screen, the item
 * hints, and when the way out of a degree counts as open.
 */

/* Holding an item: {item} is its lowercase name. */
export const HOLD_ITEM=`You hold the {item}. Click on something to use it there.`;
export const PUT_AWAY=`You put it away.`;

/* The end-of-degree screen. {room} is the room you leave (without "The"), {spoken} is the number
 * of words spoken ("1 word" / "2 words"), {tried} how many different words, {total} the possible words. */
export const ENDINGS={
  1:{title:`Degree I complete`,
    next:`The winding stair rises ahead, and with it three new roots, three new actions, and the first modifiers.`},
  2:{title:`Degree II complete`,
    next:`Beyond the inner door lies the Master's degree: ZOR, the modifiers -IM and -UL, and the last of the light words. (Not built yet.)`}
};
export const ENDING_STATS=`You leave the {room} having spoken {spoken}, {tried} of the {total} possible.`;

/* The hotspot 'doorway' only ends a degree when these flags are all set (otherwise it is just examined). */
export const WAY_OPEN={
  1:['door'],
  2:['pillar','veilOpen']
};
