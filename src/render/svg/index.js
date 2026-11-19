/*
 * 2D SVG renderer. Implements the renderer interface (see ../interface.js).
 * Turning the view (N/E/S/W arrows) is specific to this renderer: it reports turns through onTurn.
 */
import {DIRS, ROOM_NAMES} from '../../game/data.js';
import {defs, vignette} from './helpers.js';
import {ROOM_VIEWS} from './rooms.js';
import {fx, glint, setFxLayer} from './fx.js';

const NS='http://www.w3.org/2000/svg';
const MARKUP=`<svg id="scene" viewBox="0 0 960 540" preserveAspectRatio="xMidYMid slice"></svg>
<svg id="fx" viewBox="0 0 960 540" preserveAspectRatio="xMidYMid slice">
  <defs><filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"/></filter></defs>
</svg>
<div id="navL" class="nav" title="Turn left">&#8249;</div>
<div id="navR" class="nav" title="Turn right">&#8250;</div>
<div id="viewName"></div>`;

export function createSvgRenderer(){
  let container=null, scene=null, viewName=null;
  let clickHandler=()=>{}, turnHandler=()=>{};

  function svgPoint(evt){const pt=scene.createSVGPoint();pt.x=evt.clientX;pt.y=evt.clientY;return pt.matrixTransform(scene.getScreenCTM().inverse());}
  function centerOf(g,e){let p=svgPoint(e); if(g){try{const b=g.getBBox();p={x:b.x+b.width/2,y:b.y+b.height/2};}catch(err){}} return p;}

  return {
    /* Build the scene inside `container` (before any existing children, so overlays stay on top). */
    mount(el){
      container=el;
      container.insertAdjacentHTML('afterbegin',MARKUP);
      scene=container.querySelector('#scene'); viewName=container.querySelector('#viewName');
      setFxLayer(container.querySelector('#fx'));
      scene.addEventListener('click',e=>{
        const g=e.target.closest('.hot'), id=g?g.dataset.id:null;
        clickHandler(id,centerOf(g,e));
      });
      container.querySelector('#navL').onclick=()=>turnHandler(-1);
      container.querySelector('#navR').onclick=()=>turnHandler(1);
    },
    /* Draw the current room and view from game state. */
    show(S){
      scene.innerHTML=defs()+ROOM_VIEWS[S.room][S.view](S)+vignette();
      scene.querySelectorAll('.hot').forEach(g=>{
        try{const b=g.getBBox(); const r=document.createElementNS(NS,'rect');
          r.setAttribute('class','hl'); r.setAttribute('x',b.x-6); r.setAttribute('y',b.y-6); r.setAttribute('width',b.width+12); r.setAttribute('height',b.height+12); r.setAttribute('rx',6); g.appendChild(r);}catch(e){}
      });
      viewName.textContent=ROOM_NAMES[S.room]+' · '+DIRS[S.view];
    },
    /* Outline everything clickable. */
    setHighlight(on){container.classList.toggle('hints',!!on);},
    /* Crosshair cursor while an item is held or a word is ready. */
    setCasting(on){container.classList.toggle('casting',!!on);},
    /* The visual effect of a spoken word at a point. */
    playWordFx({root,action,mod},targetId,point){fx(root,action,mod,point);},
    /* A small glint when an item is used. */
    playGlint(targetId,point){glint(point,'#ffd98a');},
    /* fn(hotspotId|null, point) when the player clicks the view. */
    onClick(fn){clickHandler=fn;},
    /* fn(direction) with -1 or 1 when the player asks to turn. */
    onTurn(fn){turnHandler=fn;}
  };
}
