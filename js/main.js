import { CANVAS_W, CANVAS_H, GROUND_Y, INITIAL_SPEED } from './constants.js';
import { createLoop } from './gameLoop.js';
import { renderScene } from './renderer.js';

function createInitialState() {
  return {
    dino: { x: 80, y: GROUND_Y, vy: 0, state: 'run', frame: 0, frameTimer: 0 },
    obstacles: [],
    score: 0,
    speed: INITIAL_SPEED,
    status: 'idle',
  };
}

function getCanvas() {
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) throw new Error('Canvas element not found');
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  return canvas;
}

function main() {
  const canvas = getCanvas();
  const ctx = canvas.getContext('2d');
  const state = createInitialState();

  const loop = createLoop(
    (_dt) => { /* update — будет реализован в следующих этапах */ },
    () => renderScene(ctx, state),
  );

  loop.start();
}

main();
