// js/__tests__/ground.test.js
import { jest } from '@jest/globals';
import { updateGround, drawGround } from '../ground.js';
import { GROUND_DASH_CYCLE } from '../constants.js';

function makeCtx() {
  return {
    setLineDash: jest.fn(),
    stroke: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    strokeStyle: '',
    lineWidth: 0,
    lineDashOffset: 0,
  };
}

test('updateGround increases x by speed*dt', () => {
  const ground = { x: 0 };
  const result = updateGround(ground, 300, 0.1);
  expect(result.x).toBeCloseTo(30);
});

test('updateGround wraps x within GROUND_DASH_CYCLE', () => {
  const ground = { x: GROUND_DASH_CYCLE - 1 };
  const result = updateGround(ground, 300, 0.1);
  expect(result.x).toBeGreaterThanOrEqual(0);
  expect(result.x).toBeLessThan(GROUND_DASH_CYCLE);
});

test('updateGround returns new object (immutable)', () => {
  const ground = { x: 0 };
  const result = updateGround(ground, 300, 0.1);
  expect(result).not.toBe(ground);
});

test('drawGround calls setLineDash and stroke', () => {
  const ctx = makeCtx();
  drawGround(ctx, { x: 5 });
  expect(ctx.setLineDash).toHaveBeenCalled();
  expect(ctx.stroke).toHaveBeenCalled();
});

test('drawGround sets lineDashOffset from ground.x', () => {
  const ctx = makeCtx();
  drawGround(ctx, { x: 10 });
  expect(ctx.lineDashOffset).toBe(-10);
});
