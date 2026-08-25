"use client";

import { useState } from "react";

interface GlossaryEntry {
  term: string;
  definition: string;
}

interface GlossaryGroup {
  heading: string;
  entries: GlossaryEntry[];
}

const GLOSSARY: GlossaryGroup[] = [
  {
    heading: "Company identity",
    entries: [
      {
        term: "NIC Section / Industry / Group",
        definition:
          "National Industrial Classification (2008) hierarchy the company is sorted into: Section (1 letter, e.g. \"D · Electricity, gas, steam and air conditioning supply\") → Industry (2-digit) → Group (3-digit). BRSR company records only carry the Section letter, not the Industry/Group digits — so any Industry- or Group-level number shown for a company is inferred from its Section, not read directly off the company's own filing.",
      },
      {
        term: "Tier (Primary / Secondary / Tertiary)",
        definition:
          "The NIC section's position in the classification hierarchy (e.g. Manufacturing is a Primary-tier section). Unrelated to the BRSR T1/T2/T3 topic tier below — same word, different scale.",
      },
      {
        term: "GICS / SICS sector",
        definition:
          "Global Industry Classification Standard / Sustainability Industry Classification System crosswalk for the NIC section. Currently a hand-guessed placeholder mapping, not sourced vendor data.",
      },
      {
        term: "BRSR coverage",
        definition:
          "The completeness score the source BRSR workbook assigns to a company's disclosure for its reporting year — how much of the expected BRSR content the company actually filed, not an ESG performance score.",
      },
    ],
  },
  {
    heading: "Materiality & gap chart",
    entries: [
      {
        term: "Canonical issue",
        definition:
          "One of 56 ESG topics, taken verbatim from the BRSR topic list, used as the common key every framework (Sustainalytics, SASB, MSCI) and BRSR topic record is matched against.",
      },
      {
        term: "Framework materiality weight",
        definition:
          "0–1 score for how material a canonical issue is judged to be by a given framework (Sustainalytics, SASB, or MSCI), for the company's NIC section — not a score published for the company itself. \"Framework-consensus materiality weight\" is the mean of this weight across every framework that flags the issue.",
      },
      {
        term: "Frameworks flagging",
        definition:
          "Which of Sustainalytics / SASB / MSCI treat a given issue as material for this NIC section. Shown as filled/empty dots on the passport and gap chart.",
      },
      {
        term: "BRSR peer disclosure prevalence",
        definition:
          "Share (0–1) of all BRSR-reporting companies — not just this company's sector peers — that disclose on a given topic. The source data has no sector-level disclosure split, so this all-company figure is used as a stand-in peer baseline.",
      },
      {
        term: "Mention volume",
        definition: "Raw count of BRSR filings that mention the topic, across all reporters.",
      },
      {
        term: "BRSR topic tier (T1 / T2 / T3)",
        definition:
          "The priority tier the BRSR workbook assigns each of the 56 topics (T1 highest). Independent of the NIC Primary/Secondary/Tertiary tier above.",
      },
      {
        term: "Gap score",
        definition:
          "Framework-consensus materiality weight minus BRSR peer disclosure prevalence. Positive = the issue is considered material more than it's disclosed (exposure risk); negative = disclosed more than it's flagged material.",
      },
      {
        term: "Quadrant — Aligned",
        definition: "High materiality, high disclosure: the issue is material and well-reported.",
      },
      {
        term: "Quadrant — Blind spot",
        definition: "Low materiality, high disclosure: heavily reported despite low framework materiality.",
      },
      {
        term: "Quadrant — Exposure risk",
        definition: "High materiality, low disclosure: material by framework consensus but under-reported — the highest-priority gap.",
      },
      {
        term: "Quadrant — Noise",
        definition: "Low materiality, low disclosure: neither material nor commonly reported. Hidden by default.",
      },
    ],
  },
  {
    heading: "Framework & sector reference",
    entries: [
      {
        term: "SASB General Issue Category",
        definition:
          "One of SASB's own ~26 material issue categories (e.g. \"GHG Emissions\"), each with its own SASB disclosure topics. Hand-mapped to the closest BRSR canonical issue, since SASB doesn't publish a BRSR crosswalk.",
      },
      {
        term: "Sustainalytics MEI (Material ESG Issue)",
        definition:
          "One of Sustainalytics' fixed set of 22 Material ESG Issues. A subindustry's \"MEI count\" is how many of the 22 are flagged material for it.",
      },
      {
        term: "Mapping confidence (high / medium / low)",
        definition:
          "How exactly a SASB/Sustainalytics industry maps to a NIC Industry code — high = exact match, lower = an approximate match made because BRSR company records don't carry the NIC Industry digit needed to resolve it precisely.",
      },
      {
        term: "Sector materiality split",
        definition:
          "E/S/G weight % for every NIC sector (not just the selected company's), computed by summing framework materiality weights per pillar. A cross-sector reference chart, not a company-specific one — the selected company's sector is highlighted, the rest are shown for comparison.",
      },
    ],
  },
  {
    heading: "Peer benchmark",
    entries: [
      {
        term: "Scope 1 / Scope 2 emissions",
        definition:
          "Direct (Scope 1) and purchased-energy (Scope 2) greenhouse gas emissions in tCO2e, shown only for the ~12 companies in the source's \"largest emitters\" list — not all companies have this figure.",
      },
      {
        term: "Renewable energy %",
        definition: "Share of a company's energy consumption from renewable sources, for the ~12 companies in the source's renewable-share list.",
      },
      {
        term: "Water withdrawal",
        definition: "Total water withdrawn (KL/year), for the ~10 companies in the source's largest-water-withdrawers list.",
      },
      {
        term: "LTIFR (Lost Time Injury Frequency Rate)",
        definition:
          "Worker safety metric: lost-time injuries per unit of hours worked. The source only has the distribution of companies across LTIFR bands, not each company's individual figure — so this chart shows the overall peer distribution, not this company's band.",
      },
    ],
  },
];

export function MetricsGlossary() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-[--border] bg-[--surface-1] p-5">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left"
      >
        <div>
          <h3 className="text-base font-semibold text-[--text-primary]">
            Nomenclature &amp; definitions
          </h3>
          <p className="text-sm text-[--text-secondary]">
            What every metric, score, and label on this dashboard means and where it comes from.
          </p>
        </div>
        <span className="text-sm text-[--text-secondary]">{open ? "Hide" : "Show"}</span>
      </button>

      {open && (
        <div className="mt-4 flex flex-col gap-5">
          {GLOSSARY.map((group) => (
            <div key={group.heading}>
              <h4 className="mb-2 text-sm font-medium text-[--text-primary]">{group.heading}</h4>
              <dl className="space-y-2">
                {group.entries.map((e) => (
                  <div key={e.term} className="text-sm">
                    <dt className="font-medium text-[--text-primary]">{e.term}</dt>
                    <dd className="text-[--text-secondary]">{e.definition}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
