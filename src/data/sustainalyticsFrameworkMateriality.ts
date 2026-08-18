import type { FrameworkMaterialityRecord } from "@/lib/types";
import { getSustainalyticsIndustriesForSection } from "./sustainalyticsIndustries";
import { sustainalyticsMeiToCanonicalId } from "./sustainalyticsCrosswalk";
import { CANONICAL_ISSUE_BY_ID } from "./canonicalIssues";

/**
 * REAL DATA, aggregated — same approach and same limitation as
 * sasbFrameworkMateriality.ts. Sustainalytics data is at NIC Industry
 * granularity; BRSR companies only carry NIC Section, so for sections with
 * multiple Sustainalytics-covered industries this aggregates: for each
 * canonical issue, weight = (# industries in the section flagging it) / (#
 * Sustainalytics industries in that section). See DATA_PROVENANCE.md.
 */
function computeSustainalyticsSectionMateriality(nicSection: string): FrameworkMaterialityRecord[] {
  const industries = getSustainalyticsIndustriesForSection(nicSection);
  if (industries.length === 0) return [];

  const byIssue = new Map<string, { count: number; meiNames: Set<string> }>();

  for (const industry of industries) {
    const issuesInThisIndustry = new Map<string, string>(); // issueId -> meiName
    for (const meiName of industry.materialIssues) {
      const issueId = sustainalyticsMeiToCanonicalId(meiName);
      if (!issueId || !CANONICAL_ISSUE_BY_ID.has(issueId)) continue;
      issuesInThisIndustry.set(issueId, meiName);
    }
    for (const [issueId, meiName] of issuesInThisIndustry) {
      const entry = byIssue.get(issueId) ?? { count: 0, meiNames: new Set<string>() };
      entry.count += 1;
      entry.meiNames.add(meiName);
      byIssue.set(issueId, entry);
    }
  }

  const records: FrameworkMaterialityRecord[] = [];
  for (const [issueId, { count, meiNames }] of byIssue) {
    records.push({
      framework: "Sustainalytics",
      nicSection,
      issueId,
      termName: [...meiNames].join(" / "),
      weight: Math.round((count / industries.length) * 100) / 100,
      source: "real",
    });
  }

  return records;
}

const sectionCache = new Map<string, FrameworkMaterialityRecord[]>();

export function getRealSustainalyticsRowsForSection(nicSection: string): FrameworkMaterialityRecord[] {
  if (!sectionCache.has(nicSection)) {
    sectionCache.set(nicSection, computeSustainalyticsSectionMateriality(nicSection));
  }
  return sectionCache.get(nicSection)!;
}
