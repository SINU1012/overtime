/***************************************
 * [A] DOM 요소 - 야근 기록 입력용
 ***************************************/
const userButtonsContainer = document.getElementById("userButtonsContainer");
const startTimeButtonsContainer = document.getElementById(
  "startTimeButtonsContainer"
);
const endTimeButtonsContainer = document.getElementById(
  "endTimeButtonsContainer"
);

/***************************************
 * [B] DOM 요소 - 기록 조회/다운로드/테이블
 ***************************************/
const userFilterButtonsContainer = document.getElementById(
  "userFilterButtonsContainer"
);
const yearButtonsContainer = document.getElementById("yearButtonsContainer");
const monthButtonsContainer = document.getElementById("monthButtonsContainer");
const recordsTableBody = document.querySelector("#recordsTable tbody");
const downloadButton = document.getElementById("downloadButton");

/***************************************
 * [C] 전역 상태 (입력용)
 ***************************************/
let selectedUser = null; // 입력 - 현재 선택 사용자
let selectedStartTime = null; // 입력 - 현재 시작 시간

// 사용자 리스트 (입력 + 조회)
const userList = [
  "김지운",
  "채충헌",
  "박형준",
  "김태율",
  "박상우",
  "박신우",
  "김준서",
  "김은솔",
  "김세연",
  "변성훈",
  "유창현",
  "이지우",
  "김진옥",
];

// 야근 시간 후보 (18:00 ~ 23:30 + 다음날 00:00~09:00)
const timeOptions = [
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "21:30",
  "22:00",
  "22:30",
  "23:00",
  "23:30",
  "00:00",
  "00:30",
  "01:00",
  "01:30",
  "02:00",
  "02:30",
  "03:00",
  "03:30",
  "04:00",
  "04:30",
  "05:00",
  "05:30",
  "06:00",
  "06:30",
  "07:00",
  "07:30",
  "08:00",
  "08:30",
  "09:00",
];

/***************************************
 * [D] 전역 상태 (조회용)
 ***************************************/
const yearList = [2025, 2026];
const monthList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

// 현재 조회 필터
let selectedUserFilter = null; // null => 전체
let selectedYearFilter = null; // null => 전체연도
let selectedMonthFilter = null; // null => 전체월

/************************************************************************
 * 파트1) 입력(사용자/시작/종료)
 ************************************************************************/
function initInputButtons() {
  // (1) 사용자 버튼
  userButtonsContainer.innerHTML = "";
  userList.forEach((u) => {
    const btn = document.createElement("button");
    btn.className = "btn btn-outline-primary m-1 fixed-btn user-btn";
    btn.textContent = u;

    btn.addEventListener("click", () => {
      // 이전 사용자 버튼 해제
      document
        .querySelectorAll(".user-btn")
        .forEach((b) => b.classList.remove("btn-selected"));
      // 현재만 선택
      btn.classList.add("btn-selected");
      selectedUser = u;

      // 시작시간도 해제
      selectedStartTime = null;
      document
        .querySelectorAll(".start-time-btn")
        .forEach((b) => b.classList.remove("btn-selected"));

      alert(`사용자: ${u} 선택됨`);
    });
    userButtonsContainer.appendChild(btn);
  });

  // (2) 시작 시간 버튼
  startTimeButtonsContainer.innerHTML = "";
  timeOptions.forEach((t) => {
    const btn = document.createElement("button");
    btn.className = "btn btn-outline-success m-1 fixed-btn start-time-btn";
    btn.textContent = t;

    btn.addEventListener("click", () => {
      if (!selectedUser) {
        alert("먼저 사용자(이름)를 선택하세요.");
        return;
      }
      // 이전 시작시간 해제
      document
        .querySelectorAll(".start-time-btn")
        .forEach((b) => b.classList.remove("btn-selected"));
      btn.classList.add("btn-selected");
      selectedStartTime = t;

      alert(`시작 시간: ${t} 선택됨`);
    });
    startTimeButtonsContainer.appendChild(btn);
  });

  // (3) 종료 시간 버튼
  endTimeButtonsContainer.innerHTML = "";
  timeOptions.forEach((t) => {
    const btn = document.createElement("button");
    btn.className = "btn btn-outline-danger m-1 fixed-btn end-time-btn";
    btn.textContent = t;

    btn.addEventListener("click", () => {
      if (!selectedUser) {
        alert("먼저 사용자(이름)를 선택하세요.");
        return;
      }
      if (!selectedStartTime) {
        alert("먼저 야근 시작 시간을 선택하세요.");
        return;
      }
      handleEndTimeClicked(t);
    });
    endTimeButtonsContainer.appendChild(btn);
  });
}

/** 종료 시간 클릭 -> 기록 생성 */
function handleEndTimeClicked(chosenEndTime) {
  if (!isEndTimeValid(selectedStartTime, chosenEndTime)) {
    alert("종료 시간이 시작 시간보다 빠릅니다. 다시 선택하세요.");
    return;
  }

  createRecord(selectedUser, getTodayString(), selectedStartTime, chosenEndTime)
    .then(() => {
      alert(
        `야근 기록 완료! [${selectedUser} / ${selectedStartTime}~${chosenEndTime}]`
      );
      // 시작시간 버튼 해제
      document
        .querySelectorAll(".start-time-btn")
        .forEach((b) => b.classList.remove("btn-selected"));
      selectedStartTime = null;
      // 목록 갱신
      fetchRecords();
    })
    .catch((err) => {
      console.error(err);
      alert("기록 저장 오류가 발생했습니다.");
    });
}

/** 자정 넘어가는 야근 허용을 위해 종료 < 시작이면 +24h */
function isEndTimeValid(startT, endT) {
  const [sh, sm] = startT.split(":").map(Number);
  const [eh, em] = endT.split(":").map(Number);

  let startMins = sh * 60 + sm;
  let endMins = eh * 60 + em;

  // next day 처리
  if (endMins < startMins) {
    endMins += 24 * 60;
  }
  // 0 이상이면 OK
  return endMins - startMins >= 0;
}

function getTodayString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** 서버에 기록 생성 (POST /api/overtime) */
async function createRecord(userName, date, startTime, endTime) {
  const bodyData = { userName, date, startTime, endTime, description: "" };
  const res = await fetch("/api/overtime", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bodyData),
  });
  if (!res.ok) throw new Error("서버 응답 에러");
}

/************************************************************************
 * 파트2) 조회(전체 / 사용자 / 연도 / 월) + 테이블 + 엑셀
 ************************************************************************/
function downloadExcel() {
  window.location.href = "/api/overtime/export";
}

/** 필터 기반 GET /api/overtime */
async function fetchRecords(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const url = `/api/overtime?${qs}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("서버 통신 실패");
    const data = await response.json();
    renderTable(data);
  } catch (err) {
    console.error(err);
    alert("기록 조회 중 오류가 발생했습니다.");
  }
}

function renderTable(records) {
  recordsTableBody.innerHTML = "";
  records.forEach((rec) => {
    const tr = document.createElement("tr");
    const timeRange = `${rec.startTime}~${rec.endTime} (${rec.totalHours}시간)`;
    tr.innerHTML = `
      <td>${rec.userName || ""}</td>
      <td>${rec.date || ""}</td>
      <td>${timeRange}</td>
      <td>${rec.createdAt ? new Date(rec.createdAt).toLocaleString() : ""}</td>
    `;
    recordsTableBody.appendChild(tr);
  });
}

/** 전체/사용자/연도/월 필터 & 버튼 시각적 유지 */
function createUserFilterButtons() {
  userFilterButtonsContainer.innerHTML = "";

  // (1) 전체기록 버튼 (userFilter=null)
  const allUserBtn = document.createElement("button");
  allUserBtn.className = "btn btn-outline-secondary m-1 filter-user-btn";
  allUserBtn.textContent = "전체기록";
  allUserBtn.addEventListener("click", () => {
    // 사용자 버튼들 해제
    document
      .querySelectorAll(".filter-user-btn")
      .forEach((b) => b.classList.remove("btn-selected"));
    allUserBtn.classList.add("btn-selected");

    // 필터값: 사용자/연도/월 전부 null
    selectedUserFilter = null;
    selectedYearFilter = null;
    selectedMonthFilter = null;

    // 연/월 버튼 표시 (전체 사용자 상태에도 연/월 적용 가능)
    showYearButtons();
    // 즉시 전체 조회
    fetchRecords();
  });
  userFilterButtonsContainer.appendChild(allUserBtn);

  // (2) 사용자 버튼들
  userList.forEach((name) => {
    const btn = document.createElement("button");
    btn.className = "btn btn-outline-secondary m-1 filter-user-btn";
    btn.textContent = name;

    btn.addEventListener("click", () => {
      // 전체기록 해제
      allUserBtn.classList.remove("btn-selected");
      // 다른 사용자 해제
      document
        .querySelectorAll(".filter-user-btn")
        .forEach((b) => b.classList.remove("btn-selected"));
      btn.classList.add("btn-selected");

      // 필터 세팅
      selectedUserFilter = name;
      selectedYearFilter = null;
      selectedMonthFilter = null;

      // 연/월 버튼 표시
      showYearButtons();
      // 사용자를 바꾼 시점에 목록 바로 조회할지, 연/월 선택 후 조회할지 결정
      // 여기서는 "연도/월"도 고를 수 있으니, 지금은 fetch 안 함
      // fetchRecords({ userName: name }); // 원한다면 즉시조회
    });
    userFilterButtonsContainer.appendChild(btn);
  });
}

/** 연도 버튼 */
function showYearButtons() {
  yearButtonsContainer.style.display = "block";
  monthButtonsContainer.style.display = "none";
  yearButtonsContainer.innerHTML = "";

  // "전체연도" 버튼
  const allYearBtn = document.createElement("button");
  allYearBtn.className = "btn btn-outline-primary m-1 filter-year-btn";
  allYearBtn.textContent = "전체연도";
  allYearBtn.addEventListener("click", () => {
    document
      .querySelectorAll(".filter-year-btn")
      .forEach((b) => b.classList.remove("btn-selected"));
    allYearBtn.classList.add("btn-selected");

    selectedYearFilter = null;
    selectedMonthFilter = null;
    // 월 버튼 표시
    showMonthButtons();
    // 즉시 필터 조회
    updateFilterFetch();
  });
  yearButtonsContainer.appendChild(allYearBtn);

  // 2025, 2026
  yearList.forEach((y) => {
    const btn = document.createElement("button");
    btn.className = "btn btn-outline-primary m-1 filter-year-btn";
    btn.textContent = `${y}년`;

    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".filter-year-btn")
        .forEach((b) => b.classList.remove("btn-selected"));
      btn.classList.add("btn-selected");

      selectedYearFilter = y;
      selectedMonthFilter = null;
      showMonthButtons();
      updateFilterFetch();
    });
    yearButtonsContainer.appendChild(btn);
  });
}

/** 월 버튼 */
function showMonthButtons() {
  monthButtonsContainer.style.display = "block";
  monthButtonsContainer.innerHTML = "";

  // 전체월
  const allMonthBtn = document.createElement("button");
  allMonthBtn.className = "btn btn-outline-success m-1 filter-month-btn";
  allMonthBtn.textContent = "전체월";
  allMonthBtn.addEventListener("click", () => {
    document
      .querySelectorAll(".filter-month-btn")
      .forEach((b) => b.classList.remove("btn-selected"));
    allMonthBtn.classList.add("btn-selected");

    selectedMonthFilter = null;
    updateFilterFetch();
  });
  monthButtonsContainer.appendChild(allMonthBtn);

  // 1~12월
  monthList.forEach((m) => {
    const btn = document.createElement("button");
    btn.className = "btn btn-outline-success m-1 filter-month-btn";
    btn.textContent = `${m}월`;

    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".filter-month-btn")
        .forEach((b) => b.classList.remove("btn-selected"));
      btn.classList.add("btn-selected");

      selectedMonthFilter = m;
      updateFilterFetch();
    });
    monthButtonsContainer.appendChild(btn);
  });
}

/** 현재 필터 상태를 바탕으로 fetchRecords */
function updateFilterFetch() {
  const params = {};
  if (selectedUserFilter) {
    params.userName = selectedUserFilter;
  }
  if (selectedYearFilter) {
    params.year = selectedYearFilter;
  }
  if (selectedMonthFilter) {
    params.month = selectedMonthFilter;
  }
  fetchRecords(params);
}

/************************************************************************
 * 파트3) 초기 로드
 ************************************************************************/
function init() {
  // (1) 입력 버튼들 생성
  initInputButtons();

  // (2) 조회 버튼들 생성
  createUserFilterButtons();

  // (3) 첫 페이지 로딩 시 전체조회
  fetchRecords();

  // (4) 엑셀 다운로드
  downloadButton.addEventListener("click", downloadExcel);
}

window.onload = init;
