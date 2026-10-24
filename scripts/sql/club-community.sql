-- Run once in the Neon SQL Editor for your Free project.
-- No usernames, access tokens, email addresses, or raw osu! IDs are stored.
CREATE TABLE IF NOT EXISTS wrapped_club_assignments (
 participant_key text NOT NULL CHECK (participant_key ~ '^[a-f0-9]{64}$'),
 year integer NOT NULL CHECK (year = 2026),
 mode text NOT NULL CHECK (mode IN ('osu','taiko','fruits','mania')),
 club_id text NOT NULL CHECK (club_id IN ('overdrive','precision','hardmode','afterdark','loyalist','wanderer','nomod','repeat','allrounder','easy','closeenough','safetynet','quality','timecapsule','class2026','crowdfavorites')),
 rules_version text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY (participant_key, year, mode)
);
CREATE INDEX IF NOT EXISTS wrapped_club_distribution_idx ON wrapped_club_assignments (year,mode,rules_version,club_id);
-- All access goes through authenticated Netlify Functions, not a browser database client.
ALTER TABLE wrapped_club_assignments ENABLE ROW LEVEL SECURITY;
