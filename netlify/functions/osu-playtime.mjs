// Public profile statistics; credentials and OAuth tokens never reach the browser.
const USER_ID = 7933825;
const MODE = 'osu';
let tokenCache;

function json(body, status, cache = 'no-store') {
    return Response.json(body, { status, headers: {
        'Cache-Control': 'no-cache', 'Netlify-CDN-Cache-Control': cache
    } });
}

export default async function handler(request) {
    if (request.method !== 'GET') {
        return new Response(null, { status: 405, headers: { Allow: 'GET' } });
    }
    const clientId = process.env.OSU_CLIENT_ID;
    const clientSecret = process.env.OSU_CLIENT_SECRET;
    if (!clientId || !clientSecret) return json({ error: 'osu! playtime is not configured.' }, 503);
    try {
        const signal = AbortSignal.timeout(8000);
        if (!tokenCache || tokenCache.expires <= Date.now()
            || tokenCache.clientId !== clientId || tokenCache.clientSecret !== clientSecret) {
            const result = await fetch('https://osu.ppy.sh/oauth/token', {
                method: 'POST', signal,
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({ client_id: clientId, client_secret: clientSecret,
                    grant_type: 'client_credentials', scope: 'public' })
            });
            if (!result.ok) throw new Error('Authentication failed');
            const auth = await result.json();
            if (typeof auth.access_token !== 'string' || !auth.access_token
                || !Number.isFinite(auth.expires_in) || auth.expires_in <= 0) {
                throw new Error('Invalid token response');
            }
            tokenCache = { token: auth.access_token, clientId, clientSecret,
                expires: Date.now() + Math.max(0, auth.expires_in - 60) * 1000 };
        }
        const result = await fetch(`https://osu.ppy.sh/api/v2/users/${USER_ID}/${MODE}`, {
            signal, headers: { Authorization: `Bearer ${tokenCache.token}`, Accept: 'application/json' }
        });
        if (result.status === 401) tokenCache = undefined;
        if (!result.ok) throw new Error('Profile unavailable');
        const profile = await result.json();
        const seconds = profile.statistics?.play_time;
        if (profile.id !== USER_ID || !Number.isSafeInteger(seconds) || seconds < 0) {
            throw new Error('Invalid playtime');
        }
        return json({ seconds, mode: MODE, updatedAt: new Date().toISOString() }, 200,
            'public, durable, max-age=600');
    } catch {
        // Do not expose upstream responses, credentials, or tokens in errors/logs.
        return json({ error: 'osu! playtime is temporarily unavailable.' }, 502,
            'public, durable, max-age=60');
    }
}
