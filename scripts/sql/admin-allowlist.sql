-- Run once in Neon SQL Editor before deploying admin management.
-- Separate from club tracking; existing participant tables are unchanged.
CREATE TABLE IF NOT EXISTS wrapped_release_admins (
 user_id bigint PRIMARY KEY CHECK (user_id > 0 AND user_id <> 7933825),
 username text NOT NULL CHECK (char_length(username) BETWEEN 1 AND 64),
 added_by bigint NOT NULL CHECK (added_by = 7933825),
 added_at timestamptz NOT NULL DEFAULT now()
);
-- Owner access is permanent in server code and does not require a row.
ALTER TABLE wrapped_release_admins ENABLE ROW LEVEL SECURITY;
-- Access uses the existing private server-side Neon owner connection only.
