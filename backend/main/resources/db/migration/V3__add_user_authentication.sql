-- Migration V3: Thêm bảng users để quản lý authentication và authorization

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL COMMENT 'BCrypt encoded password',
    email VARCHAR(160) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL COMMENT 'ADMIN, CUSTOMER, EMPLOYEE',
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    customer_id BIGINT NULL COMMENT 'Link to customer if role is CUSTOMER',
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NULL,
    last_login DATETIME(6) NULL,
    CONSTRAINT fk_users_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

-- Indexes để tăng performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_customer_id ON users(customer_id);

-- Thêm user admin mặc định (password: admin123)
INSERT INTO users (username, password, email, role, enabled, created_at)
SELECT 'admin', '$2a$10$N9qo8uLOickgx2ZMRZoMye0H0PIVmSYXIzCgNTnK/8kIQAaqZRSKu', 'admin@bank.com', 'ADMIN', TRUE, NOW(6)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');

-- Thêm user cho các customers hiện có
INSERT INTO users (username, password, email, role, enabled, customer_id, created_at)
SELECT 
    'an.nguyen', 
    '$2a$10$N9qo8uLOickgx2ZMRZoMye0H0PIVmSYXIzCgNTnK/8kIQAaqZRSKu',
    'an.nguyen@example.com',
    'CUSTOMER',
    TRUE,
    1,
    NOW(6)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'an.nguyen');

INSERT INTO users (username, password, email, role, enabled, customer_id, created_at)
SELECT 
    'binh.tran', 
    '$2a$10$N9qo8uLOickgx2ZMRZoMye0H0PIVmSYXIzCgNTnK/8kIQAaqZRSKu',
    'binh.tran@example.com',
    'CUSTOMER',
    TRUE,
    2,
    NOW(6)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'binh.tran');

INSERT INTO users (username, password, email, role, enabled, customer_id, created_at)
SELECT 
    'chau.le', 
    '$2a$10$N9qo8uLOickgx2ZMRZoMye0H0PIVmSYXIzCgNTnK/8kIQAaqZRSKu',
    'chau.le@example.com',
    'CUSTOMER',
    TRUE,
    3,
    NOW(6)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'chau.le');
