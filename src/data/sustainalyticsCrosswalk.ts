import { slugify } from "./canonicalIssues";

// Documented, hand-authored crosswalk from Sustainalytics' 22 Material ESG Issues
// to the BRSR canonical issue set — same approach as sasbCrosswalk.ts. Heuristic
// name/subject-matter mapping, not sourced data. See DATA_PROVENANCE.md.
const SUSTAINALYTICS_TO_CANONICAL_NAME: Record<string, string> = {
  "Corporate Governance": "Corporate Governance",
  "Stakeholder Governance": "Stakeholder Engagement & Materiality",
  "Access to Basic Services": "Product Availability & Access",
  "Business Ethics": "Business Ethics & Conduct",
  "Community Relations": "Community Engagement & CSR",
  "Data Privacy and Cybersecurity": "Data Privacy & Cybersecurity",
  "Emissions, Effluents and Waste": "Waste & Circular Economy",
  "Carbon – Own Operations": "Climate Change & GHG Emissions",
  "Carbon – Products and Services": "Green Products & Services",
  "E&S Impact of Products and Services": "Environmental Impact Management",
  "Human Rights": "Human Rights",
  "Human Rights – Supply Chain": "Sustainable Supply Chain",
  "Human Capital": "Human Capital & Talent Development",
  "Land Use and Biodiversity": "Biodiversity & Land Use",
  "Land Use and Biodiversity – Supply Chain": "Sustainable Supply Chain",
  "Occupational Health and Safety": "Occupational Health & Safety",
  "ESG Integration – Financials": "Risk Management & Internal Controls",
  "Product Governance": "Product Quality & Safety",
  Resilience: "Business Continuity & Crisis Management",
  "Water Use – Own Operations": "Water & Effluent Management",
  "Water Use – Supply Chain": "Sustainable Supply Chain",
  "Raw Material Use": "Resource Management",
};

export function sustainalyticsMeiToCanonicalId(meiName: string): string | null {
  const canonicalName = SUSTAINALYTICS_TO_CANONICAL_NAME[meiName];
  return canonicalName ? slugify(canonicalName) : null;
}
