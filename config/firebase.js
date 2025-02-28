// config/firebase.js
const admin = require("firebase-admin");
const { db } = require("./config/firebase");

// 예: db.collection("OvertimeRecords").add(...)

// 1) serviceAccount 준비
let serviceAccount;
if (process.env.SERVICE_ACCOUNT_KEY) {
  // 배포 환경: JSON 문자열을 환경 변수에서 로드
  serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);
} else {
  // 로컬 개발 환경: 로컬 파일 사용
  serviceAccount = require("./serviceAccountKey.json");
}

// 2) Firebase Admin 초기화
//    이미 초기화된 적이 없으면 initializeApp 수행
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// 3) Firestore 인스턴스만 내보냄
const db = admin.firestore();

module.exports = { db };
