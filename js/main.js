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
  animation: {
    powerPunchActive: false,
    powerPunchTimer: 0
  },
    fiveJump: {
    name: "5x Jump",
    cost: 100,
    type: "dark",
    cooldown: 30000,
    lastUsed: 0,
    unlocked: false
  },
  jumpBack: {
    name: "Jump Back",
    cost: 150,
    type: "dark",
    cooldown: 20000,
    lastUsed: 0,
    unlocked: false
  },
  gravityShift: {
    name: "Gravity Shift",
    cost: 50,
    type: "violet",
    cooldown: 45000,
    lastUsed: 0,
    unlocked: false
  },
  flashRunner: {
    name: "Flash Runner",
    cost: 100,
    ype: "violet",
    cooldown: 90000,
    lastUsed: 0,
    unlocked: false
  },
  trail: [],
  trailTimer: 0,
  hasLightningTrail: false,
  activePower: null,
  powerTimer: 0
};

const powers = {
  powerPunch: {
    name: "Power Punch",
    cost: 10,
    type: "dark",
    cooldown: 15000,
    lastUsed: 0,
    unlocked: false
  },
  shieldBarrier: {
    name: "Shield Barrier",
    cost: 15,
    type: "dark",
    cooldown: 20000,
    lastUsed: 0,
    unlocked: false
  },
  tornado: {
    name: "Tornado",
    cost: 1,
    type: "violet",
    cooldown: 60000,
    lastUsed: 0,
    unlocked: false
  }
};

let obstacleTimer = 0;
const spawnInterval = 1500;
let flameSpawnTimer = 0;
const flameInterval = 2000;
let flameCounters = { dark: 0, violet: 0, abyssal: 0 };
let flameCount = 0;
let flameMultiplier = 1;
let flameStreak = 0;
const maxMultiplier = 5;
const obstacles = [];
const flames = [];

function spawnFlame(canvasWidth, groundY) {
  const rand = Math.random();
  let type = "dark";
  let color = "#8000ff";
  if (rand < 0.01) {
    type = "abyssal";
    color = "#cc00ff";
  } else if (rand < 0.15) {
    type = "violet";
    color = "#9933ff";
  }
  flames.push({
    x: canvasWidth + Math.random() * 100,
    y: groundY - 60,
    width: 20,
    height: 30,
    speed: 6,
    color,
    type,
    collected: false,
    scale: 1
  });
}

function updateFlames() {
  for (let i = flames.length - 1; i >= 0; i--) {
    const f = flames[i];
    f.x -= f.speed;
    if (f.collected) {
      f.scale -= 0.1;
      if (f.scale <= 0) flames.splice(i, 1);
    }
    if (f.x + f.width < 0) flames.splice(i, 1);
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
  let collectedThisFrame = 0;
  for (const f of flames) {
    if (f.collected) continue;

    const isTouching =
      player.x < f.x + f.width &&
      player.x + player.width > f.x &&
      player.y < f.y + f.height &&
      player.y + player.height > f.y;

    if (isTouching) {
      f.collected = true;
      collectedThisFrame++;
      flameCounters[f.type] += flameMultiplier;
      if (f.type === "abyssal") {
        player.hasLightningTrail = true;
        player.trailTimer = 5000;
      }
    }
  }

  if (collectedThisFrame > 0) {
    flameStreak += collectedThisFrame;
    if (flameStreak >= 3 && flameMultiplier < maxMultiplier) {
      flameMultiplier++;
      flameStreak = 0;
      console.log(`🔥 Multiplier increased to x${flameMultiplier}`);
    }
  } else {
    // If no flame collected this frame, reset streak
    flameStreak = 0;
    flameMultiplier = 1;
  }

  return collectedThisFrame;
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

function gameLoop(timestamp) {
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
    player.trail.push({
      x: player.x + player.width / 2,
      y: player.y + player.height / 2,
      opacity: 1,
      size: Math.random() * 8 + 5
    });
    if (player.trailTimer <= 0) player.hasLightningTrail = false;
  }

  if (activeTornado) {
    if (activeTornado.radius < activeTornado.maxRadius) activeTornado.radius += 2;
    for (const flame of flames) {
      const dx = activeTornado.x - flame.x;
      const dy = activeTornado.y - flame.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < activeTornado.radius) {
        flame.x += dx * 0.1;
        flame.y += dy * 0.1;
      }
    }
  }

  drawLightningTrail();
  drawPowerFX();
  drawPlayer();
  drawTornadoFX();

  if (!obstacleTimer || timestamp - obstacleTimer > spawnInterval) {
    spawnObstacle(canvas.width, canvas.height - groundHeight);
    obstacleTimer = timestamp;
  }
  updateObstacles();
  drawObstacles();

  if (checkCollision(player) && player.activePower !== "shieldBarrier") {
    ctx.fillStyle = "#ff0000";
    ctx.font = "48px sans-serif";
    ctx.fillText("💥 GAME OVER 💥", canvas.width / 2 - 150, canvas.height / 2);
    restartBtn.style.display = "block";
    if (shakeTime > 0) ctx.restore();
    return;
  }

  if (!flameSpawnTimer || timestamp - flameSpawnTimer > flameInterval) {
    spawnFlame(canvas.width, canvas.height - groundHeight);
    flameSpawnTimer = timestamp;
  }

  updateFlames();
  drawFlames();
  flameCount += checkFlameCollection(player);

  for (const key in powers) {
    const power = powers[key];
    if (!power.unlocked && flameCounters[power.type] >= power.cost) {
      power.unlocked = true;
      console.log(`🔓 ${power.name} unlocked!`);
    }
  }

  ctx.fillStyle = "#ffffff";
  ctx.font = "16px monospace";
  ctx.fillText(`🔥 Dark: ${flameCounters.dark}`, 30, 40);
  ctx.fillText(`💜 Violet: ${flameCounters.violet}`, 30, 60);
  ctx.fillText(`🟣 Abyssal: ${flameCounters.abyssal}`, 30, 80);
  ctx.fillText(`🔥 Multiplier: x${flameMultiplier}`, 30, 100);


  if (player.activePower) {
    player.powerTimer -= 16;
    if (player.powerTimer <= 0) {
      player.activePower = null;
      activeTornado = null;
    }
  }

  if (shakeTime > 0) ctx.restore();
  requestAnimationFrame(gameLoop);
}

function usePower(key) {
  const power = powers[key];
  if (!power || !power.unlocked || flameCounters[power.type] < power.cost) {
    console.log(`❌ Not enough flames or power locked`);
    return;
  }

  const now = performance.now();
  if (now - power.lastUsed < power.cooldown) {
    console.log(`${power.name} on cooldown`);
    return;
  }

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
  } else if (key === "shieldBarrier") {
    player.powerTimer = 3000;
  } else if (key === "tornado") {
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
  }
}

function spawnObstacle(canvasWidth, groundY) {
  obstacles.push({
    x: canvasWidth + Math.random() * 100,
    y: groundY - 50,
    width: 40,
    height: 50,
    speed: 6,
    color: "#ff3333"
  });
}

function updateObstacles() {
  for (let i = obstacles.length - 1; i >= 0; i--) {
    obstacles[i].x -= obstacles[i].speed;
    if (obstacles[i].x + obstacles[i].width < 0) obstacles.splice(i, 1);
  }
}

function drawObstacles() {
  for (const obs of obstacles) {
    ctx.fillStyle = obs.color;
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
  }
}

function checkCollision(player) {
  for (const obs of obstacles) {
    if (player.x < obs.x + obs.width &&
        player.x + player.width > obs.x &&
        player.y < obs.y + obs.height &&
        player.y + player.height > obs.y) {
      return true;
    }
  }
  return false;
}

function drawGround() {
  ctx.fillStyle = "#2f2f4f";
  ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight);
}

function drawPlayer() {
  if (player.animation.powerPunchActive) {
    ctx.save();
    ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
    ctx.fillStyle = "#ffffff";
    ctx.globalAlpha = 0.9;
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
  }
}

function resetGame() {
  flameCount = 0;
  flameCounters = { dark: 0, violet: 0, abyssal: 0 };
  player.x = 100;
  player.y = canvas.height - groundHeight - player.height;
  player.dy = 0;
  player.isJumping = false;
  player.trail = [];
  player.hasLightningTrail = false;
  player.activePower = null;
  obstacles.length = 0;
  flames.length = 0;
  obstacleTimer = 0;
  flameSpawnTimer = 0;
  shakeTime = 0;
  restartBtn.style.display = "none";
  requestAnimationFrame(gameLoop);
}

window.addEventListener("keydown", function (e) {
  if (e.code === "Space" && !player.isJumping) {
    player.dy = player.jumpPower;
    player.isJumping = true;
  }
  if (e.code === "KeyP") usePower("powerPunch");
  if (e.code === "KeyB") usePower("shieldBarrier");
  if (e.code === "KeyT") usePower("tornado");
});

restartBtn.addEventListener("click", resetGame);
requestAnimationFrame(gameLoop);


/* main.js
import PreloadScene from "./scenes/PreloadScene.js";
import LoginScene from "./scenes/LoginScene.js";

const db = firebase.firestore();
const config = {
  type: Phaser.AUTO,
  width: 960,
  height: 540,
  backgroundColor: "#0d0d1a",
  parent: "game-container",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 1000 },
      debug: false
    }
  },
  dom: {
    createContainer: true
  },
  scene: [PreloadScene, LoginScene]
};

new Phaser.Game(config); */
