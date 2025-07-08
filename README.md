# 야근일지 (Overtime Management System)

## 프로젝트 설명
직원들의 야근 시간과 식사 기록을 관리하는 웹 애플리케이션입니다.

## 기능
- 사용자별 야근 기록 입력
- 조식/중식/석식 식사 여부 체크
- 야근 시간 자동 계산
- 엑셀 파일로 데이터 내보내기

## 설치 방법

### 1. 저장소 클론
```bash
git clone https://github.com/SINU1012/overtime.git
cd overtime
```

### 2. 의존성 설치
```bash
npm install
```

### 3. Firebase 설정

#### 클라이언트 설정
1. Firebase Console에서 프로젝트 생성
2. 웹 앱 추가
3. Firebase SDK 구성 복사
4. `public/firebase.js` 파일의 firebaseConfig 업데이트

#### 서버 설정
1. Firebase Console > 프로젝트 설정 > 서비스 계정
2. 새 비공개 키 생성
3. `.env` 파일 생성 (`.env.example` 참고)
4. SERVICE_ACCOUNT_KEY에 JSON 내용을 한 줄로 입력

### 4. 실행
```bash
npm start
```

## Railway 배포
1. Railway 계정 생성
2. GitHub 저장소 연결
3. 환경 변수 설정 (SERVICE_ACCOUNT_KEY)
   - Railway 대시보드 > 프로젝트 선택
   - Variables 탭 클릭
   - Add Variable 버튼 클릭
   - Key: `SERVICE_ACCOUNT_KEY`
   - Value: Firebase 서비스 계정 JSON을 한 줄로 입력
     ```
     {"type":"service_account","project_id":"your-project-id",...}
     ```
4. 자동 배포 확인

### Firebase 서비스 계정 키 얻는 방법
1. [Firebase Console](https://console.firebase.google.com) 접속
2. 프로젝트 선택
3. 프로젝트 설정 > 서비스 계정 탭
4. "새 비공개 키 생성" 버튼 클릭
5. 다운로드된 JSON 파일의 내용을 복사
6. JSON을 한 줄로 변환 (온라인 JSON minifier 사용 가능)

## 환경 변수
- `SERVICE_ACCOUNT_KEY`: Firebase 서비스 계정 키 (필수)
- `PORT`: 서버 포트 (기본값: 3000)
