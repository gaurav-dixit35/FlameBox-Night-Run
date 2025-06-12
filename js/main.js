// js/main.js

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const restartBtn = document.getElementById("restartBtn");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const groundHeight = 100;
const player = {
  x: 100,
  y: canvas.height - groundHeight - 50,
  width: 50,
  height: 50,
  color: "#ffffff",
  dy: 0,
  gravity: 0.8,
  jumpPower: -15,
  isJumping: false
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
    cost: 50,
    type: "dark",
    cooldown: 20000,
    lastUsed: 0,
    unlocked: false
  },
  tornado: {
    name: "Tornado",
    cost: 20,
    type: "violet",
    cooldown: 60000,
    lastUsed: 0,
    unlocked: false
  }
  // Add more powers later...
};

// Game variables
let obstacleTimer = 0;
const spawnInterval = 1500;

let flameSpawnTimer = 0;
const flameInterval = 2000;

let flameCounters = { dark: 0, violet: 0, abyssal: 0 };
let flameCount = 0;

const obstacles = [];
const flames = [];

// 🔥 Spawn Flame with Type and Color
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

  const flame = {
    x: canvasWidth + Math.random() * 100,
    y: groundY - 60,
    width: 20,
    height: 30,
    speed: 6,
    color,
    type,
    collected: false,
    scale: 1
  };

  flames.push(flame);
}

// 🔁 Flame Update
function updateFlames() {
  for (let i = flames.length - 1; i >= 0; i--) {
    const f = flames[i];
    f.x -= f.speed;

    if (f.collected) {
      f.scale -= 0.1;
      if (f.scale <= 0) {
        flames.splice(i, 1);
      }
    }

    if (f.x + f.width < 0) flames.splice(i, 1);
  }
}
// 🔓 Auto-unlock powers when enough flames collected
for (const key in powers) {
  const power = powers[key];
  if (!power.unlocked && flameCounters[power.type] >= power.cost) {
    power.unlocked = true;
    console.log(`🔓 ${power.name} unlocked!`);
  }
}

// 🎨 Draw Flames
function drawFlames(ctx) {
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

// 🎯 Check for Flame Collection
function checkFlameCollection(player) {
  let collectedTotal = 0;

  for (const f of flames) {
    if (f.collected) continue;

    const isTouching =
      player.x < f.x + f.width &&
      player.x + player.width > f.x &&
      player.y < f.y + f.height &&
      player.y + player.height > f.y;

    if (isTouching) {
      f.collected = true;
      collectedTotal++;
      flameCounters[f.type]++;
    }
  }

  return collectedTotal;
}

// 🚧 Obstacle Functions
function spawnObstacle(canvasWidth, groundY) {
  const obstacle = {
    x: canvasWidth + Math.random() * 100,
    y: groundY - 50,
    width: 40,
    height: 50,
    speed: 6,
    color: "#ff3333"
  };
  obstacles.push(obstacle);
}

function updateObstacles() {
  for (let i = obstacles.length - 1; i >= 0; i--) {
    obstacles[i].x -= obstacles[i].speed;
    if (obstacles[i].x + obstacles[i].width < 0) {
      obstacles.splice(i, 1);
    }
  }
}

function drawObstacles(ctx) {
  for (const obs of obstacles) {
    ctx.fillStyle = obs.color;
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
  }
}

function checkCollision(player) {
  for (const obs of obstacles) {
    const isColliding =
      player.x < obs.x + obs.width &&
      player.x + player.width > obs.x &&
      player.y < obs.y + obs.height &&
      player.y + player.height > obs.y;

    if (isColliding) return true;
  }
  return false;
}

// 🧱 Ground / Player
function drawPlayer() {
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawGround() {
  ctx.fillStyle = "#2f2f4f";
  ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight);
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

// 🔄 Main Game Loop
function gameLoop(timestamp) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawGround();
  updatePlayer();
  drawPlayer();

  // Obstacles
  if (!obstacleTimer || timestamp - obstacleTimer > spawnInterval) {
    spawnObstacle(canvas.width, canvas.height - groundHeight);
    obstacleTimer = timestamp;
  }

  updateObstacles();
  drawObstacles(ctx);

  if (checkCollision(player)) {
    ctx.fillStyle = "#ff0000";
    ctx.font = "48px sans-serif";
    ctx.fillText("💥 GAME OVER 💥", canvas.width / 2 - 150, canvas.height / 2);
    restartBtn.style.display = "block";
    return;
  }

  // Flames
  if (!flameSpawnTimer || timestamp - flameSpawnTimer > flameInterval) {
    spawnFlame(canvas.width, canvas.height - groundHeight);
    flameSpawnTimer = timestamp;
  }

  updateFlames();
  drawFlames(ctx);
  flameCount += checkFlameCollection(player);

  // UI
  ctx.fillStyle = "#ffffff";
  ctx.font = "16px monospace";
  ctx.fillText(`🔥 Dark: ${flameCounters.dark}`, 30, 40);
  ctx.fillText(`💜 Violet: ${flameCounters.violet}`, 30, 60);
  ctx.fillText(`🟣 Abyssal: ${flameCounters.abyssal}`, 30, 80);
  ctx.fillText(`⚡ Power: ${powers.powerPunch.unlocked ? "PUNCH" : "LOCKED"}`, 30, 110);

  requestAnimationFrame(gameLoop);
}

// 🔁 Restart Button
function resetGame() {
  flameCount = 0;
  flameCounters = { dark: 0, violet: 0, abyssal: 0 };

  player.x = 100;
  player.y = canvas.height - groundHeight - player.height;
  player.dy = 0;
  player.isJumping = false;

  obstacles.length = 0;
  flames.length = 0;
  obstacleTimer = 0;
  flameSpawnTimer = 0;

  restartBtn.style.display = "none";
  requestAnimationFrame(gameLoop);
}

window.addEventListener("keydown", function (e) {
  if (e.code === "Space" && !player.isJumping) {
    player.dy = player.jumpPower;
    player.isJumping = true;
  }

  if (e.code === "KeyP") {
    usePower("powerPunch");
  }
});
function usePower(key) {
  const power = powers[key];
  if (!power || !power.unlocked) return;

  const now = performance.now();
  if (now - power.lastUsed < power.cooldown) {
    console.log(`${power.name} on cooldown`);
    return;
  }

  power.lastUsed = now;

  if (key === "powerPunch") {
    // Example: destroy the nearest obstacle
    for (let i = 0; i < obstacles.length; i++) {
      if (obstacles[i].x > player.x) {
        console.log("💥 Power Punch used!");
        obstacles.splice(i, 1);
        break;
      }
    }
  }

  // Add other power effects here...
}


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
