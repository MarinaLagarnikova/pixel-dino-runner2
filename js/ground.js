// js/ground.js
import { CANVAS_W, GROUND_Y, GROUND_DASH_CYCLE } from './constants.js';

export function updateGround(ground, speed, dt) {
  const x = (ground.x + speed * dt) % GROUND_DASH_CYCLE;
  return { x };
}

export function drawGround(ctx, ground) {
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 12]);
  ctx.lineDashOffset = -ground.x;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo(CANVAS_W, GROUND_Y);
  ctx.stroke();
  ctx.setLineDash([]);
}
