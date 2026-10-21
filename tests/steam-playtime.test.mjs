import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import handler from '../netlify/functions/steam-playtime.mjs';

test('Steam endpoint restricts games, protects secrets, and handles missing/private data', async t => {
    const oldKey = process.env.STEAM_API_KEY;
    t.after(() => {
        if (oldKey === undefined) delete process.env.STEAM_API_KEY;
        else process.env.STEAM_API_KEY = oldKey;
    });
    const request = new Request('https://example.com/.netlify/functions/steam-playtime');
    delete process.env.STEAM_API_KEY;
    assert.equal((await handler(request)).status, 503);
    assert.equal((await handler(new Request(request, { method: 'POST' }))).status, 405);
    process.env.STEAM_API_KEY = 'test-secret';
    let games = [{ appid: 4080220, playtime_forever: 630 },
        { appid: 3717070, playtime_forever: 0 }, { appid: 99, playtime_forever: 100 }];
    t.mock.method(globalThis, 'fetch', async url => {
        assert.equal(url.searchParams.get('key'), 'test-secret');
        if (url.pathname.includes('ResolveVanityURL')) {
            assert.equal(url.searchParams.get('vanityurl'), 'ronaldonater1');
            return Response.json({ response: { success: 1, steamid: '76561198000000000' } });
        }
        const input = JSON.parse(url.searchParams.get('input_json'));
        assert.deepEqual(input.appids_filter, [4080220, 3717070]);
        assert.equal(input.steamid, '76561198000000000');
        return Response.json({ response: { games } });
    });
    const response = await handler(request);
    assert.equal(response.status, 200);
    assert.match(response.headers.get('Netlify-CDN-Cache-Control'), /max-age=600/);
    assert.deepEqual((await response.json()).minutes, { 4080220: 630, 3717070: 0 });
    games = [{ appid: 4080220, playtime_forever: -1 }, { appid: 3717070, playtime_forever: '99' }];
    assert.deepEqual((await (await handler(request)).json()).minutes, {});
    games = undefined;
    assert.equal((await handler(request)).status, 502);
    globalThis.fetch.mock.mockImplementation(async () => { throw new Error('test-secret'); });
    const failure = await handler(request);
    assert.equal(failure.status, 502);
    assert.doesNotMatch(await failure.text(), /test-secret/);
});

test('browser formats hours, preserves unavailable counts, and refreshes visible pages', async () => {
    const source = await readFile(new URL('../assets/js/steam-playtime.js', import.meta.url), 'utf8');
    const labels = [
        { dataset: { steamAppId: '4080220' }, textContent: '10 hrs' },
        { dataset: { steamAppId: '3717070' }, textContent: '338 hrs' }
    ];
    let init, tick, calls = 0;
    const document = { hidden: false, querySelectorAll: () => labels,
        addEventListener: (event, callback) => { init = callback; } };
    const context = vm.createContext({ document, AbortSignal,
        setInterval: (callback, delay) => { tick = callback; assert.equal(delay, 600000); },
        fetch: async () => { calls++; return Response.json({ minutes: { 4080220: 630 } }); }
    });
    vm.runInContext(source, context);
    await vm.runInContext('refreshSteamPlaytime()', context);
    assert.equal(labels[0].textContent, '10.5 hrs');
    assert.equal(labels[1].textContent, '338 hrs');
    context.fetch = async () => Response.json({ minutes: { 4080220: -1, 3717070: 0 } });
    await vm.runInContext('refreshSteamPlaytime()', context);
    assert.equal(labels[0].textContent, '10.5 hrs');
    assert.equal(labels[1].textContent, '0 hrs');
    context.fetch = async () => { calls++; throw new Error('offline'); };
    await vm.runInContext('refreshSteamPlaytime()', context);
    assert.equal(labels[0].textContent, '10.5 hrs');
    init();
    document.hidden = true;
    const before = calls;
    tick();
    assert.equal(calls, before);
    document.hidden = false;
    tick();
    assert.equal(calls, before + 1);
    const html = await readFile(new URL('../pages/social.html', import.meta.url), 'utf8');
    for (const label of labels) assert.ok(html.includes(`data-steam-app-id="${label.dataset.steamAppId}"`));
    assert.ok(html.includes('/assets/js/steam-playtime.js'));
});
