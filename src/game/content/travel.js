/*
 * What you read on arriving in a room (which hotspot goes where is TRAVEL in ../data.js).
 * `room` is the room you arrive in. Checked top to bottom; the first match wins.
 * First visits set a flag so that later visits can be shorter.
 */
export default [
  {room:'hall', requires:['hallSeen'],
    text:`You are back in the Hall of Instruction.`},
  {room:'hall', sets:['hallSeen'],
    text:`You step into a long hall. A lectern stands before a great double door. Something veiled waits to the east, and a bell hangs high on the west wall.`},
  {room:'reflection',
    text:`You step back into the small room where you began.`},
  {room:'apprentice', requires:['appSeen'],
    text:`You are back in the Apprentice's Chamber.`},
  {room:'apprentice', sets:['appSeen'],
    text:`You enter the Apprentice's Chamber. Candlelight, two great pillars, and a faded tracing board above the altar. The door behind you stays open. This time, the way back is not sealed.`}
];
