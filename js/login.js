// login.js
const gameConfig = {
  type: Phaser.AUTO,
  width: 960,
  height: 540,
  backgroundColor: "#0d0d1a",
  parent: "game-container",
  dom: {
    createContainer: true
  },
  scene: {
    create: createLoginScene
  }
};
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const nameInput = document.getElementById('name');  // For registration
const mobileInput = document.getElementById('mobile');  // Optional mobile field

const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');

const messageBox = document.getElementById('message');  // for showing errors or status

new Phaser.Game(gameConfig);

function createLoginScene() {
  const html = `
    <div style="text-align:center;">
      <h2>🔥 Login to Flamebox</h2>
      <input id="email" type="email" placeholder="Email" /><br><br>
      <input id="password" type="password" placeholder="Password" /><br><br>
      <button id="loginBtn">Login</button>
      <button id="registerBtn">Register</button>
      <p id="status" style="color:white;"></p>
    </div>
  `;

  this.add.dom(480, 270).createFromHTML(html);

  document.getElementById("loginBtn").onclick = async () => {
    const email = document.getElementById("email").value;
    const pass = document.getElementById("password").value;

    try {
      const user = await firebase.auth().signInWithEmailAndPassword(email, pass);
      document.getElementById("status").textContent = "✅ Logged in!";
      // TODO: Redirect to main menu scene
    } catch (error) {
      document.getElementById("status").textContent = "❌ " + error.message;
    }
  };

  document.getElementById("registerBtn").onclick = async () => {
    const email = document.getElementById("email").value;
    const pass = document.getElementById("password").value;

    try {
      const user = await firebase.auth().createUserWithEmailAndPassword(email, pass);
      document.getElementById("status").textContent = "✅ Registered!";
      // TODO: Redirect to main menu scene
    } catch (error) {
      document.getElementById("status").textContent = "❌ " + error.message;
    }
  };
  // After login or register success
showMainMenu(this.scene, firebase.auth().currentUser);

}
firebase.auth().onAuthStateChanged(async (user) => {
  if (user) {
    const profile = await loadProfile(user.uid);

    if (!profile) {
      // If first time login, save default profile
      await saveProfile(user.uid, {
        name: user.email.split("@")[0],
        flames: 0,
        violetFlames: 0,
        abyssalFlames: 0,
        powersUnlocked: [],
        skin: "ember",
        emotes: [],
        lastRun: 0,
      });
    }

    // Proceed to main menu
    showMainMenu(this.scene, user);
  }
});
async function registerUser() {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const name = nameInput.value.trim() || "Player";
  const mobile = mobileInput.value.trim() || "";

  if (!email || !password || !name) {
    showMessage("Please fill all required fields.");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save initial profile data
    await saveUserProfile({
      name,
      mobile,
      flames: { dark: 0, violet: 0, abyssal: 0 },
      unlockedPowers: [],
      skin: "Ember",
      emotes: []
    });

    showMessage(`Welcome ${name}! Registration successful.`);
    onUserLoggedIn(user);

  } catch (error) {
    showMessage(`Registration failed: ${error.message}`);
  }
}
async function loginUser() {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    showMessage("Please enter email and password.");
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    showMessage("Login successful. Loading profile...");
    onUserLoggedIn(user);

  } catch (error) {
    showMessage(`Login failed: ${error.message}`);
  }
}
function showMessage(msg) {
  if (!messageBox) return;
  messageBox.textContent = msg;
}
async function onUserLoggedIn(user) {
  const profile = await loadUserProfile();

  // If no name saved, prompt once & save
  if (!profile.name) {
    profile.name = prompt("Enter your character name:", "Player");
    await saveUserProfile(profile);
  }

  console.log("User profile loaded:", profile);
  
  // Hide login form UI, show main menu
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('main-menu').style.display = 'block';

  // Initialize menu with loaded profile data
  initializeMainMenu(profile);
}
if (loginBtn) loginBtn.addEventListener('click', loginUser);
if (registerBtn) registerBtn.addEventListener('click', registerUser);
onAuthStateChanged(auth, (user) => {
  if (user) {
    showMessage("User already logged in. Loading profile...");
    onUserLoggedIn(user);
  } else {
    // Show login form
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('main-menu').style.display = 'none';
  }
});
