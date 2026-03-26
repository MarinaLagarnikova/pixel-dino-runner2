// js/main.js
import { CANVAS_W, CANVAS_H, GROUND_Y, INITIAL_SPEED } from './constants.js';
import { createLoop } from './gameLoop.js';
import { renderScene } from './renderer.js';
import { updateGround } from './ground.js';
import { createBackground, updateBackground } from './background.js';
import { updateDino } from './dino.js';
import { updateScore, updateSpeed, loadHighScore } from './score.js';
import { loadSprites } from './sprites.js';
import { createInput } from './input.js';

function createInitialState() {
  return {
    status: 'idle',
    dino: { x: 80, y: GROUND_Y, vy: 0, state: 'run', frame: 0, frameTimer: 0 },
    ground: { x: 0 },
    background: createBackground(),
    score: { current: 0, high: loadHighScore() },
    speed: INITIAL_SPEED,
  };
}

function updateRunning(state, dt) {
  const speed = updateSpeed(state.speed, dt);
  const ground = updateGround(state.ground, speed, dt);
  const background = updateBackground(state.background, speed, dt);
  const dino = updateDino(state.dino, dt);
  const score = updateScore(state.score, speed, dt);
  return { ...state, speed, ground, background, dino, score };
}

function update(state, input, dt) {
  if (state.status === 'idle' && input.consume('Space')) {
    return { ...state, status: 'running' };
  }
  if (state.status === 'running') {
    return updateRunning(state, dt);
  }
  return state;
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
  const input = createInput();
  let state = createInitialState();

  loadSprites().then(sprites => {
    const loop = createLoop(
      (dt) => { state = update(state, input, dt); },
      () => renderScene(ctx, state, sprites),
    );
    loop.start();
  });
}

main();
