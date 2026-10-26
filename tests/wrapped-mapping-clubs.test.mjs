import test from 'node:test';
import assert from 'node:assert/strict';
import {MAPPING_CLUBS,mappingLegendMarkup,mappingClubIcon,assignMappingClub,mappingClubMatches,mappingClubMarkup} from '../osu-wrapped/src/mapping-clubs.js';
const mapping=extra=>({status:'ready',created:2,ranked:0,totalPlays:0,genreCount:0,...extra});
test('all six mapping clubs qualify at their documented thresholds',()=>{
 const cases={ranked:{ranked:3},soundtrack:{totalPlays:100000},breakthrough:{ranked:1},factory:{created:10},gems:{created:5},draft:{created:1}};
 assert.equal(MAPPING_CLUBS.length,6);
 for(const [id,stats] of Object.entries(cases))assert.ok(mappingClubMatches(mapping(stats)).some(c=>c.id===id),id);
 assert.equal(assignMappingClub(mapping({created:10,ranked:3,totalPlays:100000,genreCount:5})).id,'soundtrack');
 assert.equal(assignMappingClub(mapping({created:4,totalPlays:99999,genreCount:4})).id,'draft');
 assert.equal(assignMappingClub(mapping({created:0})),null);
 assert.equal(assignMappingClub({status:'unavailable'}),null);
});
test('missing playcount and genre metadata cannot qualify and legend marks overlapping clubs',()=>{
 const value=mapping({created:10,ranked:0,totalPlays:null,genreCount:undefined});
 assert.deepEqual(mappingClubMatches(value).map(c=>c.id),['factory','gems','draft']);
 const html=mappingLegendMarkup(value);
 assert.match(mappingClubMarkup(value,{legend:true}),/data-mapping-legend aria-haspopup="dialog"/);assert.match(html,/Also qualifies/);
 assert.doesNotMatch(html,/Multi-Mode/);
 assert.equal(mappingClubMarkup(mapping({created:0})), '');
});

test('every mapping logo uses the shared centered vector artboard',()=>{
 for(const club of MAPPING_CLUBS){const icon=mappingClubIcon(club.id);assert.match(icon,/viewBox="0 0 24 24"/);assert.match(icon,/<path[^>]* d="[^"]+"/);}
 assert.match(mappingClubMarkup(mapping({created:1})),/mapping-club-symbol[^>]*><svg/);
});

test('Ranked Debut requires a ranked submission and replaces Genre Architects',()=>{
 assert.equal(assignMappingClub(mapping({ranked:1})).id,'breakthrough');
 assert.equal(assignMappingClub(mapping({ranked:0,genreCount:10})).id,'draft');
 assert.ok(!MAPPING_CLUBS.some(club=>club.id==='genres'));
 assert.ok(mappingClubMatches(mapping({ranked:3})).some(club=>club.id==='breakthrough'));
});

test('mapping club colors use CSP-safe CSS classes rather than inline styles',()=>{
 const legend=mappingLegendMarkup(mapping({created:1}));
 assert.doesNotMatch(legend,/style=/);
 for(const club of MAPPING_CLUBS)assert.ok(legend.includes('class="mapping-club-'+club.id+'"'));
 const badge=mappingClubMarkup(mapping({created:1}));
 assert.match(badge,/mapping-club-badge mapping-club-draft/);assert.doesNotMatch(badge,/style=/);
});
