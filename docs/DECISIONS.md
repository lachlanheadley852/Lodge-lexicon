# Decisions log

Newest first. Where this and `HANDOFF.md` disagree, this file wins.

## 2026-11-18 · The game becomes first-person 3D
- **3D, first person**, rendered with Three.js (bundled by Vite; no runtime network requests).
- **Free walking**: WASD/arrow keys to move, mouse to look (pointer lock). Rooms have simple collision; you cannot walk through walls, props or into the Degree II chasm.
- **Point-and-click is kept**: a small crosshair in the centre; clicking interacts with whatever it is on. The name of the thing under the crosshair is shown. Holding Space still highlights everything you can interact with in view (no pixel hunting).
- **Words and items**: pressing Tab (or releasing the mouse) frees the cursor to use the grimoire and inventory panel; choosing a word or item returns to looking, with it ready. The next click speaks the word or uses the item at the crosshair target. Esc clears it.
- **Reach**: items must be used within arm's reach; words can be spoken at anything you can see (that is what -ES is for, and "too far" stays a response, not a block).
- **Art is built in code**: rooms and props from simple geometry, with code-made stone, brick and wood textures and real candlelight and shadows. Models may be swapped in later.
- **Rooms stay separate scenes**, joined by doorways you walk through (with a short fade), matching the existing room/flag model.
- **Mobile**: on-screen stick to walk, drag to look, tap to interact.
- **During the conversion** the 2D SVG version stays the default and 3D is opened with `?3d`, so the published game is always complete. When every room and effect works in 3D, 3D becomes the default and the 2D renderer is removed. `docs/prototype/` is kept forever.
