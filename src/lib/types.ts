export type Pillar = "Environment" | "Social" | "Governance" | "Cross-cutting";

export type FrameworkName = "Sustainalytics" | "SASB" | "MSCI";

export type Tier = "T1" | "T2" | "T3";

/** NIC (National Industrial Classification) taxonomy node — section level only for now.
 *  Section names are the real, public NIC 2008 section list. Industry/Group-level codes
 *  are NOT yet available (the source workbook only has summary counts) — see
 *  DATA_PROVENANCE.md. GICS/SICS crosswalk fields are placeholders pending real data. */
export type NicTier = "Primary" | "Secondary" | "Tertiary";

export interface NicGroup {
  code: string; // 3-digit, e.g. "105"
  name: string; // e.g. "Manufacture of dairy products"
}

export interface NicIndustry {
  code: string; // 2-digit, e.g. "10"
  name: string; // e.g. "Manufacture of food products"
  groups: NicGroup[];
}

export interface NicSection {
  code: string; // e.g. "C"
  name: string; // e.g. "Manufacturing"
  tier: NicTier; // real, from NIC Classification source
  industriesCount: number; // real count of Industry-level codes under this section
  groupsCount: number; // real count of Group-level codes under this section
  industries: NicIndustry[]; // real, full Section->Industry->Group hierarchy
  companyCount: number; // derived from real BRSR company master list
  gicsSector?: string; // MOCK — crosswalk not yet sourced
  sicsSector?: string; // MOCK — crosswalk not yet sourced
}

/** A framework-agnostic ESG issue. For v1 this is keyed 1:1 to the real BRSR topic
 *  names (56 topics across 4 pillars) since that's the only taxonomy with real,
 *  authoritative names in the source data. Framework-specific terminology is carried
 *  on FrameworkMaterialityRecord.termName. */
export interface CanonicalIssue {
  id: string; // slug, e.g. "climate-change-ghg-emissions"
  name: string;
  pillar: Pillar;
}

/** (Industry Node, Canonical Issue, Framework, weight). MSCI rows are MOCK DATA
 *  (see DATA_PROVENANCE.md — that tab has no structured source data). SASB and
 *  Sustainalytics rows are REAL, derived from the industry data the user
 *  provided, via a documented name-based crosswalk from each framework's own
 *  issue taxonomy to the BRSR canonical issue set — see `source` below. */
export interface FrameworkMaterialityRecord {
  framework: FrameworkName;
  nicSection: string;
  issueId: string;
  termName: string; // the framework's own name(s) for this issue
  weight: number; // 0..1 materiality weight for this industry
  source: "real" | "mock";
}

/** Real SASB Materiality Finder data, one row per SASB industry, keyed to a NIC
 *  Section + 2-digit Industry code. Source: user-provided SASB industry export. */
export interface SasbGeneralIssue {
  pillarCategory: "Environment" | "Social Capital" | "Human Capital" | "Business Model and Innovation" | "Leadership and Governance";
  generalIssueName: string;
  generalIssueCode: string;
  disclosureTopics: string[];
}

export interface SasbIndustryProfile {
  name: string;
  sasbCode: string;
  sasbSector: string;
  nicSection: string;
  nicIndustryCode: string;
  issuesCount: number;
  confidence: "high" | "medium" | "low";
  generalIssues: SasbGeneralIssue[];
}

/** Real Sustainalytics "22 Material ESG Issues" data, one row per Sustainalytics
 *  subindustry, keyed to a NIC Section + 2-digit Industry code. Source:
 *  user-provided Sustainalytics subindustry export. */
export interface SustainalyticsIndustryProfile {
  name: string;
  nicSection: string;
  nicIndustryCode: string;
  meiCount: number;
  confidence: "high" | "medium" | "low";
  materialIssues: string[]; // names of the flagged Material ESG Issues (of the 22)
}

export interface BrsrTopicRecord {
  topic: string;
  pillar: Pillar;
  tier: Tier;
  companies: number;
  prevalence: number; // 0..1, across ALL BRSR companies (not sector-split — see provenance)
  mentions: number;
  regulatory: number;
  opportunity: number;
  regulatoryAndOpportunity: number;
}

export interface Company {
  symbol: string;
  name: string;
  fy: string;
  sectorRaw: string;
  nicSection: string | null;
  nicSectionName: string | null;
  coverage: number;
}

export type GapQuadrant = "aligned" | "blind-spot" | "exposure-risk" | "noise";

export interface IssueGapPoint {
  issueId: string;
  issueName: string;
  pillar: Pillar;
  materialityWeight: number; // 0..1, framework consensus (mean of frameworks that flag it)
  frameworksFlagging: FrameworkName[];
  disclosurePrevalence: number; // 0..1, BRSR peer prevalence
  mentionVolume: number;
  tier: Tier | null;
  quadrant: GapQuadrant;
  gapScore: number; // materialityWeight - disclosurePrevalence, positive = exposure risk
}

export interface CompanyMaterialityProfile {
  company: Company;
  nicSection: NicSection | null;
  frameworkRows: FrameworkMaterialityRecord[];
  brsrTopics: BrsrTopicRecord[];
  gapPoints: IssueGapPoint[];
  topMaterialIssues: IssueGapPoint[]; // top 5-6 by framework consensus
}
