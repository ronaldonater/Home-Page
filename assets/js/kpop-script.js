function kpopSortArtists(artists, order = 'hearts-desc') {
    const names = new Intl.Collator('en', { sensitivity: 'base', numeric: true, ignorePunctuation: true });
    const sorted = [...artists].sort((a, b) => {
        if (order === 'name-asc' || order === 'name-desc') {
            return names.compare(a.name, b.name) * (order === 'name-desc' ? -1 : 1);
        }
        const ratedA = Number.isInteger(a.hearts) && a.hearts >= 1 && a.hearts <= 5;
        const ratedB = Number.isInteger(b.hearts) && b.hearts >= 1 && b.hearts <= 5;
        if (ratedA !== ratedB) return ratedA ? -1 : 1;
        if (!ratedA) return 0;
        return b.hearts - a.hearts;
    });
    // Lowest first reverses the entire highest-first list, including ties and unrated artists.
    return order === 'hearts-asc' ? sorted.reverse() : sorted;
}

// Each selected criterion must match. Group-only filters do not exclude soloists.
function kpopMatchesFilters(group, filters) {
    const soloist = group.type === 'soloist';
    if (soloist !== (filters.type === 'soloists')) return false;
    if (!soloist && filters.generation !== 'all') {
        const generation = Number.isInteger(group.generation) && group.generation >= 1 && group.generation <= 5
            ? String(group.generation) : 'unassigned';
        if (generation !== filters.generation) return false;
    }
    if (!soloist && filters.status !== 'all') {
        const status = ['active', 'inactive', 'disbanded'].includes(group.status) ? group.status : 'unassigned';
        if (status !== filters.status) return false;
    }
    const hearts = Number.isInteger(group.hearts) && group.hearts >= 1 && group.hearts <= 5
        ? String(group.hearts) : 'unrated';
    return filters.hearts === 'all' || hearts === filters.hearts;
}

function kpopMemberAge(birthday, today = new Date()) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthday || '')) return null;
    const [year, month, day] = birthday.split('-').map(Number);
    const birth = new Date(year, month - 1, day);
    if (birth.getFullYear() !== year || birth.getMonth() !== month - 1 || birth.getDate() !== day) return null;
    let age = today.getFullYear() - year;
    if (today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day)) age--;
    return age >= 0 ? age : null;
}

(() => {
    const groups = [...window.kpopGroups].sort((a, b) => (b.hearts ?? -1) - (a.hearts ?? -1));
    const find = id => document.getElementById(id);
    let collectionScroll = null;
    let collectionCard = null;
    let showingGroup = false;
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    function restoreCollection() {
        requestAnimationFrame(() => {
            if (showingGroup) return;
            collectionCard?.focus({ preventScroll: true });
            if (collectionScroll !== null) window.scrollTo({ top: collectionScroll, behavior: 'instant' });
            else find('groups-view').scrollIntoView({ block: 'start' });
        });
    }
    document.querySelectorAll('#members-view a[href="#"]').forEach(link => {
        link.addEventListener('click', event => {
            event.preventDefault();
            history.pushState(null, '', location.pathname + location.search + '#groups-view');
            render(false);
            restoreCollection();
        });
    });

    const useSvgIcons = document.documentElement.classList.contains('ios-icons');
    function icon(kind) {
        if (!useSvgIcons) {
            const symbol = element('span', kind === 'heart' ? '♥' : '↗', 'text-symbol');
            symbol.setAttribute('aria-hidden', 'true');
            return symbol;
        }
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('class', 'kpop-icon');
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');
        svg.setAttribute('fill', kind === 'heart' ? 'currentColor' : 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '1.8');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', kind === 'heart' ? 'M12 21s-9-5.5-9-12a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6.5-9 12-9 12Z' : 'M6 18 18 6M6 6h12v12');
        svg.append(path);
        return svg;
    }
    function rating(group) {
        const container = element('span', '', 'hearts');
        if (!Number.isInteger(group.hearts) || group.hearts < 1 || group.hearts > 5) {
            container.textContent = 'Not rated yet';
            return container;
        }
        container.setAttribute('role', 'img');
        container.setAttribute('aria-label', `${group.hearts} out of 5 hearts`);
        if (!useSvgIcons) {
            container.textContent = '♥'.repeat(group.hearts) + '♡'.repeat(5 - group.hearts);
            return container;
        }
        for (let i = 0; i < 5; i++) {
            const heart = icon('heart');
            if (i >= group.hearts) heart.setAttribute('fill', 'none');
            container.append(heart);
        }
        return container;
    }
    function element(tag, text, className) {
        const node = document.createElement(tag);
        if (text) node.textContent = text;
        if (className) node.className = className;
        return node;
    }
    function portrait(item) {
        const fallback = element('span', item.name.slice(0, 1), 'portrait');
        fallback.setAttribute('aria-hidden', 'true');
        if (item.image) {
            const image = document.createElement('img');
            image.src = item.image; image.alt = ''; image.loading = 'lazy';
            image.width = 400; image.height = 400;
            image.addEventListener('error', () => image.remove());
            fallback.append(image);
        }
        return fallback;
    }
    let activeSong = null;
    function closeSong() {
        if (!activeSong) return;
        activeSong.panel.replaceChildren();
        activeSong.panel.hidden = true;
        activeSong.button.setAttribute('aria-expanded', 'false');
        activeSong.button.textContent = 'Listen on Spotify';
        activeSong = null;
    }
    function songControl(group, placement) {
        const wrapper = element('div', '', 'song-listen');
        if (!group.favoriteSong) return wrapper;
        let trackId = null;
        try {
            const url = new URL(group.spotifyUrl);
            if (url.protocol === 'https:' && url.hostname === 'open.spotify.com') {
                trackId = url.pathname.match(/^\/(?:intl-[a-z-]+\/)?(?:embed\/)?track\/([a-zA-Z0-9]{22})\/?$/)?.[1];
            }
        } catch { /* An unassigned track gets a Spotify search link. */ }
        if (!trackId) {
            const search = element('a', 'Find on Spotify', 'song-listen-button');
            search.href = 'https://open.spotify.com/search/' + encodeURIComponent(group.name + ' ' + group.favoriteSong);
            search.target = '_blank'; search.rel = 'noopener noreferrer';
            search.setAttribute('aria-label', `Find ${group.favoriteSong} by ${group.name} on Spotify`);
            wrapper.append(search);
            return wrapper;
        }
        const button = element('button', 'Listen on Spotify', 'song-listen-button');
        button.type = 'button';
        const panel = element('div', '', 'song-player');
        panel.id = `spotify-${placement}-${group.id}`;
        panel.hidden = true;
        button.setAttribute('aria-controls', panel.id);
        button.setAttribute('aria-expanded', 'false');
        button.setAttribute('aria-label', `Listen to ${group.favoriteSong} by ${group.name} on Spotify`);
        button.addEventListener('click', () => {
            const wasOpen = activeSong?.button === button;
            closeSong();
            if (wasOpen) return;
            const iframe = document.createElement('iframe');
            iframe.src = `https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`;
            iframe.title = `${group.favoriteSong} by ${group.name} — Spotify player`;
            iframe.width = '100%'; iframe.height = '152';
            iframe.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
            iframe.allowFullscreen = true;
            const fallback = element('a', 'Open song on Spotify', 'song-player-link');
            fallback.href = `https://open.spotify.com/track/${trackId}`;
            fallback.target = '_blank'; fallback.rel = 'noopener noreferrer';
            panel.append(iframe, fallback);
            panel.hidden = false;
            button.setAttribute('aria-expanded', 'true');
            button.textContent = 'Close player';
            activeSong = { panel, button };
        });
        wrapper.append(button, panel);
        return wrapper;
    }
    const palettes = ['rose', 'aqua', 'silver', 'lime', 'violet', 'peach'];
    groups.forEach((group, index) => {
        const soloist = group.type === 'soloist';
        const card = element('article', '', 'group-card');
        card.tabIndex = -1;
        if (!soloist) card.addEventListener('click', event => {
            if (event.target.closest('.song-listen')) return;
            if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
            collectionScroll = window.scrollY;
            collectionCard = card;
        });

        card.dataset.artistId = group.id;
        card.dataset.hearts = String(group.hearts ?? '');
        card.dataset.type = group.type || 'group';
        card.hidden = card.dataset.type === 'soloist';
        card.dataset.palette = group.palette || palettes[index % palettes.length];
        const artwork = element('div', '', 'card-art');
        const photo = element('div', '', 'artist-photo');
        photo.append(element('span', group.name.slice(0, 1), 'photo-initial'));
        if (group.image) {
            const image = document.createElement('img');
            image.src = group.image; image.alt = `${group.name} ${soloist ? 'portrait' : 'group photo'}`;
            if (soloist) { image.width = 400; image.height = 400; }
            image.loading = 'lazy';
            image.style.objectPosition = group.imagePosition || 'center top';
            image.addEventListener('error', () => image.remove());
            photo.append(image);
        } else {
            photo.append(element('span', 'PHOTO COMING SOON', 'photo-placeholder'));
        }
        artwork.append(photo);
        const song = element('div', '', 'favorite-song');
        song.append(element('span', 'ON REPEAT / FAVORITE SONG', 'song-label'),
            element('strong', group.favoriteSong || 'Still choosing my favorite', 'song-title'));
        song.append(songControl(group, 'card'));
        artwork.append(song);
        const body = element('div', '', 'card-body');
        const heading = element('div', '', 'card-heading');
        const title = element('h3', group.name);
        if (soloist) heading.append(title);
        else {
            const link = element('a', '', 'group-card-link');
            link.href = `#${group.id}`;
            link.append(title);
            heading.append(link);
        }
        if (!soloist) {
            const arrow = element('span', '', 'card-arrow');
            arrow.append(icon('external'));
            heading.append(arrow);
        }
        const score = element('div', '', 'card-score');
        score.append(rating(group), element('span', group.hearts ? `${group.hearts} / 5` : 'TO BE RATED', 'score-number'));
        body.append(heading, score);
        if (!soloist) {
            const rankedMembers = group.members.filter(member => !member.placeholder);
            body.append(element('span', rankedMembers.length ? `${rankedMembers.length} members · Meet my biases` : 'Member bias reveal coming soon', 'card-caption'));
        }
        else body.append(element('span', 'SOLO ARTIST', 'card-caption'));
        if (soloist && group.kprofiles) {
            try {
                const url = new URL(group.kprofiles);
                if (url.protocol === 'https:' && url.hostname === 'kprofiles.com') {
                    const link = element('a', url.searchParams.has('s') ? 'Find on K-Profiles' : 'View K-Profiles page', 'kprofiles-link');
                    link.append(icon('external'));
                    link.href = url.href;
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                    body.append(link);
                }
            } catch { /* Invalid links stay hidden. */ }
        }

        card.append(artwork, body);
        find('group-list').append(card);
    });
    find('group-count').textContent = `${String(groups.length).padStart(2, '0')} ARTISTS / ONE COLLECTION`;
    let collectionSort = 'hearts-desc';
    const collectionFilters = { type: 'groups', generation: 'all', status: 'all', hearts: 'all' };
    function applyCollectionFilters() {
        closeSong();
        let visible = 0;
        let total = 0;
        const groupLookup = new Map(groups.map(group => [group.id, group]));
        document.querySelectorAll('.group-card').forEach(card => {
            const group = groupLookup.get(card.dataset.artistId);
            if ((group.type === 'soloist') === (collectionFilters.type === 'soloists')) total++;
            card.hidden = !kpopMatchesFilters(group, collectionFilters);
            if (!card.hidden) visible++;
        });
        const cardsById = new Map(Array.from(document.querySelectorAll('.group-card'), card => [card.dataset.artistId, card]));
        for (const group of kpopSortArtists(groups, collectionSort)) {
            find('group-list').append(cardsById.get(group.id));
        }
        const soloists = collectionFilters.type === 'soloists';
        find('filter-generation').disabled = soloists;
        find('filter-status').disabled = soloists;
        find('group-filter-hint').hidden = !soloists;
        find('filter-results').textContent = `${visible} of ${total} ${soloists ? 'soloists' : 'groups'}`;
        find('group-list').hidden = visible === 0;
        find('filter-empty').hidden = visible !== 0;
        find('clear-collection-filters').disabled = collectionFilters.hearts === 'all' &&
            (soloists || (collectionFilters.generation === 'all' && collectionFilters.status === 'all'));
    }
    document.querySelectorAll('[data-filter]').forEach(button => {
        button.addEventListener('click', () => {
            collectionFilters.type = button.dataset.filter;
            document.querySelectorAll('[data-filter]').forEach(item => {
                const active = item === button;
                item.classList.toggle('active', active);
                item.setAttribute('aria-pressed', String(active));
            });
            applyCollectionFilters();
        });
    });
    for (const key of ['generation', 'status', 'hearts']) {
        find(`filter-${key}`).addEventListener('change', event => {
            collectionFilters[key] = event.target.value;
            applyCollectionFilters();
        });
    }
    find('collection-sort').addEventListener('change', event => {
        collectionSort = event.target.value;
        applyCollectionFilters();
    });
    find('clear-collection-filters').addEventListener('click', () => {
        for (const key of ['generation', 'status', 'hearts']) {
            collectionFilters[key] = 'all';
            find(`filter-${key}`).value = 'all';
        }
        applyCollectionFilters();
    });
    applyCollectionFilters();
    function render(focus = false) {
        closeSong();
        const group = groups.find(item => item.type !== 'soloist' && `#${item.id}` === location.hash);
        const returningToCollection = showingGroup && !group;
        showingGroup = Boolean(group);
        find('groups-view').hidden = Boolean(group);
        find('members-view').hidden = !group;
        document.title = group ? `${group.name} biases - ronaldonater` : 'K-Pop - ronaldonater';
        if (!group) {
            if (returningToCollection) restoreCollection();
            else if (focus) find('groups-view').scrollIntoView({ block: 'start' });
            return;
        }
        find('members-view').dataset.palette = group.palette || palettes[groups.indexOf(group) % palettes.length];
        find('member-title').textContent = group.name;
        find('group-rating').replaceChildren(rating(group));
        find('ranking-song-title').textContent = group.favoriteSong || 'Still choosing my favorite';
        find('members-view').querySelector('.ranking-song-listen')?.remove();
        const rankingListen = songControl(group, 'ranking');
        rankingListen.classList.add('ranking-song-listen');
        find('ranking-song-title').parentElement.after(rankingListen);
        find('group-note').textContent = group.note || '';
        const profileLink = find('group-kprofiles');
        profileLink.hidden = true;
        profileLink.removeAttribute('href');
        if (group.kprofiles) {
            try {
                const url = new URL(group.kprofiles);
                if (url.protocol === 'https:' && url.hostname === 'kprofiles.com') {
                    profileLink.href = url.href;
                    profileLink.textContent = url.searchParams.has('s') ? 'Find on K-Profiles' : 'View K-Profiles page';
                    profileLink.append(icon('external'));
                    profileLink.hidden = false;
                }
            } catch { /* Leave invalid or unassigned links hidden. */ }
        }

        const headerPhoto = find('group-profile-photo');
        headerPhoto.replaceChildren();
        const fallback = element('div', '', 'group-photo-fallback');
        fallback.append(element('span', group.name.slice(0, 1)), element('small', 'LOGO COMING SOON'));
        headerPhoto.append(fallback);
        if (group.logo) {
            const image = document.createElement('img');
            image.src = group.logo;
            image.alt = `${group.name} logo`;
            image.width = 500; image.height = 500;
            image.style.objectPosition = group.logoPosition || 'center';
            image.addEventListener('error', () => image.remove());
            headerPhoto.append(image);
        }

        find('member-list').replaceChildren();
        group.members.forEach((member, index) => {
            const row = element('li', '', member.placeholder ? 'member-row member-placeholder' : 'member-row');
            const copy = element('div', '', 'member-copy');
            const name = element('h3', member.name, 'member-name');
            const countries = { TH: 'Thailand', KR: 'South Korea', US: 'United States', AU: 'Australia', JP: 'Japan', TW: 'Taiwan', CN: 'China', HK: 'Hong Kong', ID: 'Indonesia', SE: 'Sweden' };
            if (countries[member.country]) {
                const flag = document.createElement('img');
                flag.className = 'member-flag';
                flag.src = `https://flagcdn.com/w40/${member.country.toLowerCase()}.png`;
                flag.alt = countries[member.country];
                flag.title = countries[member.country];
                flag.width = 24;
                flag.height = 16;
                flag.loading = 'lazy';
                name.append(flag);
            }
            copy.append(name);
            if (member.note) copy.append(element('p', member.note));
            row.append(element('span', member.placeholder ? '—' : String(index + 1).padStart(2, '0'), 'rank'), portrait(member), copy);
            if (!member.memorial && kpopMemberAge(member.birthday) !== null) {
                row.classList.add('member-row-with-age');
                const age = element('div', '', 'member-age');
                const value = element('strong', '', 'member-age-value');
                value.dataset.birthday = member.birthday;
                age.append(element('span', 'AGE', 'member-age-label'), value);
                row.append(age);
            }
            if (member.positions?.length || member.former) {
                const positions = element('div', '', 'member-positions');
                positions.setAttribute('aria-label', 'Group positions');
                if (member.former) positions.append(element('span', 'Former member', 'position-tag former-tag'));
                member.positions?.forEach(position => positions.append(element('span', position, 'position-tag')));
                row.append(positions);
            }
            if (member.memorial) {
                row.classList.add('member-row-memorial');
                const tribute = element('aside', '', 'member-tribute');
                tribute.setAttribute('aria-label', `In loving memory of ${member.name}`);
                const tributeCopy = element('div', '', 'member-tribute-copy');
                tributeCopy.append(element('strong', `In loving memory of ${member.name} · ${member.memorial.years}`),
                    element('p', member.memorial.message));
                const candle = document.createElement('img');
                candle.className = 'memorial-candle';
                candle.src = '/assets/images/kpop/memorial-candle.svg';
                candle.alt = '';
                candle.setAttribute('aria-hidden', 'true');
                candle.width = 88;
                candle.height = 112;
                tribute.append(tributeCopy, candle);
                row.append(tribute);
            }
            find('member-list').append(row);
        });
        find('member-empty').hidden = group.members.length > 0;
        refreshAges();
        if (focus) find('member-title').focus();
    }
    function refreshAges() {
        const today = new Date();
        document.querySelectorAll('.member-age-value').forEach(label => {
            const age = kpopMemberAge(label.dataset.birthday, today);
            label.textContent = String(age);
            label.setAttribute('aria-label', `${age} years old`);
            label.title = `Born ${label.dataset.birthday}`;
        });
    }
    // Use the visitor's local calendar; recalculate after midnight or returning to the tab.
    function scheduleAgeRefresh() {
        const now = new Date();
        const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        setTimeout(() => { refreshAges(); scheduleAgeRefresh(); }, midnight - now + 100);
    }
    document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshAges(); });
    scheduleAgeRefresh();
    window.addEventListener('hashchange', () => render(true));
    render();
})();
