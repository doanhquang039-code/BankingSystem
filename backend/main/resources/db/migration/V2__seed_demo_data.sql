INSERT INTO customers (id, full_name, email, phone, created_at)
SELECT 1, 'Nguyen Van An', 'an.nguyen@example.com', '0901000001', NOW(6)
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE email = 'an.nguyen@example.com');

INSERT INTO customers (id, full_name, email, phone, created_at)
SELECT 2, 'Tran Thi Binh', 'binh.tran@example.com', '0901000002', NOW(6)
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE email = 'binh.tran@example.com');

INSERT INTO customers (id, full_name, email, phone, created_at)
SELECT 3, 'Le Minh Chau', 'chau.le@example.com', '0901000003', NOW(6)
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE email = 'chau.le@example.com');

INSERT INTO accounts (id, account_number, balance, status, created_at, customer_id)
SELECT 1, '100000000001', 15000000.00, 'ACTIVE', NOW(6), 1
WHERE NOT EXISTS (SELECT 1 FROM accounts WHERE account_number = '100000000001');

INSERT INTO accounts (id, account_number, balance, status, created_at, customer_id)
SELECT 2, '100000000002', 8500000.00, 'ACTIVE', NOW(6), 2
WHERE NOT EXISTS (SELECT 1 FROM accounts WHERE account_number = '100000000002');

INSERT INTO accounts (id, account_number, balance, status, created_at, customer_id)
SELECT 3, '100000000003', 23000000.00, 'ACTIVE', NOW(6), 3
WHERE NOT EXISTS (SELECT 1 FROM accounts WHERE account_number = '100000000003');

INSERT INTO transactions (type, status, amount, description, source_account_id, destination_account_id, created_at)
SELECT 'DEPOSIT', 'COMPLETED', 15000000.00, 'Initial deposit', NULL, 1, NOW(6)
WHERE NOT EXISTS (
    SELECT 1 FROM transactions
    WHERE type = 'DEPOSIT' AND destination_account_id = 1 AND amount = 15000000.00 AND description = 'Initial deposit'
);

INSERT INTO transactions (type, status, amount, description, source_account_id, destination_account_id, created_at)
SELECT 'DEPOSIT', 'COMPLETED', 8500000.00, 'Initial deposit', NULL, 2, NOW(6)
WHERE NOT EXISTS (
    SELECT 1 FROM transactions
    WHERE type = 'DEPOSIT' AND destination_account_id = 2 AND amount = 8500000.00 AND description = 'Initial deposit'
);

INSERT INTO transactions (type, status, amount, description, source_account_id, destination_account_id, created_at)
SELECT 'TRANSFER', 'COMPLETED', 500000.00, 'Demo internal transfer', 1, 2, NOW(6)
WHERE NOT EXISTS (
    SELECT 1 FROM transactions
    WHERE type = 'TRANSFER' AND source_account_id = 1 AND destination_account_id = 2 AND amount = 500000.00 AND description = 'Demo internal transfer'
);
