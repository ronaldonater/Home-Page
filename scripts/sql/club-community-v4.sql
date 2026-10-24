-- Run in Neon SQL Editor BEFORE deploying the map-preference clubs.
-- Safe for existing v1, v2, or v3 schemas; no participant rows are deleted.
BEGIN;
ALTER TABLE wrapped_club_assignments DROP CONSTRAINT IF EXISTS wrapped_club_assignments_club_id_check;
ALTER TABLE wrapped_club_assignments ADD CONSTRAINT wrapped_club_assignments_club_id_check
 CHECK (club_id IN ('overdrive','precision','hardmode','afterdark','loyalist','wanderer','nomod','repeat','allrounder','easy','closeenough','safetynet','quality','timecapsule','class2026','crowdfavorites'));
COMMIT;
-- Returning participants update their existing records to rules version 2026-v4.
