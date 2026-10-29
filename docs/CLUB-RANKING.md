# Club ranking and primary/secondary archetypes

All 27 clubs can qualify as primary or secondary. The app evaluates every signal independently rather than stopping at the first qualifying category. It ranks qualifying candidates by strength, assigns the strongest as primary, and assigns the next distinct candidate as secondary. If only one qualifies, there is no secondary. All-Rounder remains the fallback and can also qualify as a genuinely balanced signal.

## Sample and eligibility

Score-based signals use all deduplicated eligible 2026 scores in the selected mode's current top 200, including scores without PP. Accuracy uses valid passed scores in that sample. Activity uses available monthly 2026 profile playcounts across all modes. At least one eligible score is needed. Existing mod, accuracy, map-age, popularity, loyalty, exploration, and activity thresholds still apply. Unknown client/date metadata never qualifies by inference.

All-Rounder qualifies as a balanced signal when there are at least three distinct mod combinations, five mapper hosts, and five artists, and every mod family is below 40% of the sample. It is not automatically appended as a secondary for every user.

## Strength scores

These are transparent design heuristics, not statistical confidence estimates or community percentages. For a bounded interval, values are clamped to that interval. A qualifying share's progress is `(observed share - qualifying threshold) / (1 - qualifying threshold)`.

| Signal | Strength |
| --- | --- |
| Mod preferences | 40-55, increasing with share above the club's threshold. |
| Map age/popular-map preferences | 68-96, increasing with share above the club's threshold. |
| Precision Society | 65-90, increasing from the mode's accuracy threshold toward 100% accuracy. |
| Close Enough Club | 65-90, increasing with the gap below the mode's lower-accuracy threshold, capped at a 15 percentage-point gap. |
| Artist Loyalists / One-Map Wonders | 55-80, increasing from a 25% qualifying share toward 100%. |
| Short & Sweet / Long Haul Club | 55-80, increasing from a 60% qualifying share toward 100%. |
| Modded Only | 60 for zero No Mod selected scores. |
| Mapper Loyalists | 55-80, increasing from 25% under one host toward 100%. |
| The Wanderers | 60-85, increasing as the smaller host/artist diversity ratio grows from 50% toward 100%. |
| The Repeat Offenders | 55-80: 70% of the progress comes from playcount (10,000-50,000) and 30% from regular months (6-12). |
| Replay Society | 55-80 logarithmically: 500 views received -> 55; 5,000 -> 67.5; 50,000+ -> 80. |
| Choke Artists | 70-95, increasing above the 30% qualifying share. |
| Quality Over Quantity | 55-80, increasing as the recorded yearly playcount drops from 99 toward 1. |
| Stable Loyalists / Lazer Pioneers | 62 for confirmed 100% client exclusivity. |
| Balanced All-Rounder | 60-80, increasing as the largest mod-family share drops below 40%. |
| Fallback All-Rounder | 0 when no other signal qualifies. |

Exact strength ties use supporting evidence coverage, then the fixed club-definition order so rerenders return the same result. Coverage is the applicable score fraction, valid passed-score fraction, diversity fraction, or available/regular month fraction. Explicitly confirmed client coverage is 100%. Nothing is randomly chosen.

This allows contextual clubs such as client exclusivity and low playcount to win when they best describe the available data, while strong mod, accuracy, or map preferences can outrank them. Every club has test fixtures demonstrating both a primary and a secondary result.


## Evidence and ranking

All 26 playstyle clubs can be primary or secondary. Strongest evidence-adjusted signal wins, followed by the next distinct match. Exact ties use supporting coverage, then definition order. Score evidence uses `0.5 + 0.5 * min(evidenceScores / 20, 1)`; accuracy uses valid passed scores. Activity evidence uses `0.75 + 0.25 * min(availableMonths / 6, 1)`, using replay-history months for Replay Society. One eligible score remains enough; fewer than 20 scores receive a provisional note. These are design weights, not probabilities. See [ranking guide](CLUB-RANKING.md).

### Replay Society

Replay Society - "Your plays deserve another look." Requires at least 500 views received on the user's replays in available 2026 monthly profile history (all modes). This measures views by others, not replays the user watched, and not unique viewers. Source: https://osu.ppy.sh/docs/ (UserStatistics.replays_watched_by_others); monthly history uses replays_watched_counts.

500 per year is a provisional, deliberately substantial design threshold (about 42 per month over a full year), not a verified percentile or population average. No reliable population distribution was available during implementation. Base strength is 55 + 25 * clamp(log10(views / 500) / 2, 0, 1): 55 at 500, 67.5 at 5,000, 80 at 50,000+. Apply the same activity confidence multiplier as other activity clubs: 0.75 + 0.25 * min(available replay-history months / 6, 1). No annualization of partial-year data; missing or invalid history cannot qualify. It can be a primary or secondary trait.

Playstyle assignment rules are `2026-v28`. Replay Society uses the existing playstyle community table and v9 migration; mapping tracking remains independent.

Artist Loyalists mirrors Mapper Loyalists: at least 25% of selected scores, with at least three scores across two distinct mapsets sharing the same artist credit. Base strength is 55-80, with the standard score-evidence adjustment. Artist credits use case-insensitive, whitespace-normalized matching.

The legend displays clubs by descending maximum base strength, then descending minimum. Equal ranges retain a fixed display order. This is presentation only: personal evidence-adjusted scores still determine primary and secondary clubs, and assignment tie-break order remains unchanged. All-Rounder always appears last in the legend, regardless of its balanced strength range or the user’s match strength.

One-Map Wonders uses a 55-80 base range: at least 25% of selected scores from one mapset across at least two distinct confirmed beatmap IDs. It uses normal score-evidence weighting and can be primary or secondary.

Short & Sweet / Long Haul Club: base strength 55-80, increasing from a 60% share toward 100%. mod-adjusted total lengths of <=90 seconds and >=210 seconds qualify respectively. Missing lengths stay in the denominator and never count as qualifying. Speed mods affect classification using the same duration calculation as average-beatmap stats. Both can be primary or secondary.

Modded Only has fixed base strength 60 when every selected score uses a gameplay mod (zero No Mod scores). CL-only scores count as No Mod. Standard score-evidence weighting applies; either primary or secondary is allowed.

Current eligibility updates (2026-v28): map-age and map-length clubs have no minimum score count. Crowd Favorites requires two distinct popular mapsets. Choke Artists requires a 30% share without an absolute score minimum. Accuracy clubs require valid passes covering at least 50% of selected scores. Mapper and Artist Loyalists retain two distinct mapsets without a three-score minimum. One-Map Wonders requires two distinct difficulties. Repeat Offenders requires 10,000 recorded plays without a monthly activity minimum; its base strength scales from 55 at 10,000 to 80 at 50,000 plays. Existing evidence weighting still applies. No new SQL migration is required.
