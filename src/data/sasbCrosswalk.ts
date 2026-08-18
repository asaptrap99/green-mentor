import { slugify } from "./canonicalIssues";

// Documented, hand-authored crosswalk from SASB's 26 General Issue Categories to
// the BRSR canonical issue set (the only taxonomy with real names in this
// project — see canonicalIssues.ts). This is a heuristic name/subject-matter
// mapping, not sourced data — SASB does not publish a BRSR crosswalk. Built once
// and used consistently everywhere SASB rows are converted to
// FrameworkMaterialityRecord. See DATA_PROVENANCE.md.
const SASB_TO_CANONICAL_NAME: Record<string, string> = {
  "GHG Emissions": "Climate Change & GHG Emissions",
  "Air Quality": "Air Quality & Pollution",
  "Energy Management": "Energy Management",
  "Water & Wastewater Management": "Water & Effluent Management",
  "Waste & Hazardous Materials Management": "Hazardous Substances Management",
  "Ecological Impacts": "Biodiversity & Land Use",
  "Human Rights & Community Relations": "Human Rights",
  "Customer Privacy": "Data Privacy & Cybersecurity",
  "Data Security": "Data Privacy & Cybersecurity",
  "Access & Affordability": "Financial Inclusion & Access",
  "Product Quality & Safety": "Product Quality & Safety",
  "Customer Welfare": "Customer Satisfaction & Experience",
  "Selling Practices & Product Labeling": "Customer Satisfaction & Experience",
  "Labour Practices": "Labour Relations & Fair Wages",
  "Employee Health & Safety": "Occupational Health & Safety",
  "Employee Engagement, Diversity & Inclusion": "Diversity, Equity & Inclusion",
  "Product Design & Lifecycle Management": "Green Products & Services",
  "Business Model Resilience": "Business Continuity & Crisis Management",
  "Supply Chain Management": "Sustainable Supply Chain",
  "Materials Sourcing & Efficiency": "Resource Management",
  "Physical Impacts of Climate Change": "Climate Change & GHG Emissions",
  "Business Ethics": "Business Ethics & Conduct",
  "Competitive Behaviour": "Regulatory Compliance",
  "Management of the Legal & Regulatory Environment": "Regulatory Compliance",
  "Critical Incident Risk Management": "Risk Management & Internal Controls",
  "Systemic Risk Management": "Risk Management & Internal Controls",
};

export function sasbGeneralIssueToCanonicalId(sasbGeneralIssueName: string): string | null {
  const canonicalName = SASB_TO_CANONICAL_NAME[sasbGeneralIssueName];
  return canonicalName ? slugify(canonicalName) : null;
}
