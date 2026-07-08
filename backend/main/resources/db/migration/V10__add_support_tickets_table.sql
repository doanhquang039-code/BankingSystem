-- Migration V10: Them bang support_tickets de luu tru yeu cau ho tro
CREATE TABLE IF NOT EXISTS support_tickets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NULL,
    CONSTRAINT fk_support_tickets_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

-- Seed data tuong ung voi dashboard support
INSERT INTO support_tickets (id, customer_id, title, description, status, created_at)
VALUES 
(1, 1, 'Khóa PIN tạm thời', 'Thẻ bị tạm khóa do nhập sai mã PIN quá 3 lần tại cây ATM.', 'PENDING', NOW(6)),
(2, 6, 'Yêu cầu nâng hạn mức', 'Xin nâng hạn mức giao dịch hàng ngày lên 500 triệu VND để thanh toán bất động sản.', 'PENDING', NOW(6)),
(3, 7, 'Xác minh hồ sơ KYC', 'Hồ sơ mở tài khoản trực tuyến chưa được xác nhận khuôn mặt tự động.', 'PENDING', NOW(6));
