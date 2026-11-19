/* Game state. `S` and `word` are live bindings: importers always see the current object. */
import {SYL} from './data.js';
import {emit} from './events.js';

export function fresh(ch){
  return {ch,room:ch===1?'reflection':'middle',view:0,f:{},inv:[],sel:null,spoken:0,tried:new Set(),log:[],
    known:new Set(ch===1?[]:Object.keys(SYL))};
}
export let S=fresh(1);
export let word={root:null,action:null,mod:null};

/* Replace the state with a fresh one for chapter ch (does not emit). */
export function resetState(ch){S=fresh(ch);}
export function resetWord(){word={root:null,action:null,mod:null};}
export function setWordPart(type,syl){word[type]=syl;}
export function wordText(r,a,m){return r+'-'+a+(m?'-'+m:'');}
export function wordReady(){return !!(word.root&&word.action);}

export function addLog(html){S.log.push(html); if(S.log.length>80) S.log.shift();}
export function say(html){emit('say',{html});}

/* Inventory */
export function give(k){ if(!S.inv.includes(k)){S.inv.push(k); emit('sound',{name:'pickup'});} }
export function takeAway(k){ S.inv=S.inv.filter(i=>i!==k); if(S.sel===k) S.sel=null; }

/* Learning: the state change, plus a 'learn' event for the presenter. */
export function learn(k,extra){
  if(S.known.has(k)) return;
  S.known.add(k);
  emit('learn',{syl:k,first:S.known.size===1,extra});
  addLog(`Learned <span>${k}</span> (${SYL[k].meaning})`);
}

