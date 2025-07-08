# 🚨 Firebase 설정 가이드 - 반드시 완료해주세요!

## 현재 상황
- ✅ 서버는 정상적으로 실행 중
- ❌ Firebase 연결 실패 (SERVICE_ACCOUNT_KEY 환경 변수 미설정)
- ❌ 클라이언트 Firebase 설정 미완료

## 1단계: Railway 환경 변수 설정 (필수!)

### 1-1. Firebase 서비스 계정 키 생성
1. [Firebase Console](https://console.firebase.google.com) 로그인
2. 야근일지 프로젝트 선택
3. 왼쪽 메뉴에서 ⚙️ 아이콘 클릭 → **프로젝트 설정**
4. 상단 탭에서 **서비스 계정** 선택
5. **Firebase Admin SDK** 섹션에서 **새 비공개 키 생성** 버튼 클릭
6. JSON 파일이 다운로드됨

### 1-2. JSON을 한 줄로 변환
1. [JSON Minifier](https://jsonminifier.org) 접속
2. 다운로드한 JSON 파일을 메모장으로 열기
3. 전체 내용 복사 (Ctrl+A, Ctrl+C)
4. JSON Minifier 사이트에 붙여넣기
5. **Minify** 버튼 클릭
6. 변환된 한 줄 JSON 복사

### 1-3. Railway에 환경 변수 추가
1. [Railway Dashboard](https://railway.app) 로그인
2. **overtime** 프로젝트 클릭
3. **Variables** 탭 클릭
4. **New Variable** 버튼 클릭
5. 입력:
   - Variable name: `SERVICE_ACCOUNT_KEY`
   - Value: 위에서 복사한 한 줄 JSON 붙여넣기
6. **Add** 버튼 클릭
7. 자동으로 재배포가 시작됨 (1-2분 소요)

## 2단계: 클라이언트 Firebase 설정 (필수!)

### 2-1. Firebase 웹 앱 설정 가져오기
1. [Firebase Console](https://console.firebase.google.com) 에서 프로젝트 열기
2. **프로젝트 설정** > **일반** 탭
3. 아래로 스크롤하여 **내 앱** 섹션 찾기
4. 웹 앱이 없다면:
   - **앱 추가** 클릭
   - 웹 아이콘 (</>) 선택
   - 앱 닉네임 입력 (예: 야근일지 웹)
   - **앱 등록** 클릭
5. Firebase SDK 구성 정보 복사

### 2-2. public/firebase.js 파일 업데이트
1. 복사한 설정 정보로 `public/firebase.js` 파일 수정
2. 예시:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:xxxxxxxxxxxxx"
};
```

## 3단계: Firestore 데이터베이스 설정

### 3-1. Firestore 활성화
1. Firebase Console > **Firestore Database**
2. **데이터베이스 만들기** 클릭
3. **프로덕션 모드**로 시작
4. 위치 선택 (asia-northeast3 - 서울 권장)
5. **사용 설정** 클릭

### 3-2. 보안 규칙 설정
1. Firestore Database > **규칙** 탭
2. 다음 규칙으로 교체:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```
3. **게시** 클릭

## 4단계: 초기 데이터 설정

### 4-1. Users 컬렉션 생성
1. Firestore Database > **데이터** 탭
2. **컬렉션 시작** 클릭
3. 컬렉션 ID: `Users` (대문자 U 주의!)
4. 첫 번째 문서 추가:
   - 문서 ID: 자동 ID
   - 필드 추가:
     - name (string): "홍길동"
     - department (string): "개발팀"
     - position (string): "대리"
     - isActive (boolean): true
     - createdAt (timestamp): 현재 시간
5. **저장** 클릭

## 확인 방법
1. Railway 재배포 완료 대기 (Variables 탭에서 확인)
2. https://overtime-production-501e.up.railway.app/ 접속
3. 오류 없이 페이지가 로드되면 성공!

## 문제 해결
- 여전히 500 오류가 발생한다면:
  1. Railway Logs 확인
  2. SERVICE_ACCOUNT_KEY가 올바른 JSON 형식인지 확인
  3. Firebase 프로젝트 ID가 일치하는지 확인
  
## 지원
문제가 계속되면 다음 정보와 함께 문의:
- Railway 로그 스크린샷
- Firebase Console 프로젝트 설정 스크린샷
