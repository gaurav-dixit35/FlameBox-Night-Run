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
let paused = false;

// 🧠 Boss variables
let bossSpawnTimer = 0;
let bossInterval = 1 * 60 * 1000; // 5 minutes
let bossPhase = 1;
let bossActive = false;
let boss = null;
let bossHint = "";
let bossSolutionKey = "powerPunch";
let hintVisible = false;
let hintStartTime = 0;
let hintDisplayTimer = 5000; // How long the hint stays visible

const bossWeaknessOptions = ["powerPunch", "tornado", "shieldBarrier"];
//Boss aa gaya
function spawnBoss() {
  bossSolutionKey = bossWeaknessOptions[Math.floor(Math.random() * bossWeaknessOptions.length)];
  boss = {
    x: canvas.width + 200,
    y: canvas.height - groundHeight - (100 + bossPhase * 10),
    width: 100 + bossPhase * 10,
    height: 100 + bossPhase * 10,
    color: "#5500ff",
    speed: 2 + bossPhase * 0.5,
    weakness: bossSolutionKey,
    health: 3 + bossPhase * 2,
    active: true
  };
  bossActive = true;
  bossPhase++;
}

function drawBoss() {
  if (!boss) return;
  ctx.fillStyle = boss.color;
  ctx.fillRect(boss.x, boss.y, boss.width, boss.height);
  ctx.strokeStyle = "#ff00ff";
  ctx.lineWidth = 3;
  ctx.strokeRect(boss.x - 2, boss.y - 2, boss.width + 4, boss.height + 4);
}

function showPowerHint() {
  hintVisible = true;
  hintStartTime = performance.now();
}

function drawPowerHint() {
  if (!hintVisible) return;
  const elapsed = performance.now() - hintStartTime;
  if (elapsed > hintDisplayTimer) {
    hintVisible = false;
    return;
  }
  ctx.fillStyle = "#ffaa00";
  ctx.font = "28px bold sans-serif";
  ctx.fillText(`⚠️ Use ${powers[bossSolutionKey].name} to defeat the BOSS!`, canvas.width / 2 - 200, 100);
}
//flame
let bossProjectiles = [];
let bossShootCooldown = 3000;
let lastBossShotTime = 0;
//exploding
let bossExplosions = [];

function updateExplosions() {
  for (let i = bossExplosions.length - 1; i >= 0; i--) {
    const ex = bossExplosions[i];
    ex.radius += 2;
    ex.opacity -= 0.05;
    if (ex.opacity <= 0) bossExplosions.splice(i, 1);
  }
}

function drawExplosions() {
  for (const ex of bossExplosions) {
    ctx.save();
    ctx.globalAlpha = ex.opacity;
    ctx.strokeStyle = "#ff3300";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(ex.x, ex.y, ex.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}
function fireBossProjectile() {
  if (boss && boss.active) {
    bossProjectiles.push({
      x: boss.x,
      y: boss.y + boss.height / 2,
      width: 10,
      height: 10,
      speed: 5,
      color: "#ff3300"
    });
    if (boss && boss.active) {
  // Fire every 2 seconds
  if (!boss.lastFire || performance.now() - boss.lastFire > 2000) {
    fireBossProjectile();
    boss.lastFire = performance.now();
  }
}

  }
}


//attack
function updateBossAttack() {
  if (!boss || !boss.active) return;

  const now = performance.now();
  if (now - lastBossShotTime > bossShootCooldown) {
    bossProjectiles.push({
      x: boss.x,
      y: boss.y + boss.height / 2,
      width: 20,
      height: 20,
      speed: 5 + bossPhase * 0.5,
      color: "#ff3300"
      
    });
    lastBossShotTime = now;
    
  }

  for (let i = bossProjectiles.length - 1; i >= 0; i--) {
  const proj = bossProjectiles[i];
  proj.x -= proj.speed;

  if (proj.x + proj.width < 0) {
    bossExplosions.push({
      x: proj.x + proj.width / 2,
      y: proj.y + proj.height / 2,
      radius: 10,
      opacity: 0.6
    });
    bossProjectiles.splice(i, 1);
  }
}

}

function drawBossProjectiles() {
  for (const proj of bossProjectiles) {
    ctx.fillStyle = proj.color;
    ctx.fillRect(proj.x, proj.y, proj.width, proj.height);
  }
}

function checkBossProjectileCollision() {
  for (const proj of bossProjectiles) {
    const hit =
      player.x < proj.x + proj.width &&
      player.x + player.width > proj.x &&
      player.y < proj.y + proj.height &&
      player.y + player.height > proj.y;

    if (hit && player.activePower !== "shieldBarrier") {
  bossExplosions.push({
    x: proj.x + proj.width / 2,
    y: proj.y + proj.height / 2,
    radius: 10,
    opacity: 1
  });
  return true;
}

  }
  return false;
}

// 🧍‍♂️ Player setup
const player = {
  x: 100,
  y: canvas.height - groundHeight - 50,
  width: 50,
  height: 50,
  color: "#ffffff",
  dy: 0,
  gravity: 0.8,
  jumpPower: -12,
  superJumpPower: -20, // 🔼 2x jump height

  isJumping: false,
  animation: { powerPunchActive: false, powerPunchTimer: 0 },
  trail: [],
  trailTimer: 0,
  hasLightningTrail: false,
  activePower: null,
  powerTimer: 0,
  jumpCount: 1,
  maxJumps: 2

};

// 🔥 Powers
const powers = {
  powerPunch: { name: "P(Power Punch)", cost: 10, type: "dark", cooldown: 15000, lastUsed: 0, unlocked: false },
  shieldBarrier: { name: "B(Shield Barrier)", cost: 15, type: "dark", cooldown: 20000, lastUsed: 0, unlocked: false },
  tornado: { name: "T(Tornado)", cost: 15, type: "violet", cooldown: 60000, lastUsed: 0, unlocked: false },
  fiveJump: { name: "J(5x Jump)", cost: 20, type: "dark", cooldown: 30000, lastUsed: 0, unlocked: false },
  jumpBack: { name: "R(Jump Back)", cost: 9, type: "dark", cooldown: 20000, lastUsed: 0, unlocked: false },
  gravityShift: { name: "G(Gravity Shift)", cost: 2, type: "violet", cooldown: 45000, lastUsed: 0, unlocked: false },
  flashRunner: { name: "H(Flash Runner)", cost: 4, type: "violet", cooldown: 90000, lastUsed: 0, unlocked: false }
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
    player.jumpCount = player.maxJumps;

    player.dy = 0;
    player.isJumping = false;
    if (player.speedBoost) player.x += 4;
  }
}

function drawGround() {
  ctx.fillStyle = "#2f2f4f";
  ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight);
}

function resetGame() {
  Object.assign(flameCounters, { dark: 0, violet: 0, abyssal: 0 });
  flameMultiplier = 1;
  flameStreak = 0;

  for (const key in powers) {
    powers[key].unlocked = false;
    powers[key].lastUsed = 0;
  }

  Object.assign(player, {
    x: 100,
    y: canvas.height - groundHeight - player.height,
    dy: 0,
    isJumping: false,
    trail: [],
    hasLightningTrail: false,
    activePower: null,
    powerTimer: 0,
    speedBoost: false,
    gravity: 0.8,
    jumpCount: 1,
    maxJumps: 2
  });

  flames.length = 0;
  obstacles.length = 0;
  boss = null;
  bossActive = false;
  bossPhase = 1;
  hintVisible = false;
  shakeTime = 0;
  activeTornado = null;
  restartBtn.style.display = "none";
  bossProjectiles = [];
  bossExplosions = [];
  requestAnimationFrame(gameLoop);
}


function gameLoop(timestamp) {
  let offsetX = 0, offsetY = 0;
  if (paused) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.font = "48px monospace";
    ctx.fillText("⏸ PAUSED", canvas.width / 2 - 100, canvas.height / 2);
    requestAnimationFrame(gameLoop);
    return;
  }

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
    if (boss && !hintVisible && obstacles.length >= 2) {
      showPowerHint();
    } else {
      spawnObstacle(canvas.width, canvas.height - groundHeight);
    }
    window.obstacleTimer = performance.now();
  }
  

  updateObstacles(player);
  drawObstacles(ctx);
  drawPowerHint();
  drawLightningTrail();
  drawPowerFX();
  drawPlayer();
  drawTornadoFX();
  drawBoss();
  drawBoss();
  updateBossAttack();
  drawBossProjectiles();
  updateExplosions();
  drawExplosions();
  if (checkBossProjectileCollision()) {
  ctx.fillStyle = "#ff0000";
  ctx.font = "48px sans-serif";
  ctx.fillText("💀 HIT BY BOSS ATTACK 💀", canvas.width / 2 - 200, canvas.height / 2);

  restartBtn.style.display = "block";
  
  // Optional: freeze frame for clarity
  cancelAnimationFrame(gameLoop); // only if needed

  return; // 💥 Stop the loop
}



  // 🩸 Draw boss health bar
if (boss) {
  const barWidth = 200;
  const barHeight = 20;
  const healthRatio = boss.health / (3 + (bossPhase - 1) * 2); // max health per phase
  ctx.fillStyle = "#000000";
  ctx.fillRect(canvas.width / 2 - barWidth / 2, 50, barWidth, barHeight);
  ctx.fillStyle = "#ff3333";
  ctx.fillRect(canvas.width / 2 - barWidth / 2, 50, barWidth * healthRatio, barHeight);
  ctx.strokeStyle = "#ffffff";
  ctx.strokeRect(canvas.width / 2 - barWidth / 2, 50, barWidth, barHeight);

  // 💥 Boss charge behavior animation
  if (!boss.chargeTimer) boss.chargeTimer = 0;
  boss.chargeTimer += 16;
  if (boss.chargeTimer >= 2000) { // every 2s
    boss.x -= boss.speed * 2; // faster charge
    boss.chargeTimer = 0;
    // Optional shake
    shakeTime = 300;
    shakeIntensity = 4;
  }
}


  if (boss) {
    boss.x -= boss.speed;

    if (boss.x < player.x + player.width && player.activePower === boss.weakness) {
      console.log("✅ Boss defeated!");
      boss = null;
      hintVisible = false;
    } else if (boss.x < player.x - 100) {
      ctx.fillStyle = "#ff0000";
      ctx.font = "48px sans-serif";
      ctx.fillText("💀 YOU WERE DEFEATED BY THE BOSS 💀", canvas.width / 2 - 300, canvas.height / 2);
      restartBtn.style.display = "block";
      return;
    }
  }

  if (checkCollision(player) && player.activePower !== "shieldBarrier") {
    ctx.fillStyle = "#ff0000";
    ctx.font = "48px sans-serif";
    ctx.fillText("💥 GAME OVER 💥", canvas.width / 2 - 150, canvas.height / 2);
    restartBtn.style.display = "block";
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
    const status = !power.unlocked ? "🔒 LOCKED" : isReady ? "✅ READY" : "⏳ COOLING";
    ctx.fillStyle = power.unlocked ? (isReady ? "#00ff00" : "#ffaa00") : "#999999";
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

  if (!bossSpawnTimer) bossSpawnTimer = performance.now();
  if (performance.now() - bossSpawnTimer > bossInterval && !boss) {
    spawnBoss();
    bossSpawnTimer = performance.now();
  }

  if (shakeTime > 0) ctx.restore();
  requestAnimationFrame(gameLoop);
}

window.addEventListener("keydown", e => {
  if (e.code === "Space") {
    if (player.jumpCount > 0) {
      player.dy = player.jumpPower;
      player.isJumping = true;
      player.jumpCount--;
    }
  }

  if (e.code === "KeyN") {
    if (player.jumpCount > 0) {
      player.dy = player.superJumpPower;
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
