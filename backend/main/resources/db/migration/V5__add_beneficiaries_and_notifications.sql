-- ============================================================
-- Migration V5: Thêm bảng beneficiaries và notifications
-- ============================================================

-- ------------------------------------------------------------
-- Bảng beneficiaries: Danh sách người nhận chuyển khoản nhanh
-- Cho phép user lưu tài khoản thường dùng để chuyển tiền nhanh
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS beneficiaries (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    alias           VARCHAR(100)  NOT NULL   COMMENT 'Tên gợi nhớ VD: "Vợ", "Tiền nhà"',
    account_number  VARCHAR(32)   NOT NULL   COMMENT 'Số tài khoản người nhận',
    bank_name       VARCHAR(100)  NOT NULL   COMMENT 'Tên ngân hàng VD: Vietcombank, BIDV',
    beneficiary_name VARCHAR(120) NOT NULL   COMMENT 'Tên chủ tài khoản người nhận',
    is_active       BOOLEAN       NOT NULL DEFAULT TRUE,
    owner_user_id   BIGINT        NOT NULL   COMMENT 'User sở hữu danh sách này',
    created_at      DATETIME(6)   NOT NULL,
    updated_at      DATETIME(6)   NULL,

    CONSTRAINT fk_beneficiaries_user FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_beneficiaries_owner   ON beneficiaries(owner_user_id);
CREATE INDEX idx_beneficiaries_account ON beneficiaries(account_number);
CREATE INDEX idx_beneficiaries_active  ON beneficiaries(owner_user_id, is_active);

-- ------------------------------------------------------------
-- Bảng notifications: Thông báo trong ứng dụng cho từng user
-- Thông báo số dư thay đổi, chuyển tiền thành công, đăng nhập mới...
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    type        VARCHAR(30)   NOT NULL   COMMENT 'CREDIT, DEBIT, LOGIN, SYSTEM, SECURITY_ALERT',
    title       VARCHAR(200)  NOT NULL   COMMENT 'Tiêu đề thông báo',
    body        VARCHAR(500)  NOT NULL   COMMENT 'Nội dung chi tiết',
    is_read     BOOLEAN       NOT NULL DEFAULT FALSE,
    user_id     BIGINT        NOT NULL   COMMENT 'User nhận thông báo',
    ref_type    VARCHAR(50)   NULL       COMMENT 'Loại đối tượng liên quan: transactions, accounts...',
    ref_id      BIGINT        NULL       COMMENT 'ID đối tượng liên quan',
    created_at  DATETIME(6)   NOT NULL,
    read_at     DATETIME(6)   NULL,

    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_user       ON notifications(user_id);
CREATE INDEX idx_notifications_unread     ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_type       ON notifications(type);

-- ------------------------------------------------------------
-- Seed data mẫu cho notifications
-- ------------------------------------------------------------
INSERT INTO notifications (type, title, body, is_read, user_id, ref_type, ref_id, created_at)
SELECT
    'CREDIT',
    'Tiền vào tài khoản',
    'Tài khoản 100000000001 vừa nhận +15,000,000 VND. Số dư hiện tại: 15,000,000 VND.',
    FALSE,
    (SELECT id FROM users WHERE username = 'an.nguyen' LIMIT 1),
    'transactions', 1, NOW(6)
WHERE EXISTS (SELECT 1 FROM users WHERE username = 'an.nguyen');

INSERT INTO notifications (type, title, body, is_read, user_id, ref_type, ref_id, created_at)
SELECT
    'DEBIT',
    'Chuyển khoản thành công',
    'Bạn vừa chuyển 500,000 VND đến tài khoản 100000000002. Số dư còn lại: 14,500,000 VND.',
    FALSE,
    (SELECT id FROM users WHERE username = 'an.nguyen' LIMIT 1),
    'transactions', 3, NOW(6)
WHERE EXISTS (SELECT 1 FROM users WHERE username = 'an.nguyen');

INSERT INTO notifications (type, title, body, is_read, user_id, ref_type, ref_id, created_at)
SELECT
    'SYSTEM',
    'Chào mừng đến BankingSystem!',
    'Tài khoản của bạn đã được kích hoạt. Hãy khám phá các tính năng chuyển khoản, giao dịch nhanh.',
    TRUE,
    (SELECT id FROM users WHERE username = 'admin' LIMIT 1),
    NULL, NULL, NOW(6)
WHERE EXISTS (SELECT 1 FROM users WHERE username = 'admin');

-- Seed beneficiaries mẫu cho user an.nguyen
INSERT INTO beneficiaries (alias, account_number, bank_name, beneficiary_name, is_active, owner_user_id, created_at)
SELECT
    'Chuyển nội bộ Binh',
    '100000000002',
    'BankingSystem',
    'Tran Thi Binh',
    TRUE,
    (SELECT id FROM users WHERE username = 'an.nguyen' LIMIT 1),
    NOW(6)
WHERE EXISTS (SELECT 1 FROM users WHERE username = 'an.nguyen');
