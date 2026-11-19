import * as G from '../src/game/index.js';

/* Start a chapter and record every event. */
export function begin(ch){
  const events=[];
  const stop=G.onEvent(e=>events.push(e));
  G.startChapter(ch);
  return {events, stop,
    says:()=>events.filter(e=>e.type==='say'),
    lastSay:()=>{const s=events.filter(e=>e.type==='say'); return s.length?s[s.length-1].html:null;},
    of:type=>events.filter(e=>e.type===type)};
}

/* Pick syllables in order. */
export function pick(...ks){for(const k of ks) G.pickSyllable(k);}

/* Build the word from its dash-separated text (e.g. 'LUM-SE', 'RAS-KA-ES') and cast it at t. */
export function castWord(text,t){
  pick(...text.split('-'));
  G.cast(t);
}

/* Select an item and use it on hotspot t. */
export function use(item,t){G.selectItem(item); G.useSelected(t);}
