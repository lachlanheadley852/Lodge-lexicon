# Work queue

Managed by the orchestrator. Workers take the **first Ready item**, first in, first out. At most two workers run at once, and never two on items that touch the same files.

Status: `Ready` → `In progress (worker)` → `Review` → `Merged to dev` → `Published` (in main).

---

## Phase 1: a real project

### F1 · Split the prototype into modules
- **Status:** Ready
- **Branch:** `feature/F1-modules`
- **Depends on:** nothing
- **Scope:** Move the single `<script>` in `index.html` into ES modules under `src/`: `engine/` (state, input, render, travel, chapters), `language/` (syllables, grammar, resolve), `fx/`, `audio/`, `content/` (rooms, items, names, text, puzzle logic). Styles move to `src/style.css`. `index.html` keeps only markup and a module script tag.
- **Done when:**
  - The game plays exactly as before: same rooms, text, sounds, effects, puzzles and endings for both degrees.
  - Game logic (state, `useItem`, `interact`, `resolve1`, `resolve2`, `learn`'s state change) can be imported and run in Node **without a DOM**. Rendering, audio and effects are called through a thin layer that can be left out.
  - `npm run build` passes. `docs/prototype/` is untouched.

### F2 · Tests for the language and both solution paths
- **Status:** Ready (after F1 merges)
- **Branch:** `feature/F2-tests`
- **Depends on:** F1
- **Scope:** Use Node's built-in test runner (`node --test`), with no new dependencies, and add `npm test`. Cover: word grammar (root and action required, modifier optional and last), every Degree I and II word producing a non-empty response on every hotspot, and scripted playthroughs of the Degree I and Degree II solution paths that assert flags after each step and reach the ending.
- **Done when:** `npm test` passes, and breaking any step of either solution path makes a test fail.

### F3 · Puzzles and text as data
- **Status:** Ready (after F2 merges)
- **Branch:** `feature/F3-content-data`
- **Depends on:** F2
- **Scope:** Move hotspot descriptions, item uses and word responses into data files under `src/content/`, using rules like `{target, word: {root, action, mod?}, requires: [flags], sets: [flags], text}`, first match wins. Keep the generic fallback generator. Drawing code may stay as functions.
- **Done when:** F2 tests pass unchanged, and a puzzle response or description can be changed by editing data only.

### F4 · Save, load and chapter select
- **Status:** Ready (after F1 merges; can run alongside F3 only if it doesn't touch content files)
- **Branch:** `feature/F4-save`
- **Depends on:** F1
- **Scope:** Autosave state to localStorage after each action (all access in try/catch), resume on reload, a chapter select on the intro screen for unlocked degrees, and a "new game" that clears the save.
- **Done when:** Refreshing mid-puzzle resumes in the same room and view with the same inventory, known syllables, flags and journal, and the game still works when storage is blocked.

### F5 · Ready for the Lost Word
- **Status:** Ready (after F3 merges)
- **Branch:** `feature/F5-inversion-model`
- **Depends on:** F3
- **Scope:** Let any syllable in a word carry an `inverted` flag (shown as `✦` in the notation), in the word model, rule matching and grimoire. The grimoire can draw a mirrored sigil. No way to invert is exposed to the player yet, and the Lost Word's own syllable stays a placeholder (a designer decision).
- **Done when:** Rules can match inverted syllables, tests cover it, and gameplay is unchanged.

---

## Phase 2: Degree III (waiting on the designer's outline)

- Build the Master degree: ZOR, -IM, -UL, and the temple where Hale and Ithiel died. To be broken into items once the outline exists.

## Waiting on the designer
- Redesign of the Degree I Apprentice's Chamber puzzles.
- Art direction: painted scenes, or stay with SVG.
