// js/dino.js
import { DINO_FRAME_DURATION, DINO_RUN_FRAME_COUNT, SPRITE_SCALE } from './constants.js';
import { DINO_RUN_FRAMES, drawSprite } from './sprites.js';

export function updateDino(dino, dt) {
  const frameTimer = dino.frameTimer + dt * 1000;
  if (frameTimer < DINO_FRAME_DURATION) {
    return { ...dino, frameTimer };
  }
  return {
    ...dino,
    frame: (dino.frame + 1) % DINO_RUN_FRAME_COUNT,
    frameTimer: frameTimer - DINO_FRAME_DURATION,
  };
}

export function drawDino(ctx, dino, sprites) {
  const frame = DINO_RUN_FRAMES[dino.frame % DINO_RUN_FRAMES.length];
  drawSprite(ctx, sprites.dino, frame, dino.x, dino.y, SPRITE_SCALE);
}
