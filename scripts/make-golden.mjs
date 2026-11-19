/* Regenerate tests/fixtures/golden.json from the current game logic. Only do this when a text change is intended. */
import {writeFileSync} from 'node:fs';
import {buildSnapshot} from '../tests/golden-snapshot.js';
writeFileSync(new URL('../tests/fixtures/golden.json', import.meta.url), JSON.stringify(buildSnapshot()));
console.log('golden.json written');
