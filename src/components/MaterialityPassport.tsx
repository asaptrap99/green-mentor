import type { CompanyMaterialityProfile, FrameworkName } from "@/lib/types";
import { TIER_COLOR } from "@/lib/palette";

const FRAMEWORKS: FrameworkName[] = ["Sustainalytics", "SASB", "MSCI"];

function FrameworkDots({ flagging }: { flagging: FrameworkName[] }) {
  return (
    <div className="flex items-center gap-1" title={flagging.join(", ") || "not flagged"}>
      {FRAMEWORKS.map((f) => (
        <span
          key={f}
          className={`inline-block h-2.5 w-2.5 rounded-full border ${
            flagging.includes(f)
              ? "border-[#2a78d6] bg-[#2a78d6]"
              : "border-[--border] bg-transparent"
          }`}
        />
      ))}
    </div>
  );
}

export function MaterialityPassport({ profile }: { profile: CompanyMaterialityProfile }) {
  const { company, nicSection, topMaterialIssues } = profile;

  return (
    <div className="rounded-xl border border-[--border] bg-[--surface-1] p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[--text-primary]">{company.name}</h2>
          <p className="text-sm text-[--text-secondary]">{company.symbol} &middot; FY {company.fy}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {nicSection ? (
            <>
              <Pill label={`NIC ${nicSection.code}`} sub={nicSection.name} />
              <Pill
                label={nicSection.tier}
                sub={`${nicSection.industriesCount} industries, ${nicSection.groupsCount} groups`}
                muted
              />
              {nicSection.gicsSector && <Pill label="GICS" sub={nicSection.gicsSector} muted />}
              {nicSection.sicsSector && <Pill label="SICS" sub={nicSection.sicsSector} muted />}
            </>
          ) : (
            <Pill label="NIC" sub="unmapped" muted />
          )}
          <Pill label="BRSR coverage" sub={`${company.coverage}%`} />
        </div>
      </div>

      <div className="mt-5">
        <h3 className="mb-2 text-sm font-medium text-[--text-secondary]">
          Top material issues &middot; framework consensus
        </h3>
        <p className="mb-2 text-xs text-[--text-secondary]">
          Issues most frameworks (Sustainalytics / SASB / MSCI) flag as material for
          {" "}{company.name}&apos;s NIC sector{nicSection ? ` (${nicSection.name})` : ""}.
          No framework publishes materiality at the individual-company level, so this
          is the company&apos;s sector standing in for a company-specific score.
        </p>
        {topMaterialIssues.length === 0 ? (
          <p className="text-sm text-[--text-secondary]">
            Not yet mapped — no framework materiality data for this industry.
          </p>
        ) : (
          <ul className="divide-y divide-[--border]">
            {topMaterialIssues.map((issue) => {
              const tierColor = issue.tier ? TIER_COLOR[issue.tier] : null;
              return (
                <li key={issue.issueId} className="flex items-center justify-between gap-3 py-2">
                  <span className="text-sm text-[--text-primary]">{issue.issueName}</span>
                  <div className="flex items-center gap-3">
                    <FrameworkDots flagging={issue.frameworksFlagging} />
                    {tierColor ? (
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{ backgroundColor: tierColor.bg, color: tierColor.text }}
                      >
                        {issue.tier}
                      </span>
                    ) : (
                      <span className="rounded-full bg-[--surface-2] px-2 py-0.5 text-xs text-[--text-secondary]">
                        no BRSR data
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
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
