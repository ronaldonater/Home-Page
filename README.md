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

**Version 1.1.33**

Supports all four modes, up to 29 slides (including the optional mapping slide), 21 playstyle clubs, six separate mapping clubs, recap exports, real-map demos, global rankings, and embedded replay/beatmap viewers. Personal reviews require at least one eligible 2026 score or hosted mapset first submitted in 2026. Community percentages optionally use Neon.

See [OAuth and deployment setup](docs/OSU-WRAPPED-SETUP.md), [security review](docs/OSU-WRAPPED-SECURITY-REVIEW.md), and [club ranking guide](docs/CLUB-RANKING.md). Public routes are `/osu-wrapped/` and `/api/osu-wrapped/`; use the private `WRAPPED_` environment variables documented in setup. Run `node --test tests/*.test.mjs` from the website root.

## v1.1.33 updates

- Added portrait/landscape recap selection, expandable zoomable previews, and click-outside dismissal for Share and Save panels.
- Refined landscape styling, card spacing, grade alignment, mapping showcase placement, and score-coverage footer.
- Added stable finale preview transitions with format controls that follow the card; both panels allow changing formats.
- Added a speaker-hover volume slider for slideshow music and sound effects, preserving mute state and relative audio levels.
- Added inline accuracy/combo displays and full-combo color highlights, with consistent global/personal list typography.
- Promoted the console easter egg above dialogs and automatically pause/resume a playing slideshow during the effect.
- Made the closing song loop consistently on the final slide.
- No SQL migration or additional environment variables required.

## v1.1.32 updates

- Added average beatmap statistics to the stats page, a dedicated slideshow slide, and recap cards, with base and supported mod-adjusted values.
- Ordered metrics as star rating, length, BPM, AR, OD, circle size/key count, and HP, with concise score counts and mode-appropriate fields.
- Balanced incomplete slide rows, aligned the slide note beneath the final row, and added a subtle chart decoration.
- Compacted the recap averages grid and placed its explanatory note in the unused bottom-right space.
- Fixed opening music continuity through the personal mods slide after inserting the averages slide.
- Updated the Crowd Pleasers motto to "Someone's favorite started in your editor."
- Added portrait/landscape recap selection, expandable zoomable previews, and click-outside dismissal for Share and Save panels.
- Matched landscape card styling and metadata to portrait cards; refined spacing, alignment, footer coverage, and mapping presentation.
- Added stable crossfades and moving format controls on the finale, plus a speaker-hover volume slider for music and sound effects.
- Added combo counts and full-combo color highlights across personal/global stats and slides and personal recap cards.
- Allowed the console easter egg to overlay dialogs and automatically pause/resume a playing slideshow.
- Matched global list typography to the personal list and centered result stacks over Watch buttons.
- No SQL migration or additional environment variables required.

## v1.1.31 updates

- Version-only maintenance release; no functional changes since v1.1.30.

## v1.1.30 updates

- Preload artist portraits and beatmap-background fallbacks before showing stats and opening the slideshow.
- Preload and decode required personal and global mod icons, including demo and slideshow images.
- Share cached image loads and use bounded waits so unavailable images do not block the experience indefinitely.

## v1.1.29 updates

- Removed redundant inline playstyle-legend styles that triggered production Content Security Policy errors.
- Smoothed the mobile OhnePixel panel entrance with thumbnail preloading and a lighter browser-driven animation; desktop behavior is unchanged.
- Reduced quiz-answer sound latency with preloaded/decoded audio, a low-latency Web Audio path, and reusable fallback players.
- Quiz sounds start before answer-display updates and retain mute and cleanup support.

## v1.1.28 updates

- Added the hidden `secret()` browser-console Easter egg with supplied WYSI audio and falling pointing emojis / 727 text.
- Optimized the effect with cached sprites, a 30 FPS cap, lower-resolution rendering and a limited particle count.
- Added an automatic fade-out, Escape cancellation, tab-visibility cleanup, and clean restarts.
- Added playful console messages and credited Aireu under Music & sound.

## v1.1.27 updates

- Applied consistent smaller external-link arrows to slideshow links, including score, source, beatmap, and finale links.
- Added a footer version indicator that reads directly from package.json and updates automatically with version bumps.

## v1.1.26 updates

- Reduced mobile stat-card arrow sizes and standardized their font to better match desktop.
- Updated README mobile presentation details and corrected slideshow/audio wording in the website setup guide.

## v1.1.25 updates

- Prevent iOS emoji substitution for link arrows and replace the decorative asterisk with SVG.
- Adapt long mobile quiz labels to their button width, allowing taller buttons for exceptional names.
- Match the All-Rounder legend card to the other cards on mobile while retaining its centered desktop layout.

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

## Mobile presentation

Link arrows request Unicode text presentation to avoid iOS emoji substitution. The decorative landing-page asterisk uses SVG. Mobile quiz answer labels shrink from 15px toward 11px to fit approximately three lines; exceptionally long names can increase button height instead of overflowing. Fitting updates when the stage resizes or fonts finish loading. All-Rounder uses the same left-aligned legend layout as other clubs at widths up to 600px; its desktop card remains centered.

The footer displays the app version directly from its package.json, so version bumps automatically update the visible indicator.

## Console Easter egg

Running `secret()` in the browser console plays the bundled `wysi.mp3` clip and rains down pointing emojis and 727 text. The command returns `WYSI!`; page load and activation also display playful console messages. The credits panel attributes the Easter egg to Aireu.

The effect uses cached canvas sprites, a 30 FPS cap and at most 40 particles (12 with reduced motion). It ignores pointer input so the page stays usable. Audio ending or the 30-second safety limit triggers a 0.8-second fade before cleanup. Escape or hiding the tab stops it immediately; invoking the command again restarts it without stacking effects. Browser autoplay rules may require clicking the page before running the command. Reduced-motion settings reduce density, size variation and speed.

The console easter egg uses the browser top layer above panels and the slideshow. A playing slideshow pauses until the effect finishes fading or is dismissed; an already paused slideshow stays paused. Re-running the effect keeps the slideshow paused until the replacement finishes. Escape dismisses the effect without closing the underlying panel.

Sources: `src/secret.js` in the standalone app and `osu-wrapped/src/secret.js` in the website copy. Audio: `public/sounds/wysi.mp3` (standalone) and `osu-wrapped/sounds/wysi.mp3` (website). No new environment variables, external services, or SQL changes are needed. The footer version badge reads the app's package version automatically.

## Average beatmap statistics

The personal dashboard includes unweighted mean star rating, total map duration (including breaks), BPM, AR, OD, CS/key count, and HP across all deduplicated eligible 2026 scores in the current top 200. Each metric shows base and mod-adjusted values with independent coverage counts. Missing or unsupported values are excluded, never replaced with zero. AR appears only for standard/catch, OD is omitted for catch, CS is omitted for taiko, and mania displays key count instead of circle size. Mapping-only users do not receive score averages.

Supported fixed-rate DT/NC/HT/DC settings adjust BPM and duration. HR/EZ and Difficulty Adjust modify supported difficulty settings; standard OD and standard/catch AR include rate effects. Current mod-specific star ratings and available AR/OD attributes come from the official difficulty-attributes endpoint. No historical difficulty reconstruction is claimed. Variable-rate or unsupported mod settings can reduce adjusted coverage. Base and adjusted averages may cover different score subsets.

Attribute enrichment is server-side, with four concurrent requests, a 3.5-second request budget, at most 24 uncached beatmap/mode/mod combinations per review, shared in-flight requests, and a 24-hour warm-instance success cache. Failures briefly cache and remain nonfatal; rate limiting stops further queued lookups in that batch. Further combinations can populate on later reviews. No database migration or new secrets are required. Demo metadata can have incomplete coverage; absent fields remain unavailable.

Beatmap averages also appear in a dedicated personal slideshow slide and a compact recap card grid. Metric coverage labels show the number of included scores. Mapping-only reviews omit these score-based sections.

## Recap card layouts and sharing

Recap cards support portrait and landscape PNG exports, including mapping-only reviews. Dashboard Save recap card and Share actions open a preview panel with a portrait/landscape choice. Click the preview to expand it with zoom-in/out, fit reset, mouse-wheel zoom, dragging, double-click zoom, keyboard controls, and touch pinch/pan. Close the viewer to return to the chooser. Clicking outside the Share or Save panel closes it; clicks and drags inside do not.

The finale has arrow controls to switch its preview between formats. Its Save and Share actions start with the selected format, and both panels allow changing it again. Cached previews are reused within each open panel; image actions wait for the selected card to finish rendering.

The finale reserves a fixed preview area, keeps the current image visible while the next variant loads, and crossfades after decoding. Switching formats keeps the heading, buttons, and decorative heart in place. The format arrows and label animate to sit beneath the visible card. Reduced-motion skips these transitions.

Landscape cards share the portrait design details: pink header glow and playcount tile, accuracy grade, source descriptors, month accent, mod artwork, framed primary/secondary club logos and reasons, shaded score-grade overlays, mapper/artist portraits with fallbacks, medal metadata, and an aligned mapping club/upload showcase. Both layouts use compact spacing and aligned PP, accuracy/combo, and date rows. The landscape footer includes a SCORE COVERAGE heading and the fan-project credit centered within its right-hand area.

## Slideshow audio controls

Hover over the speaker button or focus/tap it to reveal a volume slider aligned beneath the control-button group. It adjusts music and sound effects together while preserving their relative levels, including quiz sounds and fades. Click-to-mute remains available; unmuting restores the last nonzero volume.

## Top-play combos and presentation

Personal and global top-play lists show accuracy and combo together, such as `99.55% · 418×`, on stats pages and slides. Portrait and landscape recap cards also include personal play combos. Combo text matches the accuracy typography. Confirmed full combos use lime green without a visible FC suffix; light slides use a darker green for contrast, while featured personal/global score slides retain lime green over their artwork. Full-combo status follows explicit API flags, not accuracy or rank; missing combo data remains unavailable.

The global dashboard top-play list matches personal-list typography. Global PP/accuracy/combo and popular-map play counts are centered above their respective Watch buttons.
