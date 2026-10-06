<div align="center">

# 🎲 Catanel

**A Catan-inspired island generator and dice roller, made for phones and desktop.**

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-7-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Sass](https://img.shields.io/badge/Sass-SCSS-CC6699?logo=sass&logoColor=white)

</div>

---

## About

Catanel generates a random 19-hex island and rolls two dice to highlight the tiles matching the total. It's built with React and TypeScript and runs entirely in the browser. Maps and roll history reset when you reload the page.

## Features

- 🏝️ **Random islands:** four wood, wool and wheat tiles each, three iron and clay tiles each, and one desert, arranged in five rows.
- 🔢 **Number tokens:** the standard 18 tokens, with red 6s and 8s and probability dots beneath each number. The generator retries number placement to keep 6s and 8s apart.
- 🎲 **Animated dice:** two six-sided dice tumble and change faces before revealing their total. Matching tiles glow after the roll finishes.
- 🦹 **Robber reminder:** rolling a 7 displays “Robber moves!”; the board shows a robber marker on the desert.
- 📜 **Recent rolls:** the latest six totals appear in the dice panel, newest first.
- 🎨 **Textured design:** resource landscapes, an ocean background, parchment panels, and Cinzel and Inter fonts.
- 📱 **Responsive layout:** the dice panel sits beside the island on desktop and below it on smaller screens. Dice and tile animations respect your system's reduced-motion setting.

## Controls

| Action | Control |
| ------ | ------- |
| Generate another island | **New map** |
| Roll both dice | **Roll dice** |
| See a tile's resource | Hover over the tile |

Generating a new map keeps the current dice and roll history. The roll button is disabled while the dice are rolling.

## Getting started

Requires [Node.js](https://nodejs.org/) compatible with Vite 8 and [pnpm](https://pnpm.io/).

```sh
git clone git@github.com:Graidenix/catanel.git
cd catanel
pnpm install
pnpm dev
```

Open the URL Vite prints, normally **http://localhost:3001**.

### Scripts

| Command | What it does |
| ------- | ------------ |
| `pnpm dev` | Start the dev server with hot reload |
| `pnpm start` | Alias for the dev server |
| `pnpm build` | Type-check, then build to `build/` |
| `pnpm preview` | Serve the production build locally |
| `pnpm test` | Run Vitest in watch mode |
| `pnpm test --run` | Run tests once |

## Project structure

```text
src/
├── index.tsx        # entry: mounts the app inside an error boundary
├── App.tsx          # map state and board/dice layout
├── App.test.tsx     # rendering smoke test
├── components/      # Board, Zone, NumberToken, Dice, DicePanel, ErrorBoundary
├── hooks/           # useDiceRoll: animation timing and recent rolls
├── utils/           # board generation, resource/token constants, dice, shuffle
├── setupTests.ts    # testing-library setup
└── index.scss       # layout, textures, tokens and animations
public/              # resource textures, favicon, icons and manifest
index.html           # HTML entry and font loading
vite.config.ts       # dev server, build output and Vitest configuration
```

## How it works

- **Board generation:** resources are shuffled across 19 fixed hex positions. Number tokens are shuffled independently, skipping the desert. If any 6s or 8s share an edge, placement is retried up to 500 times; the final attempt is returned even if adjacent hot numbers remain.
- **Hex layout:** doubled column coordinates identify neighbors and position tiles as percentages of the board, so the island scales with the viewport.
- **Dice lifecycle:** `useDiceRoll` changes faces every 70 ms during a 600 ms roll, then records the final pair. Its effect cleans up both timers when the component unmounts.
- **Derived highlighting:** the completed dice total is passed to the board, which highlights matching number tokens. Highlighting pauses during a roll and stays off until the first roll completes.

## Credits

Inspired by the board game CATAN. The display and body fonts are Cinzel and Inter, loaded through Google Fonts.
