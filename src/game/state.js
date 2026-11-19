/* Game state. `S` and `word` are live bindings: importers always see the current object. */
import {SYL} from './data.js';
import {emit} from './events.js';

export function fresh(ch){
  return {ch,room:ch===1?'reflection':'middle',view:0,f:{},inv:[],sel:null,spoken:0,tried:new Set(),log:[],
    known:new Set(ch===1?[]:Object.keys(SYL))};
}
export let S=fresh(1);
/*
 * The Lost Word's mark. TODO(designer, HANDOFF section 7): the Lost Word's real syllable and where it hides
 * are undecided. Nothing here is that syllable; this is only the symbol written before a flipped syllable.
 */
export const INV_MARK='✦';
export const SLOTS=['root','action','mod'];
const noInv=()=>({root:false,action:false,mod:false});
/* inv[slot] (kept apart from word so word stays {root,action,mod}) is true when that slot's syllable carries the Lost Word (is flipped to its opposite). */
export let word={root:null,action:null,mod:null};
export let inv=noInv();

/* Replace the state with a fresh one for chapter ch (does not emit). */
export function resetState(ch){S=fresh(ch);}
export function resetWord(){word={root:null,action:null,mod:null}; inv=noInv();}
export function setWordPart(type,syl){word[type]=syl; inv[type]=false;}
/* 'LUM-SE-ON'. inv ({root,action,mod} booleans, optional) puts the mark before flipped syllables: '✦KEL-PA'. */
export function wordText(r,a,m,inv){
  const f=(k,slot)=>(inv&&inv[slot]&&k?INV_MARK:'')+k;
  return f(r,'root')+'-'+f(a,'action')+(m?'-'+f(m,'mod'):'');
}
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

