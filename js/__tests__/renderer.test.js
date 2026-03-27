import { jest } from '@jest/globals';
import { clearCanvas, renderScene } from '../renderer.js';
import { CANVAS_W, CANVAS_H } from '../constants.js';

function makeCtx() {
  return {
    clearRect: jest.fn(),
    fillRect: jest.fn(),
    fillStyle: '',
    fillText: jest.fn(),
    font: '',
    textAlign: '',
    strokeStyle: '',
    lineWidth: 0,
    setLineDash: jest.fn(),
    lineDashOffset: 0,
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    stroke: jest.fn(),
    ellipse: jest.fn(),
    fill: jest.fn(),
    drawImage: jest.fn(),
  };
}

test('clearCanvas calls clearRect with full canvas size', () => {
  const ctx = makeCtx();
  clearCanvas(ctx);
  expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, CANVAS_W, CANVAS_H);
});

function makeIdleState() {
  return {
    status: 'idle',
    ground: { x: 0 },
    background: { elements: [] },
    dino: { x: 80, y: 260, frame: 0, state: 'run', frameTimer: 0 },
    score: { current: 0, high: 0 },
  };
}

test('renderScene calls clearCanvas', () => {
  const ctx = makeCtx();
  renderScene(ctx, makeIdleState(), { dino: {} });
  expect(ctx.clearRect).toHaveBeenCalled();
});

test('renderScene with idle status calls drawStartScreen path', () => {
  const ctx = makeCtx();
  const state = makeIdleState();
  renderScene(ctx, state, { dino: {} });
  const textCalls = ctx.fillText.mock.calls.map(c => c[0]);
  expect(textCalls.some(t => t.includes('Пробел'))).toBe(true);
});

test('renderScene accepts sprites as third argument', () => {
  const ctx = makeCtx();
  const state = {
    status: 'running',
    ground: { x: 0 },
    background: { elements: [] },
    dino: { x: 80, y: 260, frame: 0, state: 'run', frameTimer: 0 },
    score: { current: 10, high: 10 },
  };
  expect(() => renderScene(ctx, state, { dino: {} })).not.toThrow();
});

test('renderScene with paused status renders PAUSED overlay', () => {
  const ctx = makeCtx();
  renderScene(ctx, { ...makeIdleState(), status: 'paused' }, { dino: {} });
  const texts = ctx.fillText.mock.calls.map(c => c[0]);
  expect(texts.some(t => t.includes('PAUSED'))).toBe(true);
});

test('renderScene with dead status renders GAME OVER overlay', () => {
  const ctx = makeCtx();
  renderScene(ctx, { ...makeIdleState(), status: 'dead' }, { dino: {} });
  const texts = ctx.fillText.mock.calls.map(c => c[0]);
  expect(texts.some(t => t.includes('GAME OVER'))).toBe(true);
});
