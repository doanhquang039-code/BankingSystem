-- ============================================================
-- V11: Create kyc_requests table
-- KYC (Know Your Customer) identity verification workflow
-- Status lifecycle: PENDING → APPROVED / REJECTED → RESUBMITTED
-- ============================================================

CREATE TABLE IF NOT EXISTS kyc_requests
(
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id      BIGINT       NOT NULL,
    full_name        VARCHAR(120) NOT NULL,
    id_number        VARCHAR(30)  NOT NULL,
    id_type          VARCHAR(20)  NOT NULL COMMENT 'CCCD or PASSPORT',
    front_image_url  VARCHAR(500),
    back_image_url   VARCHAR(500),
    selfie_url       VARCHAR(500),
    status           VARCHAR(20)  NOT NULL DEFAULT 'PENDING'
        COMMENT 'PENDING | APPROVED | REJECTED | RESUBMITTED',
    rejection_reason VARCHAR(500),
    reviewed_by      VARCHAR(50) COMMENT 'username of reviewing staff',
    created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME,
    reviewed_at      DATETIME,

    CONSTRAINT fk_kyc_customer FOREIGN KEY (customer_id)
        REFERENCES customers (id) ON DELETE CASCADE,
    CONSTRAINT chk_kyc_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'RESUBMITTED')),
    CONSTRAINT chk_kyc_id_type CHECK (id_type IN ('CCCD', 'PASSPORT'))
);

-- Indexes for common queries
CREATE INDEX idx_kyc_customer ON kyc_requests (customer_id);
CREATE INDEX idx_kyc_status ON kyc_requests (status);
CREATE INDEX idx_kyc_created ON kyc_requests (created_at);

-- Seed: 1 pending KYC from demo customer
INSERT INTO kyc_requests (customer_id, full_name, id_number, id_type,
                          front_image_url, back_image_url, selfie_url, status, created_at)
SELECT c.id,
       c.full_name,
       '001085012345',
       'CCCD',
       'https://res.cloudinary.com/demo/image/upload/sample.jpg',
       'https://res.cloudinary.com/demo/image/upload/sample.jpg',
       'https://res.cloudinary.com/demo/image/upload/sample.jpg',
       'PENDING',
       NOW()
FROM customers c
LIMIT 1;
