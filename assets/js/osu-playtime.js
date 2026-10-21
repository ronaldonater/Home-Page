async function refreshOsuPlaytime() {
    try {
        const response = await fetch('/.netlify/functions/osu-playtime', {
            signal: AbortSignal.timeout(10000)
        });
        if (!response.ok) return;
        const data = await response.json();
        if (!Number.isSafeInteger(data.seconds) || data.seconds < 0 || data.mode !== 'osu') return;
        const label = document.querySelector('[data-osu-playtime]');
        if (!label) return;
        label.textContent = `${Math.floor(data.seconds / 3600).toLocaleString('en-US')} hrs`;
        label.title = 'Latest osu!standard playtime reported by osu!';
    } catch {
        // Preserve the existing hours if the API is unavailable.
    }
}

document.addEventListener('DOMContentLoaded', () => {
    refreshOsuPlaytime();
    setInterval(() => {
        if (!document.hidden) refreshOsuPlaytime();
    }, 600000);
});
