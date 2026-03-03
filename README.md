# Russian Mario: Vodka Run

A tiny beginner-friendly Mario-like game made with plain HTML, CSS, and JavaScript.

## How to run

1. Open this folder.
2. Start a local server:

```bash
python3 -m http.server 8000
```

3. Open <http://localhost:8000> in your browser.

## Controls

- Move left/right: `←` `→` or `A` `D`
- Jump: `Space`, `↑`, or `W`
- Restart: `R`

## Goal

Collect all vodka bottles to win.

## New obstacles

- Bears patrol parts of the level and block your progress by knocking you back.


## If you redeployed but still see old game

- Hard refresh the page (`Ctrl+Shift+R` or `Cmd+Shift+R`).
- The game script now uses a cache-busting URL (`game.js?v=2026-03-03-r2`) so new deploys should show correctly.
- Confirm you can see `Build: 2026-03-03-r2` under the canvas.
