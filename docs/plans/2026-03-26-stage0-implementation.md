# Stage 0: Project Initialization — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Создать рабочий скелет игры: canvas 800×300, игровой цикл с delta-time, очистка и перерисовка каждый кадр, `npm run validate` проходит.

**Architecture:** Функциональные модули с явной передачей состояния. Нет классов, нет `this`. Единственное глобальное состояние живёт в `main.js`.

**Tech Stack:** Vanilla JS (ES modules), HTML5 Canvas, CSS, Jest (jsdom), ESLint, jscpd.

**ESLint constraints:** max 50 lines/function, max-depth 3, complexity 10, single quotes, semicolons.

---

### Task 1: constants.js — игровые параметры

**Files:**
- Create: `js/constants.js`
- Create: `js/__tests__/constants.test.js`

**Step 1: Написать тест**

```js
// js/__tests__/constants.test.js
import { CANVAS_W, CANVAS_H, GROUND_Y, INITIAL_SPEED } from '../constants.js';

test('CANVAS_W is 800', () => expect(CANVAS_W).toBe(800));
test('CANVAS_H is 300', () => expect(CANVAS_H).toBe(300));
test('GROUND_Y is less than CANVAS_H', () => expect(GROUND_Y).toBeLessThan(CANVAS_H));
test('INITIAL_SPEED is positive', () => expect(INITIAL_SPEED).toBeGreaterThan(0));
```

**Step 2: Убедиться что тест падает**

```bash
npm test -- --testPathPattern=constants
```
Expected: FAIL — "Cannot find module '../constants.js'"

**Step 3: Реализовать**

```js
// js/constants.js
export const CANVAS_W = 800;
export const CANVAS_H = 300;
export const GROUND_Y = 260;
export const INITIAL_SPEED = 300;
export const SPRITE_SCALE = 0.35;
```

**Step 4: Тест должен пройти**

```bash
npm test -- --testPathPattern=constants
```
Expected: PASS (4 tests)

---

### Task 2: gameLoop.js — requestAnimationFrame + delta-time

**Files:**
- Create: `js/gameLoop.js`
- Create: `js/__tests__/gameLoop.test.js`

**Step 1: Написать тест**

```js
// js/__tests__/gameLoop.test.js
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
```

**Step 2: Убедиться что тест падает**

```bash
npm test -- --testPathPattern=gameLoop
```
Expected: FAIL

**Step 3: Реализовать**

```js
// js/gameLoop.js
export function createLoop(update, render) {
  let prevTime = null;

  function tick(timestamp) {
    const dt = prevTime !== null ? (timestamp - prevTime) / 1000 : 0;
    prevTime = timestamp;
    update(dt);
    render();
    requestAnimationFrame(tick);
  }

  return { start: () => requestAnimationFrame(tick) };
}
```

**Step 4: Тест должен пройти**

```bash
npm test -- --testPathPattern=gameLoop
```
Expected: PASS (3 tests)

---

### Task 3: renderer.js — очистка и отрисовка canvas

**Files:**
- Create: `js/renderer.js`
- Create: `js/__tests__/renderer.test.js`

**Step 1: Написать тест**

```js
// js/__tests__/renderer.test.js
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
```

**Step 2: Убедиться что тест падает**

```bash
npm test -- --testPathPattern=renderer
```
Expected: FAIL

**Step 3: Реализовать**

```js
// js/renderer.js
import { CANVAS_W, CANVAS_H } from './constants.js';

export function clearCanvas(ctx) {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
}

export function renderScene(ctx, _state) {
  clearCanvas(ctx);
}
```

**Step 4: Тест должен пройти**

```bash
npm test -- --testPathPattern=renderer
```
Expected: PASS (2 tests)

---

### Task 4: HTML + CSS — canvas на странице

**Files:**
- Modify: `index.html`
- Modify: `css/style.css`

**Нет тестов** — визуальная верификация в браузере.

**Step 1: Обновить index.html**

```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pixel Dino Runner</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <main class="game-container">
    <canvas id="gameCanvas" width="800" height="300"></canvas>
  </main>
  <script type="module" src="js/main.js"></script>
</body>
</html>
```

**Step 2: Обновить css/style.css**

```css
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f0f0;
}

.game-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

#gameCanvas {
  display: block;
  background-color: #ffffff;
  border: 2px solid #333;
}
```

---

### Task 5: main.js — точка входа, инициализация цикла

**Files:**
- Create: `js/main.js`

**Нет отдельных тестов** — main.js запускает цикл, тестируется интеграционно через браузер. Логика разделена по модулям с тестами.

**Step 1: Реализовать**

```js
// js/main.js
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
```

---

### Task 6: Обновить ARCHITECTURE.md — добавить раздел компонентов

**Files:**
- Modify: `ARCHITECTURE.md`

Добавить раздел после существующего контента:

```markdown
## Архитектурный паттерн

Функциональные модули с явной передачей состояния. Нет классов, нет `this`.
Единственное глобальное состояние создаётся в `main.js` и передаётся в функции явно.

## Компоненты

| Модуль | Ответственность | Граница |
|--------|----------------|---------|
| `constants.js` | Все настраиваемые параметры игры | Только export, нет логики |
| `gameLoop.js` | RAF + delta-time, вызов update/render | Не знает о состоянии игры |
| `renderer.js` | Отрисовка сцены на canvas | Только читает состояние, не меняет |
| `dino.js` | Состояние дино, физика, анимация | Чистые функции над объектом dino |
| `obstacles.js` | Генерация и движение препятствий | Чистые функции над массивом obstacles |
| `input.js` | Keyboard/touch события | Возвращает команды, не меняет состояние |
| `main.js` | Точка входа, инициализация, сборка | Единственный владелец глобального состояния |

## Поток данных

```
input.js → main.js (команды)
main.js → update-функции → новое состояние
новое состояние → renderer.js → canvas
```

## Правила

- Каждый модуль экспортирует только чистые функции
- Состояние передаётся явно, никогда не хранится в модулях
- Все числовые параметры — в `constants.js`
- Нет закомментированного кода
```

---

### Task 7: Финальная валидация и коммит

**Step 1: Запустить полную валидацию**

```bash
npm run validate
```
Expected: все проверки зелёные — lint, cpd, tests.

**Step 2: Если есть ошибки lint — исправить**

Типичные проблемы:
- Лишние пробелы / отступы
- `no-unused-vars` — убрать неиспользуемые переменные или добавить `_` префикс

**Step 3: Коммит**

```bash
git add index.html css/style.css js/ ARCHITECTURE.md docs/plans/
git commit -m "Этап 0: инициализация проекта — canvas, игровой цикл, модульная архитектура"
```
