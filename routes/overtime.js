// routes/overtime.js
const express = require("express");
const router = express.Router();
const {
  createRecord,
  getRecords,
  exportRecords,
} = require("../controllers/overtimeController");

// POST: 새 야근 기록
router.post("/", createRecord);

// GET: 야근 기록 조회
router.get("/", getRecords);

// GET: 엑셀 다운로드
router.get("/export", exportRecords);

module.exports = router;
