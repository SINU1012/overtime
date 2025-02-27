// controllers/overtimeController.js
const { db } = require("../config/firebase"); // Firestore 인스턴스
const ExcelJS = require("exceljs");

/**
 * (1) 야근 기록 생성
 */
exports.createRecord = async (req, res) => {
  try {
    const { userName, date, startTime, endTime, description } = req.body;

    // 간단히 총 시간 계산
    const totalHours = getOvertimeDuration(startTime, endTime);

    // Firestore에 문서 추가
    const newDoc = await db.collection("OvertimeRecords").add({
      userName: userName || "",
      date: date || "",
      startTime: startTime || "",
      endTime: endTime || "",
      description: description || "",
      totalHours,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return res.status(201).json({
      id: newDoc.id,
      userName,
      date,
      startTime,
      endTime,
      totalHours,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "서버 에러 발생" });
  }
};

/**
 * (2) 야근 기록 조회
 * GET /api/overtime?userName=xxx&year=YYYY&month=MM
 */
exports.getRecords = async (req, res) => {
  try {
    const { userName, year, month } = req.query;

    let queryRef = db.collection("OvertimeRecords");

    // 사용자명 필터
    if (userName) {
      queryRef = queryRef.where("userName", "==", userName);
    }

    // 연/월 필터
    // DB에 date가 "YYYY-MM-DD" 문자열이라고 가정
    if (year && month) {
      const mm = String(month).padStart(2, "0");
      const startDate = `${year}-${mm}-01`;

      // 해당 월의 말일 계산(2월=28/29, 4월=30 등)
      const lastDay = new Date(year, month, 0).getDate();
      const endDate = `${year}-${mm}-${lastDay}`;

      queryRef = queryRef
        .where("date", ">=", startDate)
        .where("date", "<=", endDate);
    }

    // 날짜 기준 내림차순 정렬
    queryRef = queryRef.orderBy("date", "desc");

    const snapshot = await queryRef.get();
    const records = [];
    snapshot.forEach((doc) => {
      records.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return res.status(200).json(records);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "서버 에러 발생" });
  }
};

/**
 * (3) 엑셀 내보내기
 * GET /api/overtime/export
 */
exports.exportRecords = async (req, res) => {
  try {
    // 전체 기록(또는 특정 정렬)
    const snapshot = await db
      .collection("OvertimeRecords")
      .orderBy("date", "asc")
      .orderBy("startTime", "asc")
      .get();

    const records = [];
    snapshot.forEach((doc) => {
      records.push({ id: doc.id, ...doc.data() });
    });

    // ExcelJS 워크북/시트
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Overtime Records");

    // 헤더
    worksheet.columns = [
      { header: "ID", key: "id", width: 15 },
      { header: "사용자", key: "userName", width: 15 },
      { header: "날짜", key: "date", width: 12 },
      { header: "시작시간", key: "startTime", width: 12 },
      { header: "종료시간", key: "endTime", width: 12 },
      { header: "총시간", key: "totalHours", width: 10 },
      { header: "생성일시", key: "createdAt", width: 25 },
    ];

    // 데이터 입력
    records.forEach((r) => {
      worksheet.addRow({
        id: r.id,
        userName: r.userName || "",
        date: r.date || "",
        startTime: r.startTime || "",
        endTime: r.endTime || "",
        totalHours: r.totalHours || 0,
        createdAt: r.createdAt || "",
      });
    });

    // 응답 헤더 (다운로드)
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=OvertimeRecords.xlsx"
    );

    await workbook.xlsx.write(res);
    return res.end();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "엑셀 내보내기 에러" });
  }
};

/** 시작-종료 시각 차이(시간) 계산 */
function getOvertimeDuration(startTime, endTime) {
  if (!startTime || !endTime) return 0;
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const startMins = sh * 60 + (sm || 0);
  const endMins = eh * 60 + (em || 0);
  const diff = endMins - startMins;
  return diff > 0 ? diff / 60 : 0;
}
