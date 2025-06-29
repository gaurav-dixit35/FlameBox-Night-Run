// js/obstacles.js

export const obstacles = [];

export function spawnObstacle(canvasWidth, groundY) {
  const rand = Math.random();
  let type = "default";

  // ❗ Restrict special obstacles during boss/hint phase
  if (typeof window.boss !== 'undefined' && (window.boss || window.hintVisible)) {
    type = "default";
  } else {
    if (rand < 0.2) type = "gravityBlock";
    else if (rand < 0.4) type = "crushPanel";
    else if (rand < 0.6) type = "phaseBomb";
    else if (rand < 0.75) type = "titanBlock"; // NEW 🟡
  }

  // 🎯 Custom Y and Height logic
  let height = 50;
  let yPos = groundY - height;

  if (type === "crushPanel") {
    yPos = groundY - 120; // anti-gravity float
  } else if (type === "titanBlock") {
    height = 150;
    yPos = groundY - height;
  }

  const obstacle = {
    x: canvasWidth + Math.random() * 100,
    y: yPos,
    width: 40,
    height,
    speed: 6,
    type,
    visible: true,
    fallSpeed: 0,
    triggered: false,
    phaseTimer: 0,
    color: type === "phaseBomb" ? "#ff00ff" :
           type === "crushPanel" ? "#ff6600" :
           type === "gravityBlock" ? "#3399ff" :
           type === "titanBlock" ? "#ffcc00" : "#ff3333"
  };

  obstacles.push(obstacle);
}




export function updateObstacles(player) {
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];
    obs.x -= obs.speed;

    if (obs.type === "gravityBlock" || obs.type === "crushPanel") {
      const triggerDistance = 100;
      if (!obs.triggered && Math.abs(player.x - obs.x) < triggerDistance) {
        obs.triggered = true;
      }
    }

    if (obs.type === "gravityBlock" && obs.triggered) {
      obs.fallSpeed += 0.5;
      obs.y += obs.fallSpeed;
    }

    if (obs.type === "crushPanel" && obs.triggered) {
      obs.fallSpeed = 12;
      obs.y += obs.fallSpeed;
    }

    if (obs.type === "phaseBomb") {
      obs.phaseTimer += 16;
      obs.visible = (Math.floor(obs.phaseTimer / 1000) % 2 === 0);
    }

    if (obs.x + obs.width < 0 || obs.y > player.y + 400) {
      obstacles.splice(i, 1);
    }
  }
}

export function drawObstacles(ctx) {
  for (const obs of obstacles) {
    if (obs.type === "phaseBomb" && !obs.visible) continue;

    ctx.fillStyle = obs.color;
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
  }
}

export function checkCollision(player) {
  for (const obs of obstacles) {
    if (obs.type === "phaseBomb" && !obs.visible) continue;

    const isColliding =
      player.x < obs.x + obs.width &&
      player.x + player.width > obs.x &&
      player.y < obs.y + obs.height &&
      player.y + player.height > obs.y;

    if (isColliding) return true;
  }
  return false;
}
