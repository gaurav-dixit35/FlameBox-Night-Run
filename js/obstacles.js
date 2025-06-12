// js/obstacles.js

export const obstacles = [];

export function spawnObstacle(canvasWidth, groundY) {
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

export function updateObstacles() {
  for (let i = obstacles.length - 1; i >= 0; i--) {
    obstacles[i].x -= obstacles[i].speed;
    if (obstacles[i].x + obstacles[i].width < 0) {
      obstacles.splice(i, 1);
    }
  }
}

export function drawObstacles(ctx) {
  for (const obs of obstacles) {
    ctx.fillStyle = obs.color;
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
  }
}

export function checkCollision(player) {
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
