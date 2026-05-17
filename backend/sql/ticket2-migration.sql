USE renter_dispute_app;

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
