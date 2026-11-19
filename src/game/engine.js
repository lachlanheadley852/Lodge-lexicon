/*
 * The rule engine: reads the tables in content/ and decides what the player is told.
 * Rules are checked in order and the first match wins. No DOM, no audio.
 * Rule fields are documented in content/README.md.
 */
import {S, INV_MARK, give, takeAway, learn, addLog} from './state.js';
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

/*
 * 'RAS-KA-ES' exact; 'LUM-SE' = no modifier; 'LUM-SE-*' any modifier; '*' = any root or action.
 * Inversion is part of the word: a name written plainly matches only an UNflipped syllable, '✦KEL' only a
 * flipped one, and '*' matches a syllable either way ('✦*' = any flipped one).
 * Object form: {root,action,mod,inv:{root:true}}. Each part parses to {n: name|'*'|null, i: bool|undefined(any)}.
 */
const part=(s,flip)=>{
  if(s===undefined||s===null) return {n:null,i:false};
  if(s[0]===INV_MARK) return {n:s.slice(1),i:true};
  return {n:s,i:s==='*'?(flip===undefined?undefined:!!flip):!!flip};
};
function parseWord(w){
  if(typeof w==='string'){const [r,a,m]=w.split('-'); return {root:part(r),action:part(a),mod:part(m)};}
  const inv=w.inv||{};
  return {root:part(w.root||'*',inv.root),action:part(w.action||'*',inv.action),mod:part(w.mod,inv.mod)};
}
function partMatches(p,syl,flipped){
  if(p.n==='*') return p.i===undefined||p.i===!!flipped;
  return (p.n||null)===(syl||null)&&(!p.n||p.i===!!flipped);
}
function wordMatches(spec,word){
  if(spec===undefined) return true;
  const {root,action,mod}=parseWord(spec), inv=word.inv||{};
  return partMatches(root,word.root,inv.root)&&partMatches(action,word.action,inv.action)&&partMatches(mod,word.mod,inv.mod);
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
