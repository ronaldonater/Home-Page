# osu! Wrapped 2026 subpage

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

Top-score Watch replay buttons open a sandboxed ReplayViewer panel. The backend authorizes the current player and verifies score ownership before downloading a replay; only the replay bytes are passed to https://www.replayviewer.com/?embed using its replayviewer:load interface. No osu! token is sent to that site. Downloads are bounded to 4 MiB and use no-store; image downloads remain bounded to 2 MiB. The CSP allows only that viewer as a frame source. Closing the panel aborts pending downloads and removes its message listener/frame. Missing replays and upstream download quotas may prevent playback. ReplayViewer currently lists no lazer-mod support. Full third-party playback requires live verification; this repository does not control that service. No OAuth client change or additional environment variable is required.

## Wrapped experience

Successful first-login data loading opens a nine-slide animated story. Seen state is localStorage keyed by player ID and year, so changing game mode does not replay it automatically. The Replay Experience button opens it anytime, including in the demo. Closing/skipping counts as seen; different browsers/devices or cleared storage may show it again. If storage is blocked, seen state lasts only for the current page. This is an animated web experience, not an exported video, and uses no autoplay audio. Controls support pause/play, previous/next, slide selection, swipe and Escape. Reduced-motion starts paused and disables entrance/counting animations. Hiding the browser tab pauses progress. No OAuth or environment-variable change is required.


Artist pictures use TheAudioDB v1 shared free key 123; no additional environment variables are required. The /artist-image endpoint validates exact artist names and approved artwork URLs, limits downloads to 512 KiB, coalesces identical in-flight requests, and caches up to 64 results in each warm function instance (24 hours for pictures, 1 hour for missing results). Successful images also use browser/CDN cache headers. A 25-lookups-per-minute guard applies per function instance, not globally across Netlify; upstream limits can still cause initials to display during traffic spikes. Missing or ambiguous artists use initials. Artwork attribution appears in the artist section and exported card.


Rarest 2026 medal: profile achievement timestamps are filtered using UTC, then matched by achievement ID to Osekai public medal data (https://osekai.net/medals/api/medals.php). Rarity percentages are current Osekai estimates, not the rarity at award time or an official global osu statistic. Data is cached for 24 hours per warm function instance; failures show unavailable, and incomplete matches are labeled Rarest matched medal. No API key or environment variables are required. Medal images use a validated same-origin proxy. Restart the local backend or redeploy after updating.
