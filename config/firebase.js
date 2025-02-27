// config/firebase.js
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const path = require("path");
const serviceAccount = require("./serviceAccountKey.json");

// Firebase 앱 초기화
const app = initializeApp({
  credential: cert(serviceAccount),
  // Firestore만 쓰는 경우 databaseURL은 필수 아님
  // databaseURL: 'https://<YOUR_PROJECT_ID>.firebaseio.com',
});

// Firestore 인스턴스 얻기
const db = getFirestore(app);

module.exports = { db };
