CREATE DATABASE IF NOT EXISTS renter_dispute_app; 
USE renter_dispute_app;

CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('tenant', 'landlord', 'admin') DEFAULT 'tenant',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS properties (
    id INT PRIMARY KEY AUTO_INCREMENT,
    landlord_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    rent DECIMAL(10,2),
    bedrooms INT,
    bathrooms INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (landlord_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS disputes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tenant_id INT NOT NULL,
    property_id INT NOT NULL,
    subject VARCHAR(255),
    description TEXT,
    status ENUM('open', 'in_progress', 'resolved') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES users(id),
    FOREIGN KEY (property_id) REFERENCES properties(id)
);

-- SAMPLE DATA

INSERT INTO users (full_name, email, password, role)
VALUES
('Test Tenant', 'tenant@test.com', 'password123', 'tenant'),
('Test Landlord', 'landlord@test.com', 'password123', 'landlord');

INSERT INTO properties (landlord_id, title, description, address, city, state, zip_code, rent, bedrooms, bathrooms)
VALUES
(2, 'Sample Apartment', 'A sample rental property', '123 Main St', 'New York', 'NY', '10001', 1500.00, 2, 1);

INSERT INTO disputes (tenant_id, property_id, subject, description, status)
VALUES
(1, 1, 'Broken heater', 'The heater has not been working for 3 days.', 'open');

-- SHOW DATA

SELECT * FROM users;
SELECT * FROM properties;
SELECT * FROM disputes;