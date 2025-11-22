-- Update password storage to support salt-based hashing
-- This migration adds password_salt column and makes password_hash nullable for OAuth users

-- Add password_salt column
ALTER TABLE users ADD COLUMN password_salt TEXT;

-- Note: SQLite doesn't support modifying column constraints
-- For OAuth users, password_hash will remain NULL
-- For email/password users, both password_hash and password_salt will be populated

-- Migration strategy:
-- 1. Existing users with password_hash will need to reset their password on next login
--    (or run a script to re-hash existing passwords with salt)
-- 2. New users will use PBKDF2 with salt
-- 3. OAuth users will have NULL password_hash and NULL password_salt
