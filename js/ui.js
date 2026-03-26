import { CANVAS_W, CANVAS_H } from './constants.js';

export function drawStartScreen(ctx) {
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('Нажмите Пробел для начала', CANVAS_W / 2, CANVAS_H / 2);
}

export function drawScore(ctx, score) {
  ctx.font = '16px monospace';
  ctx.textAlign = 'right';
  ctx.fillStyle = '#555';
  ctx.fillText(
    `HI ${String(Math.floor(score.high)).padStart(5, '0')}`,
    CANVAS_W - 20,
    30
  );
  ctx.fillText(
    String(Math.floor(score.current)).padStart(5, '0'),
    CANVAS_W - 20,
    50
  );
}
