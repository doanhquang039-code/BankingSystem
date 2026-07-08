-- Migration V8: Mở rộng dữ liệu mẫu với nhiều khách hàng, tài khoản và giao dịch mới

-- 1. Thêm khách hàng mới
INSERT IGNORE INTO customers (id, full_name, email, phone, loyalty_points, created_at)
VALUES 
(6, 'Doanh Quang Huy', 'huy.doanh@example.com', '0901000006', 150, '2026-07-07 15:00:00.000'),
(7, 'Tran Tien Dat', 'dat.tran@example.com', '0901000007', 80, '2026-07-07 15:00:00.000'),
(8, 'Le Anh Tuan', 'tuan.le@example.com', '0901000008', 320, '2026-07-07 15:00:00.000'),
(9, 'Nguyen Minh Tu', 'tu.nguyen@example.com', '0901000009', 40, '2026-07-07 15:00:00.000'),
(10, 'Vuong Chi Kien', 'kien.vuong@example.com', '0901000010', 0, '2026-07-07 15:00:00.000');

-- 2. Thêm Users tương ứng (mật khẩu mặc định: admin123)
INSERT IGNORE INTO users (username, password, email, role, enabled, customer_id, created_at)
VALUES 
('huy.doanh', '$2a$10$N9qo8uLOickgx2ZMRZoMye0H0PIVmSYXIzCgNTnK/8kIQAaqZRSKu', 'huy.doanh@example.com', 'CUSTOMER', TRUE, 6, '2026-07-07 15:00:00.000'),
('dat.tran', '$2a$10$N9qo8uLOickgx2ZMRZoMye0H0PIVmSYXIzCgNTnK/8kIQAaqZRSKu', 'dat.tran@example.com', 'CUSTOMER', TRUE, 7, '2026-07-07 15:00:00.000'),
('tuan.le', '$2a$10$N9qo8uLOickgx2ZMRZoMye0H0PIVmSYXIzCgNTnK/8kIQAaqZRSKu', 'tuan.le@example.com', 'CUSTOMER', TRUE, 8, '2026-07-07 15:00:00.000'),
('tu.nguyen', '$2a$10$N9qo8uLOickgx2ZMRZoMye0H0PIVmSYXIzCgNTnK/8kIQAaqZRSKu', 'tu.nguyen@example.com', 'CUSTOMER', TRUE, 9, '2026-07-07 15:00:00.000'),
('kien.vuong', '$2a$10$N9qo8uLOickgx2ZMRZoMye0H0PIVmSYXIzCgNTnK/8kIQAaqZRSKu', 'kien.vuong@example.com', 'CUSTOMER', TRUE, 10, '2026-07-07 15:00:00.000');

-- 3. Mở các tài khoản ngân hàng mới
INSERT IGNORE INTO accounts (id, account_number, balance, status, created_at, customer_id)
VALUES 
(6, '100000000006', 75000000.00, 'ACTIVE', '2026-06-07 10:00:00.000', 6),
(7, '100000000007', 8400000.00, 'ACTIVE', '2026-06-17 12:00:00.000', 7),
(8, '100000000008', 198000000.00, 'ACTIVE', '2026-05-23 09:00:00.000', 8),
(9, '100000000009', 240000.00, 'ACTIVE', '2026-07-02 18:00:00.000', 9),
(10, '100000000010', 0.00, 'ACTIVE', '2026-07-07 15:00:00.000', 10),
(11, '100000000011', 12500000.00, 'ACTIVE', '2026-06-22 14:00:00.000', 6),
(12, '100000000012', 30000000.00, 'ACTIVE', '2026-06-12 16:30:00.000', 8);

-- 4. Nạp tiền khởi tạo cho các tài khoản mới
INSERT IGNORE INTO transactions (id, type, status, amount, description, source_account_id, destination_account_id, created_at)
VALUES 
(10, 'DEPOSIT', 'COMPLETED', 75000000.00, 'Nap so du ban dau', NULL, 6, '2026-06-07 10:05:00.000'),
(11, 'DEPOSIT', 'COMPLETED', 8400000.00, 'Luong thang 6', NULL, 7, '2026-06-17 12:05:00.000'),
(12, 'DEPOSIT', 'COMPLETED', 198000000.00, 'Tiet kiem ca nhan', NULL, 8, '2026-05-23 09:05:00.000'),
(13, 'DEPOSIT', 'COMPLETED', 240000.00, 'Nap tien dien thoai du', NULL, 9, '2026-07-02 18:05:00.000'),
(14, 'DEPOSIT', 'COMPLETED', 12500000.00, 'Quy phu Huy', NULL, 11, '2026-06-22 14:05:00.000'),
(15, 'DEPOSIT', 'COMPLETED', 30000000.00, 'Nop tien mat tai quay', NULL, 12, '2026-06-12 16:35:00.000');

-- 5. Seed chuỗi giao dịch chuyển khoản phong phú qua lại cho các tài khoản
INSERT IGNORE INTO transactions (type, status, amount, description, source_account_id, destination_account_id, created_at)
VALUES 
('TRANSFER', 'COMPLETED', 1200000.00, 'Tien dien nuoc', 6, 1, '2026-06-23 08:30:00.000'),
('TRANSFER', 'COMPLETED', 500000.00, 'Mua sach online', 6, 2, '2026-06-25 10:15:00.000'),
('TRANSFER', 'COMPLETED', 2500000.00, 'Tien nha thang 6', 6, 8, '2026-06-27 11:20:00.000'),
('TRANSFER', 'COMPLETED', 150000.00, 'Ca phe sang', 6, 7, '2026-06-29 14:45:00.000'),
('TRANSFER', 'COMPLETED', 8000000.00, 'Chuyen quy tiet kiem', 6, 11, '2026-07-02 09:10:00.000'),
('TRANSFER', 'COMPLETED', 450000.00, 'Di sieu thi Co.op', 6, 3, '2026-07-04 16:40:00.000'),
('TRANSFER', 'COMPLETED', 2000000.00, 'Tra no ban Huy', 7, 6, '2026-06-19 15:00:00.000'),
('TRANSFER', 'COMPLETED', 120000.00, 'An trua van phong', 7, 1, '2026-06-22 12:00:00.000'),
('TRANSFER', 'COMPLETED', 3000000.00, 'Mua tai nghe bluetooth', 7, 8, '2026-07-02 17:55:00.000'),
('TRANSFER', 'COMPLETED', 20000000.00, 'Chuyen tien mua laptop', 8, 6, '2026-06-15 08:00:00.000'),
('TRANSFER', 'COMPLETED', 15000000.00, 'Mua xe may cu', 8, 4, '2026-06-17 10:20:00.000'),
('TRANSFER', 'COMPLETED', 5000000.00, 'Bieu bo me o que', 8, 2, '2026-06-22 11:00:00.000'),
('TRANSFER', 'COMPLETED', 1200000.00, 'Dong hoc phi ngoai ngu', 8, 1, '2026-06-27 13:40:00.000'),
('TRANSFER', 'COMPLETED', 10000000.00, 'Chuyen sang TK phu', 8, 12, '2026-06-29 15:15:00.000'),
('TRANSFER', 'COMPLETED', 3500000.00, 'Mua dien thoai cu', 8, 7, '2026-07-05 09:00:00.000'),
('TRANSFER', 'COMPLETED', 1500000.00, 'Ung ho quy tu thien', 1, 8, '2026-06-12 10:00:00.000'),
('TRANSFER', 'COMPLETED', 5000000.00, 'Chuyen khoan lam qua sinh nhat', 4, 6, '2026-06-21 16:00:00.000'),
('TRANSFER', 'COMPLETED', 2800000.00, 'Thanh toan tien internet', 12, 1, '2026-06-22 09:30:00.000'),
('TRANSFER', 'COMPLETED', 4500000.00, 'Dich vu spa cham soc da', 11, 2, '2026-06-25 14:00:00.000'),
('TRANSFER', 'COMPLETED', 10000000.00, 'Chuyen khoan nhanh 247', 6, 8, '2026-07-06 10:00:00.000');

-- 6. Seed thêm các bài học mới cho phần Gamification ngoại ngữ
INSERT INTO lessons (title, content, question, options, correct_answer, points_reward)
VALUES 
('Tiếng Anh Đàm Phán Hợp Đồng', 'Trong đàm phán thương mại: "Contract" là Hợp đồng. "Agreement" là Thỏa thuận. "Terms and Conditions" là Điều khoản và Điều kiện. "Signature" là Chữ ký.', 'Từ "Contract" có nghĩa là gì?', 'Đàm phán,Hợp đồng,Chữ ký,Thỏa thuận', 'Hợp đồng', 80),
('Tiếng Trung Giao Dịch Ngoại Tệ', 'Từ vựng tiếng Trung: "Wàibì" (外币) nghĩa là Ngoại tệ. "Huilǜ" (汇率) nghĩa là Tỷ giá. "Duihuàn" (兑换) nghĩa là Quy đổi.', 'Chữ "汇率" (Huilǜ) trong tiếng Trung có nghĩa là gì?', 'Ngoại tệ,Tài khoản,Tỷ giá,Quy đổi', 'Tỷ giá', 70),
('Tiếng Nhật Nghiệp Vụ Tín Dụng', 'Tiếng Nhật tín dụng: "Yuushi" (融資) nghĩa là Cho vay/Tín dụng. "Kariire" (借入) nghĩa là Khoản vay. "Kinri" (金利) nghĩa là Lãi suất.', 'Từ "金利" (Kinri) nghĩa là gì?', 'Lãi suất,Khoản vay,Cho vay,Thế chấp', 'Lãi suất', 90);
