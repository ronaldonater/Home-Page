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

**v1.1.3:** Interactive experience with up to 27 slides, nine playstyle clubs and a club legend, primary/secondary club recap exports, personal mod breakdowns, global mod and genre rankings, and embedded replay/beatmap viewers. Global map and genre links preserve the selected gamemode; paused navigation shows completed slide states. No database is required.

The /osu-wrapped/ subpage is available directly; its Dev-page entry is managed manually. See [OAuth and deployment setup](docs/OSU-WRAPPED-SETUP.md) for its separate client and environment variables. Run node --test tests/*.test.mjs for the full test suite.

See the [Wrapped security review](docs/OSU-WRAPPED-SECURITY-REVIEW.md) for hardening changes, audit results, and post-deployment verification.
