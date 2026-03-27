import { jest } from '@jest/globals';
import { drawStartScreen, drawScore, drawPausedScreen, drawGameOverScreen } from '../ui.js';

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

function makeCtxForOverlays() {
  return {
    fillStyle: '',
    fillRect: jest.fn(),
    fillText: jest.fn(),
    font: '',
    textAlign: '',
  };
}

test('drawPausedScreen renders PAUSED text', () => {
  const ctx = makeCtxForOverlays();
  drawPausedScreen(ctx);
  const texts = ctx.fillText.mock.calls.map(c => c[0]);
  expect(texts.some(t => t.includes('PAUSED'))).toBe(true);
});

test('drawGameOverScreen renders GAME OVER text', () => {
  const ctx = makeCtxForOverlays();
  drawGameOverScreen(ctx);
  const texts = ctx.fillText.mock.calls.map(c => c[0]);
  expect(texts.some(t => t.includes('GAME OVER'))).toBe(true);
});

test('drawGameOverScreen renders restart hint', () => {
  const ctx = makeCtxForOverlays();
  drawGameOverScreen(ctx);
  const texts = ctx.fillText.mock.calls.map(c => c[0]);
  expect(texts.some(t => t.includes('Enter') || t.includes('Пробел'))).toBe(true);
});
