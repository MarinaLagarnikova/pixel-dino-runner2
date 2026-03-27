// js/dino.js
import {
  DINO_FRAME_DURATION, DINO_RUN_FRAME_COUNT, SPRITE_SCALE, GROUND_Y,
  DINO_JUMP_VY, DINO_GRAVITY, DINO_FAST_FALL_GRAVITY,
} from './constants.js';
import { DINO_RUN_FRAMES, DINO_JUMP_FRAME, DINO_DUCK_FRAME, drawSprite } from './sprites.js';

function applyJump(dino, input) {
  if (dino.state === 'jump') return dino;
  if (!input.consume('Space') && !input.consume('ArrowUp')) return dino;
  return { ...dino, state: 'jump', vy: DINO_JUMP_VY };
}

function applyGroundDuck(dino, input) {
  const ducking = input.isPressed('ArrowDown');
  return { ...dino, state: ducking ? 'duck' : 'run' };
}

function getGravity(input) {
  return input.isPressed('ArrowDown') ? DINO_FAST_FALL_GRAVITY : DINO_GRAVITY;
}

function applyPhysics(dino, input, dt) {
  if (dino.state !== 'jump') return dino;
  const vy = dino.vy + getGravity(input) * dt;
  const y = dino.y + vy * dt;
  // vy >= 0 prevents premature landing when a large dt integrates past GROUND_Y on the way up
  if (y >= GROUND_Y && vy >= 0) {
    const landed = input.isPressed('ArrowDown') ? 'duck' : 'run';
    return { ...dino, y: GROUND_Y, vy: 0, state: landed };
  }
  return { ...dino, y: Math.min(y, GROUND_Y), vy };
}

function advanceAnimation(dino, dt) {
  if (dino.state !== 'run') return { ...dino, frame: 0, frameTimer: 0 };
  const frameTimer = dino.frameTimer + dt * 1000;
  if (frameTimer < DINO_FRAME_DURATION) return { ...dino, frameTimer };
  return {
    ...dino,
    frame: (dino.frame + 1) % DINO_RUN_FRAME_COUNT,
    frameTimer: frameTimer - DINO_FRAME_DURATION,
  };
}

export function updateDino(dino, input, dt) {
  const afterJump = applyJump(dino, input);
  const afterDuck = afterJump.state === 'jump' ? afterJump : applyGroundDuck(afterJump, input);
  const afterPhysics = applyPhysics(afterDuck, input, dt);
  return advanceAnimation(afterPhysics, dt);
}

function getDinoFrame(dino) {
  if (dino.state === 'jump') return DINO_JUMP_FRAME;
  if (dino.state === 'duck') return DINO_DUCK_FRAME;
  return DINO_RUN_FRAMES[dino.frame % DINO_RUN_FRAMES.length];
}

export function drawDino(ctx, dino, sprites) {
  drawSprite(ctx, sprites.dino, getDinoFrame(dino), dino.x, dino.y, SPRITE_SCALE);
}
