# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Catanel: a browser-only Settlers of Catan board (random map + dice). React 19 + TypeScript + Vite + Sass, no backend, no state library.

## Commands

Package manager is **pnpm** (`pnpm-workspace.yaml` holds `allowBuilds`; `@parcel/watcher` is intentionally disabled).

- `pnpm dev` (alias `pnpm start`) — dev server on port 3001
- `pnpm build` — `tsc --noEmit` type-check, then `vite build` into `build/`
- `pnpm preview` — serve the production build
- `pnpm test` — Vitest in watch mode; `pnpm vitest run` for a single pass
- Single test: `pnpm vitest run src/App.test.tsx` or `pnpm vitest run -t "blank dice"`
- `pnpm lint` — oxlint (`.oxlintrc.json`): correctness errors, suspicious warnings, React hooks rules

The linter is oxlint, not ESLint: typescript-eslint requires TypeScript below 6.1, and TypeScript 7 (the native port) has no JavaScript API to parse with.

Tests use jsdom (configured in `vite.config.ts`). Testing gotchas:
- Vitest runs without globals, so component tests must call `afterEach(cleanup)` themselves.
- jsdom has no `HTMLDialogElement.showModal`/`close` (stub them, see `SettingsDialog.test.tsx`) and no `matchMedia`; `useMediaQuery` treats a missing `matchMedia` as "no match".
- To control randomness, swap `Math.random` directly (see `withRandom` in `board.test.ts`). `vi.spyOn` records every call, and generation makes millions, which runs out of memory.

## Architecture

- **Player modes** (`src/utils/constants.ts`): `BOARD_CONFIGS` maps each `PlayerMode` (`classic` = 3–4 players, `extended` = 5–6 players) to its row lengths, resource tiles and number tokens. `App` regenerates the board whenever the mode changes. To add a mode, add a config entry; generation, layout and tests all read from it.
- **Settings** (`src/hooks/useSettings.ts`): the player mode, map balance, and the show map / dice / number tokens toggles are kept in `localStorage` under `catanel:settings`. The last generated board is saved under `catanel:board` (`src/hooks/useBoard.ts`) and restored only if it was made for the current mode and balance and passes `isValidBoard`; otherwise a new board is generated. Stored values are validated against the defaults on load. They are edited in `SettingsDialog` (a native `<dialog>`), which never lets map and dice both be hidden.
- **Board generation** (`src/utils/board.ts`): slots come from the config's `rows`. Each tile carries a *doubled column* `col` (`widest - rowLength + 2i`) so neighbours are `±2` in the same row or `±1` in adjacent rows. Deserts (`'empty'`) get no number, and only the first desert gets `robber: true`. `generateBoard(mode, balance)` always returns a board that satisfies `followsRules(tiles, balance)`; retry loops are only for randomness, and `searchAssignment` (a depth-first search) is the guaranteed fallback.
  - **`random`:** reshuffles tokens until 6/8 are apart, then falls back to a search.
  - **`balanced`:** resources must have no same-resource cluster larger than `MAX_RESOURCE_CLUSTER` (shuffle first, search as fallback). Tokens are placed by a step-bounded search so no neighbours `numbersClash` (equal, 6/8, 2/12). Boards are retried for a `pipSpread` ≤ `MAX_PIP_SPREAD`, keeping the most even if none get there. A final unbounded search covers every bounded search running out of steps. A board takes about 1–3 ms.
- **Stored boards**: `isValidBoard` checks exact types, the token and tile inventory, the robber on a desert and 6/8 apart. `useBoard` additionally requires `followsRules` for the stored balance mode. `useSettings` loads through `withVisibleContent`, which keeps map or dice visible.
- **Hex layout** (`src/utils/layout.ts`): `boardLayout(rows)` returns the board size and aspect ratio, tile centres, and each tile's absolute position as a percentage, using pointy-top hex math (height = width·2/√3, row pitch = 0.75·height). `Board` sets `--board-aspect` so the board's CSS width (`src/index.scss`) can fit the viewport height for any mode.
- **Phone layouts**: `src/index.scss` defines three media queries.
  - **`$compact-map`** (≤860px wide, or phone landscape): must match `COMPACT_QUERY` in `constants.ts`. `Board` uses `useMediaQuery(COMPACT_QUERY)` to switch to a tighter `boardLayout` margin, adds `board--compact` (no tile rims, hairline gaps) and tells `Island` to draw no beach. CSS makes the page exactly one screen tall and fits the board into `.board-area` with container queries (`100cqw` / `100cqh × --board-aspect`).
  - **`$stacked`** (≤860px wide and portrait): the map sits above a one-row dice bar.
  - **`$phone-landscape`** (landscape and ≤500px tall): keeps the desktop side-by-side arrangement with a slimmer dice panel.
- `.app` uses `overflow: clip` so the island's SVG glow never causes scrollbars.
- **Island & ocean**: `Island.tsx` draws the coast as SVG. Each layer (shallows glow, wave wash, foam, wet sand, sand) is the union of enlarged tile hexes, merged into a blob by a blur + alpha-threshold filter and roughened with `feDisplacementMap`. All layers share the same noise seed, so the coastlines stay concentric. The SVG overflows the board by `OVERFLOW`. `Ocean.tsx` is a single fixed, static element. Its backgrounds stack a vignette, one non-repeating SVG-noise caustics image (`cover`, so it has no tile seams) and the depth gradient. Keep the water still and untiled; animated or repeating layers were too heavy and showed seams.
- **Dice** (`src/hooks/useDiceRoll.ts`): faces are **0-based** (0 = one pip); use `diceSum` from `src/utils/dice.ts`, which adds 2. `dice` is `null` before the first roll and after `clear()`: dice render blank and nothing is highlighted; history is kept. Rolling flickers random faces on an interval, then commits a final roll to a capped history. `App` passes the last committed sum as `rolled` (`null` while rolling, while `dice` is `null`, or when dice are hidden). `Board` highlights tiles whose number equals it — guard with `rolled !== null`, since deserts have `number: null` — and adds `board--dimmed` to darken the rest only when something matches.
- **Dice face rendering** (`src/components/Dice.tsx`): a 3×3 grid where each cell's visibility is a bitmask (`P_0`–`P_3`) ANDed with `2^points`.
- **Styling**: everything lives in `src/index.scss` (BEM-ish class names, CSS custom properties on `:root`). Hex shapes use `clip-path`, so glow and shadow effects go on the unclipped `.zone` wrapper via `filter: drop-shadow`, not `box-shadow`. Tile images are served from `public/assets/` and referenced as absolute `/assets/...` URLs. Source artwork that isn't served (high-res originals, the old water texture) lives in `art/`, outside `public/`, so it isn't deployed.
- **SEO**: the production URL `https://catanel.odajiu.eu/` is hardcoded in `index.html` (canonical, OpenGraph/Twitter tags, JSON-LD) and in `public/robots.txt`, `public/sitemap.xml` and `public/llms.txt`; change it in every one of these files. `public/og-image.png` (1200×630) is a static image; regenerate it if the board look changes.
