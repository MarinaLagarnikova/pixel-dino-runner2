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
export const GROUND_DASH_CYCLE = 40;   // 2x dash(8) + gap(12) = 40px wrap cycle for ground line
export const DINO_JUMP_VY = -600;          // initial upward velocity, px/s
export const DINO_GRAVITY = 1800;          // downward accel, px/s²
export const DINO_FAST_FALL_GRAVITY = 3600; // fast-fall accel (↓ in air), px/s²
