'use client';

import { useState } from 'react';
import CasinoGame, { GAMES } from './casino-game';
import useSlotGame from './use-slot-game';
import { formatCredits } from '../lib/game.mjs';

export default function SlotGame() {
  const [activeGame, setActiveGame] = useState("slots");
  const game = useSlotGame(activeGame);
  return (<>
  <header className="topbar">
    <a className="brand" href="#" aria-label="Velvet Reels home"><span className="brand-mark">V</span><span>VELVET <b>REELS</b></span></a>
    <div className="balance-card" aria-live="polite"><span>PLAY BALANCE</span><strong id="balance">{formatCredits(game.balance)}</strong><small> VC</small></div>
    <button className="ghost-btn" id="resetBtn" onClick={game.reset} disabled={!game.ready || game.spinning}>Reset balance</button>
  </header>

  <nav className="game-picker" aria-label="Choose a game">
    <div className="lobby-heading"><div><p className="eyebrow">THE VELVET COLLECTION</p><h2>Find your next favorite.</h2></div><span>5 games · All play money</span></div>
    <div className="game-cards">{GAMES.map(item => <button key={item.id} className={`game-card ${item.id}${activeGame === item.id ? ' selected' : ''}`} aria-pressed={activeGame === item.id} disabled={game.spinning} onClick={() => setActiveGame(item.id)}><span className="game-art" aria-hidden="true">{item.icon}</span><strong>{item.name}</strong><small>{item.description}</small></button>)}</div>
  </nav>
  <main>
    {activeGame === "slots" ? <section className="game-shell" aria-labelledby="game-title">
      <div className="game-heading">
        <div><p className="eyebrow">FEATURED GAME</p><h1 id="game-title">Midnight Fortune</h1></div>
        <div className="demo-pill"><span></span> PLAY-MONEY DEMO</div>
      </div>

      <div className="machine">
        <div className="jackpot"><span>GRAND JACKPOT</span><strong>250,000 VC</strong></div>
        <div className="reels" id="reels" aria-label="Slot machine reels">
          {game.reels.map((symbol, index) => (
            <div key={index} className={`reel${game.spinning && index >= game.stoppedReels ? ' spinning' : ''}`}>
              <div className="symbol" id={`r${index}`}>{symbol}</div>
            </div>
          ))}
        </div>
        <div className="win-line" aria-hidden="true"></div>
        <div className={`message${game.isWin ? " win" : ""}`} id="message" aria-live="polite">{game.message}</div>
      </div>

      <div className="controls">
        <div className="bet-control">
          <span>BET</span>
          <button id="betDown" onClick={() => game.changeBet(-50)} disabled={game.spinning || game.bet === 50} aria-label="Decrease bet">−</button>
          <strong><span id="bet">{formatCredits(game.bet)}</span> VC</strong>
          <button id="betUp" onClick={() => game.changeBet(50)} disabled={game.spinning || game.bet === 1000} aria-label="Increase bet">+</button>
        </div>
        <button className="spin-btn" id="spinBtn" onClick={game.spin} disabled={!game.ready || game.spinning}><span>SPIN</span><small>Space</small></button>
        <div className="last-win"><span>LAST WIN</span><strong><span id="lastWin">{formatCredits(game.lastWin)}</span> VC</strong></div>
      </div>
    </section> : <CasinoGame key={activeGame} type={activeGame} game={game} />}

    <aside className="side-panel">
      <div className="panel-title"><h2>Recent rounds</h2><button id="soundBtn" onClick={game.toggleSound} aria-label="Toggle sound" aria-pressed={game.soundOn}>{game.soundOn ? "♪" : "×"}</button></div>
      <div id="history" className="history">{game.history.length === 0 ? <div className="empty">Your round history will appear here.</div> : game.history.map(entry => (
        <div key={entry.id} className={`history-item${entry.win ? ' win' : ''}`}>
          <div className="combo">{entry.result.join(' ')}</div>
          <div><strong>{formatCredits(entry.win || entry.bet)} VC</strong><small>{entry.win ? 'PAYOUT' : 'BET LOST'}</small></div>
        </div>
      ))}</div>
      <div className="responsible">
        <span className="shield">✓</span>
        <div><strong>Just for fun</strong><p>No real money, deposits, or prizes. Take breaks and play responsibly.</p></div>
      </div>
    </aside>
  </main>

  <footer><span>Virtual credits have no cash value.</span><span>18+ entertainment concept</span></footer>
  </>);
}
