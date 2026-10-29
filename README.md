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

**Version 1.1.39**

Supports all four modes, up to 29 slides (including the optional mapping slide), 26 playstyle clubs, six separate mapping clubs, recap exports, real-map demos, global rankings, and embedded replay/beatmap viewers. Personal reviews require at least one eligible 2026 score or hosted mapset first submitted in 2026. Community percentages optionally use Neon.

See [OAuth and deployment setup](docs/OSU-WRAPPED-SETUP.md), [security review](docs/OSU-WRAPPED-SECURITY-REVIEW.md), and [club ranking guide](docs/CLUB-RANKING.md). Public routes are `/osu-wrapped/` and `/api/osu-wrapped/`; use the private `WRAPPED_` environment variables documented in setup. Run `node --test tests/*.test.mjs` from the website root.

## v1.1.39 updates

- Added a persistent, duplicate-protected user/game-mode queue with a visible queue position, one active profile per client budget, resumable batches, fair batch yielding, and abandoned-job recovery.
- Added encrypted cross-instance response caching and short-lived completed-review caching to reduce repeated upstream work. OAuth tokens and replay downloads are not saved.
- Profile loading keeps required data hidden until ready, with detailed progress, automatic retries, and prompt continuation after successful enrichment batches instead of a fixed 60-second pause.
- Neon outages fall back to the previous staged loader with local request pacing and osu! rate-limit cooldowns. Unavailable community percentages do not block Wrapped; global queue coordination resumes when storage recovers.
- Bundled an October 29, 2026 demo snapshot for all four modes, including skillsets and global statistics, so demo opening, mode switching, and slideshow startup need no live data lookups or image preload waits.
- Saved 336 demo image references locally for covers, avatars, and medal artwork, including slideshow and portrait/landscape recap exports. Added maintainer scripts to refresh demo data and images deliberately.
- Live reviews reuse bundled beatmap backgrounds on an exact cover-URL match only. Unmatched covers, live avatars, artist portraits, and medals retain their normal loading paths; audio-preview fallback is preserved.
- Skillset entries now link to their corresponding osu! beatmap search in a new tab.
- Added mobile spacing between the selected-score badge and the average-beatmap cards.
- Deployment: apply `scripts/sql/api-budget.sql` if not already installed and `scripts/sql/review-queue.sql` in the existing Neon database. Both are safe to rerun. No new secrets or community-table migrations are required for these queue changes.

## v1.1.38 updates

- Added community-voted skillset rankings for exact played difficulties to the dashboard, a conditional slideshow slide, and portrait/landscape recap cards, with score counts, percentages, and checked/tagged coverage.
- The dashboard lists all available skillsets in a themed scroll area showing five entries initially; slides and recap cards keep the top five. Alternate displays as Alt. The skillset slide includes a subtle decorative pie chart.
- Placed average beatmap and skillset panels side by side on desktop, aligned their split with surrounding panels and top statistic cards, compacted skillset rows, and aligned panel descriptions at the bottom. Mobile panels remain stacked.
- Added Easy Tempo for HT/DC on at least 40% of selected scores, with 40-55 base strength, a rewind icon, and support throughout the existing club presentation and community tracking.
- Expanded Afterdark to include FI and CO in osu!mania, and One Shot Society to include AC alongside SD/PF, retaining their existing thresholds and strength ranges.
- Added owner-managed early-access admins with profile pictures, live add/remove controls, and automatic hiding of the Admin panel once the release is public.

- Added a release countdown until November 29, 2026 at 00:00 UTC, with server-enforced pre-release restrictions and automatic public opening.
- Added a subtle osu! admin sign-in link; early access is restricted to ronaldonater's verified account ID (7933825). Personal endpoints retain normal authentication after release.
- Expanded playstyle clubs to 27 with Artist Loyalists, One-Map Wonders, Short & Sweet, Long Haul Club, and Modded Only; all support primary/secondary traits, the legend, slides, recap cards, and community tracking.
- Rebalanced base strengths: mapper/artist/mapset loyalty and length clubs 55-80, Modded Only 60, accuracy clubs 65-90, and Choke Artists 70-95.
- Length clubs use mod-adjusted durations: 60% at <=1:30 for Short & Sweet or >=3:30 for Long Haul Club, with at least five selected scores.
- Sorted the legend by general strength ranges while keeping All-Rounder last, and refreshed the mapper, mapset, and long-map artwork.
- Existing Neon databases must apply `scripts/sql/club-community-v13.sql` before deployment. This cumulative migration preserves existing rows. Current assignment rules: `2026-v27`. The countdown itself requires no new SQL or environment variables.
- Validation: 188 standalone tests and 210 website tests pass; the standalone production build passes.

## v1.1.37 updates

- Stabilized recap zoom sizing to prevent scrollbar-related jumps, especially with landscape cards.
- Themed the recap viewer's horizontal and vertical scrollbars to match the dark panels.
- Centered the landscape most-active-month count and caption together within the right-hand section.

## v1.1.36 updates

- Enlarged the primary playstyle club in landscape recap cards when no secondary archetype is available, with a left-aligned layout.
- Centered the final unpaired average-beatmap metric on the mobile stats page.

## v1.1.35 updates

- Applied Aller Bold only to the footer's osu! wordmark.
- Set the wordmark to an exact 18px size and adjusted its letter spacing to balance it with the existing Wrapped text.

## v1.1.34 updates

- Fixed live recap previews by permitting generated blob image URLs in the production image security policy.
- Wait for preview images to decode before enabling image actions or reporting that a card is ready.
- Clean up unused preview URLs when formats change or panels close, and show an error if the image cannot load.
- Added a production-policy regression check; no SQL or environment-variable changes required.

## v1.1.33 updates

- Added portrait/landscape recap selection, expandable zoomable previews, and click-outside dismissal for Share and Save panels.
- Refined landscape styling, card spacing, grade alignment, mapping showcase placement, and score-coverage footer.
- Added stable finale preview transitions with format controls that follow the card; both panels allow changing formats.
- Added a speaker-hover volume slider for slideshow music and sound effects, preserving mute state and relative audio levels.
- Added inline accuracy/combo displays and full-combo color highlights, with consistent global/personal list typography.
- Promoted the console easter egg above dialogs and automatically pause/resume a playing slideshow during the effect.
- Made the closing song loop consistently on the final slide.
- Allowed generated blob image previews in the production image security policy and wait for preview decoding before enabling image actions.
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
- Deployment: existing databases must run `scripts/sql/club-community-v13.sql` for the current playstyle clubs and `scripts/sql/mapping-community.sql` for mapping tracking. Existing Netlify database variables are reused.

## Community database setup

The database is optional for reviews, slides and exports. It enables community primary-club percentages after one participant. Demos are never recorded; failed tracking does not block the review. Aggregates cache for one minute.

- Fresh playstyle database: run `scripts/sql/club-community.sql`.
- Existing playstyle database: run `scripts/sql/club-community-v13.sql`. It directly upgrades earlier schemas and retains existing rows.
- Mapping community: additionally run `scripts/sql/mapping-community.sql` in the same database and branch. It creates `wrapped_mapping_club_assignments` independently of `wrapped_club_assignments`.
- Superseded migrations have been removed. The v13 upgrade includes all earlier playstyle club IDs; no intermediate migrations are required.
- Standalone Functions variables: `DATABASE_URL`, `CLUB_TRACKING_SECRET`.
- Website Functions variables: `WRAPPED_DATABASE_URL`, `WRAPPED_CLUB_TRACKING_SECRET`.

Playstyle assignments count once per participant/year/mode under `2026-v27`. Mapping assignments count once per mapper/year across modes under `mapping-2026-v1`. Only current-rule assignments enter percentages; returning users refresh existing records. Keep the secret stable. Neither table stores raw osu! IDs, usernames, tokens, full reviews, or replay files. See [community setup](docs/CLUB-COMMUNITY.md).

## Evidence and ranking

All 26 playstyle clubs can be primary or secondary. Strongest evidence-adjusted signal wins, followed by the next distinct match. Exact ties use supporting coverage, then definition order. Score evidence uses `0.5 + 0.5 * min(evidenceScores / 20, 1)`; accuracy uses valid passed scores. Activity evidence uses `0.75 + 0.25 * min(availableMonths / 6, 1)`, using replay-history months for Replay Society. One eligible score remains enough; fewer than 20 scores receive a provisional note. These are design weights, not probabilities. See [ranking guide](docs/CLUB-RANKING.md).

## Personal mapping and recap

Hosted mapsets first submitted in 2026 (UTC) are counted across all modes, deduplicated by set ID. The service paginates ranked, loved, pending and graveyard catalogues with a 15-minute cache. Guest difficulties hosted by others, deleted sets and unsubmitted maps are excluded. Ranked status is current. Missing/incomplete data is unavailable rather than zero.

The panel shows submissions, their currently ranked subset, combined all-time plays, a mapping club, and the most-played upload. Club criteria and matching accent colors appear on the badge; a button opens the themed legend. Community share appears on the right on desktop and stacks on mobile. The legend shows scope, then the primary community summary, then all six clubs.

The mapping slide follows the playstyle reveal and precedes global community statistics. It plays the most-played upload's complete audio preview. The recap shows three counters, then a divided row with club logo/name/motto/criteria and the most-played upload's cover/title/artist/playcount. Both slide and recap are omitted without a valid positive 2026 submission count, including unavailable data; no extra recap space is reserved. Zero counts can still appear on the dashboard.

## Demo data

Each mode includes real public metadata for ten native-mode mapsets from at least ten distinct hosts, including artwork and previews. Scores, PP, dates, activity, mapping totals and medal award dates remain fictional and labeled. Silver S/SS grades require HD or FL. The example medal displays a dated Osekai ownership snapshot. Demo community tracking is disabled. Refresh fixtures with `node scripts/update-demo-beatmaps.mjs` using local app credentials; no runtime credentials are needed for demos.

### Playstyle clubs

One available 2026 score is enough to receive a club. The 27 clubs are:

| Club | Qualifying signal |
| --- | --- |
| Overdrive | DT or NC on at least 40% of selected scores. |
| Hardrock Headquarters | HR on at least 40%; excluded as a defining club for mania. |
| Easy Tempo | HT or DC on at least 40% of selected scores; 40-55 base strength. |
| Afterdark | HD or FL (also FI or CO in osu!mania) on at least 50%. |
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
| One Shot Society | SD, PF or AC on at least 40% of selected scores. |
| Choke Artists | At least five selected scores, three qualifying passes and a 30% share: exactly one miss, or standard passes with no misses and exactly one reported slider combo-break event. |
| Replay Society | At least 500 replay views received by others in available 2026 monthly history across modes. |
| Artist Loyalists | At least 25% for one artist, with three matching scores across two distinct mapsets. |
| One-Map Wonders | At least 25% from one mapset, across at least three distinct beatmap difficulties. |
| Short & Sweet | At least 60% on maps <=1:30 after mods; at least five selected scores. |
| Long Haul Club | At least 60% on maps >=3:30 after mods; at least five selected scores. |
| Modded Only | Every selected score uses at least one gameplay mod, with zero No Mod scores. |
| All-Rounder | At least three mod combinations, five hosts and five artists, with every mod family below 40%; also the fallback when no signal qualifies. |

All qualifying signals are ranked by strength rather than by first-match priority. Every club can be primary or secondary; the top two distinct matches are selected. Client exclusivity and playcount no longer automatically override stronger playstyle signals. All-Rounder can represent a balanced mod mix and remains the fallback. See the club ranking guide for weights, thresholds, and tie-breaking. These are playful descriptions of available data, not complete play histories.

Every qualifying club is eligible for either role: the strongest signal becomes primary and the next distinct match becomes secondary. The precision-only badge has been replaced by the generic secondary archetype. The dashboard opens a scrollable legend of all 27 clubs with the current club highlighted. The story uses a click-triggered evolution reveal with sound effects; text selection is disabled until the entrance animations finish. Reduced motion and mute are supported.

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

Playstyle assignment rules are `2026-v27`. Replay Society uses the existing playstyle community table and v13 migration; mapping tracking remains independent.

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

Attribute enrichment is server-side, with four concurrent requests, a 3.5-second request budget, at most 24 uncached beatmap/mode/mod combinations per review, shared in-flight requests, and a 24-hour warm-instance success cache. Failures briefly cache and keep required attribute checks pending; rate limiting stops further lookups in that batch. Subsequent loading batches continue until those checks finish. Shared persistence uses the queue migration described below; no new secrets are required. The demo includes real base difficulty/length metadata and cached official HD/DT attributes for its existing maps; demo scores and profile activity remain fictional. Missing values in live reviews display an em dash (-).

Beatmap averages also appear in a dedicated personal slideshow slide and a compact recap card grid. Metric coverage labels show the number of included scores. Mapping-only reviews omit these score-based sections.

## Recap card layouts and sharing

Recap cards support portrait and landscape PNG exports, including mapping-only reviews. Dashboard Save recap card and Share actions open a preview panel with a portrait/landscape choice. Click the preview to expand it with zoom-in/out, fit reset, mouse-wheel zoom, dragging, double-click zoom, keyboard controls, and touch pinch/pan. Close the viewer to return to the chooser. Clicking outside the Share or Save panel closes it; clicks and drags inside do not.

The finale has arrow controls to switch its preview between formats. Its Save and Share actions start with the selected format, and both panels allow changing it again. Cached previews are reused within each open panel; image actions wait for the selected card to finish rendering.

The finale reserves a fixed preview area, keeps the current image visible while the next variant loads, and crossfades after decoding. Switching formats keeps the heading, buttons, and decorative heart in place. The format arrows and label animate to sit beneath the visible card. Reduced-motion skips these transitions.

Landscape cards share the portrait design details: pink header glow and playcount tile, accuracy grade, source descriptors, month accent, mod artwork, framed primary/secondary club logos and reasons, shaded score-grade overlays, mapper/artist portraits with fallbacks, medal metadata, and an aligned mapping club/upload showcase. Both layouts use compact spacing and aligned PP, accuracy/combo, and date rows. The landscape footer includes a SCORE COVERAGE heading and a right-aligned fan-project credit. Single-club landscape panels use an enlarged, left-aligned primary trait; unpaired average-beatmap metrics are centered on the mobile stats page.

## Slideshow audio controls

Hover over the speaker button or focus/tap it to reveal a volume slider aligned beneath the control-button group. It adjusts music and sound effects together while preserving their relative levels, including quiz sounds and fades. Click-to-mute remains available; unmuting restores the last nonzero volume.

## Top-play combos and presentation

Personal and global top-play lists show accuracy and combo together, such as `99.55% · 418×`, on stats pages and slides. Portrait and landscape recap cards also include personal play combos. Combo text matches the accuracy typography. Confirmed full combos use lime green without a visible FC suffix; light slides use a darker green for contrast, while featured personal/global score slides retain lime green over their artwork. Full-combo status follows explicit API flags, not accuracy or rank; missing combo data remains unavailable.

The global dashboard top-play list matches personal-list typography. Global PP/accuracy/combo and popular-map play counts are centered above their respective Watch buttons.

Counter ticks use a predecoded low-latency Web Audio sample with leading-silence trimming, short fade envelopes, bounded overlapping voices, and tick-rate limiting. Suspended mobile audio never queues stale ticks; the fallback reuses idle preloaded players instead of cutting off a playing sample. Pause, mute, volume changes, slide navigation, and closure stop or update the counter audio appropriately.

### Artist Loyalists

Artist Loyalists ("You know who makes your favorite songs.") mirrors Mapper Loyalists: at least 25% of selected scores must feature one artist, with at least three matching scores across two distinct mapsets. Artist credits are compared case-insensitively with whitespace normalized; collaborations remain the credited artist string rather than being split. Base strength ranges from 55 at 25% to 80 at 100%, with the normal score-evidence adjustment. It can be primary or secondary and appears throughout the dashboard, legend, slideshow and recap cards.

Before deployment, run `scripts/sql/club-community-v13.sql` in the existing Neon database to allow the new club ID. No rows are deleted or new environment variables required. Returning participants refresh to assignment rules `2026-v27` when they revisit; percentages include current-rule assignments.

### One-Map Wonders

"Different difficulties. Same obsession." At least 25% of selected scores must come from one mapset, spanning at least three confirmed distinct beatmap difficulties. Multiple scores or mod combinations on the same difficulty do not satisfy the three-difficulty requirement. Base strength is 55-80, with the standard sample-size adjustment; eligible as primary or secondary. The legend places it beside the loyalty clubs. Existing Neon databases must run `scripts/sql/club-community-v13.sql` before deployment; existing rows are preserved. Assignment rules are `2026-v27`. No new environment variables are needed.

### Map-length clubs

Short & Sweet ("Straight to the good part.") requires at least 60% of selected scores on maps no longer than 1:30. Long Haul Club ("You’re here for the whole song.") requires at least 60% on maps at least 3:30 long. Both require five selected scores and use mod-adjusted total length including breaks. Missing or invalid lengths never count toward either club; percentages use the entire selected sample. TV-size/full-size titles are not inferred. Both have base strength 55-80 with standard score evidence weighting and can be primary or secondary. All-Rounder remains last in the legend.

Existing Neon databases must apply `scripts/sql/club-community-v13.sql` before deployment. This cumulative migration includes the earlier loyalty and mapset clubs, preserves participant records, and requires no new environment variables. Rules version: `2026-v27`.

### Modded Only

"Vanilla was never on the menu." Requires zero No Mod plays across all selected scores: every selected score must use at least one gameplay mod. CL is excluded, so CL-only scores count as No Mod. One selected score remains eligible; the normal score-evidence adjustment applies to the fixed base strength of 60. It can be primary or secondary and appears throughout the dashboard, legend, slideshow and recap cards. Existing Neon databases must run `scripts/sql/club-community-v13.sql` before deployment; this cumulative migration includes all previous clubs and preserves existing records. Assignment rules: `2026-v27`.

### Release countdown and admin early access

Until November 29, 2026 at 00:00 UTC, viewers see a live days/hours/minutes/seconds countdown. A subtle "If you’re an admin, login here." link starts the existing osu! OAuth flow. Early access is restricted server-side to the permanent owner (osu! account ID 7933825, ronaldonater) and users on the owner-managed allowlist, matched by numeric identity rather than a user-supplied name. Accounts outside the allowlist return to the countdown without receiving an early-access session. Existing sessions are verified against osu! before granting access. Review, global, replay, and image API routes are blocked for non-admins before release; release-status and admin responses are not cached. The frontend only imports the interactive app after the server allows access. Public access opens automatically at the UTC deadline, using server time for the countdown. If the status service is unavailable, the page remains locked and retries. OAuth credentials are unchanged; no new environment variables or SQL are needed for the countdown. Use the full local Netlify server for testing; Vite alone does not provide the release-status endpoint.

### Owner-managed early-access admins

The navbar shows an Admin button only for ronaldonater (verified osu! account 7933825). The panel adds users by osu! username or numeric ID and removes existing entries; only the owner may list or mutate the allowlist. Added admins get pre-release access, not permission to manage other admins. IDs are resolved through osu! and stored server-side; names are display labels. Owner access is permanent and cannot be removed. Access checks read the allowlist without a permissions cache, so removals apply on the next server request, including existing signed-in sessions. Already downloaded content is not erased. The panel refreshes its list every ten seconds while open and visible.

Run `scripts/sql/admin-allowlist.sql` once in Neon before deploying admin management. It creates a separate `wrapped_release_admins` table with RLS enabled and does not change club tables. Reuse the existing private `DATABASE_URL` (standalone) or `WRAPPED_DATABASE_URL` (website); no new environment variables are needed. Missing/unavailable admin storage denies additional-user early access while the permanent owner remains able to sign in. At release, public access opens normally; the admin-management endpoint remains owner-only. Mutations require POST, a matching Origin, and an authenticated owner session. Sign out reloads the release gate.

The Admin navbar button is pre-release only. It is hidden once the release becomes public, and an already-open admin panel closes automatically at the server-derived release deadline without reloading. The underlying management endpoint remains authenticated and owner-only.

## Community skillset tags

The stats page ranks all available community skillset tags from the exact difficulties in selected 2026 scores. Five entries are initially visible; additional entries are accessible through a themed, keyboard-focusable scrolling list. A conditional skillset slide and both recap card formats show the top five when tags are available. Alternate is displayed as Alt. The slide includes a decorative pie chart icon. Each skillset counts once per selected score; percentages use all selected scores and can overlap. Coverage shows how many scores were checked and tagged. These describe map patterns, not measured player proficiency. Ordinary mapper tags are not used as substitutes.

Tag enrichment uses the osu! beatmapset API with at most 24 uncached mapsets per review, four concurrent requests, a four-second request budget, and a six-hour in-memory success cache. Difficulties with no tags count as successfully checked. Failed tag lookups keep the profile hidden until a retry completes coverage. Cancelled tag batches are not negatively cached, allowing the next batch to continue. No database migration or new environment variables are needed.

### Easy Tempo and expanded mod families

Easy Tempo: "Good music deserves a little more time." HT or DC must appear on at least 40% of selected scores. Its base strength grows from 40 to 55 with the qualifying share, followed by the normal score-evidence adjustment. It can be primary or secondary, uses its own colour and rewind-style icon, and appears in the legend, dashboard, slides, recap cards, and community percentages. Each score contributes once even if multiple mods from the same family are reported.

Afterdark retains its 50% threshold and includes HD/FL across supported modes plus FI/CO in osu!mania. One Shot Society retains its 40% threshold and now includes AC alongside SD/PF. These mod families retain their 40-55 base strength range.

Existing Neon databases must run `scripts/sql/club-community-v13.sql` before deploying Easy Tempo. The migration extends the allowed club IDs without deleting participant rows. Fresh installations use `scripts/sql/club-community.sql`. Assignments use `2026-v27`; returning participants update their existing records. No additional environment variables are required.

## osu! API request budget

Before deploying API throttling, run `scripts/sql/api-budget.sql` in the existing Neon database. This creates a separate RLS-enabled budget table and does not modify club records. The existing database URL and osu! client ID are reused. If Neon is unavailable, API requests continue with local request pacing and a 60-second database retry backoff. Cross-instance coordination resumes when the database recovers; it cannot be guaranteed during an outage. Community percentages show as temporarily unavailable and do not block Wrapped. All other required review data must still finish loading.

Runtime osu! API and OAuth requests share request-start pacing of at least 1.1 seconds. With Neon configured, an atomic database admission check coordinates separate Netlify instances using the same client ID and database. HTTP 429 responses trigger a cooldown using Retry-After (60 seconds if missing), propagated through the shared budget. Requests cancelled before admission never contact osu!. There are no automatic upstream retries.

Exact beatmapset lookups share six-hour in-memory cached responses bounded to 128 entries / 32 MiB and coalesce concurrent requests, so ranked-date and skillset enrichment reuse one upstream lookup. Existing enrichment deadlines remain in place; unfinished required enrichment batches continue through the loading screen rather than issuing a burst. Core profile loads may wait longer under load. Asset/CDN images and third-party APIs are outside this osu! API budget.

Without a database, pacing is local to each warm function instance and does not guarantee a shared deployment-wide limit. Local caches do not persist across cold starts. Other applications and the separately scheduled catalogue refresh are not covered by the runtime budget; their traffic must also be considered when sharing an osu! OAuth client.

## Complete-data loading

Wrapped remains hidden until profile and score data, exact-difficulty user-tag checks, required enrichment services, global statistics, and artwork preparation have completed. Community percentages may be temporarily unavailable without blocking the review. Loading progress retains the profile/scores, user tags, additional details, and artwork stages. Transient failures automatically retry with bounded exponential backoff and Retry-After cooldowns; there is no manual retry button or partial-profile fallback. Permanent authentication failures stop loading and require signing in again.

Successfully checked maps without tags, unsupported attributes confirmed by the API, absent medal metadata in a successfully retrieved snapshot, and existing image fallbacks are completed results rather than pending requests. Failed required services keep the loading screen visible; community-percentage failures do not. Completed mapping catalogue pages and cancelled enrichment batches can be reused by subsequent attempts. The persistent queue also requires `scripts/sql/review-queue.sql`; it reuses the existing database and session-secret variables.


## Persistent profile queue and shared cache

**Before deploying, run `scripts/sql/review-queue.sql` in the Neon SQL Editor**, in the same database as `api-budget.sql`. Run it once per database; the script is safe to rerun and leaves club/admin tables unchanged. No new secrets are needed: standalone uses `DATABASE_URL`, `SESSION_SECRET`, and `OSU_CLIENT_ID`; the integrated website uses `WRAPPED_DATABASE_URL`, `WRAPPED_SESSION_SECRET`, and `WRAPPED_OSU_CLIENT_ID`.

With a database configured, authenticated profile requests join one durable job per user and game mode. The database admits one active job per osu! client budget, with a separate 60-second work lock preventing duplicate tabs or server instances from processing the same batch. Queue position appears on the loading screen; polling slows from 10 to 30 seconds farther back in the queue. Long jobs yield between batches after 90 seconds when others are waiting. Abandoned jobs stop holding the slot after two minutes without a heartbeat, once their work lock has expired. Processing resumes as browsers poll; this is not an unattended background worker.

Successful osu! JSON responses are encrypted using a key derived from the existing session secret, so completed batches survive refreshes and server-instance changes. Public mapset metadata and difficulty attributes can be reused across users; personal profile/score/mapping responses use token-isolated hashed cache keys. OAuth exchanges, replay downloads, and failed responses are not cached. Tokens are not stored in queue records or cache payloads. Completed reviews expire after 15 minutes, profile/score responses after five minutes, mapping pages after 15 minutes, mapset responses after six hours, and attributes after 24 hours. Expired data is ignored immediately and physically removed incrementally by subsequent queue activity; cleanup is not a separate scheduled task. Browser-facing responses remain private/no-store.

The existing global API pacing and HTTP 429 cooldowns still apply. If Neon or the queue schema is unavailable, profile requests fall back to the previous staged loader with local API pacing and 429 cooldowns. Queue storage is checked again after a short backoff, and shared caching backs off for 60 seconds on database errors. Global queue admission and cross-instance request coordination cannot be guaranteed during this fallback. Failure to save queue progress does not discard an otherwise completed review. Authentication and release restrictions remain unchanged. Community-only failures remain nonblocking. Without any database configured, local development retains its original unqueued behavior and the demo works normally. Queue admission does not bypass the release gate or authentication. No profile is displayed before the required data and artwork preparation finish.


## Instant saved demo

The demo profile, skillset tags, global rankings, popular mapsets, genre totals, and average-beatmap values for all four modes are bundled in `demo-snapshot.json`, captured on October 29, 2026 (UTC). Demo opening, mode changes, the global dashboard, and slideshow startup do not call the profile API, enter the queue, wait for Neon, or wait for artist/mod image preloading. The demo uses saved beatmap-cover fallbacks instead of live TheAudioDB lookups. Images and audio still load normally as media; optional replay/viewer actions and recap image exports can request their media separately. Demo scores, profile activity, and mapping totals remain fictional; real map metadata and global rankings are dated snapshot data. Each call returns a fresh copy so preview edits cannot alter the bundled snapshot.

To intentionally refresh the snapshot, run `node scripts/snapshot-demo.mjs` locally with the existing osu! app credentials available. It uses paced public API lookups, saves only completed snapshots, and never writes access tokens or credentials to the output. It is not run for visitors or as part of the deployment build. Existing demo-map/attribute refresh scripts update the source fixtures; run the snapshot command afterward to publish those changes into the saved demo.


Demo artwork is also bundled locally: `demo-images.json` maps the frozen snapshot's remote image references to saved covers, mapper/player avatars, and medal artwork. Dashboard, slideshow, and both recap layouts use these static assets for demo data. Live profiles also reuse exact matching beatmap backgrounds as described below; their avatars and medal images retain their existing paths. Mod icons and the OhnePixel thumbnail were already bundled. Audio previews remain streamed. To recapture images after changing the demo snapshot, run `node scripts/snapshot-demo-images.mjs` and commit the generated manifest and image directory. Missing images use a bundled placeholder rather than a visitor-time external lookup.


Live reviews also reuse bundled demo beatmap backgrounds when the full osu! cover URL matches a successfully saved image exactly. This applies to profile/global covers, slideshow artwork, beatmap-cover fallbacks, mapping showcases, and recap exports. Unmatched URLs retain their normal loading path. Avatars, artist portraits, and medal images are not reused from the demo for live profiles. This avoids image downloads/proxy calls, not score/tag/attribute API requests. Saved artwork stays frozen until recaptured; a changed cover URL automatically uses the normal live path.
