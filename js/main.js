// js/main.js
import {
  spawnObstacle,
  updateObstacles,
  drawObstacles,
  checkCollision,
  obstacles
} from './obstacles.js';

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const restartBtn = document.getElementById("restartBtn");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const groundHeight = 100;
let activeTornado = null;
let shakeTime = 0;
let shakeIntensity = 0;

const player = {
  x: 100,
  y: canvas.height - groundHeight - 50,
  width: 50,
  height: 50,
  color: "#ffffff",
  dy: 0,
  gravity: 0.8,
  jumpPower: -15,
  isJumping: false,
  animation: { powerPunchActive: false, powerPunchTimer: 0 },
  trail: [],
  trailTimer: 0,
  hasLightningTrail: false,
  activePower: null,
  powerTimer: 0
};

const powers = {
  powerPunch: { name: "Power Punch", cost: 10, type: "dark", cooldown: 15000, lastUsed: 0, unlocked: false },
  shieldBarrier: { name: "Shield Barrier", cost: 15, type: "dark", cooldown: 20000, lastUsed: 0, unlocked: false },
  tornado: { name: "Tornado", cost: 15, type: "violet", cooldown: 60000, lastUsed: 0, unlocked: false },
  fiveJump: { name: "5x Jump", cost: 20, type: "dark", cooldown: 30000, lastUsed: 0, unlocked: false },
  jumpBack: { name: "Jump Back", cost: 9, type: "dark", cooldown: 20000, lastUsed: 0, unlocked: false },
  gravityShift: { name: "Gravity Shift", cost: 2, type: "violet", cooldown: 45000, lastUsed: 0, unlocked: false },
  flashRunner: { name: "Flash Runner", cost: 4, type: "violet", cooldown: 90000, lastUsed: 0, unlocked: false }
};

let flameCounters = { dark: 0, violet: 0, abyssal: 0 };
let flameMultiplier = 1;
let flameStreak = 0;
const maxMultiplier = 5;
const flames = [];

function spawnFlame(canvasWidth, groundY) {
  const rand = Math.random();
  let type = "dark", color = "#8000ff";
  if (rand < 0.01) [type, color] = ["abyssal", "#cc00ff"];
  else if (rand < 0.15) [type, color] = ["violet", "#9933ff"];
  flames.push({ x: canvasWidth + Math.random() * 100, y: groundY - 60, width: 20, height: 30, speed: 6, color, type, collected: false, scale: 1 });
}

function updateFlames() {
  for (let i = flames.length - 1; i >= 0; i--) {
    const f = flames[i];
    f.x -= f.speed;
    if (f.collected) { f.scale -= 0.1; if (f.scale <= 0) flames.splice(i, 1); }
    else if (f.x + f.width < 0) flames.splice(i, 1);
  }
}

function drawFlames() {
  for (const f of flames) {
    ctx.save();
    ctx.translate(f.x + f.width / 2, f.y + f.height / 2);
    ctx.scale(f.scale, f.scale);
    ctx.fillStyle = f.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, f.width / 2, f.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function checkFlameCollection(player) {
  let collected = 0;
  for (const f of flames) {
    if (f.collected) continue;
    const hit = player.x < f.x + f.width && player.x + player.width > f.x && player.y < f.y + f.height && player.y + player.height > f.y;
    if (hit) {
      f.collected = true;
      collected++;
      flameCounters[f.type] += flameMultiplier;
      if (f.type === "abyssal") {
        player.hasLightningTrail = true;
        player.trailTimer = 5000;
      }
    }
  }
  if (collected > 0) {
    flameStreak += collected;
    if (flameStreak >= 3 && flameMultiplier < maxMultiplier) {
      flameMultiplier++;
      flameStreak = 0;
    }
  } else {
    flameStreak = 0;
    flameMultiplier = 1;
  }
}

function usePower(key) {
  const power = powers[key];
  if (!power || !power.unlocked || flameCounters[power.type] < power.cost) return;
  const now = performance.now();
  if (now - power.lastUsed < power.cooldown) return;
  flameCounters[power.type] -= power.cost;
  power.lastUsed = now;
  player.activePower = key;

  if (key === "powerPunch") {
    player.animation.powerPunchActive = true;
    player.animation.powerPunchTimer = 300;
    for (let i = 0; i < obstacles.length; i++) {
      if (obstacles[i].x > player.x) {
        obstacles.splice(i, 1);
        break;
      }
    }
  } else if (key === "shieldBarrier") player.powerTimer = 3000;
  else if (key === "tornado") {
    player.powerTimer = 4000;
    shakeTime = 4000;
    shakeIntensity = 5;
    activeTornado = {
      x: player.x + player.width + 20,
      y: player.y + player.height / 2,
      radius: 0,
      maxRadius: 60,
      opacity: 1
    };
  } else if (key === "fiveJump") { player.jumpCount = 5; player.powerTimer = 7000; }
  else if (key === "jumpBack") { player.x -= 100; }
  else if (key === "gravityShift") { player.gravity = 0.2; player.powerTimer = 4000; }
  else if (key === "flashRunner") { player.speedBoost = true; player.powerTimer = 8000; }
}

function drawPlayer() {
  if (player.animation.powerPunchActive) {
    ctx.save();
    ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(0, 0, 60 - player.animation.powerPunchTimer / 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

function updatePlayer() {
  player.dy += player.gravity;
  player.y += player.dy;
  if (player.y + player.height > canvas.height - groundHeight) {
    player.y = canvas.height - groundHeight - player.height;
    player.dy = 0;
    player.isJumping = false;
    if (player.speedBoost) player.x += 4;
  }
}

function drawLightningTrail() {
  for (let i = player.trail.length - 1; i >= 0; i--) {
    const t = player.trail[i];
    t.opacity -= 0.05;
    if (t.opacity <= 0) {
      player.trail.splice(i, 1);
      continue;
    }
    ctx.save();
    ctx.globalAlpha = t.opacity;
    ctx.fillStyle = "#cc00ff";
    ctx.beginPath();
    ctx.arc(t.x, t.y, t.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawPowerFX() {
  if (player.activePower === "shieldBarrier") {
    ctx.save();
    ctx.strokeStyle = "rgba(0, 255, 255, 0.6)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, player.y + player.height / 2, 40 + Math.sin(Date.now() / 100) * 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

function drawTornadoFX() {
  if (!activeTornado) return;
  ctx.save();
  ctx.translate(activeTornado.x, activeTornado.y);
  ctx.globalAlpha = activeTornado.opacity;
  for (let i = 0; i < 10; i++) {
    const r = activeTornado.radius * (i / 10);
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(180,0,255,${1 - i * 0.08})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.restore();
}

function drawGround() {
  ctx.fillStyle = "#2f2f4f";
  ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight);
}

function resetGame() {
  Object.assign(flameCounters, { dark: 0, violet: 0, abyssal: 0 });
  Object.assign(player, {
    x: 100, y: canvas.height - groundHeight - player.height,
    dy: 0, isJumping: false, trail: [], hasLightningTrail: false,
    activePower: null
  });
  flames.length = 0;
  obstacles.length = 0;
  shakeTime = 0;
  activeTornado = null;
  restartBtn.style.display = "none";
  requestAnimationFrame(gameLoop);
}

function gameLoop() {
  let offsetX = 0, offsetY = 0;
  if (shakeTime > 0) {
    shakeTime -= 16;
    offsetX = (Math.random() - 0.5) * shakeIntensity;
    offsetY = (Math.random() - 0.5) * shakeIntensity;
    ctx.save();
    ctx.translate(offsetX, offsetY);
  }

  ctx.clearRect(-offsetX, -offsetY, canvas.width, canvas.height);
  drawGround();
  updatePlayer();

  if (player.hasLightningTrail) {
    player.trailTimer -= 16;
    player.trail.push({ x: player.x + player.width / 2, y: player.y + player.height / 2, opacity: 1, size: Math.random() * 8 + 5 });
    if (player.trailTimer <= 0) player.hasLightningTrail = false;
  }

  if (!window.flameSpawnTimer || performance.now() - window.flameSpawnTimer > 2000) {
    spawnFlame(canvas.width, canvas.height - groundHeight);
    window.flameSpawnTimer = performance.now();
  }

  updateFlames();
  drawFlames();
  checkFlameCollection(player);

  if (!window.obstacleTimer || performance.now() - window.obstacleTimer > 1500) {
    spawnObstacle(canvas.width, canvas.height - groundHeight);
    window.obstacleTimer = performance.now();
  }

  updateObstacles(player);
  drawObstacles(ctx);

  drawLightningTrail();
  drawPowerFX();
  drawPlayer();
  drawTornadoFX();

  if (checkCollision(player) && player.activePower !== "shieldBarrier") {
    ctx.fillStyle = "#ff0000";
    ctx.font = "48px sans-serif";
    ctx.fillText("💥 GAME OVER 💥", canvas.width / 2 - 150, canvas.height / 2);
    restartBtn.style.display = "block";
    if (shakeTime > 0) ctx.restore();
    return;
  }

  for (const key in powers) {
    const p = powers[key];
    if (!p.unlocked && flameCounters[p.type] >= p.cost) {
      p.unlocked = true;
      console.log(`🔓 ${p.name} unlocked`);
    }
  }

  ctx.fillStyle = "#ffffff";
  ctx.font = "16px monospace";
  ctx.fillText(`🔥 Dark: ${flameCounters.dark}`, 30, 40);
  ctx.fillText(`💜 Violet: ${flameCounters.violet}`, 30, 60);
  ctx.fillText(`🟣 Abyssal: ${flameCounters.abyssal}`, 30, 80);
  ctx.fillText(`🔥 Multiplier: x${flameMultiplier}`, 30, 100);

let hudY = 130;
for (const key in powers) {
  const power = powers[key];
  const isReady = performance.now() - power.lastUsed >= power.cooldown;
  const isUnlocked = power.unlocked;
  const status = !isUnlocked ? "🔒 LOCKED" : isReady ? "✅ READY" : "⏳ COOLING";

  ctx.fillStyle = isUnlocked ? (isReady ? "#00ff00" : "#ffaa00") : "#999999";
  ctx.fillText(`${power.name.padEnd(14)}: ${status}`, 30, hudY);
  hudY += 20;
}

  if (player.activePower) {
    player.powerTimer -= 16;
    if (player.powerTimer <= 0) {
      player.activePower = null;
      activeTornado = null;
      player.gravity = 0.8;
      player.speedBoost = false;
      player.jumpCount = 1;
    }
  }

  if (shakeTime > 0) ctx.restore();
  requestAnimationFrame(gameLoop);
}

window.addEventListener("keydown", e => {
  if (e.code === "Space") {
    if (!player.jumpCount) player.jumpCount = 1;
    if (player.jumpCount > 0) {
      player.dy = player.jumpPower;
      player.isJumping = true;
      player.jumpCount--;
    }
  }
  const keyBindings = {
    KeyP: "powerPunch",
    KeyB: "shieldBarrier",
    KeyT: "tornado",
    KeyJ: "fiveJump",
    KeyR: "jumpBack",
    KeyG: "gravityShift",
    KeyF: "flashRunner"
  };
  if (keyBindings[e.code]) usePower(keyBindings[e.code]);
});

restartBtn.addEventListener("click", resetGame);
requestAnimationFrame(gameLoop);
