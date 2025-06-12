function showMainMenu(scene, user) {
  const name = user.email.split("@")[0]; // Placeholder name logic

  const html = `
    <div style="text-align: center;">
      <h2>🌃 Welcome, ${name}</h2>
      <button onclick="startGame()">▶️ Start Game</button><br><br>
      <button onclick="customize()">🧢 Customize</button><br><br>
      <button onclick="viewJournal()">📓 Flame Journal</button><br><br>
      <button onclick="settings()">⚙️ Settings</button><br><br>
      <button onclick="logout()">🚪 Logout</button>
    </div>
  `;

  scene.add.dom(480, 270).createFromHTML(html);
}

function startGame() {
  console.log("Start Game clicked");
  // TODO: Call runner scene
}

function customize() {
  alert("Customization screen coming soon!");
}

function viewJournal() {
  alert("Flame Journal coming soon!");
}

function settings() {
  alert("Settings screen coming soon!");
}

function logout() {
  firebase.auth().signOut().then(() => {
    location.reload();
  });
}
