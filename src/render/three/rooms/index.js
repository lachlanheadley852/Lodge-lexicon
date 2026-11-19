/*
 * Room-builder registry, keyed by room id (the ids in game/data.js ROOM_NAMES).
 *
 * A builder is `(S) => RoomModel`, called ONCE when the player enters the room:
 *   group     THREE.Group with everything visible. Hotspots are Object3Ds with userData.hotspot = id
 *             (kit `hitVolume` boxes give small things a forgiving hit area). userData.reach (true, or a
 *             function of S.f) marks hotspots that handle something physically: they need the same reach
 *             as using an item. Pure-visual meshes may set userData.noPick so rays pass through them.
 *   plan      collision floor plan, see ../collision.js (apply() may rewrite its contents)
 *   triggers  [{x1,z1,x2,z2,hotspot}] walk-in volumes that travel by calling that hotspot's click path
 *   spawns    {default:{x,z,yaw}, [fromRoomId]:{x,z,yaw}}  where the player appears (yaw 0 faces north;
 *             use the doorway you came through, facing into the room)
 *   fog, background (may be a getter), update(t) per-frame animation
 *   apply(S)  move the room to the flags in S.f IN PLACE: called after every state change (and by the
 *             builder itself for the first state). Never rebuild; use the kit's setters.
 * Rooms missing here get the placeholder room.
 */
import {buildReflection} from './reflection.js';
import {buildHall} from './hall.js';
import {buildPlaceholder} from './placeholder.js';

export const ROOM_BUILDERS={
  reflection:buildReflection,
  hall:buildHall
};

export function buildRoom(S){
  return (ROOM_BUILDERS[S.room]||buildPlaceholder)(S);
}
