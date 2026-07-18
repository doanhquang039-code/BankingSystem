# API Specification
## Mini Banking System — Oct 2025

**Base URL**: `http://localhost:8080`  
**Interactive Docs**: `http://localhost:8080/swagger-ui/index.html`  
**Authentication**: `Authorization: Bearer <JWT_TOKEN>`

---

## Authentication

### POST `/api/auth/login`
Login and receive JWT token.

**Request**
```json
{
  "username": "john_doe",
  "password": "P@ssw0rd!"
}
```
**Response `200 OK`**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "username": "john_doe",
  "role": "CUSTOMER",
  "expiresIn": 86400000
}
```

### POST `/api/auth/register`
Register a new Customer account.

**Request**
```json
{
  "username": "jane_doe",
  "password": "P@ssw0rd!",
  "email": "jane@example.com",
  "fullName": "Jane Doe",
  "phone": "0901234567"
}
```

### POST `/api/auth/logout`
Blacklist the current JWT token (requires `Authorization` header).

**Response `200 OK`**: `{ "message": "Logged out successfully" }`

---

## Accounts

> Role required: **CUSTOMER** (own accounts), **STAFF/ADMIN** (all accounts)

### GET `/api/accounts`
Get all accounts for the authenticated customer.

### GET `/api/accounts/{accountNumber}`
Get account details by account number.

### POST `/api/accounts`
Create a new account for a customer (Staff/Admin only).

**Request**
```json
{
  "customerId": 1,
  "type": "CHECKING"
}
```

---

## Transactions

> Role required: **CUSTOMER** (own accounts), **ADMIN** (all)

### POST `/api/transactions/deposit`
Deposit money into an account.

**Request**
```json
{
  "accountNumber": "ACC000001",
  "amount": 5000000,
  "description": "Initial deposit"
}
```
**Response `200 OK`**: `TransactionResponse`

### POST `/api/transactions/withdraw`
Withdraw money from an account.

**Request**
```json
{
  "accountNumber": "ACC000001",
  "amount": 1000000,
  "description": "ATM withdrawal"
}
```

### POST `/api/transactions/transfer`
Transfer between two accounts.

**Request**
```json
{
  "fromAccountNumber": "ACC000001",
  "toAccountNumber": "ACC000002",
  "amount": 2000000,
  "description": "Rent payment"
}
```

### GET `/api/transactions/{accountNumber}`
Get transaction history for an account (paginated).

**Query Params**: `page=0&size=20`

---

## KYC (Know Your Customer)

### POST `/api/kyc/submit`
> Role: **CUSTOMER**

Customer submits KYC for the first time.

**Request**
```json
{
  "fullName": "Nguyen Van A",
  "idNumber": "001085012345",
  "idType": "CCCD",
  "frontImageUrl": "https://res.cloudinary.com/bank/image/upload/front.jpg",
  "backImageUrl": "https://res.cloudinary.com/bank/image/upload/back.jpg",
  "selfieUrl": "https://res.cloudinary.com/bank/image/upload/selfie.jpg"
}
```
**Response `201 Created`**: `KycResponse`

### GET `/api/kyc/my`
> Role: **CUSTOMER**

Get own KYC status.

**Response `200 OK`**
```json
{
  "id": 1,
  "customerId": 5,
  "customerName": "Nguyen Van A",
  "status": "PENDING",
  "createdAt": "2025-10-01T10:00:00"
}
```

### PUT `/api/kyc/{id}/resubmit`
> Role: **CUSTOMER**

Resubmit after rejection (same body as `/submit`).

### GET `/api/kyc/pending`
> Role: **MANAGER, SUPPORT, ADMIN**

Get list of KYC in PENDING status (paginated).

**Query Params**: `page=0&size=20`

### GET `/api/kyc/resubmitted`
> Role: **MANAGER, SUPPORT, ADMIN**

Get list of resubmitted KYC.

### PUT `/api/kyc/{id}/review`
> Role: **MANAGER, SUPPORT, ADMIN**

Approve or reject a KYC request.

**Request**
```json
{
  "action": "REJECT",
  "rejectionReason": "ID card image is blurry. Please resubmit with clearer photos."
}
```

**Response `200 OK`**: Updated `KycResponse` with `status=REJECTED`

### GET `/api/kyc/all`
> Role: **ADMIN**

View all KYC records (paginated).

---

## Notifications

### GET `/api/notifications`
Get notifications for current user (paginated).

**Query Params**: `page=0&size=20`

### GET `/api/notifications/unread-count`
Get count of unread notifications.

**Response**: `{ "count": 3 }`

### PUT `/api/notifications/{id}/read`
Mark a specific notification as read.

### PUT `/api/notifications/read-all`
Mark all notifications as read.

---

## WebSocket (STOMP)

**Endpoint**: `ws://localhost:8080/ws` (SockJS fallback available)

### Connection
```javascript
const socket = new SockJS('/ws');
const client = Stomp.over(socket);

client.connect(
  { Authorization: 'Bearer ' + jwtToken },
  () => {
    // Subscribe to personal notification topic
    client.subscribe('/topic/notifications/' + userId, (message) => {
      const notification = JSON.parse(message.body);
      console.log('New notification:', notification);
    });
  }
);
```

### Notification Payload
```json
{
  "id": 42,
  "type": "CREDIT",
  "title": "Tiền vào tài khoản",
  "body": "Tài khoản ACC000001 nhận +5,000,000 VND. Số dư: 10,000,000 VND.",
  "isRead": false,
  "refType": "transactions",
  "refId": 17,
  "createdAt": "2025-10-01T14:30:00"
}
```

---

## Error Responses

All errors follow a standard format:

```json
{
  "timestamp": "2025-10-01T14:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "transaction.insufficient_balance",
  "path": "/api/transactions/withdraw"
}
```

| HTTP Status | Meaning |
|---|---|
| `400` | Bad Request – validation error or business rule violation |
| `401` | Unauthorized – missing or invalid JWT |
| `403` | Forbidden – insufficient role |
| `404` | Not Found – resource does not exist |
| `409` | Conflict – duplicate resource (e.g., username already taken) |
| `500` | Internal Server Error |
