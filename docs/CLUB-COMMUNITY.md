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

## What is stored and displayed

Only a keyed HMAC of the authenticated osu! ID, year, mode, club ID, rule version, and timestamps are stored. No usernames, email addresses, OAuth tokens, raw osu! IDs, or score histories are stored in this table. Pseudonymous records are still participant data; the app discloses collection under About the data. Database access stays on the backend. There is no browser endpoint accepting an arbitrary club or user ID.

The primary key prevents repeat visits from increasing the population. Queries filter by year, gamemode, and assignment rule version. Modifying club assignment rules requires bumping `CLUB_RULES_VERSION` in the backend; older assignments are excluded until those users generate a fresh review. Monthly activity remains profile-wide, as in the existing club rules.

The club card and story show the user's club percentage; the legend shows the full distribution. Percentages appear as soon as one participant is recorded per year/mode/rule version. An empty population shows a collecting message. Counts are participants who generated a Wrapped, not all osu! players. Aggregate reads cache for one minute per warm instance. A query timeout or error returns an unavailable status and backs off for one minute; personal Wrapped and club assignment continue working. Without either required environment variable, the integration stays disabled.

Deleting an account's record can be handled by the site operator: calculate the same HMAC using the tracking secret and osu! ID, then execute a parameterized deletion for that participant key in the database. Removing the database environment variables disables future collection; existing rows remain until deleted.

## Verify after deployment

- Missing configuration: Wrapped still works and no community percentage is fabricated.
- Authenticated generation: a single row is inserted with a 64-character pseudonymous key.
- Repeat generation: population does not increase.
- Different mode: a separate mode-specific row is stored.
- At least one participant: percentages sum to 100% before display rounding.
- Database failure: the review still loads, with community stats unavailable.

No live Neon project was created or configured by this code change. The SQL and private environment variables above must be configured before live persistence works.

## Current SQL files

Use `scripts/sql/club-community.sql` for a fresh database, or `scripts/sql/club-community-v4.sql` to update any existing v1/v2/v3 schema directly. The v4 migration permits all 16 club IDs without deleting participant records. Superseded v2/v3 SQL files have been removed; they are not prerequisites. Current assignment rules are `2026-v5`, which require no further schema change.

## Current map-preference rules and schema

All score-based clubs use the complete deduplicated sample of eligible 2026 scores from the user's current top 200, including scores without PP. Precision Society and Close Enough Club use valid passed scores within that sample. Quality Over Quantity and Repeat Offenders use available monthly profile playcounts across all modes.

Time Capsule requires at least 60% of the sample on mapsets ranked in **2016 or earlier**. Class of 2026 requires at least 60% on mapsets ranked in **2026**. Crowd Favorites requires at least 40% on the selected mode's **25 most-played mapsets ranked in 2026**, spanning at least three distinct mapsets. Each requires at least five eligible scores. The popular top 25 is the comparison catalogue, not a limit on the user's score sample.

Missing map ranking dates are not counted as old/new matches. The backend attempts date enrichment across up to 200 scores, with four concurrent lookups and a shared three-second budget; successfully fetched dates cache for 24 hours per warm instance. Popular catalogue requests coalesce and cache for 15 minutes. Metadata failures do not block the review.

Only two SQL files are needed:

- `scripts/sql/club-community.sql`: create a fresh database table.
- `scripts/sql/club-community-v4.sql`: update any existing earlier schema directly, preserving participant records. Superseded v2/v3 migration files were removed.

Current assignment rules are **`2026-v5`**. The SQL schema migration is still **v4**; no new SQL is needed if it has already been applied. Percentages include participants under the current rules as they generate a fresh review. Keep the database URL and tracking secret unchanged. The private environment variables and deployment steps are documented above.
