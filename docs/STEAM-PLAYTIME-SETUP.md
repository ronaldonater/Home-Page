# Steam playtime

The Social page loads EA FC27 (4080220) and WWE 2K26 (3717070) totals
from the Steam profile `ronaldonater1`, matching the site's Steam link.
The Netlify function resolves that profile to its SteamID automatically.

Set `STEAM_API_KEY` as a secret Netlify environment variable in Production
(Functions scope or All scopes). Never put the key in browser code or Git.
Keep Steam Game details public, disable the total-playtime privacy checkbox,
and do not mark these games private. Then push the changes and deploy.

The page fetches on load and every ten minutes while visible. Netlify caches
successful responses for ten minutes. Hours use at most one decimal place.
These are Steam's reported totals, not a second-by-second timer.
Missing games or errors preserve the existing displayed hours. On a fresh page
without a successful response, the manually entered HTML counts remain.

After deploying, visit `/.netlify/functions/steam-playtime` on the site:
a successful response contains `minutes` keyed by the two game IDs.
A 503 means the key is missing; a 502 may indicate private game details,
an invalid key, an unavailable profile, or a Steam outage.
An empty or partial `minutes` object means Steam did not provide valid totals
for all configured games.

Use Netlify Dev for local function testing; Live Server cannot run functions.
Production-only keys are not available locally or in deploy previews.
Run `node --test tests/steam-playtime.test.mjs` for mocked integration checks.

API reference: https://partner.steamgames.com/doc/webapi/IPlayerService
