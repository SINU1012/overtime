// config/firebase.js

const admin = require("firebase-admin");
const functions = require("firebase-functions");
const express = require("express");
const app = express();
const path = require("path");

/**
 * 배포(Production) 환경인지, 로컬 개발 환경인지 구분
 * - Firebase Functions 환경에서는 기본 자격 증명을 사용하므로
 *   별도의 serviceAccountKey.json 없이 admin.initializeApp()만 호출해도 됩니다.
 */
const isProduction =
  process.env.FUNCTIONS_EMULATOR !== "true" &&
  process.env.NODE_ENV === "production";

// 로컬(개발) 환경에서만 serviceAccountKey.json 사용
if (!isProduction) {
  const serviceAccount = require(path.join(
    __dirname,
    "serviceAccountKey.json"
  ));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} else {
  // Firebase Functions에 배포된 환경
  admin.initializeApp();
}

const db = admin.firestore();

// Express 앱 생성
const app = express();

// 예시 라우터
app.get("/", (req, res) => {
  res.send("Hello from Firebase Functions!");
});

// Functions로 Express 앱 내보내기
exports.api = functions.https.onRequest(app);

// db 인스턴스 모듈로 내보내기
module.exports = { db };
