-- Migration V9: Them cac bang tiet kiem, khoan vay va the ngan hang

-- 1. Tao bang savings_accounts (Tiet kiem online)
CREATE TABLE IF NOT EXISTS savings_accounts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    account_number VARCHAR(20) NOT NULL UNIQUE,
    balance DECIMAL(15, 2) NOT NULL,
    interest_rate DECIMAL(5, 2) NOT NULL,
    term_months INT NOT NULL,
    start_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    maturity_date TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT fk_savings_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- 2. Tao bang loans (Khoan vay)
CREATE TABLE IF NOT EXISTS loans (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    interest_rate DECIMAL(5, 2) NOT NULL,
    term_months INT NOT NULL,
    monthly_payment DECIMAL(15, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_loans_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- 3. Tao bang cards (The ngan hang)
CREATE TABLE IF NOT EXISTS cards (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    card_number VARCHAR(16) NOT NULL UNIQUE,
    card_type VARCHAR(20) NOT NULL, -- DEBIT, CREDIT
    holder_name VARCHAR(100) NOT NULL,
    expiration_date VARCHAR(5) NOT NULL, -- MM/YY
    cvv VARCHAR(3) NOT NULL,
    card_limit DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, LOCKED
    CONSTRAINT fk_cards_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- 4. Seed du lieu mau
-- Tiet kiem
INSERT IGNORE INTO savings_accounts (id, customer_id, account_number, balance, interest_rate, term_months, start_date, maturity_date, status)
VALUES 
(1, 1, '800000000001', 50000000.00, 5.50, 6, '2026-05-07 10:00:00.000', '2026-11-07 10:00:00.000', 'ACTIVE'),
(2, 6, '800000000006', 120000000.00, 7.20, 12, '2026-01-07 10:00:00.000', '2027-01-07 10:00:00.000', 'ACTIVE');

-- Khoan vay
INSERT IGNORE INTO loans (id, customer_id, amount, interest_rate, term_months, monthly_payment, status, created_at)
VALUES 
(1, 8, 150000000.00, 8.50, 24, 6818000.00, 'APPROVED', '2026-05-15 14:00:00.000'),
(2, 6, 30000000.00, 9.00, 12, 2624000.00, 'PENDING', '2026-07-07 15:30:00.000');

-- The ngan hang
INSERT IGNORE INTO cards (id, customer_id, card_number, card_type, holder_name, expiration_date, cvv, card_limit, status)
VALUES 
(1, 1, '4111222233334444', 'DEBIT', 'NGUYEN VAN AN', '12/30', '123', 0.00, 'ACTIVE'),
(2, 1, '5222333344445555', 'CREDIT', 'NGUYEN VAN AN', '08/31', '456', 50000000.00, 'ACTIVE'),
(3, 6, '4111666677778888', 'DEBIT', 'DOANH QUANG HUY', '06/29', '789', 0.00, 'ACTIVE'),
(4, 6, '5222666677778888', 'CREDIT', 'DOANH QUANG HUY', '10/30', '012', 100000000.00, 'LOCKED');
