// config/firebase.js
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

let serviceAccount;

if (process.env.SERVICE_ACCOUNT_KEY) {
  // 배포 환경: JSON을 환경변수로 넣어두고, 여기서 parse
  serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);
} else {
  // 로컬 개발용 (파일로부터)
  serviceAccount = require("./serviceAccountKey.json");
}

const app = initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore(app);
module.exports = { db };
