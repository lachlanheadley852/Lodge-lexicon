/*
 * Degree I: the plain reply for a word that no rule in words1.js matched.
 * One entry per word (3 roots x 3 actions); {n} is the name of what the word was spoken at.
 * Same rule format as words1.js (so a reply can depend on a flag), checked in order.
 */
export default [
  {word:'LUM-SE-*', text:`Light spreads over {n}. Nothing hidden shows itself.`},
  {word:'LUM-TU-*', text:`Light clings to {n} for a moment, then slips away. It needs something made to hold it.`},
  {word:'LUM-PA-*', text:`Light parts around {n} like a curtain, then closes. Nothing here is shut by light.`},
  {word:'KEL-SE-*', text:`Faint lines trace the stone around {n}. Solid, plain masonry.`},
  {word:'KEL-TU-*', text:`The stone around {n} grips tighter. Nothing needed holding.`},
  {word:'KEL-PA-*', text:`The stones near {n} shudder, but there is no opening here to make.`},
  {word:'HAL-SE-*', text:`You hear only the echo of your own breath around {n}.`},
  {word:'HAL-TU-*', text:`Your breath knots into a pale thread and fades. There is no voice near {n} to hold.`},
  {word:'HAL-PA-*', requires:['breath'], text:`You almost release the old voice at {n}, then hold it back. It belongs somewhere that is listening.`},
  {word:'HAL-PA-*', text:`Your breath flows out toward {n} and scatters.`}
];
