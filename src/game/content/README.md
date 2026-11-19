# Puzzles and text: a guide for the designer

Everything the player reads, and every puzzle, lives in these files. You should never need to
touch the engine (`../engine.js`, `../index.js`). After any edit run `npm test`.

## Where things live

| You want to change | File |
| --- | --- |
| What a word does at a hotspot, Degree I | `words1.js` |
| The plain reply to any other Degree I word | `generic1.js` |
| What a word does at a hotspot, Degree II | `words2.js` |
| The generated reply to any other Degree II word | `phrases2.js` (the wording), `generic2.js` (how it is assembled) |
| Using a carried item on a hotspot | `items.js` |
| Clicking a hotspot (description, taking items, learning syllables), Degree I | `examine1.js` |
| Clicking a hotspot, Degree II | `examine2.js` |
| The message when you walk into a room | `travel.js` |
| End-of-degree text, "You hold the...", and what opens the final doorway | `messages.js` |
| Hotspot display names, item names, syllables, which doorway goes where | `../data.js` (`NAMES`, `ITEMS`, `SYL`, `TRAVEL`) |

## How a rule works

Each file is a list of rules. For a click or a spoken word the engine goes down the list and uses
the **first rule that matches**. So put the specific rules (the ones with conditions) above the
general ones. If nothing matches, a word falls back to the generic reply and a click says nothing.

```js
{ target: 'brazier',            // which hotspot (or ['brazier','chasm'], or leave out for any)
  word: 'RAS-KA-ES',            // which word (words only)
  requires: ['pillar', '!veilOpen'],  // flags that must be set / not set
  sets: ['brazier'],            // flags to set when it happens
  clears: ['breath'],           // flags to clear
  effects: [ {learn:'LUM'}, {give:'key'}, {take:'flint'}, {sound:'thud'}, {fanfare:true}, {log:'Lit the candle.'} ],
  text: `The brazier roars alight.` }
```

- **target**: a hotspot id from `NAMES`. A list matches any of them. Leave it out to match any
  target, including empty air. A list entry can carry its own condition, e.g.
  `['pillarR', {id:'crown', requires:['crownHere']}]`.
- **word**: `'RAS-KA-ES'` is exact. `'RAS-KA'` means "with no modifier". `'RAS-KA-*'` means any modifier
  (or none). `'*-KA-*'` means any root, `'RAS-*-ES'` any action. Leave `word` out to match any word.
  Degree I has no modifiers, so its words always end in `-*`.
- **item**: (items only) the item id: `'flint'`, `'bar'`, `'key'`, `'cord'`, or a list.
- **room**: only in this room (`'hall'`, or a list). Used where the same hotspot exists in two rooms.
- **requires**: a list of conditions, all of which must hold.
  - `'lit'` the flag is set; `'!lit'` it is not.
  - `'breath|seal'` either flag is set (`'!a|!b'` works too).
  - `'inv:key'` you are holding the key; `'known:LUM'` you have learned LUM.
- **sets / clears**: flags to turn on / off. A rule's conditions are checked before it changes anything.
- **effects**: things that happen, in the order written, after the flags change:
  `{learn:'LUM'}` teaches a syllable (and adds the journal line), `{give:'key'}` / `{take:'flint'}`
  add or remove an inventory item, `{sound:'bell'}` (`bell`, `thud`, `pickup`), `{fanfare:true}`
  plays the success chord after a spoken word, `{log:'...'}` adds a journal line.
- **text**: what the player reads. `{n}` becomes the name of the target ("the stone door"; "the empty air"
  for a word spoken at nothing, "that" for an item). In `phrases2.js`, `{R}` is the root's phrase.
  Write text in backticks so apostrophes and quotes need no escaping. Empty text (` `` `) means the
  click matches and says nothing.

Flags are plain names you invent (`lit`, `crownHere`); nothing needs declaring. Check the name
carefully: a typo silently makes a new flag.

## Worked example 1: changing a response

The brazier replies when RAS-KA is spoken without -ES. Open `words2.js`, find the rule with
`word:'RAS-KA-*'` and `target:['brazier','chasm']`, and edit its `text`:

```js
{target:['brazier','chasm'], word:'RAS-KA-*',
  text:`A trail of embers drifts out over the chasm and falls short. It is too far for this word.`},
```

Nothing else changes.

## Worked example 2: a new rule for a word at a target

Make HAL-SE (reveal your breath) at the Degree II stair say something. Add a rule in `words2.js`
**above** the last few rules, or anywhere above whatever else might match the same word and target:

```js
{target:'stair', word:'HAL-SE-*',
  text:`Your breath rises up the stair and does not come back.`},
```

To make it depend on progress, put the conditional version first and the plain one after:

```js
{target:'stair', word:'HAL-SE-*', requires:['pillar'],
  text:`Your breath rises, and warm air answers from the open inner door.`},
{target:'stair', word:'HAL-SE-*',
  text:`Your breath rises up the stair and does not come back.`},
```

To make a word also *do* something, add `sets` or `effects`, e.g. `sets:['stairHeard']` or
`effects:[{log:'Listened to the stair.'}]`, and use `'stairHeard'` in `requires` elsewhere.

## The final doorway

The hotspot `doorway` ends a degree only when the flags listed for it in `messages.js` (`WAY_OPEN`)
are all set: Degree I needs `door`; Degree II needs `pillar` and `veilOpen`. Otherwise clicking it is
an ordinary click, answered by `examine1.js` / `examine2.js` (which currently has no text for it, so
nothing is said). Give it a text there if the 3D room needs one.
