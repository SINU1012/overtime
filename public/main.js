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
let selectedUser = null; // 현재 선택된 사용자
let selectedStartTime = null; // 현재 선택된 시작 시간
let selectedDinner = null; // [추가] 석식 여부 (Y 또는 N)

// 사용자 리스트 (입력 및 조회용) - 동적으로 로드됨
let userList = [];

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

let selectedUserFilter = null; // 전체 기록: null
let selectedYearFilter = null; // 전체 연도: null
let selectedMonthFilter = null; // 전체 월: null

/************************************************************************
 * 파트1) 입력 (사용자, 시작 시간, 종료 시간, 석식 여부)
 ************************************************************************/
function initInputButtons() {
  // (1) 사용자 버튼 생성
  userButtonsContainer.innerHTML = "";
  userList.forEach((u) => {
    const btn = document.createElement("button");
    btn.className = "btn btn-outline-primary m-1 fixed-btn user-btn";
    btn.textContent = u;
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".user-btn")
        .forEach((b) => b.classList.remove("btn-selected"));
      btn.classList.add("btn-selected");
      selectedUser = u;
      selectedStartTime = null;
      // 사용자 선택 시, 시작 시간/석식 여부 초기화
      document
        .querySelectorAll(".start-time-btn")
        .forEach((b) => b.classList.remove("btn-selected"));
      document
        .querySelectorAll(".dinner-btn")
        .forEach((b) => b.classList.remove("btn-selected"));
      selectedDinner = null;

      alert(`사용자: ${u} 선택됨`);
    });
    userButtonsContainer.appendChild(btn);
  });

  // (2) 시작 시간 버튼 생성
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
      document
        .querySelectorAll(".start-time-btn")
        .forEach((b) => b.classList.remove("btn-selected"));
      btn.classList.add("btn-selected");
      selectedStartTime = t;
      alert(`시작 시간: ${t} 선택됨`);
    });
    startTimeButtonsContainer.appendChild(btn);
  });

  // (3) 종료 시간 버튼 생성
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
      if (!selectedDinner) {
        alert("먼저 석식 여부(Y/N)를 선택하세요.");
        return;
      }
      handleEndTimeClicked(t);
    });
    endTimeButtonsContainer.appendChild(btn);
  });
}

/** 종료 시간 클릭 시 기록 생성 */
function handleEndTimeClicked(chosenEndTime) {
  if (!isEndTimeValid(selectedStartTime, chosenEndTime)) {
    alert("종료 시간이 시작 시간보다 빠릅니다. 다시 선택하세요.");
    return;
  }

  createRecord(
    selectedUser,
    getTodayString(),
    selectedStartTime,
    chosenEndTime,
    selectedDinner
  )
    .then(() => {
      alert(
        `야근 기록 완료! [${selectedUser} / ${selectedStartTime}~${chosenEndTime} / 석식:${selectedDinner}]`
      );

      // 입력 후 시작/석식 상태 초기화
      document
        .querySelectorAll(".start-time-btn")
        .forEach((b) => b.classList.remove("btn-selected"));
      document
        .querySelectorAll(".dinner-btn")
        .forEach((b) => b.classList.remove("btn-selected"));
      selectedStartTime = null;
      selectedDinner = null;

      fetchRecords();
    })
    .catch((err) => {
      console.error("기록 저장 오류:", err);
      alert("기록 저장 중 오류가 발생했습니다. 서버 상태를 확인하세요.");
    });
}

/** 시작 시간과 종료 시간 비교 (자정 넘어가는 경우 처리) */
function isEndTimeValid(startT, endT) {
  const [sh, sm] = startT.split(":").map(Number);
  const [eh, em] = endT.split(":").map(Number);
  let startMins = sh * 60 + sm;
  let endMins = eh * 60 + em;
  if (endMins < startMins) {
    endMins += 24 * 60; // 자정 넘어가는 경우
  }
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
async function createRecord(userName, date, startTime, endTime, dinner) {
  // [추가] dinner 필드를 함께 전송
  const bodyData = {
    userName,
    date,
    startTime,
    endTime,
    dinner,
    description: "",
  };
  const res = await fetch("/api/overtime", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bodyData),
  });
  if (!res.ok) {
    throw new Error(`서버 응답 실패: ${res.status} ${res.statusText}`);
  }
  return await res.json();
}

/** [추가] 석식 여부(Y/N) 버튼 초기화 */
function initDinnerButtons() {
  const dinnerButtonsContainer = document.getElementById(
    "dinnerButtonsContainer"
  );
  dinnerButtonsContainer.innerHTML = "";

  ["Y", "N"].forEach((value) => {
    const btn = document.createElement("button");
    btn.className = "btn btn-outline-info m-1 fixed-btn dinner-btn";
    btn.textContent = value;
    btn.addEventListener("click", () => {
      if (!selectedUser) {
        alert("먼저 사용자(이름)를 선택하세요.");
        return;
      }
      // 버튼 토글
      document
        .querySelectorAll(".dinner-btn")
        .forEach((b) => b.classList.remove("btn-selected"));
      btn.classList.add("btn-selected");

      selectedDinner = value;
      alert(`석식 여부: ${value} 선택됨`);
    });
    dinnerButtonsContainer.appendChild(btn);
  });
}

/************************************************************************
 * 파트2) 조회 (전체 / 사용자 / 연도 / 월) 및 테이블 렌더링, 엑셀 다운로드
 ************************************************************************/
function downloadExcel() {
  window.location.href = "/api/overtime/export";
}

/** 필터 기반 기록 조회 (GET /api/overtime) */
async function fetchRecords(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const url = `/api/overtime?${qs}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `서버 응답 실패: ${response.status} ${response.statusText}`
      );
    }
    const data = await response.json();
    renderTable(data);
  } catch (err) {
    console.error("기록 조회 오류:", err);
    alert("기록 조회 중 오류가 발생했습니다. 서버 상태를 확인하세요.");
  }
}

function renderTable(records) {
  recordsTableBody.innerHTML = "";

  records.forEach((rec) => {
    const tr = document.createElement("tr");

    // 시간 범위 + 총시간
    const timeRange = `${rec.startTime}~${rec.endTime} (${rec.totalHours}시간)`;

    // [추가] 석식(Y/N) 값
    const dinnerValue = rec.dinner ? rec.dinner : "";

    tr.innerHTML = `
      <td>${rec.userName || ""}</td>
      <td>${rec.date || ""}</td>
      <td>${timeRange}</td>
      <!-- 석식 여부 표시 -->
      <td>${dinnerValue}</td>
      <td>${rec.createdAt ? new Date(rec.createdAt).toLocaleString() : ""}</td>
    `;
    recordsTableBody.appendChild(tr);
  });
}

/** 사용자, 연도, 월 필터 버튼 생성 */
function createUserFilterButtons() {
  userFilterButtonsContainer.innerHTML = "";

  const allUserBtn = document.createElement("button");
  allUserBtn.className = "btn btn-outline-secondary m-1 filter-user-btn";
  allUserBtn.textContent = "전체기록";
  allUserBtn.addEventListener("click", () => {
    document
      .querySelectorAll(".filter-user-btn")
      .forEach((b) => b.classList.remove("btn-selected"));
    allUserBtn.classList.add("btn-selected");
    selectedUserFilter = null;
    selectedYearFilter = null;
    selectedMonthFilter = null;
    showYearButtons();
    fetchRecords();
  });
  userFilterButtonsContainer.appendChild(allUserBtn);

  userList.forEach((name) => {
    const btn = document.createElement("button");
    btn.className = "btn btn-outline-secondary m-1 filter-user-btn";
    btn.textContent = name;
    btn.addEventListener("click", () => {
      allUserBtn.classList.remove("btn-selected");
      document
        .querySelectorAll(".filter-user-btn")
        .forEach((b) => b.classList.remove("btn-selected"));
      btn.classList.add("btn-selected");
      selectedUserFilter = name;
      selectedYearFilter = null;
      selectedMonthFilter = null;
      showYearButtons();
    });
    userFilterButtonsContainer.appendChild(btn);
  });
}

/** 연도 필터 버튼 생성 */
function showYearButtons() {
  yearButtonsContainer.style.display = "block";
  monthButtonsContainer.style.display = "none";
  yearButtonsContainer.innerHTML = "";

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
    showMonthButtons();
    updateFilterFetch();
  });
  yearButtonsContainer.appendChild(allYearBtn);

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

/** 월 필터 버튼 생성 */
function showMonthButtons() {
  monthButtonsContainer.style.display = "block";
  monthButtonsContainer.innerHTML = "";

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

/** 현재 필터 상태에 따른 기록 조회 */
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
async function init() {
  // 사용자 목록 먼저 로드
  await loadActiveUsers();
  // 기존 버튼 초기화
  initInputButtons();
  // [추가] 석식 버튼 초기화
  initDinnerButtons();
  createUserFilterButtons();
  fetchRecords();
  downloadButton.addEventListener("click", downloadExcel);
}

// 활성 사용자 목록 불러오기
async function loadActiveUsers() {
  try {
    const response = await fetch('/api/users?includeInactive=false');
    if (!response.ok) {
      throw new Error('사용자 목록을 불러오는데 실패했습니다.');
    }
    const users = await response.json();
    userList = users.map(user => user.name);
    
    if (userList.length === 0) {
      console.warn('등록된 사용자가 없습니다. 사용자 관리에서 사용자를 추가해주세요.');
    }
  } catch (error) {
    console.error('Error loading users:', error);
    alert('사용자 목록을 불러오는 중 오류가 발생했습니다.');
  }
}

window.onload = init;
