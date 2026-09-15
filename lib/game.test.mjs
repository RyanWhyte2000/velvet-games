import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateWin, restoreBalance, SYMBOLS } from './game.mjs';

test('all matching symbols pay their advertised multiplier', () => {
  const multipliers = [8, 6, 12, 5, 10, 4];
  SYMBOLS.forEach((symbol, index) => assert.equal(calculateWin([symbol, symbol, symbol], 100), multipliers[index] * 100));
});

test('pairs pay 1.5 times the bet in every position; distinct symbols lose', () => {
  for (const result of [['7', '7', '◆'], ['7', '◆', '7'], ['◆', '7', '7']]) {
    assert.equal(calculateWin(result, 50), 75);
  }
  assert.equal(calculateWin(['7', '◆', '♛'], 100), 0);
});

test('stored zero balance is preserved and invalid values fall back safely', () => {
  assert.equal(restoreBalance('0'), 0);
  assert.equal(restoreBalance('9750'), 9750);
  for (const value of [null, '', ' ', 'NaN', 'Infinity', '-100', '1.5', '9007199254740992']) {
    assert.equal(restoreBalance(value), 10000);
  }
});
