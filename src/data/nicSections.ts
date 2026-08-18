import type { NicSection } from "@/lib/types";
import brsr from "./brsr.json";
import nicTaxonomy from "./nicTaxonomy.json";

// Real data, parsed from the user-provided NIC Classification export
// (scripts/nic_full_taxonomy_raw.txt → src/data/nicTaxonomy.json): the full
// Section -> Industry -> Group hierarchy for all 21 NIC sections, with tier and
// verified industry/group counts. See DATA_PROVENANCE.md.
const NIC_TAXONOMY = nicTaxonomy as Omit<NicSection, "companyCount" | "gicsSector" | "sicsSector">[];

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

export const NIC_SECTIONS: NicSection[] = NIC_TAXONOMY.map((s) => ({
  ...s,
  companyCount: companyCounts[s.code] ?? 0,
  gicsSector: MOCK_CROSSWALK[s.code]?.gics,
  sicsSector: MOCK_CROSSWALK[s.code]?.sics,
}));

export function getNicSection(code: string | null | undefined): NicSection | null {
  if (!code) return null;
  return NIC_SECTIONS.find((s) => s.code === code) ?? null;
}
