/*
 * Game logic API. Importable and drivable in plain Node: no DOM, no audio, no timers.
 * Everything a presenter needs to show is emitted as an event (see events.js).
 * Presenters (the HTML UI, audio, a renderer) call these functions in response to player input.
 * The puzzles and all text live in content/ as data; engine.js reads them.
 */
import {SYL, ITEMS, NAMES, CH, TRAVEL, ROOM_NAMES} from './data.js';
import {S, word, resetState, resetWord, wordText, wordReady, addLog, say} from './state.js';
import {emit} from './events.js';
import {respond, holds, fill} from './engine.js';
import words1 from './content/words1.js';
import generic1 from './content/generic1.js';
import words2 from './content/words2.js';
import {generic2} from './content/generic2.js';
import items from './content/items.js';
import examine1 from './content/examine1.js';
import examine2 from './content/examine2.js';
import travelText from './content/travel.js';
import {HOLD_ITEM, PUT_AWAY, ENDINGS, ENDING_STATS, WAY_OPEN} from './content/messages.js';

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
  if(S.sel) say(HOLD_ITEM.replace('{item}',ITEMS[k].name.toLowerCase()));
  emit('panel');
}
/* Click on empty space while holding an item. */
export function putAway(){
  S.sel=null; emit('panel'); say(PUT_AWAY);
}
/* Use the selected item on hotspot t. */
export function useSelected(t){
  const k=S.sel; const res=respond(items,{item:k,t}); S.sel=null;
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

/* The reply to a spoken word: the first matching rule, else the generic reply for the degree. */
function resolveWord(root,action,mod,t){
  const ctx={t,word:{root,action,mod},nameFallback:'the empty air'};
  if(S.ch===1) return respond(words1,ctx) ?? respond(generic1,ctx);
  const res=respond(words2,ctx);
  if(res!==null) return res;
  const g=generic2(root,action,mod);
  return fill(g.template,{...ctx,vars:g.vars});
}

/* Speak the current word (it must have a root and an action) at hotspot t (or null for empty air). */
export function cast(t){
  const r=word.root,a=word.action,m=word.mod,w=wordText(r,a,m);
  S.spoken++; S.tried.add(w);
  emit('cast',{root:r,action:a,mod:m,target:t});
  S.fanfare=false;
  const res=resolveWord(r,a,m,t);
  say(`<span class="w">${w}</span> — ${res}`);
  addLog(`<span>${w}</span> → ${NAMES[t]||'the air'}`);
  clearWord();
  const fan=S.fanfare;
  emit('changed',{reason:'cast'});
  if(fan) emit('fanfare',{after:'cast'});
}

export function travel(t){
  const [room,view]=TRAVEL[t]; S.room=room; S.view=view;
  say(respond(travelText,{t})); emit('changed',{reason:'travel'});
}

/* Click on hotspot t with nothing selected and no word ready. */
export function interact(t){
  if(TRAVEL[t]) return travel(t);
  /* The doorway ends the degree only once the way is open; otherwise it is examined like anything else. */
  if(t==='doorway'&&holds(WAY_OPEN[S.ch])) return finish();
  const s=respond(S.ch===1?examine1:examine2,{t});
  if(s) say(s);
  emit('changed',{reason:'look'});
}

/* Turn the view (the N/E/S/W index is part of state; the renderer decides how to show it). */
export function turn(d){S.view=(S.view+d+4)%4; emit('changed',{reason:'turn'});}

export function finish(){
  emit('fanfare',{after:null});
  const C=CH[S.ch], E=ENDINGS[S.ch];
  const stats=ENDING_STATS.replace('{room}',ROOM_NAMES[S.room].replace(/^The /,''))
    .replace('{spoken}',`${S.spoken} word${S.spoken===1?'':'s'}`).replace('{tried}',S.tried.size).replace('{total}',C.total);
  emit('ending',{ch:S.ch,title:E.title,stats,next:E.next,hasNext:S.ch===1});
}
