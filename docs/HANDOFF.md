# Lexicon of the Lodge: handoff for Claude Code

A first-person point-and-click adventure for the web browser. The player rises through the degrees of a fictional Masonic-style lodge in 18th-century London. They learn a sacred tongue syllable by syllable and combine syllables into spoken words that act on the world.

This document hands the project from design and prototyping (done in the Claude app) to development in Claude Code. It covers the vision, the rules of the language, the story, what the current prototype does and how it's built, and what to do next.

The working prototype is `apprentice-chamber.html`, a single self-contained file that ships alongside this document.

Related living documents (owned by the designer, Lachlan):
- Starter lexicon: https://claude.ai/artifact/5ZAFXvUNb7mRCrShEZnb33
- Story outline: https://claude.ai/artifact/MfuX863KjXpjR2LZQP6LFH

Where this document and those disagree, **this document reflects the most recent decisions** (see "Decisions that override the lexicon doc").

---

## 1. Design pillars

1. **Language is the core mechanic.** Words are built from syllables with fixed meanings. Players should become fluent enough to predict what an unseen word will do.
2. **Every syllable shows.** Each part of a spoken word leaves a visible and audible trace in its effect. A wrong word still shows each part, so it reads as a clue, not a dead end.
3. **Words answer needs, not locks.** Puzzles describe a problem. Any word that reasonably solves it should be accepted.
4. **Few syllables, used deeply.** About 17 syllables in total, each used in several puzzles. Learning one should feel like an event.
5. **Dark, grounded tone.** Puzzles fit the world; no "moon logic". The atmosphere is candlelight, stone, secrecy.
6. **Modern adventure-game courtesy.** No pixel hunting (hotspot reveal on Space), no unwinnable states, every action gets a response.

## 2. The language

### Grammar
Every word follows **Root – Action – Modifier**. Root and action are required; the modifier is optional and always last.
- **Root:** what is acted on (light, stone, breath…). Sound shape: consonant-vowel-consonant, struck like a hammer. Sigil: a square.
- **Action:** what happens to it (reveal, bind, open…). Sound shape: consonant-vowel, sung. Sigil: a circle.
- **Modifier:** how, where or for how long. Vowel-consonant suffix, half-whispered. Sigil: a diamond.

### Syllables

| Syllable | Type | Meaning | Unlocked | Effect signature in prototype |
| --- | --- | --- | --- | --- |
| LUM | root | light | Degree I | gold glow, rising sparks |
| KEL | root | stone | Degree I | grey-brown dust falling |
| HAL | root | breath, voice | Degree I | pale wisps |
| MIR | root | water, reflection, truth | Degree II | cyan ripples |
| RAS | root | flame, heat | Degree II | orange embers rising fast |
| VEL | root | memory | Degree II | sepia frames drifting |
| ZOR | root | life, blood | Degree III (not built) | (red pulse, planned) |
| SE | action | reveal | Degree I | expanding rings |
| TU | action | bind | Degree I | dashed rings closing and rotating |
| PA | action | open | Degree I | vertical split parting |
| MO | action | still | Degree II | six spokes and a hexagon that freeze |
| NE | action | mend | Degree II | two arcs closing together |
| KA | action | carry | Degree II | trail of dots moving away |
| -ON | modifier | stronger | Degree II | effect replays larger |
| -ES | modifier | far | Degree II | beam from the speaker to the target first |
| -IM | modifier | self | Degree III (not built) | |
| -UL | modifier | lasting | Degree III (not built) | |

### The Lost Word (end of game, not built)
- One syllable that can be **added to any syllable (root, action or modifier) to flip it to its opposite**. It is the inversion mechanic.
- It is **hidden in plain sight** throughout the game: the player could have known it all along but didn't recognise it. Its actual sound and where it hides in each chamber are still open questions.
- **Dark words carry no cost.** Their weight is narrative only.
- One word can be flipped in several places: darkness revealed is not the same as light concealed.
- First-pass dark readings: LUM darkness, KEL ruin, HAL silence, MIR illusion, RAS cold/ash, VEL forgetting, ZOR decay; SE conceal, TU loose, PA shut, MO stir, NE sever, KA drop; -ON weaker, -ES near, -IM another, -UL fleeting.
- Notation in the design docs: **✦** before the flipped syllable, e.g. `✦KEL-PA` = ruin + open.

## 3. Story (summary)

- **Setting:** 18th-century London. Real Masonic imagery and degree names; the lodge, its people and its tongue are fictional.
- **Premise:** The lodge teaches that its language is the language of light. It is only half a language. The Lost Word unlocks the dark half, and the order buried it.
- **The predecessor, Casimir Hale** (placeholder name): the last initiate to reach the Master degree. He learned the Lost Word, and he and the master builder, **Master Ithiel**, both died in an exchange soon after. Exactly how is never resolved. The lodge branded Hale a traitor and murderer. The player is never met by Hale alive; they find only what he left behind (his captured voice in Degree I, his marks in Degree II, and so on).
- **A secret helper** among the Wardens is hinted at, never confirmed.
- **The core proof:** at the end, the player goes back down through the chambers using dark words. They reopen the bricked door they entered through at the very start, the one inscribed *NONE RETURN THE WAY THEY CAME*. Whatever happened to Hale, this proves the lodge lied.

Chapter plan:
1. **Degree I · Apprentice** (built): learn LUM KEL HAL / SE TU PA.
2. **Degree II · Fellowcraft** (built): learn MIR RAS VEL / MO NE KA / -ON -ES.
3. **Degree III · Master** (not built): learn ZOR / -IM -UL. The temple where Hale and Ithiel died, and the lodge's version of events.
4. **The Lost Word** (not built): find what Hale left; the grimoire inverts.
5. **The Return** (not built): descend through every chamber with dark words, ending at the bricked entrance and a final choice.

Candidate endings: *The Light Kept* (reseal it), *The Whole Tongue* (speak it openly to all), *The Predecessor's Path* (keep the dark half for yourself).

### Planted payoffs (one per chamber, opened on the Return)

| Chamber | Seen going up | Dark word on the Return | Reveals |
| --- | --- | --- | --- |
| Degree I | Bricked entrance, NONE RETURN THE WAY THEY CAME | ✦KEL-PA | The lodge's founding rule is a lie; this is the final door |
| Degree II | Basin's backwards writing | ✦MIR-SE | A second message under the first, cut by Hale |
| Degree II | Memory of a robed figure smashing the pillar crown | ✦VEL-SE | What was erased from the memory (whether it was Hale is open) |
| Degree III | Temple where Hale and Ithiel died | several | Fragments of the exchange, never a full answer |

## 4. Decisions that override the lexicon doc

The lexicon doc is older than these decisions:
- Inversion is **not** taught at the Master degree. It comes only from the Lost Word at the end.
- Inversion is **not** done by spelling roots backwards (LUM → MUL). The Lost Word is a separate syllable added to whichever syllable is flipped, and it works on actions and modifiers too.
- Dark words have **no cost** (no sigil-darkening, no weakening of light words, no light/dark meter).
- Hale is dead before the game begins.

## 5. The current prototype

### File
`apprentice-chamber.html`: one file, about 1,000 lines, plain HTML/CSS/JS with no dependencies. All art is inline SVG drawn in code. All sound is synthesised with the Web Audio API. Open it in any modern browser.

It must stay compatible with being published as a sandboxed claude.ai artifact if that's still wanted (no external requests, no `alert`, storage only in try/catch). That constraint goes away once it's hosted elsewhere.

### Playable content
**Degree I (three rooms, starting with no syllables):**
1. *Chamber of Reflection*, items only. Dark until the candle is lit.
   - Take flint from the skull's teeth → use on candle → learn **LUM**.
   - (Lit) take iron bar → use on marked floor stone → learn **KEL**, key revealed.
   - Take key → use on inner door → learn **PA**.
   - South wall: the bricked entrance with NONE RETURN THE WAY THEY CAME. Nothing opens it (planted payoff). KEL-PA makes it shudder but hold.
2. *Hall of Instruction*, items plus interactions.
   - Click dusty book → blow dust → learn **HAL**. The book then explains how words work.
   - Click veiled statue → pull veil → learn **SE**. Take the cable-tow from its hands.
   - Use cord on the cut bell-rope → learn **TU**. Ring the bell → the great door unbolts.
3. *Apprentice's Chamber*, words only.
   - LUM-SE on tracing board (hint) → LUM-TU on empty sconce (lights alcove) → HAL-SE on carved spiral (hear old voice) → HAL-TU on spiral (capture it) → HAL-PA on carved mouth (break seal) → KEL-PA on stone door → open doorway → Degree I complete.
   - The designer has said they don't fully agree with these puzzles. Expect a redesign.

**Degree II (one room, the Middle Chamber):**
- RAS-KA-ES on the far brazier (lights the chasm) → KEL-KA-ES on the pillar crown across the chasm (carries it back) → KEL-NE-ON on the broken pillar (mends it; plain KEL-NE is "not strong enough") → MIR-MO on the water veil (freezes it) → MIR-PA (parts it). The inner door opens once both pillars stand.
- Optional clues: VEL-SE on the broken pillar (memory of the robed figure), MIR-SE on the basin (reads the backwards writing: STILL THE WATER, THEN PART IT).

The intro screen also has a "Skip to Degree II" button.

### Architecture (all inside one `<script>`)
- **Data:** `SYL` (syllables: type, meaning, colour, frequency, chapter), `ITEMS` (inventory items with SVG icons), `NAMES` (hotspot id → display name used in generated text).
- **State `S`:** `{ch, room, view (0–3 = N/E/S/W), f: {flags}, inv: [], sel: item|null, known: Set<syllable>, spoken, tried: Set, log: []}`. Created by `fresh(ch)`. `word` holds the word being composed `{root, action, mod}`.
- **Rooms:** `ROOMS[roomId] = {name, fn: [northFn, eastFn, southFn, westFn]}`. Each view function returns an SVG string built from helpers (`walls()`, `floor()`, `candle()`, `pillar()`, `hot(id, svg)`, `dark(opacity)`). It reads flags from `S.f` to draw state changes.
- **Hotspots:** any `<g class="hot" data-id="…">`. `render()` adds a dashed highlight rect to each one (shown on hover, or for all while Space is held).
- **Travel:** `TRAVEL[hotspotId] = [roomId, viewIndex]`; `travel()` switches rooms and writes an arrival message.
- **Click handling** (scene click listener), in priority order:
  1. An item is selected → `useItem(item, target)`.
  2. A word is ready (root + action) → `cast(target, point)`. This plays sound, runs `fx()`, and calls `resolve1` (Degree I) or `resolve2` (Degree II).
  3. Otherwise → `interact(target)`: travel, finish, room-specific `interactEarly()` (Degree I rooms 1–2, which can take items or learn syllables), else a `look1`/`look2` description.
- **Resolve functions** return the response text and mutate `S.f`. Each has puzzle-specific cases first, then a fallback:
  - `G1`: hand-written generic text for all 9 Degree I words.
  - `generic2()`: builds a sentence from root noun + action template + modifier tail, so all 108 Degree II words get a sensible response.
- **Learning:** `learn(k)` adds to `S.known`, rebuilds grimoire tiles, plays the syllable's sound, and shows a toast (the first toast explains the grimoire).
- **Effects:** `fx(root, action, mod, point)` draws in the overlay SVG `#fx` using the Web Animations API. `fxCore` draws particles per root and a shape per action. `-ES` adds a beam from the speaker; `-ON` runs `fxCore` twice, larger.
- **Audio:** `tone()` primitive; `strike(root)`, `sing(action)`, `modSound(mod)`, `chord()`, `bell()`, `thud()`, `pickup()`.
- **Chapters:** `CH[1|2] = {title, total, start}`. `startChapter(ch)` resets state; `finish()` shows the ending overlay.

### Known limitations
- No save/load. Refreshing restarts.
- Placeholder vector art; no character art; no music.
- All content (rooms, text, puzzle logic) is hard-coded in JS functions, not data.
- Only about 50 hand-written word responses; the rest are generated and read plainly.
- Only tested by running the logic in Node and by the designer playing it. There are no automated tests.
- Single 16:9 canvas; mobile layout is basic.

## 6. Recommended next steps

Confirm priorities with the designer, but a sensible order is:

1. **Set up a real project.** Use a small Vite (or plain ES-module) project with a git repo, and split the single file into modules: `engine/` (state, input, render, travel), `language/` (syllables, grammar, resolve), `fx/`, `audio/`, `content/` (rooms, items, text).
2. **Make content data-driven.** Move rooms, hotspots, item uses, look text and word responses into data files (JSON or JS objects), so the designer can edit puzzles and text without touching engine code. A rule format like `{target, word: {root, action, mod?}, requires: [flags], sets: [flags], text}` covers almost every case in the prototype. Keep a generic fallback generator.
3. **Add save/load** (localStorage) and a simple chapter select.
4. **Prepare for the Lost Word now.** The data model should let any syllable carry an `inverted` flag, so `✦` can be added to roots, actions and modifiers later without a rewrite. Grimoire tiles should be able to show a mirrored sigil.
5. **Write tests** for the language rules and for each chapter's solution path (scripted playthroughs asserting flags), so puzzle edits don't silently break progress.
6. **Build Degree III** (ZOR, -IM, -UL, the temple where Hale and Ithiel died) once the designer has outlined it.
7. **Plan the art pipeline.** Decide whether scenes become painted images, keeping SVG only for hotspots and effects.

## 7. Open design questions (for the designer, not to be decided in code)

- What is the Lost Word's syllable, and where does it hide in plain sight in each chamber?
- How much of the Hale/Ithiel exchange does the player see, and through which fragments?
- Why was the player chosen?
- Who is the hinted secret helper, and what are the hints?
- Is the Degree II pillar memory really Hale, or altered by the lodge?
- How much of 18th-century London appears outside the lodge?
- Revisions to the Degree I Apprentice's Chamber puzzles.

## 8. Writing style for in-game text

- Second person, present tense, short sentences, concrete sensory detail.
- No jokes that break the mood; dry understatement is fine.
- Wrong or unhelpful words should still say something true about the target, and ideally hint at what's missing ("It needs more force", "It is too far").
- Syllables appear in capitals (LUM-SE); inscriptions in small caps or capitals.
