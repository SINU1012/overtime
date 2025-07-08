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
  console.warn('WARNING: SERVICE_ACCOUNT_KEY 환경 변수가 설정되지 않았습니다.');
  console.warn('Firebase 기능이 작동하지 않습니다. Railway에서 환경 변수를 설정해주세요.');
  
  // Mock 객체 반환하여 서버가 시작될 수 있도록 함
  module.exports = {
    db: {
      collection: () => ({
        where: () => ({ get: () => Promise.reject(new Error('Firebase not initialized')) }),
        orderBy: () => ({ get: () => Promise.reject(new Error('Firebase not initialized')) }),
        get: () => Promise.reject(new Error('Firebase not initialized')),
        add: () => Promise.reject(new Error('Firebase not initialized')),
        doc: () => ({
          get: () => Promise.reject(new Error('Firebase not initialized')),
          update: () => Promise.reject(new Error('Firebase not initialized')),
          delete: () => Promise.reject(new Error('Firebase not initialized'))
        })
      })
    },
    FieldValue: {
      serverTimestamp: () => new Date(),
      delete: () => null
    }
  };
} else {
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
  const FieldValue = admin.firestore.FieldValue;

  exports.api = functions.https.onRequest(app);

  module.exports = { db, FieldValue };
}