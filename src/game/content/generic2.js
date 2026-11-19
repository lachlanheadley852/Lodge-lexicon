/* Degree II: the generated reply for any of the 108 words that no rule in words2.js matched. */
import {ROOTS, ACTIONS, PAIRS, MODIFIERS} from './phrases2.js';

/* Returns template text for fill() in the engine, plus the variable {R}. */
export function generic2(root,action,mod){
  const template=(PAIRS[root+'-'+action]||ACTIONS[action])+(mod?MODIFIERS[mod]:'');
  return {template, vars:{R:ROOTS[root]}};
}
