import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import handler from '../netlify/functions/youtube-views.mjs';

const source = await readFile(new URL('../assets/js/social-script.js', import.meta.url), 'utf8');
const request = () => new Request('https://example.com/.netlify/functions/youtube-views');

test('function handles configuration, batches allowed IDs, caches, and sanitizes failures', async t => {
    const oldKey = process.env.YOUTUBE_API_KEY;
    t.after(() => {
        if (oldKey === undefined) delete process.env.YOUTUBE_API_KEY;
        else process.env.YOUTUBE_API_KEY = oldKey;
    });
    delete process.env.YOUTUBE_API_KEY;
    assert.equal((await handler(request())).status, 503);
    assert.equal((await handler(new Request(request(), { method: 'POST' }))).status, 405);
    process.env.YOUTUBE_API_KEY = 'test-only-secret';
    let requestedIds;
    t.mock.method(globalThis, 'fetch', async (url, options) => {
        assert.equal(options.headers['X-Goog-Api-Key'], 'test-only-secret');
        assert.equal(url.searchParams.get('part'), 'statistics');
        requestedIds = url.searchParams.get('id').split(',');
        return Response.json({ items: [
            { id: 'KfpwzmEuAL4', statistics: { viewCount: '12345' } },
            { id: '1CQ3mMtB6Ec', statistics: { viewCount: '0' } },
            { id: '8FE7TDufSoc', statistics: { viewCount: 'invalid' } },
            { id: 'unlisted', statistics: { viewCount: '999' } }
        ] });
    });
    const result = await handler(request());
    assert.equal(result.status, 200);
    assert.match(result.headers.get('Netlify-CDN-Cache-Control'), /durable, max-age=3600/);
    assert.deepEqual((await result.json()).views, { KfpwzmEuAL4: '12345', '1CQ3mMtB6Ec': '0' });
    const embedIds = [...source.matchAll(/youtube\.com\/embed\/([\w-]+)/g)].map(match => match[1]);
    assert.deepEqual(requestedIds, embedIds, 'backend allowlist must match the covers');
    globalThis.fetch.mock.mockImplementation(async () => new Response('secret upstream details', { status: 403 }));
    const failed = await handler(request());
    assert.equal(failed.status, 502);
    assert.doesNotMatch(await failed.text(), /secret/);
    globalThis.fetch.mock.mockImplementation(async () => { throw new Error('timeout'); });
    assert.equal((await handler(request())).status, 502);
    globalThis.fetch.mock.mockImplementation(async () => Response.json({ unexpected: true }));
    assert.equal((await handler(request())).status, 502);
});

test('frontend updates labels without replacing embeds and preserves fallback values', async () => {
    const labels = [
        { dataset: { videoId: 'KfpwzmEuAL4' }, textContent: '641 views' },
        { dataset: { videoId: '1CQ3mMtB6Ec' }, textContent: '2.5K views' }
    ];
    const list = {
        querySelectorAll: () => labels,
        set innerHTML(value) { throw new Error('Must not recreate playing embeds'); }
    };
    const context = vm.createContext({
        document: { addEventListener() {} }, window: {}, console: { log() {} },
        URL, AbortSignal, list,
        fetch: async () => Response.json({ views: { KfpwzmEuAL4: '12345', '8FE7TDufSoc': '1' } })
    });
    vm.runInContext(source, context);
    await vm.runInContext('refreshCoverViews(list)', context);
    assert.equal(labels[0].textContent, '12,345 views');
    assert.equal(labels[1].textContent, '2.5K views');
    assert.equal(vm.runInContext('songCoversData[2].views', context), '1 view',
        'off-page videos must have updated values when pagination renders them');
    context.fetch = async () => Response.json({ views: { KfpwzmEuAL4: '<script>', '1CQ3mMtB6Ec': '0' } });
    await vm.runInContext('refreshCoverViews(list)', context);
    assert.equal(labels[0].textContent, '12,345 views');
    assert.equal(labels[1].textContent, '0 views');
    for (const fetch of [
        async () => { throw new Error('offline'); },
        async () => new Response('', { status: 503 }),
        async () => Response.json({}),
        async () => new Response('not JSON')
    ]) {
        context.fetch = fetch;
        await vm.runInContext('refreshCoverViews(list)', context);
        assert.equal(labels[0].textContent, '12,345 views');
        assert.equal(labels[1].textContent, '0 views');
    }
});
