'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { calculateWin, formatCredits, INITIAL_BALANCE, restoreBalance, SYMBOLS } from '../lib/game.mjs';

export default function useSlotGame(activeGame = "slots") {
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [ready, setReady] = useState(false);
  const [bet, setBet] = useState(100);
  const [spinning, setSpinning] = useState(false);
  const [reels, setReels] = useState(['♛', '◆', '7']);
  const [stoppedReels, setStoppedReels] = useState(3);
  const [lastWin, setLastWin] = useState(0);
  const [message, setMessage] = useState('Place your virtual bet and spin');
  const [isWin, setIsWin] = useState(false);
  const [history, setHistory] = useState([]);
  const [soundOn, setSoundOn] = useState(true);
  const locked = useRef(false);
  const timers = useRef([]);
  const audio = useRef(null);
  const soundEnabled = useRef(true);
  const spinId = useRef(0);

  useEffect(() => {
    try { setBalance(restoreBalance(localStorage.getItem('vr-balance'))); } catch { /* Storage may be unavailable. */ }
    setReady(true);
    return () => {
      timers.current.forEach(clearTimeout);
      if (audio.current) void audio.current.close().catch(() => {});
    };
  }, []);

  useEffect(() => {
    if (ready) {
      try { localStorage.setItem('vr-balance', String(balance)); } catch { /* Continue with in-memory credits. */ }
    }
  }, [balance, ready]);

  const tone = useCallback((frequency, duration = 0.08) => {
    if (!soundEnabled.current) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const context = audio.current || (audio.current = new AudioContext());
      if (context.state === 'suspended') void context.resume().catch(() => {});
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.value = frequency;
      gain.gain.value = 0.045;
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
      oscillator.stop(context.currentTime + duration);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    } catch { /* Audio support must not interrupt a spin. */ }
  }, []);

  const spin = useCallback(() => {
    if (!ready || locked.current) return;
    if (balance < bet) {
      setIsWin(false);
      setMessage('Not enough credits — reset your balance');
      return;
    }
    locked.current = true;
    setSpinning(true);
    setBalance(value => value - bet);
    setStoppedReels(0);
    setIsWin(false);
    setMessage('Spinning…');
    tone(220, 0.18);
    const result = [];
    timers.current = [0, 1, 2].map(index => setTimeout(() => {
      result[index] = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      setReels(previous => previous.map((symbol, position) => position === index ? result[index] : symbol));
      setStoppedReels(index + 1);
      tone(320 + index * 90);
      if (index !== 2) return;
      const win = calculateWin(result, bet);
      setBalance(value => value + win);
      setLastWin(win);
      setIsWin(win > 0);
      setMessage(win ? `You won ${formatCredits(win)} virtual credits!` : 'Try again — fortune favors the bold');
      const entry = { id: ++spinId.current, result: [...result], win, bet };
      setHistory(previous => [entry, ...previous].slice(0, 6));
      if (win) tone(660, 0.3);
      locked.current = false;
      setSpinning(false);
    }, 330 * (index + 1)));
  }, [balance, bet, ready, tone]);

  useEffect(() => {
    const onKeyDown = event => {
      if (activeGame !== 'slots' || event.code !== 'Space' || event.repeat || event.target.closest?.('input, button, textarea, select, a, [contenteditable="true"]')) return;
      event.preventDefault();
      spin();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [spin, activeGame]);

  function startRound() {
    if (!ready || locked.current) return false;
    if (balance < bet) {
      setIsWin(false);
      setMessage('Not enough credits — reset your balance');
      return false;
    }
    locked.current = true;
    setSpinning(true);
    setBalance(value => value - bet);
    setIsWin(false);
    setMessage('Round in progress…');
    return true;
  }
  function finishRound(name, result, multiplier) {
    if (!locked.current) return;
    const win = Math.floor(bet * multiplier);
    setBalance(value => value + win);
    setLastWin(win);
    setIsWin(win > 0);
    setMessage(win ? `${name}: ${formatCredits(win)} VC returned (${multiplier}×)` : `${name}: no payout this round`);
    setHistory(previous => [{ id: ++spinId.current, result: [name, result], win, bet }, ...previous].slice(0, 6));
    locked.current = false;
    setSpinning(false);
  }

  function changeBet(amount) {
    if (!locked.current) setBet(value => Math.min(1000, Math.max(50, value + amount)));
  }
  function reset() {
    if (!ready || locked.current) return;
    setBalance(INITIAL_BALANCE);
    setLastWin(0);
    setIsWin(false);
    setMessage('Balance reset — good luck!');
  }
  function toggleSound() {
    soundEnabled.current = !soundEnabled.current;
    setSoundOn(soundEnabled.current);
  }

  return { startRound, finishRound, balance, ready, bet, spinning, reels, stoppedReels, lastWin, message, isWin, history, soundOn, spin, changeBet, reset, toggleSound };
}
