# osu! playtime

The Social page reads osu!standard playtime for profile 7933825.
The Netlify function uses OSU_CLIENT_ID and OSU_CLIENT_SECRET from Netlify's
Production environment (Functions or All scopes). Mark the secret as secret;
never commit credentials. Register one OAuth application using client credentials
and public scope; a callback URL is unnecessary.

Push and deploy after saving the environment variables. The endpoint
`/.netlify/functions/osu-playtime` returns seconds, mode, and updatedAt.
A 503 means missing configuration; a 502 means authentication, profile data,
or the upstream service failed. Live Server cannot execute Netlify functions.

The page refreshes every ten minutes while visible; successful responses are
cached for ten minutes. Tokens are reused until shortly before expiration within
a warm function instance. Hours show at most one decimal place. This is recorded
osu!standard gameplay, not application-open time or a sum across rulesets.
Failures preserve the current display; fresh pages fall back to the HTML hours.

Run `node --test tests/osu-playtime.test.mjs` for mocked integration checks.
Reference: https://osu.ppy.sh/docs/index.html
