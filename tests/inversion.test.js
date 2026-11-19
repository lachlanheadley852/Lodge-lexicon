import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as G from '../src/game/index.js';
import {respond} from '../src/game/engine.js';
import {begin, pick, castWord} from './helpers.js';

const F={root:false,action:false,mod:false};
const w=(root,action,mod,inv)=>({t:'altar',word:{root,action,mod:mod||null,inv:{...F,...inv}}});
const says=(spec,ctx)=>respond([{word:spec,text:'hit'}],ctx)==='hit';

test('wordText puts the mark before flipped syllables only', ()=>{
  assert.equal(G.wordText('KEL','PA',null,{root:true,action:false,mod:false}),'✦KEL-PA');
  assert.equal(G.wordText('LUM','SE','ON',{root:false,action:true,mod:false}),'LUM-✦SE-ON');
  assert.equal(G.wordText('LUM','SE','ON',{root:true,action:true,mod:true}),'✦LUM-✦SE-✦ON');
  assert.equal(G.wordText('LUM','SE',null,{root:false,action:false,mod:true}),'LUM-SE','no modifier, nothing to flip');
  assert.equal(G.wordText('LUM','SE','ON'),'LUM-SE-ON');
});

test('rules: a plain word does not match an inverted one, and the reverse', ()=>{
  const flipped=w('KEL','PA',null,{root:true});
  assert.ok(!says('KEL-PA',flipped));
  assert.ok(says('✦KEL-PA',flipped));
  assert.ok(!says('✦KEL-PA',w('KEL','PA')));
  assert.ok(says('KEL-PA',w('KEL','PA')));
  /* the flip is per place: darkness revealed is not light concealed */
  assert.ok(says('✦LUM-SE',w('LUM','SE',null,{root:true})));
  assert.ok(!says('✦LUM-SE',w('LUM','SE',null,{action:true})));
  assert.ok(says('LUM-✦SE',w('LUM','SE',null,{action:true})));
  assert.ok(!says('LUM-SE',w('LUM','SE',null,{action:true})));
});

test('rules: modifiers and the trailing * with inversion', ()=>{
  assert.ok(says('LUM-SE-*',w('LUM','SE')),'any modifier, none');
  assert.ok(says('LUM-SE-*',w('LUM','SE','ON',{mod:true})),'* in the modifier place matches a flipped modifier');
  assert.ok(!says('LUM-SE-*',w('LUM','SE',null,{root:true})),'but the named root must still be unflipped');
  assert.ok(says('LUM-SE-✦ON',w('LUM','SE','ON',{mod:true})));
  assert.ok(!says('LUM-SE-ON',w('LUM','SE','ON',{mod:true})));
  assert.ok(!says('LUM-SE-✦ON',w('LUM','SE','ON')));
  assert.ok(!says('LUM-SE',w('LUM','SE','ON',{mod:true})),'"no modifier" does not match a flipped one');
});

test('rules: * matches a root or action flipped or not; ✦* only flipped', ()=>{
  assert.ok(says('*-KA-*',w('RAS','KA')));
  assert.ok(says('*-KA-*',w('RAS','KA',null,{root:true})));
  assert.ok(says('✦*-KA-*',w('RAS','KA',null,{root:true})));
  assert.ok(!says('✦*-KA-*',w('RAS','KA')));
  assert.ok(says('RAS-*-ES',w('RAS','KA','ES',{action:true})));
  assert.ok(!says('RAS-✦*-ES',w('RAS','KA','ES')));
  assert.ok(says('✦KEL-PA-*',w('KEL','PA','ON',{root:true})));
});

test('rules: object form with inversion flags', ()=>{
  const m=(spec,ctx)=>respond([{word:spec,text:'hit'}],ctx)==='hit';
  assert.ok(m({root:'KEL',action:'PA',inv:{root:true}},w('KEL','PA',null,{root:true})));
  assert.ok(!m({root:'KEL',action:'PA',inv:{root:true}},w('KEL','PA')));
  assert.ok(!m({root:'KEL',action:'PA'},w('KEL','PA',null,{root:true})),'plain names match uninverted only');
  assert.ok(m({root:'KEL',action:'PA'},w('KEL','PA')));
  assert.ok(m({action:'PA'},w('KEL','PA',null,{root:true})),'omitted root is *');
  assert.ok(m({root:'KEL',action:'PA',mod:'ON',inv:{mod:true}},w('KEL','PA','ON',{mod:true})));
  assert.ok(m({root:'KEL',action:'PA',mod:'*'},w('KEL','PA','ON',{mod:true})));
  assert.ok(m({root:'KEL',action:'PA',mod:'✦ON'},w('KEL','PA','ON',{mod:true})));
});

test('a rule written for a plain word never fires for the inverted one in play', ()=>{
  const h=begin(1); G.debugSetLostWord(true);
  pick('KEL','PA'); G.toggleInversion('root'); assert.equal(G.wordText('KEL','PA',null,G.inv),'✦KEL-PA');
  G.cast('door');
  assert.ok(!G.S.f.door,'KEL-PA at the door must not open it when KEL is flipped');
  assert.ok(G.S.tried.has('✦KEL-PA'));
  assert.ok(!G.S.tried.has('KEL-PA'));
  assert.deepEqual({...G.word},{root:null,action:null,mod:null});
  h.stop();
});

test('toggleInversion refuses while the Lost Word flag is off', ()=>{
  const h=begin(2);
  assert.equal(G.lostWordKnown(),false);
  pick('KEL','PA');
  assert.equal(G.toggleInversion('root'),false);
  assert.equal(G.inv.root,false);
  assert.equal(G.toggleInversion('mod'),false);
  G.debugSetLostWord(true);
  assert.equal(G.toggleInversion('mod'),false,'empty slot');
  assert.equal(G.toggleInversion('bogus'),false);
  assert.equal(G.toggleInversion('root'),true);
  assert.equal(G.inv.root,true);
  assert.equal(G.toggleInversion('root'),true);
  assert.equal(G.inv.root,false);
  G.debugSetLostWord(false);
  h.stop();
});

test('picking a different syllable or clearing drops the flip; the flag resets with a new chapter', ()=>{
  const h=begin(2); G.debugSetLostWord(true);
  pick('KEL'); G.toggleInversion('root'); pick('LUM');
  assert.equal(G.inv.root,false);
  G.toggleInversion('root'); G.clearWord(); assert.equal(G.inv.root,false);
  G.startChapter(2); assert.equal(G.lostWordKnown(),false);
  h.stop();
});

/* Every combination of flipped places, for every syllable, answers without throwing. */
for(const ch of [1,2]){
  test(`Degree ${ch}: inverted words fall through to a sensible reply without throwing`, ()=>{
    const of=type=>Object.keys(G.SYL).filter(k=>G.SYL[k].type===type&&G.SYL[k].ch<=ch);
    const mods=ch===1?[null]:[null,...of('mod')];
    let n=0;
    for(const r of of('root')) for(const a of of('action')) for(const m of mods) for(let bits=1;bits<8;bits++){
      const flips={root:!!(bits&1),action:!!(bits&2),mod:!!(bits&4)};
      if(flips.mod&&!m) continue;
      const h=begin(ch); G.debugSetLostWord(true);
      pick(r,a); if(m) pick(m);
      for(const s of ['root','action','mod']) if(flips[s]) assert.ok(G.toggleInversion(s));
      const text=G.wordText(r,a,m,flips);
      assert.doesNotThrow(()=>G.cast(null),text);
      const html=h.lastSay();
      assert.ok(html.includes(text),`says the word ${text}`);
      const body=html.replace(/<[^>]*>/g,'').replace(text,'').replace(/^\s*—\s*/,'').trim();
      assert.ok(body.length>0&&!/undefined|NaN|null|\[object/.test(body),`${text}: ${body}`);
      if(ch===2){
        for(const s of ['root','action','mod']) if(flips[s]) assert.ok(body.includes(G.SYL[{root:r,action:a,mod:m}[s]].dark),`${text} uses the dark meaning`);
      }
      h.stop(); n++;
    }
    assert.ok(n>0);
  });
}

test('example fallback sentences', ()=>{
  let h=begin(2); G.debugSetLostWord(true); pick('KEL','PA'); G.toggleInversion('root'); G.toggleInversion('action'); G.cast('altar');
  assert.equal(h.lastSay(),'<span class="w">✦KEL-✦PA</span> — The word runs dark: ruin, shut. Nothing at the altar answers it yet.');
  h.stop();
  h=begin(1); G.debugSetLostWord(true); pick('LUM','SE'); G.toggleInversion('root'); G.cast('board');
  assert.match(h.lastSay(),/^<span class="w">✦LUM-SE<\/span> — The word turns inside out/);
  h.stop();
});

test('dark meanings exist for every playable syllable; pending Degree III ones are not playable', ()=>{
  for(const k of Object.keys(G.SYL)) assert.ok(G.SYL[k].dark,k);
  for(const k of Object.keys(G.DARK_PENDING)) assert.ok(!(k in G.SYL),k);
});
