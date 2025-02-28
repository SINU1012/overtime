const { initializeApp, cert, apps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

// Load the service account key (adjust based on your setup)
let serviceAccount;
if (process.env.SERVICE_ACCOUNT_KEY) {
  try {
    serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);
  } catch (error) {
    console.error(
      "Failed to parse SERVICE_ACCOUNT_KEY environment variable:",
      error
    );
    process.exit(1);
  }
} else {
  try {
    serviceAccount = require("./serviceAccountKey.json");
  } catch (error) {
    console.error("Failed to load serviceAccountKey.json:", error);
    process.exit(1);
  }
}

// Initialize the Firebase app only if it hasn’t been initialized yet
if (!apps.length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

// Export the Firestore instance
const db = getFirestore();
module.exports = { db };
