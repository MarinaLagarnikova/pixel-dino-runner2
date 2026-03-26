import { createInput } from '../input.js';

let input;
beforeEach(() => { input = createInput(); });
afterEach(() => { input.destroy(); });

test('isPressed returns false initially', () => {
  expect(input.isPressed('Space')).toBe(false);
});

test('isPressed returns true after keydown', () => {
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
  expect(input.isPressed('Space')).toBe(true);
});

test('isPressed returns false after keyup', () => {
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
  window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space' }));
  expect(input.isPressed('Space')).toBe(false);
});

test('consume returns true and removes key', () => {
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
  expect(input.consume('Space')).toBe(true);
  expect(input.isPressed('Space')).toBe(false);
});

test('consume returns false if key not pressed', () => {
  expect(input.consume('Space')).toBe(false);
});
