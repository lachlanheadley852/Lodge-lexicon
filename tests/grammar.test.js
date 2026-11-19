import {test, beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import * as G from '../src/game/index.js';
import {begin, pick} from './helpers.js';

beforeEach(()=>{begin(2);});

const empty={root:null,action:null,mod:null};

test('a fresh word is empty and not ready', ()=>{
  assert.deepEqual({...G.word},empty);
  assert.equal(G.wordReady(),false);
});

test('a root alone is not a word; root + action is', ()=>{
  pick('KEL'); assert.equal(G.wordReady(),false);
  pick('NE'); assert.equal(G.wordReady(),true);
});

test('an action alone is not a word', ()=>{
  pick('NE'); assert.equal(G.wordReady(),false);
});

test('a modifier alone or with only a root is not a word', ()=>{
  pick('ON'); assert.equal(G.wordReady(),false);
  pick('KEL'); assert.equal(G.wordReady(),false);
});

test('the modifier is optional', ()=>{
  pick('KEL','NE'); assert.equal(G.wordReady(),true);
  pick('ON'); assert.equal(G.wordReady(),true);
});

test('syllables go to their own slot regardless of pick order', ()=>{
  pick('ES','KA','RAS');
  assert.deepEqual({...G.word},{root:'RAS',action:'KA',mod:'ES'});
});

test('picking another syllable of the same type replaces it', ()=>{
  pick('KEL','RAS');
  assert.equal(G.word.root,'RAS');
});

test('picking the same syllable twice unpicks it', ()=>{
  pick('KEL','NE','ON');
  pick('ON'); assert.equal(G.word.mod,null);
  pick('KEL'); assert.equal(G.word.root,null);
  assert.equal(G.wordReady(),false);
});

test('picking an item clears the word', ()=>{
  pick('KEL','NE');
  G.S.inv.push('flint');
  G.selectItem('flint');
  assert.deepEqual({...G.word},empty);
  assert.equal(G.S.sel,'flint');
});

test('picking a syllable puts away the held item', ()=>{
  G.S.inv.push('flint'); G.selectItem('flint');
  pick('KEL');
  assert.equal(G.S.sel,null);
});

test('selecting the held item again deselects it', ()=>{
  G.S.inv.push('flint'); G.selectItem('flint'); G.selectItem('flint');
  assert.equal(G.S.sel,null);
});

test('clearWord empties the word', ()=>{
  pick('KEL','NE','ON'); G.clearWord();
  assert.deepEqual({...G.word},empty);
});

test('escape empties the word and puts the item away', ()=>{
  G.S.inv.push('flint'); G.selectItem('flint');
  G.escape();
  assert.equal(G.S.sel,null);
  pick('LUM'); G.escape();
  assert.deepEqual({...G.word},empty);
});

test('wordText formats root-action[-mod]', ()=>{
  assert.equal(G.wordText('RAS','KA','ES'),'RAS-KA-ES');
  assert.equal(G.wordText('LUM','SE',null),'LUM-SE');
  assert.equal(G.wordText('MIR','PA',undefined),'MIR-PA');
});

test('casting clears the word and records it', ()=>{
  pick('KEL','NE','ON'); G.cast('pillarR');
  assert.deepEqual({...G.word},empty);
  assert.equal(G.S.spoken,1);
  assert.ok(G.S.tried.has('KEL-NE-ON'));
});
