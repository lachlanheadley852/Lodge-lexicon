/* Web Audio synth. No game state; syllable pitch comes from the shared syllable data. */
import {SYL} from '../game/data.js';

let AC=null, muted=false;
export function toggleMute(){muted=!muted;return muted;}
export function isMuted(){return muted;}

/* The sound of a spoken word: root, then action, then modifier. */
export function playWord(r,a,m){
  strike(r); sing(a,0.25); if(m){modSound(m,0.5); if(m==='ON') strike(r,0.55,0.5);}
}
/* Named one-shot sounds the game logic can ask for ('bell', 'thud', 'pickup', 'chord'). */
export function playNamed(name){
  ({bell,thud,pickup,chord})[name]?.();
}

export function ac(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(e){AC=null;}}return AC;}
export function tone(freq,start,dur,type,vol,glide){
  const c=ac(); if(!c||muted) return;
  const t=c.currentTime+start, o=c.createOscillator(), g=c.createGain();
  o.type=type; o.frequency.setValueAtTime(freq,t); if(glide) o.frequency.linearRampToValueAtTime(glide,t+dur);
  g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(vol,t+0.02); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  o.connect(g); g.connect(c.destination); o.start(t); o.stop(t+dur+0.05);
}
export function strike(r,start=0,mult=1){const f=SYL[r].freq*mult; tone(f,start,0.6,'triangle',0.22); tone(f*2,start,0.25,'sine',0.08);
  if(r==='KEL') tone(f*1.5,start,0.3,'square',0.04); if(r==='RAS') tone(f,start,0.4,'sawtooth',0.04); if(r==='VEL') tone(f*3,start,1.2,'sine',0.05); if(r==='MIR') tone(f*1.01,start,0.8,'sine',0.08);}
export function sing(a,start=0){
  if(a==='SE'){tone(660,start,1.1,'sine',0.1,990);tone(990,start+0.1,1.0,'sine',0.05,1320);}
  if(a==='TU'){tone(330,start,1.0,'sine',0.12,220);tone(247,start+0.15,0.9,'triangle',0.06,196);}
  if(a==='PA'){tone(523,start,0.9,'sine',0.1);tone(784,start+0.2,0.9,'sine',0.08);}
  if(a==='MO'){tone(440,start,0.35,'sine',0.13);tone(660,start,0.35,'sine',0.05);}
  if(a==='NE'){tone(392,start,0.9,'sine',0.09,440);tone(494,start,0.9,'sine',0.09,440);}
  if(a==='KA'){tone(330,start,0.9,'sine',0.11,660);}
}
export function modSound(m,start){ if(m==='ON'){tone(110,start,0.9,'triangle',0.15);tone(220,start,0.9,'sine',0.08);} if(m==='ES'){tone(300,start,0.45,'sawtooth',0.03,1400);} }
export function chord(){[392,494,587,784].forEach((f,i)=>tone(f,i*0.12,2.2,'sine',0.07));}
export function bell(){[0,0.9,1.8].forEach(t=>{tone(523,t,1.6,'sine',0.14);tone(1310,t,0.9,'sine',0.04);tone(784,t,1.2,'triangle',0.04);});}
export function thud(){tone(80,0,0.4,'triangle',0.25,50);tone(120,0.02,0.2,'square',0.03);}
export function pickup(){tone(880,0,0.15,'sine',0.06);tone(1175,0.07,0.18,'sine',0.05);}
export function sound(k){ if(SYL[k].type==='root') strike(k); else if(SYL[k].type==='action') sing(k); else modSound(k,0); }
