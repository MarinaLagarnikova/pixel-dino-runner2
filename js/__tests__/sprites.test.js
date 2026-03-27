import { jest } from '@jest/globals';
import { DINO_RUN_FRAMES, drawSprite, CACTUS_SMALL_FRAME, CACTUS_LARGE_FRAME } from '../sprites.js';

function makeCtx() {
  return { drawImage: jest.fn() };
}

test('DINO_RUN_FRAMES has 3 frames', () => {
  expect(DINO_RUN_FRAMES.length).toBe(3);
});

test('each DINO_RUN_FRAME has required properties', () => {
  DINO_RUN_FRAMES.forEach(f => {
    expect(typeof f.sx).toBe('number');
    expect(typeof f.sy).toBe('number');
    expect(typeof f.sw).toBe('number');
    expect(typeof f.sh).toBe('number');
    expect(typeof f.anchorX).toBe('number');
    expect(typeof f.anchorY).toBe('number');
  });
});

test('drawSprite calls ctx.drawImage with correct arguments', () => {
  const ctx = makeCtx();
  const img = {};
  const frame = { sx: 10, sy: 20, sw: 100, sh: 50, anchorX: 50, anchorY: 50 };
  drawSprite(ctx, img, frame, 200, 250, 1);
  expect(ctx.drawImage).toHaveBeenCalledWith(
    img, 10, 20, 100, 50, 150, 200, 100, 50
  );
});

test('drawSprite applies scale', () => {
  const ctx = makeCtx();
  const img = {};
  const frame = { sx: 0, sy: 0, sw: 100, sh: 50, anchorX: 50, anchorY: 50 };
  drawSprite(ctx, img, frame, 200, 250, 0.5);
  expect(ctx.drawImage).toHaveBeenCalledWith(
    img, 0, 0, 100, 50, 175, 225, 50, 25
  );
});

test('CACTUS_SMALL_FRAME has required sprite fields', () => {
  for (const key of ['sx', 'sy', 'sw', 'sh', 'anchorX', 'anchorY']) {
    expect(typeof CACTUS_SMALL_FRAME[key]).toBe('number');
  }
});

test('CACTUS_LARGE_FRAME has required sprite fields', () => {
  for (const key of ['sx', 'sy', 'sw', 'sh', 'anchorX', 'anchorY']) {
    expect(typeof CACTUS_LARGE_FRAME[key]).toBe('number');
  }
});
