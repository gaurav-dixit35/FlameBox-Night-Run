// /firebase/firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAHklsC4KFr-lo3GuKElS6-beI5aopjX4Y",
  authDomain: "social-340d9.firebaseapp.com",
  projectId: "social-340d9",
  storageBucket: "social-340d9.appspot.com",
  messagingSenderId: "97437309359",
  appId: "1:97437309359:web:2d9f1fc3af84fd2edef75a",
  measurementId: "G-Y6ZLK8ZEX3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
