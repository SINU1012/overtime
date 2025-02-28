// config/firebase.js

const admin = require("firebase-admin");
const functions = require("firebase-functions");
const express = require("express");
const app = express();

// 서비스 계정 키를 환경 변수에서 가져옵니다.
const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);

// Firebase Admin SDK를 한 번만 초기화합니다.
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // Firestore를 사용하는 경우 databaseURL은 생략 가능
});

const db = admin.firestore();

exports.api = functions.https.onRequest(app);

module.exports = { db };
