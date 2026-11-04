# Personal website

Static personal site hosted on Netlify.

## Layout

- `index.html` - landing page
- `pages/` - Dev, Social, K-Pop, and osu!AHR pages
- `assets/css/` - stylesheets
- `assets/js/` - browser scripts, concert reviews, and cover data
- `assets/images/` - profile pictures, project images, and NextUp logo
- `assets/images/kpop/` - group photos, logos, and member portraits, organized by artist
- `assets/icons/` - favicon and social/platform icons
- `assets/downloads/` - résumé
- `docs/` - setup instructions and third-party notices
- `archive/` - original website ZIP, preserved unchanged
- `netlify/functions/` - server-side YouTube view counts and Steam playtime
- `tests/` - automated checks

`netlify.toml`, `_redirects`, and `index.html` stay at the root for deployment.
The public page URLs are `/`, `/dev`, `/social`, `/kpop`, `/osu-ahr`, and `/osu-wrapped/`.
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
`/pages/social.html`, `/pages/dev.html`, `/pages/kpop.html`, or `/pages/osu-ahr.html` directly;
Live Server does not process Netlify's clean-URL rules or functions.

Run `node --test tests/youtube-views.test.mjs` from this directory.
Run `node --test tests/steam-playtime.test.mjs` to check Steam playtime.

## K-Pop collection

The Social page links to `/kpop`, a personal group and soloist collection with
heart ratings, favorite songs, photos, and K-Profiles links. Groups open member
bias rankings; soloist cards stay in the collection. Group rankings have direct
links such as `/kpop#kiss-of-life`.

- `pages/kpop.html` - page layout and temporary construction notices
- `assets/js/kpop-data.js` - artist ratings, songs, images, logos, links, and ordered member lists
- `assets/js/kpop-script.js` - filters, ranking views, flags, and automatic ages
- `assets/css/kpop-styles.css` - responsive layout and artist color palettes
- `assets/images/kpop/<artist-id>/` - locally hosted photos and logos

Edit the data file to maintain the collection. Member order determines rank;
positions, country flags, and birthdays are optional. Birthdays use `YYYY-MM-DD`;
ages update using the visitor's local date, including at midnight and when
returning to the tab. Group photos (`image`) and ranking-header logos (`logo`)
are separate fields. See the [K-Pop editing guide](docs/KPOP-LIST-EDITING.md)
for examples and image instructions.

Preview at `http://localhost:8888/kpop` with Netlify Dev. The K-Pop page itself
does not require API credentials; flag images load from FlagCDN and fonts from
Google Fonts. Push and deploy to publish data or image changes.

## osu! Wrapped 2026

**Version 1.1.62** | [Changelog](CHANGELOG.md) | [Detailed guide](docs/FEATURE-GUIDE.md)

A four-mode annual review with personal and global statistics, skillsets, playstyle/mapping clubs, an animated slideshow, portrait/landscape recap cards, and embedded replay/beatmap viewers. The demo uses bundled data, artwork, and slideshow audio previews without live generation or queue requests. External links and viewers still open their respective websites.

Favorite mapper and artist score counts open matching selected-beatmap panels with artwork and difficulty names. Tied counts rank by the highest associated PP play. The personal Top PP Plays list expands to use its panel's available height while retaining scrolling.

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

Completed results are cached for one hour; Refresh Wrapped regenerates the selected mode through the queue. Database fallback produces one browser console warning per page load, with sanitized details in server logs.

The demo does not require Neon or a queue. During Neon outages, personal profiles fall back to the previous loader: local pacing and cooldowns continue, but shared coordination is unavailable. See the [queue/cache guide](docs/FEATURE-GUIDE.md#persistent-profile-queue-and-shared-cache).

Artist portraits use TheAudioDB where available, with beatmap artwork as a fallback. TheAudioDB images may not match the intended artist; the stats page, artist slide, recap cards, FAQ, and credits explain this limitation. Recap credit text scales down as needed to fit on one line.

### Data scope and privacy

Score-based statistics use eligible 2026 scores from the selected mode's current top 200, not a complete annual archive. Monthly activity and medals are profile-wide. Eligible uploaders without selected scores receive mapping-only Wrapped. Users with neither eligible scores nor uploads cannot open a personal review.

Required data finishes loading before a profile is shown. Community percentages can be unavailable without blocking it. Temporary response/review caches are encrypted; access tokens and replay files are not stored in the database. Read the [security review](docs/OSU-WRAPPED-SECURITY-REVIEW.md), [club ranking guide](docs/CLUB-RANKING.md), and [feature guide](docs/FEATURE-GUIDE.md) for details.

### Verification and credits

Run `node --test tests/*.test.mjs` from the website root. Detailed demo-refresh and maintenance instructions are in the [feature guide](docs/FEATURE-GUIDE.md); release history is in [CHANGELOG.md](CHANGELOG.md).

Full attributions are available in the app's **Credits & Thanks** panel and [its source](osu-wrapped/src/credits.js), covering osu! / ppy, creators, Osekai, TheAudioDB, musicians, sound contributors, and embedded viewers. Independent fan project; not affiliated with ppy or osu!.

For the daily catalogue workflow, set the GitHub Actions repository secret `DATABASE_URL` to the live app's existing Neon connection string, alongside its existing osu! OAuth secrets. Rerun [api-budget.sql](scripts/sql/api-budget.sql) before deploying the shared player/snapshot scheduler. See the [feature guide](docs/FEATURE-GUIDE.md#shared-budget-for-daily-catalogue-refreshes).
