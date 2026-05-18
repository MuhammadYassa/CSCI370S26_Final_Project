USE renter_dispute_app;

CREATE TABLE IF NOT EXISTS landlord_responses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  case_id INT NOT NULL,
  landlord_user_id INT,
  landlord_full_name VARCHAR(255) NOT NULL,
  landlord_email VARCHAR(255) NOT NULL,
  response_statement TEXT NOT NULL,
  amount_landlord_claims DECIMAL(10, 2),
  evidence_description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_landlord_responses_case
    FOREIGN KEY (case_id) REFERENCES cases(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_landlord_responses_user
    FOREIGN KEY (landlord_user_id) REFERENCES users(id)
    ON DELETE SET NULL,
  CONSTRAINT uq_landlord_responses_case UNIQUE (case_id)
);

CREATE TABLE IF NOT EXISTS arbitration_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  case_id INT NOT NULL,
  neutral_summary TEXT NOT NULL,
  renter_main_claims JSON,
  landlord_main_claims JSON,
  image_evidence_findings JSON,
  key_disputed_facts JSON,
  missing_evidence JSON,
  suggested_resolution TEXT NOT NULL,
  recommended_next_steps JSON,
  confidence_level VARCHAR(20),
  disclaimer TEXT NOT NULL,
  raw_ai_response JSON,
  ai_model VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_arbitration_results_case
    FOREIGN KEY (case_id) REFERENCES cases(id)
    ON DELETE CASCADE,
  CONSTRAINT uq_arbitration_results_case UNIQUE (case_id)
);

SET @column_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'arbitration_results'
    AND COLUMN_NAME = 'image_evidence_findings'
);

SET @sql = IF(
  @column_exists = 0,
  'ALTER TABLE arbitration_results ADD COLUMN image_evidence_findings JSON AFTER landlord_main_claims',
  'SELECT ''image_evidence_findings already exists'' AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;