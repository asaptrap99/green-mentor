"use client";

import { useMemo, useState } from "react";
import { NIC_SECTIONS } from "@/data/nicSections";
import { PILLAR_COLOR } from "@/lib/palette";
import type { NicIndustry, NicSection } from "@/lib/types";

// Icicle-style drill-down: Section -> Industry -> Group, segment width
// proportional to BRSR company count (section level, real data) or group count
// (industry level — no company count exists below section in the source).
const TIER_COLOR: Record<string, string> = {
  Primary: PILLAR_COLOR.Environment.light,
  Secondary: PILLAR_COLOR.Governance.light,
  Tertiary: PILLAR_COLOR.Social.light,
};

function IcicleRow({
  label,
  sub,
  weight,
  totalWeight,
  color,
  active,
  onClick,
}: {
  label: string;
  sub?: string;
  weight: number;
  totalWeight: number;
  color: string;
  active?: boolean;
  onClick?: () => void;
}) {
  const pct = Math.max(2, (weight / totalWeight) * 100);
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-left text-xs transition-opacity hover:opacity-90 ${
        active ? "ring-2 ring-[--text-primary]" : ""
      }`}
      style={{ width: `${pct}%`, backgroundColor: color, minWidth: "120px" }}
      title={`${label}${sub ? ` — ${sub}` : ""}`}
    >
      <span className="truncate font-medium text-white">{label}</span>
      <span className="shrink-0 text-white/80">{sub}</span>
    </button>
  );
}

export function TaxonomyExplorer() {
  const [selectedSection, setSelectedSection] = useState<NicSection | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<NicIndustry | null>(null);

  const totalCompanies = useMemo(
    () => Math.max(1, ...NIC_SECTIONS.map((s) => s.companyCount)),
    []
  );
  const totalGroupsInSection = useMemo(
    () => Math.max(1, ...(selectedSection?.industries.map((i) => i.groups.length) ?? [1])),
    [selectedSection]
  );

  return (
    <div className="rounded-xl border border-[--border] bg-[--surface-1] p-5">
      <h3 className="text-base font-semibold text-[--text-primary]">Taxonomy explorer</h3>
      <p className="mb-3 text-sm text-[--text-secondary]">
        NIC Section &rarr; Industry &rarr; Group. Segment width = BRSR company count
        (section level, real data) or group count (industry level).
      </p>

      <div className="flex items-center gap-1 text-xs text-[--text-secondary]">
        <button
          className="hover:underline"
          onClick={() => {
            setSelectedSection(null);
            setSelectedIndustry(null);
          }}
        >
          All sections
        </button>
        {selectedSection && (
          <>
            <span>/</span>
            <button
              className="hover:underline"
              onClick={() => setSelectedIndustry(null)}
            >
              {selectedSection.code} &middot; {selectedSection.name}
            </button>
          </>
        )}
        {selectedIndustry && (
          <>
            <span>/</span>
            <span>
              {selectedIndustry.code} &middot; {selectedIndustry.name}
            </span>
          </>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-1">
        {!selectedSection &&
          NIC_SECTIONS.map((s) => (
            <IcicleRow
              key={s.code}
              label={`${s.code} · ${s.name}`}
              sub={`${s.companyCount} companies`}
              weight={Math.max(s.companyCount, 1)}
              totalWeight={totalCompanies}
              color={TIER_COLOR[s.tier]}
              onClick={() => setSelectedSection(s)}
            />
          ))}

        {selectedSection &&
          !selectedIndustry &&
          selectedSection.industries.map((ind) => (
            <IcicleRow
              key={ind.code}
              label={`${ind.code} · ${ind.name}`}
              sub={`${ind.groups.length} groups`}
              weight={Math.max(ind.groups.length, 1)}
              totalWeight={totalGroupsInSection}
              color={TIER_COLOR[selectedSection.tier]}
              onClick={() => setSelectedIndustry(ind)}
            />
          ))}

        {selectedIndustry &&
          selectedIndustry.groups.map((g) => (
            <IcicleRow
              key={g.code}
              label={`${g.code} · ${g.name}`}
              weight={1}
              totalWeight={1}
              color={selectedSection ? TIER_COLOR[selectedSection.tier] : "#888"}
            />
          ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[--text-secondary]">
        {Object.entries(TIER_COLOR).map(([tier, color]) => (
          <div key={tier} className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
            {tier}
          </div>
        ))}
      </div>
    </div>
  );
}
