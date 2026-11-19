/*
 * Game logic API. Importable and drivable in plain Node: no DOM, no audio, no timers.
 * Everything a presenter needs to show is emitted as an event (see events.js).
 * Presenters (the HTML UI, audio, a renderer) call these functions in response to player input.
 */
import {SYL, ITEMS, NAMES, CH, TRAVEL, ROOM_NAMES} from './data.js';
import {S, word, resetState, resetWord, wordText, wordReady, addLog, say} from './state.js';
import {emit} from './events.js';
import {interactEarly, useItem, look1, resolve1} from './rules1.js';
import {look2, resolve2} from './rules2.js';

export {onEvent, emit} from './events.js';
export {S, word, wordReady, wordText, say} from './state.js';
export {SYL, ITEMS, NAMES, CH, TRAVEL, ROOM_NAMES, DIRS} from './data.js';

export function startChapter(ch){
  resetState(ch); resetWord();
  emit('chapter',{ch});
  say(CH[ch].start);
  emit('changed',{reason:'chapter'});
}

/* Select (or deselect) a carried item. Clears the word being built. */
export function selectItem(k){
  S.sel=S.sel===k?null:k; resetWord();
  if(S.sel) say(`You hold the ${ITEMS[k].name.toLowerCase()}. Click on something to use it there.`);
  emit('panel');
}
/* Click on empty space while holding an item. */
export function putAway(){
  S.sel=null; emit('panel'); say('You put it away.');
}
/* Use the selected item on hotspot t. */
export function useSelected(t){
  const k=S.sel; const res=useItem(k,t); S.sel=null;
  say(res); emit('changed',{reason:'use'});
}

/* Pick (or unpick) a syllable for the word being built. */
export function pickSyllable(k){
  const t=SYL[k].type;
  S.sel=null;
  word[t]=word[t]===k?null:k;
  if(word[t]) emit('syllable',{syl:k});
  emit('panel');
}
export function clearWord(){resetWord(); emit('panel');}
/* Esc: put away the item and clear the word. */
export function escape(){clearWord(); S.sel=null; emit('panel');}

/* Speak the current word (it must have a root and an action) at hotspot t (or null for empty air). */
export function cast(t){
  const r=word.root,a=word.action,m=word.mod,w=wordText(r,a,m);
  S.spoken++; S.tried.add(w);
  emit('cast',{root:r,action:a,mod:m,target:t});
  S.fanfare=false;
  const res=S.ch===1?resolve1(r,a,m,t):resolve2(r,a,m,t);
  say(`<span class="w">${w}</span> — ${res}`);
  addLog(`<span>${w}</span> → ${NAMES[t]||'the air'}`);
  clearWord();
  const fan=S.fanfare;
  emit('changed',{reason:'cast'});
  if(fan) emit('fanfare',{after:'cast'});
}

export function travel(t){
  const [room,view]=TRAVEL[t]; S.room=room; S.view=view;
  const first={hall:'hallSeen',apprentice:'appSeen'}[room];
  let msg={hall:'You step into a long hall. A lectern stands before a great double door. Something veiled waits to the east, and a bell hangs high on the west wall.',
    reflection:'You step back into the small room where you began.',apprentice:'You enter the Apprentice\'s Chamber. Candlelight, two great pillars, and a faded tracing board above the altar.'}[room];
  if(room==='hall'&&S.f.hallSeen) msg='You are back in the Hall of Instruction.';
  if(room==='apprentice'&&S.f.appSeen) msg='You are back in the Apprentice\'s Chamber.';
  if(room==='apprentice'&&!S.f.appSeen) msg+=' The door behind you stays open. This time, the way back is not sealed.';
  if(first) S.f[first]=true;
  say(msg); emit('changed',{reason:'travel'});
}

/* Click on hotspot t with nothing selected and no word ready. */
export function interact(t){
  if(TRAVEL[t]) return travel(t);
  if(t==='doorway') return finish();
  let s=null;
  if(S.ch===1&&(S.room==='reflection'||S.room==='hall')) s=interactEarly(t);
  if(s===null) s=S.ch===1?look1(t):look2(t);
  if(s) say(s);
  emit('changed',{reason:'look'});
}

/* Turn the view (the N/E/S/W index is part of state; the renderer decides how to show it). */
export function turn(d){S.view=(S.view+d+4)%4; emit('changed',{reason:'turn'});}

export function finish(){
  emit('fanfare',{after:null});
  const C=CH[S.ch];
  emit('ending',{ch:S.ch,
    title:S.ch===1?'Degree I complete':'Degree II complete',
    stats:`You leave the ${ROOM_NAMES[S.room].replace(/^The /,'')} having spoken ${S.spoken} word${S.spoken===1?'':'s'}, ${S.tried.size} of the ${C.total} possible.`,
    next:S.ch===1?'The winding stair rises ahead, and with it three new roots, three new actions, and the first modifiers.':'Beyond the inner door lies the Master\'s degree: ZOR, the modifiers -IM and -UL, and the last of the light words. (Not built yet.)',
    hasNext:S.ch===1});
}
