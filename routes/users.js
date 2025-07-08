const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// 사용자 목록 조회
router.get("/", userController.getUsers);

// 새 사용자 추가
router.post("/", userController.createUser);

// 사용자 정보 수정
router.put("/:id", userController.updateUser);

// 사용자 삭제 (소프트 삭제)
router.delete("/:id", userController.deleteUser);

// 기존 사용자 마이그레이션 (초기 설정용)
router.post("/migrate", userController.migrateUsers);

module.exports = router;