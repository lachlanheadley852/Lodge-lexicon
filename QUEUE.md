# Work queue

Managed by the orchestrator. Workers take the **first Ready item**, first in, first out. At most two workers run at once, and never two on items that touch the same files. Items marked *parallel-safe with X* may run alongside X.

Status: `Ready` → `In progress (worker)` → `Review` → `Merged to dev` → `Published` (in main).

Design decisions that override the handoff are in `docs/DECISIONS.md` (the game is now first-person 3D with free walking).

---

## Phase 1: separate the game from how it is drawn

### F1 · Split into modules, logic apart from rendering
- **Status:** In progress (worker 1)
- **Branch:** `feature/F1-modules`
- **Depends on:** nothing
- **Scope:** Move the single `<script>` in `index.html` into ES modules under `src/`:
  - `src/game/`: state, syllables/grammar, items, names, puzzle logic (`useItem`, `interactEarly`, `look1/2`, `resolve1/2`, `generic2`, `G1`), travel, chapters, learning. **No DOM, audio or SVG here.** Logic returns results/events (text, sounds to play, fanfare, learned syllable, travel) instead of calling the UI.
  - `src/ui/`: the HTML panel (grimoire, inventory, word slots, journal, message, overlays, toasts) and input wiring.
  - `src/audio/`: the Web Audio synth.
  - `src/render/svg/`: the current room drawings, hotspot highlight and SVG effects, behind a small renderer interface (show room/view, highlight hotspots, play word effect at a target, hotspot id from a click). The 3D renderer will implement the same interface later.
  - Styles to `src/style.css`; `index.html` keeps markup and one module script tag.
- **Done when:**
  - The game plays exactly as before: same rooms, text, sounds, effects, puzzles and endings in both degrees.
  - `src/game/` can be imported and driven in Node with no DOM.
  - `npm run build` passes; `docs/prototype/` untouched.

### F2 · Tests for the language and both solution paths
- **Status:** Ready (after F1)
- **Branch:** `feature/F2-tests`
- **Depends on:** F1
- **Scope:** Node's built-in runner (`node --test`), no new dependencies, `npm test`. Cover word grammar, every Degree I/II word giving a non-empty response on every hotspot, and scripted playthroughs of both solution paths asserting flags after each step and reaching the ending.
- **Done when:** `npm test` passes, and breaking any solution step makes a test fail.

### F3 · Puzzles and text as data
- **Status:** Ready (after F2)
- **Branch:** `feature/F3-content-data`
- **Depends on:** F2
- **Scope:** Move hotspot descriptions, item uses and word responses into data under `src/game/content/` as rules like `{target, word: {root, action, mod?}, requires, sets, text}`, first match wins. Keep the generic fallback.
- **Done when:** F2 tests pass unchanged; changing a puzzle response or description needs only a data edit.

## Phase 2: first-person 3D

All 3D work is behind `?3d` until 3D8 flips the default. Three.js is the engine.

### 3D1 · First-person engine with a greybox room
- **Status:** Ready (after F1)
- **Branch:** `feature/3D1-engine`
- **Depends on:** F1 · *parallel-safe with F2*
- **Scope:** `src/render/three/`: implement the renderer interface with Three.js. Pointer-lock mouse look, WASD/arrow walking at a calm pace, eye height ~1.6 m, collision against a simple per-room 2D floor plan (walls, prop footprints, no-walk zones). Centre crosshair; raycast picks the hotspot under it and shows its name; click routes to the existing interact / use-item / cast logic. Space highlights all hotspots in view. Tab frees the cursor for the panel; picking a word or item returns to looking. Room switching through doorway triggers with a short fade. Prove it with a greybox (untextured boxes) Chamber of Reflection whose hotspots all work.
- **Done when:** with `?3d`, Degree I room 1 can be solved in greybox; without `?3d` the 2D game is unchanged; build passes.

### 3D2 · Materials, lighting and prop kit
- **Status:** Ready (after F1)
- **Branch:** `feature/3D2-kit`
- **Depends on:** F1 · *parallel-safe with 3D1 (own folder `src/render/three/kit/`)*
- **Scope:** Code-made textures (dressed stone, brick, wood plank, iron, plaster) via canvas, with normal/roughness variation; candle (flame sprite + flickering point light with shadows); darkness/fog settings; builder functions for walls, floors (chequered lodge floor), arches, doors, pillars with globes, altar, table, lectern, bell, sconce, skull, hourglass. A dev-only showcase page under `src/render/three/kit/showcase.html` renders every builder.
- **Done when:** the showcase shows every prop lit by candlelight at a steady frame rate on this PC.

### 3D3 · Degree I: Chamber of Reflection and Hall of Instruction
- **Status:** Ready (after 3D1 and 3D2)
- **Branch:** `feature/3D3-degree1-early`
- **Depends on:** 3D1, 3D2
- **Scope:** Build both rooms with the kit, every hotspot from the 2D version, and all state changes (dark until lit, slab moved and key, bar, inner door opening, dust/book, veil and statue, cord, bell tied and rung, great door). Item use within reach.
- **Done when:** with `?3d`, both rooms can be solved start to finish, and every 2D hotspot has a 3D counterpart.

### 3D4 · Degree I: Apprentice's Chamber
- **Status:** Ready (after 3D3)
- **Branch:** `feature/3D4-apprentice`
- **Depends on:** 3D3
- **Scope:** Pillars, tracing board, altar, sconce and alcove with spiral, stone door with carved mouth and sigil ring, all states.
- **Done when:** Degree I can be completed in 3D.

### 3D5 · Degree II: the Middle Chamber
- **Status:** Ready (after 3D3) · *parallel-safe with 3D4*
- **Branch:** `feature/3D5-middle-chamber`
- **Depends on:** 3D3
- **Scope:** Chasm (no-walk, depth falling to black), far ledge and brazier, crown carried across, broken/mended pillar, water veil (falling, stilled to glass, parted), basin with mirrored writing, inner door, winding stair, inscriptions.
- **Done when:** Degree II can be completed in 3D.

### 3D6 · Word effects in 3D
- **Status:** Ready (after 3D1)
- **Branch:** `feature/3D6-word-fx`
- **Depends on:** 3D1 · *parallel-safe with 3D3*
- **Scope:** In world space at the target: per-root particles (LUM sparks, KEL dust, HAL wisps, MIR ripples, RAS embers, VEL drifting frames) and per-action shapes (SE rings, TU closing dashed rings, PA split, MO spokes and hexagon, NE closing arcs, KA travelling dots); -ES beam from the player to the target first; -ON replays larger. Short-lived light from the root colour.
- **Done when:** every syllable's signature in HANDOFF section 2 is visible in 3D.

### 3D7 · Mobile and touch
- **Status:** Ready (after 3D3)
- **Branch:** `feature/3D7-touch`
- **Depends on:** 3D3
- **Scope:** On-screen stick to walk, drag to look, tap to interact, panel layout for phones, quality settings (shadow resolution, pixel ratio) chosen by device.
- **Done when:** both degrees can be finished on a phone over the home network preview.

### 3D8 · Make 3D the game
- **Status:** Ready (after 3D4–3D7)
- **Branch:** `feature/3D8-flip`
- **Depends on:** 3D4, 3D5, 3D6, 3D7
- **Scope:** 3D becomes the default, intro text explains the controls, `src/render/svg/` is removed.
- **Done when:** tests pass, both degrees complete in 3D, build size is reasonable.

## Phase 3: after 3D

### F4 · Save, load and chapter select
- **Status:** Ready (after 3D8)
- **Branch:** `feature/F4-save`
- **Scope:** Autosave to localStorage (in try/catch), including player position and facing; resume on reload; chapter select; new game.

### F5 · Ready for the Lost Word
- **Status:** Ready (after F3)
- **Branch:** `feature/F5-inversion-model`
- **Scope:** Any syllable in a word can carry an `inverted` flag (`✦`) in the word model, rule matching and grimoire (mirrored sigil). Not exposed to the player yet; the Lost Word's syllable stays a placeholder.

### Degree III (waiting on the designer's outline)
- ZOR, -IM, -UL, and the temple where Hale and Ithiel died.

## Waiting on the designer
- Redesign of the Degree I Apprentice's Chamber puzzles.
