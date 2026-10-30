import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createOsuApi} from '../netlify/functions/wrapped/osu-api.mjs';

test('snapshot requests use shared admission and never fall back to uncoordinated API traffic',async()=>{
 let clock=0,calls=0;const lanes=[];
 const api=createOsuApi({lane:'snapshot',requireSharedBudget:true,config:()=>({databaseUrl:'private',clientId:123}),now:()=>clock,sleep:async ms=>clock+=ms,query:async(url,sql,args)=>{lanes.push(args[1]);return [{}];},fetchImpl:async()=>{calls++;return Response.json({});}});
 await api('https://osu.ppy.sh/api/v2/beatmapsets/search');assert.deepEqual(lanes,['snapshot']);assert.equal(calls,1);
 const down=createOsuApi({lane:'snapshot',requireSharedBudget:true,config:()=>({databaseUrl:'private'}),query:async()=>{throw Error('offline');},fetchImpl:async()=>{calls++;return Response.json({});}});
 await assert.rejects(down('https://osu.ppy.sh/oauth/token'),/paused/);assert.equal(calls,1);
 const missing=createOsuApi({lane:'snapshot',requireSharedBudget:true,config:()=>({}),fetchImpl:async()=>{calls++;return Response.json({});}});
 await assert.rejects(missing('https://osu.ppy.sh/oauth/token'),/paused/);assert.equal(calls,1);
});

test('shared PostgreSQL budget reserves one of ten starts under contention and lends idle capacity',async t=>{
 let PGlite;try{({PGlite}=await import('@electric-sql/pglite'));}catch{t.skip('Optional local PostgreSQL engine unavailable');return;}
 const db=new PGlite(),sql=readFileSync(new URL('../scripts/sql/api-budget.sql',import.meta.url),'utf8');
 try{
  await db.exec("CREATE TABLE wrapped_api_budget(budget_key text PRIMARY KEY,next_at timestamptz NOT NULL); INSERT INTO wrapped_api_budget VALUES ('existing',clock_timestamp()+interval '1 hour');");
  await db.exec(sql);await db.exec(sql);
  const claim=async(lane,budget='busy')=>(await db.query('SELECT * FROM wrapped_api_admit($1,$2)',[budget,lane])).rows.length;
  const tick=()=>db.query("UPDATE wrapped_api_budget SET next_at=clock_timestamp()-interval '1 millisecond' WHERE budget_key='busy'");
  assert.equal(await claim('player'),1);assert.equal(await claim('snapshot'),0);
  for(let i=1;i<9;i++){await tick();assert.equal(await claim('snapshot'),0);assert.equal(await claim('player'),1);}
  await tick();assert.equal(await claim('player'),0);assert.equal(await claim('snapshot'),1);assert.equal(await claim('player'),0);
  await tick();assert.equal(await claim('player'),1);
  // Snapshot-only work borrows capacity, but cannot ignore the shared start/cooldown timestamp.
  assert.equal(await claim('snapshot','idle'),1);assert.equal(await claim('snapshot','idle'),0);
  assert.equal(await claim('snapshot','existing'),0);assert.equal(await claim('player','existing'),0);
  // A crashed snapshot caller's demand expires instead of blocking players forever.
  await db.query("UPDATE wrapped_api_budget SET snapshot_wait_until=clock_timestamp()-interval '1 second',player_grants=9,next_at=clock_timestamp()-interval '1 second' WHERE budget_key='busy'");
  assert.equal(await claim('player'),1);
  // With no recent player demand, snapshot traffic can use the next free slot immediately.
  await db.query("UPDATE wrapped_api_budget SET player_wait_until=clock_timestamp()-interval '1 second',player_grants=0,next_at=clock_timestamp()-interval '1 second' WHERE budget_key='busy'");
  assert.equal(await claim('snapshot'),1);
  assert.equal((await db.query("SELECT relrowsecurity FROM pg_class WHERE relname='wrapped_api_budget'")).rows[0].relrowsecurity,true);
 }finally{await db.close();}
});

test('daily workflow installs the database driver, shares the existing secret and preserves atomic snapshots',()=>{
 const workflow=readFileSync(new URL('../.github/workflows/ranked-mappers.yml',import.meta.url),'utf8');
 const script=readFileSync(new URL('../scripts/update-ranked-mappers.mjs',import.meta.url),'utf8');
 assert.match(workflow,/timeout-minutes: 60/);assert.match(workflow,/npm ci --ignore-scripts/);assert.ok(workflow.includes('DATABASE_URL: ${{ secrets.DATABASE_URL }}'));
 assert.match(script,/lane:'snapshot',requireSharedBudget:true/);assert.match(script,/await fs.rename\(output\+'\.tmp',output\)/);
});
