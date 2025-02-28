const express = require("express");
const path = require("path");
const overtimeRoutes = require("./routes/overtime");
const cors = require("cors");

const app = express();

// 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS 설정 (필요 시)
app.use(cors());

// 정적 파일 제공: public 폴더
app.use(express.static(path.join(__dirname, "public")));

// /api/overtime 라우트
app.use("/api/overtime", overtimeRoutes);

// 404 에러 처리
app.use((req, res, next) => {
  res.status(404).send("Sorry, can't find that!");
});

// 글로벌 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
