import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as G from '../src/game/index.js';
import {begin, castWord, use} from './helpers.js';

const has=k=>G.S.known.has(k);

test('Degree I: the full solution path reaches the ending', ()=>{
  const h=begin(1);
  assert.equal(G.S.room,'reflection');
  assert.equal(G.S.known.size,0);

  G.interact('skull');
  assert.ok(G.S.f.flint); assert.ok(G.S.inv.includes('flint'));

  use('flint','candle');
  assert.ok(G.S.f.lit); assert.ok(has('LUM'));
  assert.ok(!G.S.inv.includes('flint'));

  G.interact('bar');
  assert.ok(G.S.f.barTaken); assert.ok(G.S.inv.includes('bar'));

  use('bar','slab');
  assert.ok(G.S.f.slab); assert.ok(has('KEL'));
  assert.ok(!G.S.inv.includes('bar'));

  G.interact('key');
  assert.ok(G.S.f.keyTaken); assert.ok(G.S.inv.includes('key'));

  use('key','innerdoor');
  assert.ok(G.S.f.open1); assert.ok(has('PA'));

  G.interact('toHall');
  assert.equal(G.S.room,'hall');

  G.interact('book');
  assert.ok(G.S.f.dust); assert.ok(has('HAL'));

  G.interact('statue');
  assert.ok(G.S.f.veil); assert.ok(has('SE'));

  G.interact('cord');
  assert.ok(G.S.f.cordTaken); assert.ok(G.S.inv.includes('cord'));

  use('cord','bell');
  assert.ok(G.S.f.tied); assert.ok(has('TU'));

  G.interact('bell');
  assert.ok(G.S.f.rung);

  G.interact('toLodge');
  assert.equal(G.S.room,'apprentice');

  castWord('LUM-SE','board');
  assert.ok(G.S.f.board);

  castWord('LUM-TU','sconce');
  assert.ok(G.S.f.sconce);

  castWord('HAL-SE','whisper');
  assert.ok(G.S.f.whisper); assert.ok(!G.S.f.breath);

  castWord('HAL-TU','whisper');
  assert.ok(G.S.f.breath);

  castWord('HAL-PA','mouth');
  assert.ok(G.S.f.seal); assert.ok(!G.S.f.breath);

  assert.equal(h.of('ending').length,0);
  castWord('KEL-PA','door');
  assert.ok(G.S.f.door);
  assert.equal(h.of('fanfare').length,1);

  G.interact('doorway');
  const ending=h.of('ending');
  assert.equal(ending.length,1);
  assert.equal(ending[0].ch,1);
  assert.equal(ending[0].hasNext,true);
  assert.equal(G.S.spoken,6);
  h.stop();
});

test('Degree II: the full solution path reaches the ending', ()=>{
  const h=begin(2);
  assert.equal(G.S.room,'middle');

  castWord('RAS-KA-ES','brazier');
  assert.ok(G.S.f.brazier);

  castWord('KEL-KA-ES','crown');
  assert.ok(G.S.f.crownHere);

  castWord('KEL-NE-ON','pillarR');
  assert.ok(G.S.f.pillar); assert.ok(!G.S.f.veilOpen);

  castWord('MIR-MO','veil');
  assert.ok(G.S.f.veilStill); assert.ok(!G.S.f.veilOpen);

  castWord('MIR-PA','veil');
  assert.ok(G.S.f.veilOpen);
  assert.equal(h.of('fanfare').length,1);

  assert.equal(h.of('ending').length,0);
  G.interact('doorway');
  const ending=h.of('ending');
  assert.equal(ending.length,1);
  assert.equal(ending[0].ch,2);
  assert.equal(ending[0].hasNext,false);
  assert.equal(G.S.spoken,5);
  h.stop();
});

test('Degree II: the order of the two halves does not matter (veil first, then pillar)', ()=>{
  const h=begin(2);
  castWord('MIR-MO','veil'); castWord('MIR-PA','veil');
  assert.ok(G.S.f.veilOpen);
  castWord('RAS-KA-ES','brazier'); castWord('KEL-KA-ES','crown'); castWord('KEL-NE-ON','pillarR');
  assert.ok(G.S.f.pillar);
  assert.equal(h.of('fanfare').length,1);
  h.stop();
});
