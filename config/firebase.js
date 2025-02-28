// config/firebase.js

const admin = require("firebase-admin");
const functions = require("firebase-functions");
const express = require("express");
const app = express();

// 서비스 계정 키 파일 경로를 올바르게 지정하세요.
// 이 파일은 외부에 노출되지 않도록 별도로 관리해야 합니다.
const serviceAccount = require("../config/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // 필요 시 databaseURL 설정 (예: databaseURL: "https://overtime-699eb.firebaseio.com")
});

const admin = require("firebase-admin");
const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);
admin.initializeApp({
  credentail: admin.credentials.cert(serviceAccount),
  databaseURL: "https://your-project-id.firebaseio.com",
});

const db = admin.firestore();

exports.api = functions.https.onRequest(app);

module.exports = { db };
