/* Item icons: inner SVG for a 30x30 viewBox. */
export const ITEM_ICONS={
  flint:'<polygon points="8,22 12,8 20,6 24,16 18,24" fill="#9a958c" stroke="#cfc8bb"/>',
  bar:'<path d="M6 24 L24 6" stroke="#8a5a34" stroke-width="4" stroke-linecap="round"/><path d="M21 5 L26 4 L25 9Z" fill="#8a5a34"/>',
  key:'<circle cx="10" cy="15" r="5" fill="none" stroke="#b8a37a" stroke-width="2.5"/><path d="M15 15 H26 M22 15 V20 M25 15 V19" stroke="#b8a37a" stroke-width="2.5"/>',
  cord:'<circle cx="15" cy="15" r="9" fill="none" stroke="#a07a45" stroke-width="2.5"/><circle cx="15" cy="15" r="5" fill="none" stroke="#a07a45" stroke-width="2.5"/><path d="M24 15 Q27 22 22 26" stroke="#a07a45" stroke-width="2.5" fill="none"/>'
};
export function itemIcon(k){return `<svg viewBox="0 0 30 30">${ITEM_ICONS[k]}</svg>`;}
