import type { NicSection } from "@/lib/types";
import brsr from "./brsr.json";

// Official NIC 2008 section names (public taxonomy). Company counts are derived
// from the real BRSR company master list. Industry/Group-level codes are not yet
// available — see DATA_PROVENANCE.md.
const NIC_SECTION_NAMES: Record<string, string> = {
  A: "Agriculture, forestry and fishing",
  B: "Mining and quarrying",
  C: "Manufacturing",
  D: "Electricity, gas, steam and air conditioning supply",
  E: "Water supply; sewerage, waste management and remediation activities",
  F: "Construction",
  G: "Wholesale and retail trade; repair of motor vehicles and motorcycles",
  H: "Transportation and storage",
  I: "Accommodation and food service activities",
  J: "Information and communication",
  K: "Financial and insurance activities",
  L: "Real estate activities",
  M: "Professional, scientific and technical activities",
  N: "Administrative and support service activities",
  O: "Public administration and defence; compulsory social security",
  P: "Education",
  Q: "Human health and social work activities",
  R: "Arts, entertainment and recreation",
  S: "Other service activities",
  T: "Activities of households as employers",
  U: "Activities of extraterritorial organisations and bodies",
};

// MOCK crosswalk — GICS/SICS mappings are not yet sourced. Placeholder values are
// approximate and only cover sections with real BRSR company counts.
const MOCK_CROSSWALK: Record<string, { gics?: string; sics?: string }> = {
  A: { gics: "Materials", sics: "Food & Agriculture" },
  B: { gics: "Materials", sics: "Extractives & Minerals Processing" },
  C: { gics: "Materials / Industrials", sics: "Resource Transformation" },
  D: { gics: "Utilities", sics: "Infrastructure" },
  E: { gics: "Utilities", sics: "Infrastructure" },
  F: { gics: "Industrials", sics: "Infrastructure" },
  G: { gics: "Consumer Discretionary", sics: "Consumer Goods" },
  H: { gics: "Industrials", sics: "Transportation" },
  I: { gics: "Consumer Discretionary", sics: "Services" },
  J: { gics: "Communication Services / IT", sics: "Technology & Communications" },
  K: { gics: "Financials", sics: "Financials" },
  L: { gics: "Real Estate", sics: "Infrastructure" },
  M: { gics: "Industrials", sics: "Services" },
  N: { gics: "Industrials", sics: "Services" },
  Q: { gics: "Health Care", sics: "Health Care" },
};

function computeCompanyCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const c of brsr.companies as { nicSection: string | null }[]) {
    if (!c.nicSection) continue;
    counts[c.nicSection] = (counts[c.nicSection] ?? 0) + 1;
  }
  return counts;
}

const companyCounts = computeCompanyCounts();

export const NIC_SECTIONS: NicSection[] = Object.entries(NIC_SECTION_NAMES).map(
  ([code, name]) => ({
    code,
    name,
    companyCount: companyCounts[code] ?? 0,
    gicsSector: MOCK_CROSSWALK[code]?.gics,
    sicsSector: MOCK_CROSSWALK[code]?.sics,
  })
);

export function getNicSection(code: string | null | undefined): NicSection | null {
  if (!code) return null;
  return NIC_SECTIONS.find((s) => s.code === code) ?? null;
}
