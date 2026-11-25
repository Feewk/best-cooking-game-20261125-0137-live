# Copper Ladle Kitchen

A rush-hour cooking game for the make.fun best-cooking-game bounty
(best-cooking-game-20261125-0137). One cook, one long counter, and a board
of orders that will not wait.

## Play

Serve `game/` with any static file server and open `game/index.html` in a
desktop browser — no build step, no network, no libraries. Or run
`python3 -m http.server 8901 --directory game` and visit
`http://localhost:8901/`.

- Move: arrow keys or A/D (or click a station to walk there)
- Interact: SPACE — grab from a bin, chop at the board, grill at the stove,
  add to the plate at PLATING, move the plate to the pass, serve at SERVE
- P pauses, M mutes

Build each dish in the order board's steps: some ingredients go on raw,
some need the chopping board, some the grill (mind it — grilled food left
sitting burns). Serve before the patience bar empties for the full price
plus a tip; let it empty and the guest walks out.

## Layout

- `main.ts` — the hand-in program: copies `game/` and `screenshots/` to the
  output directory and writes `dossier.json` via `vendor/makefun-game.ts`.
- `game/index.html` — the page; `game/src/recipes.js` the menu,
  `game/src/render.js` all drawing, `game/src/audio.js` the WebAudio synth,
  `game/src/main.js` the shift loop, orders and input.
- `screenshots/` — real renders of the game in a browser; the first by name
  is the cover.

Demo scenes for screenshots: open the game with `?shot=cover`, `?shot=rush`,
`?shot=served` or `?shot=title` to freeze a mid-service moment.
