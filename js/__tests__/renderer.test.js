import { jest } from '@jest/globals';
import { clearCanvas, renderScene } from '../renderer.js';
import { CANVAS_W, CANVAS_H } from '../constants.js';

function makeCtx() {
  return {
    clearRect: jest.fn(),
    fillRect: jest.fn(),
    fillStyle: '',
  };
}

test('clearCanvas calls clearRect with full canvas size', () => {
  const ctx = makeCtx();
  clearCanvas(ctx);
  expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, CANVAS_W, CANVAS_H);
});

test('renderScene calls clearCanvas', () => {
  const ctx = makeCtx();
  const state = { status: 'idle' };
  renderScene(ctx, state);
  expect(ctx.clearRect).toHaveBeenCalled();
});
