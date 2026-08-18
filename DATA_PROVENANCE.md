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

From **NIC Classification** (`src/data/nicSectionSummary.json`, parsed from the
user-provided `Green_mentor_NIC_Classification.csv` export): all 21 NIC sections
(A–U) with their real name, Primary/Secondary/Tertiary tier, and real Industry/Group
counts (e.g. "C · Manufacturing — Secondary, 24 industries, 71 groups"). This is
still a **summary**, not the code list — the actual Industry- and Group-level codes
and names within each section (e.g. "C.10.5 — Dairy products") are not present in
the source and remain unavailable. The taxonomy sunburst/icicle explorer (Screen
1/5) is still blocked on that.

## Mock / placeholder data

- **`src/data/frameworkMateriality.mock.ts`** — Sustainalytics' 22 Material ESG
  Issues, the SASB Materiality Finder, and MSCI's Industry Materiality Map. The
  workbook tabs for all three are empty of structured data (21 embedded images —
  screenshots of the admin.greenmentor.co tool, not parseable rows), and per the
  user, there's no pipeline access to the underlying tool yet. This module
  generates a deterministic, seeded placeholder dataset shaped to the real
  `FrameworkMaterialityRecord` contract (14 NIC sections seeded, weight 0.35–1.0 per
  issue). **Swap this module for real vendor data later — nothing else in the data
  layer needs to change.**
- **GICS/SICS crosswalk** (`nicSections.ts` → `MOCK_CROSSWALK`) — approximate,
  hand-guessed sector mappings for sections with BRSR coverage. Not a validated
  crosswalk.
- **NIC Industry/Group-level codes** — not available. The taxonomy explorer /
  drill-down (Screen 1/5 sunburst) described in the epic is deferred until the user
  supplies the real NIC code list (per plan).

## Known simplification

Gap-score computation (`src/lib/dataLayer.ts` → `computeGapPoints`) compares
sector-specific framework materiality against **all-company** BRSR prevalence,
because sector-split disclosure data doesn't exist in the source. This is flagged
inline in the code and should be revisited once sector-level BRSR data is available.
