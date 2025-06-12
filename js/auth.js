// File: /js/auth.js

import { auth, db } from './firebase.js';
import { auth } from './firebase-config.js';
import { saveUserProfile, loadUserProfile } from './profile.js';
import { collection, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";

const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const nameInput = document.getElementById('name');  // For registration
const mobileInput = document.getElementById('mobile');  // Optional mobile field

const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');

const messageBox = document.getElementById('message');  // for showing errors or status


// After successful login/register
async function onUserLoggedIn(user) {
  const profile = await loadUserProfile();
  
  // If new user or no name, prompt for name or set default
  if (!profile.name) {
    profile.name = prompt("Enter your character name:", "Player");
    await saveUserProfile(profile);
  }
  
  // Use profile to update UI, main menu, etc.
  console.log("Loaded profile:", profile);
  showMainMenu();  // From menu.js
}

document.getElementById("register").addEventListener("click", async () => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
    await setDoc(doc(db, "users", userCredential.user.uid), {
      name: nameInput.value,
      email: emailInput.value,
      flames: {
        dark: 0,
        violet: 0,
        abyssal: 0
      },
      powers: [],
      skin: "default"
    });
    statusText.textContent = "✅ Registered! Redirecting...";
    window.location.href = "../index.html";
  } catch (e) {
    statusText.textContent = "❌ " + e.message;
  }
});

document.getElementById("login").addEventListener("click", async () => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
    statusText.textContent = "✅ Logged in! Redirecting...";
    window.location.href = "../index.html";
  } catch (e) {
    statusText.textContent = "❌ " + e.message;
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




/*firebase/auth.js
import { auth } from "./firebaseConfig.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";

// Register a new user
export async function registerUser(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user };
  } catch (error) {
    return { error: error.message };
  }
}

// Login existing user
export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user };
  } catch (error) {
    return { error: error.message };
  }
}*/
