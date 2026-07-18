# Software Architecture Document (SAD)
## Mini Banking System — Oct 2025

---

## 1. Architecture Overview

The Mini Banking System is designed as a **layered monolith with clear module boundaries**, mimicking the isolation of microservices while maintaining simplicity for a team project.

```
┌─────────────────────────────────────────────────────────┐
│                   CLIENTS                                │
│   Browser (Thymeleaf) │ SPA / Mobile │ API Testing       │
└──────────┬──────────────────┬────────────────────────────┘
           │ HTTPS REST       │ STOMP over WebSocket
           ▼                  ▼
┌─────────────────────────────────────────────────────────┐
│               SPRING BOOT APPLICATION                    │
│  ┌──────────┐ ┌────────────┐ ┌─────────────────────┐   │
│  │   Auth   │ │  REST API  │ │  WebSocket / STOMP  │   │
│  │  Layer   │ │ Controllers│ │     Broker (/ws)    │   │
│  └────┬─────┘ └─────┬──────┘ └──────────┬──────────┘   │
│       │             │                    │               │
│  ┌────▼─────────────▼────────────────────▼───────────┐  │
│  │                  SERVICE LAYER                     │  │
│  │  Auth │ Account │ Transaction │ KYC │ Notification │  │
│  │  Loan │ Savings │ Card │ Audit │ Beneficiary       │  │
│  └────────────────────┬───────────────────────────────┘  │
│                       │                                   │
│  ┌────────────────────▼───────────────────────────────┐  │
│  │              REPOSITORY LAYER (Spring Data JPA)    │  │
│  └────────────────────┬───────────────────────────────┘  │
└───────────────────────┼─────────────────────────────────┘
                        │
           ┌────────────┼──────────┐
           ▼            ▼          ▼
        MySQL 8.0    Redis 7   Cloudinary
       (Primary DB) (Cache)   (File Storage)
```

---

## 2. Module Boundaries

Each "service module" within the monolith is independently organized with its own:
Controller → Service → Repository → Model layers.

| Module | Responsibility | Key Entities |
|---|---|---|
| **user-service** | Auth, JWT, OAuth2, roles | User |
| **account-service** | Account CRUD, balance ops | Account, Customer |
| **transaction-service** | Deposit, Withdraw, Transfer | BankTransaction |
| **notification-service** | DB persist + WebSocket push | Notification |
| **kyc-service** | KYC workflow (submit/approve/reject) | KycRequest |
| **log-service** | Audit trail via AOP | AuditLog |

---

## 3. Security Architecture

```
Request
  │
  ▼
JwtFilter (OncePerRequestFilter)
  │  - Extract Bearer token from Authorization header
  │  - Validate signature, expiry
  │  - Check TokenBlacklistService (Redis)
  │  - Set SecurityContext
  ▼
SecurityFilterChain
  │  - Public: /api/auth/**, /ws/**, /swagger-ui/**
  │  - Role-guarded: @PreAuthorize at controller level
  ▼
Controller → Service → Repository

WebSocket STOMP Layer:
  │
  ▼
WebSocketSecurityConfig (ChannelInterceptor)
  │  - Intercepts STOMP CONNECT frames
  │  - Validates JWT from Authorization header
  │  - Sets authentication principal on StompHeaderAccessor
  ▼
STOMP Topic Subscription (/topic/notifications/{userId})
```

### JWT Flow
1. `POST /api/auth/login` → returns `{ token, refreshToken }`
2. Client sends `Authorization: Bearer <token>` on every request
3. `JwtFilter` validates token on each request
4. Logout → token added to Redis blacklist (expires with token TTL)

---

## 4. Real-Time Notification Flow

```
TransactionService.deposit()
  │
  ├─ @Transactional: update balance + save BankTransaction
  │
  └─ notificationService.sendAsync()  [non-blocking @Async]
        │
        ├─ 1. Save Notification entity to MySQL
        │
        └─ 2. SimpMessagingTemplate.convertAndSend(
                  "/topic/notifications/{userId}",
                  NotificationResponse)
                    │
                    └─► WebSocket push to subscribed browser/client
```

---

## 5. KYC Workflow Architecture

```
Customer                  Staff (MANAGER/SUPPORT)         Admin
   │                               │                        │
   │ POST /api/kyc/submit          │                        │
   │ ──────────────────────────►   │                        │
   │                          status=PENDING                │
   │                               │                        │
   │                        GET /api/kyc/pending            │
   │                               │◄───────────────────────│
   │                               │ review list            │
   │                               │                        │
   │                        PUT /api/kyc/{id}/review        │
   │                        action=APPROVE|REJECT            │
   │                               │                        │
   │◄── WebSocket Notification ────┤                        │
   │    (APPROVED or REJECTED)     │                        │
   │                               │                        │
   │ PUT /api/kyc/{id}/resubmit    │                        │ GET /api/kyc/all
   │ (if REJECTED)                 │                        │◄──────────────────
   │ ──────────────────────────►   │                        │
   │                       status=RESUBMITTED               │
   │                               │ (back to review)       │
```

---

## 6. Database Strategy

- **Schema management**: Flyway (versioned SQL migrations V1 – V11)
- **ORM**: Spring Data JPA with Hibernate (DDL = none)
- **Transaction boundaries**: `@Transactional` on service methods; `readOnly=true` for read queries
- **Deadlock prevention**: Transfer locks accounts in alphabetical account-number order
- **Optimistic locking**: Not yet implemented (future: `@Version` fields)

---

## 7. Technology Stack Decisions

| Technology | Choice | Rationale |
|---|---|---|
| Framework | Spring Boot 4.x | Mature ecosystem, auto-configuration, production-ready |
| Auth | Spring Security + JWT (jjwt) | Stateless, horizontally scalable |
| Social Auth | Spring OAuth2 Client | Native Spring integration |
| ORM | Spring Data JPA / Hibernate | Reduce boilerplate, type-safe queries |
| DB Migration | Flyway | Version-controlled schema, team collaboration |
| WebSocket | Spring WebSocket + STOMP | Browser-compatible, SockJS fallback |
| Cache | Spring Cache + Redis | Token blacklist, response caching |
| File Storage | Cloudinary | CDN-backed, simple Java SDK |
| Docs | SpringDoc OpenAPI (Swagger) | Auto-generated from code annotations |
| Containerization | Docker + docker-compose | Reproducible environments |
| Build | Maven 3.9 | Standard Java build tool |
