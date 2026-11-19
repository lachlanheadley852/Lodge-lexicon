import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as G from '../src/game/index.js';
import {begin, castWord} from './helpers.js';

/* The doorway only ends a degree once the way is open, so a room can never let the player skip a puzzle. */

test('Degree I: the doorway does not end the degree until the stone door is open', ()=>{
  const h=begin(1);
  G.interact('doorway');
  assert.equal(h.of('ending').length,0);
  assert.equal(h.of('fanfare').length,0);
  G.S.f.seal=true; /* near miss: seal broken, door not yet opened */
  G.interact('doorway');
  assert.equal(h.of('ending').length,0);
  G.S.f.door=true;
  G.interact('doorway');
  assert.equal(h.of('ending').length,1);
  h.stop();
});

test('Degree II: the doorway needs both the pillar and the veil', ()=>{
  const h=begin(2);
  G.interact('doorway');
  assert.equal(h.of('ending').length,0);
  castWord('MIR-MO','veil'); castWord('MIR-PA','veil');
  assert.ok(G.S.f.veilOpen); assert.ok(!G.S.f.pillar);
  G.interact('doorway');
  assert.equal(h.of('ending').length,0);

  const h2=begin(2);
  castWord('RAS-KA-ES','brazier'); castWord('KEL-KA-ES','crown'); castWord('KEL-NE-ON','pillarR');
  assert.ok(G.S.f.pillar); assert.ok(!G.S.f.veilOpen);
  G.interact('doorway');
  assert.equal(h2.of('ending').length,0);
  castWord('MIR-MO','veil'); castWord('MIR-PA','veil');
  G.interact('doorway');
  assert.equal(h2.of('ending').length,1);
  h.stop(); h2.stop();
});

test('a blocked doorway answers like any examine and leaves the state alone', ()=>{
  const h=begin(2);
  const before=JSON.stringify(G.S.f);
  G.interact('doorway');
  assert.equal(JSON.stringify(G.S.f),before);
  assert.deepEqual(h.of('changed').map(e=>e.reason).slice(-1),['look']);
  h.stop();
});
