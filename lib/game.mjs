export const SYMBOLS = ['♛', '◆', '7', '✦', 'BAR', '♠'];
export const INITIAL_BALANCE = 10000;
const PAYOUTS = { '♛': 8, '◆': 6, '7': 12, '✦': 5, BAR: 10, '♠': 4 };

export function calculateWin(result, bet) {
  if (result.every(symbol => symbol === result[0])) return bet * PAYOUTS[result[0]];
  return new Set(result).size === 2 ? Math.floor(bet * 1.5) : 0;
}

export function restoreBalance(value) {
  if (value === null || value.trim() === '') return INITIAL_BALANCE;
  const balance = Number(value);
  return Number.isSafeInteger(balance) && balance >= 0 ? balance : INITIAL_BALANCE;
}

export const formatCredits = value => value.toLocaleString('en-US');
