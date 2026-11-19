/*
 * Room-builder registry, keyed by room id (the ids in game/data.js ROOM_NAMES).
 *
 * A builder is `(S) => RoomModel`, called whenever the room must be (re)drawn from state:
 *   group     THREE.Group with everything visible. Hotspots are Object3Ds with userData.hotspot = id
 *             (invisible hit volumes via greybox hitBox() are fine). Pure-visual meshes may set
 *             userData.noPick so rays pass through them.
 *   plan      collision floor plan, see ../collision.js
 *   triggers  [{x1,z1,x2,z2,hotspot}] walk-in volumes that travel by calling that hotspot's click path
 *   spawns    {default:{x,z,yaw}, [fromRoomId]:{x,z,yaw}}  where the player appears (yaw 0 faces north)
 *   background clear colour; update(t) optional per-frame animation (flicker etc.)
 * Rooms missing here get the placeholder room.
 */
import {buildReflection} from './reflection.js';
import {buildPlaceholder} from './placeholder.js';

export const ROOM_BUILDERS={
  reflection:buildReflection
};

export function buildRoom(S){
  return (ROOM_BUILDERS[S.room]||buildPlaceholder)(S);
}
