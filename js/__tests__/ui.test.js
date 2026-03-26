import { jest } from '@jest/globals';
import { drawStartScreen, drawScore } from '../ui.js';

function makeCtx() {
  return {
    fillStyle: '',
    font: '',
    textAlign: '',
    fillText: jest.fn(),
    fillRect: jest.fn(),
  };
}

test('drawStartScreen calls fillText with space hint', () => {
  const ctx = makeCtx();
  drawStartScreen(ctx);
  const calls = ctx.fillText.mock.calls.map(c => c[0]);
  expect(calls.some(t => t.includes('Пробел'))).toBe(true);
});

test('drawScore calls fillText at least twice (current + high)', () => {
  const ctx = makeCtx();
  drawScore(ctx, { current: 100, high: 200 });
  expect(ctx.fillText).toHaveBeenCalledTimes(2);
});

test('drawScore displays floored score values', () => {
  const ctx = makeCtx();
  drawScore(ctx, { current: 42.7, high: 100.1 });
  const calls = ctx.fillText.mock.calls.map(c => c[0]);
  expect(calls.some(t => t.includes('42'))).toBe(true);
  expect(calls.some(t => t.includes('100'))).toBe(true);
});
