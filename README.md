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

**Version 1.1.52** | [Changelog](CHANGELOG.md) | [Detailed guide](docs/FEATURE-GUIDE.md)

A four-mode annual review with personal and global statistics, skillsets, playstyle/mapping clubs, an animated slideshow, portrait/landscape recap cards, and embedded replay/beatmap viewers. The demo uses bundled data and artwork; music previews still stream.

### Setup and deployment

Follow [OAuth and deployment setup](docs/OSU-WRAPPED-SETUP.md). Public routes are `/osu-wrapped/` and `/api/osu-wrapped/`. Keep `WRAPPED_OSU_CLIENT_ID`, `WRAPPED_OSU_CLIENT_SECRET`, `WRAPPED_OSU_REDIRECT_URI`, and `WRAPPED_SESSION_SECRET` private and available to Functions. The production OAuth callback is `https://ronaldonater.com/api/osu-wrapped/auth/callback`.

The release gate opens November 29, 2026 at 00:00 UTC. Approved admins receive early access; personal routes still require authentication after release.

For Neon features, reuse `WRAPPED_DATABASE_URL` and `WRAPPED_CLUB_TRACKING_SECRET` and apply the required SQL in the existing database:

| Purpose | SQL script |
| --- | --- |
| Fresh playstyle community database | [club-community.sql](scripts/sql/club-community.sql) |
| Upgrade an existing playstyle community database | [club-community-v13.sql](scripts/sql/club-community-v13.sql) |
| Mapping community percentages | [mapping-community.sql](scripts/sql/mapping-community.sql) |
| Shared osu! API pacing | [api-budget.sql](scripts/sql/api-budget.sql) |
| Persistent profile queue and shared cache | [review-queue.sql](scripts/sql/review-queue.sql) |
| Early-access admin management | [admin-allowlist.sql](scripts/sql/admin-allowlist.sql) |

The demo does not require Neon or a queue. During Neon outages, personal profiles fall back to the previous loader: local pacing and cooldowns continue, but shared coordination is unavailable. See the [queue/cache guide](docs/FEATURE-GUIDE.md#persistent-profile-queue-and-shared-cache).

### Data scope and privacy

Score-based statistics use eligible 2026 scores from the selected mode's current top 200, not a complete annual archive. Monthly activity and medals are profile-wide. Eligible uploaders without selected scores receive mapping-only Wrapped. Users with neither eligible scores nor uploads cannot open a personal review.

Required data finishes loading before a profile is shown. Community percentages can be unavailable without blocking it. Temporary response/review caches are encrypted; access tokens and replay files are not stored in the database. Read the [security review](docs/OSU-WRAPPED-SECURITY-REVIEW.md), [club ranking guide](docs/CLUB-RANKING.md), and [feature guide](docs/FEATURE-GUIDE.md) for details.

### Verification and credits

Run `node --test tests/*.test.mjs` from the website root. Detailed demo-refresh and maintenance instructions are in the [feature guide](docs/FEATURE-GUIDE.md); release history is in [CHANGELOG.md](CHANGELOG.md).

Full attributions are available in the app's **Credits & Thanks** panel and [its source](osu-wrapped/src/credits.js), covering osu! / ppy, creators, Osekai, TheAudioDB, musicians, sound contributors, and embedded viewers. Independent fan project; not affiliated with ppy or osu!.

For the daily catalogue workflow, set the GitHub Actions repository secret `DATABASE_URL` to the live app's existing Neon connection string, alongside its existing osu! OAuth secrets. Rerun [api-budget.sql](scripts/sql/api-budget.sql) before deploying the shared player/snapshot scheduler. See the [feature guide](docs/FEATURE-GUIDE.md#shared-budget-for-daily-catalogue-refreshes).
