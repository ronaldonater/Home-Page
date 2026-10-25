# Personal website

Static personal site hosted on Netlify.

## Layout

- `index.html` - landing page
- `pages/` - Dev, Social, and osu!AHR pages
- `assets/css/` - stylesheets
- `assets/js/` - browser scripts, concert reviews, and cover data
- `assets/images/` - profile pictures, project images, and NextUp logo
- `assets/icons/` - favicon and social/platform icons
- `assets/downloads/` - résumé
- `docs/` - setup instructions and third-party notices
- `archive/` - original website ZIP, preserved unchanged
- `netlify/functions/` - server-side YouTube view counts and Steam playtime
- `tests/` - automated checks

`netlify.toml`, `_redirects`, and `index.html` stay at the root for deployment.
The public page URLs are `/`, `/dev`, `/social`, `/osu-ahr`, and `/osu-wrapped/`.
HTML asset paths are site-root-relative, so assets work at both the clean URLs
and the physical `/pages/*.html` paths. CSS image paths are relative to the CSS.

## Editing

Concert links, reviews, and song covers are in `assets/js/social-script.js`.
See [YouTube view-count setup](docs/YOUTUBE-VIEWS-SETUP.md) and
[third-party notices](docs/THIRD-PARTY-NOTICES.md).
See [Steam playtime setup](docs/STEAM-PLAYTIME-SETUP.md) for automatic game hours.
See [osu! playtime setup](docs/OSU-PLAYTIME-SETUP.md) for osu!standard hours.

## Preview and checks

Run `npx netlify-cli dev` from this directory to preview clean URLs and functions.
With VS Code Live Server, serve this directory as the root and open
`/pages/social.html`, `/pages/dev.html`, or `/pages/osu-ahr.html` directly;
Live Server does not process Netlify's clean-URL rules or functions.

Run `node --test tests/youtube-views.test.mjs` from this directory.
Run `node --test tests/steam-playtime.test.mjs` to check Steam playtime.

## osu! Wrapped 2026

**v1.1.16:** Interactive experience with up to 27 slides, nineteen playstyle clubs and a club legend, primary/secondary club recap exports, personal mod breakdowns, global mod and genre rankings, and embedded replay/beatmap viewers. Global map and genre links preserve the selected gamemode; paused navigation shows completed slide states. No database is required; optional Neon Free tracking adds community club percentages.

The /osu-wrapped/ subpage is available directly; its Dev-page entry is managed manually. See [OAuth and deployment setup](docs/OSU-WRAPPED-SETUP.md) for its separate client and environment variables. Run node --test tests/*.test.mjs for the full test suite.

See the [Wrapped security review](docs/OSU-WRAPPED-SECURITY-REVIEW.md) for hardening changes, audit results, and post-deployment verification.

## Optional community club percentages

Authenticated reviews can record pseudonymous club assignments in a separate Neon Free database. The dashboard, club legend, and story show community percentages once a mode has one participant. Repeat visits update the existing record. Tracking is disabled without configuration, and database outages do not block Wrapped. See [Neon setup and data scope](docs/CLUB-COMMUNITY.md).

### Map-preference clubs and community schema

All score-based clubs use the complete deduplicated sample of eligible 2026 scores from the user's current top 200, including scores without PP. Precision Society and Close Enough Club use valid passed scores within that sample. Quality Over Quantity and Repeat Offenders use available monthly profile playcounts across all modes.

Time Capsule requires at least 60% of the sample on mapsets ranked in **2016 or earlier**. Class of 2026 requires at least 60% on mapsets ranked in **2026**. Crowd Favorites requires at least 40% on the selected mode's **25 most-played mapsets ranked in 2026**, spanning at least three distinct mapsets. Each requires at least five eligible scores. The popular top 25 is the comparison catalogue, not a limit on the user's score sample.

Missing map ranking dates are not counted as old/new matches. The backend attempts date enrichment across up to 200 scores, with four concurrent lookups and a shared three-second budget; successfully fetched dates cache for 24 hours per warm instance. Popular catalogue requests coalesce and cache for 15 minutes. Metadata failures do not block the review.

Only two SQL files are needed:

- `scripts/sql/club-community.sql`: create a fresh database table.
- `scripts/sql/club-community-v6.sql`: update any existing earlier schema directly, preserving participant records. Superseded v2-v5 migration files were removed; v6 upgrades all earlier schemas directly.

Current assignment rules are **`2026-v13`**. The SQL schema migration is now **v5**; no new SQL is needed if it has already been applied. Percentages include participants under the current rules as they generate a fresh review. Keep the database URL and tracking secret unchanged. See [community setup](docs/CLUB-COMMUNITY.md) for private environment variables and deployment steps.

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

All 19 clubs can be primary or secondary. Qualification thresholds are preserved, but every match now competes by signal strength; the strongest two distinct matches fill those roles. All-Rounder additionally qualifies for a balanced mix of at least three mod combinations, five mapper hosts, and five artists with each mod family below 40%, or serves as fallback when nothing qualifies. Dashboard, story, legend, and recap all support arbitrary secondary clubs with matching artwork and colors. Community percentages count primary clubs only. Assignment rules are `2026-v13`; schema v5 requires no additional SQL for this change. See [ranking rules and weights](docs/CLUB-RANKING.md).

## Evidence weighting and small-sample safeguards

Current assignment rules are `2026-v13`. Listed strength ranges are base weights: score-based candidates are multiplied by `0.5 + 0.5 * min(evidenceScoreCount / 20, 1)`; accuracy uses only valid passed scores for this count. Activity candidates use `0.75 + 0.25 * min(availableMonths / 6, 1)` instead. Full weighting begins at 20 evidence scores or six available months. One eligible score still receives a club, with a provisional message below 20 scores.

Mapper Loyalists additionally requires at least three matching scores across two distinct mapsets from the same host. Balanced All-Rounder considers at least three mod combinations, five hosts, and five artists, with no tracked mod family reaching 40%. All 19 clubs remain eligible for primary or secondary. Mode-specific accuracy thresholds remain heuristic; they are not claimed to be population-calibrated. This update needs no new SQL on schema v5.

### Wrapped v1.1.16 updates

- Standardized the website introduction credit to lowercase `ronaldonater`.
- On desktop, the five visible genre rows expand to fill the space beside the mod rankings, with remaining genres scrollable. Mobile retains compact rows.
- Genre rankings now cover all currently ranked mapsets with a 2026 ranked date in the selected native gamemode, instead of only the 25 most-played mapsets. Each unique mapset counts once; missing genre metadata is counted as Unknown genre.
- The global genre panel lists every genre in a keyboard-accessible scroll list with five entries visible initially. The slideshow shows only the top five genres.
- The genre slide appears immediately after "New patterns. More ways to play." (the total mapsets ranked in 2026 slide).
- Genre counts and percentages refresh through the existing daily ranked-catalogue GitHub Actions workflow. No new secrets or workflow settings are required; the refreshed snapshot is included.
- Centered the full-width All-Rounder legend heading and simplified the One Shot Society requirement wording.
- Added One Shot Society for SD/PF players: at least 40% of selected scores, with a 40-55 base strength and support as a primary or secondary club.
- Community tracking now supports 19 clubs under assignment rules `2026-v13`. Run `scripts/sql/club-community-v6.sql` for an existing database; use `scripts/sql/club-community.sql` for a fresh database. Superseded migrations have been removed.
- Personal Wrapped requires at least one eligible 2026 score from the selected mode's current top 200. With zero eligible scores, an explanation replaces the dashboard and its slideshow/recap controls; switching modes remains available.
- Slides automatically scale to fit the available screen space while playback and navigation controls remain full-size.
- Keyboard arrow navigation survives slide content changes without requiring another click, and yields to other open panels.
- Removed the arrow from the “Click the play to view score” hint.
- All 19 clubs can be primary or secondary. Every qualifying signal is ranked; the strongest becomes primary and the next distinct match becomes secondary.
- Evidence weighting reduces the influence of small samples. One selected score remains eligible; reviews with fewer than 20 selected scores display a provisional note. Score-based signals reach full weight at 20 evidence scores, using valid passed scores for accuracy. Activity signals reach full weight at six available months.
- Mapper Loyalists requires three matching scores across at least two distinct mapsets. Balanced All-Rounder considers mod, mapper, and artist variety rather than mods alone.
- The legend displays personal Match strength in the top-right, separately from community primary-club percentages anchored at the bottom. Selected scores are defined once in the panel.
- Recap cards, story slides, and the dashboard support any secondary club with its own emblem, color, and explanation.
- The provisional club slide uses tighter spacing. The medal card has centered content, a framed medal, and a subtle glow.

#### Current base strength ranges

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

Genre rankings now cover all currently ranked 2026 mapsets in the selected native gamemode, using the daily catalogue snapshot. The slideshow shows the top five; the global panel shows every genre in a scrollable list with five rows visible initially. Each unique mapset counts once, including an Unknown genre category for missing metadata.
