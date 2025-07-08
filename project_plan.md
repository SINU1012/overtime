# 야근일지 프로젝트 계획

## 프로젝트 개요
- **프로젝트명**: 야근일지 (Overtime Management System)
- **목적**: 직원들의 야근 시간 및 식사 기록 관리
- **기술 스택**: 
  - Frontend: HTML, CSS, JavaScript, Bootstrap
  - Backend: Node.js, Express.js
  - Database: Firebase
  - Deployment: Railway

## 현재 상태 (2025-07-08)
- ✅ server.js 파일 생성 및 커밋
- ✅ cors 의존성 추가
- ✅ Railway 배포 오류 해결 (MODULE_NOT_FOUND)
- ✅ Git 저장소에 푸시 완료
- ✅ 클라이언트용 firebase.js 생성
- ✅ /api/users 라우트 추가
- ✅ favicon.ico 플레이스홀더 생성
- ✅ README.md 및 .env.example 문서 작성

## 디렉토리 구조
```
overtime-master/
├── config/          # 설정 파일
├── controllers/     # 컨트롤러 로직
├── public/          # 정적 파일 (HTML, CSS, JS)
├── routes/          # API 라우트
├── server.js        # 메인 서버 파일
├── package.json     # 프로젝트 의존성
└── .gitignore       # Git 제외 파일
```

## 주요 기능
1. 사용자 관리
2. 야근 기록 입력
3. 식사 여부 체크 (조식/중식/석식)
4. 야근 시간 계산
5. 엑셀 파일 출력

## 배포 정보
- **플랫폼**: Railway
- **GitHub**: https://github.com/SINU1012/overtime.git
- **배포 URL**: Railway에서 자동 생성

## 다음 작업
- [ ] Railway 배포 확인 및 테스트
- [ ] Firebase 설정 정보 업데이트 (firebase.js에 실제 키 입력)
- [ ] .env 파일 생성 및 SERVICE_ACCOUNT_KEY 설정
- [ ] 실제 favicon.ico 파일로 교체
- [ ] 사용자 인터페이스 개선
- [ ] 추가 기능 구현
