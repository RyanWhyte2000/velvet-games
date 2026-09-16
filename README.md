# Velvet Reels

A responsive five-game play-money casino prototype built with Next.js 16 App Router, React 19, and plain CSS. Game logic runs in the browser; no database, account, API keys, or environment variables are required.

This is an entertainment prototype. It does not accept deposits, process withdrawals, or award prizes. Virtual credits (VC) have no cash value.

## Run locally

Requires Node.js 20.9 or newer and npm. From the project directory:

```sh
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). Changes to the app update automatically while the development server is running.

To use another port:

```sh
npm run dev -- --port 3001
```

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server. |
| `npm test` | Run the game-rule tests using Node's built-in test runner. |
| `npm run build` | Create the production build in `.next/`. |
| `npm start` | Serve an existing production build. |

To check the rules and run the production app locally:

```sh
npm test
npm run build
npm start
```

The tests cover slot payouts, stored-balance validation, roulette colors, mine selection and multipliers, and Plinko payout bins. They do not cover browser interactions or animations.

## Playing

Start with **10,000 VC** and a default bet of **100 VC**. Use the minus and plus buttons to adjust the bet in 50 VC steps, from 50 to 1,000 VC. All five games share the same balance.

| Game | How to play |
| --- | --- |
| Midnight Fortune (Slots) | Click **SPIN** or press Space. Three matching symbols pay 4–12× depending on the symbol; any pair pays 1.5×. |
| Dice | Choose a 10–90% win chance, then roll. A result below the selected threshold wins the displayed multiplier. |
| Mines | Start a round and reveal tiles on a 5×5 board with three hidden mines. Collect after finding a gem, or keep revealing for a higher multiplier. A mine ends the round with no payout. |
| Plinko | Drop a ball through eight random left-or-right bounces into one of nine payout bins. |
| Roulette | Choose red, black, or green and spin. Matching red or black pays 2×; green (zero) pays 36×. |

Bets are deducted when a round starts. Payout multipliers describe the total amount returned, including the stake, and payouts are rounded down to whole credits. The slots' displayed grand jackpot is decorative; payouts follow the rules in `lib/game.mjs`.

Game selection, bet changes, and balance resets are locked during a round. **Reset balance** restores 10,000 VC once the round ends. The sound toggle controls slot tones; the Space shortcut applies only to Slots and does not override focused interactive controls.

## Browser storage and behavior

- Only the balance is saved, using the `vr-balance` key in `localStorage`. A saved zero balance is preserved; missing or invalid values fall back to 10,000 VC.
- The six most recent rounds are shown across games for the current page session. History, bet settings, sound preferences, and unfinished rounds are not restored after reload.
- Reloading during a round can leave the deducted stake in the saved balance without completing the payout.
- If browser storage or audio is unavailable, the game remains playable. Without storage, the balance lasts only for the current page session.
- Outcomes use browser-side `Math.random()`; there is no server-side verification or balance enforcement.
- Google Fonts load in the browser, with system-font fallbacks if unavailable.

## Project structure

See [sequence diagrams](docs/sequence-diagrams.md) for startup, balance persistence, and all five game flows.

- `app/layout.js`: document metadata, fonts, and global styles
- `app/page.js`: home route
- `components/slot-game.js`: game interface
- `components/use-slot-game.js`: React state, reel timers, keyboard controls, storage, and audio
- `components/casino-game.js`: Dice, Mines, Plinko, and Roulette interfaces
- `lib/casino.mjs`: mine selection, multipliers, roulette colors, and Plinko payouts
- `lib/game.mjs`: payout rules and stored-balance validation
- `lib/*.test.mjs`: game-rule unit tests
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
