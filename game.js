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

const keys = { left: false, right: false, up: false };
let score = 0;
let cameraX = 0;
let win = false;

function setStatus() {
  if (win) {
    statusText.textContent = `You won! Bottles collected: ${score}/${bottles.length}. Press R to restart.`;
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
  bottles.forEach((b) => (b.collected = false));
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

  cameraX = Math.max(0, Math.min(player.x - canvas.width * 0.35, worldWidth - canvas.width));
}

function drawHat(x, y) {
  ctx.fillStyle = '#9f0404';
  ctx.fillRect(x + 3, y - 8, 28, 8);
  ctx.fillStyle = '#f4f4f4';
  ctx.fillRect(x, y - 4, 34, 5);
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

  ctx.fillStyle = '#8ae173';
  ctx.fillRect(x + 4, y + 4, 8, 20);
  ctx.fillStyle = '#def8c9';
  ctx.fillRect(x + 6, y + 0, 4, 6);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + 5, y + 12, 6, 6);
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
