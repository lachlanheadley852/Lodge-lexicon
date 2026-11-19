/*
 * PLACEHOLDER effects for 3D1: a coloured burst at the target for a spoken word, a small gold
 * flash for an item. 3D6 replaces this file with the real per-syllable effects; the renderer only
 * calls playWord() / playGlint() / update().
 */
import * as THREE from 'three';
import {SYL} from '../../game/data.js';

export function createFx(scene){
  const layer=new THREE.Group(); scene.add(layer);
  const live=[];
  const geo=new THREE.SphereGeometry(.12,16,12);

  function burst(pos,color,size,dur){
    const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color,transparent:true,opacity:.9,depthWrite:false,fog:false}));
    m.position.copy(pos); m.userData.noPick=true; layer.add(m);
    live.push({m,t0:performance.now(),dur,size});
  }
  return {
    playWord(word,pos){
      const color=new THREE.Color((SYL[word.root]&&SYL[word.root].color)||'#ffffff');
      burst(pos,color,5,900);
    },
    playGlint(pos){burst(pos,new THREE.Color('#ffd98a'),2,450);},
    update(){
      const now=performance.now();
      for(let i=live.length-1;i>=0;i--){
        const e=live[i], k=(now-e.t0)/e.dur;
        if(k>=1){layer.remove(e.m); e.m.material.dispose(); live.splice(i,1); continue;}
        e.m.scale.setScalar(1+k*e.size); e.m.material.opacity=.9*(1-k);
      }
    },
    clear(){for(const e of live){layer.remove(e.m);} live.length=0;}
  };
}
