# Stage 1: Мир в движении — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Создать бегущий мир: скроллинг земли, параллакс фона, анимация дино, счёт, стартовый экран.

**Architecture:** Иммутабельное состояние — `update(state, dt)` возвращает новый объект, `main.js` присваивает `let state = update(state, dt)`. Каждый модуль экспортирует чистые функции `update*` и `draw*`.

**Tech Stack:** Vanilla JS (ES modules), HTML5 Canvas, Jest (jsdom), ESLint, jscpd.

**ESLint constraints:** max 50 lines/function, max-depth 3, complexity 10, single quotes, semicolons.

**Sprite data** (from ARCHITECTURE.md, SPRITE_SCALE = 0.35):
- Дино бег: 3 фрейма, 100ms/кадр
- Фрейм 0: sx=235, sy=181, sw=322, sh=192, anchorX=161, anchorY=192
- Фрейм 1: sx=598, sy=181, sw=279, sh=192, anchorX=140, anchorY=192
- Фрейм 2: sx=960, sy=181, sw=314, sh=192, anchorX=157, anchorY=192

---

### Task 1: Обновить constants.js — новые константы

**Files:**
- Modify: `js/constants.js`
- Modify: `js/__tests__/constants.test.js`

**Step 1: Добавить тесты для новых констант**

Добавить в конец `js/__tests__/constants.test.js`:

```js
import {
  CANVAS_W, CANVAS_H, GROUND_Y, INITIAL_SPEED, SPRITE_SCALE,
  MAX_SPEED, SPEED_INCREMENT, BG_PARALLAX, SCORE_RATE,
  DINO_FRAME_DURATION, DINO_RUN_FRAME_COUNT, BG_ELEMENT_COUNT,
  GROUND_DASH_CYCLE,
} from '../constants.js';

test('MAX_SPEED is greater than INITIAL_SPEED', () => {
  expect(MAX_SPEED).toBeGreaterThan(INITIAL_SPEED);
});
test('SPEED_INCREMENT is positive', () => {
  expect(SPEED_INCREMENT).toBeGreaterThan(0);
});
test('BG_PARALLAX is between 0 and 1', () => {
  expect(BG_PARALLAX).toBeGreaterThan(0);
  expect(BG_PARALLAX).toBeLessThan(1);
});
test('SCORE_RATE is positive', () => {
  expect(SCORE_RATE).toBeGreaterThan(0);
});
test('DINO_FRAME_DURATION is positive', () => {
  expect(DINO_FRAME_DURATION).toBeGreaterThan(0);
});
test('DINO_RUN_FRAME_COUNT is at least 2', () => {
  expect(DINO_RUN_FRAME_COUNT).toBeGreaterThanOrEqual(2);
});
test('BG_ELEMENT_COUNT is positive', () => {
  expect(BG_ELEMENT_COUNT).toBeGreaterThan(0);
});
test('GROUND_DASH_CYCLE is positive', () => {
  expect(GROUND_DASH_CYCLE).toBeGreaterThan(0);
});
```

**Step 2: Убедиться что тест падает**

```bash
npm test -- --testPathPattern=constants
```
Expected: FAIL — "MAX_SPEED is not exported"

**Step 3: Добавить константы в js/constants.js**

```js
export const CANVAS_W = 800;
export const CANVAS_H = 300;
export const GROUND_Y = 260;
export const INITIAL_SPEED = 300;       // pixels per second
export const SPRITE_SCALE = 0.35;
export const MAX_SPEED = 800;           // pixels per second
export const SPEED_INCREMENT = 30;     // pixels/second per second of acceleration
export const BG_PARALLAX = 0.3;        // background moves at 30% of ground speed
export const SCORE_RATE = 0.005;       // score points per pixel of distance
export const DINO_FRAME_DURATION = 100; // ms per animation frame
export const DINO_RUN_FRAME_COUNT = 3;  // number of run animation frames
export const BG_ELEMENT_COUNT = 5;     // number of background parallax elements
export const GROUND_DASH_CYCLE = 20;   // dash(8) + gap(12) = 20px cycle for ground line
```

**Step 4: Тесты должны пройти**

```bash
npm test -- --testPathPattern=constants
```
Expected: PASS (13 tests)

---

### Task 2: input.js — обработка клавиатуры

**Files:**
- Create: `js/input.js`
- Create: `js/__tests__/input.test.js`

**Step 1: Написать тест**

```js
// js/__tests__/input.test.js
import { jest } from '@jest/globals';
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
```

**Step 2: Убедиться что тест падает**

```bash
npm test -- --testPathPattern=input
```
Expected: FAIL — "Cannot find module '../input.js'"

**Step 3: Реализовать**

```js
// js/input.js
export function createInput() {
  const keys = new Set();
  const onDown = (e) => keys.add(e.code);
  const onUp = (e) => keys.delete(e.code);

  window.addEventListener('keydown', onDown);
  window.addEventListener('keyup', onUp);

  return {
    isPressed: (code) => keys.has(code),
    consume: (code) => {
      const had = keys.has(code);
      keys.delete(code);
      return had;
    },
    destroy: () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    },
  };
}
```

**Step 4: Тесты должны пройти**

```bash
npm test -- --testPathPattern=input
```
Expected: PASS (5 tests)

---

### Task 3: sprites.js — данные фреймов и drawSprite

**Files:**
- Create: `js/sprites.js`
- Create: `js/__tests__/sprites.test.js`

**Step 1: Написать тест**

```js
// js/__tests__/sprites.test.js
import { jest } from '@jest/globals';
import { DINO_RUN_FRAMES, drawSprite } from '../sprites.js';

function makeCtx() {
  return { drawImage: jest.fn() };
}

test('DINO_RUN_FRAMES has 3 frames', () => {
  expect(DINO_RUN_FRAMES.length).toBe(3);
});

test('each DINO_RUN_FRAME has required properties', () => {
  DINO_RUN_FRAMES.forEach(f => {
    expect(typeof f.sx).toBe('number');
    expect(typeof f.sy).toBe('number');
    expect(typeof f.sw).toBe('number');
    expect(typeof f.sh).toBe('number');
    expect(typeof f.anchorX).toBe('number');
    expect(typeof f.anchorY).toBe('number');
  });
});

test('drawSprite calls ctx.drawImage with correct arguments', () => {
  const ctx = makeCtx();
  const img = {};
  const frame = { sx: 10, sy: 20, sw: 100, sh: 50, anchorX: 50, anchorY: 50 };
  drawSprite(ctx, img, frame, 200, 250, 1);
  expect(ctx.drawImage).toHaveBeenCalledWith(
    img, 10, 20, 100, 50, 150, 200, 100, 50
  );
});

test('drawSprite applies scale', () => {
  const ctx = makeCtx();
  const img = {};
  const frame = { sx: 0, sy: 0, sw: 100, sh: 50, anchorX: 50, anchorY: 50 };
  drawSprite(ctx, img, frame, 200, 250, 0.5);
  expect(ctx.drawImage).toHaveBeenCalledWith(
    img, 0, 0, 100, 50, 175, 225, 50, 25
  );
});
```

**Step 2: Убедиться что тест падает**

```bash
npm test -- --testPathPattern=sprites
```
Expected: FAIL

**Step 3: Реализовать**

```js
// js/sprites.js
export const DINO_RUN_FRAMES = [
  { sx: 235, sy: 181, sw: 322, sh: 192, anchorX: 161, anchorY: 192 },
  { sx: 598, sy: 181, sw: 279, sh: 192, anchorX: 140, anchorY: 192 },
  { sx: 960, sy: 181, sw: 314, sh: 192, anchorX: 157, anchorY: 192 },
];

export function drawSprite(ctx, img, frame, x, y, scale) {
  const { sx, sy, sw, sh, anchorX, anchorY } = frame;
  ctx.drawImage(
    img, sx, sy, sw, sh,
    x - anchorX * scale,
    y - anchorY * scale,
    sw * scale,
    sh * scale
  );
}

export function loadSprites() {
  const sheets = {
    dino: 'assets/spritesheet.png',
    cactus: 'assets/cactus-spritesheet.png',
    pterodactyl: 'assets/pterodactylus-spritesheet.png',
  };
  const entries = Object.entries(sheets).map(([id, src]) => loadImage(id, src));
  return Promise.all(entries).then(Object.fromEntries);
}

function loadImage(id, src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve([id, img]);
    img.onerror = reject;
    img.src = src;
  });
}
```

**Step 4: Тесты должны пройти**

```bash
npm test -- --testPathPattern=sprites
```
Expected: PASS (4 tests)

---

### Task 4: ground.js — скроллинг земли

**Files:**
- Create: `js/ground.js`
- Create: `js/__tests__/ground.test.js`

**Step 1: Написать тест**

```js
// js/__tests__/ground.test.js
import { jest } from '@jest/globals';
import { updateGround, drawGround } from '../ground.js';
import { GROUND_DASH_CYCLE, GROUND_Y, CANVAS_W } from '../constants.js';

function makeCtx() {
  return {
    strokeStyle: '',
    lineWidth: 0,
    setLineDash: jest.fn(),
    lineDashOffset: 0,
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    stroke: jest.fn(),
  };
}

test('updateGround increases x by speed*dt', () => {
  const ground = { x: 0 };
  const result = updateGround(ground, 300, 0.1);
  expect(result.x).toBeCloseTo(30);
});

test('updateGround wraps x within GROUND_DASH_CYCLE', () => {
  const ground = { x: GROUND_DASH_CYCLE - 1 };
  const result = updateGround(ground, 300, 0.1);
  expect(result.x).toBeGreaterThanOrEqual(0);
  expect(result.x).toBeLessThan(GROUND_DASH_CYCLE);
});

test('updateGround returns new object (immutable)', () => {
  const ground = { x: 0 };
  const result = updateGround(ground, 300, 0.1);
  expect(result).not.toBe(ground);
});

test('drawGround calls setLineDash and stroke', () => {
  const ctx = makeCtx();
  drawGround(ctx, { x: 5 });
  expect(ctx.setLineDash).toHaveBeenCalled();
  expect(ctx.stroke).toHaveBeenCalled();
});

test('drawGround sets lineDashOffset from ground.x', () => {
  const ctx = makeCtx();
  drawGround(ctx, { x: 10 });
  expect(ctx.lineDashOffset).toBe(-10);
});
```

**Step 2: Убедиться что тест падает**

```bash
npm test -- --testPathPattern=ground
```
Expected: FAIL

**Step 3: Реализовать**

```js
// js/ground.js
import { CANVAS_W, GROUND_Y, GROUND_DASH_CYCLE } from './constants.js';

export function updateGround(ground, speed, dt) {
  const x = (ground.x + speed * dt) % GROUND_DASH_CYCLE;
  return { x };
}

export function drawGround(ctx, ground) {
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 12]);
  ctx.lineDashOffset = -ground.x;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo(CANVAS_W, GROUND_Y);
  ctx.stroke();
  ctx.setLineDash([]);
}
```

**Step 4: Тесты должны пройти**

```bash
npm test -- --testPathPattern=ground
```
Expected: PASS (5 tests)

---

### Task 5: background.js — параллакс фон

**Files:**
- Create: `js/background.js`
- Create: `js/__tests__/background.test.js`

**Step 1: Написать тест**

```js
// js/__tests__/background.test.js
import { jest } from '@jest/globals';
import { createBackground, updateBackground, drawBackground } from '../background.js';
import { BG_ELEMENT_COUNT, CANVAS_W } from '../constants.js';

function makeCtx() {
  return {
    fillStyle: '',
    beginPath: jest.fn(),
    ellipse: jest.fn(),
    fill: jest.fn(),
  };
}

test('createBackground returns elements array of correct length', () => {
  const bg = createBackground();
  expect(Array.isArray(bg.elements)).toBe(true);
  expect(bg.elements.length).toBe(BG_ELEMENT_COUNT);
});

test('createBackground elements have x, y, w properties', () => {
  const bg = createBackground();
  bg.elements.forEach(el => {
    expect(typeof el.x).toBe('number');
    expect(typeof el.y).toBe('number');
    expect(typeof el.w).toBe('number');
  });
});

test('updateBackground moves elements left', () => {
  const bg = { elements: [{ x: 400, y: 50, w: 80 }] };
  const result = updateBackground(bg, 300, 0.1);
  expect(result.elements[0].x).toBeLessThan(400);
});

test('updateBackground respawns element that exits left edge', () => {
  const bg = { elements: [{ x: -100, y: 50, w: 80 }] };
  const result = updateBackground(bg, 300, 0.1);
  expect(result.elements[0].x).toBeGreaterThan(CANVAS_W);
});

test('updateBackground returns new object (immutable)', () => {
  const bg = { elements: [{ x: 400, y: 50, w: 80 }] };
  const result = updateBackground(bg, 300, 0.1);
  expect(result).not.toBe(bg);
  expect(result.elements[0]).not.toBe(bg.elements[0]);
});

test('drawBackground calls fill for each element', () => {
  const ctx = makeCtx();
  const bg = { elements: [{ x: 100, y: 50, w: 80 }, { x: 300, y: 60, w: 70 }] };
  drawBackground(ctx, bg);
  expect(ctx.fill).toHaveBeenCalledTimes(2);
});
```

**Step 2: Убедиться что тест падает**

```bash
npm test -- --testPathPattern=background
```
Expected: FAIL

**Step 3: Реализовать**

```js
// js/background.js
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
```

**Step 4: Тесты должны пройти**

```bash
npm test -- --testPathPattern=background
```
Expected: PASS (6 tests)

---

### Task 6: dino.js — анимация бега

**Files:**
- Create: `js/dino.js`
- Create: `js/__tests__/dino.test.js`

**Step 1: Написать тест**

```js
// js/__tests__/dino.test.js
import { jest } from '@jest/globals';
import { updateDino, drawDino } from '../dino.js';
import { DINO_FRAME_DURATION, DINO_RUN_FRAME_COUNT, SPRITE_SCALE } from '../constants.js';

function makeCtx() {
  return { drawImage: jest.fn() };
}

test('updateDino accumulates frameTimer', () => {
  const dino = { x: 80, y: 260, vy: 0, state: 'run', frame: 0, frameTimer: 0 };
  const result = updateDino(dino, 0.05);
  expect(result.frameTimer).toBeCloseTo(50);
  expect(result.frame).toBe(0);
});

test('updateDino advances frame when timer exceeds duration', () => {
  const dino = { x: 80, y: 260, vy: 0, state: 'run', frame: 0, frameTimer: 90 };
  const result = updateDino(dino, 0.05);
  expect(result.frame).toBe(1);
  expect(result.frameTimer).toBeCloseTo(40);
});

test('updateDino wraps frame back to 0', () => {
  const dino = {
    x: 80, y: 260, vy: 0, state: 'run',
    frame: DINO_RUN_FRAME_COUNT - 1, frameTimer: 90,
  };
  const result = updateDino(dino, 0.05);
  expect(result.frame).toBe(0);
});

test('updateDino returns new object (immutable)', () => {
  const dino = { x: 80, y: 260, vy: 0, state: 'run', frame: 0, frameTimer: 0 };
  const result = updateDino(dino, 0.1);
  expect(result).not.toBe(dino);
});

test('drawDino calls ctx.drawImage', () => {
  const ctx = makeCtx();
  const sprites = { dino: {} };
  const dino = { x: 80, y: 260, frame: 0, state: 'run' };
  drawDino(ctx, dino, sprites);
  expect(ctx.drawImage).toHaveBeenCalled();
});
```

**Step 2: Убедиться что тест падает**

```bash
npm test -- --testPathPattern=dino
```
Expected: FAIL

**Step 3: Реализовать**

```js
// js/dino.js
import { DINO_FRAME_DURATION, DINO_RUN_FRAME_COUNT, SPRITE_SCALE } from './constants.js';
import { DINO_RUN_FRAMES, drawSprite } from './sprites.js';

export function updateDino(dino, dt) {
  const frameTimer = dino.frameTimer + dt * 1000;
  if (frameTimer < DINO_FRAME_DURATION) {
    return { ...dino, frameTimer };
  }
  return {
    ...dino,
    frame: (dino.frame + 1) % DINO_RUN_FRAME_COUNT,
    frameTimer: frameTimer - DINO_FRAME_DURATION,
  };
}

export function drawDino(ctx, dino, sprites) {
  const frame = DINO_RUN_FRAMES[dino.frame % DINO_RUN_FRAMES.length];
  drawSprite(ctx, sprites.dino, frame, dino.x, dino.y, SPRITE_SCALE);
}
```

**Step 4: Тесты должны пройти**

```bash
npm test -- --testPathPattern=dino
```
Expected: PASS (5 tests)

---

### Task 7: score.js — счёт, скорость, localStorage

**Files:**
- Create: `js/score.js`
- Create: `js/__tests__/score.test.js`

**Step 1: Написать тест**

```js
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
```

**Step 2: Убедиться что тест падает**

```bash
npm test -- --testPathPattern=score
```
Expected: FAIL

**Step 3: Реализовать**

```js
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
```

**Step 4: Тесты должны пройти**

```bash
npm test -- --testPathPattern=score
```
Expected: PASS (9 tests)

---

### Task 8: ui.js — стартовый экран и счётчик

**Files:**
- Create: `js/ui.js`
- Create: `js/__tests__/ui.test.js`

**Step 1: Написать тест**

```js
// js/__tests__/ui.test.js
import { jest } from '@jest/globals';
import { drawStartScreen, drawScore } from '../ui.js';

function makeCtx() {
  return {
    fillStyle: '',
    font: '',
    textAlign: '',
    fillText: jest.fn(),
    fillRect: jest.fn(),
  };
}

test('drawStartScreen calls fillText with space hint', () => {
  const ctx = makeCtx();
  drawStartScreen(ctx);
  const calls = ctx.fillText.mock.calls.map(c => c[0]);
  expect(calls.some(t => t.includes('Пробел'))).toBe(true);
});

test('drawScore calls fillText at least twice (current + high)', () => {
  const ctx = makeCtx();
  drawScore(ctx, { current: 100, high: 200 });
  expect(ctx.fillText).toHaveBeenCalledTimes(2);
});

test('drawScore displays floored score values', () => {
  const ctx = makeCtx();
  drawScore(ctx, { current: 42.7, high: 100.1 });
  const calls = ctx.fillText.mock.calls.map(c => c[0]);
  expect(calls.some(t => t.includes('42'))).toBe(true);
  expect(calls.some(t => t.includes('100'))).toBe(true);
});
```

**Step 2: Убедиться что тест падает**

```bash
npm test -- --testPathPattern=ui
```
Expected: FAIL

**Step 3: Реализовать**

```js
// js/ui.js
import { CANVAS_W, CANVAS_H } from './constants.js';

export function drawStartScreen(ctx) {
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('Нажмите Пробел для начала', CANVAS_W / 2, CANVAS_H / 2);
}

export function drawScore(ctx, score) {
  ctx.font = '16px monospace';
  ctx.textAlign = 'right';
  ctx.fillStyle = '#555';
  ctx.fillText(
    `HI ${String(Math.floor(score.high)).padStart(5, '0')}`,
    CANVAS_W - 20,
    30
  );
  ctx.fillText(
    String(Math.floor(score.current)).padStart(5, '0'),
    CANVAS_W - 20,
    50
  );
}
```

**Step 4: Тесты должны пройти**

```bash
npm test -- --testPathPattern=ui
```
Expected: PASS (3 tests)

---

### Task 9: renderer.js — расширить для Stage 1

**Files:**
- Modify: `js/renderer.js`
- Modify: `js/__tests__/renderer.test.js`

**Step 1: Добавить тесты для нового renderScene**

Добавить в конец `js/__tests__/renderer.test.js`:

```js
import { drawGround } from '../ground.js';
import { drawBackground } from '../background.js';
import { drawDino } from '../dino.js';
import { drawStartScreen, drawScore } from '../ui.js';

test('renderScene with idle status calls drawStartScreen path', () => {
  const ctx = makeCtx();
  const state = {
    status: 'idle',
    ground: { x: 0 },
    background: { elements: [] },
    dino: { x: 80, y: 260, frame: 0, state: 'run', frameTimer: 0 },
    score: { current: 0, high: 0 },
  };
  renderScene(ctx, state, { dino: {} });
  expect(ctx.clearRect).toHaveBeenCalled();
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
```

**Step 2: Убедиться что новые тесты падают**

```bash
npm test -- --testPathPattern=renderer
```
Expected: some FAILs (renderScene signature changed)

**Step 3: Обновить renderer.js**

```js
// js/renderer.js
import { CANVAS_W, CANVAS_H } from './constants.js';
import { drawGround } from './ground.js';
import { drawBackground } from './background.js';
import { drawDino } from './dino.js';
import { drawStartScreen, drawScore } from './ui.js';

export function clearCanvas(ctx) {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
}

export function renderScene(ctx, state, sprites) {
  clearCanvas(ctx);
  drawBackground(ctx, state.background);
  drawGround(ctx, state.ground);
  drawDino(ctx, state.dino, sprites);
  drawScore(ctx, state.score);
  if (state.status === 'idle') {
    drawStartScreen(ctx);
  }
}
```

**Step 4: Все тесты должны пройти**

```bash
npm test -- --testPathPattern=renderer
```
Expected: PASS (4 tests)

---

### Task 10: main.js — рефакторинг: иммутабельный update, input, sprites

**Files:**
- Modify: `js/main.js`

Нет отдельных тестов — main.js тестируется интеграционно. Вся логика разнесена по протестированным модулям.

**Step 1: Полностью переписать js/main.js**

```js
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
```

**Step 2: Запустить полный тест-сюит**

```bash
npm test
```
Expected: все тесты проходят (нет регрессий)

---

### Task 11: Обновить ARCHITECTURE.md

**Files:**
- Modify: `ARCHITECTURE.md`

Добавить в таблицу компонентов строки для новых модулей Stage 1, обновив существующий раздел `## Компоненты`:

```markdown
| `ground.js` | Скроллинг земли | updateGround (чистая) + drawGround |
| `background.js` | Параллакс фон | updateBackground (чистая) + drawBackground |
| `dino.js` | Анимация дино | updateDino (чистая) + drawDino |
| `score.js` | Счёт и скорость | updateScore, updateSpeed (чистые) + localStorage |
| `input.js` | Клавиатура | createInput() — замыкание с Set |
| `sprites.js` | Спрайтшиты | loadSprites(), drawSprite(), DINO_RUN_FRAMES |
| `ui.js` | UI элементы | drawStartScreen, drawScore |
```

Добавить раздел `## Паттерн обновления состояния`:

```markdown
## Паттерн обновления состояния

`update(state, input, dt)` → новый объект состояния (иммутабельно).
`main.js` присваивает `state = update(state, input, dt)`.
Каждый модуль экспортирует `update*` — чистую функцию над своим срезом состояния.
```

---

### Task 12: Финальная валидация и коммит

**Step 1: Запустить полную валидацию**

```bash
npm run validate
```
Expected: lint ✓, cpd ✓, tests ✓ (все suite'ы проходят)

**Step 2: Если есть ошибки — исправить**

Типичные проблемы Stage 1:
- `no-unused-vars` — проверить импорты в renderer.js
- `max-lines-per-function` — если функция превысила 50 строк, вынести часть в helper
- `complexity` — если > 10, разбить на подфункции

**Step 3: Коммит**

```bash
git add js/ ARCHITECTURE.md docs/plans/
git commit -m "Этап 1: мир в движении — земля, параллакс, анимация дино, счёт"
```
