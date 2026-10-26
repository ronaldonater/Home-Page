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

**Version 1.1.24**

Supports all four modes, up to 28 slides (including the optional mapping slide), 21 playstyle clubs, six separate mapping clubs, recap exports, real-map demos, global rankings, and embedded replay/beatmap viewers. Personal reviews require at least one eligible 2026 score or hosted mapset first submitted in 2026. Community percentages optionally use Neon.

See [OAuth and deployment setup](docs/OSU-WRAPPED-SETUP.md), [security review](docs/OSU-WRAPPED-SECURITY-REVIEW.md), and [club ranking guide](docs/CLUB-RANKING.md). Public routes are `/osu-wrapped/` and `/api/osu-wrapped/`; use the private `WRAPPED_` environment variables documented in setup. Run `node --test tests/*.test.mjs` from the website root.

## v1.1.24 updates

- Renamed HR Headquarters to Hardrock Headquarters and added a rock-hand logo.
- Refreshed Lazer Pioneers, Close Enough Club, Class of 2026, Crowd Favorites, Choke Artists, and Ranked Debut icons.
- Renamed Community Soundtrack to Crowd Pleasers with a cheering-crowd logo.
- Shared artwork updates apply across the dashboard, legend, slideshow, and recap. No SQL changes are required.

## v1.1.23 updates

- Added a subtle animated rainbow outline to the current mapping club label in the legend.
- The outline rotates on a nine-second loop and remains static when reduced motion is enabled.

## v1.1.22 updates

- Changed the decorative landing-page hit circle from 2 to 1.

## v1.1.21 updates

- Allow users with eligible 2026 uploads and no eligible scores to access mapping-only Wrapped.
- Add a focused mapping dashboard, slideshow path, and dedicated recap without empty score-based sections.
- Tighten mapping recap spacing and frame the mapping club logo to match the dashboard.
- Users with neither eligible scores nor uploads remain blocked. No database migration is required.

## v1.1.20 updates

- Fixed mapping club colors on the live website by replacing inline styles with CSP-safe CSS classes.
- Badges, legend entries, and community percentages now use consistent club accent colors without changing the security policy.

## v1.1.19 updates

- Added six independent mapping clubs with qualification criteria, shared vector logos, and a themed legend panel.
- Added mapping community percentages backed by a separate Neon table, counting each mapper once across all game modes.
- Refined mapping club cards and recap exports, including the club logo, motto, criteria, and most-played 2026 upload.
- Omit mapping sections from the slideshow and recap when no eligible 2026 uploads exist.
- Added Replay Society as a primary or secondary playstyle club, with a logarithmic strength scale based on replay views received in 2026.
- Improved club legend descriptions, consistent accent colors, and mapping button styling.
- Deployment: existing databases must run `scripts/sql/club-community-v8.sql` for Replay Society and `scripts/sql/mapping-community.sql` for mapping tracking. Existing Netlify database variables are reused.

## Community database setup

The database is optional for reviews, slides and exports. It enables community primary-club percentages after one participant. Demos are never recorded; failed tracking does not block the review. Aggregates cache for one minute.

- Fresh playstyle database: run `scripts/sql/club-community.sql`.
- Existing playstyle database: run `scripts/sql/club-community-v8.sql`. It directly upgrades earlier schemas and retains existing rows.
- Mapping community: additionally run `scripts/sql/mapping-community.sql` in the same database and branch. It creates `wrapped_mapping_club_assignments` independently of `wrapped_club_assignments`.
- Earlier v6/v7 files may remain as historical migrations; they are not prerequisites for v8.
- Standalone Functions variables: `DATABASE_URL`, `CLUB_TRACKING_SECRET`.
- Website Functions variables: `WRAPPED_DATABASE_URL`, `WRAPPED_CLUB_TRACKING_SECRET`.

Playstyle assignments count once per participant/year/mode under `2026-v15`. Mapping assignments count once per mapper/year across modes under `mapping-2026-v1`. Only current-rule assignments enter percentages; returning users refresh existing records. Keep the secret stable. Neither table stores raw osu! IDs, usernames, tokens, full reviews, or replay files. See [community setup](docs/CLUB-COMMUNITY.md).

## Evidence and ranking

All 21 playstyle clubs can be primary or secondary. Strongest evidence-adjusted signal wins, followed by the next distinct match. Exact ties use supporting coverage, then definition order. Score evidence uses `0.5 + 0.5 * min(evidenceScores / 20, 1)`; accuracy uses valid passed scores. Activity evidence uses `0.75 + 0.25 * min(availableMonths / 6, 1)`, using replay-history months for Replay Society. One eligible score remains enough; fewer than 20 scores receive a provisional note. These are design weights, not probabilities. See [ranking guide](docs/CLUB-RANKING.md).

## Personal mapping and recap

Hosted mapsets first submitted in 2026 (UTC) are counted across all modes, deduplicated by set ID. The service paginates ranked, loved, pending and graveyard catalogues with a 15-minute cache. Guest difficulties hosted by others, deleted sets and unsubmitted maps are excluded. Ranked status is current. Missing/incomplete data is unavailable rather than zero.

The panel shows submissions, their currently ranked subset, combined all-time plays, a mapping club, and the most-played upload. Club criteria and matching accent colors appear on the badge; a button opens the themed legend. Community share appears on the right on desktop and stacks on mobile. The legend shows scope, then the primary community summary, then all six clubs.

The mapping slide follows the playstyle reveal and precedes global community statistics. It plays the most-played upload's complete audio preview. The recap shows three counters, then a divided row with club logo/name/motto/criteria and the most-played upload's cover/title/artist/playcount. Both slide and recap are omitted without a valid positive 2026 submission count, including unavailable data; no extra recap space is reserved. Zero counts can still appear on the dashboard.

## Demo data

Each mode includes real public metadata for ten native-mode mapsets from at least ten distinct hosts, including artwork and previews. Scores, PP, dates, activity, mapping totals and medal award dates remain fictional and labeled. Silver S/SS grades require HD or FL. The example medal displays a dated Osekai ownership snapshot. Demo community tracking is disabled. Refresh fixtures with `node scripts/update-demo-beatmaps.mjs` using local app credentials; no runtime credentials are needed for demos.

### Playstyle clubs

One available 2026 score is enough to receive a club. The 21 clubs are:

| Club | Qualifying signal |
| --- | --- |
| Overdrive | DT or NC on at least 40% of selected scores. |
| Hardrock Headquarters | HR on at least 40%; excluded as a defining club for mania. |
| Afterdark | HD or FL on at least 50%. |
| No Mod, No Problem | Unmodified scores on at least 60%. |
| Precision Society | At least ten passed scores averaging 99% in osu!/taiko, 99.5% in catch, or 98% in mania. |
| The Repeat Offenders | At least 10,000 recorded 2026 plays and six months with at least 500 plays each. |
| Mapper Loyalists | At least 25% under one host, with three matching scores across two distinct mapsets. |
| The Wanderers | At least ten distinct hosts and ten artists; each unique-name count is at least half the score count. |
| EZ Does It | EZ on at least 40% of selected scores. |
| Close Enough Club | At least ten passed scores below 90% mean accuracy (95% in catch); competes by strength. |
| Safety Net Society | SO/NF on at least 50% (NF only outside osu!); no inference of deranking intent. |
| Quality Over Quantity | 1-99 recorded 2026 profile plays across available months (all modes); competes by strength with other qualifying signals. |
| Time Capsule | At least 60% of all eligible 2026 scores in the current top 200 are on mapsets ranked in 2016 or earlier; at least five scores. |
| Class of 2026 | At least 60% of all eligible 2026 scores in the current top 200 are on mapsets ranked in 2026; at least five scores. |
| Crowd Favorites | At least 40% of all eligible 2026 scores in the current top 200 overlap the selected mode’s popular 2026 top 25 mapsets, spanning at least three distinct sets and five eligible scores. |
| Stable Loyalists | 100% confirmed osu!stable scores in the eligible 2026 top-200 sample. |
| Lazer Pioneers | 100% confirmed osu!lazer scores in the eligible 2026 top-200 sample. |
| One Shot Society | SD/PF on at least 40% of selected scores. |
| Choke Artists | At least five selected scores, three qualifying passes and a 30% share: exactly one miss, or standard passes with no misses and exactly one reported slider combo-break event. |
| Replay Society | At least 500 replay views received by others in available 2026 monthly history across modes. |
| All-Rounder | At least three mod combinations, five hosts and five artists, with every mod family below 40%; also the fallback when no signal qualifies. |

All qualifying signals are ranked by strength rather than by first-match priority. Every club can be primary or secondary; the top two distinct matches are selected. Client exclusivity and playcount no longer automatically override stronger playstyle signals. All-Rounder can represent a balanced mod mix and remains the fallback. See the club ranking guide for weights, thresholds, and tie-breaking. These are playful descriptions of available data, not complete play histories.

Every qualifying club is eligible for either role: the strongest signal becomes primary and the next distinct match becomes secondary. The precision-only badge has been replaced by the generic secondary archetype. The dashboard opens a scrollable legend of all 21 clubs with the current club highlighted. The story uses a click-triggered evolution reveal with sound effects; text selection is disabled until the entrance animations finish. Reduced motion and mute are supported.

Recap PNGs include the club emblem, color, name, motto, and assignment reason. When earned, the secondary archetype appears on the right with a central divider. Clubs are computed per review: optional Neon tracking stores pseudonymous assignments to calculate participant percentages; see the community setup guide.

### Mapping clubs

Mapping clubs have separate assignments and community percentages from playstyle clubs. The mapping panel includes a six-club legend; the mapping slide and recap feature the first qualifying club in this order:

1. Crowd Pleasers: at least 100,000 combined lifetime plays on 2026 submissions.
2. Ranked & Recognized: at least 3 currently ranked 2026 submissions.
3. Ranked Debut: at least 1 currently ranked 2026 submission, regardless of earlier ranked mapsets.
4. Pattern Factory: at least 10 mapsets submitted in 2026.
5. Hidden Gems: at least 5 submissions, none currently ranked.
6. First Draft Society: at least 1 submission in 2026, regardless of earlier mapping history.

All qualifying clubs are marked in the legend. First Draft Society covers every eligible mapper not assigned a higher-priority club. Statistics cover hosted mapsets first submitted in 2026 (UTC), across all modes. Multi-Mode Architects is excluded. Community tracking setup is described below.

### Mapping club community tracking

Run `scripts/sql/mapping-community.sql` in the Neon SQL Editor before deploying. This creates a separate table and leaves existing playstyle data intact. Reuse the existing private database and tracking-secret variables: `DATABASE_URL` / `CLUB_TRACKING_SECRET` for the standalone app, or `WRAPPED_DATABASE_URL` / `WRAPPED_CLUB_TRACKING_SECRET` for the website integration. No new secrets are required.

Authenticated Wrapped requests register one primary mapping club per mapper per year, across all modes. Only users with an eligible 2026 upload qualify; demos and unavailable mapping data are excluded. Revisiting updates an existing assignment. Percentages describe participating mappers, not all osu! users, and appear after one participant. Aggregates cache for one minute. Tracking stores a domain-separated HMAC key, year, all-mode scope, club ID, rule version and timestamps; no raw user IDs or usernames. Missing database configuration disables tracking; database failures leave Wrapped usable. Keep the tracking secret stable to avoid duplicate participant keys. Mapping ranking changes require a new mapping rules version.

### Replay Society

Replay Society - "Your plays deserve another look." Requires at least 500 views received on the user's replays in available 2026 monthly profile history (all modes). This measures views by others, not replays the user watched, and not unique viewers. Source: https://osu.ppy.sh/docs/ (UserStatistics.replays_watched_by_others); monthly history uses replays_watched_counts.

500 per year is a provisional, deliberately substantial design threshold (about 42 per month over a full year), not a verified percentile or population average. No reliable population distribution was available during implementation. Base strength is 55 + 25 * clamp(log10(views / 500) / 2, 0, 1): 55 at 500, 67.5 at 5,000, 80 at 50,000+. Apply the same activity confidence multiplier as other activity clubs: 0.75 + 0.25 * min(available replay-history months / 6, 1). No annualization of partial-year data; missing or invalid history cannot qualify. It can be a primary or secondary trait.

Playstyle assignment rules are `2026-v15`. Replay Society uses the existing playstyle community table and v8 migration; mapping tracking remains independent.

## Mapping-only Wrapped

Users with no eligible 2026 scores in the selected mode can still participate when they have at least one hosted mapset first submitted in 2026 across all modes. Their dashboard focuses on uploads, mapping club and mapping community percentages. The slideshow includes the opening, personal mapping slide with preview, community section and finale; it skips personal score, mod, accuracy, favorite mapper/artist, quizzes and playstyle club slides. The dedicated compact recap includes upload counters, mapping club and most-played upload, with no empty score sections. Save/share/JSON and first-login playback remain available. Users with neither eligible scores nor uploads remain blocked; unavailable mapping data does not grant eligibility. No SQL changes are required.
