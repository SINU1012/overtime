# 제품 요구사항 문서 (PRD)
## 야근일지 시스템 - 사용자 관리 기능

### 1. 개요

#### 1.1 배경
현재 야근일지 시스템의 사용자 목록은 `public/main.js` 파일에 하드코딩되어 있어, 사용자를 추가하거나 삭제하려면 코드를 직접 수정해야 합니다. 이는 비개발자가 시스템을 관리하기 어렵게 만들고, 실수로 코드를 손상시킬 위험이 있습니다.

#### 1.2 목적
웹 인터페이스를 통해 관리자가 쉽게 사용자를 추가, 수정, 삭제할 수 있는 기능을 제공하여 시스템의 유지보수성과 사용성을 향상시킵니다.

### 2. 현재 상태 분석

#### 2.1 현재 구조
- 사용자 목록: `main.js`의 `userList` 배열에 14명의 사용자가 하드코딩됨
- 데이터베이스: Firebase Firestore 사용 중 (현재는 야근 기록만 저장)
- 인증: 없음 (모든 사용자가 접근 가능)

#### 2.2 제약사항
- 사용자 추가/삭제 시 코드 수정 및 재배포 필요
- 사용자 정보 변경 이력 추적 불가
- 권한 관리 시스템 부재

### 3. 기능 요구사항

#### 3.1 사용자 관리 페이지
- **위치**: 메인 페이지에서 접근 가능한 별도 관리 페이지 또는 모달
- **접근 권한**: 초기에는 모든 사용자 접근 가능 (향후 관리자 권한 추가 고려)

#### 3.2 사용자 목록 조회
- 현재 등록된 모든 사용자 표시
- 각 사용자별 정보 표시:
  - 이름
  - 등록일
  - 마지막 야근 기록일 (선택사항)
  - 총 야근 기록 수 (선택사항)

#### 3.3 사용자 추가
- **입력 필드**:
  - 사용자 이름 (필수, 중복 불가)
  - 부서 (선택사항, 향후 확장용)
  - 직급 (선택사항, 향후 확장용)
- **검증**:
  - 이름 필수 입력
  - 중복 이름 체크
  - 특수문자 제한 (한글, 영문, 숫자, 공백만 허용)

#### 3.4 사용자 수정
- 사용자 이름 변경 가능
- 변경 시 기존 야근 기록과의 연계 유지

#### 3.5 사용자 삭제
- **소프트 삭제 방식** 권장:
  - 실제로 데이터를 삭제하지 않고 비활성화 상태로 변경
  - 기존 야근 기록 보존
  - 야근 입력 화면에서는 비활성 사용자 숨김
  - 조회 화면에서는 비활성 사용자 포함/제외 옵션 제공

### 4. 기술 요구사항

#### 4.1 데이터베이스 구조
```javascript
// Firestore 컬렉션: Users
{
  id: "auto-generated",
  name: "김지운",
  department: "개발팀", // 선택사항
  position: "선임", // 선택사항
  isActive: true,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  deletedAt: null // 소프트 삭제 시 타임스탬프
}
```

#### 4.2 API 엔드포인트
- `GET /api/users` - 사용자 목록 조회
- `POST /api/users` - 새 사용자 추가
- `PUT /api/users/:id` - 사용자 정보 수정
- `DELETE /api/users/:id` - 사용자 삭제 (소프트 삭제)

#### 4.3 마이그레이션
- 기존 하드코딩된 사용자 목록을 Firestore로 이전
- 기존 야근 기록의 userName과 새 Users 컬렉션 연계

### 5. UI/UX 요구사항

#### 5.1 사용자 관리 인터페이스
- 메인 페이지 상단에 "사용자 관리" 버튼 추가
- 관리 화면 구성:
  - 사용자 목록 테이블
  - "새 사용자 추가" 버튼
  - 각 사용자별 수정/삭제 버튼

#### 5.2 디자인 가이드라인
- 기존 Bootstrap 스타일 유지
- 한글 UI 일관성 유지
- 모바일 반응형 디자인

### 6. 구현 순서

1. **Phase 1: 백엔드 구조 개선**
   - Users 컬렉션 생성
   - 사용자 CRUD API 구현
   - 기존 사용자 데이터 마이그레이션

2. **Phase 2: 프론트엔드 통합**
   - 사용자 관리 페이지 구현
   - 야근 입력 화면을 동적 사용자 목록으로 전환
   - 조회 화면도 동적 사용자 목록으로 전환

3. **Phase 3: 데이터 정합성**
   - 기존 야근 기록과 새 사용자 시스템 연계
   - 데이터 검증 및 오류 처리

### 7. 향후 확장 고려사항

- **권한 관리**: 관리자/일반 사용자 구분
- **부서별 관리**: 부서 정보를 활용한 필터링
- **사용자 프로필**: 프로필 사진, 연락처 등 추가 정보
- **활동 로그**: 사용자 추가/수정/삭제 이력 추적

### 8. 성공 기준

- 코드 수정 없이 웹 인터페이스에서 사용자 추가/수정/삭제 가능
- 기존 야근 기록 데이터 손실 없음
- 사용자 경험 저하 없이 기존 기능 모두 정상 작동
- 페이지 로딩 속도 현재 수준 유지 (3초 이내)