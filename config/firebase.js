// config/firebase.js

const admin = require("firebase-admin");

// 서비스 계정 키 파일 경로를 올바르게 지정하세요.
// 이 파일은 외부에 노출되지 않도록 별도로 관리해야 합니다.
const serviceAccount = require("../config/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // 필요 시 databaseURL 설정 (예: databaseURL: "https://overtime-699eb.firebaseio.com")
});

const db = admin.firestore();

module.exports = { db };
