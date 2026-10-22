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
