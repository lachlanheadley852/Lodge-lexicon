/* Syllable sigils (inline SVG for the grimoire and the learn toast). */
import {SYL} from '../game/data.js';

/* opts.inverted: the syllable carries the Lost Word. Drawn mirrored on a dark ground with a small star. */
export function sigil(k,opts={}){
  const T=SYL[k].type, c=T==='root'?'#c9a86a':T==='action'?'#9fb6cf':'#c79fd0';
  const inner={LUM:'<circle cx="15" cy="15" r="5" fill="#f2c25a"/>',KEL:'<rect x="10" y="10" width="10" height="10" fill="none" stroke="#c8b08a" stroke-width="2"/>',
    HAL:'<path d="M8 17 q3.5 -6 7 0 t7 0" stroke="#cfe6ff" stroke-width="2" fill="none"/>',
    MIR:'<path d="M8 13 q3.5 -4 7 0 t7 0 M8 18 q3.5 -4 7 0 t7 0" stroke="#6fd0e2" stroke-width="1.6" fill="none"/>',
    RAS:'<path d="M15 7 C21 13 19 22 15 22 C11 22 9 15 15 7Z" fill="#ff8a3d"/>',
    VEL:'<circle cx="15" cy="15" r="6" fill="none" stroke="#d9b98a" stroke-width="1.6"/><path d="M15 11 V15 L18 17" stroke="#d9b98a" stroke-width="1.6" fill="none"/>',
    SE:'<circle cx="15" cy="15" r="3" fill="#9fb6cf"/><path d="M7 15 Q15 7 23 15 Q15 23 7 15" stroke="#9fb6cf" fill="none" stroke-width="1.5"/>',
    TU:'<path d="M9 9 L21 21 M21 9 L9 21" stroke="#9fb6cf" stroke-width="2"/>',PA:'<path d="M13 7 V23 M17 7 V23" stroke="#9fb6cf" stroke-width="2"/>',
    MO:'<path d="M15 7V23M8 11L22 19M22 11L8 19" stroke="#9fb6cf" stroke-width="1.6"/>',
    NE:'<path d="M8 15 Q11 9 14 15 M22 15 Q19 21 16 15" stroke="#9fb6cf" stroke-width="2" fill="none"/>',
    KA:'<path d="M8 15H21M17 11L21 15L17 19" stroke="#9fb6cf" stroke-width="2" fill="none"/>',
    ON:'<path d="M10 13 L15 8 L20 13 M10 19 L15 14 L20 19" stroke="#c79fd0" stroke-width="2" fill="none"/>',
    ES:'<path d="M9 21 L21 9 M14 9 H21 V16" stroke="#c79fd0" stroke-width="2" fill="none"/>'}[k];
  const frame=T==='root'?`<rect x="3" y="3" width="24" height="24" fill="none" stroke="${c}" stroke-width="2"/>`:T==='action'?`<circle cx="15" cy="15" r="12" fill="none" stroke="${c}" stroke-width="2"/>`:`<path d="M15 2 L28 15 L15 28 L2 15Z" fill="none" stroke="${c}" stroke-width="1.5"/>`;
  if(opts.inverted) return `<svg viewBox="0 0 30 30" class="inv"><rect width="30" height="30" rx="3" fill="#120d18"/><g transform="translate(30 0) scale(-1 1)" opacity=".85">${frame}${inner}</g><path d="M24 1 L25 4 L28 5 L25 6 L24 9 L23 6 L20 5 L23 4Z" fill="#e8d9ff"/></svg>`;
  return `<svg viewBox="0 0 30 30">${frame}${inner}</svg>`;
}
