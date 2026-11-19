# Lexicon of the Lodge: notes for Claude

Read `docs/HANDOFF.md` first. It is the source of truth for the language rules, story and roadmap.

## Branches
- `main`: published. Its build is copied into the website repo (`lachlanheadley852.github.io`, folder `lodge-lexicon/`) with `npm run publish:site`. Only the orchestrator merges into main and publishes, and only when the designer approves a preview.
- `dev`: integration. Feature branches merge here after review; previews are built from here.
- `feature/<id>-<short-name>`: one per work item in `QUEUE.md`, branched from `dev`.

## If you are a feature worker
- Work only on your assigned queue item, on its feature branch, in your own worktree.
- Stay inside the item's scope and files. Do not edit `QUEUE.md`; report back and the orchestrator updates it.
- Commit in small steps with clear messages. Do not push, merge, or touch `main` or `dev`.
- Before reporting done: `npm run build` passes, tests pass (once they exist), and both chapters are still playable to the end.
- In your final report, list what changed, how you checked it, and anything left undone or uncertain.

## Rules
- Never decide open design questions (HANDOFF section 7) in code. Leave a clearly marked placeholder.
- In-game text follows HANDOFF section 8: second person, present tense, short concrete sentences.
- No external network requests at runtime. Wrap all storage access in try/catch.

## Commands
- `npm run dev`: dev server on port 5173, reachable on the home network.
- `npm run build`: production build to `dist/`.
- `npm run publish:site`: orchestrator only, from a clean `main`.
