CREATE DATABASE IF NOT EXISTS sms_platform;
USE sms_platform;
CREATE TABLE users (
id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(100) NOT NULL,
email VARCHAR(150) NOT NULL UNIQUE,
password_hash VARCHAR(255) NOT NULL,
role ENUM('user', 'admin') DEFAULT 'user',
credits INT DEFAULT 0,
status ENUM('active', 'suspended') DEFAULT 'active',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE sms_messages (
id INT AUTO_INCREMENT PRIMARY KEY,
user_id INT NOT NULL,
recipient_number VARCHAR(30) NOT NULL,
country VARCHAR(100) NOT NULL,
message_text TEXT NOT NULL,
provider ENUM('twilio', 'msg91') NOT NULL,
provider_message_id VARCHAR(255),
status ENUM('queued', 'sent', 'delivered', 'failed') DEFAULT 'queued',

error_code VARCHAR(100),
error_message TEXT,
credits_used INT DEFAULT 1,
is_bulk BOOLEAN DEFAULT FALSE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE bulk_uploads (
id INT AUTO_INCREMENT PRIMARY KEY,
user_id INT NOT NULL,
file_name VARCHAR(255) NOT NULL,
total_rows INT DEFAULT 0,
valid_rows INT DEFAULT 0,
invalid_rows INT DEFAULT 0,
status ENUM('processing', 'completed', 'failed') DEFAULT 'processing',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE credit_transactions (
id INT AUTO_INCREMENT PRIMARY KEY,
user_id INT NOT NULL,
type ENUM('credit_add', 'credit_deduct') NOT NULL,
amount INT NOT NULL,
balance_after INT NOT NULL,
description VARCHAR(255),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE webhook_logs (
id INT AUTO_INCREMENT PRIMARY KEY,
provider VARCHAR(50) NOT NULL,
payload JSON,
received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);