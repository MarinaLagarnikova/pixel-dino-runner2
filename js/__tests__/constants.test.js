import {
  CANVAS_W, CANVAS_H, GROUND_Y, INITIAL_SPEED, SPRITE_SCALE,
  MAX_SPEED, SPEED_INCREMENT, BG_PARALLAX, SCORE_RATE,
  DINO_FRAME_DURATION, DINO_RUN_FRAME_COUNT, BG_ELEMENT_COUNT,
  GROUND_DASH_CYCLE,
  OBSTACLE_SPAWN_MIN, OBSTACLE_SPAWN_MAX, OBSTACLE_MIN_GAP, CACTUS_HITBOX_SHRINK,
  DINO_HITBOX_W, DINO_HITBOX_H, DINO_DUCK_HITBOX_W, DINO_DUCK_HITBOX_H,
  DOUBLE_CACTUS_SPACING, OBSTACLE_SPAWN_BUFFER, OBSTACLE_SPAWN_RETRY,
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

test('OBSTACLE_SPAWN_MIN is a positive number', () => {
  expect(typeof OBSTACLE_SPAWN_MIN).toBe('number');
  expect(OBSTACLE_SPAWN_MIN).toBeGreaterThan(0);
});

test('OBSTACLE_SPAWN_MAX > OBSTACLE_SPAWN_MIN', () => {
  expect(OBSTACLE_SPAWN_MAX).toBeGreaterThan(OBSTACLE_SPAWN_MIN);
});

test('OBSTACLE_MIN_GAP is a positive number', () => {
  expect(typeof OBSTACLE_MIN_GAP).toBe('number');
  expect(OBSTACLE_MIN_GAP).toBeGreaterThan(0);
});

test('CACTUS_HITBOX_SHRINK is between 0 and 1', () => {
  expect(CACTUS_HITBOX_SHRINK).toBeGreaterThan(0);
  expect(CACTUS_HITBOX_SHRINK).toBeLessThan(1);
});

test('DINO_HITBOX_W is a positive number', () => {
  expect(typeof DINO_HITBOX_W).toBe('number');
  expect(DINO_HITBOX_W).toBeGreaterThan(0);
});

test('DINO_HITBOX_H is a positive number', () => {
  expect(typeof DINO_HITBOX_H).toBe('number');
  expect(DINO_HITBOX_H).toBeGreaterThan(0);
});

test('DINO_DUCK_HITBOX_W is a positive number', () => {
  expect(typeof DINO_DUCK_HITBOX_W).toBe('number');
  expect(DINO_DUCK_HITBOX_W).toBeGreaterThan(0);
});

test('DINO_DUCK_HITBOX_H is a positive number', () => {
  expect(typeof DINO_DUCK_HITBOX_H).toBe('number');
  expect(DINO_DUCK_HITBOX_H).toBeGreaterThan(0);
});

test('DOUBLE_CACTUS_SPACING is a positive number', () => {
  expect(typeof DOUBLE_CACTUS_SPACING).toBe('number');
  expect(DOUBLE_CACTUS_SPACING).toBeGreaterThan(0);
});

test('OBSTACLE_SPAWN_BUFFER is a positive number', () => {
  expect(typeof OBSTACLE_SPAWN_BUFFER).toBe('number');
  expect(OBSTACLE_SPAWN_BUFFER).toBeGreaterThan(0);
});

test('OBSTACLE_SPAWN_RETRY is a positive number', () => {
  expect(typeof OBSTACLE_SPAWN_RETRY).toBe('number');
  expect(OBSTACLE_SPAWN_RETRY).toBeGreaterThan(0);
});
