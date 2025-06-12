// js/flames.js

export const flames = [];

export const flameCounters = {
  dark: 0,
  violet: 0,
  abyssal: 0
};

export function spawnFlame(canvasWidth, groundY) {
  const rand = Math.random();
  let type = "dark";
  let color = "#8000ff";

  if (rand < 0.01) { // 1% chance
    type = "abyssal";
    color = "#cc00ff";
  } else if (rand < 0.15) { // 14% chance
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

export function updateFlames() {
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

export function drawFlames(ctx) {
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

export function checkFlameCollection(player) {
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
