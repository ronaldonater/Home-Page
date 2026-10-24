-- Run in Neon SQL Editor BEFORE deploying the stable/lazer clubs.
-- Safe for existing v1, v2, v3, or v4 schemas; no participant rows are deleted.
BEGIN;
ALTER TABLE wrapped_club_assignments DROP CONSTRAINT IF EXISTS wrapped_club_assignments_club_id_check;
ALTER TABLE wrapped_club_assignments ADD CONSTRAINT wrapped_club_assignments_club_id_check
 CHECK (club_id IN ('overdrive','precision','hardmode','afterdark','loyalist','wanderer','nomod','repeat','allrounder','easy','closeenough','safetynet','quality','timecapsule','class2026','crowdfavorites','stable','lazer'));
COMMIT;
-- Returning participants update their existing records to rules version 2026-v6.
