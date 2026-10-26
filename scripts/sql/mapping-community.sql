-- Mapping club tracking - run once before deploying this feature.
-- Independent of playstyle tables; one mapper per year across all modes.
-- Run once in the Neon SQL Editor for your Free project.
-- No usernames, access tokens, email addresses, or raw osu! IDs are stored.
CREATE TABLE IF NOT EXISTS wrapped_mapping_club_assignments (
 participant_key text NOT NULL CHECK (participant_key ~ '^[a-f0-9]{64}$'),
 year integer NOT NULL CHECK (year = 2026),
 mode text NOT NULL CHECK (mode = 'all'),
 club_id text NOT NULL CHECK (club_id IN ('soundtrack','ranked','breakthrough','factory','gems','draft')),
 rules_version text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY (participant_key, year, mode)
);
CREATE INDEX IF NOT EXISTS wrapped_mapping_club_distribution_idx ON wrapped_mapping_club_assignments (year,mode,rules_version,club_id);
-- All access goes through authenticated Netlify Functions, not a browser database client.
ALTER TABLE wrapped_mapping_club_assignments ENABLE ROW LEVEL SECURITY;
