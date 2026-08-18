"use client";

import { useMemo } from "react";
import { NIC_SECTIONS } from "@/data/nicSections";
import { getFrameworkRowsForSection } from "@/data/frameworkMateriality";
import { CANONICAL_ISSUE_BY_ID } from "@/data/canonicalIssues";
import { PILLAR_COLOR } from "@/lib/palette";
import type { Pillar } from "@/lib/types";

const PILLARS: Pillar[] = ["Environment", "Social", "Governance", "Cross-cutting"];

interface SectorSplit {
  code: string;
  name: string;
  weights: Record<Pillar, number>; // sums to 100
}

function computeSplits(): SectorSplit[] {
  const splits: SectorSplit[] = [];
  for (const section of NIC_SECTIONS) {
    const rows = getFrameworkRowsForSection(section.code);
    if (rows.length === 0) continue;

    const totals: Record<Pillar, number> = { Environment: 0, Social: 0, Governance: 0, "Cross-cutting": 0 };
    for (const row of rows) {
      const issue = CANONICAL_ISSUE_BY_ID.get(row.issueId);
      if (!issue) continue;
      totals[issue.pillar] += row.weight;
    }
    const sum = PILLARS.reduce((s, p) => s + totals[p], 0) || 1;
    const weights = Object.fromEntries(
      PILLARS.map((p) => [p, (totals[p] / sum) * 100])
    ) as Record<Pillar, number>;

    splits.push({ code: section.code, name: section.name, weights });
  }

  return splits.sort((a, b) => {
    const dominantA = PILLARS.reduce((best, p) => (a.weights[p] > a.weights[best] ? p : best), PILLARS[0]);
    const dominantB = PILLARS.reduce((best, p) => (b.weights[p] > b.weights[best] ? p : best), PILLARS[0]);
    if (dominantA !== dominantB) return PILLARS.indexOf(dominantA) - PILLARS.indexOf(dominantB);
    return b.weights[dominantA] - a.weights[dominantB];
  });
}

export function SectorMaterialitySplit({ highlightSection }: { highlightSection?: string | null }) {
  const splits = useMemo(() => computeSplits(), []);

  return (
    <div className="rounded-xl border border-[--border] bg-[--surface-1] p-5">
      <h3 className="text-base font-semibold text-[--text-primary]">Sector materiality split</h3>
      <p className="mb-3 text-sm text-[--text-secondary]">
        E/S/G weight % by NIC sector (mock framework data), sorted by dominant pillar.
      </p>
      <div className="space-y-2">
        {splits.map((s) => (
          <div key={s.code} className={s.code === highlightSection ? "rounded-md bg-[--surface-2] p-1" : "p-1"}>
            <div className="mb-1 flex justify-between text-xs text-[--text-secondary]">
              <span>
                {s.code} &middot; {s.name}
              </span>
            </div>
            <div className="flex h-4 w-full overflow-hidden rounded-sm">
              {PILLARS.map((p) => (
                <div
                  key={p}
                  style={{ width: `${s.weights[p]}%`, backgroundColor: PILLAR_COLOR[p].light }}
                  title={`${p}: ${s.weights[p].toFixed(0)}%`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[--text-secondary]">
        {PILLARS.map((p) => (
          <div key={p} className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PILLAR_COLOR[p].light }} />
            {p}
          </div>
        ))}
      </div>
    </div>
  );
}
