import type { FrameworkMaterialityRecord } from "@/lib/types";
import { MOCK_FRAMEWORK_MATERIALITY } from "./frameworkMateriality.mock";
import { getRealSasbRowsForSection } from "./sasbFrameworkMateriality";
import { NIC_SECTIONS } from "./nicSections";

// Merges mock Sustainalytics/MSCI rows with real, aggregated SASB rows into a
// single lookup, keyed by NIC section. See DATA_PROVENANCE.md.
const FRAMEWORK_MATERIALITY_BY_SECTION = new Map<string, FrameworkMaterialityRecord[]>();

for (const section of NIC_SECTIONS) {
  const mockRows = MOCK_FRAMEWORK_MATERIALITY.filter((r) => r.nicSection === section.code);
  const sasbRows = getRealSasbRowsForSection(section.code);
  FRAMEWORK_MATERIALITY_BY_SECTION.set(section.code, [...mockRows, ...sasbRows]);
}

export function getFrameworkRowsForSection(nicSection: string): FrameworkMaterialityRecord[] {
  return FRAMEWORK_MATERIALITY_BY_SECTION.get(nicSection) ?? [];
}
