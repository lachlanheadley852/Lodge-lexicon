# Lexicon of the Lodge

A first-person point-and-click adventure for the browser. You rise through the degrees of a fictional lodge in 18th-century London, learning a sacred tongue syllable by syllable and speaking words that act on the world.

Play: https://lachlanheadley852.github.io/lodge-lexicon/

## Publishing

The game is published as the `lodge-lexicon/` folder of the [lachlanheadley852.github.io](https://github.com/lachlanheadley852/lachlanheadley852.github.io) site repo. From a clean `main`, `npm run publish:site` builds and copies `dist/` into a sibling clone of that repo; then commit and push the site repo.

## Run locally

```
npm install
npm run dev
```

`npm run dev` serves on port 5173 and on your local network, so other devices at home can open it too.

## Layout

- `index.html`: the game (currently the single-file Degrees I–II prototype).
- `docs/HANDOFF.md`: design pillars, language rules, story and roadmap.
- `docs/prototype/`: the original prototype, kept unchanged for reference.
