-- ═══════════════════════════════════════════════════════
-- SKILL FORGE — Supabase Setup Script
-- Esegui questo script nel SQL Editor di Supabase
-- ═══════════════════════════════════════════════════════

-- 1. Tabella utenti
CREATE TABLE IF NOT EXISTS sf_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  approved BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  daily_limit INTEGER DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabella punteggi (per leaderboard)
CREATE TABLE IF NOT EXISTS sf_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES sf_users(id) ON DELETE CASCADE,
  scenario_id TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  score INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabella configurazione admin
CREATE TABLE IF NOT EXISTS sf_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Inserisci il limite giornaliero di default (5 sessioni)
INSERT INTO sf_config (key, value) VALUES ('daily_limit', '5') ON CONFLICT (key) DO NOTHING;

-- 4. Abilita Row Level Security
ALTER TABLE sf_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sf_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE sf_config ENABLE ROW LEVEL SECURITY;

-- 5. Policy: consenti tutto via service_role key (usata dal backend)
CREATE POLICY "Service role full access users" ON sf_users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access scores" ON sf_scores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access config" ON sf_config FOR ALL USING (true) WITH CHECK (true);

-- 5. Crea il primo utente admin (CAMBIA EMAIL E PASSWORD!)
-- La password verrà hashata dal backend alla prima registrazione.
-- Per ora creiamo un placeholder che poi sovrascrivi registrandoti.

-- NOTA: registrati normalmente dall'app con la TUA email,
-- poi esegui questo comando per promuoverti admin:
-- UPDATE sf_users SET approved = true, is_admin = true WHERE email = 'TUA_EMAIL@esempio.com';
