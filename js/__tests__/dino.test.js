// js/__tests__/dino.test.js
import { jest } from '@jest/globals';
import { updateDino, drawDino } from '../dino.js';
import { DINO_RUN_FRAME_COUNT } from '../constants.js';

function makeCtx() {
  return { drawImage: jest.fn() };
}

test('updateDino accumulates frameTimer', () => {
  const dino = { x: 80, y: 260, vy: 0, state: 'run', frame: 0, frameTimer: 0 };
  const result = updateDino(dino, 0.05);
  expect(result.frameTimer).toBeCloseTo(50);
  expect(result.frame).toBe(0);
});

test('updateDino advances frame when timer exceeds duration', () => {
  const dino = { x: 80, y: 260, vy: 0, state: 'run', frame: 0, frameTimer: 90 };
  const result = updateDino(dino, 0.05);
  expect(result.frame).toBe(1);
  expect(result.frameTimer).toBeCloseTo(40);
});

test('updateDino wraps frame back to 0', () => {
  const dino = {
    x: 80, y: 260, vy: 0, state: 'run',
    frame: DINO_RUN_FRAME_COUNT - 1, frameTimer: 90,
  };
  const result = updateDino(dino, 0.05);
  expect(result.frame).toBe(0);
});

test('updateDino returns new object (immutable)', () => {
  const dino = { x: 80, y: 260, vy: 0, state: 'run', frame: 0, frameTimer: 0 };
  const result = updateDino(dino, 0.1);
  expect(result).not.toBe(dino);
});

test('drawDino calls ctx.drawImage', () => {
  const ctx = makeCtx();
  const sprites = { dino: {} };
  const dino = { x: 80, y: 260, frame: 0, state: 'run' };
  drawDino(ctx, dino, sprites);
  expect(ctx.drawImage).toHaveBeenCalled();
});
