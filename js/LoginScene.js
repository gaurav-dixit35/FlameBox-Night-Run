// scenes/LoginScene.js
import { loginUser, registerUser } from "../firebase/auth.js";

export default class LoginScene extends Phaser.Scene {
  constructor() {
    super("LoginScene");
  }

  preload() {}

  create() {
    this.add.text(350, 60, "🔥 Login to Flamebox", {
      fontSize: "22px",
      fill: "#ffffff"
    });

    // Create DOM Elements
    this.createLoginForm();
  }

  createLoginForm() {
    const html = `
      <div id="login-box" style="position: absolute; top: 100px; left: 50%; transform: translateX(-50%); text-align: center;">
        <input id="email" type="email" placeholder="Email" /><br><br>
        <input id="password" type="password" placeholder="Password" /><br><br>
        <button id="loginBtn">Login</button>
        <button id="registerBtn">Register</button>
        <p id="status" style="color: white; margin-top: 10px;"></p>
      </div>
    `;

    this.loginForm = this.add.dom(480, 270).createFromHTML(html);

    document.getElementById("loginBtn").onclick = async () => {
      const email = document.getElementById("email").value;
      const pass = document.getElementById("password").value;
      const { user, error } = await loginUser(email, pass);
      document.getElementById("status").textContent = user ? "✅ Logged in!" : `❌ ${error}`;
      if (user) this.scene.start("MainMenuScene"); // Replace later
    };

    document.getElementById("registerBtn").onclick = async () => {
      const email = document.getElementById("email").value;
      const pass = document.getElementById("password").value;
      const { user, error } = await registerUser(email, pass);
      document.getElementById("status").textContent = user ? "✅ Registered!" : `❌ ${error}`;
      if (user) this.scene.start("MainMenuScene"); // Replace later
    };
  }
}
