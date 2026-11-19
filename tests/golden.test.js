import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildSnapshot} from './golden-snapshot.js';

/* Every string the player can read, and the side effects of each, must match the recorded snapshot. */
const expected = JSON.parse(readFileSync(new URL('./fixtures/golden.json', import.meta.url), 'utf8'));
const actual = JSON.parse(JSON.stringify(buildSnapshot()));

for (const name of ['paths', 'travel', 'endings', 'misc']) {
  test(`golden: ${name}`, () => assert.deepEqual(actual[name], expected[name]));
}
test('golden: every word, item and examine at every hotspot', () => {
  assert.deepEqual(Object.keys(actual.scenarios), Object.keys(expected.scenarios));
  for (const key of Object.keys(expected.scenarios)) {
    const a = actual.scenarios[key], e = expected.scenarios[key];
    for (const t of Object.keys(e)) {
      for (let i = 0; i < e[t].length; i++) {
        const got = a[t][i] < 0 ? null : actual.results[a[t][i]];
        const want = e[t][i] < 0 ? null : expected.results[e[t][i]];
        assert.deepEqual(got, want, `${key} · ${t} · probe #${i}`);
      }
    }
  }
});
