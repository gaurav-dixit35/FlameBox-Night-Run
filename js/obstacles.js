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
    else if (rand < 0.8) type = "antiblock";
  }

  // 🎯 Custom Y and Height logic
  let height = 50;
    let yPos = groundY - height;
    if (type === "antiblock") {
      height = 100;
      yPos = groundY - 40; // make it appear almost flush with ground
    }

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
          type === "titanBlock" ? "#ffcc00" :
          type === "antiblock" ? "#99ddaa" :
          "#ff3333"


  };

  obstacles.push(obstacle);
  
}




export function updateObstacles(player, groundY){
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
      obs.x -= obs.speed * 1.5; // move faster forward
      
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
    if (obs.type === "antiblock") {
      const distanceToPlayer = Math.abs(obs.x - player.x);

      // Trigger jump if player is close and hasn't triggered already
      if (!obs.triggered && distanceToPlayer < 120) {
        obs.triggered = true;
        obs.jumpSpeed = -5; // upward movement
        obs.gravity = 0.2;
      }

      if (obs.triggered) {
        obs.jumpSpeed += obs.gravity;
        obs.y += obs.jumpSpeed;

        // Prevent antiblock from rising too far
        const maxRise = groundY - obs.height - 30;
        if (obs.y < maxRise) {
          obs.y = maxRise;
          obs.jumpSpeed = 0;
          obs.gravity = 0;
        }
     }
    }


  }
}

export function drawObstacles(ctx, groundHeight) {
  for (const obs of obstacles) {
    if (obs.type === "phaseBomb" && !obs.visible) continue;

    // 🌿 Special clipping only for antiblock to hide its lower part
    if (obs.type === "antiblock") {
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height - groundHeight);
      ctx.clip();
      ctx.fillStyle = obs.color;
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
      ctx.restore();
    } else {
      // Normal obstacles — no clipping
      ctx.fillStyle = obs.color;
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    }
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
