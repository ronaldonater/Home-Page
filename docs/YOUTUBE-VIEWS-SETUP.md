# Automatic song-cover view counts

The Social page requests `/.netlify/functions/youtube-views` when it loads and
once an hour while the page is visible. Only count labels change; videos keep
playing and pagination uses the updated values. Existing counts remain visible
if the service is unavailable or a video is missing from YouTube's response.

## One-time setup

1. Open https://console.cloud.google.com/ and select or create a project.
2. In **APIs & Services → Library**, enable **YouTube Data API v3**.
3. In **APIs & Services → Credentials**, create an API key. Under **API
   restrictions**, restrict it to **YouTube Data API v3**. Leave application
   restrictions unset for this server-side Netlify function; browser referrer
   restrictions will not work here.
4. In your Netlify site's **Project configuration → Environment variables**,
   add `YOUTUBE_API_KEY` with that key as its value. Include the **Functions**
   scope (or all scopes if scope selection isn't available) and the production
   deploy context. Set it as a secret if that option is offered.
5. Deploy the repository through Netlify's Git build pipeline, including the
   new `netlify/functions` directory and `netlify.toml`. Redeploy after adding
   or changing the variable. A plain static-file upload does not build functions.
6. Visit `https://YOUR-SITE/.netlify/functions/youtube-views`. A successful
   response contains `views` and `updatedAt`. Then open `/social` to see the
   refreshed labels. Don't paste your API key into HTML, JavaScript, or chat.

Netlify caches successful responses for an hour using its durable CDN cache,
with a five-minute stale-while-revalidate window. Counts aren't instantaneous;
YouTube can also delay its statistics. All three videos are fetched in one
request. The endpoint only fetches the listed videos and ignores caller-supplied
video IDs. Failed upstream requests are cached briefly to reduce retries.

When adding a cover, update `songCoversData` in `assets/js/social-script.js` and `VIDEO_IDS`
in `netlify/functions/youtube-views.mjs`.

## Troubleshooting and local verification

- **503:** the function needs the environment variable and a new deploy.
- **502:** check API enablement, key restrictions, and quota in Google Cloud.
- **404:** confirm Netlify built the functions directory during deployment.
- A plain local file/static server uses the fallback counts. Use `netlify dev`
  with the environment variable configured to exercise the function locally.
- Run automated checks with `node --test tests/youtube-views.test.mjs`.

References: [YouTube videos.list](https://developers.google.com/youtube/v3/docs/videos/list)
and [Netlify caching](https://docs.netlify.com/build/caching/caching-overview/).
