-- Migration V6: Seed du lieu mau cho 5 role he thong va cac giao dich thu nghiem

-- 1. Them cac users cho Manager, Support, Auditor (tat ca co password mac dinh: admin123)
INSERT IGNORE INTO users (username, password, email, role, enabled, created_at)
VALUES ('manager', '$2a$10$N9qo8uLOickgx2ZMRZoMye0H0PIVmSYXIzCgNTnK/8kIQAaqZRSKu', 'manager@bank.com', 'MANAGER', TRUE, NOW(6));

INSERT IGNORE INTO users (username, password, email, role, enabled, created_at)
VALUES ('support', '$2a$10$N9qo8uLOickgx2ZMRZoMye0H0PIVmSYXIzCgNTnK/8kIQAaqZRSKu', 'support@bank.com', 'SUPPORT', TRUE, NOW(6));

INSERT IGNORE INTO users (username, password, email, role, enabled, created_at)
VALUES ('auditor', '$2a$10$N9qo8uLOickgx2ZMRZoMye0H0PIVmSYXIzCgNTnK/8kIQAaqZRSKu', 'auditor@bank.com', 'AUDITOR', TRUE, NOW(6));

-- 2. Them khach hang moi
INSERT IGNORE INTO customers (id, full_name, email, phone, created_at)
VALUES (4, 'Hoang Duc Thang', 'thang.hoang@example.com', '0901000004', NOW(6));

INSERT IGNORE INTO customers (id, full_name, email, phone, created_at)
VALUES (5, 'Pham Phuong Thao', 'thao.pham@example.com', '0901000005', NOW(6));

-- 3. Them users cho khach hang moi (password mac dinh: admin123)
INSERT IGNORE INTO users (username, password, email, role, enabled, customer_id, created_at)
VALUES ('thang.hoang', '$2a$10$N9qo8uLOickgx2ZMRZoMye0H0PIVmSYXIzCgNTnK/8kIQAaqZRSKu', 'thang.hoang@example.com', 'CUSTOMER', TRUE, 4, NOW(6));

INSERT IGNORE INTO users (username, password, email, role, enabled, customer_id, created_at)
VALUES ('thao.pham', '$2a$10$N9qo8uLOickgx2ZMRZoMye0H0PIVmSYXIzCgNTnK/8kIQAaqZRSKu', 'thao.pham@example.com', 'CUSTOMER', TRUE, 5, NOW(6));

-- 4. Mo tai khoan ngan hang cho cac khach hang moi
INSERT IGNORE INTO accounts (id, account_number, balance, status, created_at, customer_id)
VALUES (4, '100000000004', 45000000.00, 'ACTIVE', NOW(6), 4);

INSERT IGNORE INTO accounts (id, account_number, balance, status, created_at, customer_id)
VALUES (5, '100000000005', 1200000.00, 'ACTIVE', NOW(6), 5);

-- 5. Nap tien khoi tao vao cac tai khoan moi
INSERT IGNORE INTO transactions (type, status, amount, description, source_account_id, destination_account_id, created_at)
VALUES ('DEPOSIT', 'COMPLETED', 45000000.00, 'Khoi tao so du lon', NULL, 4, NOW(6));

INSERT IGNORE INTO transactions (type, status, amount, description, source_account_id, destination_account_id, created_at)
VALUES ('DEPOSIT', 'COMPLETED', 1200000.00, 'Nop tien mat ban dau', NULL, 5, NOW(6));

-- 6. Seed cac giao dich chuyen khoan thu nghiem qua lai giua cac ben
INSERT IGNORE INTO transactions (type, status, amount, description, source_account_id, destination_account_id, created_at)
VALUES ('TRANSFER', 'COMPLETED', 2000000.00, 'Chuyen tien mua hang', 4, 1, NOW(6));

INSERT IGNORE INTO transactions (type, status, amount, description, source_account_id, destination_account_id, created_at)
VALUES ('TRANSFER', 'COMPLETED', 500000.00, 'Tien an trua', 1, 5, NOW(6));

INSERT IGNORE INTO transactions (type, status, amount, description, source_account_id, destination_account_id, created_at)
VALUES ('TRANSFER', 'COMPLETED', 100000.00, 'Giao dich nho', 5, 2, NOW(6));

-- 7. Seed ghi logs mau vao bang audit_log
INSERT INTO audit_log (action, performed_by, description, created_at)
VALUES ('USER_LOGIN', 'manager', 'Nguoi dung manager dang nhap vao he thong kiem soat', NOW(6)),
       ('USER_LOGIN', 'auditor', 'Kiem toan vien dang nhap vao xem audit logs', NOW(6)),
       ('ACCOUNT_FREEZE', 'admin', 'Khoa tai khoan nghi ngo 100000000005', NOW(6));
