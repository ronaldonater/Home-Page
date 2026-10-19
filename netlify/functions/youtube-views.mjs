// Keep this allowlist in sync with the embeds in assets/js/social-script.js.
const VIDEO_IDS = ['KfpwzmEuAL4', '1CQ3mMtB6Ec', '8FE7TDufSoc'];

function json(body, status, cache = 'no-store') {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'public, max-age=0, must-revalidate',
            'Netlify-CDN-Cache-Control': cache
        }
    });
}

export default async function handler(request) {
    if (request.method !== 'GET') {
        return new Response(null, { status: 405, headers: { Allow: 'GET' } });
    }
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) return json({ error: 'View counts are not configured.' }, 503);

    const url = new URL('https://www.googleapis.com/youtube/v3/videos');
    url.search = new URLSearchParams({
        part: 'statistics',
        id: VIDEO_IDS.join(','),
        fields: 'items(id,statistics/viewCount)'
    }).toString();

    try {
        const response = await fetch(url, {
            headers: { 'X-Goog-Api-Key': apiKey },
            signal: AbortSignal.timeout(8000)
        });
        if (!response.ok) throw new Error('YouTube request failed');
        const data = await response.json();
        if (!Array.isArray(data.items)) throw new Error('Invalid YouTube response');
        const views = {};
        for (const item of data.items) {
            const count = item.statistics?.viewCount;
            if (VIDEO_IDS.includes(item.id) && typeof count === 'string' && /^\d+$/.test(count)) {
                views[item.id] = count;
            }
        }
        return json({ views, updatedAt: new Date().toISOString() }, 200,
            'public, durable, max-age=3600, stale-while-revalidate=300');
    } catch {
        // Never expose upstream errors or the API key to the browser or logs.
        return json({ error: 'View counts are temporarily unavailable.' }, 502,
            'public, durable, max-age=60');
    }
}
