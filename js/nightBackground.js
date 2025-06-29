// js/nightBackground.js
const nightCanvas = document.createElement("canvas");
const nightCtx = nightCanvas.getContext("2d");
nightCanvas.width = window.innerWidth;
nightCanvas.height = window.innerHeight;
document.body.appendChild(nightCanvas);
nightCanvas.style.position = "fixed";
nightCanvas.style.top = "0";
nightCanvas.style.left = "0";
nightCanvas.style.zIndex = "-1"; // Make sure it stays behind everything

let stars = [];
let buildings = [];
let meteors = [];
let fogTimer = 0;
let fogActive = false;
let scrollOffset = 0;

// 🌙 Crescent Moon
const moon = {
  x: nightCanvas.width - 150,
  y: 100,
  radius: 40
};

function createStars(count) {
  stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * nightCanvas.width,
      y: Math.random() * nightCanvas.height * 0.6,
      radius: Math.random() * 1.5 + 0.5,
      opacity: Math.random(),
      twinkleSpeed: Math.random() * 0.02 + 0.01
    });
  }
}

function createBuildings(count) {
  buildings = [];
  const buildingColors = ["#0a0a0a", "#1a1a1a", "#2a2a2a","#1b1b2a", "#333333", "#444444"];

  for (let i = 0; i < count; i++) {
    const width = 60 + Math.random() * 60;
    const height = 150 + Math.random() * 150;
    const x = i * 120;
    const y = nightCanvas.height - 100 - height;

    const windows = [];
    for (let j = 0; j < 20; j++) {
      windows.push({
        x: Math.random() * (width - 10),
        y: Math.random() * (height - 10),
        size: 4,
        color: Math.random() > 0.5 ? "#ffcc66" : "#cc9966" // warm light tones
      });
    }

    buildings.push({
      x,
      y,
      width,
      height,
      color: buildingColors[Math.floor(Math.random() * buildingColors.length)],
      windows
    });
  }
}


function drawMoon(ctx) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(moon.x, moon.y, moon.radius, 0, Math.PI * 2, false);
  ctx.fillStyle = "#f0f0f0";
  ctx.fill();

  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(moon.x + 15, moon.y - 5, moon.radius * 0.9, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalCompositeOperation = "lighter";
  const gradient = ctx.createRadialGradient(moon.x, moon.y, 0, moon.x, moon.y, moon.radius * 2);
  gradient.addColorStop(0, "rgba(255,255,210,0.5)");
  gradient.addColorStop(1, "rgba(255,255,210,0)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(moon.x, moon.y, moon.radius * 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawStars(ctx) {
  for (const star of stars) {
    star.opacity += star.twinkleSpeed * (Math.random() > 0.5 ? 1 : -1);
    if (star.opacity > 1) star.opacity = 1;
    if (star.opacity < 0.1) star.opacity = 0.1;

    ctx.save();
    ctx.globalAlpha = star.opacity;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawMeteors(ctx) {
  for (let i = meteors.length - 1; i >= 0; i--) {
    const m = meteors[i];
    m.x += m.vx;
    m.y += m.vy;
    m.life -= 1;

    ctx.save();
    const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 10, m.y - m.vy * 10);
    grad.addColorStop(0, "rgba(255,255,200,0.8)");
    grad.addColorStop(1, "rgba(255,255,200,0)");
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(m.x, m.y);
    ctx.lineTo(m.x - m.vx * 10, m.y - m.vy * 10);
    ctx.stroke();
    ctx.restore();

    if (m.life <= 0) meteors.splice(i, 1);
  }

  // Spawn new meteor
  if (Math.random() < 0.005) {
    meteors.push({
      x: Math.random() * nightCanvas.width,
      y: Math.random() * 100,
      vx: -4 - Math.random() * 3,
      vy: 2 + Math.random() * 2,
      life: 60 + Math.random() * 40
    });
  }
}

function drawBuildings(ctx) {
  const speed = 1.5;
  scrollOffset += speed;
  for (const b of buildings) {
    b.x -= speed;
    if (b.x + b.width < 0) b.x = nightCanvas.width + Math.random() * 200;

    ctx.fillStyle = b.color;
    ctx.fillRect(b.x, b.y, b.width, b.height);

    for (const w of b.windows) {
      ctx.fillStyle = w.color;
      ctx.fillRect(b.x + w.x, b.y + w.y, w.size, w.size);
    }
  }
}

function drawFog(ctx) {
  if (!fogActive) return;

  const gradient = ctx.createLinearGradient(0, nightCanvas.height - 200, 0, nightCanvas.height);
  gradient.addColorStop(0, "rgba(100,100,120,0.4)");
  gradient.addColorStop(1, "rgba(50,50,70,0.7)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, nightCanvas.height - 200, nightCanvas.width, 200);
}

function updateBackground() {
  const ctx = nightCtx;
  ctx.clearRect(0, 0, nightCanvas.width, nightCanvas.height);
  drawStars(ctx);
  drawMoon(ctx);
  drawMeteors(ctx);
  drawBuildings(ctx);
  drawFog(ctx);

  // Fog logic
  fogTimer += 16;
  const fogCycle = 7 * 60 * 1000; // 7 minutes
  const fogStart = 5 * 60 * 1000; // show fog after 5 minutes
  fogActive = fogTimer % fogCycle > fogStart;
  
  requestAnimationFrame(updateBackground);
}

// Init
createStars(100);
createBuildings(10);
updateBackground();
