-- Run once in Neon before using the countdown toggle. Existing data is preserved.
BEGIN;
CREATE TABLE IF NOT EXISTS wrapped_release_settings (
 id integer PRIMARY KEY CHECK (id=1),
 public_access boolean NOT NULL DEFAULT false,
 updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO wrapped_release_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
ALTER TABLE wrapped_release_settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON wrapped_release_settings FROM PUBLIC;
COMMIT;
