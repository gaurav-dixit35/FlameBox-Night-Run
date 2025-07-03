// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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
const db = getFirestore(app);

export function getUserId() {
  let uid = localStorage.getItem("flamebox_uid");
  if (!uid) {
    uid = crypto.randomUUID();
    localStorage.setItem("flamebox_uid", uid);
  }
  return uid;
}

export async function loadHighScore() {
  const uid = getUserId();
  const docRef = doc(db, "highscores", uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data().score : 0;
}

export async function saveHighScore(score) {
  const uid = getUserId();
  const docRef = doc(db, "highscores", uid);
  await setDoc(docRef, { score }, { merge: true });
}
