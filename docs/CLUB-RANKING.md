# Club ranking and primary/secondary archetypes

All 21 clubs can qualify as primary or secondary. The app evaluates every signal independently rather than stopping at the first qualifying category. It ranks qualifying candidates by strength, assigns the strongest as primary, and assigns the next distinct candidate as secondary. If only one qualifies, there is no secondary. All-Rounder remains the fallback and can also qualify as a genuinely balanced signal.

## Sample and eligibility

Score-based signals use all deduplicated eligible 2026 scores in the selected mode's current top 200, including scores without PP. Accuracy uses valid passed scores in that sample. Activity uses available monthly 2026 profile playcounts across all modes. At least one eligible score is needed. Existing mod, accuracy, map-age, popularity, loyalty, exploration, and activity thresholds still apply. Unknown client/date metadata never qualifies by inference.

All-Rounder qualifies as a balanced signal when there are at least three distinct mod combinations, five mapper hosts, and five artists, and every mod family is below 40% of the sample. It is not automatically appended as a secondary for every user.

## Strength scores

These are transparent design heuristics, not statistical confidence estimates or community percentages. For a bounded interval, values are clamped to that interval. A qualifying share's progress is `(observed share - qualifying threshold) / (1 - qualifying threshold)`.

| Signal | Strength |
| --- | --- |
| Mod preferences | 40-55, increasing with share above the club's threshold. |
| Map age/popular-map preferences | 68-96, increasing with share above the club's threshold. |
| Precision Society | 70-100, increasing from the mode's accuracy threshold toward 100% accuracy. |
| Close Enough Club | 70-100, increasing with the gap below the mode's lower-accuracy threshold, capped at a 15 percentage-point gap. |
| Mapper Loyalists | 60-95, increasing from 25% under one host toward 100%. |
| The Wanderers | 60-85, increasing as the smaller host/artist diversity ratio grows from 50% toward 100%. |
| The Repeat Offenders | 55-80: 70% of the progress comes from playcount (10,000-50,000) and 30% from regular months (6-12). |
| Replay Society | 55-80 logarithmically: 500 views received -> 55; 5,000 -> 67.5; 50,000+ -> 80. |
| Choke Artists | 65-90, increasing above the 30% qualifying share. |
| Quality Over Quantity | 55-80, increasing as the recorded yearly playcount drops from 99 toward 1. |
| Stable Loyalists / Lazer Pioneers | 62 for confirmed 100% client exclusivity. |
| Balanced All-Rounder | 60-80, increasing as the largest mod-family share drops below 40%. |
| Fallback All-Rounder | 0 when no other signal qualifies. |

Exact strength ties use supporting evidence coverage, then the fixed club-definition order so rerenders return the same result. Coverage is the applicable score fraction, valid passed-score fraction, diversity fraction, or available/regular month fraction. Explicitly confirmed client coverage is 100%. Nothing is randomly chosen.

This allows contextual clubs such as client exclusivity and low playcount to win when they best describe the available data, while strong mod, accuracy, or map preferences can outrank them. Every club has test fixtures demonstrating both a primary and a secondary result.


## Evidence and ranking

All 21 playstyle clubs can be primary or secondary. Strongest evidence-adjusted signal wins, followed by the next distinct match. Exact ties use supporting coverage, then definition order. Score evidence uses `0.5 + 0.5 * min(evidenceScores / 20, 1)`; accuracy uses valid passed scores. Activity evidence uses `0.75 + 0.25 * min(availableMonths / 6, 1)`, using replay-history months for Replay Society. One eligible score remains enough; fewer than 20 scores receive a provisional note. These are design weights, not probabilities. See [ranking guide](CLUB-RANKING.md).

### Replay Society

Replay Society - "Your plays deserve another look." Requires at least 500 views received on the user's replays in available 2026 monthly profile history (all modes). This measures views by others, not replays the user watched, and not unique viewers. Source: https://osu.ppy.sh/docs/ (UserStatistics.replays_watched_by_others); monthly history uses replays_watched_counts.

500 per year is a provisional, deliberately substantial design threshold (about 42 per month over a full year), not a verified percentile or population average. No reliable population distribution was available during implementation. Base strength is 55 + 25 * clamp(log10(views / 500) / 2, 0, 1): 55 at 500, 67.5 at 5,000, 80 at 50,000+. Apply the same activity confidence multiplier as other activity clubs: 0.75 + 0.25 * min(available replay-history months / 6, 1). No annualization of partial-year data; missing or invalid history cannot qualify. It can be a primary or secondary trait.

Playstyle assignment rules are `2026-v15`. Replay Society uses the existing playstyle community table and v8 migration; mapping tracking remains independent.
