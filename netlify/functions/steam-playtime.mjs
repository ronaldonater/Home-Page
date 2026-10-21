const APP_IDS = [4080220, 3717070];
const PROFILE = 'ronaldonater1';

function json(body, status, cache = 'no-store') {
    return Response.json(body, { status, headers: {
        'Cache-Control': 'no-cache',
        'Netlify-CDN-Cache-Control': cache
    } });
}

export default async function handler(request) {
    if (request.method !== 'GET') {
        return new Response(null, { status: 405, headers: { Allow: 'GET' } });
    }
    const key = process.env.STEAM_API_KEY;
    if (!key) return json({ error: 'Steam playtime is not configured.' }, 503);

    try {
        // Share one deadline across both requests. Never log URLs containing the key.
        const signal = AbortSignal.timeout(8000);
        async function steam(path, params) {
            const url = new URL(path, 'https://api.steampowered.com');
            url.search = new URLSearchParams({ key, ...params }).toString();
            const result = await fetch(url, { signal });
            if (!result.ok) throw new Error('Steam request failed');
            return (await result.json()).response;
        }
        const profile = await steam('/ISteamUser/ResolveVanityURL/v1/', { vanityurl: PROFILE });
        if (profile?.success !== 1 || !/^\d{17}$/.test(profile.steamid)) {
            throw new Error('Profile unavailable');
        }
        const data = await steam('/IPlayerService/GetOwnedGames/v1/', {
            input_json: JSON.stringify({ steamid: profile.steamid, include_appinfo: false,
                include_played_free_games: true, appids_filter: APP_IDS })
        });
        if (!Array.isArray(data?.games)) throw new Error('Game details unavailable');
        const minutes = {};
        for (const game of data.games) {
            if (APP_IDS.includes(game.appid) && Number.isSafeInteger(game.playtime_forever)
                && game.playtime_forever >= 0) {
                minutes[game.appid] = game.playtime_forever;
            }
        }
        return json({ minutes, updatedAt: new Date().toISOString() }, 200,
            'public, durable, max-age=600');
    } catch {
        return json({ error: 'Steam playtime is temporarily unavailable.' }, 502,
            'public, durable, max-age=60');
    }
}
