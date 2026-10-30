-- Rerun before deploying shared player/snapshot API scheduling. Existing data is preserved.
BEGIN;
CREATE TABLE IF NOT EXISTS wrapped_api_budget (budget_key text PRIMARY KEY, next_at timestamptz NOT NULL);
ALTER TABLE wrapped_api_budget ADD COLUMN IF NOT EXISTS player_wait_until timestamptz;
ALTER TABLE wrapped_api_budget ADD COLUMN IF NOT EXISTS snapshot_wait_until timestamptz;
ALTER TABLE wrapped_api_budget ADD COLUMN IF NOT EXISTS player_grants integer NOT NULL DEFAULT 0;
ALTER TABLE wrapped_api_budget ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION wrapped_api_admit(p_budget text,p_lane text) RETURNS TABLE(budget_key text)
LANGUAGE plpgsql AS $$
DECLARE slot wrapped_api_budget%ROWTYPE; instant timestamptz;
BEGIN
 IF p_lane NOT IN ('player','snapshot') THEN RAISE EXCEPTION 'Invalid API lane'; END IF;
 INSERT INTO wrapped_api_budget(budget_key,next_at) VALUES(p_budget,'-infinity') ON CONFLICT DO NOTHING;
 SELECT b.* INTO slot FROM wrapped_api_budget b WHERE b.budget_key=p_budget FOR UPDATE;
 instant:=clock_timestamp();
 -- Short demand leases prevent a crashed caller from holding a reserved slot forever.
 IF p_lane='player' THEN
  UPDATE wrapped_api_budget b SET player_wait_until=instant+interval '5 seconds' WHERE b.budget_key=p_budget;
 ELSE
  UPDATE wrapped_api_budget b SET snapshot_wait_until=instant+interval '5 seconds' WHERE b.budget_key=p_budget;
 END IF;
 IF slot.next_at>instant THEN RETURN; END IF;
 -- Under contention: nine player starts, then one snapshot start. Unused capacity is borrowed.
 IF p_lane='player' AND slot.snapshot_wait_until>instant AND slot.player_grants>=9 THEN RETURN; END IF;
 IF p_lane='snapshot' AND slot.player_wait_until>instant AND slot.player_grants<9 THEN RETURN; END IF;
 UPDATE wrapped_api_budget b SET next_at=instant+interval '1100 milliseconds',
  player_grants=CASE WHEN p_lane='snapshot' THEN 0 ELSE LEAST(slot.player_grants+1,9) END,
  snapshot_wait_until=CASE WHEN p_lane='snapshot' THEN NULL ELSE b.snapshot_wait_until END
 WHERE b.budget_key=p_budget;
 RETURN QUERY SELECT p_budget;
END;
$$;
REVOKE ALL ON wrapped_api_budget FROM PUBLIC;
REVOKE ALL ON FUNCTION wrapped_api_admit(text,text) FROM PUBLIC;
COMMIT;
