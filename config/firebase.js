// config/firebase.js

const admin = require("firebase-admin");
const functions = require("firebase-functions");
const express = require("express");
const app = express();

// 환경 변수 로드
require('dotenv').config();

// 서비스 계정 키를 환경 변수에서 가져옵니다.
const serviceAccountString = process.env.SERVICE_ACCOUNT_KEY;

if (!serviceAccountString) {
  console.error('오류: SERVICE_ACCOUNT_KEY 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(serviceAccountString);
} catch (error) {
  console.error('오류: SERVICE_ACCOUNT_KEY를 JSON으로 파싱하는 데 실패했습니다.', error);
  process.exit(1);
}

// Firebase Admin SDK를 한 번만 초기화합니다.
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // Firestore를 사용하는 경우 databaseURL은 생략 가능
});

const db = admin.firestore();

exports.api = functions.https.onRequest(app);

module.exports = { db };