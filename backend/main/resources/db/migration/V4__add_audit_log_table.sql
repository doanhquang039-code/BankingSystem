-- Migration V4: Thêm bảng audit_log để ghi lại lịch sử thao tác
-- File này được Flyway tự động detect và chạy khi app khởi động

CREATE TABLE IF NOT EXISTS audit_log (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    action      VARCHAR(50)  NOT NULL COMMENT 'Ví dụ: LOGIN, TRANSFER, DEPOSIT, WITHDRAW',
    entity_type VARCHAR(50)  NULL     COMMENT 'Tên bảng/entity liên quan: accounts, customers...',
    entity_id   BIGINT       NULL     COMMENT 'ID của entity bị tác động',
    performed_by VARCHAR(50) NOT NULL COMMENT 'Username thực hiện thao tác',
    ip_address  VARCHAR(45)  NULL     COMMENT 'Địa chỉ IP người dùng',
    description VARCHAR(500) NULL     COMMENT 'Mô tả chi tiết thao tác',
    created_at  DATETIME(6)  NOT NULL
);

-- Indexes để tìm kiếm nhanh
CREATE INDEX idx_audit_log_performed_by ON audit_log(performed_by);
CREATE INDEX idx_audit_log_action       ON audit_log(action);
CREATE INDEX idx_audit_log_entity       ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_created_at   ON audit_log(created_at);

-- Thêm vài bản ghi mẫu
INSERT INTO audit_log (action, entity_type, entity_id, performed_by, ip_address, description, created_at)
VALUES
    ('LOGIN',    NULL,         NULL, 'admin',     '127.0.0.1', 'Admin đăng nhập hệ thống',         NOW(6)),
    ('LOGIN',    NULL,         NULL, 'an.nguyen',  '127.0.0.1', 'Khách hàng an.nguyen đăng nhập',  NOW(6)),
    ('TRANSFER', 'accounts',   1,    'an.nguyen',  '127.0.0.1', 'Chuyển 500,000 VND sang tài khoản 100000000002', NOW(6));
