// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Your web app's Firebase configuration
// TODO: Firebase Console에서 프로젝트 설정 > 일반 > 내 앱에서 구성 정보를 복사하여 아래에 붙여넣으세요
// Firebase Console URL: https://console.firebase.google.com/project/overtime-699eb/settings/general
const firebaseConfig = {
  // Firebase 프로젝트 설정 정보가 필요합니다
  // 프로젝트 ID는 "overtime-699eb" 입니다
  apiKey: "YOUR_API_KEY",
  authDomain: "overtime-699eb.firebaseapp.com",
  projectId: "overtime-699eb",
  storageBucket: "overtime-699eb.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Export for use in other modules
export { db };
