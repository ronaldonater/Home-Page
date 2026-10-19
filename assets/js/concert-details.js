function concertVideoId(value) {
    try {
        const url = new URL(value);
        if (!['https:', 'http:'].includes(url.protocol)) return null;
        const host = url.hostname.toLowerCase();
        let id;
        if (host === 'youtu.be') id = url.pathname.slice(1);
        else if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'www.youtube-nocookie.com'].includes(host)) {
            id = url.pathname === '/watch' ? url.searchParams.get('v') :
                /^\/(?:embed|shorts|live)\/([^/]+)\/?$/.exec(url.pathname)?.[1];
        }
        return /^[\w-]{11}$/.test(id || '') ? id : null;
    } catch { return null; }
}

function renderConcertReview(element, review) {
    const text = review?.trim() || 'Written review coming soon.';
    element.replaceChildren();
    // Support bold and HTTPS links without interpreting review text as HTML.
    const formatting = /\*\*([^*\n]+)\*\*|\[([^\]\n]+)\]\((https:\/\/[^\s)]+)\)/g;
    let position = 0;
    for (const match of text.matchAll(formatting)) {
        element.append(document.createTextNode(text.slice(position, match.index)));
        const node = document.createElement(match[1] ? 'strong' : 'a');
        node.textContent = match[1] || match[2];
        if (!match[1]) {
            node.href = match[3];
            node.target = '_blank';
            node.rel = 'noopener noreferrer';
        }
        element.append(node);
        position = match.index + match[0].length;
    }
    element.append(document.createTextNode(text.slice(position)));
}

function openConcertDetails(concert) {
    const dialog = document.getElementById('concertDialog');
    if (!dialog) return;
    document.getElementById('concertDialogTitle').textContent = concert.title;
    document.getElementById('concertDialogMeta').textContent = `${concert.venue} · ${concert.date}`;
    document.getElementById('concertDialogRating').textContent = `${concert.stars} ${concert.score}`;
    document.getElementById('concertFootageDisclaimer').hidden = !concert.thirdPartyFootage;
    renderConcertReview(document.getElementById('concertReview'), concert.review);
    const video = document.getElementById('concertVideo');
    video.replaceChildren();
    const id = concertVideoId(concert.videoUrl);
    if (id) {
        const sourceUrl = new URL(concert.videoUrl);
        const time = sourceUrl.searchParams.get('t') || sourceUrl.searchParams.get('start') || '';
        const start = /^\d+s?$/.test(time) ? Number(time.replace(/s$/, '')) : 0;
        const timestamp = Number.isSafeInteger(start) && start > 0 ? start : 0;
        const frame = document.createElement('iframe');
        frame.src = `https://www.youtube-nocookie.com/embed/${id}${timestamp ? `?start=${timestamp}` : ''}`;
        frame.title = `${concert.title} — concert footage`;
        frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        frame.allowFullscreen = true;
        const link = document.createElement('a');
        link.href = `https://www.youtube.com/watch?v=${id}${timestamp ? `&t=${timestamp}s` : ''}`;
        link.textContent = 'Watch on YouTube ↗';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        video.append(frame, link);
    } else {
        const placeholder = document.createElement('p');
        placeholder.className = 'concert-video-placeholder';
        placeholder.textContent = 'Concert video coming soon.';
        video.append(placeholder);
    }
    dialog.showModal();
    document.body.classList.add('concert-dialog-open');
}

const concertDialog = document.getElementById('concertDialog');
if (concertDialog) {
    concertDialog.querySelector('.concert-close').addEventListener('click', () => concertDialog.close());
    concertDialog.addEventListener('click', event => {
        const bounds = concertDialog.getBoundingClientRect();
        if (event.target === concertDialog &&
            (event.clientX < bounds.left || event.clientX > bounds.right ||
             event.clientY < bounds.top || event.clientY > bounds.bottom)) concertDialog.close();
    });
    // Native dialog handles Escape, focus trapping, and returning focus to the opener.
    concertDialog.addEventListener('close', () => {
        document.getElementById('concertVideo').replaceChildren();
        document.body.classList.remove('concert-dialog-open');
    });
}
