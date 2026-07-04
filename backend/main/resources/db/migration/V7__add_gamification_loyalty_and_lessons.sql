-- Migration V7: Them he thong Gamification - Tich diem, Doi voucher va Hoc ngoai ngu

-- 1. Them cot loyalty_points vao bang customers
ALTER TABLE customers ADD COLUMN loyalty_points INT NOT NULL DEFAULT 0;

-- 2. Tao bang vouchers
CREATE TABLE IF NOT EXISTS vouchers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(150) NOT NULL,
    discount_amount DECIMAL(15, 2) NOT NULL,
    point_cost INT NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    customer_id BIGINT NULL,
    CONSTRAINT fk_vouchers_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

-- 3. Tao bang lessons (Bai hoc ngoai ngu)
CREATE TABLE IF NOT EXISTS lessons (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    question VARCHAR(300) NOT NULL,
    options VARCHAR(300) NOT NULL COMMENT 'Cac dap an cach nhau bang dau phay',
    correct_answer VARCHAR(100) NOT NULL,
    points_reward INT NOT NULL DEFAULT 10
);

-- 4. Tao bang customer_lessons (Lich su hoc tap cua tung khach hang)
CREATE TABLE IF NOT EXISTS customer_lessons (
    customer_id BIGINT NOT NULL,
    lesson_id BIGINT NOT NULL,
    completed_at DATETIME(6) NOT NULL,
    PRIMARY KEY (customer_id, lesson_id),
    CONSTRAINT fk_cust_lessons_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    CONSTRAINT fk_cust_lessons_lesson FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

-- 5. Nap du lieu mau cho cac Bai hoc tu vung ngoai ngu (Lessons)
INSERT INTO lessons (title, content, question, options, correct_answer, points_reward)
VALUES 
('Tiếng Anh Giao Tiếp Nâng Cao', 'Trong tiếng Anh tài chính, "Deposit" nghĩa là Tiền gửi hoặc Nạp tiền. "Withdrawal" nghĩa là Rút tiền. "Transaction" nghĩa là Giao dịch.', 'Từ "Withdrawal" trong tiếng Anh tài chính có nghĩa là gì?', 'Tiền gửi,Rút tiền,Giao dịch,Chuyển khoản', 'Rút tiền', 50),
('Tiếng Nhật Ngân Hàng Cơ Bản', 'Trong tiếng Nhật: "Ginkou" (銀行) nghĩa là Ngân hàng. "Kouza" (口座) nghĩa là Tài khoản. "Soukin" (送金) nghĩa là Chuyển khoản.', 'Chữ Hán 銀行 (Ginkou) có nghĩa là gì?', 'Bưu điện,Ngân hàng,Siêu thị,Nhà sách', 'Ngân hàng', 60),
('Tiếng Hàn Tài Chính Dụng Cụ', 'Từ vựng tiếng Hàn: "Gyye-jwa" (계좌) nghĩa là Tài khoản. "Song-gum" (송금) nghĩa là Chuyển khoản. "Jadong-yicje" (자동이체) nghĩa là Chuyển khoản tự động.', 'Từ "계좌" (Gyye-jwa) trong tiếng Hàn có nghĩa là gì?', 'Thẻ tín dụng,Tài khoản,Mật khẩu,Tiền mặt', 'Tài khoản', 60),
('Tiếng Trung Thương Mại', 'Từ vựng tiếng Trung: "Yínháng" (银行) nghĩa là Ngân hàng. "Zhànghù" (账户) nghĩa là Tài khoản. "Zhuanzhàng" (转账) nghĩa là Chuyển khoản.', 'Từ "转账" (Zhuanzhàng) có nghĩa là gì?', 'Chuyển khoản,Nạp tiền,Rút tiền,Khóa thẻ', 'Chuyển khoản', 50);

-- 6. Nap cac Phieu giam gia mau trong Shop de khach hang doi thuong
INSERT INTO vouchers (code, title, discount_amount, point_cost, is_used, customer_id)
VALUES 
('VC10K', 'Phiếu giảm 10k phí giao dịch', 10000.00, 40, FALSE, NULL),
('VC30K', 'Phiếu giảm 30k phí chuyển khoản', 30000.00, 100, FALSE, NULL),
('VC50K', 'Phiếu giảm 50k phí thường niên', 50000.00, 150, FALSE, NULL),
('CASHBACK100K', 'Phiếu hoàn tiền mặt 100k vào số dư', 100000.00, 300, FALSE, NULL);
