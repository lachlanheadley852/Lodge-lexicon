/*
 * The rule engine: reads the tables in content/ and decides what the player is told.
 * Rules are checked in order and the first match wins. No DOM, no audio.
 * Rule fields are documented in content/README.md.
 */
import {S, give, takeAway, learn, addLog} from './state.js';
import {emit} from './events.js';
import {NAMES} from './data.js';

/* ---- conditions ---- */

/* One condition: 'flag', '!flag', 'inv:key', 'known:LUM', or alternatives 'a|b' (any one true). */
function holds1(c){
  return c.split('|').some(alt=>{
    let neg=false; alt=alt.trim();
    if(alt[0]==='!'){neg=true; alt=alt.slice(1);}
    let v;
    if(alt.startsWith('inv:')) v=S.inv.includes(alt.slice(4));
    else if(alt.startsWith('known:')) v=S.known.has(alt.slice(6));
    else v=!!S.f[alt];
    return neg?!v:v;
  });
}
export function holds(list){ return !list||list.every(holds1); }

/* ---- matching ---- */

const list=x=>x===undefined?null:Array.isArray(x)?x:[x];

/* 'RAS-KA-ES' exact; 'LUM-SE' = no modifier; 'LUM-SE-*' any modifier; '*' for any root or action. */
function parseWord(w){
  if(typeof w==='string'){const [root,action,mod]=w.split('-'); return {root,action,mod};}
  return {root:w.root||'*',action:w.action||'*',mod:w.mod};
}
function wordMatches(spec,word){
  if(spec===undefined) return true;
  const {root,action,mod}=parseWord(spec);
  if(root!=='*'&&root!==word.root) return false;
  if(action!=='*'&&action!==word.action) return false;
  if(mod==='*') return true;
  return (mod||null)===(word.mod||null);
}
/* target: an id, a list of ids, or {id, requires} entries inside the list. */
function targetMatches(spec,t){
  const l=list(spec); if(!l) return true;
  if(t===null||t===undefined) return false;
  return l.some(e=>typeof e==='string'?e===t:e.id===t&&holds(e.requires));
}
function matches(rule,ctx){
  if(rule.item!==undefined&&!list(rule.item).includes(ctx.item)) return false;
  if(rule.room!==undefined&&!list(rule.room).includes(S.room)) return false;
  if(!targetMatches(rule.target,ctx.t)) return false;
  if(rule.word!==undefined&&!wordMatches(rule.word,ctx.word||{})) return false;
  return holds(rule.requires);
}

/* ---- results ---- */

/* {n} = the target's display name; {R} = the root's noun phrase (only in generated Degree II replies). */
export function fill(text,ctx){
  return text.replace(/\{(n|R)\}/g,(m,k)=>k==='n'?(NAMES[ctx.t]||ctx.nameFallback||'that'):(ctx.vars?ctx.vars[k]:m));
}

function applyEffect(e){
  if('learn' in e) learn(e.learn);
  else if('give' in e) give(e.give);
  else if('take' in e) takeAway(e.take);
  else if('sound' in e) emit('sound',{name:e.sound});
  else if('fanfare' in e) S.fanfare=!!e.fanfare;
  else if('log' in e) addLog(e.log);
  else throw new Error('Unknown effect: '+JSON.stringify(e));
}
/* Flags first (sets, clears), then effects in the order written. */
function apply(rule){
  for(const k of list(rule.sets)||[]) S.f[k]=true;
  for(const k of list(rule.clears)||[]) S.f[k]=false;
  for(const e of rule.effects||[]) applyEffect(e);
}

/*
 * Find the first rule in `table` that matches ctx ({t, word, item}), apply its effects and
 * return its text. Returns null when no rule matches. ctx.nameFallback is the name used for {n}
 * when the target has none (default 'that').
 */
export function respond(table,ctx){
  const rule=table.find(r=>matches(r,ctx));
  if(!rule) return null;
  apply(rule);
  return fill(rule.text||'',ctx);
}
