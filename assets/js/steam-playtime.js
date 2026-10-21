async function refreshSteamPlaytime() {
    try {
        const response = await fetch('/.netlify/functions/steam-playtime', {
            signal: AbortSignal.timeout(10000)
        });
        if (!response.ok) return;
        const data = await response.json();
        if (!data.minutes || typeof data.minutes !== 'object') return;
        document.querySelectorAll('[data-steam-app-id]').forEach(label => {
            const minutes = data.minutes[label.dataset.steamAppId];
            if (!Number.isSafeInteger(minutes) || minutes < 0) return;
            label.textContent = `${(minutes / 60).toLocaleString('en-US', { maximumFractionDigits: 1 })} hrs`;
            label.title = 'Latest playtime reported by Steam';
        });
    } catch {
        // Preserve the existing hours when Steam is private, offline, or unavailable.
    }
}

document.addEventListener('DOMContentLoaded', () => {
    refreshSteamPlaytime();
    setInterval(() => {
        if (!document.hidden) refreshSteamPlaytime();
    }, 600000);
});
