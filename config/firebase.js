const { initializeApp, cert, apps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

let serviceAccount;

// 환경 변수에서 서비스 계정 키를 가져오거나 로컬 파일에서 로드
if (process.env.SERVICE_ACCOUNT_KEY) {
  try {
    serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);
  } catch (error) {
    console.error("환경 변수 SERVICE_ACCOUNT_KEY 파싱 실패:", error);
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

// 이미 초기화된 앱이 있는지 확인 (apps 배열이 비어 있으면 초기화)
if (!apps.length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

// Firestore 인스턴스 내보내기
const db = getFirestore();
module.exports = { db };
