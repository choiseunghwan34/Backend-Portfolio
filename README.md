# CampusOps

CampusOps는 학교, 학원, 동아리, 스터디 센터에서 사용할 수 있는 운영 관리 플랫폼입니다. 공지사항, 시설 신고, 기자재 대여, 공간 예약, 알림 기능을 제공하며 관리자와 일반 사용자의 권한을 분리했습니다.

## 프로젝트 소개

- 일반 사용자는 공지사항 확인, 시설 고장 신고, 기자재 대여 신청, 공간 예약, 알림 확인을 할 수 있습니다.
- 관리자는 공지 등록, 신고 처리, 대여 승인, 공간 관리, 예약 관리를 할 수 있습니다.
- 프론트엔드는 React, 백엔드는 Spring Boot API, DB는 Supabase PostgreSQL, 캐시는 Redis를 사용합니다.
- Supabase는 데이터베이스 용도로만 사용하고, 인증과 비즈니스 로직은 Spring Boot에서 직접 처리합니다.

## 주요 기능

- 회원가입, 로그인, JWT 인증
- 내 정보 조회, 로그아웃
- 공지사항 목록, 상세, 검색, 중요 공지, 조회수 증가
- 시설 신고 등록, 내 신고 목록, 관리자 상태 변경 및 답변
- 기자재 목록, 대여 신청, 관리자 승인/반려/반납
- 공간 목록, 예약 신청, 예약 취소, 관리자 공간 관리
- 알림 목록, 읽음 처리, 읽지 않은 알림 개수 조회
- 관리자 대시보드 통계

## 기술 스택

### Backend

- Java 17
- Spring Boot
- Spring Security
- JWT
- MyBatis
- Supabase PostgreSQL
- Redis
- Gradle
- Lombok

### Frontend

- React
- JavaScript
- CSS
- Axios
- React Router

## 백엔드 구조

프로젝트 경로: [`campusops-backend`](./campusops-backend)

패키지 구조:

- `com.campusops.controller`
- `com.campusops.service`
- `com.campusops.dao`
- `com.campusops.vo`
- `com.campusops.dto`
- `com.campusops.config`
- `com.campusops.security`
- `com.campusops.exception`
- `com.campusops.util`

구현 원칙:

- 단일 Spring Boot 프로젝트
- Controller → Service → DAO 구조
- MyBatis Mapper XML 방식
- JPA 미사용
- Repository 구조 미사용
- REST API 방식
- 공통 응답 형식 사용
- 공통 예외 처리 사용
- 관리자 / 일반 사용자 권한 분리

## 프론트엔드 구조

프로젝트 경로: [`campusops-frontend`](./campusops-frontend)

폴더 구조:

- `src/api`
- `src/components`
- `src/pages`
- `src/routes`
- `src/styles`
- `src/utils`

프론트 구현 원칙:

- React Router로 페이지 이동
- Axios 인터셉터로 JWT 자동 첨부
- JWT 토큰은 `localStorage` 저장
- Supabase 직접 접근 금지
- CSS 파일 직접 스타일링
- 화이트, 연한 블루, 진한 네이비 계열
- 카드형 레이아웃 기반의 모던 대시보드 UI

## Supabase PostgreSQL 사용 이유

MySQL RDS는 비용 부담이 있어 무료로 사용 가능한 Supabase PostgreSQL을 데이터베이스로 선택했습니다. 다만 인증과 비즈니스 로직은 Supabase 기능에 의존하지 않고 Spring Boot 서버에서 직접 처리하여 백엔드 구조와 인증 흐름을 명확하게 구현했습니다.

## DB 테이블 구조

SQL 스키마 파일:

- [`campusops-backend/src/main/resources/sql/schema.sql`](./campusops-backend/src/main/resources/sql/schema.sql)

테이블:

- `users`
- `notice`
- `facility_report`
- `asset`
- `asset_rental`
- `room`
- `room_reservation`
- `notification`

주요 규칙:

- PK는 `BIGSERIAL`
- `AUTO_INCREMENT` 미사용
- 날짜 컬럼은 `TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
- 불리언은 `BOOLEAN`
- 문자열은 `VARCHAR` 또는 `TEXT`
- 테이블명/컬럼명은 `snake_case`
- 페이징은 `LIMIT / OFFSET`
- MySQL 전용 문법 미사용

## API 명세

### Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/users/me`

### Notices

- `GET /api/notices`
- `GET /api/notices/{noticeNo}`
- `GET /api/notices/recent`
- `POST /api/admin/notices`
- `PUT /api/admin/notices/{noticeNo}`
- `DELETE /api/admin/notices/{noticeNo}`

### Reports

- `POST /api/reports`
- `GET /api/reports/my`
- `GET /api/reports/{reportNo}`
- `GET /api/admin/reports`
- `PATCH /api/admin/reports/{reportNo}/status`
- `PATCH /api/admin/reports/{reportNo}/reply`

### Assets

- `GET /api/assets`
- `GET /api/assets/{assetNo}`
- `POST /api/assets/{assetNo}/rentals`
- `GET /api/rentals/my`
- `POST /api/admin/assets`
- `PUT /api/admin/assets/{assetNo}`
- `PATCH /api/admin/assets/{assetNo}/disable`
- `GET /api/admin/assets/rentals`
- `PATCH /api/admin/assets/rentals/{rentalNo}/approve`
- `PATCH /api/admin/assets/rentals/{rentalNo}/reject`
- `PATCH /api/admin/assets/rentals/{rentalNo}/return`

### Rooms

- `GET /api/rooms`
- `GET /api/rooms/{roomNo}`
- `GET /api/rooms/{roomNo}/reservations`
- `POST /api/rooms/{roomNo}/reservations`
- `GET /api/reservations/my`
- `DELETE /api/reservations/{reservationNo}`
- `POST /api/admin/rooms`
- `PUT /api/admin/rooms/{roomNo}`
- `PATCH /api/admin/rooms/{roomNo}/disable`
- `GET /api/admin/rooms/reservations`

### Notifications

- `GET /api/notifications`
- `PATCH /api/notifications/{notificationNo}/read`
- `GET /api/notifications/unread-count`

### Admin Dashboard

- `GET /api/admin/dashboard/stats`

## Redis 사용 포인트

- 최근 공지사항 캐싱
  - Key: `notice:recent`
- 시설 신고 도배 방지
  - Key: `rate:report:{userNo}`
  - TTL: 60초
- 기자재 대여 중복 방지
  - Key: `rental:hold:{assetNo}:{userNo}`
  - TTL: 5분
- 공간 예약 임시 선점 및 중복 방지
  - Key: `reservation:hold:{roomNo}:{date}:{startTime}`
  - TTL: 5분
- 읽지 않은 알림 개수 캐싱
  - Key: `notification:unread:{userNo}`

## 실행 방법

### 0. Supabase PostgreSQL 준비

- Supabase 프로젝트를 생성합니다.
- [`campusops-backend/src/main/resources/sql/schema.sql`](./campusops-backend/src/main/resources/sql/schema.sql) 내용을 Supabase SQL Editor에서 실행합니다.
- 환경변수를 설정합니다.

### 1. 백엔드

`campusops-backend` 폴더에서 실행합니다.

```bash
gradle bootRun
```

백엔드 기본 포트는 `8080`입니다.

### 2. 프론트엔드

`campusops-frontend` 폴더에서 실행합니다.

```bash
npm install
npm run dev
```

프론트엔드 기본 포트는 `5173`입니다.

## 환경변수 설정 방법

`campusops-backend/src/main/resources/application.yml`은 환경변수를 참조하도록 구성되어 있습니다.

필수 환경변수:

- `SUPABASE_DB_URL`
- `SUPABASE_DB_USERNAME`
- `SUPABASE_DB_PASSWORD`
- `JWT_SECRET`
- `REDIS_HOST`
- `REDIS_PORT`
- `VITE_API_BASE_URL` - `campusops-frontend`에서 사용

예시:

```bash
SUPABASE_DB_URL=jdbc:postgresql://...
SUPABASE_DB_USERNAME=...
SUPABASE_DB_PASSWORD=...
JWT_SECRET=your-secret-key
REDIS_HOST=localhost
REDIS_PORT=6379
```

## 기본 관리자 계정

- `user_id`: `admin`
- `password`: `Admin123!`
- `role`: `ADMIN`

## 기본 일반 사용자 계정

- `user_id`: `user01`
- `password`: `User123!`
- `role`: `USER`

기본 계정은 백엔드 시작 시 시드 로직으로 생성됩니다.

## Postman 테스트 방법

1. 로그인 또는 회원가입 요청으로 JWT 토큰을 발급받습니다.
2. Postman의 `Authorization` 탭에서 `Bearer Token`을 선택하고 발급받은 토큰을 넣습니다.
3. 권한이 필요한 API는 로그인 후 요청합니다.
4. 관리자 API는 `ADMIN` 계정으로 로그인한 토큰을 사용합니다.

권장 테스트 순서:

- `POST /api/auth/login`
- `GET /api/users/me`
- `GET /api/notices`
- `POST /api/reports`
- `GET /api/notifications`
- `GET /api/admin/dashboard/stats`

## 포트폴리오 설명 문구

CampusOps는 학교나 학원에서 사용할 수 있는 운영 관리 플랫폼입니다. 공지사항, 시설 신고, 기자재 대여, 공간 예약 기능을 구현했으며, 관리자와 일반 사용자 권한을 분리했습니다. MySQL RDS의 비용 부담을 줄이기 위해 Supabase PostgreSQL을 데이터베이스로 사용했고, Redis TTL을 활용해 대여 신청과 공간 예약의 중복 요청을 방지했습니다. 백엔드는 Controller-Service-DAO 구조와 MyBatis 기반으로 구성했습니다.

## 참고

- 프론트엔드는 백엔드 API만 호출하며 Supabase에 직접 접근하지 않습니다.
- Supabase Auth는 사용하지 않습니다.
- 인증은 Spring Security + JWT로 직접 구현했습니다.
