import { CANVAS_W, BG_ELEMENT_COUNT, BG_PARALLAX } from './constants.js';

export function createBackground() {
  const elements = Array.from({ length: BG_ELEMENT_COUNT }, (_, i) => ({
    x: (i / BG_ELEMENT_COUNT) * CANVAS_W,
    y: 40 + Math.floor(Math.random() * 60),
    w: 60 + Math.floor(Math.random() * 40),
  }));
  return { elements };
}

export function updateBackground(bg, speed, dt) {
  const elements = bg.elements.map(el => moveElement(el, speed, dt));
  return { elements };
}

function moveElement(el, speed, dt) {
  const x = el.x - speed * BG_PARALLAX * dt;
  return x + el.w < 0 ? { ...el, x: CANVAS_W + el.w } : { ...el, x };
}

export function drawBackground(ctx, bg) {
  ctx.fillStyle = '#ddd';
  bg.elements.forEach(el => drawCloud(ctx, el));
}

function drawCloud(ctx, el) {
  ctx.beginPath();
  ctx.ellipse(el.x, el.y, el.w / 2, el.w / 4, 0, 0, Math.PI * 2);
  ctx.fill();
}
