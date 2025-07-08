# Firebase 웹 앱 설정 가져오기

## 1. Firebase Console 접속
https://console.firebase.google.com/project/overtime-699eb/settings/general

## 2. 아래로 스크롤하여 "내 앱" 섹션 찾기

## 3. 웹 앱이 없으면:
- "앱 추가" 클릭
- 웹 아이콘 </> 선택
- 앱 닉네임: "야근일지 웹"
- "앱 등록" 클릭

## 4. SDK 구성 복사
다음과 같은 형식의 코드가 표시됩니다:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "overtime-699eb.firebaseapp.com",
  projectId: "overtime-699eb",
  storageBucket: "overtime-699eb.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:..."
};
```

## 5. public/firebase.js 업데이트
위 설정을 복사하여 public/firebase.js의 firebaseConfig 부분에 붙여넣기
