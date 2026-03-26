import { CANVAS_W, CANVAS_H } from './constants.js';

export function clearCanvas(ctx) {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
}

export function renderScene(ctx, _state) {
  clearCanvas(ctx);
}
