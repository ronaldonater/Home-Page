-- Run in Neon SQL Editor BEFORE deploying Easy Tempo.
-- Safe for existing v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, or v12 schemas; no participant rows are deleted.
BEGIN;
ALTER TABLE wrapped_club_assignments DROP CONSTRAINT IF EXISTS wrapped_club_assignments_club_id_check;
ALTER TABLE wrapped_club_assignments ADD CONSTRAINT wrapped_club_assignments_club_id_check
 CHECK (club_id IN ('overdrive','slowtempo','precision','hardmode','afterdark','loyalist','artistloyalist','onemap','shortmaps','longmaps','moddedonly','wanderer','nomod','repeat','allrounder','easy','closeenough','safetynet','quality','timecapsule','class2026','crowdfavorites','stable','lazer','oneshot','choke','replay'));
COMMIT;
-- Returning participants update their existing records to rules version 2026-v27.
