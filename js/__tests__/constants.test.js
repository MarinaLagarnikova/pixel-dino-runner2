import {
  CANVAS_W, CANVAS_H, GROUND_Y, INITIAL_SPEED, SPRITE_SCALE,
  MAX_SPEED, SPEED_INCREMENT, BG_PARALLAX, SCORE_RATE,
  DINO_FRAME_DURATION, DINO_RUN_FRAME_COUNT, BG_ELEMENT_COUNT,
  GROUND_DASH_CYCLE,
} from '../constants.js';

test('CANVAS_W is 800', () => expect(CANVAS_W).toBe(800));
test('CANVAS_H is 300', () => expect(CANVAS_H).toBe(300));
test('GROUND_Y is less than CANVAS_H', () => expect(GROUND_Y).toBeLessThan(CANVAS_H));
test('INITIAL_SPEED is positive', () => expect(INITIAL_SPEED).toBeGreaterThan(0));
test('SPRITE_SCALE is between 0 and 1', () => {
  expect(SPRITE_SCALE).toBeGreaterThan(0);
  expect(SPRITE_SCALE).toBeLessThan(1);
});

test('MAX_SPEED is greater than INITIAL_SPEED', () => {
  expect(MAX_SPEED).toBeGreaterThan(INITIAL_SPEED);
});
test('SPEED_INCREMENT is positive', () => {
  expect(SPEED_INCREMENT).toBeGreaterThan(0);
});
test('BG_PARALLAX is between 0 and 1', () => {
  expect(BG_PARALLAX).toBeGreaterThan(0);
  expect(BG_PARALLAX).toBeLessThan(1);
});
test('SCORE_RATE is positive', () => {
  expect(SCORE_RATE).toBeGreaterThan(0);
});
test('DINO_FRAME_DURATION is positive', () => {
  expect(DINO_FRAME_DURATION).toBeGreaterThan(0);
});
test('DINO_RUN_FRAME_COUNT is at least 2', () => {
  expect(DINO_RUN_FRAME_COUNT).toBeGreaterThanOrEqual(2);
});
test('BG_ELEMENT_COUNT is positive', () => {
  expect(BG_ELEMENT_COUNT).toBeGreaterThan(0);
});
test('GROUND_DASH_CYCLE is positive', () => {
  expect(GROUND_DASH_CYCLE).toBeGreaterThan(0);
});
