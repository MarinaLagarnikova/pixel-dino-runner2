# Stage 3: Obstacles (Cacti) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add cactus obstacles that spawn from the right, move left, and kill the dino on collision, completing the game loop.

**Architecture:** New module `obstacles.js` following the existing functional pattern (pure `update*` + `draw*` functions, state passed explicitly). State gains `obstacles: { list, spawnTimer }`. Collision check in `main.js` triggers `status: 'dead'`.

**Tech Stack:** Vanilla JS ES modules, Jest, Canvas 2D API.

---

### Task 1: Add cactus sprite frames to `sprites.js`

**Files:**
- Modify: `js/sprites.js`

**Step 1: Write the failing test**

In `js/__tests__/sprites.test.js`, add at the bottom:

```js
import { CACTUS_SMALL_FRAME, CACTUS_LARGE_FRAME } from '../sprites.js';

test('CACTUS_SMALL_FRAME has required sprite fields', () => {
  for (const key of ['sx', 'sy', 'sw', 'sh', 'anchorX', 'anchorY']) {
    expect(typeof CACTUS_SMALL_FRAME[key]).toBe('number');
  }
});

test('CACTUS_LARGE_FRAME has required sprite fields', () => {
  for (const key of ['sx', 'sy', 'sw', 'sh', 'anchorX', 'anchorY']) {
    expect(typeof CACTUS_LARGE_FRAME[key]).toBe('number');
  }
});
```

**Step 2: Run test to verify it fails**

```bash
cd /Users/marinalagarnikova/Desktop/Dev/pixel-dino-runner
npx jest sprites --no-coverage
```
Expected: FAIL — `CACTUS_SMALL_FRAME` is not exported.

**Step 3: Add frame exports to `sprites.js`**

After `DINO_DUCK_FRAME`, add:

```js
// Cactus frames (from assets/cactus-spritesheet.png)
export const CACTUS_SMALL_FRAME =
  { sx: 234, sy: 404, sw: 94, sh: 125, anchorX: 47, anchorY: 125 };

export const CACTUS_LARGE_FRAME =
  { sx: 48, sy: 74, sw: 143, sh: 230, anchorX: 71, anchorY: 230 };
```

**Step 4: Run test to verify it passes**

```bash
npx jest sprites --no-coverage
```
Expected: PASS

**Step 5: Commit**

```bash
git add js/sprites.js js/__tests__/sprites.test.js
git commit -m "feat: add CACTUS_SMALL_FRAME and CACTUS_LARGE_FRAME to sprites.js"
```

---

### Task 2: Add obstacle constants to `constants.js`

**Files:**
- Modify: `js/constants.js`
- Modify: `js/__tests__/constants.test.js`

**Step 1: Write the failing test**

In `js/__tests__/constants.test.js`, add:

```js
import {
  OBSTACLE_SPAWN_MIN, OBSTACLE_SPAWN_MAX, OBSTACLE_MIN_GAP,
  CACTUS_HITBOX_SHRINK,
} from '../constants.js';

test('OBSTACLE_SPAWN_MIN is a positive number', () => {
  expect(typeof OBSTACLE_SPAWN_MIN).toBe('number');
  expect(OBSTACLE_SPAWN_MIN).toBeGreaterThan(0);
});

test('OBSTACLE_SPAWN_MAX > OBSTACLE_SPAWN_MIN', () => {
  expect(OBSTACLE_SPAWN_MAX).toBeGreaterThan(OBSTACLE_SPAWN_MIN);
});

test('OBSTACLE_MIN_GAP is a positive number', () => {
  expect(typeof OBSTACLE_MIN_GAP).toBe('number');
  expect(OBSTACLE_MIN_GAP).toBeGreaterThan(0);
});

test('CACTUS_HITBOX_SHRINK is between 0 and 1', () => {
  expect(CACTUS_HITBOX_SHRINK).toBeGreaterThan(0);
  expect(CACTUS_HITBOX_SHRINK).toBeLessThan(1);
});
```

**Step 2: Run test to verify it fails**

```bash
npx jest constants --no-coverage
```
Expected: FAIL

**Step 3: Add constants to `constants.js`**

```js
export const OBSTACLE_SPAWN_MIN = 1.0;   // seconds between obstacles (minimum)
export const OBSTACLE_SPAWN_MAX = 2.5;   // seconds between obstacles (maximum)
export const OBSTACLE_MIN_GAP = 300;     // px: minimum x-distance between last obstacle right edge and spawn point
export const CACTUS_HITBOX_SHRINK = 0.75; // hitbox is 75% of visual sprite dimensions
```

**Step 4: Run test to verify it passes**

```bash
npx jest constants --no-coverage
```
Expected: PASS

**Step 5: Commit**

```bash
git add js/constants.js js/__tests__/constants.test.js
git commit -m "feat: add obstacle spawn and hitbox constants"
```

---

### Task 3: Create `obstacles.js` — core logic

**Files:**
- Create: `js/obstacles.js`
- Create: `js/__tests__/obstacles.test.js`

#### Data shapes

An obstacle object:
```js
{ x, type }
// type: 'small' | 'large' | 'double'
// x: right-anchored spawn position (CANVAS_W + margin)
// y is always GROUND_Y (derived at draw time from anchorY)
```

Obstacles state slice:
```js
{ list: [], spawnTimer: <seconds until next spawn> }
```

#### Step 1: Create the test file

Create `js/__tests__/obstacles.test.js`:

```js
// js/__tests__/obstacles.test.js
import { jest } from '@jest/globals';
import {
  createObstacles,
  updateObstacles,
  checkCollision,
  drawObstacles,
} from '../obstacles.js';
import { CANVAS_W, GROUND_Y, SPRITE_SCALE } from '../constants.js';
import { CACTUS_SMALL_FRAME, CACTUS_LARGE_FRAME } from '../sprites.js';

// ── helpers ──────────────────────────────────────────────────────────────────

function makeCtx() {
  return { drawImage: jest.fn() };
}

function makeSprites() {
  return { cactus: {} };
}

// ── createObstacles ───────────────────────────────────────────────────────────

test('createObstacles returns empty list and positive spawnTimer', () => {
  const obs = createObstacles();
  expect(obs.list).toEqual([]);
  expect(obs.spawnTimer).toBeGreaterThan(0);
});

// ── updateObstacles — movement ────────────────────────────────────────────────

test('obstacles move left by speed * dt', () => {
  const obs = { list: [{ x: 500, type: 'small' }], spawnTimer: 999 };
  const result = updateObstacles(obs, 300, 0.1);
  expect(result.list[0].x).toBeCloseTo(470);
});

test('obstacles off-screen left are removed from list', () => {
  const obs = { list: [{ x: -50, type: 'small' }], spawnTimer: 999 };
  const result = updateObstacles(obs, 300, 0.016);
  expect(result.list).toHaveLength(0);
});

test('updateObstacles returns new object (immutable)', () => {
  const obs = { list: [], spawnTimer: 1 };
  const result = updateObstacles(obs, 300, 0.016);
  expect(result).not.toBe(obs);
  expect(result.list).not.toBe(obs.list);
});

// ── updateObstacles — spawning ────────────────────────────────────────────────

test('when spawnTimer reaches 0, a new obstacle is added', () => {
  const obs = { list: [], spawnTimer: 0.01 };
  const result = updateObstacles(obs, 300, 1.0); // dt=1.0 will exhaust timer
  expect(result.list.length).toBeGreaterThanOrEqual(1);
});

test('spawned obstacle starts at CANVAS_W or beyond', () => {
  const obs = { list: [], spawnTimer: 0.01 };
  const result = updateObstacles(obs, 300, 1.0);
  const newObs = result.list[result.list.length - 1];
  expect(newObs.x).toBeGreaterThanOrEqual(CANVAS_W);
});

test('spawned obstacle has valid type', () => {
  const obs = { list: [], spawnTimer: 0.01 };
  const result = updateObstacles(obs, 300, 1.0);
  const newObs = result.list[result.list.length - 1];
  expect(['small', 'large', 'double']).toContain(newObs.type);
});

test('after spawn, spawnTimer is reset to a positive value', () => {
  const obs = { list: [], spawnTimer: 0.01 };
  const result = updateObstacles(obs, 300, 1.0);
  expect(result.spawnTimer).toBeGreaterThan(0);
});

test('no spawn when last obstacle is too close (OBSTACLE_MIN_GAP)', () => {
  // obstacle near the right edge — below minimum gap
  const obs = { list: [{ x: CANVAS_W - 100, type: 'small' }], spawnTimer: 0.01 };
  const result = updateObstacles(obs, 300, 1.0);
  // list length should stay 1 — spawn blocked by min gap
  expect(result.list).toHaveLength(1);
});

// ── checkCollision ────────────────────────────────────────────────────────────

test('checkCollision returns false when list is empty', () => {
  const dino = { x: 80, y: GROUND_Y, state: 'run' };
  expect(checkCollision(dino, [])).toBe(false);
});

test('checkCollision returns false when obstacle is far right', () => {
  const dino = { x: 80, y: GROUND_Y, state: 'run' };
  const obstacle = { x: 700, type: 'small' };
  expect(checkCollision(dino, [obstacle])).toBe(false);
});

test('checkCollision returns true when dino overlaps obstacle', () => {
  const dino = { x: 80, y: GROUND_Y, state: 'run' };
  // place obstacle directly on dino
  const obstacle = { x: 80, type: 'small' };
  expect(checkCollision(dino, [obstacle])).toBe(true);
});

// ── drawObstacles ─────────────────────────────────────────────────────────────

test('drawObstacles calls ctx.drawImage once per small obstacle', () => {
  const ctx = makeCtx();
  const sprites = makeSprites();
  drawObstacles(ctx, [{ x: 300, type: 'small' }], sprites);
  expect(ctx.drawImage).toHaveBeenCalledTimes(1);
});

test('drawObstacles calls ctx.drawImage twice for double obstacle', () => {
  const ctx = makeCtx();
  const sprites = makeSprites();
  drawObstacles(ctx, [{ x: 300, type: 'double' }], sprites);
  expect(ctx.drawImage).toHaveBeenCalledTimes(2);
});

test('drawObstacles does not draw when list is empty', () => {
  const ctx = makeCtx();
  drawObstacles(ctx, [], makeSprites());
  expect(ctx.drawImage).not.toHaveBeenCalled();
});
```

**Step 2: Run tests to verify they all fail**

```bash
npx jest obstacles --no-coverage
```
Expected: FAIL — module not found.

**Step 3: Implement `js/obstacles.js`**

```js
// js/obstacles.js
import {
  CANVAS_W, GROUND_Y, SPRITE_SCALE,
  OBSTACLE_SPAWN_MIN, OBSTACLE_SPAWN_MAX, OBSTACLE_MIN_GAP,
  CACTUS_HITBOX_SHRINK,
} from './constants.js';
import { CACTUS_SMALL_FRAME, CACTUS_LARGE_FRAME, drawSprite } from './sprites.js';

const TYPES = ['small', 'large', 'double'];

function randomSpawnTimer() {
  return OBSTACLE_SPAWN_MIN + Math.random() * (OBSTACLE_SPAWN_MAX - OBSTACLE_SPAWN_MIN);
}

export function createObstacles() {
  return { list: [], spawnTimer: randomSpawnTimer() };
}

function frameForType(type) {
  return type === 'large' ? CACTUS_LARGE_FRAME : CACTUS_SMALL_FRAME;
}

function hitbox(x, type) {
  const frame = frameForType(type);
  const w = frame.sw * SPRITE_SCALE * CACTUS_HITBOX_SHRINK;
  const h = frame.sh * SPRITE_SCALE * CACTUS_HITBOX_SHRINK;
  const cx = x;
  const cy = GROUND_Y;
  return {
    left:   cx - frame.anchorX * SPRITE_SCALE + (frame.sw * SPRITE_SCALE - w) / 2,
    right:  cx - frame.anchorX * SPRITE_SCALE + (frame.sw * SPRITE_SCALE + w) / 2,
    top:    cy - frame.anchorY * SPRITE_SCALE + (frame.sh * SPRITE_SCALE - h) / 2,
    bottom: cy,
  };
}

function dinoBounds(dino) {
  // Approximate hitbox based on dino state; duck is shorter
  const w = dino.state === 'duck' ? 80 : 95;
  const h = dino.state === 'duck' ? 30 : 58;
  return {
    left:   dino.x - w / 2,
    right:  dino.x + w / 2,
    top:    dino.y - h,
    bottom: dino.y,
  };
}

function overlaps(a, b) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

function canSpawn(list) {
  if (list.length === 0) return true;
  const last = list[list.length - 1];
  return last.x <= CANVAS_W - OBSTACLE_MIN_GAP;
}

function moveList(list, speed, dt) {
  return list
    .map(o => ({ ...o, x: o.x - speed * dt }))
    .filter(o => o.x > -200);
}

export function updateObstacles(obstacles, speed, dt) {
  const list = moveList(obstacles.list, speed, dt);
  const spawnTimer = obstacles.spawnTimer - dt;

  if (spawnTimer <= 0 && canSpawn(list)) {
    const type = TYPES[Math.floor(Math.random() * TYPES.length)];
    list.push({ x: CANVAS_W + 50, type });
    return { list, spawnTimer: randomSpawnTimer() };
  }

  if (spawnTimer <= 0) {
    // gap too small; hold timer at small positive so we retry next frame
    return { list, spawnTimer: 0.1 };
  }

  return { list, spawnTimer };
}

export function checkCollision(dino, list) {
  const db = dinoBounds(dino);
  return list.some(o => overlaps(db, hitbox(o.x, o.type)));
}

export function drawObstacles(ctx, list, sprites) {
  for (const o of list) {
    if (o.type === 'double') {
      const offset = CACTUS_SMALL_FRAME.sw * SPRITE_SCALE * 0.9;
      drawSprite(ctx, sprites.cactus, CACTUS_SMALL_FRAME, o.x - offset / 2, GROUND_Y, SPRITE_SCALE);
      drawSprite(ctx, sprites.cactus, CACTUS_SMALL_FRAME, o.x + offset / 2, GROUND_Y, SPRITE_SCALE);
    } else {
      drawSprite(ctx, sprites.cactus, frameForType(o.type), o.x, GROUND_Y, SPRITE_SCALE);
    }
  }
}
```

**Step 4: Run tests to verify they pass**

```bash
npx jest obstacles --no-coverage
```
Expected: all PASS

**Step 5: Commit**

```bash
git add js/obstacles.js js/__tests__/obstacles.test.js
git commit -m "feat: add obstacles.js with spawn, movement, collision, draw"
```

---

### Task 4: Wire obstacles into `main.js`

**Files:**
- Modify: `js/main.js`

No new tests needed — integration covered by existing game loop tests + obstacles unit tests.

**Step 1: Update `createInitialState` to include obstacles**

Add import at the top:
```js
import { createObstacles, updateObstacles, checkCollision } from './obstacles.js';
```

In `createInitialState`, add:
```js
obstacles: createObstacles(),
```

**Step 2: Update `updateWorld` to update obstacles and detect collision**

Replace `updateWorld` body:
```js
function updateWorld(state, input, dt) {
  const speed = updateSpeed(state.speed, dt);
  const ground = updateGround(state.ground, speed, dt);
  const background = updateBackground(state.background, speed, dt);
  const dino = updateDino(state.dino, input, dt);
  const obstacles = updateObstacles(state.obstacles, speed, dt);
  const score = updateScore(state.score, speed, dt);
  if (score.high > state.score.high) saveHighScore(score.high);

  if (checkCollision(dino, obstacles.list)) {
    return { ...state, speed, ground, background, dino, obstacles, score, status: 'dead' };
  }
  return { ...state, speed, ground, background, dino, obstacles, score };
}
```

**Step 3: Clear obstacles on restart**

In `updateDead`, the existing `createInitialState()` call already resets everything including `obstacles` — no changes needed here.

**Step 4: Run full test suite**

```bash
npx jest --no-coverage
```
Expected: all PASS

**Step 5: Commit**

```bash
git add js/main.js
git commit -m "feat: wire obstacles into game state and collision → dead transition"
```

---

### Task 5: Wire obstacles into `renderer.js`

**Files:**
- Modify: `js/renderer.js`
- Modify: `js/__tests__/renderer.test.js`

**Step 1: Check existing renderer test**

Read `js/__tests__/renderer.test.js` to understand what's tested, then add:

```js
test('renderScene calls drawImage for obstacles list', () => {
  const ctx = makeCtx();
  const state = makeState({
    status: 'running',
    obstacles: { list: [{ x: 400, type: 'small' }], spawnTimer: 1 },
  });
  renderScene(ctx, state, makeSprites());
  expect(ctx.drawImage).toHaveBeenCalled();
});
```

(Use existing `makeCtx`, `makeState`, `makeSprites` helpers already in that file.)

**Step 2: Run test to verify it fails**

```bash
npx jest renderer --no-coverage
```
Expected: test may pass vacuously or fail depending on current renderer state. We verify it actually exercises the new draw path after the next step.

**Step 3: Add `drawObstacles` to `renderer.js`**

Add import:
```js
import { drawObstacles } from './obstacles.js';
```

In `renderScene`, after `drawDino`:
```js
drawObstacles(ctx, state.obstacles.list, sprites);
```

**Step 4: Run full test suite**

```bash
npx jest --no-coverage
```
Expected: all PASS

**Step 5: Commit**

```bash
git add js/renderer.js js/__tests__/renderer.test.js
git commit -m "feat: render obstacles in renderScene"
```

---

### Task 6: Update ARCHITECTURE.md

**Files:**
- Modify: `ARCHITECTURE.md`

**Step 1: Update Components table**

Add row:
```
| `obstacles.js` | Спавн, движение, коллизия кактусов | createObstacles, updateObstacles, checkCollision, drawObstacles |
```

**Step 2: Update State shape**

Add to state object:
```
obstacles: { list: [{ x, type: 'small' | 'large' | 'double' }], spawnTimer },
```

**Step 3: Commit**

```bash
git add ARCHITECTURE.md
git commit -m "docs: update ARCHITECTURE.md for Stage 3 obstacles"
```

---

### Task 7: Final validation

**Step 1: Run `npm run validate`**

```bash
npm run validate
```
Expected: `✓ All checks passed`

If any ESLint errors — fix them and re-run before reporting completion.

**Step 2: Smoke test in browser**

Open `index.html` in a browser (or via dev server). Verify:
- Cacti spawn from the right
- Cacti move left and disappear off-screen
- All three types appear (small, large, double)
- Collision triggers GAME OVER overlay
- Space/Enter after GAME OVER restarts cleanly

---
