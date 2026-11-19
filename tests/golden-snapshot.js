/*
 * Golden snapshot of everything the player can read.
 * buildSnapshot() drives the game logic through its public API and records the text and
 * side effects. tests/golden.test.js compares it byte-for-byte with tests/fixtures/golden.json.
 * Regenerate (only when a text change is intended): node scripts/make-golden.mjs
 */
import * as G from '../src/game/index.js';

const ITEM_KEYS = ['flint', 'bar', 'key', 'cord'];
const ALL_TARGETS = Object.keys(G.NAMES);
const TRAVEL_IDS = Object.keys(G.TRAVEL);

const WORDS1 = [];
for (const r of ['LUM', 'KEL', 'HAL']) for (const a of ['SE', 'TU', 'PA']) WORDS1.push([r, a, null]);
const WORDS2 = [];
for (const r of ['LUM', 'KEL', 'HAL', 'MIR', 'RAS', 'VEL'])
  for (const a of ['SE', 'TU', 'PA', 'MO', 'NE', 'KA']) for (const m of [null, 'ON', 'ES']) WORDS2.push([r, a, m]);

/* Hotspots that exist in each place (a flagged scenario probes only these plus empty air). */
const REFLECTION = ['skull', 'candle', 'hourglass', 'bread', 'vitriol', 'innerdoor', 'entrance', 'inscription', 'slab', 'bar', 'key'];
const HALL = ['book', 'statue', 'cord', 'bell', 'lodgeDoor'];
const APPRENTICE = ['board', 'altar', 'candles', 'pillarL', 'pillarR', 'door', 'mouth', 'sconce', 'alcove', 'whisper', 'entrance', 'doorway'];
const MIDDLE = ['veil', 'pillarL', 'pillarR', 'crown', 'chasm', 'brazier', 'inner', 'stair', 'inscription', 'basin', 'mirrorText', 'doorway'];

const sc = (ch, room, flags, targets) => ({ ch, room, flags, targets: targets || 'ALL' });
const SCENARIOS = [
  /* Fresh chapter, every hotspot, in each room of Degree I and in Degree II. */
  sc(1, 'reflection', []), sc(1, 'hall', []), sc(1, 'apprentice', []),
  sc(1, 'reflection', ['lit']), sc(1, 'apprentice', ['lit']), sc(2, 'middle', []),
  /* Degree I, room 1 states */
  ...[[], ['flint'], ['lit'], ['flint', 'lit'], ['lit', 'barTaken'], ['lit', 'slab'], ['slab'], ['lit', 'slab', 'keyTaken'],
    ['lit', 'slab', 'keyTaken', 'open1'], ['flint', 'lit', 'barTaken', 'slab', 'keyTaken', 'open1']]
    .map(f => sc(1, 'reflection', f, REFLECTION)),
  /* Degree I, room 2 states */
  ...[[], ['dust'], ['veil'], ['veil', 'cordTaken'], ['tied'], ['tied', 'rung'], ['rung'],
    ['dust', 'veil', 'cordTaken', 'tied', 'rung', 'lit', 'open1']]
    .map(f => sc(1, 'hall', f, HALL)),
  /* Degree I, room 3 states */
  ...[[], ['board'], ['sconce'], ['whisper'], ['sconce', 'whisper'], ['breath'], ['whisper', 'breath'], ['sconce', 'whisper', 'breath'],
    ['seal'], ['seal', 'door'], ['sconce', 'seal'], ['breath', 'seal'], ['sconce', 'board', 'breath', 'seal', 'door'],
    ['sconce', 'board', 'whisper', 'seal', 'door']]
    .map(f => sc(1, 'apprentice', f, APPRENTICE)),
  /* Degree II states */
  ...[['brazier'], ['crownHere'], ['brazier', 'crownHere'], ['brazier', 'crownHere', 'pillar'], ['pillar'], ['veilStill'],
    ['veilStill', 'veilOpen'], ['veilOpen'], ['read'], ['pillar', 'veilOpen'], ['pillar', 'veilStill'],
    ['brazier', 'crownHere', 'pillar', 'veilStill', 'veilOpen', 'read']]
    .map(f => sc(2, 'middle', f, MIDDLE))
];

const truthy = f => Object.keys(f).filter(k => f[k]).sort();

/* Run one probe from a prepared state and describe what changed as a short list of strings. */
function probe(ch, room, flags, act) {
  G.startChapter(ch);
  G.S.room = room;
  for (const k of flags) G.S.f[k] = true;
  G.S.inv = [...ITEM_KEYS];
  const before = { f: truthy(G.S.f), inv: [...G.S.inv], known: [...G.S.known], log: G.S.log.length, room: G.S.room, view: G.S.view };
  const ev = [];
  const stop = G.onEvent(e => ev.push(e));
  act();
  stop();
  const out = [];
  for (const e of ev) {
    if (e.type === 'say') out.push('say:' + e.html);
    else if (e.type === 'sound') out.push('sound:' + e.name);
    else if (e.type === 'learn') out.push('learn:' + e.syl + (e.first ? ':first' : '') + (e.extra ? ':' + e.extra : ''));
    else if (e.type === 'fanfare') out.push('fanfare:' + e.after);
    else if (e.type === 'ending') out.push('ending:' + JSON.stringify(e));
    else if (e.type === 'cast') out.push('cast:' + [e.root, e.action, e.mod, e.target].join(','));
    else if (e.type === 'changed') out.push('changed:' + e.reason);
  }
  const after = truthy(G.S.f);
  for (const k of after) if (!before.f.includes(k)) out.push('+' + k);
  for (const k of before.f) if (!after.includes(k)) out.push('-' + k);
  for (const k of G.S.inv) if (!before.inv.includes(k)) out.push('+inv:' + k);
  for (const k of before.inv) if (!G.S.inv.includes(k)) out.push('-inv:' + k);
  for (const k of G.S.known) if (!before.known.includes(k)) out.push('+known:' + k);
  for (const l of G.S.log.slice(before.log)) out.push('log:' + l);
  if (G.S.room !== before.room) out.push('room:' + G.S.room);
  if (G.S.view !== before.view) out.push('view:' + G.S.view);
  if (G.S.sel) out.push('sel:' + G.S.sel);
  return out;
}

/* Full-state description used on the solution paths. */
function stateOf(h) {
  return {
    room: G.S.room, view: G.S.view, flags: truthy(G.S.f), inv: [...G.S.inv], known: [...G.S.known].sort(),
    sel: G.S.sel, spoken: G.S.spoken, tried: [...G.S.tried].sort(), log: [...G.S.log],
    events: h.events.map(e => JSON.stringify(e))
  };
}

function walk(ch, steps) {
  const out = [];
  const events = [];
  G.startChapter(ch);
  const stop = G.onEvent(e => events.push(e));
  for (const [label, fn] of steps) {
    events.length = 0;
    fn();
    out.push({ step: label, ...stateOf({ events }) });
  }
  stop();
  return out;
}

const pick = (...ks) => { for (const k of ks) G.pickSyllable(k); };
const say = (text, t) => [`cast ${text} at ${t}`, () => { pick(...text.split('-')); G.cast(t); }];
const look = t => [`look ${t}`, () => G.interact(t)];
const useOn = (item, t) => [`use ${item} on ${t}`, () => { G.selectItem(item); G.useSelected(t); }];

const PATH1 = [
  look('skull'), look('skull'), look('candle'), useOn('flint', 'candle'), look('candle'), look('hourglass'), look('bread'),
  look('vitriol'), look('inscription'), look('entrance'), look('innerdoor'), look('slab'), look('bar'), useOn('bar', 'slab'),
  look('slab'), look('key'), look('slab'), useOn('key', 'innerdoor'), look('toHall'),
  look('lodgeDoor'), look('bell'), look('book'), look('book'), look('statue'), look('cord'), look('statue'), useOn('cord', 'bell'),
  look('bell'), look('bell'), look('lodgeDoor'), look('toLodge'),
  look('board'), say('LUM-SE', 'board'), look('board'), say('LUM-SE', 'board'),
  look('altar'), look('candles'), look('pillarL'), look('pillarR'), look('door'), look('mouth'),
  look('sconce'), look('alcove'), look('whisper'),
  say('LUM-TU', 'sconce'), look('sconce'), look('alcove'), say('LUM-TU', 'sconce'),
  say('HAL-SE', 'whisper'), look('whisper'), say('HAL-TU', 'whisper'), look('whisper'),
  say('HAL-PA', 'door'), say('HAL-PA', 'mouth'), look('mouth'), say('HAL-PA', 'mouth'),
  say('KEL-SE', 'door'), say('KEL-PA', 'door'), look('door'), look('mouth'), say('LUM-SE', 'doorway'), look('doorway'),
  ['finish', () => G.interact('doorway')]
];
const PATH2 = [
  look('veil'), look('pillarL'), look('pillarR'), look('crown'), look('chasm'), look('brazier'), look('inner'), look('stair'),
  look('inscription'), look('basin'), look('mirrorText'),
  say('RAS-KA', 'brazier'), say('RAS-KA-ON', 'brazier'), say('RAS-KA-ES', 'brazier'), say('RAS-KA-ES', 'brazier'), look('brazier'), look('crown'),
  say('KEL-KA', 'crown'), say('KEL-KA-ES', 'crown'), look('crown'), say('KEL-NE', 'pillarR'), say('KEL-NE-ON', 'pillarR'), look('pillarR'),
  say('MIR-PA', 'veil'), say('MIR-MO', 'veil'), look('veil'), say('MIR-PA', 'veil'), say('MIR-PA', 'veil'), look('veil'),
  look('inner'), look('doorway'), say('VEL-SE', 'pillarR'), say('MIR-SE', 'basin'), look('basin'),
  ['finish', () => G.interact('doorway')]
];
/* Second Degree II order: veil first, then the pillar (different fanfare / text variants). */
const PATH2B = [
  say('MIR-MO', 'veil'), say('MIR-PA-ON', 'veil'), say('MIR-PA', 'veil'), look('inner'),
  say('VEL-SE', 'pillarR'), say('KEL-SE', 'pillarR'), say('KEL-NE', 'pillarR'),
  say('RAS-KA-ES', 'chasm'), say('KEL-KA-ES', 'crown'), say('KEL-NE', 'crown'), say('KEL-NE-ES', 'pillarR'), say('KEL-NE-ON', 'crown'),
  look('pillarR'), look('crown'), look('inner'), say('VEL-SE', 'pillarR'), say('KEL-SE', 'pillarR'), say('KEL-KA', 'crown'),
  say('MIR-SE', 'mirrorText'), say('MIR-MO', 'basin'), say('LUM-SE', 'basin'), say('VEL-SE', 'basin'),
  ['finish', () => G.interact('doorway')]
];

export function buildSnapshot() {
  const table = [];
  const index = new Map();
  const intern = list => {
    const s = JSON.stringify(list);
    if (!index.has(s)) { index.set(s, table.length); table.push(list); }
    return index.get(s);
  };

  const scenarios = {};
  for (const s of SCENARIOS) {
    const targets = s.targets === 'ALL' ? ALL_TARGETS : s.targets;
    const open = s.ch === 1 ? !!s.flags.includes('door') : s.flags.includes('pillar') && s.flags.includes('veilOpen');
    const words = s.ch === 1 ? WORDS1 : WORDS2;
    const rows = {};
    const hot = [...targets, null];
    for (const t of hot) {
      const row = [];
      /* examine: travel hotspots are covered separately; the doorway ends the chapter so only when open */
      if (t !== null && !TRAVEL_IDS.includes(t) && (t !== 'doorway' || open))
        row.push(intern(probe(s.ch, s.room, s.flags, () => G.interact(t))));
      else row.push(-1);
      for (const it of ITEM_KEYS) row.push(intern(probe(s.ch, s.room, s.flags, () => { G.selectItem(it); G.useSelected(t); })));
      for (const [r, a, m] of words) row.push(intern(probe(s.ch, s.room, s.flags, () => { pick(r, a); if (m) pick(m); G.cast(t); })));
      rows[t === null ? '(air)' : t] = row;
    }
    scenarios[`ch${s.ch}/${s.room}/${s.flags.join('+') || 'fresh'}/${s.targets === 'ALL' ? 'all' : 'room'}`] = rows;
  }

  /* Travel arrival messages: first visit, repeat visit, and from each starting room. */
  const travel = {};
  for (const t of TRAVEL_IDS) {
    for (const seen of [[], ['hallSeen'], ['appSeen'], ['hallSeen', 'appSeen']])
      travel[`${t}/${seen.join('+') || 'none'}`] = probe(1, 'reflection', seen, () => G.interact(t));
  }
  /* Ending text for both degrees, from each room the way can be open in. */
  const endings = {
    ch1: probe(1, 'apprentice', ['door'], () => G.interact('doorway')),
    ch1_spoken: probe(1, 'apprentice', ['door'], () => { pick('KEL', 'PA'); G.cast('door'); pick('LUM', 'SE'); G.cast('door'); G.interact('doorway'); }),
    ch2: probe(2, 'middle', ['pillar', 'veilOpen'], () => G.interact('doorway')),
    ch2_one_word: probe(2, 'middle', ['pillar', 'veilOpen'], () => { pick('MIR', 'MO'); G.cast('veil'); G.interact('doorway'); })
  };
  /* Messages produced by the engine rather than the rule tables. */
  const misc = {
    selectFlint: probe(1, 'reflection', [], () => G.selectItem('flint')),
    selectKey: probe(1, 'reflection', [], () => G.selectItem('key')),
    putAway: probe(1, 'reflection', [], () => { G.selectItem('flint'); G.putAway(); }),
    start1: probe(1, 'reflection', [], () => G.startChapter(1)),
    start2: probe(2, 'middle', [], () => G.startChapter(2))
  };

  return {
    paths: { degree1: walk(1, PATH1), degree2: walk(2, PATH2), degree2b: walk(2, PATH2B) },
    travel, endings, misc, scenarios, results: table
  };
}
