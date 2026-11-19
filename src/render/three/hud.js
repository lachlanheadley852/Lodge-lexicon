/* On-screen furniture for the 3D view: crosshair, name under it, controls hint, fade. Pure DOM. */
const CSS=`
#stage canvas.three{position:absolute;inset:0;width:100%;height:100%;display:block;outline:none}
#hud3{position:absolute;inset:0;pointer-events:none;z-index:3;font-family:Georgia,serif}
#hud3 .cross{position:absolute;left:50%;top:50%;width:6px;height:6px;margin:-3px 0 0 -3px;border-radius:50%;background:#e8dcc4;box-shadow:0 0 0 1px rgba(0,0,0,.6);opacity:.7;transition:transform .15s,opacity .15s,background .15s}
#hud3.onhot .cross{opacity:1;transform:scale(1.4)}
#hud3.casting .cross{width:22px;height:22px;margin:-11px 0 0 -11px;background:transparent;border:2px solid #f2c25a;box-shadow:0 0 6px rgba(242,194,90,.6);opacity:1;transform:none}
#hud3.casting.onhot .cross{background:rgba(242,194,90,.25)}
#hud3 .label{position:absolute;left:50%;top:calc(50% + 22px);transform:translateX(-50%);color:#e8dcc4;font-size:14px;letter-spacing:.12em;text-shadow:0 0 4px #000,0 0 8px #000;white-space:nowrap;opacity:0;transition:opacity .12s}
#hud3 .label.show{opacity:1}
#hud3 .label.far{color:#a59a86}
#hud3 .hint{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);color:#e8dcc4;background:rgba(10,8,12,.72);border:1px solid #3b332d;padding:6px 14px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;white-space:nowrap;transition:opacity .3s}
#hud3 .hint.off{opacity:0}
#hud3 .roomname{position:absolute;top:10px;left:50%;transform:translateX(-50%);font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:#8d8472;white-space:nowrap}
#fade3{position:absolute;inset:0;background:#000;opacity:0;pointer-events:none;z-index:4}
@media (max-width:720px){#hud3 .hint{white-space:normal;text-align:center;width:90%;font-size:10px}}
`;

export function createHud(container){
  const style=document.createElement('style'); style.textContent=CSS; document.head.appendChild(style);
  const hud=document.createElement('div'); hud.id='hud3';
  hud.innerHTML='<div class="roomname"></div><div class="cross"></div><div class="label"></div><div class="hint"></div>';
  const fade=document.createElement('div'); fade.id='fade3';
  container.append(hud,fade);
  const label=hud.querySelector('.label'), hint=hud.querySelector('.hint'), roomName=hud.querySelector('.roomname');
  let lastLabel=null;
  return {
    setLabel(text,far){
      const key=text+'|'+!!far; if(key===lastLabel) return; lastLabel=key;
      if(text){label.textContent=text; label.classList.add('show'); label.classList.toggle('far',!!far); hud.classList.add('onhot');}
      else{label.classList.remove('show'); hud.classList.remove('onhot');}
    },
    setCasting(on){hud.classList.toggle('casting',!!on);},
    setHint(text){ if(text){hint.textContent=text; hint.classList.remove('off');} else hint.classList.add('off'); },
    setRoomName(t){roomName.textContent=t||'';},
    /* Cut to black, then fade back in (used when the room changes). */
    fadeIn(ms=600){
      fade.style.transition='none'; fade.style.opacity='1'; void fade.offsetWidth;
      fade.style.transition=`opacity ${ms}ms ease`; fade.style.opacity='0';
    }
  };
}
