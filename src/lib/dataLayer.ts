import type {
  BrsrTopicRecord,
  Company,
  CompanyMaterialityProfile,
  FrameworkName,
  GapQuadrant,
  IssueGapPoint,
  Pillar,
  SubindustryProfile,
} from "./types";
import brsr from "@/data/brsr.json";
import { CANONICAL_ISSUES } from "@/data/canonicalIssues";
import { getFrameworkRowsForSection } from "@/data/frameworkMateriality";
import { getNicSection, NIC_SECTIONS } from "@/data/nicSections";
import { SUSTAINALYTICS_INDUSTRIES } from "@/data/sustainalyticsIndustries";
import { getSasbIndustry } from "@/data/sasbIndustries";

const companies = brsr.companies as Company[];

const BRSR_TOPICS: BrsrTopicRecord[] = Object.entries(
  brsr.topics as Record<
    string,
    {
      topic: string;
      tier: string;
      companies: number;
      prevalence: number;
      mentions: number;
      regulatory: number;
      opportunity: number;
      regulatoryAndOpportunity: number;
    }[]
  >
).flatMap(([pillar, rows]) =>
  rows.map((r) => ({
    topic: r.topic,
    pillar: pillar as Pillar,
    tier: r.tier as BrsrTopicRecord["tier"],
    companies: r.companies,
    prevalence: r.prevalence,
    mentions: r.mentions,
    regulatory: r.regulatory,
    opportunity: r.opportunity,
    regulatoryAndOpportunity: r.regulatoryAndOpportunity,
  }))
);

const BRSR_TOPIC_BY_NAME = new Map(BRSR_TOPICS.map((t) => [t.topic, t]));

export function searchCompanies(query: string, limit = 8): Company[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return companies
    .filter(
      (c) => c.symbol.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
    )
    .slice(0, limit);
}

export function getCompanyBySymbol(symbol: string): Company | null {
  return companies.find((c) => c.symbol === symbol) ?? null;
}

function classifyQuadrant(materialityWeight: number, prevalence: number): GapQuadrant {
  const highMateriality = materialityWeight >= 0.5;
  const highDisclosure = prevalence >= 0.3;
  if (highMateriality && highDisclosure) return "aligned";
  if (!highMateriality && highDisclosure) return "blind-spot";
  if (highMateriality && !highDisclosure) return "exposure-risk";
  return "noise";
}

/** Computes the gap between framework-consensus materiality and BRSR peer
 *  disclosure prevalence for every canonical issue in a NIC section. NOTE: BRSR
 *  prevalence in the source data is aggregated across ALL BRSR companies, not
 *  broken down per sector — the workbook has no sector-level disclosure split. This
 *  uses the all-company benchmark as a stand-in peer baseline; swap in a real
 *  sector-filtered prevalence once that data exists. See DATA_PROVENANCE.md. */
export function computeGapPoints(nicSectionCode: string | null): IssueGapPoint[] {
  const frameworkRows = nicSectionCode ? getFrameworkRowsForSection(nicSectionCode) : [];

  const byIssue = new Map<string, { framework: FrameworkName; weight: number }[]>();
  for (const row of frameworkRows) {
    const list = byIssue.get(row.issueId) ?? [];
    list.push({ framework: row.framework, weight: row.weight });
    byIssue.set(row.issueId, list);
  }

  const points: IssueGapPoint[] = [];
  for (const issue of CANONICAL_ISSUES) {
    const flags = byIssue.get(issue.id) ?? [];
    if (flags.length === 0) continue; // not flagged material by any framework for this sector

    const materialityWeight =
      flags.reduce((sum, f) => sum + f.weight, 0) / flags.length;
    const brsrTopic = BRSR_TOPIC_BY_NAME.get(issue.name);
    const disclosurePrevalence = brsrTopic?.prevalence ?? 0;

    points.push({
      issueId: issue.id,
      issueName: issue.name,
      pillar: issue.pillar,
      materialityWeight,
      frameworksFlagging: flags.map((f) => f.framework),
      disclosurePrevalence,
      mentionVolume: brsrTopic?.mentions ?? 0,
      tier: (brsrTopic?.tier as IssueGapPoint["tier"]) ?? null,
      quadrant: classifyQuadrant(materialityWeight, disclosurePrevalence),
      gapScore: Math.round((materialityWeight - disclosurePrevalence) * 1000) / 1000,
    });
  }

  return points.sort((a, b) => b.gapScore - a.gapScore);
}

export function getCompanyMaterialityProfile(symbol: string): CompanyMaterialityProfile | null {
  const company = getCompanyBySymbol(symbol);
  if (!company) return null;

  const nicSection = getNicSection(company.nicSection);
  const frameworkRows = company.nicSection ? getFrameworkRowsForSection(company.nicSection) : [];
  const gapPoints = computeGapPoints(company.nicSection);

  const topMaterialIssues = [...gapPoints]
    .filter((p) => p.frameworksFlagging.length > 0)
    .sort((a, b) => b.frameworksFlagging.length - a.frameworksFlagging.length || b.materialityWeight - a.materialityWeight)
    .slice(0, 6);

  return {
    company,
    nicSection,
    frameworkRows,
    brsrTopics: BRSR_TOPICS,
    gapPoints,
    topMaterialIssues,
  };
}

export function searchSubindustries(query: string, limit = 8) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return SUSTAINALYTICS_INDUSTRIES.filter((s) => s.name.toLowerCase().includes(q)).slice(
    0,
    limit
  );
}

export function getCompaniesForNicSection(nicSection: string | null): Company[] {
  if (!nicSection) return [];
  return companies.filter((c) => c.nicSection === nicSection);
}

export function getSubindustryProfile(name: string): SubindustryProfile | null {
  const subindustry = SUSTAINALYTICS_INDUSTRIES.find((s) => s.name === name);
  if (!subindustry) return null;

  const nicSection = getNicSection(subindustry.nicSection);
  const sasbMatch = getSasbIndustry(subindustry.nicSection, subindustry.nicIndustryCode);
  const frameworkRows = getFrameworkRowsForSection(subindustry.nicSection);
  const gapPoints = computeGapPoints(subindustry.nicSection);

  const topMaterialIssues = [...gapPoints]
    .filter((p) => p.frameworksFlagging.length > 0)
    .sort(
      (a, b) =>
        b.frameworksFlagging.length - a.frameworksFlagging.length ||
        b.materialityWeight - a.materialityWeight
    )
    .slice(0, 6);

  return {
    subindustry,
    sasbMatch,
    nicSection,
    frameworkRows,
    gapPoints,
    topMaterialIssues,
    companies: getCompaniesForNicSection(subindustry.nicSection),
  };
}

export { BRSR_TOPICS, NIC_SECTIONS };
