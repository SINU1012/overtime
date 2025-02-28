// config/firebase.js
const admin = require("firebase-admin");

// 환경 변수에서 서비스 계정 키를 가져오거나, 없으면 로컬 파일 사용
let serviceAccount;
if (process.env.SERVICE_ACCOUNT_KEY) {
  serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);
} else {
  serviceAccount = require("./serviceAccountKey.json");
}

// 이미 초기화된 앱이 없으면 초기화
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Firestore 인스턴스만 내보냄
const db = admin.firestore();
module.exports = { db };
