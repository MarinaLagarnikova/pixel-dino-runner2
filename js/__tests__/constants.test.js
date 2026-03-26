import { CANVAS_W, CANVAS_H, GROUND_Y, INITIAL_SPEED, SPRITE_SCALE } from '../constants.js';

test('CANVAS_W is 800', () => expect(CANVAS_W).toBe(800));
test('CANVAS_H is 300', () => expect(CANVAS_H).toBe(300));
test('GROUND_Y is less than CANVAS_H', () => expect(GROUND_Y).toBeLessThan(CANVAS_H));
test('INITIAL_SPEED is positive', () => expect(INITIAL_SPEED).toBeGreaterThan(0));
test('SPRITE_SCALE is between 0 and 1', () => {
  expect(SPRITE_SCALE).toBeGreaterThan(0);
  expect(SPRITE_SCALE).toBeLessThan(1);
});
