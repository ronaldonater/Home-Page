# Free Neon club community tracking

This feature uses a separate Neon Free Postgres database, not Netlify Database. Existing Netlify Functions connect with the official `@neondatabase/serverless` driver. Stay on Neon's Free plan; database and Netlify quotas still apply. No paid plan or credit card is required for Neon's Free offering at the time of implementation.

## Set up the database

1. Create a Free project at https://console.neon.tech/. Pick a nearby region and a name such as `osu-wrapped-clubs`.
2. Open its SQL Editor. Paste and run `scripts/sql/club-community.sql` from this repository. Use your project's database owner connection (the schema enables RLS without public policies).
3. Click Connect and copy the PostgreSQL connection string. Keep it private; do not paste it into chat, browser code, or Git.
4. Generate a separate stable tracking secret locally:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

5. In your Netlify site's environment variables, add `DATABASE_URL` and `CLUB_TRACKING_SECRET`, scoped to Functions / Production. For the ronaldonater.com website integration use **`WRAPPED_DATABASE_URL` and `WRAPPED_CLUB_TRACKING_SECRET`** instead. Use the complete Neon connection string and the generated secret. Add the same variables to an uncommitted `.env` for local testing if desired.
6. Deploy the updated frontend, root dependency manifest/lockfile, Functions, and assets. The website root now has a package.json solely to install the backend driver; its build command remains empty and publish directory remains `.`.
7. Generate a genuine authenticated Wrapped with at least one eligible 2026 score. A row should appear in Neon. Refreshing or changing club updates the same participant/year/mode row. Demos and reviews without a club are not recorded.

Do not point deploy previews or local tests at production unless you intend those authenticated visits to count. If both app copies share the same database, use the same tracking secret to deduplicate participants across them. Rotating that secret changes pseudonymous identities; reset or migrate the stored population when intentionally rotating it.


## Community database setup

The database is optional for reviews, slides and exports. It enables community primary-club percentages after one participant. Demos are never recorded; failed tracking does not block the review. Aggregates cache for one minute.

- Fresh playstyle database: run `scripts/sql/club-community.sql`.
- Existing playstyle database: run `scripts/sql/club-community-v13.sql`. It directly upgrades earlier schemas and retains existing rows.
- Mapping community: additionally run `scripts/sql/mapping-community.sql` in the same database and branch. It creates `wrapped_mapping_club_assignments` independently of `wrapped_club_assignments`.
- Superseded migrations have been removed. The v13 upgrade includes all earlier playstyle club IDs; no intermediate migrations are required.
- Standalone Functions variables: `DATABASE_URL`, `CLUB_TRACKING_SECRET`.
- Website Functions variables: `WRAPPED_DATABASE_URL`, `WRAPPED_CLUB_TRACKING_SECRET`.

Playstyle assignments count once per participant/year/mode under `2026-v28`. Mapping assignments count once per mapper/year across modes under `mapping-2026-v1`. Only current-rule assignments enter percentages; returning users refresh existing records. Keep the secret stable. Neither table stores raw osu! IDs, usernames, tokens, full reviews, or replay files. See [community setup](CLUB-COMMUNITY.md).

## Evidence and ranking

All 26 playstyle clubs can be primary or secondary. Strongest evidence-adjusted signal wins, followed by the next distinct match. Exact ties use supporting coverage, then definition order. Score evidence uses `0.5 + 0.5 * min(evidenceScores / 20, 1)`; accuracy uses valid passed scores. Activity evidence uses `0.75 + 0.25 * min(availableMonths / 6, 1)`, using replay-history months for Replay Society. One eligible score remains enough; fewer than 20 scores receive a provisional note. These are design weights, not probabilities. See [ranking guide](CLUB-RANKING.md).

## Personal mapping and recap

Hosted mapsets first submitted in 2026 (UTC) are counted across all modes, deduplicated by set ID. The service paginates ranked, loved, pending and graveyard catalogues with a 15-minute cache. Guest difficulties hosted by others, deleted sets and unsubmitted maps are excluded. Ranked status is current. Missing/incomplete data is unavailable rather than zero.

The panel shows submissions, their currently ranked subset, combined all-time plays, a mapping club, and the most-played upload. Club criteria and matching accent colors appear on the badge; a button opens the themed legend. Community share appears on the right on desktop and stacks on mobile. The legend shows scope, then the primary community summary, then all six clubs.

The mapping slide follows the playstyle reveal and precedes global community statistics. It plays the most-played upload's complete audio preview. The recap shows three counters, then a divided row with club logo/name/motto/criteria and the most-played upload's cover/title/artist/playcount. Both slide and recap are omitted without a valid positive 2026 submission count, including unavailable data; no extra recap space is reserved. Zero counts can still appear on the dashboard.

## Demo data

Each mode includes real public metadata for ten native-mode mapsets from at least ten distinct hosts, including artwork and previews. Scores, PP, dates, activity, mapping totals and medal award dates remain fictional and labeled. Silver S/SS grades require HD or FL. The example medal displays a dated Osekai ownership snapshot. Demo community tracking is disabled. Refresh fixtures with `node scripts/update-demo-beatmaps.mjs` using local app credentials; no runtime credentials are needed for demos.

### Mapping club community tracking

Run `scripts/sql/mapping-community.sql` in the Neon SQL Editor before deploying. This creates a separate table and leaves existing playstyle data intact. Reuse the existing private database and tracking-secret variables: `DATABASE_URL` / `CLUB_TRACKING_SECRET` for the standalone app, or `WRAPPED_DATABASE_URL` / `WRAPPED_CLUB_TRACKING_SECRET` for the website integration. No new secrets are required.

Authenticated Wrapped requests register one primary mapping club per mapper per year, across all modes. Only users with an eligible 2026 upload qualify; demos and unavailable mapping data are excluded. Revisiting updates an existing assignment. Percentages describe participating mappers, not all osu! users, and appear after one participant. Aggregates cache for one minute. Tracking stores a domain-separated HMAC key, year, all-mode scope, club ID, rule version and timestamps; no raw user IDs or usernames. Missing database configuration disables tracking; database failures leave Wrapped usable. Keep the tracking secret stable to avoid duplicate participant keys. Mapping ranking changes require a new mapping rules version.

