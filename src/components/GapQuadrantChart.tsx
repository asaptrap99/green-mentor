"use client";

import { useMemo, useState } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import type { IssueGapPoint, Pillar } from "@/lib/types";
import { PILLAR_COLOR } from "@/lib/palette";

const QUADRANT_SPLIT = { x: 0.5, y: 0.3 };

const QUADRANT_META = {
  aligned: { label: "Aligned", note: "high materiality, high disclosure" },
  "blind-spot": { label: "Blind spot", note: "low materiality, high disclosure" },
  "exposure-risk": { label: "Exposure risk", note: "high materiality, low disclosure" },
  noise: { label: "Noise", note: "low materiality, low disclosure" },
} as const;

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: IssueGapPoint }[] }) {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-[--border] bg-[--surface-1] px-3 py-2 text-sm shadow-lg">
      <div className="font-medium text-[--text-primary]">{p.issueName}</div>
      <div className="mt-1 space-y-0.5 text-[--text-secondary]">
        <div>Materiality weight: {(p.materialityWeight * 100).toFixed(0)}%</div>
        <div>Peer disclosure prevalence: {(p.disclosurePrevalence * 100).toFixed(0)}%</div>
        <div>Mentions: {p.mentionVolume.toLocaleString()}</div>
        <div>Frameworks: {p.frameworksFlagging.join(", ") || "none"}</div>
        <div>Quadrant: {QUADRANT_META[p.quadrant].label}</div>
      </div>
    </div>
  );
}

export function GapQuadrantChart({ points }: { points: IssueGapPoint[] }) {
  const [showNoise, setShowNoise] = useState(false);

  const visible = useMemo(
    () => points.filter((p) => showNoise || p.quadrant !== "noise"),
    [points, showNoise]
  );

  const byPillar = useMemo(() => {
    const groups: Record<Pillar, IssueGapPoint[]> = {
      Environment: [],
      Social: [],
      Governance: [],
      "Cross-cutting": [],
    };
    for (const p of visible) groups[p.pillar].push(p);
    return groups;
  }, [visible]);

  if (points.length === 0) {
    return (
      <div className="rounded-xl border border-[--border] bg-[--surface-1] p-8 text-center text-[--text-secondary]">
        No framework materiality data mapped for this company&apos;s industry yet.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[--border] bg-[--surface-1] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-[--text-primary]">
            Materiality &times; disclosure gap
          </h3>
          <p className="text-sm text-[--text-secondary]">
            X: framework-consensus materiality weight &middot; Y: BRSR peer disclosure
            prevalence
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm text-[--text-secondary]">
          <input
            type="checkbox"
            checked={showNoise}
            onChange={(e) => setShowNoise(e.target.checked)}
          />
          Show noise quadrant
        </label>
      </div>

      <div className="relative h-[420px] w-full">
        {/* exposure-risk quadrant tint */}
        <div
          className="pointer-events-none absolute rounded-sm bg-[#d03b3b1a]"
          style={{
            left: `${QUADRANT_SPLIT.x * 100}%`,
            top: 0,
            right: 0,
            bottom: `${(1 - QUADRANT_SPLIT.y) * 100}%`,
          }}
        />
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 16, right: 24, bottom: 24, left: 8 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" />
            <XAxis
              type="number"
              dataKey="materialityWeight"
              domain={[0, 1]}
              tickFormatter={(v) => `${Math.round(v * 100)}%`}
              stroke="var(--text-secondary)"
              tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
              label={{
                value: "Framework materiality weight",
                position: "insideBottom",
                offset: -12,
                fill: "var(--text-secondary)",
                fontSize: 12,
              }}
            />
            <YAxis
              type="number"
              dataKey="disclosurePrevalence"
              domain={[0, 1]}
              tickFormatter={(v) => `${Math.round(v * 100)}%`}
              stroke="var(--text-secondary)"
              tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
              label={{
                value: "BRSR peer disclosure prevalence",
                angle: -90,
                position: "insideLeft",
                fill: "var(--text-secondary)",
                fontSize: 12,
              }}
            />
            <ZAxis type="number" dataKey="mentionVolume" range={[40, 320]} />
            <ReferenceLine x={QUADRANT_SPLIT.x} stroke="var(--border)" strokeWidth={1} />
            <ReferenceLine y={QUADRANT_SPLIT.y} stroke="var(--border)" strokeWidth={1} />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: "2 4" }} />
            {(Object.keys(byPillar) as Pillar[]).map((pillar) => (
              <Scatter key={pillar} name={pillar} data={byPillar[pillar]} fill={PILLAR_COLOR[pillar].light}>
                {byPillar[pillar].map((p) => (
                  <Cell key={p.issueId} fill={PILLAR_COLOR[p.pillar].light} fillOpacity={0.85} />
                ))}
              </Scatter>
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[--text-secondary]">
        {(Object.keys(PILLAR_COLOR) as Pillar[]).map((pillar) => (
          <div key={pillar} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: PILLAR_COLOR[pillar].light }}
            />
            {pillar}
          </div>
        ))}
        <span className="ml-auto italic">Point size = BRSR mention volume</span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-4">
        {(Object.entries(QUADRANT_META) as [keyof typeof QUADRANT_META, (typeof QUADRANT_META)[keyof typeof QUADRANT_META]][]).map(
          ([key, meta]) => (
            <div
              key={key}
              className={`rounded-md border px-2.5 py-1.5 text-xs ${
                key === "exposure-risk"
                  ? "border-[#d03b3b66] bg-[#d03b3b14] text-[--text-primary]"
                  : "border-[--border] text-[--text-secondary]"
              }`}
            >
              <div className="font-medium">{meta.label}</div>
              <div>{meta.note}</div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
