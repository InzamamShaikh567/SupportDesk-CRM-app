-- Clean Database
DROP DATABASE IF EXISTS crm_db;
CREATE DATABASE crm_db;
USE crm_db;

-- Teams Table (kept for organization, not used in ticket logic)
CREATE TABLE IF NOT EXISTS teams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role ENUM('AGENT', 'TL', 'ADMIN') NOT NULL,
  team_id INT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL
);

-- Tickets Table
CREATE TABLE IF NOT EXISTS tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_number VARCHAR(20) NOT NULL UNIQUE,
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category ENUM('technical', 'billing', 'account', 'feature', 'other') NOT NULL,
  priority ENUM('low', 'medium', 'high') NOT NULL,
  status ENUM('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'ESCALATED', 'REOPENED', 'REJECTED') DEFAULT 'OPEN',
  customer_email VARCHAR(255) NOT NULL,
  created_by INT NOT NULL,
  assigned_tl_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_tl_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Ticket Status History Table
CREATE TABLE IF NOT EXISTS ticket_status_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT NOT NULL,
  old_status VARCHAR(20) NULL,
  new_status VARCHAR(20) NOT NULL,
  changed_by INT NOT NULL,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert sample data
-- Sample teams
INSERT INTO teams (name) VALUES ('Support Team A'), ('Support Team B');

-- Sample users (password is 'password123' hashed with bcrypt)
INSERT INTO users (email, password, first_name, last_name, role, team_id) VALUES
('admin@supportdesk.com', '$2a$10$H6CApsakKjKaal1YP8tpsu/Hq7FdFl37QEKu.StXGpFYy/c6f5tQ.', 'Admin', 'User', 'ADMIN', NULL),
('sarah.miller@supportdesk.com', '$2a$10$H6CApsakKjKaal1YP8tpsu/Hq7FdFl37QEKu.StXGpFYy/c6f5tQ.', 'Sarah', 'Miller', 'TL', 1),
('mike.johnson@supportdesk.com', '$2a$10$H6CApsakKjKaal1YP8tpsu/Hq7FdFl37QEKu.StXGpFYy/c6f5tQ.', 'Mike', 'Johnson', 'TL', 2),
('john.doe@supportdesk.com', '$2a$10$H6CApsakKjKaal1YP8tpsu/Hq7FdFl37QEKu.StXGpFYy/c6f5tQ.', 'John', 'Doe', 'AGENT', 1),
('emily.wilson@supportdesk.com', '$2a$10$H6CApsakKjKaal1YP8tpsu/Hq7FdFl37QEKu.StXGpFYy/c6f5tQ.', 'Emily', 'Wilson', 'AGENT', 1);

-- Sample tickets
INSERT INTO tickets (ticket_number, subject, description, category, priority, status, customer_email, created_by, assigned_tl_id) VALUES
('TKT-1001', 'Cannot access dashboard', 'Customer cannot access dashboard after password reset', 'technical', 'high', 'OPEN', 'customer1@techcorp.com', 4, 2),
('TKT-1002', 'Billing discrepancy', 'March invoice shows incorrect charges', 'billing', 'medium', 'IN_PROGRESS', 'customer2@startup.io', 5, 3),
('TKT-1003', 'API rate limit', 'API rate limit exceeded unexpectedly', 'technical', 'high', 'OPEN', 'customer3@enterprise.com', 4, 2),
('TKT-1004', 'Password reset not working', 'Password reset email not received', 'account', 'medium', 'OPEN', 'customer4@company.com', 5, 3);