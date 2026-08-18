import type { FrameworkMaterialityRecord, FrameworkName } from "@/lib/types";
import { CANONICAL_ISSUES } from "./canonicalIssues";

/**
 * MOCK DATA — MSCI only. See DATA_PROVENANCE.md.
 *
 * MSCI's ESG Industry Materiality Map exists only as a screenshot of an external
 * tool (admin.greenmentor.co) in the source workbook — there is no structured data
 * to parse. This module generates a realistic, deterministic placeholder dataset
 * shaped to the real FrameworkMaterialityRecord contract, so the gap chart,
 * framework comparison panel, and passport are fully functional today. Swap this
 * module for a real data source later — nothing else in the data layer needs to
 * change.
 *
 * (SASB and Sustainalytics are no longer mocked — see sasbFrameworkMateriality.ts
 * and sustainalyticsFrameworkMateriality.ts for real data.)
 *
 * Only NIC sections with real BRSR company coverage are seeded; the rest are left
 * unmapped so the UI's "not yet mapped" fallback path is exercised honestly.
 */

const SEEDED_SECTIONS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "Q"];

// mulberry32 — deterministic PRNG so the mock dataset is stable across builds.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0;
  return h;
}

const FRAMEWORKS: FrameworkName[] = ["MSCI"];

function generate(): FrameworkMaterialityRecord[] {
  const records: FrameworkMaterialityRecord[] = [];

  for (const section of SEEDED_SECTIONS) {
    for (const framework of FRAMEWORKS) {
      const rng = mulberry32(hashString(`${section}:${framework}`));
      // each framework flags 8-14 of the 56 canonical issues as material for this sector
      const count = 8 + Math.floor(rng() * 7);
      const shuffled = [...CANONICAL_ISSUES]
        .map((issue) => ({ issue, sort: rng() }))
        .sort((a, b) => a.sort - b.sort)
        .slice(0, count);

      for (const { issue } of shuffled) {
        records.push({
          framework,
          nicSection: section,
          issueId: issue.id,
          termName: issue.name,
          weight: Math.round((0.35 + rng() * 0.65) * 100) / 100,
          source: "mock",
        });
      }
    }
  }

  return records;
}

export const MOCK_FRAMEWORK_MATERIALITY: FrameworkMaterialityRecord[] = generate();
