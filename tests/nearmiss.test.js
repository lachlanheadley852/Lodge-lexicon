import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as G from '../src/game/index.js';
import {begin, castWord, use} from './helpers.js';

/* Near misses that guard the puzzle design. */

test('KEL-NE without -ON on the right pillar (crown present) does not mend it', ()=>{
  begin(2);
  castWord('RAS-KA-ES','brazier'); castWord('KEL-KA-ES','crown');
  assert.ok(G.S.f.crownHere);
  castWord('KEL-NE','pillarR');
  assert.ok(!G.S.f.pillar);
  castWord('KEL-NE-ES','pillarR');
  assert.ok(!G.S.f.pillar);
  castWord('KEL-NE-ON','pillarR');
  assert.ok(G.S.f.pillar);
});

test('KEL-NE-ON on the pillar before the crown is carried does not mend it', ()=>{
  begin(2);
  castWord('KEL-NE-ON','pillarR');
  assert.ok(!G.S.f.pillar);
});

test('RAS-KA without -ES at the brazier does not light it', ()=>{
  begin(2);
  castWord('RAS-KA','brazier');
  assert.ok(!G.S.f.brazier);
  castWord('RAS-KA-ON','brazier');
  assert.ok(!G.S.f.brazier);
  castWord('RAS-KA-ES','brazier');
  assert.ok(G.S.f.brazier);
});

test('KEL-KA without -ES does not bring the crown across the chasm', ()=>{
  begin(2);
  castWord('KEL-KA','crown');
  assert.ok(!G.S.f.crownHere);
});

test('MIR-PA before MIR-MO does not open the veil', ()=>{
  begin(2);
  castWord('MIR-PA','veil');
  assert.ok(!G.S.f.veilOpen);
  castWord('MIR-PA-ON','veil');
  assert.ok(!G.S.f.veilOpen);
  castWord('MIR-MO','veil');
  assert.ok(G.S.f.veilStill); assert.ok(!G.S.f.veilOpen);
  castWord('MIR-PA','veil');
  assert.ok(G.S.f.veilOpen);
});

test('Degree II: no ending event until the player walks through the doorway', ()=>{
  const h=begin(2);
  castWord('MIR-MO','veil'); castWord('MIR-PA','veil');
  assert.equal(h.of('ending').length,0);
});

/* Degree I: get to the apprentice chamber by the real route, then test the door. */
function toApprentice(){
  const h=begin(1);
  G.interact('skull'); use('flint','candle');
  G.interact('bar'); use('bar','slab'); G.interact('key'); use('key','innerdoor');
  G.interact('toHall'); G.interact('book'); G.interact('statue'); G.interact('cord');
  use('cord','bell'); G.interact('bell'); G.interact('toLodge');
  return h;
}

test('KEL-PA on the door before the seal is broken does not open it', ()=>{
  toApprentice();
  castWord('KEL-PA','door');
  assert.ok(!G.S.f.door);
  castWord('KEL-PA','mouth');
  assert.ok(!G.S.f.door);
});

test('HAL-PA at the mouth without the captured breath does not break the seal', ()=>{
  toApprentice();
  castWord('HAL-PA','mouth');
  assert.ok(!G.S.f.seal);
  castWord('HAL-TU','whisper');
  assert.ok(!G.S.f.breath);
  castWord('HAL-SE','whisper'); castWord('HAL-PA','mouth');
  assert.ok(!G.S.f.seal);
});

test('the bricked entrance never opens', ()=>{
  const h=begin(1);
  const before=JSON.stringify(G.S.f);
  for(const w of ['KEL-PA','KEL-SE','KEL-TU','LUM-PA','HAL-PA']) castWord(w,'entrance');
  G.interact('entrance');
  G.interact('inscription');
  assert.equal(JSON.stringify(G.S.f),before);
  G.S.inv.push('bar','key');
  use('bar','entrance'); use('key','entrance');
  assert.equal(JSON.stringify(G.S.f),before);
  assert.equal(G.S.room,'reflection');
  assert.equal(h.of('ending').length,0);
});

test('without light the slab cannot be moved with the bar', ()=>{
  begin(1);
  G.interact('bar'); use('bar','slab');
  assert.ok(!G.S.f.slab); assert.ok(!G.S.known.has('KEL'));
});

test('the bell cannot be rung before the cord is tied', ()=>{
  begin(1);
  G.interact('bell');
  assert.ok(!G.S.f.rung);
});
