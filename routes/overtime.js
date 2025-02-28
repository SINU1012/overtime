// routes/overtime.js
const express = require("express");
const router = express.Router();
const {
  createRecord,
  getRecords,
  exportRecords,
} = require("../controllers/overtimeController");

/**
 * /api/overtime
 *  - GET: 야근 기록 조회
 *  - POST: 새 야근 기록 생성
 */
router.route("/").get(getRecords).post(createRecord);

/**
 * /api/overtime/export
 *  - GET: 엑셀 파일로 기록 다운로드
 */
router.get("/export", exportRecords);

module.exports = router;
