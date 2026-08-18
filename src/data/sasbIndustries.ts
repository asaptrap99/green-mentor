import sasbRaw from "./sasbIndustries.json";
import type { SasbIndustryProfile } from "@/lib/types";

// Real data: 77 SASB industries, each mapped to a NIC Section + 2-digit Industry
// code, parsed from the user-provided SASB Materiality Finder export
// (scripts/sasb_raw.txt -> scripts/parse_sasb.py -> sasbIndustries.json). See
// DATA_PROVENANCE.md.
export const SASB_INDUSTRIES = sasbRaw as SasbIndustryProfile[];

export function getSasbIndustriesForSection(nicSection: string): SasbIndustryProfile[] {
  return SASB_INDUSTRIES.filter((s) => s.nicSection === nicSection);
}

export function getSasbIndustry(nicSection: string, nicIndustryCode: string): SasbIndustryProfile | null {
  return (
    SASB_INDUSTRIES.find(
      (s) => s.nicSection === nicSection && s.nicIndustryCode === nicIndustryCode
    ) ?? null
  );
}
