# Дизайн: Этап 1 — База, мир в движении

## Архитектурное решение

Иммутабельное состояние: `update(state, dt)` возвращает новый объект, `main.js` присваивает `state = update(state, dt)`.

## Новые модули

```
js/
  dino.js        — состояние + анимация дино (чистые функции)
  ground.js      — скроллинг земли
  background.js  — параллакс (облака/звёзды)
  score.js       — подсчёт очков, high score (localStorage)
  input.js       — keyboard handler
  sprites.js     — загрузка спрайтшитов, drawSprite
  ui.js          — стартовый экран, счётчик
```

## Расширенное состояние

```js
{
  status: 'idle' | 'running' | 'dead',
  dino: { x, y, vy, state, frame, frameTimer },
  ground: { x },
  background: { x, elements: [{ x, y, type }] },
  score: { current, high },
  speed: number,
}
```

## Update pipeline

```js
function update(state, dt) {
  if (state.status !== 'running') return state;
  const speed = updateSpeed(state.speed, dt);
  const ground = updateGround(state.ground, speed, dt);
  const background = updateBackground(state.background, speed, dt);
  const dino = updateDino(state.dino, dt);
  const score = updateScore(state.score, speed, dt);
  return { ...state, speed, ground, background, dino, score };
}
```

## Рендеринг

```js
function renderScene(ctx, state, sprites) {
  clearCanvas(ctx);
  drawBackground(ctx, state.background, sprites);
  drawGround(ctx, state.ground);
  drawDino(ctx, state.dino, sprites);
  drawUI(ctx, state);
}
```

## Спрайты

- Загружаются один раз через `loadSprites()` (Promise) перед стартом цикла
- `drawSprite(ctx, img, frame, x, y, scale)` — универсальная функция рисования кадра
- Данные кадров — из ARCHITECTURE.md

## Input

```js
export function createInput() {
  const keys = new Set();
  window.addEventListener('keydown', e => keys.add(e.code));
  window.addEventListener('keyup', e => keys.delete(e.code));
  return { isPressed: (code) => keys.has(code), consume: (code) => keys.delete(code) };
}
```

## Параллакс

- Земля: `speed * dt`
- Фон: `speed * BG_PARALLAX * dt` (BG_PARALLAX = 0.3)
- Фоновые элементы ре-спавнятся справа при выходе за левый край

## Score

- `updateScore` — чистая функция, возвращает `{ current, high }`
- High score: загружается из localStorage при старте, сохраняется при смерти (Этап 2)

## Game flow

- `idle` → стартовый экран → Space → `running`
- В Этапе 1 нет смерти — игра бесконечна

## Acceptance Criteria

- Стартовый экран с подсказкой «Нажмите Пробел для начала»
- После Space: земля и фон скроллятся влево
- Дино в левой части, анимация бега (≥2 кадра)
- Параллакс фона
- Счётчик очков пропорционально дистанции
- High Score отображается и сохраняется
- Скорость растёт до MAX_SPEED
- `npm run validate` проходит
- Новые компоненты в ARCHITECTURE.md
