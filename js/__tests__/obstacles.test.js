// js/__tests__/obstacles.test.js
import { jest } from '@jest/globals';
import {
  createObstacles,
  updateObstacles,
  checkCollision,
  drawObstacles,
} from '../obstacles.js';
import {
  CANVAS_W, GROUND_Y,
  PTERO_Y_LOW, PTERO_Y_MID, PTERO_Y_HIGH,
  PTERO_SCORE_THRESHOLD, PTERO_FRAME_DURATION,
} from '../constants.js';

function makeCtx() {
  return { drawImage: jest.fn() };
}

function makeSprites() {
  return { cactus: {} };
}

// ── createObstacles ───────────────────────────────────────────────────────────

test('createObstacles returns empty list and positive spawnTimer', () => {
  const obs = createObstacles();
  expect(obs.list).toEqual([]);
  expect(obs.spawnTimer).toBeGreaterThan(0);
});

// ── updateObstacles — movement ────────────────────────────────────────────────

test('obstacles move left by speed * dt', () => {
  const obs = { list: [{ x: 500, type: 'small' }], spawnTimer: 999 };
  const result = updateObstacles(obs, 300, 0.1);
  expect(result.list[0].x).toBeCloseTo(470);
});

test('obstacles off-screen left are removed from list', () => {
  // x=-201 after movement (300*0.016=4.8px) → -205.8 < -200 → removed
  const obs = { list: [{ x: -201, type: 'small' }], spawnTimer: 999 };
  const result = updateObstacles(obs, 300, 0.016);
  expect(result.list).toHaveLength(0);
});

test('updateObstacles returns new object (immutable)', () => {
  const obs = { list: [], spawnTimer: 1 };
  const result = updateObstacles(obs, 300, 0.016);
  expect(result).not.toBe(obs);
  expect(result.list).not.toBe(obs.list);
});

// ── updateObstacles — spawning ────────────────────────────────────────────────

test('when spawnTimer reaches 0, a new obstacle is added', () => {
  const obs = { list: [], spawnTimer: 0.01 };
  const result = updateObstacles(obs, 300, 1.0);
  expect(result.list.length).toBeGreaterThanOrEqual(1);
});

test('spawned obstacle starts at CANVAS_W or beyond', () => {
  const obs = { list: [], spawnTimer: 0.01 };
  const result = updateObstacles(obs, 300, 1.0);
  // last item in list is the newly spawned one (before movement it was at CANVAS_W+50, then moved left by speed*dt)
  // with speed=300, dt=1.0, movement = 300px, so x should be around CANVAS_W+50-300 = ~550
  // We just check it was spawned at >= CANVAS_W before movement, so after movement x >= CANVAS_W - speed*dt
  expect(result.list[result.list.length - 1].x).toBeGreaterThanOrEqual(CANVAS_W - 300 * 1.0);
});

test('spawned obstacle has valid type', () => {
  const obs = { list: [], spawnTimer: 0.01 };
  const result = updateObstacles(obs, 300, 1.0);
  const newObs = result.list[result.list.length - 1];
  expect(['small', 'large', 'double']).toContain(newObs.type);
});

test('after spawn, spawnTimer is reset to a positive value', () => {
  const obs = { list: [], spawnTimer: 0.01 };
  const result = updateObstacles(obs, 300, 1.0);
  expect(result.spawnTimer).toBeGreaterThan(0);
});

test('no spawn when last obstacle is too close (OBSTACLE_MIN_GAP)', () => {
  // obstacle at CANVAS_W+50 (just spawned). After dt=1.0 at speed=300, x = 850-300 = 550.
  // canSpawn checks post-movement list: 550 > CANVAS_W(800) - OBSTACLE_MIN_GAP(300) = 500 → no spawn.
  const obs = { list: [{ x: CANVAS_W + 50, type: 'small' }], spawnTimer: 0.01 };
  const result = updateObstacles(obs, 300, 1.0);
  expect(result.list).toHaveLength(1);
});

// ── checkCollision ────────────────────────────────────────────────────────────

test('checkCollision returns false when list is empty', () => {
  const dino = { x: 80, y: GROUND_Y, state: 'run' };
  expect(checkCollision(dino, [])).toBe(false);
});

test('checkCollision returns false when obstacle is far right', () => {
  const dino = { x: 80, y: GROUND_Y, state: 'run' };
  const obstacle = { x: 700, type: 'small' };
  expect(checkCollision(dino, [obstacle])).toBe(false);
});

test('checkCollision returns true when dino overlaps obstacle', () => {
  const dino = { x: 80, y: GROUND_Y, state: 'run' };
  // place obstacle directly on dino
  const obstacle = { x: 80, type: 'small' };
  expect(checkCollision(dino, [obstacle])).toBe(true);
});

test('checkCollision returns true for duck dino overlapping obstacle', () => {
  const dino = { x: 80, y: GROUND_Y, state: 'duck' };
  const obstacle = { x: 80, type: 'small' };
  expect(checkCollision(dino, [obstacle])).toBe(true);
});

test('checkCollision returns false for duck dino far from obstacle', () => {
  const dino = { x: 80, y: GROUND_Y, state: 'duck' };
  const obstacle = { x: 700, type: 'small' };
  expect(checkCollision(dino, [obstacle])).toBe(false);
});

// ── drawObstacles ─────────────────────────────────────────────────────────────

test('drawObstacles calls ctx.drawImage once per small obstacle', () => {
  const ctx = makeCtx();
  drawObstacles(ctx, [{ x: 300, type: 'small' }], makeSprites());
  expect(ctx.drawImage).toHaveBeenCalledTimes(1);
});

test('drawObstacles calls ctx.drawImage twice for double obstacle', () => {
  const ctx = makeCtx();
  drawObstacles(ctx, [{ x: 300, type: 'double' }], makeSprites());
  expect(ctx.drawImage).toHaveBeenCalledTimes(2);
});

test('drawObstacles does not draw when list is empty', () => {
  const ctx = makeCtx();
  drawObstacles(ctx, [], makeSprites());
  expect(ctx.drawImage).not.toHaveBeenCalled();
});

// ── pterodactyl animation ────────────────────────────────────────────────────

test('pterodactyl frame advances after PTERO_FRAME_DURATION ms', () => {
  const ptero = { x: 500, type: 'ptero_low', y: PTERO_Y_LOW, frame: 0, frameTimer: 0 };
  const obs = { list: [ptero], spawnTimer: 999 };
  const dt = PTERO_FRAME_DURATION / 1000 + 0.001;
  const result = updateObstacles(obs, 0, dt);
  expect(result.list[0].frame).toBe(1);
});

test('pterodactyl frame wraps around after last frame', () => {
  const ptero = { x: 500, type: 'ptero_high', y: PTERO_Y_HIGH, frame: 2, frameTimer: 0 };
  const obs = { list: [ptero], spawnTimer: 999 };
  const dt = PTERO_FRAME_DURATION / 1000 + 0.001;
  const result = updateObstacles(obs, 0, dt);
  expect(result.list[0].frame).toBe(0);
});

test('pterodactyl moves left (x decreases) each frame', () => {
  const ptero = { x: 500, type: 'ptero_mid', y: PTERO_Y_MID, frame: 0, frameTimer: 0 };
  const obs = { list: [ptero], spawnTimer: 999 };
  const result = updateObstacles(obs, 300, 0.1);
  expect(result.list[0].x).toBeCloseTo(470);
});

// ── pterodactyl spawning ─────────────────────────────────────────────────────

test('score below threshold never spawns pterodactyl (20 trials)', () => {
  const cactusTypes = ['small', 'large', 'double'];
  for (let i = 0; i < 20; i++) {
    const obs = { list: [], spawnTimer: 0.01 };
    const result = updateObstacles(obs, 300, 1.0, 0);
    if (result.list.length > 0) {
      const t = result.list[result.list.length - 1].type;
      expect(cactusTypes).toContain(t);
    }
  }
});

test('score above threshold can produce a valid obstacle type', () => {
  const allTypes = ['small', 'large', 'double', 'ptero_low', 'ptero_mid', 'ptero_high'];
  const obs = { list: [], spawnTimer: 0.01 };
  const result = updateObstacles(obs, 300, 1.0, PTERO_SCORE_THRESHOLD + 1);
  if (result.list.length > 0) {
    expect(allTypes).toContain(result.list[result.list.length - 1].type);
  }
});

test('spawned pterodactyl has y, frame, frameTimer fields', () => {
  let pteroObs = null;
  for (let i = 0; i < 50 && !pteroObs; i++) {
    const obs = { list: [], spawnTimer: 0.01 };
    const result = updateObstacles(obs, 300, 1.0, PTERO_SCORE_THRESHOLD + 1);
    const last = result.list[result.list.length - 1];
    if (last && last.type.startsWith('ptero_')) pteroObs = last;
  }
  if (pteroObs) {
    expect(typeof pteroObs.y).toBe('number');
    expect(pteroObs.frame).toBe(0);
    expect(pteroObs.frameTimer).toBe(0);
  }
});

// ── pterodactyl collision ────────────────────────────────────────────────────

test('checkCollision ptero_mid: standing dino collides', () => {
  const dino = { x: 80, y: GROUND_Y, state: 'run' };
  const ptero = { x: 80, type: 'ptero_mid', y: PTERO_Y_MID, frame: 0, frameTimer: 0 };
  expect(checkCollision(dino, [ptero])).toBe(true);
});

test('checkCollision ptero_mid: ducking dino does not collide', () => {
  const dino = { x: 80, y: GROUND_Y, state: 'duck' };
  const ptero = { x: 80, type: 'ptero_mid', y: PTERO_Y_MID, frame: 0, frameTimer: 0 };
  expect(checkCollision(dino, [ptero])).toBe(false);
});

test('checkCollision ptero_high: standing dino does not collide', () => {
  const dino = { x: 80, y: GROUND_Y, state: 'run' };
  const ptero = { x: 80, type: 'ptero_high', y: PTERO_Y_HIGH, frame: 0, frameTimer: 0 };
  expect(checkCollision(dino, [ptero])).toBe(false);
});

test('checkCollision ptero_low: ducking dino still collides', () => {
  const dino = { x: 80, y: GROUND_Y, state: 'duck' };
  const ptero = { x: 80, type: 'ptero_low', y: PTERO_Y_LOW, frame: 0, frameTimer: 0 };
  expect(checkCollision(dino, [ptero])).toBe(true);
});

// ── pterodactyl drawing ──────────────────────────────────────────────────────

test('drawObstacles calls drawImage once for pterodactyl', () => {
  const ctx = makeCtx();
  const sprites = { cactus: {}, pterodactyl: {} };
  const ptero = { x: 300, type: 'ptero_low', y: PTERO_Y_LOW, frame: 0, frameTimer: 0 };
  drawObstacles(ctx, [ptero], sprites);
  expect(ctx.drawImage).toHaveBeenCalledTimes(1);
});
