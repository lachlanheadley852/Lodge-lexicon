import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as G from '../src/game/index.js';
import {begin, castWord} from './helpers.js';

/* Every hotspot id the game knows, plus null for empty air. */
const hotspots=[...Object.keys(G.NAMES), null];
const ofType=(type,ch)=>Object.keys(G.SYL).filter(k=>G.SYL[k].type===type&&G.SYL[k].ch<=ch);

/* Degree I: 3 roots x 3 actions, no modifiers. Degree II: all 6 roots x 6 actions x {none, ON, ES}. */
function allWords(ch){
  const mods=ch===1?[null]:[null,...ofType('mod',ch)];
  const out=[];
  for(const r of ofType('root',ch)) for(const a of ofType('action',ch)) for(const m of mods) out.push([r,a,m].filter(Boolean).join('-'));
  return out;
}

for(const [ch,expected] of [[1,9],[2,108]]){
  test(`Degree ${ch}: the word set has ${expected} words`, ()=>{
    assert.equal(allWords(ch).length,expected);
    assert.equal(G.CH[ch].total,expected);
  });

  test(`Degree ${ch}: every word answers at every hotspot and in empty air`, ()=>{
    let casts=0;
    for(const w of allWords(ch)){
      for(const t of hotspots){
        const h=begin(ch);
        assert.doesNotThrow(()=>castWord(w,t),`${w} at ${t}`);
        const html=h.lastSay();
        assert.ok(typeof html==='string'&&html.trim().length>0,`${w} at ${t}: empty say`);
        const text=html.replace(/<[^>]*>/g,'').replace(w,'').replace(/^\s*—\s*/,'').trim();
        assert.ok(text.length>0,`${w} at ${t}: no response after the word`);
        assert.ok(!/undefined|NaN|\[object/.test(html),`${w} at ${t}: bad text: ${html}`);
        assert.equal(h.of('cast').length,1);
        h.stop(); casts++;
      }
    }
    assert.equal(casts,expected*hotspots.length);
  });
}
