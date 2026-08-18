# Data provenance

Source: the attached `Green_mentor.xlsx` workbook (5 tabs). What's actually usable
differs a lot from what the tab names suggest.

## Real data (extracted, `src/data/brsr.json`)

From the **BRSR Reports** tab — the only tab with structured, parseable rows:

- **56 disclosure topics** across 4 pillars (Environment 18, Social 16, Governance 8,
  Cross-cutting 14), each with tier (T1/T2/T3), company count, prevalence, mention
  volume, and regulatory/opportunity split. **Aggregated across all BRSR-covered
  companies — not broken down per NIC sector.** There is no sector-level disclosure
  split anywhere in the source.
- **1,343 companies**: symbol, name, FY, sector string (NIC section letter + name,
  e.g. `"CManufacturing"` → parsed into section `C` / `Manufacturing`), coverage
  score. 10 companies have `sectorRaw: "unmapped"`.
- Largest emitters (Scope 1+2, 12 companies), renewable energy share (12 companies),
  worker LTIFR band distribution (5 bands), largest water withdrawers (10 companies).

From **NIC Classification** (`src/data/nicTaxonomy.json`, parsed from the
user-provided full NIC taxonomy text dump, `scripts/nic_full_taxonomy_raw.txt`):
the complete real Section &rarr; Industry &rarr; Group hierarchy for all 21 NIC
sections — 21 sections, 105 industries, 306 groups, each with its real code and
name, plus Primary/Secondary/Tertiary tier. Verified against the NIC Classification
summary counts (industriesCount/groupsCount match exactly for every section). The
taxonomy explorer (`src/components/TaxonomyExplorer.tsx`, Screen 1/5) is built on
this and lets an analyst drill Section &rarr; Industry &rarr; Group.

From **SASB Materiality Finder** (`src/data/sasbIndustries.json`, parsed from the
user-provided SASB-by-industry export, `scripts/sasb_raw.txt` →
`scripts/parse_sasb.py`): **77 real SASB industries**, each with its SASB code
(e.g. `FB-AG`), SASB sector, a NIC Section + 2-digit Industry code, a mapping
confidence (high/medium/low — as given in the source), and its full set of
General Issue Categories with SASB disclosure topic names. Verified: every
industry's `issuesCount` matches its parsed general-issue count exactly (0
mismatches). This is real vendor materiality data — the only one of the three
frameworks that is.

**How SASB is used in the app** (`src/data/sasbFrameworkMateriality.ts`,
`src/data/sasbCrosswalk.ts`): two honest limitations, both flagged inline in code:
1. SASB data is at NIC Industry granularity, but BRSR company records only carry
   NIC Section (no industry digit) — so a company's *exact* SASB industry can't
   always be resolved (sections with >1 industry are ambiguous; single-industry
   sections like D/L/O/P resolve exactly). The app aggregates: for each canonical
   issue, weight = (# industries in the section flagging it) / (# SASB industries
   in that section) — a section-level consistency signal, not a per-company exact
   weight.
2. SASB's ~26 General Issue Categories don't share names with the BRSR canonical
   issue set, so `sasbCrosswalk.ts` hand-maps each SASB category to the closest
   BRSR topic (e.g. "GHG Emissions" → "Climate Change & GHG Emissions"). This is a
   documented heuristic, not sourced data — SASB doesn't publish a BRSR crosswalk.

The SASB industry detail block (`src/components/SasbIndustryDetail.tsx`) shows the
real, un-aggregated per-industry data directly, so an analyst can see the exact
underlying rows rather than only the aggregated signal.

From **Sustainalytics — 22 Material ESG Issues** (`src/data/sustainalyticsIndustries.json`,
parsed from the user-provided Sustainalytics-by-subindustry export,
`scripts/sustainalytics_raw.txt` → `scripts/parse_sustainalytics.py`): **138 real
Sustainalytics subindustries** (all 138 the source listed — "138 / 138"), each with
a NIC Section + 2-digit Industry code, a mapping confidence, and its flagged subset
of the 22 Material ESG Issues (MEIs), plus the full text definitions of all 22
MEIs. Verified: every subindustry's stated MEI count matches its parsed
material-issue list exactly (0 mismatches).

**How Sustainalytics is used in the app**
(`src/data/sustainalyticsFrameworkMateriality.ts`,
`src/data/sustainalyticsCrosswalk.ts`): identical approach and identical two
limitations as SASB above — NIC-Industry-granularity data aggregated to NIC-Section
because BRSR companies don't carry an industry digit, and a hand-authored crosswalk
from the 22 MEI names to the BRSR canonical issue set (e.g. "Carbon – Own
Operations" → "Climate Change & GHG Emissions"). The Sustainalytics industry detail
block (`src/components/SustainalyticsIndustryDetail.tsx`) shows the real,
un-aggregated rows.

**SASB and Sustainalytics are now both real data.** Only MSCI remains mocked.

## Mock / placeholder data

- **`src/data/frameworkMateriality.mock.ts`** — MSCI's Industry Materiality Map
  only (SASB and Sustainalytics are real — see above). The MSCI tab is empty of
  structured data (21 embedded images across the workbook — screenshots of the
  admin.greenmentor.co tool, not parseable rows), and per the user, there's no
  pipeline access to the underlying tool yet. This module generates a
  deterministic, seeded placeholder dataset shaped to the real
  `FrameworkMaterialityRecord` contract (15 NIC sections seeded, weight 0.35–1.0 per
  issue). **Swap this module for real vendor data later — nothing else in the data
  layer needs to change.**
- **GICS/SICS crosswalk** (`nicSections.ts` → `MOCK_CROSSWALK`) — approximate,
  hand-guessed sector mappings for sections with BRSR coverage. Not a validated
  crosswalk.

## Known simplification

Gap-score computation (`src/lib/dataLayer.ts` → `computeGapPoints`) compares
sector-specific framework materiality against **all-company** BRSR prevalence,
because sector-split disclosure data doesn't exist in the source. This is flagged
inline in the code and should be revisited once sector-level BRSR data is available.
