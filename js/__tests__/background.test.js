import { jest } from '@jest/globals';
import { createBackground, updateBackground, drawBackground } from '../background.js';
import { BG_ELEMENT_COUNT, CANVAS_W } from '../constants.js';

function makeCtx() {
  return {
    fillStyle: '',
    beginPath: jest.fn(),
    ellipse: jest.fn(),
    fill: jest.fn(),
  };
}

test('createBackground returns elements array of correct length', () => {
  const bg = createBackground();
  expect(Array.isArray(bg.elements)).toBe(true);
  expect(bg.elements.length).toBe(BG_ELEMENT_COUNT);
});

test('createBackground elements have x, y, w properties', () => {
  const bg = createBackground();
  bg.elements.forEach(el => {
    expect(typeof el.x).toBe('number');
    expect(typeof el.y).toBe('number');
    expect(typeof el.w).toBe('number');
  });
});

test('updateBackground moves elements left', () => {
  const bg = { elements: [{ x: 400, y: 50, w: 80 }] };
  const result = updateBackground(bg, 300, 0.1);
  expect(result.elements[0].x).toBeLessThan(400);
});

test('updateBackground respawns element that exits left edge', () => {
  const bg = { elements: [{ x: -100, y: 50, w: 80 }] };
  const result = updateBackground(bg, 300, 0.1);
  expect(result.elements[0].x).toBeGreaterThan(CANVAS_W);
});

test('updateBackground returns new object (immutable)', () => {
  const bg = { elements: [{ x: 400, y: 50, w: 80 }] };
  const result = updateBackground(bg, 300, 0.1);
  expect(result).not.toBe(bg);
  expect(result.elements[0]).not.toBe(bg.elements[0]);
});

test('drawBackground calls fill for each element', () => {
  const ctx = makeCtx();
  const bg = { elements: [{ x: 100, y: 50, w: 80 }, { x: 300, y: 60, w: 70 }] };
  drawBackground(ctx, bg);
  expect(ctx.fill).toHaveBeenCalledTimes(2);
});
