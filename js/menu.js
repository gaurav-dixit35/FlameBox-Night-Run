// scripts/menu.js

function showMainMenu() {
  document.getElementById("login-section").style.display = "none";
  document.getElementById("main-menu").style.display = "block";
}

function startGame() {
  console.log("Game Started");
}

function openCustomize() {
  console.log("Open Customize");
}

function openSettings() {
  console.log("Open Settings");
}

function openLore() {
  console.log("Open Lore");
}

function openAchievements() {
  console.log("Open Achievements");
}

function openShop() {
  console.log("Open Shop");
}

function openLeaderboard() {
  console.log("Open Leaderboard");
}

function openHowToPlay() {
  console.log("Open How to Play");
}
// scripts/menu.js

export function initializeMainMenu(profile) {
  // Display player name
  const playerNameElem = document.getElementById('player-name');
  if (playerNameElem) playerNameElem.textContent = profile.name || "Player";

  // You can add more UI updates like skins, flames count, unlocked powers here
  // Example:
  // document.getElementById('flame-count').textContent = profile.flames.dark;

  setupMenuButtons();
}
function setupMenuButtons() {
  const startBtn = document.getElementById('start-game-btn');
  const customizeBtn = document.getElementById('customize-btn');
  const flameJournalBtn = document.getElementById('flame-journal-btn');
  const settingsBtn = document.getElementById('settings-btn');

  if (startBtn) startBtn.addEventListener('click', () => {
    // Hide main menu and start game
    document.getElementById('main-menu').style.display = 'none';
    startGame();
  });

  if (customizeBtn) customizeBtn.addEventListener('click', () => {
    alert("Customize feature coming soon!");
  });

  if (flameJournalBtn) flameJournalBtn.addEventListener('click', () => {
    alert("Flame Journal coming soon!");
  });

  if (settingsBtn) settingsBtn.addEventListener('click', () => {
    alert("Settings coming soon!");
  });
}
function startGame() {
  document.getElementById('main-menu').style.display = 'none';
  const canvas = document.getElementById('game-canvas');
  canvas.style.display = 'block';

  // Start game loop from game.js
  import('./game.js').then(game => {
    game.startGameLoop();
  });
}
// scripts/menu.js

export function startGame() {
  document.getElementById('main-menu').style.display = 'none';
  const canvas = document.getElementById('game-canvas');
  canvas.style.display = 'block';

  import('./game.js').then((game) => {
    game.startGameLoop();
  });
}
