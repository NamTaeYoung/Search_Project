<div align="center">

# 📊 K-Stock Insight  
### Spring Boot · React · Oracle 기반 주식·뉴스 분석 플랫폼

<br>

<img src="https://img.shields.io/badge/Java-17-007396?logo=java">
<img src="https://img.shields.io/badge/SpringBoot-3.x-6DB33F?logo=springboot">
<img src="https://img.shields.io/badge/React-18-61DAFB?logo=react">
<img src="https://img.shields.io/badge/Oracle-F80000?logo=oracle">
<img src="https://img.shields.io/badge/MyBatis-000000">

<br>

<img src="https://img.shields.io/badge/JWT-000000">
<img src="https://img.shields.io/badge/OAuth2-Google%20%7C%20Kakao%20%7C%20Naver-4285F4">
<img src="https://img.shields.io/badge/AWS%20EC2-Ubuntu-FF9900">
<img src="https://img.shields.io/badge/Gradle-02303A?logo=gradle&logoColor=white">
<img src="https://img.shields.io/badge/GitHub-181717?logo=github&logoColor=white">

<br><br>
</div>

---

## 📖 프로젝트 개요

**K-Stock Insight**는  
주식 종목 정보와 뉴스 데이터를 수집·분석하여  
**시장 흐름, 종목 이슈, 뉴스 감성 및 키워드 트렌드를 종합적으로 제공하는**  
웹 기반 주식·뉴스 분석 플랫폼입니다.

뉴스 크롤링을 통한 데이터 수집부터  
감성 분석, 키워드 트렌드 분석, 검색 엔진, 관리자 운영 기능까지  
**데이터 수집 → 분석 → 시각화 → 운영 관리** 흐름을 중심으로 설계되었습니다.

- 개발 기간 : `2025.11 ~ 2025.12`
- 개발 인원 : 팀 프로젝트
- 개발 환경 : Spring Boot + React 분리 구조

---

## 👨‍💻 담당 역할

- 🧑‍🏫 **백엔드 핵심 담당**
  - 인증·인가 설계 및 구현
  - 관리자 기능 및 보안 로그 설계
  - DB 설계 및 운영 로직 구현

- 🔐 **보안 중심 설계**
  - JWT Access / Refresh Token 구조
  - OAuth2 소셜 로그인
  - 계정 잠금 및 관리자 통제 기능

---

## 🛠 기술 스택

| 분야 | 기술 |
|------|------|
| **Frontend** |<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>React</title><path d="M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z"/></svg> <img src="https://img.shields.io/badge/react-61DAFB?style=flat-square&logi=html5&logoColor=white">React <img src="https://img.shields.io/badge/javascript-F7DF1E?style=flat-square&logi=html5&logoColor=white"> |
| **Backend** | <img src="https://img.shields.io/badge/springboot-6DB33F?style=flat-square&logi=html5&logoColor=white"> <img src="https://img.shields.io/badge/Java-F7DF1E?style=flat-square&logi=html5&logoColor=white"> <img src="https://img.shields.io/badge/Lombok-4285F4?style=flat-square&logi=html5&logoColor=white"> <img src="https://img.shields.io/badge/MyBatis-006600?style=flat-square&logi=html5&logoColor=white"> |
| **Database** | <img src="https://img.shields.io/badge/Oracle Database-09476B?style=flat-square&logi=html5&logoColor=white"> |
| **Security** | JWT (Access / Refresh Token), OAuth2 (Google / Kakao / Naver) |
| **Data / Crawling** | Python, Requests, BeautifulSoup |
| **Cache / Scheduler** | Redis, Spring Scheduler |
| **Infra / Server** | AWS EC2 (Ubuntu) <img src="https://img.shields.io/badge/Apache Tomcat-F8DC75?style=flat-square&logi=html5&logoColor=white"> |
| **Build Tool** | <img src="https://img.shields.io/badge/Gradle-02303A?style=flat-square&logi=html5&logoColor=white"> |
| **Tools** | VS Code <img src="https://img.shields.io/badge/STS-6DB33F?style=flat-square&logi=html5&logoColor=white"> Postman <img src="https://img.shields.io/badge/GitHub-181717?style=flat-square&logi=html5&logoColor=white"> <img src="https://img.shields.io/badge/SourceTree-0052CC?style=flat-square&logi=html5&logoColor=white"> |

---

## ✨ 주요 기능

### 📈 사용자 기능
- 🔎 **종목 검색 및 상세 조회**
- 📊 **종목 현재가, 등락률, 시가총액 정보 제공**
- 📰 **종목별 뉴스 조회**
- 🧠 **뉴스 감성 분석 결과 확인**
- 🏷 **키워드 기반 뉴스 요약 및 트렌드 분석**
- 📈 **시장 및 종목 차트 시각화**

---

### 📰 데이터 수집 및 분석 기능
- 주식 관련 뉴스 자동 수집(크롤링)
- 뉴스 중복 제거 및 원문(CLOB) 저장
- 뉴스–종목 자동 매칭
- 배치/스케줄 기반 데이터 수집 구조

---

### 🧠 분석 및 인사이트 제공
- 뉴스 본문 기반 감성 분석 (긍정 / 보통 / 부정)
- 종목별 감성 비율 집계
- 시장 전체 감성 흐름 요약
- 키워드 빈도 기반 트렌드 분석

---

### 🔍 검색 엔진
- 종목명 / 종목코드 검색
- 뉴스 제목·키워드 검색
- 종목·뉴스 통합 검색 결과 제공

---

### 🔐 회원 / 인증 기능
- 회원가입 / 로그인 / 로그아웃
- JWT 기반 인증 (Access / Refresh Token 분리)
- 소셜 로그인 (Google / Kakao / Naver)
- 비밀번호 찾기 및 재설정(이메일 인증)
- 로그인 실패 횟수 제한 및 계정 잠금 처리

---

### 🛠 관리자 기능
- **관리자 대시보드**
  - 사용자 수, 로그인 현황, 뉴스 수집 상태 모니터링
- **회원 관리**
  - 계정 정지 / 해제
  - 권한 변경(USER / ADMIN)
- **토큰 관리**
  - Refresh Token 강제 만료
- **로그 관리**
  - 로그인 로그
  - 관리자 작업 로그(Audit Log)

---

### 🔍 로그 & 보안
- 로그인 성공 / 실패 / 잠금 로그 기록
- 관리자 모든 행위 로그 기록
- IP / User-Agent 기반 접속 정보 저장
- 운영·보안 감사 목적 로그 구조 설계

---

## 🗂 DB 설계

- **USER_INFO** : 회원 정보 / 권한 / 계정 상태
- **STOCK_INFO** : 종목 기본 정보
- **STOCK_NEWS** : 뉴스 원문 + 감성 분석 결과
- **LOGIN_LOG** : 로그인 이력
- **ADMIN_LOG** : 관리자 작업 로그

---

## 🧭 메뉴 구조도

📄 관리자 / 사용자 메뉴 구조  
👉 *(첨부 예정)*

---

## 🖥 화면 설계서

📄 화면 설계서  
👉 *(첨부 예정)*

---

## 🔍 핵심 구현 내용 (내가 담당한 기능)

🔐 인증 / 보안
<details> <summary><strong>회원가입</strong></summary>

📌 설명

사용자가 회원 정보를 입력하면
중복 여부를 확인한 후 계정을 생성하도록 구현했습니다.

회원 가입 이후에는 JWT 기반 인증 구조에 따라
로그인 시 Access Token을 발급받아 인증 상태를 유지하며,
계정 상태(활성 / 정지 / 잠금)에 따라
로그인 가능 여부를 판단하도록 구성했습니다.

</details> <details> <summary><strong>JWT 기반 인증 구조 설계 및 구현</strong></summary>

📌 설명

프론트엔드와 백엔드가 분리된 환경에서
인증 상태를 안전하게 관리하기 위해 JWT 기반 인증 구조를 설계하고 구현했습니다.

Access Token과 Refresh Token을 분리하여 발급하고,
Refresh Token은 DB에 저장하여 재발급 및 강제 만료가 가능하도록 처리했습니다.
이를 통해 로그아웃, 토큰 탈취 등 상황에서도
인증 상태를 제어할 수 있도록 했습니다.

요청 단위로 인증 필터에서 토큰을 검증하여
서버 상태에 의존하지 않는 Stateless 인증 흐름을 구성했습니다.

</details> <details> <summary><strong>소셜 로그인 및 계정 연동</strong></summary>

📌 설명

Kakao, Naver, Google OAuth2 기반 소셜 로그인을 구현하여
다양한 로그인 수단을 제공했습니다.

인증 코드 발급 → 액세스 토큰 발급 → 사용자 정보 조회의
OAuth2 표준 흐름에 따라 인증을 처리했으며,
소셜 로그인 최초 시 기존 로컬 계정 존재 여부를 확인하여
계정 연동 여부를 판단하도록 설계했습니다.

이를 통해 로그인 방식과 관계없이
하나의 사용자 계정으로 일관된 인증 흐름을 유지했습니다.

</details> <details> <summary><strong>QR 로그인</strong></summary>

📌 설명

PC 화면에서 QR 코드를 생성하고,
모바일에서 인증을 완료하면
서버 검증을 거쳐 PC 로그인이 완료되는 QR 로그인 기능을 구현했습니다.

로그인 상태는 폴링 방식으로 확인하며,
일정 시간 내 인증이 완료되지 않을 경우
QR 인증 토큰이 자동으로 만료되도록 처리했습니다.

이를 통해 비밀번호 입력 없이도
안전한 로그인 흐름을 제공했습니다.

</details> <details> <summary><strong>계정 상태 관리 및 보안 통제</strong></summary>

📌 설명

비정상적인 로그인 시도를 방지하기 위해
로그인 실패 횟수를 누적 관리하도록 구현했습니다.

일정 횟수 이상 실패할 경우 계정을 자동으로 잠금 처리하고,
관리자가 직접 계정 정지 및 해제를 수행할 수 있도록 구성했습니다.

계정 상태(활성 / 잠금 / 정지)에 따라
접근 가능 여부를 판단하여 보안 통제를 적용했습니다.

</details>
🛠 관리자 기능
<details> <summary><strong>회원 관리</strong></summary>

📌 설명

관리자 권한으로 사용자 계정 상태와 권한을 관리할 수 있도록
회원 관리 기능을 구현했습니다.

계정 정지, 잠금 해제, 권한 변경 등의 작업을
관리자 화면에서 수행할 수 있도록 구성했습니다.

</details> <details> <summary><strong>토큰 관리</strong></summary>

📌 설명

관리자가 특정 사용자에 대해
Refresh Token을 강제 만료할 수 있도록 구현했습니다.

이를 통해 로그아웃 처리, 계정 보안 이슈 발생 시
즉각적인 인증 차단이 가능하도록 구성했습니다.

</details> <details> <summary><strong>로그 관리 및 보안 이벤트 관리</strong></summary>

📌 설명

로그인 성공 및 실패 이력을 기록하여
비정상적인 로그인 시도를 모니터링할 수 있도록 구현했습니다.

로그 데이터는
로그인 결과(성공/실패) 기준으로
필터링이 가능하도록 구성했으며,
조회 결과를 CSV 파일로 다운로드할 수 있도록 구현했습니다.

각 로그 항목에 대해 상세 조회 기능을 제공하여
로그인 시도 시점의 IP 주소, 로그인 방식, 요청 정보 등을
확인할 수 있도록 구성했습니다.

</details> <details> <summary><strong>관리자 작업 로그 (Admin Log)</strong></summary>

📌 설명
관리자에 의해 수행된 주요 관리 작업에 대해
작업 로그(Audit Log)를 기록하도록 설계했습니다.

계정 상태 변경, 권한 변경, 토큰 강제 만료와 같은
중요한 관리자 작업을 로그로 남기고,
작업 유형 및 관리자 계정 기준으로
필터링 및 조회가 가능하도록 구성했습니다.

또한 관리자 작업 로그 역시
CSV 파일로 다운로드할 수 있도록 하여,
운영 이력 확인과 관리 작업 추적이 가능하도록 구현했습니다.

</details>
---

## 📬 프로젝트 구조

```plaintext
📦 k-stock-insight
├─ backend
│  ├─ controller
│  ├─ service
│  ├─ dao
│  ├─ dto
│  ├─ security
│  └─ mapper
│
├─ frontend
│  ├─ pages
│  ├─ components
│  └─ api
│
└─ database
   └─ ddl.sql
