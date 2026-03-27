// js/renderer.js
import { CANVAS_W, CANVAS_H } from './constants.js';
import { drawGround } from './ground.js';
import { drawBackground } from './background.js';
import { drawDino } from './dino.js';
import { drawStartScreen, drawScore, drawPausedScreen, drawGameOverScreen } from './ui.js';

export function clearCanvas(ctx) {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
}

export function renderScene(ctx, state, sprites) {
  clearCanvas(ctx);
  drawBackground(ctx, state.background);
  drawGround(ctx, state.ground);
  drawDino(ctx, state.dino, sprites);
  drawScore(ctx, state.score);
  if (state.status === 'idle') drawStartScreen(ctx);
  if (state.status === 'paused') drawPausedScreen(ctx);
  if (state.status === 'dead') drawGameOverScreen(ctx);
}
