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
| **Frontend** | React, JavaScript |
| **Backend** | Spring Boot, Java, MyBatis |
| **Database** | Oracle |
| **Security** | JWT, OAuth2 (Google / Kakao / Naver) |
| **Infra** | AWS EC2 (Ubuntu) |
| **Build Tool** | Gradle |
| **Tools** | GitHub, SourceTree, Figma |

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

### 🔐 인증 / 보안

<details>
<summary><strong>JWT 인증 구조</strong></summary>

- Access / Refresh Token 분리 설계
- Refresh Token DB 저장 및 강제 만료 처리
- Stateless 인증 구조 구현

</details>

<details>
<summary><strong>소셜 로그인</strong></summary>

- OAuth2 인증 코드 → 토큰 → 사용자 정보 조회
- 신규 사용자 자동 가입 처리
- 기존 계정 연동 구조 설계

</details>

<details>
<summary><strong>계정 잠금 및 관리자 통제</strong></summary>

- 로그인 실패 횟수 누적
- 일정 횟수 초과 시 계정 잠금
- 관리자에 의한 계정 정지 / 해제

</details>

---

### 🛠 관리자 기능

<details>
<summary><strong>회원 관리</strong></summary>

- 사용자 상태 및 권한 관리
- 관리자 작업 로그 자동 기록

</details>

<details>
<summary><strong>로그 관리</strong></summary>

- 로그인 로그 모니터링
- 관리자 행위 Audit Log 설계

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
