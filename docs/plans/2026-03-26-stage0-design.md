# Дизайн: Этап 0 — Инициализация проекта

## Архитектурное решение

Функциональные модули с явной передачей состояния. Нет классов, нет `this`. Состояние создаётся в `main.js` и передаётся в функции явно.

## Файловая структура

```
js/
  constants.js    — все числовые параметры
  gameLoop.js     — requestAnimationFrame + delta-time
  renderer.js     — очистка canvas + рисование сцены
  dino.js         — состояние дино и чистые функции обновления
  obstacles.js    — генерация и движение препятствий
  input.js        — keyboard/touch события
  main.js         — точка входа

css/
  style.css       — центрирование canvas, фон

index.html        — canvas + <script type="module" src="js/main.js">
```

## Форма игрового состояния

```js
{
  dino: { x, y, vy, state, frame, frameTimer },
  obstacles: [],
  score: 0,
  speed: INITIAL_SPEED,
  status: 'idle' // 'idle' | 'running' | 'dead'
}
```

## Игровой цикл

```js
// gameLoop.js
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

## Контракты модулей (Этап 0)

| Модуль | Экспорт |
|--------|---------|
| `constants.js` | `CANVAS_W`, `CANVAS_H`, `GROUND_Y`, `INITIAL_SPEED` |
| `gameLoop.js` | `createLoop(update, render)` |
| `renderer.js` | `clearCanvas(ctx)`, `renderScene(ctx, state)` |
| `main.js` | точка входа, инициализация canvas + старт цикла |

## Acceptance Criteria (Этап 0)

- Файловая структура создана и соответствует ARCHITECTURE.md
- Canvas (~800×300px) отображается и центрирован
- Игровой цикл через requestAnimationFrame с delta-time
- Canvas очищается и перерисовывается каждый кадр
- `npm run validate` проходит без ошибок
- ARCHITECTURE.md дополнен: компоненты, границы, ответственности
- README.md содержит описание и инструкцию по запуску
