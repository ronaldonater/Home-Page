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
            image.addEventListener('error', () => image.remove());
            fallback.append(image);
        }
        return fallback;
    }
    const palettes = ['rose', 'aqua', 'silver', 'lime', 'violet', 'peach'];
    groups.forEach((group, index) => {
        const soloist = group.type === 'soloist';
        const card = element(soloist ? 'article' : 'a', '', 'group-card');
        if (!soloist) card.href = `#${group.id}`;
        if (!soloist) card.addEventListener('click', event => {
            if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
            collectionScroll = window.scrollY;
            collectionCard = card;
        });

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
        artwork.append(song);
        const body = element('div', '', 'card-body');
        const heading = element('div', '', 'card-heading');
        heading.append(element('h3', group.name));
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
    document.querySelectorAll('[data-filter]').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('[data-filter]').forEach(item => {
                const active = item === button;
                item.classList.toggle('active', active);
                item.setAttribute('aria-pressed', String(active));
            });
            document.querySelectorAll('.group-card').forEach(card => {
                card.hidden = button.dataset.filter === 'soloists' ? card.dataset.type !== 'soloist' : card.dataset.type === 'soloist';
            });
        });
    });
    function render(focus = false) {
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
            image.style.objectPosition = group.logoPosition || 'center';
            image.addEventListener('error', () => image.remove());
            headerPhoto.append(image);
        }

        find('member-list').replaceChildren();
        group.members.forEach((member, index) => {
            const row = element('li', '', member.placeholder ? 'member-row member-placeholder' : 'member-row');
            const copy = element('div', '', 'member-copy');
            const name = element('h3', member.name, 'member-name');
            const countries = { TH: 'Thailand', KR: 'South Korea', US: 'United States', AU: 'Australia', JP: 'Japan', TW: 'Taiwan', CN: 'China', HK: 'Hong Kong' };
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
