// js/__tests__/score.test.js
import { jest } from '@jest/globals';
import {
  updateScore, updateSpeed, loadHighScore, saveHighScore,
} from '../score.js';
import { INITIAL_SPEED, MAX_SPEED } from '../constants.js';

test('updateScore increases current score', () => {
  const score = { current: 0, high: 0 };
  const result = updateScore(score, 300, 0.1);
  expect(result.current).toBeGreaterThan(0);
});

test('updateScore updates high when current exceeds it', () => {
  const score = { current: 50, high: 40 };
  const result = updateScore(score, 300, 0.1);
  expect(result.high).toBeGreaterThanOrEqual(result.current);
});

test('updateScore preserves high when current is lower', () => {
  const score = { current: 0, high: 100 };
  const result = updateScore(score, 300, 0.1);
  expect(result.high).toBe(100);
});

test('updateScore returns new object (immutable)', () => {
  const score = { current: 0, high: 0 };
  const result = updateScore(score, 300, 0.1);
  expect(result).not.toBe(score);
});

test('updateSpeed increases speed over time', () => {
  const result = updateSpeed(INITIAL_SPEED, 1);
  expect(result).toBeGreaterThan(INITIAL_SPEED);
});

test('updateSpeed does not exceed MAX_SPEED', () => {
  const result = updateSpeed(MAX_SPEED - 1, 10);
  expect(result).toBe(MAX_SPEED);
});

test('loadHighScore returns 0 when nothing stored', () => {
  jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
  expect(loadHighScore()).toBe(0);
  Storage.prototype.getItem.mockRestore();
});

test('loadHighScore returns stored value', () => {
  jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('42');
  expect(loadHighScore()).toBe(42);
  Storage.prototype.getItem.mockRestore();
});

test('saveHighScore stores floored value', () => {
  const spy = jest.spyOn(Storage.prototype, 'setItem');
  saveHighScore(42.9);
  expect(spy).toHaveBeenCalledWith('highScore', '42');
  spy.mockRestore();
});
