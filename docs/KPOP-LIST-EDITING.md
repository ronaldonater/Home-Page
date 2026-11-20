# Editing your K-Pop list

All group and member data lives in `assets/js/kpop-data.js`. You do not need
to change the HTML or display script when adding entries.

Copy a group block, paste it inside `window.kpopGroups`, and change its fields:

```js
{
    id: 'group-name', // Unique, lowercase, use hyphens instead of spaces.
    name: 'GROUP NAME',
    hearts: 4, // 1–5; null leaves the group unrated.
    note: 'Optional thoughts about this group.',
    image: '/assets/images/group-photo.jpg', // Optional; add the file here too.
    members: [
        { name: 'Favorite member', note: 'Optional reason.' },
        { name: 'Second favorite', image: '/assets/images/member-photo.jpg' },
        { name: 'Third favorite' },
    ],
},
```

The list sorts by hearts, highest first. For ties, move the group blocks into
your preferred order in the file. Unrated groups appear last.
Member order determines the ranking automatically: first is #1, second is #2.
An empty `members: []` shows a coming-soon message.

Images and notes are optional. Without an image, a styled initial appears.
Use double quotes around text containing apostrophes, or escape the apostrophe
if using single quotes. Keep commas between entries and keep each id unique.
Changing an existing id also changes its shareable link (`/kpop#group-name`).

Save, push to GitHub, and deploy on Netlify to publish changes.
For local preview, use Netlify Dev or Live Server at `/pages/kpop.html`.

## Soloists

Add `type: "soloist",` to an artist block to include them in the Soloists filter.
Omit it for groups. The Groups filter shows groups; the Soloists filter shows soloists.

## Photos and favorite songs

Set `image` to a photo URL or a local `/assets/images/filename.jpg` path.
Optionally set `imagePosition: "center 30%"` to adjust the crop.
Set `favoriteSong: "Song title"` to display your pick on a group or soloist card.
Blank photos and songs display placeholders. Soloist cards do not open rankings.

## Member positions

Add `positions: ["Main Vocalist", "Leader"]` to a member entry to show role badges
on its right. Omit the field for members without assigned positions.

## Member templates

Unassigned groups have a member template with `placeholder: true`. Replace the name
and positions, add an optional photo/note, and remove `placeholder: true`. Copy the
entry for additional members. Template entries show a dash instead of a rank and
do not count toward the card's member total.

## Ranking-header logos

The `logo` field controls the circular image on a group's member-ranking page.
It is separate from `image`, which controls the group photo on the collection card.
Leave `logo: ""` for a placeholder, or supply a local path or image URL.
Logos fill the circular frame using cover sizing. Square images work best;
keep the design centered with enough space to avoid clipping at the edges.

Add `kprofiles: "https://kprofiles.com/group-profile-path/"` to a group to show
a View K-Profiles page link in its ranking header. Unassigned links stay hidden.

## Member flags

Add `country: "KR"` to a member to show a country flag beside their name.
Supported codes: KR (South Korea), US (United States), TH (Thailand),
AU (Australia), JP (Japan). Flags load from FlagCDN with accessible country labels.

## Automatic ages

Set `birthday: "2002-05-30"` on a member (YYYY-MM-DD). Ages use the visitor's
local date, refresh at midnight and on returning to the tab, and do not require
yearly edits. Members without birthdays do not display an age column.

## Spotify song players

Spotify embeds need no API key or subscription for this website integration.
Add a song's Share > Copy Song Link URL alongside its favoriteSong field:

```js
favoriteSong: "Nothing",
spotifyUrl: "https://open.spotify.com/track/3ym9bzwGG4uxVaJ0pLoQbM",
```

Use a full open.spotify.com/track/... link (query strings are fine), not a
spotify.link short URL, album, playlist, or artist link. Update both fields
when changing your favorite song. Blank or invalid URLs show Find on Spotify
instead of an embedded player. Spotify decides preview/full playback availability
for the visitor; a fixed preview duration is not guaranteed.

Listen opens a compact player on both cards and ranking headers. Only one player
stays open; closing it, navigating, or changing filters stops playback by removing
the iframe. Players never load before a visitor clicks Listen and do not autoplay.

## Collection filters

Group entries can set `generation: 4,` and `status: "active",` alongside their
existing heart rating. Status values are `active`, `inactive` (including hiatus
and uncertain disbandment), or `disbanded`. Missing fields appear under Not assigned.
Soloists use the heart-rating filter; generation and group status are disabled
for them. Selections combine, and Reset filters clears the dropdowns while keeping
the current Groups/Soloists tab. Returning from a ranking preserves the filters.

Generation is an editable classification, not an official industry standard.
Initial labels use debut eras: 2nd through 2011, 3rd 2012–2017, 4th 2018–2022,
5th 2023 onward; 1st is available for future additions. Groups retain their original
identity's debut era after reunions. ARTMS uses its full-group debut (2024), and
LIMELIGHT uses its official debut (2023), rather than pre-debut activities.

Status is a manually maintained snapshot checked on November 18, 2026 against
each group's existing K-Profiles link. Suspected disbandments are kept under
Inactive / hiatus rather than treated as confirmed. Weeekly follows your
classification as disbanded. Reunited acts such as I.O.I, BESTie, FIESTAR and KARA
are included as active. MAMAMOO is active based on its official 2026 tour notice:
https://mamamoo.co.kr/contents/6a0afc90b3f81c194a2bf4fd
NewJeans remains under Inactive / hiatus pending its return to group activities:
https://www.koreaherald.com/article/10910209
These fields do not automatically change with news; edit them when needed.

### Collection sorting

Sort by supports Hearts: highest first (the default), Hearts: lowest first,
Name: A–Z, and Name: Z–A. Highest first places unrated artists last and keeps
equal ratings in the order in kpop-data.js. Lowest first is the exact reverse
of that list, reversing tied ratings too and placing unrated artists first.
Name sorting ignores case and punctuation and compares numbers naturally.
Sorting combines with all filters, applies to Groups and Soloists, and remains
selected when returning from member rankings. Reset filters leaves sorting as-is.
Sorting moves existing cards, preserving their photos, colors, and listeners.

### Image canvas proportions

Group photos use a 1200 × 800 (3:2) frame. Ranking-header logos use a
500 × 500 square frame; member portraits and soloist card photos use a
400 × 400 square frame. These are proportions/intrinsic image dimensions,
not fixed on-screen sizes or rewritten image-file resolutions. CSS scales them
for desktop and mobile. Images fill their frames with `object-fit: cover`, so
non-square sources are cropped instead of stretched. The existing circular
logo/member masks and responsive avatar widths are retained.
