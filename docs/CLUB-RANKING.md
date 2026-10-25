# Club ranking and primary/secondary archetypes

All 19 clubs can qualify as primary or secondary. The app evaluates every signal independently rather than stopping at the first qualifying category. It ranks qualifying candidates by strength, assigns the strongest as primary, and assigns the next distinct candidate as secondary. If only one qualifies, there is no secondary. All-Rounder remains the fallback and can also qualify as a genuinely balanced signal.

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
| Quality Over Quantity | 55-80, increasing as the recorded yearly playcount drops from 99 toward 1. |
| Stable Loyalists / Lazer Pioneers | 62 for confirmed 100% client exclusivity. |
| Balanced All-Rounder | 60-80, increasing as the largest mod-family share drops below 40%. |
| Fallback All-Rounder | 0 when no other signal qualifies. |

Exact strength ties use supporting evidence coverage, then the fixed club-definition order so rerenders return the same result. Coverage is the applicable score fraction, valid passed-score fraction, diversity fraction, or available/regular month fraction. Explicitly confirmed client coverage is 100%. Nothing is randomly chosen.

This allows contextual clubs such as client exclusivity and low playcount to win when they best describe the available data, while strong mod, accuracy, or map preferences can outrank them. Every club has test fixtures demonstrating both a primary and a secondary result.

## Display and stored community data

The dashboard, club reveal slide, and recap all show the same primary and secondary result. Each secondary uses its actual club name, emblem, color, motto on the recap, and deciding reason. The former precision-only badge is replaced by this generic secondary slot. The legend highlights both roles.

Community percentages still count one primary club per participant/year/mode. Secondary matches do not inflate those percentages. Current assignment rules are `2026-v13`. Existing schema v6 supports all 19 IDs, so this ranking change needs no new SQL migration. Participants update their existing row when generating a fresh review; aggregates exclude older assignment-rule versions until refreshed.

Mod preference weighting is reduced to 40-55 so stronger accuracy, map preference, loyalty, or exploration can lead instead of duplicating the Favorite Mod stat. Qualification thresholds are unchanged. This is an assignment-rule update only; no new SQL is needed on schema v5.

Both activity clubs use the same 55-80 range. Repeat Offenders starts at 55 with 10,000 plays and six regular months, and reaches 80 at 50,000 plays with twelve regular months. Quality Over Quantity starts at 55 for 99 recorded plays and reaches 80 for one recorded play. Qualification thresholds are unchanged.

## Evidence weighting and small-sample safeguards

Current assignment rules are `2026-v13`. Listed strength ranges are base weights: score-based candidates are multiplied by `0.5 + 0.5 * min(evidenceScoreCount / 20, 1)`; accuracy uses only valid passed scores for this count. Activity candidates use `0.75 + 0.25 * min(availableMonths / 6, 1)` instead. Full weighting begins at 20 evidence scores or six available months. One eligible score still receives a club, with a provisional message below 20 scores.

Mapper Loyalists additionally requires at least three matching scores across two distinct mapsets from the same host. Balanced All-Rounder considers at least three mod combinations, five hosts, and five artists, with no tracked mod family reaching 40%. All 19 clubs remain eligible for primary or secondary. Mode-specific accuracy thresholds remain heuristic; they are not claimed to be population-calibrated. This update needs no new SQL on schema v5.

Mod clubs now use a low base range of 40-55 to avoid duplicating the Favorite Mod stat. They remain eligible for either role but usually yield to qualifying skill, map-preference, activity, client, and diversity signals. Evidence weighting and qualification thresholds are unchanged.

Balanced All-Rounder now uses a 60-80 base range, with existing variety requirements and evidence weighting. Fallback All-Rounder remains 0. All clubs still have primary and secondary test cases.

One Shot Society: SD or PF on at least 40% of selected scores; each score counts once. Base strength 40-55 with normal evidence weighting, eligible as primary or secondary. Existing databases must run `scripts/sql/club-community-v6.sql` before deployment; fresh databases use the base SQL. This migration preserves participant records. Assignment rules: `2026-v13`.
