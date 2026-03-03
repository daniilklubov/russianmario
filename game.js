const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusText = document.getElementById('status');

const gravity = 0.65;
const worldWidth = 2400;

const player = {
  x: 90,
  y: 0,
  w: 34,
  h: 52,
  vx: 0,
  vy: 0,
  speed: 5,
  jumpPower: 14,
  onGround: false,
};

const platforms = [
  { x: 0, y: 360, w: worldWidth, h: 60 },
  { x: 280, y: 300, w: 170, h: 16 },
  { x: 560, y: 250, w: 160, h: 16 },
  { x: 860, y: 300, w: 180, h: 16 },
  { x: 1180, y: 260, w: 180, h: 16 },
  { x: 1510, y: 300, w: 180, h: 16 },
  { x: 1830, y: 250, w: 220, h: 16 },
];

const bottles = [
  { x: 340, y: 260, collected: false },
  { x: 620, y: 210, collected: false },
  { x: 930, y: 260, collected: false },
  { x: 1270, y: 220, collected: false },
  { x: 1610, y: 260, collected: false },
  { x: 1960, y: 210, collected: false },
];

const bears = [
  { x: 500, y: 328, w: 42, h: 32, minX: 430, maxX: 700, speed: 1.2, dir: 1 },
  { x: 1090, y: 268, w: 42, h: 32, minX: 930, maxX: 1200, speed: 1, dir: -1 },
  { x: 1730, y: 328, w: 42, h: 32, minX: 1610, maxX: 1960, speed: 1.4, dir: 1 },
];

const keys = { left: false, right: false, up: false };
let score = 0;
let cameraX = 0;
let win = false;
let hitCooldown = 0;
let bearWarning = '';

function setStatus() {
  if (win) {
    statusText.textContent = `You won! Bottles collected: ${score}/${bottles.length}. Press R to restart.`;
  } else if (bearWarning) {
    statusText.textContent = `${bearWarning} Bottles collected: ${score}/${bottles.length}`;
  } else {
    statusText.textContent = `Bottles collected: ${score}/${bottles.length}`;
  }
}

function resetGame() {
  player.x = 90;
  player.y = 180;
  player.vx = 0;
  player.vy = 0;
  score = 0;
  win = false;
  hitCooldown = 0;
  bearWarning = '';
  bottles.forEach((b) => (b.collected = false));
  bears.forEach((bear) => {
    bear.dir = 1;
  });
  setStatus();
}

function circleRectCollision(cx, cy, r, rx, ry, rw, rh) {
  const nearestX = Math.max(rx, Math.min(cx, rx + rw));
  const nearestY = Math.max(ry, Math.min(cy, ry + rh));
  const dx = cx - nearestX;
  const dy = cy - nearestY;
  return dx * dx + dy * dy <= r * r;
}

function update() {
  if (hitCooldown > 0) {
    hitCooldown -= 1;
    if (hitCooldown === 0 && bearWarning) {
      bearWarning = '';
      setStatus();
    }
  }

  if (keys.left) player.vx = -player.speed;
  else if (keys.right) player.vx = player.speed;
  else player.vx = 0;

  if (keys.up && player.onGround) {
    player.vy = -player.jumpPower;
    player.onGround = false;
  }

  player.vy += gravity;

  player.x += player.vx;
  player.x = Math.max(0, Math.min(player.x, worldWidth - player.w));

  player.y += player.vy;
  player.onGround = false;

  for (const p of platforms) {
    const overlapX = player.x < p.x + p.w && player.x + player.w > p.x;
    const overlapY = player.y < p.y + p.h && player.y + player.h > p.y;

    if (overlapX && overlapY && player.vy >= 0) {
      const prevBottom = player.y + player.h - player.vy;
      if (prevBottom <= p.y + 6) {
        player.y = p.y - player.h;
        player.vy = 0;
        player.onGround = true;
      }
    }
  }

  for (const bottle of bottles) {
    if (bottle.collected) continue;
    const hit = circleRectCollision(
      bottle.x + 8,
      bottle.y + 16,
      12,
      player.x,
      player.y,
      player.w,
      player.h
    );

    if (hit) {
      bottle.collected = true;
      score += 1;
      if (score === bottles.length) {
        win = true;
      }
      setStatus();
    }
  }

  for (const bear of bears) {
    bear.x += bear.speed * bear.dir;
    if (bear.x <= bear.minX || bear.x + bear.w >= bear.maxX) {
      bear.dir *= -1;
      bear.x = Math.max(bear.minX, Math.min(bear.x, bear.maxX - bear.w));
    }

    const touchBear =
      player.x < bear.x + bear.w &&
      player.x + player.w > bear.x &&
      player.y < bear.y + bear.h &&
      player.y + player.h > bear.y;

    if (touchBear && hitCooldown === 0) {
      hitCooldown = 45;
      bearWarning = 'A bear blocked you!';
      player.vx = bear.dir > 0 ? 6 : -6;
      player.vy = -8;
      player.x += bear.dir > 0 ? 28 : -28;
      player.x = Math.max(0, Math.min(player.x, worldWidth - player.w));
      setStatus();
    }
  }

  cameraX = Math.max(0, Math.min(player.x - canvas.width * 0.35, worldWidth - canvas.width));
}

function drawHat(x, y) {
  // Ushanka crown
  ctx.fillStyle = '#6f2f14';
  ctx.fillRect(x + 4, y - 10, 26, 8);
  // Front fur band
  ctx.fillStyle = '#d7c4a8';
  ctx.fillRect(x + 1, y - 4, 32, 7);
  // Side ear flaps
  ctx.fillRect(x - 2, y - 2, 6, 10);
  ctx.fillRect(x + 30, y - 2, 6, 10);
  // Small red badge
  ctx.fillStyle = '#b61e1e';
  ctx.fillRect(x + 15, y - 8, 4, 4);
}

function drawPlayer() {
  const x = player.x - cameraX;
  const y = player.y;

  ctx.fillStyle = '#f5d7b2';
  ctx.fillRect(x + 8, y + 3, 18, 18);

  ctx.fillStyle = '#3f4c80';
  ctx.fillRect(x + 5, y + 20, 24, 24);

  ctx.fillStyle = '#2f2f2f';
  ctx.fillRect(x + 5, y + 44, 9, 8);
  ctx.fillRect(x + 20, y + 44, 9, 8);

  drawHat(x, y + 2);
}

function drawBottle(bottle) {
  const x = bottle.x - cameraX;
  const y = bottle.y;

  // Bottle glass body
  ctx.fillStyle = '#74d184';
  ctx.fillRect(x + 2, y + 8, 12, 18);
  // Neck
  ctx.fillRect(x + 5, y + 3, 6, 6);
  // Cap
  ctx.fillStyle = '#d9e6f5';
  ctx.fillRect(x + 5, y, 6, 3);
  // Label
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + 4, y + 13, 8, 8);
  ctx.fillStyle = '#2e5aac';
  ctx.fillRect(x + 5, y + 16, 6, 2);
  // Glass shine
  ctx.fillStyle = '#bdf2ca';
  ctx.fillRect(x + 3, y + 10, 2, 12);
}

function drawBear(bear) {
  const x = bear.x - cameraX;
  const y = bear.y;
  ctx.fillStyle = '#5a3a22';
  ctx.fillRect(x + 4, y + 8, 34, 20);
  ctx.fillRect(x + 10, y, 22, 14);
  ctx.fillStyle = '#e0c1a2';
  ctx.fillRect(x + 16, y + 7, 10, 7);
  ctx.fillStyle = '#3a2414';
  ctx.fillRect(x + 8, y + 26, 8, 6);
  ctx.fillRect(x + 26, y + 26, 8, 6);
}

function drawPlatform(p) {
  const x = p.x - cameraX;
  ctx.fillStyle = p.y > 320 ? '#4f3a2d' : '#684c37';
  ctx.fillRect(x, p.y, p.w, p.h);
  ctx.fillStyle = '#74ad4c';
  ctx.fillRect(x, p.y, p.w, Math.min(8, p.h));
}

function drawFlag() {
  const x = worldWidth - 130 - cameraX;
  const y = 180;
  ctx.fillStyle = '#ddd';
  ctx.fillRect(x, y, 6, 180);
  ctx.fillStyle = '#fff';
  ctx.fillRect(x + 6, y + 10, 36, 18);
  ctx.fillStyle = '#2354c4';
  ctx.fillRect(x + 6, y + 28, 36, 18);
  ctx.fillStyle = '#ca1a2f';
  ctx.fillRect(x + 6, y + 46, 36, 18);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#ffffff44';
  for (let i = 0; i < 18; i += 1) {
    const cloudX = ((i * 170 - cameraX * 0.25) % (canvas.width + 240)) - 120;
    ctx.fillRect(cloudX, 50 + (i % 3) * 26, 62, 14);
    ctx.fillRect(cloudX + 12, 42 + (i % 3) * 26, 38, 12);
  }

  for (const p of platforms) drawPlatform(p);
  drawFlag();

  for (const bottle of bottles) {
    if (!bottle.collected) drawBottle(bottle);
  }

  for (const bear of bears) {
    drawBear(bear);
  }

  drawPlayer();

  if (win) {
    ctx.fillStyle = '#0009';
    ctx.fillRect(220, 140, 470, 100);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText('Victory! You collected all vodka bottles!', 235, 200);
  }
}

function gameLoop() {
  if (!win) {
    update();
  }
  draw();
  requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', (event) => {
  if (event.code === 'ArrowLeft' || event.code === 'KeyA') keys.left = true;
  if (event.code === 'ArrowRight' || event.code === 'KeyD') keys.right = true;
  if (event.code === 'ArrowUp' || event.code === 'Space' || event.code === 'KeyW') {
    event.preventDefault();
    keys.up = true;
  }
  if (event.code === 'KeyR') resetGame();
});

window.addEventListener('keyup', (event) => {
  if (event.code === 'ArrowLeft' || event.code === 'KeyA') keys.left = false;
  if (event.code === 'ArrowRight' || event.code === 'KeyD') keys.right = false;
  if (event.code === 'ArrowUp' || event.code === 'Space' || event.code === 'KeyW') keys.up = false;
});

resetGame();
gameLoop();
