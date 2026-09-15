'use client';

import { useEffect, useRef, useState } from 'react';
import { formatCredits } from '../lib/game.mjs';
import { drawMines, mineMultiplier, PLINKO, rouletteColor } from '../lib/casino.mjs';

export const GAMES = [
  { id: 'slots', name: 'Midnight Fortune', icon: '7 7 7', description: 'The original · Slots' },
  { id: 'dice', name: 'Dice', icon: '⚄', description: 'Pick your odds' },
  { id: 'mines', name: 'Mines', icon: '◆', description: 'Reveal & collect' },
  { id: 'plinko', name: 'Plinko', icon: '⁙', description: 'Drop into possibility' },
  { id: 'roulette', name: 'Roulette', icon: '◉', description: 'A timeless classic' },
];

export default function CasinoGame({ type, game }) {
  const [threshold, setThreshold] = useState(50);
  const [roll, setRoll] = useState(null);
  const [color, setColor] = useState('red');
  const [number, setNumber] = useState(null);
  const [path, setPath] = useState([]);
  const [landed, setLanded] = useState(false);
  const [mines, setMines] = useState([]);
  const [revealed, setRevealed] = useState([]);
  const [mineState, setMineState] = useState('idle');
  const timer = useRef(null);
  const roundLock = useRef(false);
  const revealedRef = useRef([]);
  const title = GAMES.find(item => item.id === type).name;
  useEffect(() => () => clearTimeout(timer.current), []);

  function play() {
    if (roundLock.current || !game.startRound()) return;
    roundLock.current = true;
    if (type === 'mines') {
      setMines(drawMines()); setRevealed([]); revealedRef.current = []; setMineState('playing');
      return;
    }
    setRoll(null); setNumber(null); setLanded(false); setPath([]);
    let nextPath = [];
    if (type === 'plinko') {
      let position = 0;
      nextPath = Array.from({ length: 8 }, () => { position += Math.random() < 0.5 ? 0 : 1; return position; });
      setPath(nextPath);
    }
    timer.current = setTimeout(() => {
      if (type === 'dice') {
        const result = Math.floor(Math.random() * 100);
        setRoll(result);
        game.finishRound(title, String(result), result < threshold ? Math.floor(97 / threshold * 100) / 100 : 0);
      } else if (type === 'roulette') {
        const result = Math.floor(Math.random() * 37);
        setNumber(result);
        game.finishRound(title, `${result} ${rouletteColor(result)}`, rouletteColor(result) === color ? color === 'green' ? 36 : 2 : 0);
      } else {
        setLanded(true);
        const slot = nextPath[7];
        game.finishRound(title, `${PLINKO[slot]}×`, PLINKO[slot]);
      }
      roundLock.current = false;
    }, type === 'plinko' ? 1500 : 750);
  }

  function reveal(index) {
    if (mineState !== 'playing' || !roundLock.current || revealedRef.current.includes(index)) return;
    const next = [...revealedRef.current, index];
    revealedRef.current = next;
    setRevealed(next);
    if (mines.includes(index)) {
      setMineState('lost'); roundLock.current = false;
      game.finishRound(title, 'Mine hit', 0);
    } else if (next.length === 22) {
      setMineState('collected'); roundLock.current = false;
      game.finishRound(title, '22 gems', mineMultiplier(22));
    }
  }
  function collect() {
    if (mineState !== 'playing' || !roundLock.current || !revealedRef.current.length) return;
    roundLock.current = false; setMineState('collected');
    game.finishRound(title, `${revealedRef.current.length} gems`, mineMultiplier(revealedRef.current.length));
  }

  return <section className={`game-shell casino-${type}`} aria-labelledby="game-title">
    <div className="game-heading"><div><p className="eyebrow">VELVET ORIGINALS</p><h1 id="game-title">{title}</h1></div><div className="demo-pill"><span />PLAY-MONEY DEMO</div></div>
    <div className="machine casino-table">
      {type === 'dice' && <>
        <p className="table-label">ROLL UNDER {threshold}</p>
        <div className={`dice-result${game.spinning ? ' rolling' : ''}`} aria-live="polite">{roll === null ? '⚄' : String(roll).padStart(2, '0')}</div>
        <label className="range-label" htmlFor="threshold">Win chance <strong>{threshold}%</strong></label>
        <input id="threshold" type="range" min="10" max="90" step="5" value={threshold} disabled={game.spinning} onChange={event => setThreshold(Number(event.target.value))} />
        <div className="table-stats"><span>Roll range <b>0–99</b></span><span>Payout <b>{(Math.floor(97 / threshold * 100) / 100).toFixed(2)}×</b></span></div>
      </>}
      {type === 'mines' && <>
        <div className="table-stats"><span>Hidden mines <b>3 of 25</b></span><span>Collect multiplier <b>{mineMultiplier(mineState === 'lost' ? Math.max(0, revealed.length - 1) : revealed.length).toFixed(2)}×</b></span></div>
        <div className="mine-grid">{Array.from({ length: 25 }, (_, index) => {
          const shown = revealed.includes(index) || mineState === 'lost' || mineState === 'collected';
          const bomb = mines.includes(index);
          return <button key={index} className={`mine-cell${shown ? bomb ? ' bomb' : ' gem' : ''}`} disabled={mineState !== 'playing' || revealed.includes(index)} onClick={() => reveal(index)} aria-label={`Tile ${index + 1}${shown ? bomb ? ': mine' : ': gem' : ': hidden'}`}>{shown ? bomb ? '✹' : '◆' : '·'}</button>;
        })}</div>
        <p className="game-help">Find gems, then collect. Hitting any mine ends the round with no payout.</p>
      </>}
      {type === 'plinko' && <>
        <p className="table-label">ONE DROP. NINE POSSIBILITIES.</p>
        <div className="plinko-board">
          {Array.from({ length: 8 }, (_, row) => <div className="peg-row" key={row}>{Array.from({ length: row + 3 }, (_, peg) => <span key={peg} />)}</div>)}
          {path.length > 0 && <div key={String(game.spinning)} className={`plinko-ball${landed ? ' landed' : ''}`} style={{ '--landing': `${(path[7] - 4) * 10}%`, ...Object.fromEntries(path.map((position, row) => [`--step-${row}`, `${(position - (row + 1) / 2) * 10}%`])) }} />}
        </div>
        <div className="plinko-bins">{PLINKO.map((value, index) => <span key={index} className={landed && path[7] === index ? 'hit' : ''}>{value}×</span>)}</div>
        <p className="game-help">Eight random left-or-right bounces determine your payout.</p>
      </>}
      {type === 'roulette' && <>
        <p className="table-label">EUROPEAN ROULETTE · SINGLE ZERO</p>
        <div className={`roulette-wheel${game.spinning ? ' rolling' : ''}`}><div className={`roulette-number ${number === null ? '' : rouletteColor(number)}`} aria-live="polite">{number === null ? '◈' : number}</div></div>
        <div className="color-choices" role="group" aria-label="Choose roulette color">{['red', 'black', 'green'].map(option => <button className={`${option}${color === option ? ' chosen' : ''}`} key={option} aria-pressed={color === option} onClick={() => setColor(option)} disabled={game.spinning}>{option}<small>{option === 'green' ? '0 · 36×' : '18 numbers · 2×'}</small></button>)}</div>
      </>}
      <div className={`message${game.isWin ? ' win' : ''}`} role="status">{game.message}</div>
    </div>
    <div className="controls">
      <div className="bet-control"><span>BET</span><button onClick={() => game.changeBet(-50)} disabled={game.spinning || game.bet === 50} aria-label="Decrease bet">−</button><strong>{formatCredits(game.bet)} VC</strong><button onClick={() => game.changeBet(50)} disabled={game.spinning || game.bet === 1000} aria-label="Increase bet">+</button></div>
      {type === 'mines' && mineState === 'playing' ? <button className="spin-btn" onClick={collect} disabled={!revealed.length}>COLLECT<small>{formatCredits(Math.floor(game.bet * mineMultiplier(revealed.length)))} VC</small></button> : <button className="spin-btn" disabled={!game.ready || game.spinning} onClick={play}>{game.spinning ? 'PLAYING…' : { dice: 'ROLL DICE', mines: 'START ROUND', plinko: 'DROP BALL', roulette: 'SPIN WHEEL' }[type]}</button>}
      <div className="last-win"><span>LAST PAYOUT</span><strong>{formatCredits(game.lastWin)} VC</strong></div>
    </div>
    <p className="game-help payout-note">Payout multipliers include your bet. Rounds use simulated random outcomes.</p>
  </section>;
}
