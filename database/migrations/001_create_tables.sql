-- ============================================================
-- ETEC CMS — 001_create_tables.sql
-- Run this on Railway: PostgreSQL service -> Data/Query tab
-- (or locally: psql $DATABASE_URL -f database/migrations/001_create_tables.sql)
-- Safe to re-run (uses IF NOT EXISTS).
-- ============================================================

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) NOT NULL UNIQUE,
  password    TEXT NOT NULL,
  role        VARCHAR(20) NOT NULL DEFAULT 'author'
              CHECK (role IN ('admin', 'author', 'user')),
  thumbnail   VARCHAR(255),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ
);

-- 2. AUTHORS (extra profile info for users with role author/admin)
CREATE TABLE IF NOT EXISTS authors (
  user_id     INTEGER PRIMARY KEY
              REFERENCES users(id) ON DELETE CASCADE,
  biography   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(100) NOT NULL,
  slug         VARCHAR(120) NOT NULL UNIQUE,
  description  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. POSTS
CREATE TABLE IF NOT EXISTS posts (
  id           SERIAL PRIMARY KEY,
  title        VARCHAR(255) NOT NULL,
  slug         VARCHAR(255) NOT NULL UNIQUE,
  body         TEXT,
  excerpt      TEXT,
  status       VARCHAR(20) NOT NULL DEFAULT 'Draft'
               CHECK (status IN ('Published', 'Draft', 'Pending')),
  type         VARCHAR(50) DEFAULT 'post',
  category_id  INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  user_id      INTEGER REFERENCES users(id) ON DELETE CASCADE,
  thumbnail    VARCHAR(255),
  views        INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ
);

-- 5. COMMENTS
CREATE TABLE IF NOT EXISTS comments (
  id          SERIAL PRIMARY KEY,
  comment     TEXT NOT NULL,
  post_id     INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
  status      VARCHAR(20) NOT NULL DEFAULT 'Approved'
              CHECK (status IN ('Approved', 'Pending', 'Spam')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ
);

-- 6. REPLIES (answers to a comment)
CREATE TABLE IF NOT EXISTS replies (
  id          SERIAL PRIMARY KEY,
  reply       TEXT NOT NULL,
  comment_id  INTEGER NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. TAGS
CREATE TABLE IF NOT EXISTS tags (
  id    SERIAL PRIMARY KEY,
  name  VARCHAR(80) NOT NULL UNIQUE
);

-- 8. POST_TAGS (many-to-many)
CREATE TABLE IF NOT EXISTS post_tags (
  post_id  INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id   INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_posts_status      ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_category_id ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_user_id     ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id  ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_replies_comment_id ON replies(comment_id);
