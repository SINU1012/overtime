// config/firebase.js
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

let serviceAccount;

if (process.env.SERVICE_ACCOUNT_KEY) {
  // 배포 환경: JSON 문자열을 환경변수로 넣는다
  serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);
} else {
  // 로컬 개발 환경: 파일 사용
  serviceAccount = require("./serviceAccountKey.json");
}

const app = initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore(app);
module.exports = { db };
