const admin = require("firebase-admin");

// 서비스 계정 키 로드
let serviceAccount;
if (process.env.SERVICE_ACCOUNT_KEY) {
  try {
    serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);
    // private_key의 줄바꿈 처리 (필요한 경우에만)
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(
        /\\n/g,
        "\n"
      );
    }
  } catch (error) {
    console.error("SERVICE_ACCOUNT_KEY 파싱 실패:", error);
    process.exit(1);
  }
} else {
  try {
    serviceAccount = require("./serviceAccountKey.json");
  } catch (error) {
    console.error("serviceAccountKey.json 파일을 로드할 수 없습니다:", error);
    process.exit(1);
  }
}

// Firebase 앱 초기화 (이미 초기화되지 않은 경우에만)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Firestore 인스턴스 내보내기
const db = admin.firestore();
module.exports = { db };
