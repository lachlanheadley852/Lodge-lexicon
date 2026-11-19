/* The HTML panel: message box, grimoire, inventory, word slots, hints, journal, toast and overlays. */
import {S, word, SYL, ITEMS, CH, selectItem, pickSyllable} from '../game/index.js';
import {sigil} from './sigils.js';
import {itemIcon} from './icons.js';

export const $=id=>document.getElementById(id);

let castingHook=()=>{};
/* fn(bool): called whenever the "item held or word ready" state is recomputed. */
export function onCastingChange(fn){castingHook=fn;}

export function say(html){$('msg').innerHTML=html;}

/* Redraw everything in the panel from game state. */
export function renderPanel(){
  $('title').textContent=CH[S.ch].title;
  renderWord(); renderInv();
  $('carry').innerHTML=S.f.breath?'Holding in your breath: <b>a knot of old breath, carrying someone else\'s voice</b>':'';
  $('log').innerHTML=S.log.slice(-12).reverse().map(l=>`<li>${l}</li>`).join('');
}

export function renderInv(){
  const box=$('inv');
  if(!S.inv.length){box.innerHTML='<span class="empty">Nothing yet.</span>';}
  else{
    box.innerHTML='';
    S.inv.forEach(k=>{const b=document.createElement('button'); b.className='tile item'+(S.sel===k?' sel':'');
      b.innerHTML=itemIcon(k)+`<span><b>${ITEMS[k].name}</b><small>${ITEMS[k].desc}</small></span>`;
      b.onclick=()=>selectItem(k); box.appendChild(b);});
  }
  castingHook(!!S.sel||!!(word.root&&word.action));
}

export function buildTiles(){
  ['roots','actions','mods'].forEach(box=>$(box).innerHTML='');
  Object.keys(SYL).forEach(k=>{
    if(!S.known.has(k)) return;
    const b=document.createElement('button'); b.className='tile'+(S.ch===2&&SYL[k].ch===2?' new':''); b.dataset.k=k;
    const label=SYL[k].type==='mod'?'-'+k:k;
    b.innerHTML=sigil(k)+`<span><b>${label}</b><small>${SYL[k].meaning}</small></span>`;
    b.onclick=()=>pickSyllable(k);
    $({root:'roots',action:'actions',mod:'mods'}[SYL[k].type]).appendChild(b);
  });
  const any=S.known.size>0, hasMods=[...S.known].some(k=>SYL[k].type==='mod');
  $('sylWrap').classList.toggle('hidden',!any); $('wordWrap').classList.toggle('hidden',!any);
  $('modWrap').classList.toggle('hidden',!hasMods); $('slotM').classList.toggle('hidden',!hasMods); $('dashM').classList.toggle('hidden',!hasMods);
}

export function renderWord(){
  document.querySelectorAll('#sylWrap .tile').forEach(b=>b.classList.toggle('sel',[word.root,word.action,word.mod].includes(b.dataset.k)));
  $('slotR').textContent=word.root||'root'; $('slotR').classList.toggle('full',!!word.root);
  $('slotA').textContent=word.action||'action'; $('slotA').classList.toggle('full',!!word.action);
  $('slotM').textContent=word.mod?word.mod:'modifier'; $('slotM').classList.toggle('full',!!word.mod);
  const ready=word.root&&word.action;
  castingHook(!!ready||!!S.sel);
  const hasR=[...S.known].some(k=>SYL[k].type==='root'), hasA=[...S.known].some(k=>SYL[k].type==='action');
  let h;
  if(!S.known.size) h='Click things to examine or take them. Select something you carry, then click where to use it.';
  else if(!(hasR&&hasA)) h='A word needs a root and an action. You do not know both kinds yet.';
  else if(ready) h='Now click something to speak the word at it.';
  else if(word.root||word.action||word.mod) h='Finish the word: it needs a '+(!word.root?'root':'action')+'.';
  else h='Choose a root and an action to form a word'+([...S.known].some(k=>SYL[k].type==='mod')?' (and a modifier if you like)':'')+'. Or use something you carry.';
  $('hint').textContent=h;
}

/* Toast shown when a syllable is learned. */
let learnTimer=null;
export function showLearn(k,first,extra){
  buildTiles();
  $('learn').innerHTML=`${sigil(k)}<div class="k">${k}</div><div class="m">${SYL[k].meaning} · a new ${SYL[k].type==='root'?'root':'action'}</div>`+
    (first?'<div class="x">A grimoire has opened below. Syllables you learn are kept there. A root and an action together make a word you can speak.</div>':extra?`<div class="x">${extra}</div>`:'');
  $('learn').classList.add('show');
  clearTimeout(learnTimer); learnTimer=setTimeout(()=>$('learn').classList.remove('show'),first?6000:3800);
}

/* A chapter (re)started: rebuild the grimoire, reset overlays and toast. */
export function resetForChapter(ch){
  buildTiles();
  ['intro','ch2intro','ending'].forEach(id=>$(id).classList.add('hidden'));
  $('learn').classList.remove('show');
  if(ch===2) $('ch2intro').classList.remove('hidden');
}
export function hideCh2Intro(){$('ch2intro').classList.add('hidden');}

export function showEnding(e){
  $('endTitle').textContent=e.title;
  $('endStats').textContent=e.stats;
  $('endNext').textContent=e.next;
  $('nextBtn').classList.toggle('hidden',!e.hasNext);
  $('ending').classList.remove('hidden');
}
