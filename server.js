const express = require("express");
const path = require("path");
const cors = require("cors");
const overtimeRoutes = require("./routes/overtime");
const usersRoutes = require("./routes/users");

const app = express();

// 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS 설정
app.use(cors());

// 정적 파일 제공: public 폴더 (클라이언트 코드)
app.use(express.static(path.join(__dirname, "public")));

// /api/overtime 라우트 설정
app.use("/api/overtime", overtimeRoutes);

// /api/users 라우트 설정
app.use("/api/users", usersRoutes);

// 404 에러 처리
app.use((req, res, next) => {
  res.status(404).send("Sorry, can't find that!");
});

// 글로벌 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// 환경 변수(PORT)를 사용하여 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
