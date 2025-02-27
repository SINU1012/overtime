// server.js
const express = require("express");
const path = require("path");
const overtimeRoutes = require("./routes/overtime");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 제공: public 폴더
app.use(express.static(path.join(__dirname, "public")));

// /api/overtime 라우트
app.use("/api/overtime", overtimeRoutes);

// 서버 시작
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
