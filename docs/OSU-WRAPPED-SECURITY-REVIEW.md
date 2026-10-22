# osu! Wrapped security review — October 22, 2026

Scope: the standalone app and the Wrapped subpage in WIPAboutMe. This is a source review, dependency audit, regression-test pass, and limited read-only production check, not an independent penetration test or a guarantee of zero vulnerabilities.

## Findings addressed

- Image size enforcement previously occurred after buffering the entire upstream body. Both image endpoints now reject oversized Content-Length values and stop/cancel streamed downloads above 2 MiB. Timeout and content-type restrictions remain in place.
- Avatar requests previously followed redirects. Both image endpoints now reject redirects, retaining fixed public osu! hosts and strict cover-path validation rather than permitting arbitrary fetch destinations.
- OAuth state validation compared JavaScript string lengths before timingSafeEqual, which could throw on malformed Unicode. Both stored and supplied state must now be exactly 48 hexadecimal characters before constant-time comparison.
- OAuth-state and authenticated-session cookies now carry separate purpose markers. State ciphertext cannot be accepted as an authenticated session. Malformed/oversized cookie payloads and invalid expiry/token values are rejected.
- OAuth callback configuration now requires HTTPS outside localhost; deployed contexts reject HTTP even for localhost. Embedded credentials, fragments and query strings are rejected. Invalid token-exchange payloads cannot create sessions.
- API endpoints now enforce GET except POST logout. Cross-site subresource requests with Fetch Metadata are rejected; cross-site OAuth navigation remains allowed. This is defense in depth, not a replacement for OAuth state or logout Origin validation.
- API responses now set nosniff and no-referrer explicitly; function responses do not inherit static Netlify header rules. JSON and auth redirects remain no-store. Static content-security policies now also disallow object embedding.
- Added Netlify platform rate-limit metadata: 120 requests per 60 seconds per IP/domain for the Wrapped API, including image endpoints. Converted entrypoints to the Fetch API wrapper required for this metadata to be included. Verified trafficRules are present in packaged function manifests. Enforcement must still be checked after deployment; no live flooding was performed.

## Dependency audit

Upgraded standalone development tooling from Netlify CLI 23 to 27.14.1 and refreshed compatible dependencies. Vite is 7.3.7. Full npm audit findings decreased from 68 (including 6 critical) to 11 high findings, all rooted in the unpatched braces dependency and its development-tool dependency chain. npm audit --omit=dev reports zero findings. The app's function code imports Node built-ins and local modules; the development CLI is not shipped in the browser or imported by the app functions.

Remaining advisory: https://github.com/advisories/GHSA-vfj7-8cjw-p6xm . It lists no patched braces release at review time. npm's suggested forced downgrade to an obsolete Netlify CLI was deliberately not applied. This does NOT mean the remaining finding is harmless: keep local development servers on trusted networks, avoid running untrusted project/configuration input, and re-audit when upstream releases a fix. Do not suppress the advisory or describe the full dependency audit as clean.

The personal website has no root npm dependency manifest; its Wrapped subpage has no third-party runtime packages. Netlify's own build infrastructure is outside this repository audit.

## Verification

- Standalone: 23 automated checks pass; production Vite build passes.
- Personal website: 31 checks pass, including existing playtime/view-count integrations and new Wrapped security checks.
- Netlify function packaging succeeds for both deployments. Rate-limit trafficRules are present for the Wrapped entries.
- Read-only live checks: https://ronaldonater.com/osu-wrapped/ returned 200 with CSP, X-Frame-Options DENY, and nosniff. The live unauthenticated Wrapped data endpoint returned 401 with no-store. These checks observed the PRE-REVIEW deployment, not the new local fixes.
- Tracked-file listing contains .env.example, not .env, in both repositories. A local scan of tracked files up to 5 MiB found no matches to locally configured secret values. This was not a complete Git-history, archive, or credential-service scan, and cannot prove that previously exposed credentials are safe.

## Remaining actions and limits

1. Push/deploy each copy that you publish. Restart local Netlify dev after updating dependencies. Existing sessions from before the purpose-marker change will need a new sign-in.
2. Test real osu! login, sign out, all modes, and a downloaded recap after deployment. Authenticated browser/OAuth verification was not performed during this review.
3. Verify deployed function rate-limit configuration in Netlify's deploy/traffic-rule logs, including the direct function route. Monitor usage and adjust limits if real traffic requires it. Per-IP limiting is not a complete distributed-abuse or spend guarantee.
4. Rotate the OAuth client secret visible in the earlier screenshot if not already replaced. Code changes cannot revoke a credential leaked outside the repository. Keep client and session secrets private; use distinct strong random session secrets for each deployment.
5. Logout currently clears the browser session cookie; it does not maintain a server-side session revocation list. A stolen valid session cookie could remain usable until expiry. Revoke connected-app access in osu! account settings or rotate the session secret when responding to a compromise. Scopes remain identify/public, not write permissions.
6. The personal website and its subpage share an origin. A same-origin script vulnerability elsewhere on that site could issue authenticated requests even though HttpOnly prevents directly reading cookies. A separately hosted subdomain would provide a stronger origin boundary. This review focused on Wrapped, not a complete audit of every historical asset or personal-site page.
7. Browser rendering and exported PNG layout were not re-verified visually. There was no destructive testing, load test, production configuration change, or deployment in this review.
