# osu! Wrapped changelog

Release history moved from the README. See [README.md](README.md) for current setup and deployment instructions.

## v1.1.40 updates

- Simplified the README to focus on features, setup, deployment, data scope, privacy, and credits.
- Moved release history into CHANGELOG.md and preserved detailed feature and maintenance notes in docs/FEATURE-GUIDE.md.
- Added documentation links and retained the personal website's unrelated README sections.
- Removed the superseded club-community-v12.sql migration from both copies and corrected remaining setup references to v13.
- Updated the version indicator to v1.1.40.

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
