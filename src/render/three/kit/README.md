# 3D kit: materials, lighting, props

Everything is made in code (canvas textures, Three.js geometry). No image files, no network.
Import from `kit/index.js`. Dev showcase: `npm run dev`, then open
`/src/render/three/kit/showcase.html` (not linked from `index.html`, so not in the build).

## Units and axes
Metres. x east, z south, y up. Every builder returns a `THREE.Group` with its origin at floor level
(small props: at the surface they rest on), centred in x/z, **front facing +z**. Place and turn it with
`position` / `rotation.y`. A wall at the north side of a room has its front toward +z, so no rotation.

## Hotspots
- `markHotspot(obj, 'id')` tags any object (the group or a sub-part). The renderer's picker walks up
  parents to find `userData.hotspot`.
- `markPart(prop, 'leaf', 'innerdoor')` tags a named sub-part. Parts are listed in `prop.parts`
  (door: `leaf`; pillar: `shaft capital globe fallen base`; lectern: `desk book`; statue: `statue veil pedestal heap`...).
- `hitVolume(w,h,d,x,y,z)` adds an invisible, pickable box for forgiving hit areas on small props.
- Flames, glows and sprites are `noPick`.

## Collision footprints
`prop.footprint` is `{type:'box',x1,z1,x2,z2}` or `{type:'circle',x,z,r}` in the prop's local x/z, or
`null` (wall-mounted or hand-sized things). Props with several pieces (wall with doorway, broken pillar)
also set `prop.footprints` (array). After positioning: `addToPlan(plan, prop)` pushes world-space
boxes/circles into a collision plan; `footprintsWorld(prop)` returns them. Rotated boxes become the
enclosing axis-aligned box. Re-run it after state changes that alter the footprint (`setBroken`).

## Animation and state
Builders that move or flicker set `userData.update(t, dt)`. After building a room:
`const tick = collectUpdaters(root)` and call `tick(seconds)` each frame (the room's `update(t)`).
State changes are **in place**, nothing is rebuilt: `door.setOpen(v, seconds)`, `pillar.setBroken(b)`,
`statue.setVeil(b)`, `lectern.setBook('none'|'closed'|'open')` / `setDusty(b)`, `candle.setLit(b)`,
`sconce.setHeld(b)` / `setLit(b)`, `brazier.setLit(b)`, `basin.setWater(b)`, `archDoorway.setState('open'|'bricked'|'door')`,
`bell.ring()` (or `ringAt(t)` with the same clock as `update`).

## Builders
Structure (`structure.js`): `floor({w,d,material})` (marble = chequer, 0.5 m squares) ·
`ceiling({w,d,height,material,beams})` · `wall({length,height,thickness,material,openings:[{x,width,height,arch}]})` ·
`archDoorway({length,height,thickness,width,openingHeight,state,doorOpen})` · `plankDoor({width,height,arched})` ·
`doubleDoor({width,height,emblem})` (square-and-compass; stone frame; fits a `wall` opening of its width) ·
`pillar({height,radius,globe,broken,breakHeight})` (broken: jagged stump plus the fallen length toward +x) ·
`textPanel({lines,w,h,mirrored})` (incised lettering on stone, +z face; `mirrored` reverses it).
Props (`props.js`): `table` · `altar` · `lectern` · `bell({rope:'hanging'|'cut'|'tied'})` (wall at z=0, projects +z) ·
`sconce({y,held,lit})` (wall at z=0) · `skull` · `hourglass` · `breadAndWater` · `ironBar({mode:'leaning'|'standing'|'lying'})` ·
`ironKey` · `flint` · `cordCoil` · `veiledStatue` · `basin` · `brazier`.
Tables, altar and lectern expose `topY` for placing things on them. Materials: `mat('stone'|'brick'|'wood'|'darkwood'|'iron'|'plaster'|'marble'|...)`
are shared; `bx(w,h,d,'stone',x,y,z)` / `cy` / `lathe` make textured meshes with metre-scaled UVs (a block stays 0.3 m on any wall).

## Lighting rules for room builders (`lighting.js`)
- Renderer settings live in `setupRenderer(gl)` (called by `three/index.js`): sRGB output, ACES filmic tone mapping,
  exposure 1.05, PCF shadows. Do not change them per room.
- Light units are physical (candela). One candle is `LIGHT.candle` = 6.5 cd, a brazier 22 cd, a doorway fill 3 cd,
  a door-seep spill 2 cd. Do not push a single light above ~10 cd: walls within 1 m blow out.
- **Shadow casters: at most 2 per room** (`candle({shadow:true})`: 6 cube-map passes each, 512 px).
  Use the player-facing candle or the one the puzzle is about. All other candles are shadowless and cheap; 6-8 per room is fine.
  Unlit candles/braziers keep their light object at intensity 0 (no shader recompile when you toggle them).
- Every room needs `atmosphere(preset)`: add `.group` to the room and return `.fog` and `.background` in the room
  descriptor (`three/index.js` applies them). Presets: `candlelit` (faint warm floor so corners stay readable),
  `dark` (almost nothing: shapes only appear near a light, e.g. the `spill` under a door), `moonlit`, `clear`.
- `spill({x,y,z,tx,ty,tz,color,intensity})` is a shadowless wide spot for light seeping under a door or through a slit;
  `fill({x,y,z})` is a shadowless point light for doorway glow.
- Keep static geometry shared: use the kit's `bx`/`cy`/`lathe` (cached geometry) and `mat(name)`. Shared geometry, materials and
  textures are tagged `userData.shared` so `disposeRoom` leaves them alone.
