-- Run once in Neon SQL Editor BEFORE deploying persistent profile queues.
-- Adds separate tables only; existing community/admin records are unchanged.
BEGIN;
CREATE TABLE IF NOT EXISTS wrapped_review_queue_locks(budget_key text PRIMARY KEY);
CREATE TABLE IF NOT EXISTS wrapped_review_jobs(
 budget_key text NOT NULL,job_key text NOT NULL,state text NOT NULL DEFAULT 'queued' CHECK(state IN ('queued','active','complete')),
 queued_at timestamptz NOT NULL DEFAULT clock_timestamp(),last_seen_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 admitted_at timestamptz,lease_until timestamptz,work_until timestamptz,worker_id text,result text,expires_at timestamptz,
 PRIMARY KEY(budget_key,job_key)
);
CREATE INDEX IF NOT EXISTS wrapped_review_jobs_order ON wrapped_review_jobs(budget_key,state,queued_at,job_key);
CREATE TABLE IF NOT EXISTS wrapped_review_cache(cache_key text PRIMARY KEY,payload text NOT NULL,expires_at timestamptz NOT NULL);
CREATE INDEX IF NOT EXISTS wrapped_review_cache_expiry ON wrapped_review_cache(expires_at);
ALTER TABLE wrapped_review_queue_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE wrapped_review_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE wrapped_review_cache ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION wrapped_review_claim(p_budget text,p_job text,p_worker text) RETURNS jsonb
LANGUAGE plpgsql AS $$
DECLARE j wrapped_review_jobs%ROWTYPE; first_job text; ahead integer;
BEGIN
 -- Lock one coordinator row. All admission decisions occur after this lock,
 -- so concurrent server instances cannot admit multiple jobs to this slot.
 INSERT INTO wrapped_review_queue_locks(budget_key) VALUES(p_budget) ON CONFLICT DO NOTHING;
 PERFORM 1 FROM wrapped_review_queue_locks WHERE budget_key=p_budget FOR UPDATE;
 DELETE FROM wrapped_review_jobs WHERE budget_key=p_budget AND
  ((state='complete' AND expires_at<=clock_timestamp()) OR
   (state<>'complete' AND last_seen_at<clock_timestamp()-interval '2 minutes' AND (work_until IS NULL OR work_until<=clock_timestamp())));
 DELETE FROM wrapped_review_cache WHERE cache_key IN
  (SELECT cache_key FROM wrapped_review_cache WHERE expires_at<=clock_timestamp() LIMIT 100);
 UPDATE wrapped_review_jobs SET state='queued',queued_at=clock_timestamp(),worker_id=NULL,work_until=NULL,admitted_at=NULL
  WHERE budget_key=p_budget AND state='active' AND lease_until<=clock_timestamp() AND (work_until IS NULL OR work_until<=clock_timestamp());
 INSERT INTO wrapped_review_jobs(budget_key,job_key) VALUES(p_budget,p_job)
  ON CONFLICT(budget_key,job_key) DO UPDATE SET last_seen_at=clock_timestamp();
 SELECT * INTO j FROM wrapped_review_jobs WHERE budget_key=p_budget AND job_key=p_job;
 IF j.state='complete' THEN RETURN jsonb_build_object('status','complete','result',j.result); END IF;
 IF j.state='active' AND j.work_until>clock_timestamp() THEN RETURN jsonb_build_object('status','processing','position',0); END IF;
 -- Long jobs yield between batches so one slow profile cannot monopolize release traffic.
 IF j.state='active' AND j.admitted_at<clock_timestamp()-interval '90 seconds' AND EXISTS
  (SELECT 1 FROM wrapped_review_jobs WHERE budget_key=p_budget AND state='queued' AND job_key<>p_job) THEN
  UPDATE wrapped_review_jobs SET state='queued',queued_at=clock_timestamp(),admitted_at=NULL WHERE budget_key=p_budget AND job_key=p_job;
  j.state:='queued';
 END IF;
 IF j.state='queued' AND NOT EXISTS(SELECT 1 FROM wrapped_review_jobs WHERE budget_key=p_budget AND state='active') THEN
  SELECT job_key INTO first_job FROM wrapped_review_jobs WHERE budget_key=p_budget AND state='queued' ORDER BY queued_at,job_key LIMIT 1;
  IF first_job=p_job THEN
   UPDATE wrapped_review_jobs SET state='active',admitted_at=clock_timestamp() WHERE budget_key=p_budget AND job_key=p_job;
   j.state:='active';
  END IF;
 END IF;
 IF j.state='active' THEN
  UPDATE wrapped_review_jobs SET lease_until=clock_timestamp()+interval '2 minutes',work_until=clock_timestamp()+interval '60 seconds',worker_id=p_worker
   WHERE budget_key=p_budget AND job_key=p_job;
  RETURN jsonb_build_object('status','active');
 END IF;
 SELECT * INTO j FROM wrapped_review_jobs WHERE budget_key=p_budget AND job_key=p_job;
 SELECT count(*)::int INTO ahead FROM wrapped_review_jobs WHERE budget_key=p_budget AND job_key<>p_job AND
  (state='active' OR (state='queued' AND (queued_at,job_key)<=(j.queued_at,j.job_key)));
 RETURN jsonb_build_object('status','queued','position',ahead+1);
END;
$$;
REVOKE ALL ON wrapped_review_queue_locks,wrapped_review_jobs,wrapped_review_cache FROM PUBLIC;
REVOKE ALL ON FUNCTION wrapped_review_claim(text,text,text) FROM PUBLIC;
COMMIT;
