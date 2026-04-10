CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS trials (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  mode       TEXT NOT NULL CHECK (mode IN ('mites', 'swd', 'lygus')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS samples (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trial_id    UUID NOT NULL REFERENCES trials(id) ON DELETE CASCADE,
  leaf_number INTEGER NOT NULL,
  observer    TEXT NOT NULL,
  counted_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS counts (
  id         SERIAL PRIMARY KEY,
  sample_id  UUID NOT NULL REFERENCES samples(id) ON DELETE CASCADE,
  species_id TEXT NOT NULL,
  stage      TEXT NOT NULL,
  count      INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_samples_trial ON samples(trial_id);
CREATE INDEX IF NOT EXISTS idx_counts_sample ON counts(sample_id);
