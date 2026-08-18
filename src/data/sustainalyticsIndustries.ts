import sustainalyticsRaw from "./sustainalyticsIndustries.json";
import type { SustainalyticsIndustryProfile } from "@/lib/types";

// Real data: 138 Sustainalytics subindustries (all 22 Material ESG Issue
// categories, verified against every subindustry's stated MEI count), parsed
// from the user-provided Sustainalytics export (scripts/sustainalytics_raw.txt ->
// scripts/parse_sustainalytics.py -> sustainalyticsIndustries.json). See
// DATA_PROVENANCE.md.
const data = sustainalyticsRaw as {
  definitions: Record<string, string>;
  industries: SustainalyticsIndustryProfile[];
};

export const SUSTAINALYTICS_MEI_DEFINITIONS = data.definitions;
export const SUSTAINALYTICS_INDUSTRIES = data.industries;

export function getSustainalyticsIndustriesForSection(
  nicSection: string
): SustainalyticsIndustryProfile[] {
  return SUSTAINALYTICS_INDUSTRIES.filter((s) => s.nicSection === nicSection);
}
