-- Run before deploying shared osu! API throttling. Existing data is unchanged.
CREATE TABLE IF NOT EXISTS wrapped_api_budget (budget_key text PRIMARY KEY, next_at timestamptz NOT NULL);
ALTER TABLE wrapped_api_budget ENABLE ROW LEVEL SECURITY;
