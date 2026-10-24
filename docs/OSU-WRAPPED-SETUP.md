# osu! Wrapped 2026 subpage

**Version 1.1.6**

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

One available 2026 score is enough to receive a club. The sixteen clubs are:

| Club | Qualifying signal |
| --- | --- |
| Overdrive | DT or NC on at least 40% of selected scores. |
| HR Headquarters | HR on at least 40%; excluded as a defining club for mania. |
| Afterdark | HD or FL on at least 50%. |
| No Mod, No Problem | Unmodified scores on at least 60%. |
| Precision Society | At least ten passed scores averaging 99% in osu!/taiko, 99.5% in catch, or 98% in mania. |
| The Repeat Offenders | At least 10,000 recorded 2026 plays and six months with at least 500 plays each. |
| Mapper Loyalists | At least 25% of selected scores under one mapset host. |
| The Wanderers | At least ten distinct hosts and ten artists; each unique-name count is at least half the score count. |
| EZ Does It | EZ on at least 40% of selected scores. |
| Close Enough Club | At least ten passed scores below 90% mean accuracy (95% in catch); considered after mod preferences. |
| Safety Net Society | SO/NF on at least 50% (NF only outside osu!); no inference of deranking intent. |
| Quality Over Quantity | 1–99 recorded 2026 profile plays across available months (all modes); takes priority over other signals. |
| Time Capsule | At least 60% of all eligible 2026 scores in the current top 200 are on mapsets ranked in 2016 or earlier; at least five scores. |
| Class of 2026 | At least 60% of all eligible 2026 scores in the current top 200 are on mapsets ranked in 2026; at least five scores. |
| Crowd Favorites | At least 40% of all eligible 2026 scores in the current top 200 overlap the selected mode’s popular 2026 top 25 mapsets, spanning at least three distinct sets and five eligible scores. |
| All-Rounder | Fallback when no other qualifying signal takes priority. |

Quality Over Quantity takes priority when available 2026 monthly history totals 1–99 plays. Zero or missing history does not qualify. Next, map preferences are checked in this order: Crowd Favorites, Time Capsule, Class of 2026. They use the user’s entire deduplicated 2026 sample from the current top 200, including scores without PP. Missing ranked dates do not count, and the denominator includes all eligible scores. Otherwise mod preferences use percentages of the deduplicated selected-mode 2026 score sample from the current top 200, excluding CL. The largest qualifying mod share wins; ties use Overdrive, HR Headquarters, Afterdark, No Mod, EZ Does It, then Safety Net Society. Otherwise priority is precision, lower accuracy, regular activity, mapper loyalty, exploration, then All-Rounder. Repeat Offenders uses available monthly profile playcounts (across modes), not inferred retries. These are playful descriptions of available data, not complete play histories.

Users qualifying for precision alongside another primary club receive the **Precision-minded** secondary archetype. The dashboard opens a scrollable legend of all sixteen clubs with the current club highlighted. The story uses a click-triggered evolution reveal with sound effects; text selection is disabled until the entrance animations finish. Reduced motion and mute are supported.

Recap PNGs include the club emblem, color, name, motto, and assignment reason. When earned, the secondary archetype appears on the right with a central divider. Clubs are computed per review; optional Neon tracking records pseudonymous assignments for community percentages. See [community setup](CLUB-COMMUNITY.md).

### Experience and recap updates in v1.1.0

The story includes up to 27 slides, personal mod rankings before medal/replay recognition, and the club reveal after favorite artists. Music, counter ticks, impact effects, and one-time beat-aligned grade stamps accompany the experience. Navigating while paused shows finished slide states immediately without replaying skipped entrance effects on resume. The OhnePixel panel enters after a 1.5-second delay during playback.

The club and rarest medal cards share a compact responsive row, as do global mods and genres. Favorite mod percentages are visible inline. Medal rarity truncates to two decimal places and exposes its original decimal value on hover. Recap exports include primary club and optional Precision-minded secondary archetype. The legend uses a matching scrollbar and a full-width All-Rounder entry.

## Search indexing

The public Wrapped landing page has a canonical URL, descriptive search/social metadata, and static HTML introducing the app before JavaScript renders it. The Dev page links to the canonical `/osu-wrapped/` URL. Root `robots.txt` points to `sitemap.xml`; API/function routes are excluded from crawling and have noindex response headers. Authenticated reviews remain session-protected and are not sitemap entries.

After deployment, verify `/robots.txt`, `/sitemap.xml`, and `/osu-wrapped/` on the production domain. In Google Search Console, verify the `ronaldonater.com` property, submit `https://ronaldonater.com/sitemap.xml`, then inspect `https://ronaldonater.com/osu-wrapped/` and request indexing. These account actions have not been performed automatically. Indexing and ranking are decided by Google and are not guaranteed.


## v1.1.6 updates

- Sixteen playstyle clubs, including EZ Does It (EZ on at least 40% of selected scores), Safety Net Society (SO/NF on at least 50%, NF only outside standard), and Close Enough Club (at least ten passed scores averaging below 90%, or below 95% in catch).
- Quality Over Quantity takes priority for users with 1–99 recorded 2026 profile plays across available months and at least one eligible score. Missing or zero profile history does not qualify.
- Time Capsule (2016 or earlier), Class of 2026, and Crowd Favorites use the full eligible top-200 sample rather than only the top 25 scores.
- All new clubs have matching emblems and colors in the dashboard, legend, animated story, and recap exports.
- Optional Neon Free tracking shows community club percentages from one participant per year/mode/rule version. Repeat visits update existing pseudonymous records; database failures do not block Wrapped.
- Before deploying to an existing database, run `scripts/sql/club-community-v4.sql` in Neon SQL Editor. It supports the earlier schemas and retains participant records. Fresh databases use `scripts/sql/club-community.sql`. Rule version `2026-v5` counts participants as they generate a fresh review.


### Map-preference clubs and community schema

All score-based clubs use the complete deduplicated sample of eligible 2026 scores from the user's current top 200, including scores without PP. Precision Society and Close Enough Club use valid passed scores within that sample. Quality Over Quantity and Repeat Offenders use available monthly profile playcounts across all modes.

Time Capsule requires at least 60% of the sample on mapsets ranked in **2016 or earlier**. Class of 2026 requires at least 60% on mapsets ranked in **2026**. Crowd Favorites requires at least 40% on the selected mode's **25 most-played mapsets ranked in 2026**, spanning at least three distinct mapsets. Each requires at least five eligible scores. The popular top 25 is the comparison catalogue, not a limit on the user's score sample.

Missing map ranking dates are not counted as old/new matches. The backend attempts date enrichment across up to 200 scores, with four concurrent lookups and a shared three-second budget; successfully fetched dates cache for 24 hours per warm instance. Popular catalogue requests coalesce and cache for 15 minutes. Metadata failures do not block the review.

Only two SQL files are needed:

- `scripts/sql/club-community.sql`: create a fresh database table.
- `scripts/sql/club-community-v4.sql`: update any existing earlier schema directly, preserving participant records. Superseded v2/v3 migration files were removed.

Current assignment rules are **`2026-v5`**. The SQL schema migration is still **v4**; no new SQL is needed if it has already been applied. Percentages include participants under the current rules as they generate a fresh review. Keep the database URL and tracking secret unchanged. See [community setup](CLUB-COMMUNITY.md) for private environment variables and deployment steps.
