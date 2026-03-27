// js/main.js
import { CANVAS_W, CANVAS_H, GROUND_Y, INITIAL_SPEED } from './constants.js';
import { createLoop } from './gameLoop.js';
import { renderScene } from './renderer.js';
import { updateGround } from './ground.js';
import { createBackground, updateBackground } from './background.js';
import { updateDino } from './dino.js';
import { updateScore, updateSpeed, loadHighScore, saveHighScore } from './score.js';
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

function updateIdle(state, input) {
  if (input.consume('Space')) return { ...state, status: 'running' };
  return state;
}

function updatePaused(state, input) {
  if (input.consume('Escape') || input.consume('KeyP')) {
    return { ...state, status: 'running' };
  }
  return state;
}

function updateDead(state, input) {
  if (input.consume('Space') || input.consume('Enter')) {
    return { ...createInitialState(), score: { current: 0, high: state.score.high } };
  }
  return state;
}

function updateWorld(state, input, dt) {
  const speed = updateSpeed(state.speed, dt);
  const ground = updateGround(state.ground, speed, dt);
  const background = updateBackground(state.background, speed, dt);
  const dino = updateDino(state.dino, input, dt);
  const score = updateScore(state.score, speed, dt);
  if (score.high > state.score.high) saveHighScore(score.high);
  return { ...state, speed, ground, background, dino, score };
}

function updateRunning(state, input, dt) {
  if (input.consume('Escape') || input.consume('KeyP')) {
    return { ...state, status: 'paused' };
  }
  return updateWorld(state, input, dt);
}

function update(state, input, dt) {
  if (state.status === 'idle') return updateIdle(state, input);
  if (state.status === 'running') return updateRunning(state, input, dt);
  if (state.status === 'paused') return updatePaused(state, input);
  if (state.status === 'dead') return updateDead(state, input);
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
