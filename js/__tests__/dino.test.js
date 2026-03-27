// js/__tests__/dino.test.js
import { jest } from '@jest/globals';
import { updateDino, drawDino } from '../dino.js';
import { DINO_RUN_FRAME_COUNT, GROUND_Y, DINO_JUMP_VY } from '../constants.js';

// ── helpers ──────────────────────────────────────────────────────────────────

function makeInput({ consumed = [], pressed = [] } = {}) {
  const toConsume = [...consumed];
  return {
    isPressed: (code) => pressed.includes(code),
    consume: (code) => {
      const idx = toConsume.indexOf(code);
      if (idx >= 0) { toConsume.splice(idx, 1); return true; }
      return false;
    },
  };
}

function makeDino(overrides = {}) {
  return { x: 80, y: GROUND_Y, vy: 0, state: 'run', frame: 0, frameTimer: 0, ...overrides };
}

function makeCtx() {
  return { drawImage: jest.fn() };
}

// ── run animation (existing, updated signature) ───────────────────────────────

test('updateDino accumulates frameTimer while running', () => {
  const dino = makeDino();
  const result = updateDino(dino, makeInput(), 0.05);
  expect(result.frameTimer).toBeCloseTo(50);
  expect(result.frame).toBe(0);
});

test('updateDino advances frame when timer exceeds duration', () => {
  const dino = makeDino({ frameTimer: 90 });
  const result = updateDino(dino, makeInput(), 0.05);
  expect(result.frame).toBe(1);
  expect(result.frameTimer).toBeCloseTo(40);
});

test('updateDino wraps frame back to 0', () => {
  const dino = makeDino({ frame: DINO_RUN_FRAME_COUNT - 1, frameTimer: 90 });
  const result = updateDino(dino, makeInput(), 0.05);
  expect(result.frame).toBe(0);
});

test('updateDino returns new object (immutable)', () => {
  const dino = makeDino();
  expect(updateDino(dino, makeInput(), 0.1)).not.toBe(dino);
});

// ── jump ─────────────────────────────────────────────────────────────────────

test('Space triggers jump: state becomes jump, vy < 0', () => {
  const dino = makeDino();
  const result = updateDino(dino, makeInput({ consumed: ['Space'] }), 0);
  expect(result.state).toBe('jump');
  expect(result.vy).toBeLessThan(0);
});

test('ArrowUp triggers jump', () => {
  const dino = makeDino();
  const result = updateDino(dino, makeInput({ consumed: ['ArrowUp'] }), 0);
  expect(result.state).toBe('jump');
});

test('double jump is blocked: second Space while airborne does nothing', () => {
  const dino = makeDino({ state: 'jump', vy: -300, y: GROUND_Y - 40 });
  const result = updateDino(dino, makeInput({ consumed: ['Space'] }), 0.016);
  expect(result.state).toBe('jump');
  expect(result.vy).not.toBe(DINO_JUMP_VY); // vy was not reset to jump velocity
});

// ── gravity ───────────────────────────────────────────────────────────────────

test('gravity increases vy while airborne', () => {
  const dino = makeDino({ state: 'jump', vy: -600, y: GROUND_Y - 50 });
  const result = updateDino(dino, makeInput(), 0.1);
  expect(result.vy).toBeGreaterThan(-600);
});

test('dino lands when y reaches GROUND_Y', () => {
  // near ground, falling down
  const dino = makeDino({ state: 'jump', vy: 10, y: GROUND_Y - 1 });
  const result = updateDino(dino, makeInput(), 0.1);
  expect(result.y).toBe(GROUND_Y);
  expect(result.vy).toBe(0);
  expect(result.state).toBe('run');
});

// ── fast fall ─────────────────────────────────────────────────────────────────

test('ArrowDown while airborne applies fast-fall gravity', () => {
  const dino = makeDino({ state: 'jump', vy: -300, y: GROUND_Y - 50 });
  const normal = updateDino(dino, makeInput(), 0.1);
  const fastFall = updateDino(dino, makeInput({ pressed: ['ArrowDown'] }), 0.1);
  // fast-fall vy increases faster (more positive) than normal gravity
  expect(fastFall.vy).toBeGreaterThan(normal.vy);
});

test('landing with ArrowDown held switches state to duck', () => {
  const dino = makeDino({ state: 'jump', vy: 100, y: GROUND_Y - 1 });
  const result = updateDino(dino, makeInput({ pressed: ['ArrowDown'] }), 0.1);
  expect(result.state).toBe('duck');
  expect(result.y).toBe(GROUND_Y);
});

// ── duck ─────────────────────────────────────────────────────────────────────

test('ArrowDown on ground sets state to duck', () => {
  const dino = makeDino();
  const result = updateDino(dino, makeInput({ pressed: ['ArrowDown'] }), 0.016);
  expect(result.state).toBe('duck');
});

test('releasing ArrowDown on ground reverts to run', () => {
  const dino = makeDino({ state: 'duck' });
  const result = updateDino(dino, makeInput(), 0.016);
  expect(result.state).toBe('run');
});

test('duck resets frame animation to 0', () => {
  const dino = makeDino({ state: 'duck', frame: 2, frameTimer: 80 });
  const result = updateDino(dino, makeInput({ pressed: ['ArrowDown'] }), 0.016);
  expect(result.frame).toBe(0);
  expect(result.frameTimer).toBe(0);
});

// ── drawing ───────────────────────────────────────────────────────────────────

test('drawDino calls ctx.drawImage for run state', () => {
  const ctx = makeCtx();
  drawDino(ctx, makeDino({ state: 'run' }), { dino: {} });
  expect(ctx.drawImage).toHaveBeenCalled();
});

test('drawDino calls ctx.drawImage for jump state', () => {
  const ctx = makeCtx();
  drawDino(ctx, makeDino({ state: 'jump', y: GROUND_Y - 30 }), { dino: {} });
  expect(ctx.drawImage).toHaveBeenCalled();
});

test('drawDino calls ctx.drawImage for duck state', () => {
  const ctx = makeCtx();
  drawDino(ctx, makeDino({ state: 'duck' }), { dino: {} });
  expect(ctx.drawImage).toHaveBeenCalled();
});
