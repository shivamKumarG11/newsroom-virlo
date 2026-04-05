-- ═══════════════════════════════════════════════════════════════════════════════
-- AI-VANTAGE — Supabase Schema
-- Run this SQL in your Supabase project:
--   Dashboard → SQL Editor → paste & run
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── Users ─────────────────────────────────────────────────────────────────────
-- Stores app-level auth (separate from Supabase Auth — we manage passwords ourselves).

CREATE TABLE IF NOT EXISTS users (
  id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  email        TEXT    UNIQUE NOT NULL,
  password_hash TEXT   NOT NULL,
  created_at   BIGINT  NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

-- ── Sessions ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sessions (
  id          TEXT    PRIMARY KEY,
  user_id     UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at  BIGINT  NOT NULL,
  created_at  BIGINT  NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);
CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions(expires_at);

-- ── User API Keys ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_api_keys (
  user_id     UUID    PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  claude_key  TEXT,
  updated_at  BIGINT  NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

-- ── Trending Cache ────────────────────────────────────────────────────────────
-- One row (id = 'global') updated at most once every 24 h.
-- Persists across Vercel serverless cold starts.

CREATE TABLE IF NOT EXISTS trending_cache (
  id        TEXT        PRIMARY KEY DEFAULT 'global',
  topics    JSONB       NOT NULL DEFAULT '[]'::JSONB,
  cost      NUMERIC     NOT NULL DEFAULT 0,
  cached_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Reports Archive ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS reports (
  id          TEXT        PRIMARY KEY,
  title       TEXT        NOT NULL,
  topic       TEXT,
  digest      TEXT,
  editorial   TEXT,
  qa          JSONB       NOT NULL DEFAULT '[]'::JSONB,
  sources     JSONB       NOT NULL DEFAULT '[]'::JSONB,
  model       TEXT,
  provider    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS reports_created_at_idx ON reports(created_at DESC);

-- ── Row Level Security ─────────────────────────────────────────────────────────
-- The app uses the service role key (bypasses RLS), so policies are optional.
-- Enable RLS for defence-in-depth — the service role key still overrides everything.

ALTER TABLE users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_api_keys  ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports        ENABLE ROW LEVEL SECURITY;
ALTER TABLE trending_cache ENABLE ROW LEVEL SECURITY;

-- Deny all access via anon/authenticated roles (service role bypasses this).
-- No public policies needed since all access goes through the service role key.
