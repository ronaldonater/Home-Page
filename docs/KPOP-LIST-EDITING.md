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
