# osu! Wrapped 2026 subpage

**Version 1.1.17**

Public URL: https://ronaldonater.com/osu-wrapped/ (use your actual canonical host if different). Its Dev-page entry is managed manually. Wrapped is a self-contained static ES-module app; no build step or Vite installation is needed for the personal site. All existing pages and integrations remain in place. No credentials were copied from the standalone app.

## New OAuth client

1. Create a NEW OAuth application at https://osu.ppy.sh/home/account/edit. Name it something like Ronaldonater osu! Wrapped.
2. Register this exact callback: https://ronaldonater.com/api/osu-wrapped/auth/callback . If your site uses www or another hostname, use that same canonical host here and in the environment variable. The callback is an API URL, not /osu-wrapped/.
3. In the PERSONAL WEBSITE Netlify site's environment variables, add the following with Functions scope (or All scopes) in Production:
   - WRAPPED_OSU_CLIENT_ID: the new application's client ID.
   - WRAPPED_OSU_CLIENT_SECRET: the new application's secret; mark it secret.
   - WRAPPED_OSU_REDIRECT_URI: the exact registered callback URL above.
   - WRAPPED_SESSION_SECRET: a new random secret of at least 32 characters. Generate one with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
4. Keep existing OSU_CLIENT_ID and OSU_CLIENT_SECRET unchanged: the Social page uses those for playtime. Wrapped requests identify and public permissions from the NEW client.
5. Push/deploy this personal website repository on its existing Netlify site, with the repository root as the publish directory and no build command. Functions remain in netlify/functions. Redeploy after saving environment variables.
6. Open /osu-wrapped/, try the demo, connect osu!, approve the new client, switch modes, download a recap, and sign out. Visiting /api/osu-wrapped/wrapped without a session should return 401. Missing OAuth configuration returns 503 on the login endpoint.

## Local testing

Create a separate local-test OAuth client (or register an additional callback if osu! allows it) with http://localhost:8888/api/osu-wrapped/auth/callback. Copy .env.example to .env in the personal-site root and enter the LOCAL client credentials, that local callback, and a new session secret. Do not commit .env. Run npx netlify-cli dev --port 8888 from the personal website directory, then open http://localhost:8888/osu-wrapped/. No Vite server is needed. The demo can also be served with a normal static server at /osu-wrapped/, but OAuth, image proxying and data fetching require Netlify functions. Deploy previews need a matching registered callback and environment context; otherwise use the demo there.

## Implementation and maintenance

- osu-wrapped/: static application source and self-hosted font files (font license documents retained). Browser modules use native relative imports.
- netlify/functions/wrapped-api.mjs: dedicated OAuth, data, avatar and cover endpoints.
- netlify/functions/wrapped/security.mjs: encrypted sessions using WRAPPED_SESSION_SECRET.
- API namespace: /api/osu-wrapped/*, rewritten to wrapped-api. OAuth returns to /osu-wrapped/. Cookie names are isolated from the standalone app.
- Security headers apply only to the Wrapped subpage, avoiding conflicts with existing website fonts and integrations.
- Wrapped scans up to 200 current best scores per ruleset, retaining those dated in 2026; it does not reconstruct complete annual score history. Profile activity and dated medals remain separate.
- Run node --test tests/*.test.mjs for all website and Wrapped checks.
- Future edits to the standalone F: project do NOT automatically sync here. This subpage is now maintained in this repository.

Live OAuth verification requires your new credentials and the actual deployed hostname. These cannot be supplied or registered by this code change. No production deployment was performed.

## Embedded replay viewer

Top-score Watch replay buttons open a sandboxed ReplayViewer panel. The backend authorizes the current player and verifies score ownership before downloading a replay; only the replay bytes are passed to https://www.replayviewer.com/?embed using its replayviewer:load interface. No osu! token is sent to that site. Downloads are bounded to 4 MiB and use no-store; image downloads remain bounded to 2 MiB. The CSP allows ReplayViewer and the JoSu beatmap viewer as frame sources. Closing the panel aborts pending downloads and removes its message listener/frame. Missing replays and upstream download quotas may prevent playback. ReplayViewer currently lists no lazer-mod support. Full third-party playback requires live verification; this repository does not control that service. No OAuth client change or additional environment variable is required.

## Wrapped experience

Successful first-login data loading opens a nine-slide animated story. Seen state is localStorage keyed by player ID and year, so changing game mode does not replay it automatically. The Replay Experience button opens it anytime, including in the demo. Closing/skipping counts as seen; different browsers/devices or cleared storage may show it again. If storage is blocked, seen state lasts only for the current page. This is an animated web experience, not an exported video, and uses no autoplay audio. Controls support pause/play, previous/next, slide selection, swipe and Escape. Reduced-motion starts paused and disables entrance/counting animations. Hiding the browser tab pauses progress. No OAuth or environment-variable change is required.


Artist pictures use TheAudioDB v1 shared free key 123; no additional environment variables are required. The /artist-image endpoint validates exact artist names and approved artwork URLs, limits downloads to 512 KiB, coalesces identical in-flight requests, and caches up to 64 results in each warm function instance (24 hours for pictures, 1 hour for missing results). Successful images also use browser/CDN cache headers. A 25-lookups-per-minute guard applies per function instance, not globally across Netlify; upstream limits can still cause initials to display during traffic spikes. Missing or ambiguous artists use initials. Artwork attribution appears in the artist section and exported card.


Rarest 2026 medal: profile achievement timestamps are filtered using UTC, then matched by achievement ID to Osekai public medal data (https://osekai.net/medals/api/medals.php). Rarity percentages are current Osekai estimates, not the rarity at award time or an official global osu statistic. Data is cached for 24 hours per warm function instance; failures show unavailable, and incomplete matches are labeled Rarest matched medal. No API key or environment variables are required. Medal images use a validated same-origin proxy. Restart the local backend or redeploy after updating.


## Global stats

The Your Stats / Global Stats selector preserves the selected gamemode. The full experience has up to **27 slides** when both quizzes have enough candidates.

Global panels include:

- Up to 25 recorded 2026 PP plays from the current official top 1,000, plus player appearance rankings.
- The 25 most-played mapsets ranked in 2026, ordered by lifetime mapset plays. Links open the most-played native difficulty for the selected mode.
- Individual mod usage across the global top 25 PP plays, showing counts and percentages. CL is excluded and ties share a rank.
- Up to ten genres across the popular top 25 mapsets, counting each unique mapset once. Missing metadata is labeled Unknown genre. Genre links open osu! searches filtered to the selected mode; the story shows the top five genres.
- Ranked mapper totals and the number of unique mapsets ranked in 2026, from the catalogue snapshot described below.

Community slides also show approximate new accounts, peak concurrent users with OhnePixel context, and over 1.7 billion ranked plays submitted. These community figures are separate from the selected-mode score sample; source and coverage notes appear on their slides. Restriction counts are not included.

The global backend scans up to ten official ranking pages until it finds 25 eligible unique 2026 plays. Only the highest-PP play per player and difficulty is retained. This is not a complete annual archive. Results are cached for 15 minutes per warm instance; upstream failures preserve personal stats and may return stale cached results. Popular-mapset searches use the existing osu! application's public client credentials, with no additional service account or database.

### Beatmap and replay panels

Watch beatmap opens the embedded [JoSu beatmap viewer](https://preview.tryz.id.vn/), using the most-played native difficulty for the selected mode. Buttons are enabled for all four modes; viewer support can vary. Global Watch replay verifies that the requested score belongs to the returned global top 25 before downloading it for the signed-in user. Personal replay downloads still require score ownership. Tokens are never sent to either viewer.

### Ranked mapper leaderboard

Global stats includes the top ten mapset hosts by unique currently ranked sets with a 2026 ranked date (UTC), filtered to native gamemodes. Each set counts once per matching mode, with guest difficulties excluded as separate credits. Ties share rank and are ordered by name. The UI displays snapshot time and catalogue coverage.

Refresh locally with `node scripts/update-ranked-mappers.mjs`. The script uses existing osu! app credentials from the environment or `.env`, scans the complete catalogue with cursor pagination and rate limiting, and replaces the snapshot only on successful completion.

The `Refresh ranked mapper leaderboard` GitHub Actions workflow refreshes daily at 08:23 UTC and supports manual runs. Add repository Actions secrets `OSU_CLIENT_ID` and `OSU_CLIENT_SECRET` (use the existing Wrapped app credentials) and allow Actions to write repository contents. Push the workflow and snapshot to the default branch to enable scheduled runs. Deploy the updated snapshot to publish refreshed counts.

### Playstyle clubs

One available 2026 score is enough to receive a club. The eighteen clubs are:

| Club | Qualifying signal |
| --- | --- |
| Overdrive | DT or NC on at least 40% of selected scores. |
| HR Headquarters | HR on at least 40%; excluded as a defining club for mania. |
| Afterdark | HD or FL on at least 50%. |
| No Mod, No Problem | Unmodified scores on at least 60%. |
| Precision Society | At least ten passed scores averaging 99% in osu!/taiko, 99.5% in catch, or 98% in mania. |
| The Repeat Offenders | At least 10,000 recorded 2026 plays and six months with at least 500 plays each. |
| Mapper Loyalists | At least 25% under one host, with three matching scores across two distinct mapsets. |
| The Wanderers | At least ten distinct hosts and ten artists; each unique-name count is at least half the score count. |
| EZ Does It | EZ on at least 40% of selected scores. |
| Close Enough Club | At least ten passed scores below 90% mean accuracy (95% in catch); considered after mod preferences. |
| Safety Net Society | SO/NF on at least 50% (NF only outside osu!); no inference of deranking intent. |
| Quality Over Quantity | 1-99 recorded 2026 profile plays across available months (all modes); competes by strength with other qualifying signals. |
| Time Capsule | At least 60% of all eligible 2026 scores in the current top 200 are on mapsets ranked in 2016 or earlier; at least five scores. |
| Class of 2026 | At least 60% of all eligible 2026 scores in the current top 200 are on mapsets ranked in 2026; at least five scores. |
| Crowd Favorites | At least 40% of all eligible 2026 scores in the current top 200 overlap the selected mode’s popular 2026 top 25 mapsets, spanning at least three distinct sets and five eligible scores. |
| Stable Loyalists | 100% confirmed osu!stable scores in the eligible 2026 top-200 sample. |
| Lazer Pioneers | 100% confirmed osu!lazer scores in the eligible 2026 top-200 sample. |
| All-Rounder | Fallback when no other qualifying signal takes priority. |

All qualifying signals are ranked by strength rather than by first-match priority. Every club can be primary or secondary; the top two distinct matches are selected. Client exclusivity and playcount no longer automatically override stronger playstyle signals. All-Rounder can represent a balanced mod mix and remains the fallback. See the club ranking guide for weights, thresholds, and tie-breaking. These are playful descriptions of available data, not complete play histories.

Every qualifying club is eligible for either role: the strongest signal becomes primary and the next distinct match becomes secondary. The precision-only badge has been replaced by the generic secondary archetype. The dashboard opens a scrollable legend of all eighteen clubs with the current club highlighted. The story uses a click-triggered evolution reveal with sound effects; text selection is disabled until the entrance animations finish. Reduced motion and mute are supported.

Recap PNGs include the club emblem, color, name, motto, and assignment reason. When earned, the secondary archetype appears on the right with a central divider. Clubs are computed per review; optional Neon tracking records pseudonymous assignments for community percentages. See [community setup](CLUB-COMMUNITY.md).

### Experience and recap updates

The story includes up to 27 slides, personal mod rankings before medal/replay recognition, and the club reveal after favorite artists. Music, counter ticks, impact effects, and one-time beat-aligned grade stamps accompany the experience. Navigating while paused shows finished slide states immediately without replaying skipped entrance effects on resume. The OhnePixel panel enters after a 1.5-second delay during playback.

The club and rarest medal cards share a compact responsive row, as do global mods and genres. Favorite mod percentages are visible inline. Medal rarity truncates to two decimal places and exposes its original decimal value on hover. Recap exports include primary club and optional Precision-minded secondary archetype. The legend uses a matching scrollbar and a full-width All-Rounder entry.

## Search indexing

The public Wrapped landing page has a canonical URL, descriptive search/social metadata, and static HTML introducing the app before JavaScript renders it. The Dev page links to the canonical `/osu-wrapped/` URL. Root `robots.txt` points to `sitemap.xml`; API/function routes are excluded from crawling and have noindex response headers. Authenticated reviews remain session-protected and are not sitemap entries.

After deployment, verify `/robots.txt`, `/sitemap.xml`, and `/osu-wrapped/` on the production domain. In Google Search Console, verify the `ronaldonater.com` property, submit `https://ronaldonater.com/sitemap.xml`, then inspect `https://ronaldonater.com/osu-wrapped/` and request indexing. These account actions have not been performed automatically. Indexing and ranking are decided by Google and are not guaranteed.


## v1.1.7 updates

- Eighteen playstyle clubs, including EZ Does It (EZ on at least 40% of selected scores), Safety Net Society (SO/NF on at least 50%, NF only outside standard), and Close Enough Club (at least ten passed scores averaging below 90%, or below 95% in catch).
- Quality Over Quantity qualifies for users with 1-99 recorded 2026 profile plays across available months and at least one eligible score. Missing or zero profile history does not qualify.
- Time Capsule (2016 or earlier), Class of 2026, and Crowd Favorites use the full eligible top-200 sample rather than only the top 25 scores.
- All new clubs have matching emblems and colors in the dashboard, legend, animated story, and recap exports.
- Optional Neon Free tracking shows community club percentages from one participant per year/mode/rule version. Repeat visits update existing pseudonymous records; database failures do not block Wrapped.
- Before deploying to an existing database, run `scripts/sql/club-community-v6.sql` in Neon SQL Editor. It supports the earlier schemas and retains participant records. Fresh databases use `scripts/sql/club-community.sql`. Rule version `2026-v13` counts participants as they generate a fresh review.


### Map-preference clubs and community schema

All score-based clubs use the complete deduplicated sample of eligible 2026 scores from the user's current top 200, including scores without PP. Precision Society and Close Enough Club use valid passed scores within that sample. Quality Over Quantity and Repeat Offenders use available monthly profile playcounts across all modes.

Time Capsule requires at least 60% of the sample on mapsets ranked in **2016 or earlier**. Class of 2026 requires at least 60% on mapsets ranked in **2026**. Crowd Favorites requires at least 40% on the selected mode's **25 most-played mapsets ranked in 2026**, spanning at least three distinct mapsets. Each requires at least five eligible scores. The popular top 25 is the comparison catalogue, not a limit on the user's score sample.

Missing map ranking dates are not counted as old/new matches. The backend attempts date enrichment across up to 200 scores, with four concurrent lookups and a shared three-second budget; successfully fetched dates cache for 24 hours per warm instance. Popular catalogue requests coalesce and cache for 15 minutes. Metadata failures do not block the review.

Only two SQL files are needed:

- `scripts/sql/club-community.sql`: create a fresh database table.
- `scripts/sql/club-community-v6.sql`: update any existing earlier schema directly, preserving participant records. Superseded v2-v5 migration files were removed; v6 upgrades all earlier schemas directly.

Current assignment rules are **`2026-v13`**. The SQL schema migration is now **v5**; no new SQL is needed if it has already been applied. Percentages include participants under the current rules as they generate a fresh review. Keep the database URL and tracking secret unchanged. See [community setup](CLUB-COMMUNITY.md) for private environment variables and deployment steps.

### Stable and lazer clubs

Stable Loyalists and Lazer Pioneers require 100% of the full eligible 2026 sample to have the same confirmed client. Mixed or missing metadata cannot qualify; CL alone is not a client detector. Client exclusivity competes by strength for either role. Modern stable scores have a positive legacy score ID; confirmed lazer records have a null legacy ID with a solo-score type or client build ID. Explicit boolean client metadata is also supported. Descriptions refer to the available sample rather than all lifetime scores. Run `scripts/sql/club-community-v6.sql` before deploying these clubs; assignment rule version is `2026-v13`. This migration preserves rows and supports all older schemas directly.


### Latest club updates (v1.1.7)

- 18 clubs, each with a unique hex color, emblem, legend entry, and recap styling.
- Stable Loyalists and Lazer Pioneers require 100% confirmed client usage across all eligible 2026 scores from the current top 200. Mixed or unknown client metadata does not qualify. These clubs compete by strength for either role.
- Time Capsule includes mapsets ranked in 2016 or earlier. Class of 2026 and Crowd Favorites also use the entire eligible sample, not just the user's top 25 scores.
- EZ Does It motto: "Smaller score. Bigger mind games."
- Legend community percentages stay aligned at the bottom of each card, and legend copy uses regular hyphens.
- Current assignment rules: `2026-v13`. Latest schema upgrade: `scripts/sql/club-community-v6.sql`. Run it in Neon SQL Editor before deploying if your database has not already been upgraded. It directly supports earlier schemas and retains existing participant rows. Fresh databases use `scripts/sql/club-community.sql`.
- Keep the connection string and tracking secret unchanged. Returning participants update their existing assignment when they generate a new review; percentages include the current rule version only.

## Primary and secondary club ranking

All 19 clubs can be primary or secondary. Qualification thresholds are preserved, but every match now competes by signal strength; the strongest two distinct matches fill those roles. All-Rounder additionally qualifies for a balanced mix of at least three mod combinations, five mapper hosts, and five artists with each mod family below 40%, or serves as fallback when nothing qualifies. Dashboard, story, legend, and recap all support arbitrary secondary clubs with matching artwork and colors. Community percentages count primary clubs only. Assignment rules are `2026-v13`; schema v5 requires no additional SQL for this change. See [ranking rules and weights](CLUB-RANKING.md).

## Evidence weighting and small-sample safeguards

Current assignment rules are `2026-v13`. Listed strength ranges are base weights: score-based candidates are multiplied by `0.5 + 0.5 * min(evidenceScoreCount / 20, 1)`; accuracy uses only valid passed scores for this count. Activity candidates use `0.75 + 0.25 * min(availableMonths / 6, 1)` instead. Full weighting begins at 20 evidence scores or six available months. One eligible score still receives a club, with a provisional message below 20 scores.

Mapper Loyalists additionally requires at least three matching scores across two distinct mapsets from the same host. Balanced All-Rounder considers at least three mod combinations, five hosts, and five artists, with no tracked mod family reaching 40%. All 19 clubs remain eligible for primary or secondary. Mode-specific accuracy thresholds remain heuristic; they are not claimed to be population-calibrated. This update needs no new SQL on schema v5.

## v1.1.17 updates

- All 19 clubs can be primary or secondary. Every qualifying signal is ranked; the strongest becomes primary and the next distinct match becomes secondary.
- Evidence weighting reduces the influence of small samples. One selected score remains eligible; reviews with fewer than 20 selected scores display a provisional note. Score-based signals reach full weight at 20 evidence scores, using valid passed scores for accuracy. Activity signals reach full weight at six available months.
- Mapper Loyalists requires three matching scores across at least two distinct mapsets. Balanced All-Rounder considers mod, mapper, and artist variety rather than mods alone.
- The legend displays personal Match strength in the top-right, separately from community primary-club percentages anchored at the bottom. Selected scores are defined once in the panel.
- Recap cards, story slides, and the dashboard support any secondary club with its own emblem, color, and explanation.
- The provisional club slide uses tighter spacing. The medal card has centered content, a framed medal, and a subtle glow.

### Current base strength ranges

| Signal | Base strength |
| --- | --- |
| High / low accuracy | 70-100 |
| Map age / popular maps | 68-96 |
| Mapper Loyalists | 60-95 |
| The Wanderers | 60-85 |
| Balanced All-Rounder | 60-80 |
| The Repeat Offenders | 55-80 |
| Quality Over Quantity | 55-80 |
| Stable Loyalists / Lazer Pioneers | 62 |
| Mod preferences | 40-55 |
| Fallback All-Rounder | 0 |

These are base weights, not probabilities. Actual Match strength applies evidence weighting. Qualification thresholds are unchanged unless described above. Exact ties use evidence coverage, then a deterministic order. Community percentages count primary clubs only.

Current assignment rules: `2026-v13`. The latest schema migration remains `scripts/sql/club-community-v6.sql`; no further SQL is needed if already applied. Fresh databases use `scripts/sql/club-community.sql`. Returning participants update their existing record when generating a fresh review. Database credentials and the tracking secret stay unchanged.


One Shot Society: SD or PF on at least 40% of selected scores; each score counts once. Base strength 40-55 with normal evidence weighting, eligible as primary or secondary. Existing databases must run `scripts/sql/club-community-v6.sql` before deployment; fresh databases use the base SQL. This migration preserves participant records. Assignment rules: `2026-v13`.
