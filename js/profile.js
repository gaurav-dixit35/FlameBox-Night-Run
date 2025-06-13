// scripts/profile.js

import { db, auth } from './firebase-config.js';
import { doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

/**
 * Save user profile data to Firestore
 * @param {Object} profileData - { name, flames, unlockedPowers, skin, emotes }
 */
export async function saveUserProfile(profileData) {
  if (!auth.currentUser) {
    console.error("No user logged in!");
    return;
  }
  const uid = auth.currentUser.uid;
  const userDocRef = doc(db, "users", uid);
  try {
    await setDoc(userDocRef, profileData, { merge: true });
    console.log("Profile saved successfully.");
  } catch (error) {
    console.error("Error saving profile:", error);
  }
}

/**
 * Load user profile data from Firestore
 * @returns {Object|null} profile data or null if not found
 */
export async function loadUserProfile() {
  if (!auth.currentUser) {
    console.error("No user logged in!");
    return null;
  }
  const uid = auth.currentUser.uid;
  const userDocRef = doc(db, "users", uid);
  try {
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      console.log("Profile loaded:", docSnap.data());
      return docSnap.data();
    } else {
      console.log("No profile found, creating new profile...");
      // Return default profile object
      return {
        name: "",
        flames: { dark: 0, violet: 0, abyssal: 0 },
        unlockedPowers: [],
        skin: "Ember",
        emotes: []
      };
    }
  } catch (error) {
    console.error("Error loading profile:", error);
    return null;
  }
}
