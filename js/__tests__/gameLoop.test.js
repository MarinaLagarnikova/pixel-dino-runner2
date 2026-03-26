import { jest } from '@jest/globals';
import { createLoop } from '../gameLoop.js';

test('createLoop returns object with start function', () => {
  const loop = createLoop(() => {}, () => {});
  expect(typeof loop.start).toBe('function');
});

test('update called with dt=0 on first tick', () => {
  const updates = [];
  const loop = createLoop((dt) => updates.push(dt), () => {});

  let rafCb = null;
  jest.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb) => {
    rafCb = cb;
    return 1;
  });

  loop.start();
  rafCb(1000);
  expect(updates[0]).toBe(0);

  globalThis.requestAnimationFrame.mockRestore();
});

test('update called with correct dt on second tick', () => {
  const updates = [];
  const loop = createLoop((dt) => updates.push(dt), () => {});

  const cbs = [];
  jest.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb) => {
    cbs.push(cb);
    return cbs.length;
  });

  loop.start();
  cbs[0](1000);
  cbs[1](1100);
  expect(updates[1]).toBeCloseTo(0.1);

  globalThis.requestAnimationFrame.mockRestore();
});
