# 🏦 Mini Banking System

[![Java](https://img.shields.io/badge/Java-21-orange)](https://openjdk.org/projects/jdk/21/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.x-brightgreen)](https://spring.io/projects/spring-boot)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue)](https://www.mysql.com/)
[![Redis](https://img.shields.io/badge/Redis-7-red)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED)](https://docs.docker.com/compose/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

A **full-featured banking backend** built with Java Spring Boot, featuring JWT authentication, role-based access control, real-time WebSocket notifications, a complete KYC identity verification workflow, and version-controlled database migrations via Flyway.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **JWT Auth** | Stateless authentication with 24h token expiry and Redis-backed blacklist |
| 👥 **Role-based Access** | Three roles: **Customer**, **Staff** (Manager/Support), **Admin** |
| 🔗 **OAuth2 Social Login** | Google, Facebook, Microsoft, LinkedIn |
| 💸 **Transactions** | Deposit, Withdrawal, Transfer — atomic with deadlock-safe locking |
| 🪪 **KYC Workflow** | Submit → Staff approve/reject → Customer resubmit |
| 🔔 **WebSocket Notifications** | Real-time push via STOMP/SockJS after every transaction and KYC review |
| 🗄️ **Flyway Migrations** | 11 versioned SQL migrations for reproducible schema |
| 🛡️ **Rate Limiting** | Per-user/IP rate limiting on all `/api/**` endpoints via Redis |
| 📋 **Audit Logging** | AOP-based audit trail for all critical operations |
| 🧰 **Savings, Loans, Cards** | Extended banking product support |
| 🎮 **Gamification** | Loyalty points, language lessons, voucher system |
| 📊 **OpenAPI / Swagger** | Auto-generated interactive API docs |
| 🐳 **Docker** | Multi-stage build with `docker-compose` (app + MySQL + Redis) |
| ❤️ **Actuator** | Health checks for Docker and monitoring |

---

## 🏗️ Architecture

```
Client (Browser / Mobile / API)
    │ HTTPS REST        │ STOMP over WebSocket
    ▼                   ▼
Spring Boot Application (/api/**, /ws/**)
    │
    ├── Security Layer (JWT Filter + @PreAuthorize)
    ├── REST Controllers (api/, controller/)
    ├── Service Layer (business logic + @Transactional)
    ├── Repository Layer (Spring Data JPA)
    └── AOP (Audit logging)
         │
    ┌────┼──────────┐
    ▼    ▼          ▼
 MySQL  Redis   Cloudinary
 (DB)  (Cache)  (Images)
```

---

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

```bash
# 1. Clone the repository
git clone <repo-url>
cd BankingSystem

# 2. Configure secrets
cp .env.example .env
# Edit .env with your actual values

# 3. Start all services
docker-compose up -d

# 4. Access the application
open http://localhost:8080
open http://localhost:8080/swagger-ui/index.html
```

### Option 2: Local Development

**Prerequisites**: Java 21, Maven 3.9+, MySQL 8.0, Redis 7

```bash
# 1. Configure local properties
cp backend/main/resources/application-local.properties.example \
   backend/main/resources/application-local.properties
# Edit with your local DB/Redis credentials

# 2. Run the application
./mvnw.cmd spring-boot:run          # Windows
./mvnw spring-boot:run              # Linux/Mac

# 3. Access Swagger UI
open http://localhost:8080/swagger-ui/index.html
```

---

## 🔑 API Overview

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Login, returns JWT |
| `POST` | `/api/auth/register` | Public | Register new customer |
| `POST` | `/api/auth/logout` | Auth | Blacklist JWT token |
| `POST` | `/api/transactions/deposit` | CUSTOMER | Deposit money |
| `POST` | `/api/transactions/withdraw` | CUSTOMER | Withdraw money |
| `POST` | `/api/transactions/transfer` | CUSTOMER | Transfer between accounts |
| `POST` | `/api/kyc/submit` | CUSTOMER | Submit KYC documents |
| `PUT` | `/api/kyc/{id}/review` | STAFF/ADMIN | Approve or reject KYC |
| `GET` | `/api/kyc/pending` | STAFF/ADMIN | View pending KYC list |
| `GET` | `/api/notifications` | Auth | Get notifications (paginated) |
| `GET` | `/actuator/health` | Public | Health check |

📖 **Full API docs**: [docs/API_SPEC.md](docs/API_SPEC.md) or `/swagger-ui/index.html`

---

## 🔔 WebSocket (Real-Time Notifications)

Connect via STOMP/SockJS and subscribe to your notification topic:

```javascript
const client = Stomp.over(new SockJS('/ws'));
client.connect({ Authorization: 'Bearer ' + token }, () => {
    client.subscribe('/topic/notifications/' + userId, msg => {
        console.log('New notification:', JSON.parse(msg.body));
    });
});
```

Notifications are pushed automatically after:
- Any deposit, withdrawal, or transfer
- KYC approval or rejection by staff

---

## 🪪 KYC Workflow

```
Customer                     Staff                      Admin
   │                           │                          │
   │── POST /api/kyc/submit ──►│                          │
   │                     status=PENDING                   │
   │                           │◄── GET /api/kyc/pending ─│
   │                           │                          │
   │◄── WebSocket notify ──────│── PUT /api/kyc/{id}/review
   │   (APPROVED or REJECTED)  │   action=APPROVE|REJECT  │
   │                           │                          │
   │── PUT /{id}/resubmit ────►│  (if REJECTED)           │
   │                   status=RESUBMITTED                  │
```

---

## 🗄️ Database Migrations

| Version | Description |
|---|---|
| V1 | Initial banking schema |
| V2 | Seed demo data |
| V3 | User authentication |
| V4 | Audit log table |
| V5 | Beneficiaries + Notifications |
| V6 | Multi-role seed data |
| V7 | Gamification + Loyalty points |
| V8 | Expanded seed data |
| V9 | Savings accounts + Loans + Cards |
| V10 | Support tickets |
| V11 | **KYC requests table** |

---

## 🧪 Running Tests

```bash
./mvnw.cmd test                    # Windows – all tests
./mvnw test                        # Linux/Mac
./mvnw test -pl . -Dtest=KycServiceTest  # single test class
```

**Test coverage includes:**
- `TransactionServiceTest` – deposit, withdraw, transfer (happy paths + error cases)
- `KycServiceTest` – submit, resubmit, review, getMyKyc (full KYC lifecycle)

---

## 📁 Project Structure

```
BankingSystem/
├── backend/
│   ├── main/java/com/example/BankingSystem/
│   │   ├── annotation/      # @Audit, @RateLimit
│   │   ├── api/             # REST controllers (JSON)
│   │   ├── aspect/          # AOP (AuditAspect)
│   │   ├── config/          # WebSocket, Security, Cache, Flyway
│   │   ├── controller/      # MVC controllers (Thymeleaf views)
│   │   ├── dto/             # Request/Response records
│   │   ├── enums/           # UserRole, KycStatus, TransactionType...
│   │   ├── exception/       # Custom exceptions + global handler
│   │   ├── model/           # JPA entities
│   │   ├── repository/      # Spring Data repositories
│   │   ├── security/        # JWT, OAuth2, RateLimiter
│   │   └── service/         # Business logic
│   └── main/resources/
│       ├── db/migration/    # Flyway SQL migrations (V1–V11)
│       ├── i18n/            # Messages in EN, VI, ZH, JA, KO
│       └── templates/       # Thymeleaf HTML views
├── docs/                    # Technical documentation
│   ├── BRD.md               # Business Requirements
│   ├── SAD.md               # Software Architecture
│   ├── API_SPEC.md          # API Specification
│   ├── DB_DESIGN.md         # Database Design + ERD
│   └── UIUX.md              # UI/UX Guidelines
├── Dockerfile               # Multi-stage Docker build
├── docker-compose.yml       # App + MySQL + Redis
├── .env.example             # Environment variables template
└── pom.xml
```

---

## 🛡️ Security Notes

- Passwords hashed with **BCrypt**
- JWT tokens validated on every request; logout invalidates via **Redis blacklist**
- WebSocket connections authenticated via **JWT on STOMP CONNECT frame**
- Rate limiting on all API endpoints via **Redis sliding window**
- CAPTCHA required on login to prevent brute-force attacks
- OAuth2 social login supported (Google, Facebook, Microsoft, LinkedIn)

---

## 📄 Documentation

| Document | Description |
|---|---|
| [BRD.md](docs/BRD.md) | Business Requirements Document |
| [SAD.md](docs/SAD.md) | Software Architecture Document |
| [API_SPEC.md](docs/API_SPEC.md) | Full API Specification |
| [DB_DESIGN.md](docs/DB_DESIGN.md) | Database Design + ERD |
| [UIUX.md](docs/UIUX.md) | UI/UX Guidelines |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Language | Java 21 |
| Framework | Spring Boot 4.x |
| Security | Spring Security + JWT (jjwt 0.12.6) + OAuth2 |
| Database | MySQL 8.0 + Spring Data JPA / Hibernate |
| Migration | Flyway 10 |
| Cache | Redis 7 + Spring Cache |
| WebSocket | Spring WebSocket + STOMP + SockJS |
| File Storage | Cloudinary |
| API Docs | SpringDoc OpenAPI (Swagger UI) |
| Container | Docker + docker-compose |
| Monitoring | Spring Boot Actuator |
| Build | Maven 3.9 |
