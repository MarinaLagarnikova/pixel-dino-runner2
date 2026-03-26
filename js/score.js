// js/score.js
import { SCORE_RATE, SPEED_INCREMENT, MAX_SPEED } from './constants.js';

export function updateScore(score, speed, dt) {
  const current = score.current + speed * dt * SCORE_RATE;
  const high = Math.max(score.high, current);
  return { current, high };
}

export function updateSpeed(speed, dt) {
  return Math.min(speed + SPEED_INCREMENT * dt, MAX_SPEED);
}

export function loadHighScore() {
  return Number(localStorage.getItem('highScore') || '0');
}

export function saveHighScore(score) {
  localStorage.setItem('highScore', String(Math.floor(score)));
}
