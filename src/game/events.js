/*
 * Event channel from game logic to whoever presents it (HTML UI, audio, renderer).
 * Logic never touches the DOM, audio or timers; it calls emit() and the presenter reacts.
 *
 * Event types (all plain objects with a `type`):
 *   say        {html}                    set the message box text
 *   learn      {syl, first, extra}       a syllable was just learned (state already updated)
 *   sound      {name}                    one-shot sound: 'bell' | 'thud' | 'pickup'
 *   syllable   {syl}                     the sound of a syllable (picked in the grimoire)
 *   cast       {root, action, mod, target}  a word was spoken at a hotspot (target may be null)
 *   fanfare    {after}                   the success chord. after:'cast' = once the cast effect has played
 *   panel      {}                        word slots / inventory / selection changed: redraw the panel now
 *   changed    {reason}                  world state changed: redraw the view. reason is
 *                                        'look' | 'use' | 'cast' | 'travel' | 'chapter'
 *   chapter    {ch}                      a chapter was (re)started from fresh state
 *   ending     {ch, title, stats, next, hasNext}   the degree is finished
 */
const listeners=new Set();
export function onEvent(fn){listeners.add(fn);return ()=>listeners.delete(fn);}
export function emit(type,data){const e=Object.assign({type},data);for(const fn of listeners)fn(e);}
