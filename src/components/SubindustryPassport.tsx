import type { SubindustryProfile } from "@/lib/types";
import { SUSTAINALYTICS_MEI_DEFINITIONS } from "@/data/sustainalyticsIndustries";

const CONFIDENCE_LABEL: Record<string, string> = {
  high: "exact NIC industry match",
  medium: "medium-confidence NIC mapping",
  low: "low-confidence NIC mapping",
};

export function SubindustryPassport({ profile }: { profile: SubindustryProfile }) {
  const { subindustry, sasbMatch, nicSection } = profile;

  return (
    <div className="rounded-xl border border-[--border] bg-[--surface-1] p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[--text-primary]">{subindustry.name}</h2>
          <p className="text-sm text-[--text-secondary]">
            NIC {subindustry.nicSection}.{subindustry.nicIndustryCode}
            {nicSection ? ` · ${nicSection.name}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Pill label="Sustainalytics MEIs" sub={`${subindustry.meiCount}`} />
          <Pill label="Mapping" sub={CONFIDENCE_LABEL[subindustry.confidence]} muted />
          {sasbMatch && <Pill label="SASB" sub={sasbMatch.name} muted />}
        </div>
      </div>

      <div className="mt-5">
        <h3 className="mb-2 text-sm font-medium text-[--text-secondary]">
          Market issues &middot; Sustainalytics Material ESG Issues
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {subindustry.materialIssues.map((mei) => (
            <span
              key={mei}
              className="rounded-full bg-[--surface-2] px-2 py-0.5 text-xs text-[--text-secondary]"
              title={SUSTAINALYTICS_MEI_DEFINITIONS[mei] ?? undefined}
            >
              {mei}
            </span>
          ))}
        </div>
      </div>

      {sasbMatch && (
        <div className="mt-4">
          <h3 className="mb-2 text-sm font-medium text-[--text-secondary]">
            Market issues &middot; SASB general issue categories ({sasbMatch.sasbCode})
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {sasbMatch.generalIssues.map((gi) => (
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
      )}
    </div>
  );
}

function Pill({ label, sub, muted }: { label: string; sub: string; muted?: boolean }) {
  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-xs ${
        muted ? "border-[--border] text-[--text-secondary]" : "border-[#2a78d666] text-[--text-primary]"
      }`}
    >
      <span className="font-medium">{label}:</span> {sub}
    </span>
  );
}
