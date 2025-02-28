// controllers/overtimeController.js
const { db } = require("../config/firebase");
const ExcelJS = require("exceljs");

/**
 * (1) 야근 기록 생성
 */
exports.createRecord = async (req, res) => {
  try {
    // [추가] dinner 필드를 req.body에서 함께 받음
    const { userName, date, startTime, endTime, description, dinner } =
      req.body;

    // 필수 필드 유효성 검사
    if (!userName || !date || !startTime || !endTime) {
      return res.status(400).json({
        message:
          "필수 필드(userName, date, startTime, endTime)가 누락되었습니다.",
      });
    }

    // 날짜 및 시간 형식 검증
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res
        .status(400)
        .json({ message: "날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)" });
    }
    if (!/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime)) {
      return res
        .status(400)
        .json({ message: "시간 형식이 올바르지 않습니다. (HH:MM)" });
    }

    // 총 시간 계산
    const totalHours = getOvertimeDuration(startTime, endTime);

    // Firestore에 문서 추가
    const newDocRef = await db.collection("OvertimeRecords").add({
      userName,
      date,
      startTime,
      endTime,
      description: description || "",
      // [추가] 석식 여부 필드 저장 (Y/N, 미입력 시 "")
      dinner: dinner || "",
      totalHours,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return res.status(201).json({
      id: newDocRef.id,
      userName,
      date,
      startTime,
      endTime,
      // dinner 필드도 응답에 포함
      dinner: dinner || "",
      totalHours,
    });
  } catch (error) {
    console.error(`야근 기록 생성 중 에러: ${error.message}`);
    return res
      .status(500)
      .json({ message: `서버 에러 발생: 기록 생성 실패 - ${error.message}` });
  }
};

/**
 * (2) 야근 기록 조회
 *  GET /api/overtime?userName=xxx&year=YYYY&month=MM
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
    if (year && month) {
      const mm = String(month).padStart(2, "0");
      const startDate = `${year}-${mm}-01`;
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
      records.push({ id: doc.id, ...doc.data() });
    });

    return res.status(200).json(records);
  } catch (error) {
    console.error(`야근 기록 조회 중 에러: ${error.message}`);
    return res
      .status(500)
      .json({ message: `서버 에러 발생: 기록 조회 실패 - ${error.message}` });
  }
};

/**
 * (3) 엑셀 내보내기
 *  GET /api/overtime/export
 */
exports.exportRecords = async (req, res) => {
  try {
    // 전체 기록 가져오기
    const snapshot = await db
      .collection("OvertimeRecords")
      .orderBy("date", "asc")
      .orderBy("startTime", "asc")
      .get();

    const records = [];
    snapshot.forEach((doc) => {
      records.push({ id: doc.id, ...doc.data() });
    });

    // ExcelJS 워크북 및 시트 생성
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Overtime Records");

    // 헤더 설정 (dinner 필드 추가)
    worksheet.columns = [
      { header: "ID", key: "id", width: 15 },
      { header: "사용자", key: "userName", width: 15 },
      { header: "날짜", key: "date", width: 12 },
      { header: "시작시간", key: "startTime", width: 12 },
      { header: "종료시간", key: "endTime", width: 12 },
      { header: "총시간", key: "totalHours", width: 10 },
      { header: "석식", key: "dinner", width: 10 }, // [추가]
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
        // [추가] 석식 표시
        dinner: r.dinner || "",
        createdAt: r.createdAt || "",
      });
    });

    // 응답 헤더 설정 (다운로드)
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="OvertimeRecords.xlsx"'
    );

    await workbook.xlsx.write(res);
    return res.end();
  } catch (error) {
    console.error(`엑셀 내보내기 중 에러: ${error.message}`);
    return res.status(500).json({
      message: `서버 에러 발생: 엑셀 내보내기 실패 - ${error.message}`,
    });
  }
};

/**
 * 시작-종료 시간 차이(시간) 계산
 *  - 종료 시간이 시작 시간보다 빠르면 다음날로 간주 (예: 22:00 ~ 07:00)
 */
function getOvertimeDuration(startTime, endTime) {
  if (!startTime || !endTime) return 0;
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);

  let startMins = sh * 60 + sm;
  let endMins = eh * 60 + em;

  // 종료 시간이 시작 시간보다 빠른 경우, 다음 날로 간주
  if (endMins < startMins) {
    endMins += 24 * 60;
  }

  const diff = endMins - startMins;
  return diff >= 0 ? diff / 60 : 0;
}
