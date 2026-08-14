import type { CompanyMaterialityProfile, FrameworkName } from "@/lib/types";
import { CANONICAL_ISSUES } from "@/data/canonicalIssues";

const FRAMEWORKS: FrameworkName[] = ["Sustainalytics", "SASB", "MSCI"];

export function FrameworkComparison({ profile }: { profile: CompanyMaterialityProfile }) {
  const { frameworkRows, nicSection } = profile;

  if (!nicSection || frameworkRows.length === 0) {
    return (
      <div className="rounded-xl border border-[--border] bg-[--surface-1] p-5">
        <h3 className="text-base font-semibold text-[--text-primary]">Framework comparison</h3>
        <p className="mt-2 text-sm text-[--text-secondary]">
          Not yet mapped — no Sustainalytics, SASB, or MSCI data for this company&apos;s
          industry.
        </p>
      </div>
    );
  }

  const byFramework = new Map<FrameworkName, Map<string, number>>();
  for (const f of FRAMEWORKS) byFramework.set(f, new Map());
  for (const row of frameworkRows) {
    byFramework.get(row.framework)?.set(row.issueId, row.weight);
  }

  const relevantIssueIds = new Set(frameworkRows.map((r) => r.issueId));
  const rows = CANONICAL_ISSUES.filter((i) => relevantIssueIds.has(i.id));

  return (
    <div className="rounded-xl border border-[--border] bg-[--surface-1] p-5">
      <h3 className="text-base font-semibold text-[--text-primary]">
        Framework comparison &middot; {nicSection.name}
      </h3>
      <p className="mb-3 text-sm text-[--text-secondary]">
        Rows highlighted where all three frameworks agree an issue is material.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-[--border] text-left text-[--text-secondary]">
              <th className="py-2 pr-3 font-medium">Issue</th>
              {FRAMEWORKS.map((f) => (
                <th key={f} className="py-2 px-3 font-medium">
                  {f}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((issue) => {
              const weights = FRAMEWORKS.map((f) => byFramework.get(f)?.get(issue.id));
              const agreeAll = weights.every((w) => w !== undefined);
              const flaggedCount = weights.filter((w) => w !== undefined).length;
              const diverge = flaggedCount === 1;
              return (
                <tr
                  key={issue.id}
                  className={`border-b border-[--border] ${
                    agreeAll ? "bg-[#1baf7a14]" : diverge ? "bg-[#fab21914]" : ""
                  }`}
                >
                  <td className="py-2 pr-3 text-[--text-primary]">{issue.name}</td>
                  {weights.map((w, i) => (
                    <td key={i} className="py-2 px-3 text-[--text-secondary]">
                      {w !== undefined ? `${Math.round(w * 100)}%` : "—"}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
