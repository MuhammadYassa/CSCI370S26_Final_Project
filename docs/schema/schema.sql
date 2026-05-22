CREATE DATABASE IF NOT EXISTS renter_dispute_app;
USE renter_dispute_app;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('RENTER', 'LANDLORD') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  renter_user_id INT NOT NULL,
  status VARCHAR(50) NOT NULL,
  renter_full_name VARCHAR(255) NOT NULL,
  renter_email VARCHAR(255) NOT NULL,
  renter_phone VARCHAR(50),
  landlord_full_name VARCHAR(255) NOT NULL,
  landlord_email VARCHAR(255) NOT NULL,
  landlord_phone VARCHAR(50),
  property_address VARCHAR(500) NOT NULL,
  city VARCHAR(100),
  state VARCHAR(50) NOT NULL,
  zip_code VARCHAR(20),
  dispute_type VARCHAR(50) NOT NULL,
  security_deposit_amount DECIMAL(10, 2),
  amount_requested DECIMAL(10, 2),
  lease_start_date DATE,
  lease_end_date DATE,
  move_out_date DATE,
  dispute_description TEXT NOT NULL,
  evidence_description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cases_renter_user
    FOREIGN KEY (renter_user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_cases_renter_user_id ON cases(renter_user_id);
CREATE INDEX idx_cases_landlord_email ON cases(landlord_email);

CREATE TABLE IF NOT EXISTS evidence_files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  case_id INT NOT NULL,
  uploaded_by_user_id INT NOT NULL,
  uploaded_by_role ENUM('RENTER', 'LANDLORD') NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  stored_filename VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size_bytes INT NOT NULL,
  storage_path VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_evidence_case
    FOREIGN KEY (case_id) REFERENCES cases(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_evidence_uploaded_by_user
    FOREIGN KEY (uploaded_by_user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_evidence_case_id ON evidence_files(case_id);

CREATE TABLE IF NOT EXISTS generated_forms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  case_id INT NOT NULL,
  selected_filing_path VARCHAR(120) NOT NULL,
  selected_form_type VARCHAR(120) NOT NULL,
  selected_form_name VARCHAR(255) NOT NULL,
  filing_destination VARCHAR(255),
  reason_selected TEXT,
  missing_fields JSON,
  generated_form_data JSON,
  generated_pdf_filename VARCHAR(255),
  generated_pdf_path VARCHAR(500),
  generated_pdf_url VARCHAR(500),
  official_source_name VARCHAR(255),
  official_source_url VARCHAR(500),
  filing_instructions JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_generated_forms_case
    FOREIGN KEY (case_id) REFERENCES cases(id)
    ON DELETE CASCADE,
  CONSTRAINT uq_generated_forms_case UNIQUE (case_id)
);

CREATE TABLE IF NOT EXISTS case_form_answers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  case_id INT NOT NULL,
  answers JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_case_form_answers_case
    FOREIGN KEY (case_id) REFERENCES cases(id)
    ON DELETE CASCADE,
  CONSTRAINT uq_case_form_answers_case UNIQUE (case_id)
);

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
