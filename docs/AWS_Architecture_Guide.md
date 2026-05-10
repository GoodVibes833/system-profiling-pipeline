# 🚀 AWS-Integrated System Profiling & Validation Suite

이 프로젝트는 클라우드 네이티브 환경(AWS)과 실리콘/소프트웨어 아키텍처의 성능 검증을 위한 **고도화된 관측성(Observability) 파이프라인 및 대시보드**입니다. 기존의 EC2 인스턴스 환경에서 나아가, Amazon S3 및 Amazon RDS와 같은 핵심 AWS 인프라 리소스와 통합하여 클라우드 시스템 엔지니어링 실무를 직접 경험할 수 있도록 구성되었습니다.

---

## 🎯 프로젝트 개요 (Project Overview)

이 프로젝트의 목적은 SaaS 기반의 소프트웨어 트래픽 처리부터 하드웨어(GPU/CPU) 레벨의 병목 현상, 그리고 AWS 매니지드 서비스(RDS, S3)의 연결 상태를 단일 뷰에서 모니터링하는 인더스트리 레벨의 대시보드를 구축하는 것입니다.

사용자는 프론트엔드 대시보드를 통해 다음 세 가지 핵심 도메인의 메트릭을 실시간으로 관찰할 수 있습니다:
1. **Cloud & SaaS**: 백엔드 API의 응답 속도, 처리량(RPS), 에러율.
2. **Silicon & Deep Tech**: GPU 코어 온도, 스로틀링, HBM 메모리 및 PCIe 대역폭.
3. **AWS Infra Integration (New ✨)**: S3 스토리지와 RDS 데이터베이스의 실시간 연결 상태 및 자원 현황.

---

## 🏗️ 시스템 아키텍처 및 구성 요소 (Architecture & Components)

### 1. Backend (Node.js + Express)
- **역할**: 클라이언트(대시보드)와 실제 인프라/하드웨어 사이의 미들웨어 역할을 합니다.
- **주요 기능**:
  - `GET /fast`: 정상적인 베이스라인 API 응답을 시뮬레이션합니다.
  - `GET /cpu-heavy`: 의도적인 CPU 연산 스파이크를 발생시킵니다 (재귀 피보나치 등).
  - `GET /memory-leak`: GC(Garbage Collection)가 되지 않는 메모리 누수를 시뮬레이션합니다.
  - `GET /api/aws/s3-status`: AWS SDK를 통해 사용자 AWS 계정의 S3 연결 상태를 확인하고 버킷 목록/개수를 반환합니다.
  - `GET /api/aws/rds-status`: `mysql2` 모듈을 통해 AWS RDS(MySQL) 인스턴스에 직접 커넥션을 맺고 쿼리(SELECT 1)를 날려 헬스 체크를 수행합니다.

### 2. Frontend (React + Vite + Recharts)
- **역할**: 복잡한 시스템 메트릭을 시각적으로 아름답고 직관적으로 표현하는 엔터프라이즈급 대시보드입니다.
- **주요 탭 (Tabs)**:
  - **Cloud & SaaS**: 초당 요청수(RPS), P99 Latency, Error Rate를 통해 시스템의 현재 부하 상태를 시각화합니다.
  - **Silicon & Deep Tech**: 멀티 칩(GPU 0~3) 환경에서의 온도 모니터링 및 Thermal Throttling(온도 상승으로 인한 강제 클럭 다운) 현상을 그래프로 보여줍니다.
  - **Root Cause (OS)**: 시스템 커널 레벨의 병목을 분석하는 Flamegraph (perf 결과) 뷰어입니다.
  - **AWS Infra**: **(새로 추가됨)** AWS S3 및 RDS의 실시간 연결 상태와 설정 가이드를 표시합니다.

---

## ⚙️ AWS 연동 가이드 (사용자 직접 수행)

대시보드의 **AWS Infra** 탭에서 실제 데이터가 연동되는 것을 보려면 아래 작업을 AWS 콘솔에서 수행한 후 `.env` 파일에 기록해야 합니다.

### 1. Amazon S3 세팅
1. AWS IAM에서 새 사용자를 생성하고 S3 읽기 권한(`AmazonS3ReadOnlyAccess`)을 부여합니다.
2. 해당 IAM User의 **Access Key**와 **Secret Access Key**를 발급받습니다.
3. 원한다면 테스트용 S3 버킷을 하나 생성해둡니다.

### 2. Amazon RDS (MySQL) 세팅
1. AWS RDS 콘솔에서 **MySQL** 데이터베이스 인스턴스를 생성합니다. (프리티어 권장)
2. **Publicly Accessible(퍼블릭 액세스 가능)** 옵션을 활성화하여 로컬 PC(현재 작업 중인 환경)에서 접근할 수 있도록 합니다.
3. 보안 그룹(Security Group) 인바운드 규칙에서 **3306 포트**를 통해 내 IP (또는 0.0.0.0/0)의 접근을 허용합니다.
4. RDS 인스턴스의 엔드포인트(호스트 주소), 마스터 사용자 이름, 비밀번호, 그리고 생성한 초기 데이터베이스 이름을 기억해둡니다.

### 3. 프로젝트 `.env` 파일 구성
프로젝트 루트 디렉토리(`/system-profiling-pipeline`)에 `.env` 파일을 만들고 아래 양식을 채워넣습니다:

```env
# AWS Credentials for S3
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1

# AWS RDS Configuration
DB_HOST=your-rds-endpoint.xxxxx.us-east-1.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=your_password
DB_NAME=your_db_name
```

---

## 🚀 실행 방법 (How to Run)

1. **백엔드 실행**:
   터미널을 열고 다음 명령어를 실행합니다. `.env` 값을 읽고 S3/RDS 연결 테스트를 준비합니다.
   ```bash
   cd /Users/alexhan/Documents/Alex_dev/system-profiling-pipeline
   npm install
   node server.js
   ```

2. **프론트엔드 대시보드 실행**:
   새 터미널을 열고 대시보드를 실행합니다.
   ```bash
   cd /Users/alexhan/Documents/Alex_dev/system-profiling-pipeline/dashboard
   npm run dev
   ```

3. 브라우저에서 `http://localhost:5173` 에 접속하여 **AWS Infra** 탭을 클릭해 연결 성공(`Connected`) 상태가 뜨는지 확인합니다! 연결 실패 시 에러 메시지(예: Timeout, Access Denied)가 대시보드 화면에 바로 출력됩니다.
