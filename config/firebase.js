const { initializeApp, cert, apps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

let serviceAccount;

// 서비스 계정 키 로드
if (process.env.SERVICE_ACCOUNT_KEY) {
  try {
    serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);
  } catch (error) {
    console.error("서비스 계정 키 파싱 실패:", error);
    process.exit(1);
  }
} else {
  try {
    serviceAccount = require("./serviceAccountKey.json");
  } catch (error) {
    console.error("serviceAccountKey.json 파일 로드 실패:", error);
    process.exit(1);
  }
}

// 앱이 초기화되지 않은 경우에만 초기화
if (!apps || apps.length === 0) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

// Firestore 인스턴스 내보내기
const db = getFirestore();
module.exports = { db };
