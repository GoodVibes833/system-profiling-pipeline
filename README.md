# sdet-portfolio-lab

A production-grade SDET portfolio monorepo covering API testing, E2E automation, performance engineering, chaos engineering, and AWS cloud profiling.

## Architecture

```
sdet-portfolio-lab/
├── apps/
│   ├── whatodo/                # [Product] WhatToDo app — Next.js + Supabase + Leaflet
│   ├── target-server/          # [Test Target] Fault-injection API — Node.js + Express
│   │   ├── /health, /users, /products  # Clean CRUD endpoints
│   │   └── /fault/*            # Latency, error-rate, memory-leak, cpu-spike injection
│   └── aws-profiling-server/   # [AWS Practice] Cloud-integrated profiling server
│       ├── /fast, /cpu-heavy, /memory-leak  # Baseline & fault endpoints
│       ├── /api/aws/s3-status, /api/aws/rds-status  # AWS service health
│       ├── /api/aws/cost       # Cost Explorer integration
│       ├── /api/metrics/*      # RDS metrics persistence
│       └── /api/sqs/*          # SQS send/receive worker simulation
├── tests/
│   ├── api/                    # [Phase 1 ✅] Jest + SuperTest → target-server
│   ├── e2e/                    # [Phase 2] Playwright → whatodo UI
│   └── performance/            # [Phase 3 ✅] k6 → aws-profiling-server
├── chaos/                      # [Phase 3 ✅] Network degradation + resource starvation scripts
├── monitoring/                 # [Phase 3 ✅] Host info + system metrics collection
├── docs/
│   ├── AWS_Architecture_Guide.md
│   └── AWS_SAA_Study_Guide.md
└── .github/workflows/          # [Phase 4] CI/CD (PR-triggered)
```

## Tech Stack

| Layer | Tool | Why |
|-------|------|-----|
| API Testing | Jest + SuperTest | Industry standard; in-process import avoids network flakiness |
| E2E Testing | Playwright | Cross-browser; built-in auto-wait; modern Selenium alternative |
| Performance | k6 | JS-native scripts; cloud-ready; CI-friendly thresholds |
| Contract | Pact | Consumer-driven; decouples service team deployments |
| Observability | Prometheus + Grafana | De facto metrics stack; correlate load test results |
| Chaos Engineering | `tc` + `stress-ng` | Network latency/packet loss + CPU/memory starvation |
| Cloud Profiling | AWS SDK v3 | S3, RDS, SQS, Cost Explorer, Secrets Manager |
| CI/CD | GitHub Actions | Native PR integration; matrix strategy for parallel jobs |

## Quick Start

```bash
# Install all workspace dependencies
npm install

# Start the WhatToDo app (http://localhost:3000)
npm run dev:whatodo

# Start the fault-injection target server (http://localhost:3001)
npm run dev:target

# Start the AWS profiling server (http://localhost:3002)
npm run dev:aws

# Run API tests (Phase 1 — target-server)
npm run test:api

# Run E2E tests (Phase 2 — whatodo)
npm run test:e2e

# Run performance tests (Phase 3 — aws-profiling-server)
npm run test:perf:smoke
npm run test:perf:stress
npm run test:perf:spike
npm run test:perf:soak
```

## Target Server Endpoints

### Health
| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Liveness check |
| GET | `/health/detailed` | Readiness check with memory stats |

### Users CRUD
| Method | Path | Description |
|--------|------|-------------|
| GET | `/users` | List users (`?limit`, `?offset`) |
| GET | `/users/:id` | Get user by ID |
| POST | `/users` | Create user (`name`, `email`, `role`) |
| PUT | `/users/:id` | Update user |
| DELETE | `/users/:id` | Delete user |

### Products CRUD
| Method | Path | Description |
|--------|------|-------------|
| GET | `/products` | List products (`?category`, `?minPrice`, `?maxPrice`) |
| GET | `/products/:id` | Get product by ID |
| POST | `/products` | Create product (`name`, `price`, `category`, `stock`) |
| PUT | `/products/:id` | Update product |
| DELETE | `/products/:id` | Delete product |

### Fault Injection (target-server)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/fault/slow` | Artificial delay (`?delay=ms`, default 2000) |
| GET | `/fault/error-rate` | Random 500s (`?rate=0.0–1.0`, default 0.5) |
| GET | `/fault/memory-leak` | Allocates 1MB/request to heap |
| GET | `/fault/cpu-spike` | Fibonacci CPU pressure (`?n=`, default 40) |
| GET | `/fault/timeout` | Hangs indefinitely (`?duration=ms`) |

## AWS Profiling Server Endpoints

### Baseline & Fault
| Method | Path | Description |
|--------|------|-------------|
| GET | `/fast` | Baseline response |
| GET | `/cpu-heavy` | Recursive Fibonacci CPU spike |
| GET | `/memory-leak` | Allocates 1MB to global array |

### AWS S3
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/aws/s3-status` | List buckets and connection status |
| POST | `/api/s3/export-snapshot` | Save JSON snapshot to S3 |
| GET | `/api/s3/snapshots` | List saved snapshots |

### AWS RDS
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/aws/rds-status` | MySQL connection health check |
| POST | `/api/metrics/save` | Persist metrics to RDS |
| GET | `/api/metrics/history` | Retrieve metrics history |

### AWS Cost Explorer
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/aws/cost` | This month's service-level cost |

### AWS SQS
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/sqs/send` | Send message to queue |
| GET | `/api/sqs/receive` | Receive and delete message (worker sim) |

## Design Decisions

**Why in-memory store?** Eliminates DB setup overhead for portfolio demos. The `reset()` helper enables deterministic test isolation without mocking.

**Why SuperTest with direct app import?** Avoids starting a real HTTP server—faster CI, no port conflicts, and the test imports the same Express app object that production uses.

**Why separate `app.js` from `index.js`?** The app factory pattern lets tests import `app.js` without side-effect (no `listen()`). `index.js` only starts the server in production.

**Why fault endpoints?** Real SDET work involves testing how systems behave under degraded conditions. These endpoints let performance and resilience tests run without infrastructure dependencies.

**Why AWS SDK v3?** Modular imports reduce bundle size and cold-start latency compared to v2 monolithic clients.

## Phases

| Phase | Status | Contents |
|-------|--------|----------|
| 1 | ✅ Complete | target-server + API tests (Jest + SuperTest) |
| 2 | � In Progress | Playwright E2E → whatodo (Next.js + Vitest + Playwright) |
| 3 | ✅ Complete | k6 performance tests + chaos engineering + AWS profiling server |
| 4 | 🔜 Planned | GitHub Actions CI/CD pipeline |
