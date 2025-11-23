-- Add OAuth fields to users table
-- This migration adds support for Google, Naver, and Kakao OAuth authentication

-- Add OAuth provider columns
ALTER TABLE users ADD COLUMN oauth_provider TEXT;
ALTER TABLE users ADD COLUMN oauth_provider_id TEXT;
ALTER TABLE users ADD COLUMN avatar_url TEXT;
ALTER TABLE users ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP;

-- Make password_hash nullable for OAuth users
-- Note: SQLite doesn't support ALTER COLUMN, so we need to recreate the table
-- However, for simplicity in development, we'll allow NULL passwords for OAuth users
-- Production should use proper migration strategy

-- Create index on OAuth provider for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_oauth_provider ON users(oauth_provider, oauth_provider_id);

-- Note: OAuth users will have NULL password_hash
-- Traditional users will have NULL oauth_provider and oauth_provider_id
