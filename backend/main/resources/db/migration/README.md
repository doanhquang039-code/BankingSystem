# Flyway Migration Guide

## Cách hoạt động

Mỗi khi bạn chạy ứng dụng Spring Boot, Flyway sẽ:
1. Kiểm tra bảng `flyway_schema_history` trong database
2. Tìm các file migration mới chưa được chạy
3. Tự động chạy các file migration theo thứ tự version
4. Ghi lại lịch sử migration vào bảng `flyway_schema_history`

## Quy tắc đặt tên file migration

File migration phải tuân theo format:
```
V{version}__{description}.sql
```

Ví dụ:
- `V1__init_banking_schema.sql` - Tạo schema ban đầu
- `V2__seed_demo_data.sql` - Thêm data mẫu
- `V3__add_user_table.sql` - Thêm bảng user
- `V4__add_column_address_to_customers.sql` - Thêm cột address vào bảng customers

## Cách thêm migration mới

### Bước 1: Tạo file migration mới
Tạo file mới trong thư mục `backend/main/resources/db/migration/` với tên theo format trên.

Version phải lớn hơn version cao nhất hiện tại.

### Bước 2: Viết SQL script
```sql
-- Ví dụ: V3__add_user_table.sql

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    customer_id BIGINT,
    created_at DATETIME(6) NOT NULL,
    CONSTRAINT fk_users_customer FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE INDEX idx_users_username ON users(username);
```

### Bước 3: Chạy ứng dụng
```bash
./mvnw spring-boot:run
```

Flyway sẽ tự động:
- Phát hiện file migration mới
- Chạy SQL script
- Cập nhật database
- Ghi lại trong bảng `flyway_schema_history`

## Lưu ý quan trọng

1. **KHÔNG SỬA FILE MIGRATION ĐÃ CHẠY**: Một khi migration đã chạy thành công, không được sửa file đó nữa. Nếu cần thay đổi, tạo migration mới.

2. **SỬ DỤNG IF EXISTS**: Luôn dùng `CREATE TABLE IF NOT EXISTS`, `DROP TABLE IF EXISTS` để tránh lỗi khi chạy lại.

3. **KIỂM TRA VERSION**: Đảm bảo version mới lớn hơn version cao nhất hiện có.

4. **TEST TRƯỚC**: Test migration trên database test trước khi chạy trên production.

5. **BACKUP DATABASE**: Luôn backup database trước khi chạy migration quan trọng.

## Các lệnh hữu ích

### Kiểm tra trạng thái migration
```bash
./mvnw flyway:info
```

### Xem lịch sử migration trong database
```sql
SELECT * FROM flyway_schema_history ORDER BY installed_rank;
```

### Nếu gặp lỗi và cần reset (CHỈ DÙNG TRÊN DEV)
```sql
DROP TABLE flyway_schema_history;
-- Sau đó drop tất cả các bảng và chạy lại app
```

## Ví dụ migration thường gặp

### Thêm cột mới
```sql
-- V5__add_address_to_customers.sql
ALTER TABLE customers ADD COLUMN address VARCHAR(255);
```

### Thêm index
```sql
-- V6__add_index_to_email.sql
CREATE INDEX idx_customers_email ON customers(email);
```

### Thêm data
```sql
-- V7__add_more_customers.sql
INSERT INTO customers (full_name, email, phone, created_at)
VALUES ('Pham Van Dung', 'dung.pham@example.com', '0901000004', NOW(6));
```

### Sửa cấu trúc bảng
```sql
-- V8__modify_phone_column.sql
ALTER TABLE customers MODIFY COLUMN phone VARCHAR(50);
```
