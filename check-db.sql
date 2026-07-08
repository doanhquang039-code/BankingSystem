-- Kiểm tra các bảng trong database
USE bank_system;
SHOW TABLES;

-- Kiểm tra bảng flyway_schema_history (bảng này lưu lịch sử migration)
SELECT * FROM flyway_schema_history;

-- Nếu bảng flyway_schema_history chưa tồn tại, nghĩa là Flyway chưa chạy lần nào
