/* Degree II: the generated reply for any of the 108 words that no rule in words2.js matched. */
import {ROOTS, ACTIONS, PAIRS, MODIFIERS, INVERTED} from './phrases2.js';
import {SYL} from '../data.js';

/*
 * Returns template text for fill() in the engine, plus the variable {R}.
 * inv: optional {root,action,mod} flags; a word carrying the Lost Word gets the INVERTED line built from the dark meanings.
 */
export function generic2(root,action,mod,inv){
  if(inv&&(inv.root||inv.action||inv.mod)){
    const mean=(k,f)=>f?SYL[k].dark:SYL[k].meaning;
    const W=[mean(root,inv.root),mean(action,inv.action),mod?mean(mod,inv.mod):null].filter(Boolean).join(', ');
    return {template:INVERTED.replace('{W}',W), vars:{R:ROOTS[root]}};
  }
  const template=(PAIRS[root+'-'+action]||ACTIONS[action])+(mod?MODIFIERS[mod]:'');
  return {template, vars:{R:ROOTS[root]}};
}
