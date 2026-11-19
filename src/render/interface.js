/*
 * Renderer interface. Any renderer (the 2D SVG one today, a Three.js first-person one later)
 * draws the game from state and reports what the player clicked. It never changes game state.
 *
 * @typedef {{x:number,y:number}} Point        screen/scene point the effect should centre on
 *
 * @typedef {Object} Renderer
 * @property {(container:HTMLElement)=>void} mount           build the view inside the container
 * @property {(state:object)=>void} show                     draw the current room/view from game state
 * @property {(on:boolean)=>void} setHighlight               outline everything clickable
 * @property {(on:boolean)=>void} setCasting                 an item is held or a word is ready (aiming cursor)
 * @property {(word:{root:string,action:string,mod:string|null},targetId:string|null,point:Point)=>void} playWordFx
 *                                                           visual effect of a spoken word
 * @property {(targetId:string|null,point:Point)=>void} playGlint   small effect when an item is used
 * @property {(fn:(hotspotId:string|null,point:Point)=>void)=>void} onClick
 *                                                           the player clicked hotspot X, or nothing (null), at point P
 * @property {(fn:(direction:-1|1)=>void)=>void} onTurn      the player asked to turn (2D renderer only; others may never call it)
 *
 * The state passed to show() is the game state object (src/game/state.js `S`): room, view, f (flags), inv, ...
 */
export {};
