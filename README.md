# Velvet Reels

A responsive five-game play-money casino prototype built with Next.js App Router and React.

## Run locally

Requires Node.js 20.9 or newer.

```sh
npm install
npm run dev
```

Open http://localhost:3000. Edit `app/page.js`, `components/slot-game.js`, or `app/globals.css` to update the app.

## Production and checks

```sh
npm test
npm run build
npm start
```

## Project structure

- `app/layout.js`: document metadata, fonts, and global styles
- `app/page.js`: home route
- `components/slot-game.js`: game interface
- `components/use-slot-game.js`: React state, reel timers, keyboard controls, storage, and audio
- `components/casino-game.js`: Dice, Mines, Plinko, and Roulette interfaces
- `lib/casino.mjs`: mine selection, multipliers, roulette colors, and Plinko payouts
- `lib/game.mjs`: payout rules and stored-balance validation
- `dist/`: original vanilla prototype, retained for reference; Next.js builds into `.next/`

## Included features

- Virtual-credit balance saved in browser storage, including a zero balance
- Adjustable bets from 50 to 1,000 VC
- Game picker with five playable games sharing one virtual-credit balance
- Dice with adjustable win probability and visible payout multiplier
- Mines with three hidden mines, progressive multipliers, and collect controls
- Plinko with eight animated bounces and nine payout bins
- Single-zero roulette with red, black, and green bets
- Round locks prevent switching games, changing bets, or resetting credits during play
- Animated three-reel slot game
- Matching-symbol payout logic
- Six most recent rounds across all games
- Sound toggle and spacebar control
- Responsive desktop and mobile layout, with reduced-motion support

Google Fonts load in the browser; system fonts are used if unavailable. If browser storage or audio is unavailable, the game remains playable.

This is an entertainment prototype. It does not accept deposits, process withdrawals, or award prizes. Virtual credits have no cash value.
