// firebaseProfile.js

const db = firebase.firestore();

async function saveProfile(userId, data) {
  try {
    await db.collection("players").doc(userId).set(data, { merge: true });
    console.log("✅ Profile saved");
  } catch (err) {
    console.error("❌ Save error", err);
  }
}

async function loadProfile(userId) {
  try {
    const doc = await db.collection("players").doc(userId).get();
    if (doc.exists) return doc.data();
    else return null;
  } catch (err) {
    console.error("❌ Load error", err);
    return null;
  }
}
