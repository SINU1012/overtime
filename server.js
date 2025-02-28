const express = require("express");
const admin = require("firebase-admin");

let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);
} catch (error) {
  console.error("서비스 계정 키 파싱 실패:", error);
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const app = express();

app.use(require("./controllers/overtimeController"));

app.listen(3000, () => {
  console.log("서버가 http://localhost:3000에서 실행 중입니다");
});

module.exports = { db };
