// js/sprites.js
export const DINO_RUN_FRAMES = [
  { sx: 235, sy: 181, sw: 322, sh: 192, anchorX: 161, anchorY: 192 },
  { sx: 598, sy: 181, sw: 279, sh: 192, anchorX: 140, anchorY: 192 },
  { sx: 960, sy: 181, sw: 314, sh: 192, anchorX: 157, anchorY: 192 },
];

export const DINO_JUMP_FRAME =
  { sx: 322, sy: 549, sw: 249, sh: 165, anchorX: 125, anchorY: 165 };

export const DINO_DUCK_FRAME =
  { sx: 756, sy: 651, sw: 272, sh: 100, anchorX: 136, anchorY: 100 };

// Cactus frames (from assets/cactus-spritesheet.png)
export const CACTUS_SMALL_FRAME =
  { sx: 234, sy: 404, sw: 94, sh: 125, anchorX: 47, anchorY: 125 };

export const CACTUS_LARGE_FRAME =
  { sx: 48, sy: 74, sw: 143, sh: 230, anchorX: 71, anchorY: 230 };

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
