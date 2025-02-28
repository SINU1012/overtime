// config/firebase.js
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

let serviceAccount;

if (process.env.SERVICE_ACCOUNT_KEY) {
  // 배포 환경: 환경 변수에서 JSON 문자열을 파싱
  try {
    serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);
  } catch (error) {
    console.error("환경 변수 SERVICE_ACCOUNT_KEY 파싱 실패:", error);
    process.exit(1);
  }
} else {
  // 로컬 개발 환경: 로컬 파일 사용
  try {
    serviceAccount = require("./serviceAccountKey.json");
  } catch (error) {
    console.error("serviceAccountKey.json 파일 로드 실패:", error);
    process.exit(1);
  }
}

const app = initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore(app);
module.exports = { db };
