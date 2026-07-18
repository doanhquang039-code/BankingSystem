# Business Requirements Document (BRD)
## Mini Banking System — Oct 2025

---

## 1. Executive Summary

The **Mini Banking System** is a backend service that digitizes core retail banking operations.
It provides a secure, scalable platform for managing customer accounts, processing financial transactions, verifying customer identity (KYC), and delivering real-time notifications.

---

## 2. Business Context & Stakeholders

| Stakeholder | Role | Primary Concern |
|---|---|---|
| Bank Administrators | System owners | Oversight, compliance, audit trails |
| Bank Staff (Tellers) | Day-to-day operators | Customer management, KYC review |
| Customers | End users | Account access, transactions, notifications |
| Compliance Team | Regulatory | Audit logs, KYC enforcement |
| IT Operations | Infra | Availability, deployment, monitoring |

---

## 3. Functional Requirements

### 3.1 Authentication & Authorization
| ID | Requirement |
|---|---|
| FR-AUTH-01 | Users authenticate via username/password with JWT token response |
| FR-AUTH-02 | Social login via Google, Facebook, Microsoft, LinkedIn (OAuth2) |
| FR-AUTH-03 | Three primary roles: **Customer**, **Staff** (Manager/Support), **Admin** |
| FR-AUTH-04 | Role-based access control enforced at both API and method level |
| FR-AUTH-05 | JWT tokens expire after 24h; token blacklist on logout |

### 3.2 Account Management
| ID | Requirement |
|---|---|
| FR-ACC-01 | Customers can hold multiple accounts (checking, savings) |
| FR-ACC-02 | Staff/Admin can create, view, activate, and deactivate accounts |
| FR-ACC-03 | Account numbers are system-generated and unique |
| FR-ACC-04 | Account balance is always non-negative (enforced at service layer) |

### 3.3 Transaction Processing
| ID | Requirement |
|---|---|
| FR-TXN-01 | Supported transaction types: **Deposit**, **Withdrawal**, **Transfer** |
| FR-TXN-02 | All transactions are atomic — partial updates are not allowed |
| FR-TXN-03 | Transfer between same account is rejected |
| FR-TXN-04 | Deadlock prevention: accounts locked in alphabetical order during transfer |
| FR-TXN-05 | Transaction history is paginated and sortable by date |

### 3.4 KYC (Know Your Customer) Workflow
| ID | Requirement |
|---|---|
| FR-KYC-01 | Customers must submit KYC before full account privileges |
| FR-KYC-02 | KYC submission includes: full name, ID number, ID type, front/back/selfie images |
| FR-KYC-03 | Staff reviews submitted KYC and approves or rejects with a reason |
| FR-KYC-04 | Customer receives notification on approval or rejection |
| FR-KYC-05 | Rejected customers can correct and resubmit their KYC |
| FR-KYC-06 | Admin can view all KYC records across all customers |

### 3.5 Real-Time Notifications (WebSocket)
| ID | Requirement |
|---|---|
| FR-NTF-01 | System pushes real-time notifications via STOMP over WebSocket |
| FR-NTF-02 | Notifications are triggered by: transactions (deposit/withdraw/transfer) and KYC status changes |
| FR-NTF-03 | Notifications are persisted to DB (accessible via REST API) |
| FR-NTF-04 | Users can mark notifications as read (individually or all) |
| FR-NTF-05 | WebSocket connections are authenticated via JWT on STOMP CONNECT |

### 3.6 Beneficiary Management
| ID | Requirement |
|---|---|
| FR-BNF-01 | Customers can save frequent transfer targets as beneficiaries |
| FR-BNF-02 | Beneficiary records store alias, account number, bank name |

### 3.7 Audit Logging
| ID | Requirement |
|---|---|
| FR-AUD-01 | All critical actions (transactions, logins, KYC reviews) generate audit log entries |
| FR-AUD-02 | Audit logs are read-only and accessible to Admin and Auditor roles only |
| FR-AUD-03 | Audit logs capture: action, actor, timestamp, affected resource |

---

## 4. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Security** | All endpoints require JWT authentication; WebSocket authenticated at STOMP layer |
| **Performance** | Transaction APIs respond within 500ms under normal load |
| **Reliability** | Database transactions use proper isolation; no lost updates on concurrent transfers |
| **Scalability** | Stateless JWT design enables horizontal scaling |
| **Observability** | Structured logging; AOP-based audit trail |
| **Portability** | Docker + docker-compose for reproducible deployment |
| **Data Integrity** | Flyway manages all schema changes via versioned SQL migrations |

---

## 5. Constraints & Assumptions

- Primary database: MySQL 8.0
- Cache: Redis 7 (token blacklist, Spring Cache)
- File storage: Cloudinary (KYC images)
- Build tool: Maven 3.9, Java 21
- Framework: Spring Boot 4.x
