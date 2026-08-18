import { getSasbIndustriesForSection } from "@/data/sasbIndustries";

const CONFIDENCE_LABEL: Record<string, string> = {
  high: "exact NIC industry match",
  medium: "medium-confidence NIC mapping",
  low: "low-confidence NIC mapping",
};

export function SasbIndustryDetail({ nicSection }: { nicSection: string | null }) {
  if (!nicSection) return null;
  const industries = getSasbIndustriesForSection(nicSection);
  if (industries.length === 0) return null;

  return (
    <div className="rounded-xl border border-[--border] bg-[--surface-1] p-5">
      <h3 className="text-base font-semibold text-[--text-primary]">
        SASB industries in this NIC section
      </h3>
      <p className="mb-3 text-sm text-[--text-secondary]">
        Real SASB Materiality Finder data. BRSR company records only carry NIC
        Section (not the 2-digit Industry code), so all SASB industries mapped to
        this section are shown — the company&apos;s exact SASB industry may be one
        specific row below.
      </p>
      <div className="space-y-3">
        {industries.map((ind) => (
          <div key={ind.sasbCode} className="rounded-lg border border-[--border] p-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <span className="font-medium text-[--text-primary]">{ind.name}</span>
                <span className="ml-2 text-xs text-[--text-secondary]">
                  {ind.sasbCode} &middot; {ind.sasbSector} &middot; NIC {ind.nicSection}.{ind.nicIndustryCode}
                </span>
              </div>
              <span className="text-xs text-[--text-secondary]">
                {CONFIDENCE_LABEL[ind.confidence]}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {ind.generalIssues.map((gi) => (
                <span
                  key={gi.generalIssueCode}
                  className="rounded-full bg-[--surface-2] px-2 py-0.5 text-xs text-[--text-secondary]"
                  title={gi.disclosureTopics.join(", ")}
                >
                  {gi.generalIssueName}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
