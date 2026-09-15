export const PLINKO = [10, 3, 1.5, 0.5, 0.2, 0.5, 1.5, 3, 10];
export const RED = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
export function rouletteColor(number) { return number === 0 ? 'green' : RED.includes(number) ? 'red' : 'black'; }
export function mineMultiplier(revealed) {
  let chance = 1;
  for (let i = 0; i < revealed; i++) chance *= (22 - i) / (25 - i);
  return revealed ? Math.floor(0.97 / chance * 100) / 100 : 1;
}
export function drawMines(random = Math.random) {
  const cells = Array.from({ length: 25 }, (_, i) => i);
  for (let i = 24; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  return cells.slice(0, 3);
}
