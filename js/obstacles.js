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

function dinoBounds(dino) {
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
    .filter(o => o.x > 0);
}

export function updateObstacles(obstacles, speed, dt) {
  const list = moveList(obstacles.list, speed, dt);
  const spawnTimer = obstacles.spawnTimer - dt;

  if (spawnTimer <= 0 && canSpawn(obstacles.list)) {
    const type = TYPES[Math.floor(Math.random() * TYPES.length)];
    const spawned = { x: CANVAS_W + 50 - speed * dt, type };
    return { list: [...list, spawned], spawnTimer: randomSpawnTimer() };
  }

  if (spawnTimer <= 0) {
    return { list, spawnTimer: 0.1 };
  }

  return { list, spawnTimer };
}

export function checkCollision(dino, list) {
  const db = dinoBounds(dino);
  return list.some(o => overlaps(db, cactusHitbox(o.x, o.type)));
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
