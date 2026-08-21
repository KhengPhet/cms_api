-- ============================================================
-- ETEC CMS — 001_seed_data.sql
-- Run AFTER 001_create_tables.sql
-- Default admin: email=admin@etec.local  password=admin123
-- ⚠️ Change the password after first login!
-- ============================================================

-- Admin user (bcrypt hash of "admin123")
INSERT INTO users (name, email, password, role)
VALUES (
  'Admin',
  'admin@etec.local',
  '$2b$10$v1JBvLzOh9ZB0Pp0Hd66bucaCkGXsFGxux2UbKiur6pj1.qZctwPa',
  'admin'
)
ON CONFLICT (email) DO NOTHING;

-- Sample categories
INSERT INTO categories (name, slug, description) VALUES
  ('Technology', 'technology', 'Tech news and tutorials'),
  ('Education',  'education',  'Learning resources'),
  ('Lifestyle',  'lifestyle',  'Daily life articles')
ON CONFLICT (slug) DO NOTHING;
