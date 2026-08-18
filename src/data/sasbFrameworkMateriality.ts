import type { FrameworkMaterialityRecord } from "@/lib/types";
import { getSasbIndustriesForSection } from "./sasbIndustries";
import { sasbGeneralIssueToCanonicalId } from "./sasbCrosswalk";
import { CANONICAL_ISSUE_BY_ID } from "./canonicalIssues";

/**
 * REAL DATA, aggregated. See DATA_PROVENANCE.md.
 *
 * The source SASB data is at NIC Industry (2-digit) granularity, but BRSR company
 * records only carry NIC Section (1-letter) — there is no industry-level digit in
 * the company master list — so a specific company's exact SASB industry can't
 * always be resolved (sections with more than one industry are ambiguous; sections
 * with exactly one industry, e.g. D/L/O/P, resolve exactly).
 *
 * For sections with multiple SASB-covered industries, this aggregates: for each
 * canonical issue, weight = (# industries in the section flagging it) / (# SASB
 * industries in the section). That's an honest "how consistently does SASB flag
 * this issue across the section's industries" signal, not a per-company exact
 * weight — flagged via FrameworkMaterialityRecord.source = "real" either way,
 * since every input row is real SASB data even though the aggregation is ours.
 */
function computeSasbSectionMateriality(nicSection: string): FrameworkMaterialityRecord[] {
  const industries = getSasbIndustriesForSection(nicSection);
  if (industries.length === 0) return [];

  // issueId -> { count of distinct industries flagging it, SASB names used }
  const byIssue = new Map<string, { count: number; sasbNames: Set<string> }>();

  for (const industry of industries) {
    const issuesInThisIndustry = new Map<string, string>(); // issueId -> sasbName
    for (const gi of industry.generalIssues) {
      const issueId = sasbGeneralIssueToCanonicalId(gi.generalIssueName);
      if (!issueId || !CANONICAL_ISSUE_BY_ID.has(issueId)) continue;
      issuesInThisIndustry.set(issueId, gi.generalIssueName);
    }
    for (const [issueId, sasbName] of issuesInThisIndustry) {
      const entry = byIssue.get(issueId) ?? { count: 0, sasbNames: new Set<string>() };
      entry.count += 1;
      entry.sasbNames.add(sasbName);
      byIssue.set(issueId, entry);
    }
  }

  const records: FrameworkMaterialityRecord[] = [];
  for (const [issueId, { count, sasbNames }] of byIssue) {
    records.push({
      framework: "SASB",
      nicSection,
      issueId,
      termName: [...sasbNames].join(" / "),
      weight: Math.round((count / industries.length) * 100) / 100,
      source: "real",
    });
  }

  return records;
}

const sectionCache = new Map<string, FrameworkMaterialityRecord[]>();

export function getRealSasbRowsForSection(nicSection: string): FrameworkMaterialityRecord[] {
  if (!sectionCache.has(nicSection)) {
    sectionCache.set(nicSection, computeSasbSectionMateriality(nicSection));
  }
  return sectionCache.get(nicSection)!;
}
