// js/obstacles.js
import {
  CANVAS_W, GROUND_Y, SPRITE_SCALE,
  OBSTACLE_SPAWN_MIN, OBSTACLE_SPAWN_MAX, OBSTACLE_MIN_GAP,
  CACTUS_HITBOX_SHRINK, DINO_HITBOX_W, DINO_HITBOX_H,
  DINO_DUCK_HITBOX_W, DINO_DUCK_HITBOX_H,
  DOUBLE_CACTUS_SPACING, OBSTACLE_SPAWN_BUFFER, OBSTACLE_SPAWN_RETRY,
  PTERO_SCORE_THRESHOLD, PTERO_Y_LOW, PTERO_Y_MID, PTERO_Y_HIGH,
  PTERO_FRAME_DURATION, PTERO_FRAME_COUNT, PTERO_HITBOX_SHRINK,
} from './constants.js';
import {
  CACTUS_SMALL_FRAME, CACTUS_LARGE_FRAME, PTERO_FRAMES, drawSprite,
} from './sprites.js';

const CACTUS_TYPES = ['small', 'large', 'double'];
const PTERO_TYPES  = ['ptero_low', 'ptero_mid', 'ptero_high'];

function isPtero(type) {
  return type === 'ptero_low' || type === 'ptero_mid' || type === 'ptero_high';
}

function randomSpawnTimer() {
  return OBSTACLE_SPAWN_MIN + Math.random() * (OBSTACLE_SPAWN_MAX - OBSTACLE_SPAWN_MIN);
}

export function createObstacles() {
  return { list: [], spawnTimer: randomSpawnTimer() };
}

// ── cactus helpers ────────────────────────────────────────────────────────────

function frameForType(type) {
  return type === 'large' ? CACTUS_LARGE_FRAME : CACTUS_SMALL_FRAME;
}

function cactusHitbox(x, type) {
  const frame = frameForType(type);
  const w = frame.sw * SPRITE_SCALE * CACTUS_HITBOX_SHRINK;
  const h = frame.sh * SPRITE_SCALE * CACTUS_HITBOX_SHRINK;
  const left = x - frame.anchorX * SPRITE_SCALE + (frame.sw * SPRITE_SCALE - w) / 2;
  return {
    left,
    right: left + w,
    top:   GROUND_Y - frame.anchorY * SPRITE_SCALE + (frame.sh * SPRITE_SCALE - h) / 2,
    bottom: GROUND_Y,
  };
}

// ── pterodactyl helpers ───────────────────────────────────────────────────────

function pteroY(type) {
  if (type === 'ptero_low') return PTERO_Y_LOW;
  if (type === 'ptero_mid') return PTERO_Y_MID;
  return PTERO_Y_HIGH;
}

function pterodactylHitbox(x, y) {
  const frame = PTERO_FRAMES[0];
  const w = frame.sw * SPRITE_SCALE * PTERO_HITBOX_SHRINK;
  const h = frame.sh * SPRITE_SCALE * PTERO_HITBOX_SHRINK;
  const left = x - frame.anchorX * SPRITE_SCALE + (frame.sw * SPRITE_SCALE - w) / 2;
  return {
    left,
    right: left + w,
    top:   y - frame.anchorY * SPRITE_SCALE + (frame.sh * SPRITE_SCALE - h) / 2,
    bottom: y,
  };
}

function animatePtero(o, dt) {
  const frameTimer = o.frameTimer + dt * 1000;
  if (frameTimer >= PTERO_FRAME_DURATION) {
    return { ...o, frame: (o.frame + 1) % PTERO_FRAME_COUNT, frameTimer: frameTimer - PTERO_FRAME_DURATION };
  }
  return { ...o, frameTimer };
}

// ── shared helpers ────────────────────────────────────────────────────────────

function dinoBounds(dino) {
  const w = dino.state === 'duck' ? DINO_DUCK_HITBOX_W : DINO_HITBOX_W;
  const h = dino.state === 'duck' ? DINO_DUCK_HITBOX_H : DINO_HITBOX_H;
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

function obstacleHitbox(o) {
  return isPtero(o.type) ? pterodactylHitbox(o.x, o.y) : cactusHitbox(o.x, o.type);
}

function canSpawn(list) {
  if (list.length === 0) return true;
  return list[list.length - 1].x <= CANVAS_W - OBSTACLE_MIN_GAP;
}

function moveOne(o, speed, dt) {
  const moved = { ...o, x: o.x - speed * dt };
  return isPtero(o.type) ? animatePtero(moved, dt) : moved;
}

function moveList(list, speed, dt) {
  return list
    .map(o => moveOne(o, speed, dt))
    .filter(o => o.x > -200);
}

function chooseType(score) {
  const types = score >= PTERO_SCORE_THRESHOLD
    ? [...CACTUS_TYPES, ...PTERO_TYPES]
    : CACTUS_TYPES;
  return types[Math.floor(Math.random() * types.length)];
}

function buildObstacle(type, x) {
  const base = { x, type };
  if (!isPtero(type)) return base;
  return { ...base, y: pteroY(type), frame: 0, frameTimer: 0 };
}

// ── public API ────────────────────────────────────────────────────────────────

export function updateObstacles(obstacles, speed, dt, score = 0) {
  const list = moveList(obstacles.list, speed, dt);
  const spawnTimer = obstacles.spawnTimer - dt;

  if (spawnTimer <= 0 && canSpawn(list)) {
    const type = chooseType(score);
    const x = CANVAS_W + OBSTACLE_SPAWN_BUFFER - speed * dt;
    return { list: [...list, buildObstacle(type, x)], spawnTimer: randomSpawnTimer() };
  }

  if (spawnTimer <= 0) {
    return { list, spawnTimer: OBSTACLE_SPAWN_RETRY };
  }

  return { list, spawnTimer };
}

export function checkCollision(dino, list) {
  const db = dinoBounds(dino);
  return list.some(o => overlaps(db, obstacleHitbox(o)));
}

function drawCactus(ctx, o, sprites) {
  if (o.type === 'double') {
    const offset = CACTUS_SMALL_FRAME.sw * SPRITE_SCALE * DOUBLE_CACTUS_SPACING;
    drawSprite(ctx, sprites.cactus, CACTUS_SMALL_FRAME, o.x - offset / 2, GROUND_Y, SPRITE_SCALE);
    drawSprite(ctx, sprites.cactus, CACTUS_SMALL_FRAME, o.x + offset / 2, GROUND_Y, SPRITE_SCALE);
  } else {
    drawSprite(ctx, sprites.cactus, frameForType(o.type), o.x, GROUND_Y, SPRITE_SCALE);
  }
}

function drawPtero(ctx, o, sprites) {
  drawSprite(ctx, sprites.pterodactyl, PTERO_FRAMES[o.frame], o.x, o.y, SPRITE_SCALE);
}

export function drawObstacles(ctx, list, sprites) {
  for (const o of list) {
    if (isPtero(o.type)) drawPtero(ctx, o, sprites);
    else drawCactus(ctx, o, sprites);
  }
}
