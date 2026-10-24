# Personal website

Static personal site hosted on Netlify.

## Layout

- `index.html` — landing page
- `pages/` — Dev, Social, and osu!AHR pages
- `assets/css/` — stylesheets
- `assets/js/` — browser scripts, concert reviews, and cover data
- `assets/images/` — profile pictures, project images, and NextUp logo
- `assets/icons/` — favicon and social/platform icons
- `assets/downloads/` — résumé
- `docs/` — setup instructions and third-party notices
- `archive/` — original website ZIP, preserved unchanged
- `netlify/functions/` — server-side YouTube view counts and Steam playtime
- `tests/` — automated checks

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

**v1.1.6:** Interactive experience with up to 27 slides, sixteen playstyle clubs and a club legend, primary/secondary club recap exports, personal mod breakdowns, global mod and genre rankings, and embedded replay/beatmap viewers. Global map and genre links preserve the selected gamemode; paused navigation shows completed slide states. No database is required; optional Neon Free tracking adds community club percentages.

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
- `scripts/sql/club-community-v4.sql`: update any existing earlier schema directly, preserving participant records. Superseded v2/v3 migration files were removed.

Current assignment rules are **`2026-v5`**. The SQL schema migration is still **v4**; no new SQL is needed if it has already been applied. Percentages include participants under the current rules as they generate a fresh review. Keep the database URL and tracking secret unchanged. See [community setup](docs/CLUB-COMMUNITY.md) for private environment variables and deployment steps.
