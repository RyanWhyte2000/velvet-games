import test from 'node:test';
import assert from 'node:assert/strict';
import { drawMines, mineMultiplier, PLINKO, rouletteColor } from './casino.mjs';

test('roulette has 18 red, 18 black and one green outcome', () => {
  const colors = Array.from({ length: 37 }, (_, n) => rouletteColor(n));
  assert.equal(colors.filter(c => c === 'red').length, 18);
  assert.equal(colors.filter(c => c === 'black').length, 18);
  assert.equal(rouletteColor(0), 'green');
});

test('mines always draws three unique tiles, including random boundary values', () => {
  for (const random of [() => 0, () => 0.99999999, Math.random]) {
    const mines = drawMines(random);
    assert.equal(new Set(mines).size, 3);
    assert.ok(mines.every(n => Number.isInteger(n) && n >= 0 && n < 25));
  }
});

test('mines payout follows survival probability and increases with each gem', () => {
  assert.equal(mineMultiplier(0), 1);
  assert.equal(mineMultiplier(1), 1.1);
  let probability = 1;
  for (let gems = 1; gems <= 22; gems++) {
    probability *= (23 - gems) / (26 - gems);
    assert.ok(mineMultiplier(gems) > mineMultiplier(gems - 1));
    assert.ok(Math.abs(mineMultiplier(gems) * probability - 0.97) < 0.01);
  }
});

test('plinko payouts are symmetric and cover every eight-bounce path', () => {
  const outcomes = Array(9).fill(0);
  for (let bits = 0; bits < 256; bits++) {
    const bin = bits.toString(2).replaceAll('0', '').length;
    outcomes[bin]++;
    assert.ok(Number.isFinite(PLINKO[bin]));
  }
  assert.deepEqual(outcomes, [1,8,28,56,70,56,28,8,1]);
  assert.deepEqual(PLINKO, [...PLINKO].reverse());
});
