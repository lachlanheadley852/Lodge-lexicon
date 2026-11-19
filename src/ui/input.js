/* Input wiring: buttons, keyboard, and click routing from the renderer into game actions. */
import {S, word, wordReady, startChapter, useSelected, putAway, cast, interact, clearWord, escape, turn} from '../game/index.js';
import * as audio from '../audio/index.js';
import {$, hideCh2Intro} from './panel.js';

export function wireInput(renderer){
  /* Click routing, in priority order: selected item -> use it; ready word -> cast it; else interact. */
  renderer.onClick((t,p)=>{
    if(S.sel){
      if(!t){putAway(); return;}
      useSelected(t); renderer.playGlint(t,p); return;
    }
    if(wordReady()){
      const w={root:word.root,action:word.action,mod:word.mod};
      cast(t); renderer.playWordFx(w,t,p); return;
    }
    if(t) interact(t);
  });
  renderer.onTurn(turn);

  $('clearBtn').onclick=clearWord;
  $('hintBtn').onclick=()=>{$('hintBtn').classList.toggle('on'); renderer.setHighlight($('hintBtn').classList.contains('on'));};
  $('muteBtn').onclick=()=>{$('muteBtn').textContent=audio.toggleMute()?'Sound off':'Sound on';};
  document.addEventListener('keydown',e=>{
    if(e.code==='Space'){renderer.setHighlight(true);e.preventDefault();}
    if(e.key==='ArrowLeft') turn(-1);
    if(e.key==='ArrowRight') turn(1);
    if(e.key==='Escape') escape();
  });
  document.addEventListener('keyup',e=>{if(e.code==='Space'&&!$('hintBtn').classList.contains('on'))renderer.setHighlight(false);});

  $('beginBtn').onclick=()=>{audio.ac(); startChapter(1);};
  $('skipBtn').onclick=()=>{audio.ac(); startChapter(2);};
  $('ch2Btn').onclick=hideCh2Intro;
  $('nextBtn').onclick=()=>startChapter(2);
  const restart=()=>{const ch=S.ch; startChapter(ch); hideCh2Intro();};
  $('againBtn').onclick=restart;
  $('resetBtn').onclick=restart;
}
