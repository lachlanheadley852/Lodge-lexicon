/* Wires game logic, HTML UI, audio and the renderer together. */
import './style.css';
import {S, CH, onEvent} from './game/index.js';
import * as audio from './audio/index.js';
import {createSvgRenderer} from './render/svg/index.js';
import * as ui from './ui/panel.js';
import {wireInput} from './ui/input.js';

const renderer=createSvgRenderer();
renderer.mount(ui.$('stage'));
ui.onCastingChange(on=>renderer.setCasting(on));

/* Redraw the view and the panel from game state. */
function refresh(){renderer.show(S); ui.renderPanel();}

/* How long after a game action the view redraws (masks the effect or lets a glint play). */
const REFRESH_DELAY={look:50,use:250,cast:700,travel:0,turn:0,chapter:0};
const FANFARE_AFTER_CAST=700;

/* Game events -> presentation. */
onEvent(e=>{
  switch(e.type){
    case 'say': ui.say(e.html); break;
    case 'learn':
      ui.showLearn(e.syl,e.first,e.extra);
      setTimeout(()=>audio.playSyllable(e.syl),300);
      break;
    case 'sound': audio.playNamed(e.name); break;
    case 'syllable': audio.playSyllable(e.syl); break;
    case 'cast': audio.playWord(e.root,e.action,e.mod); break;
    case 'fanfare':
      if(e.after==='cast') setTimeout(()=>audio.chord(),FANFARE_AFTER_CAST); else audio.chord();
      break;
    case 'panel': ui.renderWord(); ui.renderInv(); break;
    case 'changed': {
      const d=REFRESH_DELAY[e.reason]||0;
      if(d) setTimeout(refresh,d); else refresh();
      break;
    }
    case 'chapter': ui.resetForChapter(e.ch); break;
    case 'ending': ui.showEnding(e); break;
  }
});

wireInput(renderer);
ui.buildTiles(); ui.say(CH[1].start); refresh();
