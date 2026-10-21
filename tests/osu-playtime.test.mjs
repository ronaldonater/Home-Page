import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import handler from '../netlify/functions/osu-playtime.mjs';

test('osu endpoint authenticates, reuses tokens, validates statistics and hides failures', async t => {
    const saved = [process.env.OSU_CLIENT_ID, process.env.OSU_CLIENT_SECRET];
    t.after(() => ['OSU_CLIENT_ID', 'OSU_CLIENT_SECRET'].forEach((key, i) => {
        if (saved[i] === undefined) delete process.env[key]; else process.env[key] = saved[i];
    }));
    const request = new Request('https://example.com/.netlify/functions/osu-playtime');
    delete process.env.OSU_CLIENT_SECRET;
    assert.equal((await handler(request)).status, 503);
    assert.equal((await handler(new Request(request, { method: 'POST' }))).status, 405);
    process.env.OSU_CLIENT_ID = '123';
    process.env.OSU_CLIENT_SECRET = 'test-secret';
    let authCalls = 0, seconds = 6292800, status = 200;
    t.mock.method(globalThis, 'fetch', async (url, options) => {
        if (url.endsWith('/oauth/token')) {
            authCalls++;
            assert.deepEqual(JSON.parse(options.body), { client_id: '123', client_secret: 'test-secret',
                grant_type: 'client_credentials', scope: 'public' });
            return Response.json({ access_token: 'test-token', expires_in: 86400 });
        }
        assert.equal(url, 'https://osu.ppy.sh/api/v2/users/7933825/osu');
        assert.equal(options.headers.Authorization, 'Bearer test-token');
        return Response.json({ id: 7933825, statistics: { play_time: seconds } }, { status });
    });
    const result = await handler(request);
    assert.equal(result.status, 200);
    assert.match(result.headers.get('Netlify-CDN-Cache-Control'), /max-age=600/);
    assert.equal((await result.json()).seconds, seconds);
    seconds = 0;
    assert.equal((await (await handler(request)).json()).seconds, 0);
    assert.equal(authCalls, 1);
    for (const invalid of [null, -1, '100', 1.5]) {
        seconds = invalid;
        assert.equal((await handler(request)).status, 502);
    }
    status = 401;
    assert.equal((await handler(request)).status, 502);
    status = 200; seconds = 100;
    assert.equal((await handler(request)).status, 200);
    assert.equal(authCalls, 2);
    globalThis.fetch.mock.mockImplementation(async () => { throw new Error('test-secret test-token'); });
    const failed = await handler(request);
    assert.equal(failed.status, 502);
    assert.doesNotMatch(await failed.text(), /test-secret|test-token/);
});

test('osu label converts seconds to hours and preserves fallback on invalid data and errors', async () => {
    const source = await readFile(new URL('../assets/js/osu-playtime.js', import.meta.url), 'utf8');
    const label = { textContent: '1,748 hrs' };
    let seconds = 6294600, init, tick, calls = 0;
    const document = { hidden: false, querySelector: () => label,
        addEventListener: (_, fn) => { init = fn; } };
    const context = vm.createContext({ document, AbortSignal,
        setInterval: (fn, delay) => { tick = fn; assert.equal(delay, 600000); },
        fetch: async () => { calls++; return Response.json({ seconds, mode: 'osu' }); }
    });
    vm.runInContext(source, context);
    await vm.runInContext('refreshOsuPlaytime()', context);
    assert.equal(label.textContent, '1,748 hrs');
    seconds = null;
    await vm.runInContext('refreshOsuPlaytime()', context);
    assert.equal(label.textContent, '1,748 hrs');
    seconds = 0;
    await vm.runInContext('refreshOsuPlaytime()', context);
    assert.equal(label.textContent, '0 hrs');
    context.fetch = async () => { calls++; throw new Error('offline'); };
    await vm.runInContext('refreshOsuPlaytime()', context);
    assert.equal(label.textContent, '0 hrs');
    init(); document.hidden = true;
    const before = calls;
    tick(); assert.equal(calls, before);
    document.hidden = false;
    tick(); assert.equal(calls, before + 1);
    const html = await readFile(new URL('../pages/social.html', import.meta.url), 'utf8');
    assert.ok(html.includes('data-osu-playtime'));
    assert.ok(html.includes('/assets/js/osu-playtime.js'));
});
