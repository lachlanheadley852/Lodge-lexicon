/* Static game data: syllables, items, hotspot names, chapter text. No DOM, no audio. */
export const SYL={
  LUM:{type:'root',meaning:'light',dark:'darkness',color:'#f2c25a',freq:659,ch:1},
  KEL:{type:'root',meaning:'stone',dark:'ruin',color:'#c8b08a',freq:131,ch:1},
  HAL:{type:'root',meaning:'breath, voice',dark:'silence',color:'#cfe6ff',freq:392,ch:1},
  MIR:{type:'root',meaning:'water, truth',dark:'illusion',color:'#6fd0e2',freq:523,ch:2},
  RAS:{type:'root',meaning:'flame, heat',dark:'cold, ash',color:'#ff8a3d',freq:196,ch:2},
  VEL:{type:'root',meaning:'memory',dark:'forgetting',color:'#d9b98a',freq:349,ch:2},
  SE:{type:'action',meaning:'reveal',dark:'conceal',ch:1},
  TU:{type:'action',meaning:'bind',dark:'loose',ch:1},
  PA:{type:'action',meaning:'open',dark:'shut',ch:1},
  MO:{type:'action',meaning:'still',dark:'stir',ch:2},
  NE:{type:'action',meaning:'mend',dark:'sever',ch:2},
  KA:{type:'action',meaning:'carry',dark:'drop',ch:2},
  ON:{type:'mod',meaning:'stronger',dark:'weaker',ch:2},
  ES:{type:'mod',meaning:'far',dark:'near',ch:2}
};
/*
 * `dark` above is the first-pass meaning a syllable flips to when it carries the Lost Word (HANDOFF section 2).
 * Syllables that do not exist yet (Degree III) are recorded here only; they are NOT playable:
 *   ZOR (root) decay, -IM (modifier) another, -UL (modifier) fleeting.
 */
export const DARK_PENDING={ZOR:'decay',IM:'another',UL:'fleeting'};
export const NAMES={board:'the tracing board',altar:'the altar',candles:'the candles',pillarL:'the left pillar',pillarR:'the right pillar',
  door:'the stone door',mouth:'the carved mouth',doorway:'the open doorway',entrance:'the bricked entrance',inscription:'the inscription',
  sconce:'the empty sconce',alcove:'the alcove',whisper:'the carved spiral',
  skull:'the skull',candle:'the candle',hourglass:'the hourglass',bread:'the bread and water',vitriol:'the carved letters',innerdoor:'the inner door',
  slab:'the floor stone',bar:'the iron bar',key:'the key',book:'the book',statue:'the statue',cord:'the cord',bell:'the bell',lodgeDoor:'the great door',
  toHall:'the doorway',toReflection:'the doorway',toLodge:'the doorway',toHall2:'the doorway',
  veil:'the water veil',crown:'the carved crown',chasm:'the chasm',brazier:'the far brazier',inner:'the inner door',stair:'the winding stair',
  basin:'the basin',mirrorText:'the backwards letters'};
export const CH={
  1:{title:'Degree I · The Apprentice',total:9,start:'The blindfold is gone. You are alone in a small, dark room. Behind you, the door you were led through has already been bricked shut. A thin line of light shows under a door to the east.'},
  2:{title:'Degree II · The Fellowcraft',total:108,start:'You stand at the top of the winding stair. Ahead, a curtain of water falls across an arch, between one whole pillar and one broken one.'}
};

/* Items the player can carry. Icons live in the UI (src/ui/icons.js). */
export const ITEMS={
  flint:{name:'Flint',desc:'sharp, grey'},
  bar:{name:'Iron bar',desc:'rusted, flat-ended'},
  key:{name:'Iron key',desc:'cold, heavy'},
  cord:{name:'Cable-tow',desc:'a coil of cord'}
};

/* View index 0..3 is North, East, South, West. */
export const DIRS=['North','East','South','West'];
export const ROOM_NAMES={
  reflection:'The Chamber of Reflection',
  hall:'The Hall of Instruction',
  apprentice:"The Apprentice's Chamber",
  middle:'The Middle Chamber'
};

/* Hotspot id -> [room, view] for doorways that move the player. */
export const TRAVEL={toHall:['hall',0],toReflection:['reflection',1],toLodge:['apprentice',0],toHall2:['hall',0]};
