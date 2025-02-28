// config/firebase.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Firestore 사용 가정
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // Firestore는 databaseURL이 필수가 아님. Realtime DB 사용시 필요.
});

module.exports = admin;
