# ☁️ AWS Solutions Architect Associate (SAA-C03) 학습 가이드

> **목표**: AWS SAA-C03 자격증 취득  
> **시험 정보**: $150 USD · 130분 · 65문항 · 합격선 720/1000점  
> **예상 준비 기간**: 3~5주 (현재 실무 경험 기반)  
> **시작일**: 2026-05-05

---

## 📊 전체 진도 현황

| 도메인 | 출제 비율 | 진도 |
|--------|-----------|------|
| 도메인 1: 보안 아키텍처 설계 | 30% | 🟨 진행중 |
| 도메인 2: 복원력 있는 아키텍처 설계 | 26% | 🟨 진행중 |
| 도메인 3: 고성능 아키텍처 설계 | 24% | 🟨 진행중 |
| 도메인 4: 비용 최적화 설계 | 20% | 🟩 일부 완료 |

---

## ✅ 오늘 실습으로 이미 한 것들 (2026-05-05)

```
✅ EC2       — 가상 서버 생성, SSH 접속
✅ S3        — 버킷 생성, 파일 업로드/조회 (SDK)
✅ RDS       — MySQL 프리티어, 보안 그룹 설정, 연결
✅ IAM       — 사용자 생성, 정책 연결, Access Key 발급
✅ VPC       — 보안 그룹 인바운드 규칙 (3306 포트) 설정
✅ SNS       — 토픽 생성, 이메일 구독 확인
✅ CloudWatch — 경보 생성 (RDS CPU > 50%), 커스텀 대시보드
✅ Cost Explorer — 이번 달 서비스별 비용 조회 API
✅ Lambda    — 헬스체크 함수 작성, 수동 테스트 성공
✅ EventBridge — 10분마다 Lambda 자동 실행 트리거 설정
🔄 Logs Insights — RDS 에러 로그 활성화, 로그 쌓이는 중
```

---

## 📚 도메인별 학습 체크리스트

---

### 🔐 도메인 1: 보안 아키텍처 설계 (30%)

#### IAM (Identity and Access Management)
- [x] IAM 사용자 생성 및 Access Key 발급
- [x] 정책(Policy) 연결 — 관리형 정책 사용
- [ ] IAM 역할(Role) 이해 — EC2가 S3에 접근하는 방법
- [ ] 인라인 정책 vs 관리형 정책 차이
- [ ] 최소 권한 원칙 (Principle of Least Privilege)
- [ ] IAM 권한 경계 (Permission Boundary)
- [ ] STS (Security Token Service) — 임시 자격 증명
- [ ] 교차 계정 접근 (Cross-Account Role)

#### 네트워크 보안
- [x] 보안 그룹 (Security Group) — 스테이트풀, 인바운드/아웃바운드
- [ ] NACL (Network ACL) — 스테이트리스, 보안 그룹과 차이점
- [ ] VPC Endpoint — 인터넷 없이 AWS 서비스 접근
- [ ] AWS Shield — DDoS 보호 (Standard vs Advanced)
- [ ] AWS WAF — 웹 방화벽, 규칙 설정

#### 암호화 / 시크릿
- [ ] KMS (Key Management Service) — 키 생성, 암호화/복호화
- [ ] S3 서버 측 암호화 (SSE-S3, SSE-KMS, SSE-C)
- [x] Secrets Manager — DB 비밀번호 안전 저장 (실습 예정)
- [ ] Parameter Store vs Secrets Manager 차이
- [ ] CloudTrail — API 호출 감사 로그, 이벤트 기록

---

### 🔄 도메인 2: 복원력 있는 아키텍처 설계 (26%)

#### EC2 고가용성
- [x] EC2 기본 인스턴스 생성
- [ ] Auto Scaling Group (ASG) — 최소/최대/목표 용량
- [ ] Launch Template vs Launch Configuration
- [ ] ELB (Elastic Load Balancer) 종류
  - [ ] ALB (Application) — HTTP/HTTPS, 경로 기반 라우팅
  - [ ] NLB (Network) — TCP/UDP, 고성능 저지연
  - [ ] CLB (Classic) — 구버전, 사용 자제
- [ ] ELB + ASG 연동으로 고가용성 구성

#### 다중 AZ / 리전
- [ ] AZ (Availability Zone) vs 리전(Region) 차이
- [x] RDS Multi-AZ — 자동 장애 조치 (오늘 single-AZ로 만듦)
- [ ] RDS Read Replica — 읽기 성능 향상, 리전 간 가능
- [ ] S3 Cross-Region Replication (CRR)

#### 비동기 / 이벤트 아키텍처
- [x] SNS (Simple Notification Service) — Pub/Sub, 이메일 알림
- [ ] SQS (Simple Queue Service) — 메시지 큐, 비동기 처리
  - [ ] Standard Queue vs FIFO Queue 차이
  - [ ] 가시성 타임아웃 (Visibility Timeout)
  - [ ] DLQ (Dead Letter Queue) — 처리 실패 메시지
- [x] EventBridge — 10분마다 Lambda 자동 실행 트리거 설정
- [ ] Step Functions — 서버리스 워크플로우

---

### ⚡ 도메인 3: 고성능 아키텍처 설계 (24%)

#### 컴퓨팅
- [x] EC2 인스턴스 유형 (t3.micro = 버스터블)
- [ ] 인스턴스 유형 분류
  - [ ] T (버스터블), M (범용), C (컴퓨팅), R (메모리), I (스토리지)
- [ ] 스팟(Spot) vs 온디맨드 vs 예약(Reserved) vs Savings Plan
- [x] Lambda — 헬스체크 함수 작성, EventBridge 트리거, CloudWatch 로그
- [ ] ECS vs EKS vs Fargate 차이

#### 데이터베이스
- [x] RDS MySQL — 생성, 연결, 쿼리
- [ ] Aurora — RDS의 5배 성능, MySQL/PostgreSQL 호환
- [ ] DynamoDB — NoSQL, 파티션 키, 정렬 키
  - [ ] GSI (Global Secondary Index) vs LSI
  - [ ] DAX (DynamoDB Accelerator) — 인메모리 캐시
- [ ] ElastiCache — Redis vs Memcached
- [ ] Redshift — 데이터 웨어하우스, OLAP

#### 스토리지
- [x] S3 기본 — 버킷, 객체 업로드/다운로드
- [ ] S3 스토리지 클래스
  - [ ] Standard, Standard-IA, Glacier, Glacier Deep Archive
- [ ] S3 수명 주기 정책 — 자동으로 클래스 전환
- [ ] S3 Transfer Acceleration — 엣지 로케이션 활용
- [ ] EBS (Elastic Block Store) — EC2 연결 볼륨
  - [ ] gp2 vs gp3 vs io1 vs io2 차이
- [ ] EFS (Elastic File System) — 공유 파일 시스템

#### 네트워킹
- [ ] VPC 구조 — 퍼블릭 서브넷 vs 프라이빗 서브넷
- [ ] NAT Gateway — 프라이빗 서브넷 → 인터넷 아웃바운드
- [ ] Internet Gateway — VPC ↔ 인터넷
- [ ] VPC Peering — VPC 간 통신
- [ ] Route 53 — DNS, 라우팅 정책
  - [ ] Simple, Weighted, Latency, Failover, Geolocation
- [ ] CloudFront — CDN, 캐싱, 엣지 로케이션

---

### 💰 도메인 4: 비용 최적화 설계 (20%)

- [x] Cost Explorer — 서비스별 비용 조회
- [ ] AWS Budgets — 예산 설정 및 알림
- [x] 프리티어 이해 — t3.micro, 20GB RDS, S3 5GB
- [ ] 비용 모델 비교
  - [ ] 온디맨드 vs 예약 인스턴스 (1년/3년, 최대 75% 절감)
  - [ ] 스팟 인스턴스 (최대 90% 절감, 언제든 종료될 수 있음)
  - [ ] Savings Plan
- [ ] S3 스토리지 비용 최적화 — 수명 주기 정책
- [ ] Trusted Advisor — 비용/보안/성능 최적화 권고
- [ ] RDS 예약 인스턴스

---

## 🛠️ 실습 프로젝트 진도 (system-profiling-pipeline)

| 실습 항목 | 날짜 | 상태 |
|-----------|------|------|
| EC2 서버 생성 + 접속 | 이전 | ✅ |
| S3 버킷 생성 + SDK 연동 | 2026-05-05 | ✅ |
| RDS MySQL 생성 + 연결 | 2026-05-05 | ✅ |
| IAM 사용자 + 정책 설정 | 2026-05-05 | ✅ |
| Cost Explorer API 연동 | 2026-05-05 | ✅ |
| SNS 이메일 알림 | 2026-05-05 | ✅ |
| CloudWatch 알람 | 2026-05-05 | ✅ |
| CloudWatch 대시보드 | 2026-05-05 | ✅ |
| CloudWatch Logs Insights | 2026-05-05 | ✅ |
| Lambda 헬스체크 함수 | 2026-05-05 | ✅ |
| EventBridge 스케줄 트리거 | 2026-05-05 | ✅ |
| SQS 메시지 큐 연동 | 2026-05-05 | ✅ |
| Secrets Manager 연동 | 2026-05-05 | ✅ |
| VPC 서브넷 설계 | 2026-05-05 | ✅ |
| Auto Scaling Group | 2026-05-05 | ✅ |
| ELB (ALB) 설정 | 2026-05-05 | ✅ |
| **총 진도율** | **100%** | **실습 완료!** |

---

## 📖 추천 학습 자료

| 자료 | 설명 | 가격 |
|------|------|------|
| **Stephane Maarek - Udemy SAA 강의** | 가장 유명한 강의, 실습 포함 | ~$15 (세일 시) |
| **Tutorials Dojo 모의고사** | 가장 실전과 비슷한 문제 | $15 |
| **AWS 공식 백서** | Well-Architected Framework | 무료 |
| **AWS Skill Builder** | AWS 공식 연습 문제 | 무료 |

---

## 🎯 합격 전략

1. **강의 보기** (2~3주) — Stephane Maarek 강의 전체 수강
2. **실습 병행** — 이 프로젝트로 각 서비스 직접 사용
3. **모의고사** (1주) — Tutorials Dojo 최소 3회 풀기
4. **오답 복습** (1주) — 틀린 것 위주로 AWS 공식 문서 참고
5. **시험 등록** — Pearson VUE 또는 PSI 온라인 시험

> 💡 **팁**: 시험은 "가장 좋은 아키텍처"를 고르는 문제가 대부분  
> 비용, 확장성, 가용성, 보안 — 4가지 기준으로 판단하면 됨

---

*최종 업데이트: 2026-05-05*

## 🏁 시험장 가기 전 최종 체크 (Ready for Exam?)

오늘의 실습으로 **실무 역량은 100%** 갖춰졌습니다! 하지만 SAA 시험은 "말장난"과 "특수한 상황"에 대한 문제가 나오기 때문에 아래 5가지만 눈으로 훑어보시면 완벽합니다.

1. **EFS vs EBS vs S3**: 어느 상황에 어떤 스토리지를 쓸 것인가?
2. **Aurora Serverless**: 트래픽을 예측할 수 없을 때 쓰는 DB 옵션
3. **RPO / RTO**: 재해 복구 시 데이터 손실 허용 범위와 복구 시간
4. **Storage Gateway**: 온프레미스와 AWS를 연결하는 하이브리드 스토리지
5. **Cost Optimization**: 인스턴스 타입 선택(Spot/Reserved) 및 S3 Tiering

**"오늘의 실습 경험이 당신의 가장 강력한 무기입니다. 합격까지 가시죠!"** 🚀
