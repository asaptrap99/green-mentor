import brsr from "@/data/brsr.json";
import type { Company } from "@/lib/types";

interface Metric {
  label: string;
  unit: string;
  value: number | null;
  peerMin: number;
  peerMax: number;
}

function BulletChart({ metric }: { metric: Metric }) {
  if (metric.value === null) {
    return (
      <div className="rounded-lg border border-[--border] p-3">
        <div className="text-xs font-medium text-[--text-secondary]">{metric.label}</div>
        <div className="mt-2 text-xs italic text-[--text-secondary]">
          Not in the largest-{metric.label.split(" ")[0].toLowerCase()} peer set — no data for
          this company.
        </div>
      </div>
    );
  }

  const range = metric.peerMax - metric.peerMin || 1;
  const pct = Math.min(100, Math.max(0, ((metric.value - metric.peerMin) / range) * 100));

  return (
    <div className="rounded-lg border border-[--border] p-3">
      <div className="flex items-baseline justify-between">
        <div className="text-xs font-medium text-[--text-secondary]">{metric.label}</div>
        <div className="text-sm font-semibold text-[--text-primary]">
          {metric.value.toLocaleString(undefined, { maximumFractionDigits: 2 })} {metric.unit}
        </div>
      </div>
      <div className="relative mt-2 h-3 rounded-sm bg-[--surface-2]">
        <div className="absolute inset-y-0 left-0 rounded-sm bg-[#b7d3f6]" style={{ width: "100%" }} />
        <div
          className="absolute top-1/2 h-3.5 w-1 -translate-y-1/2 rounded-sm bg-[#2a78d6]"
          style={{ left: `calc(${pct}% - 2px)` }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-[--text-secondary]">
        <span>{metric.peerMin.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
        <span>peer range</span>
        <span>{metric.peerMax.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
      </div>
    </div>
  );
}

export function PeerBenchmarkStrip({ company }: { company: Company }) {
  const emitters = brsr.largestEmitters as { company: string; scope1_tCO2e: number; scope2_tCO2e: number }[];
  const renewable = brsr.renewableShare as { company: string; renewablePct: number }[];
  const water = brsr.largestWaterWithdrawers as { company: string; withdrawalKL: number }[];
  const ltifr = brsr.ltifrDistribution as { band: string; companies: number }[];

  const emitterRow = emitters.find((e) => e.company === company.name);
  const renewableRow = renewable.find((r) => r.company === company.name);
  const waterRow = water.find((w) => w.company === company.name);

  const metrics: Metric[] = [
    {
      label: "Scope 1 emissions",
      unit: "tCO2e",
      value: emitterRow?.scope1_tCO2e ?? null,
      peerMin: Math.min(...emitters.map((e) => e.scope1_tCO2e)),
      peerMax: Math.max(...emitters.map((e) => e.scope1_tCO2e)),
    },
    {
      label: "Scope 2 emissions",
      unit: "tCO2e",
      value: emitterRow?.scope2_tCO2e ?? null,
      peerMin: Math.min(...emitters.map((e) => e.scope2_tCO2e)),
      peerMax: Math.max(...emitters.map((e) => e.scope2_tCO2e)),
    },
    {
      label: "Renewable energy %",
      unit: "%",
      value: renewableRow ? renewableRow.renewablePct * 100 : null,
      peerMin: Math.min(...renewable.map((r) => r.renewablePct * 100)),
      peerMax: Math.max(...renewable.map((r) => r.renewablePct * 100)),
    },
    {
      label: "Water withdrawal",
      unit: "KL",
      value: waterRow?.withdrawalKL ?? null,
      peerMin: Math.min(...water.map((w) => w.withdrawalKL)),
      peerMax: Math.max(...water.map((w) => w.withdrawalKL)),
    },
  ];

  const maxCount = Math.max(...ltifr.map((b) => b.companies));

  return (
    <div className="rounded-xl border border-[--border] bg-[--surface-1] p-5">
      <h3 className="text-base font-semibold text-[--text-primary]">Peer benchmark</h3>
      <p className="mb-3 text-sm text-[--text-secondary]">
        Hard metrics vs. the largest-reporters peer set (real BRSR data, ~10-12 companies per
        metric).
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <BulletChart key={m.label} metric={m} />
        ))}
      </div>

      <div className="mt-5">
        <div className="text-xs font-medium text-[--text-secondary]">
          Worker LTIFR distribution (across BRSR reporters)
        </div>
        <div className="mt-2 flex items-end gap-2">
          {ltifr.map((b) => (
            <div key={b.band} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t-sm bg-[#2a78d6]"
                style={{ height: `${Math.max(4, (b.companies / maxCount) * 80)}px` }}
                title={`${b.companies} companies`}
              />
              <span className="text-[10px] text-[--text-secondary]">{b.band}</span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[11px] italic text-[--text-secondary]">
          Company-specific LTIFR band isn&apos;t available per company in the source data — this
          shows the overall peer distribution only.
        </p>
      </div>
    </div>
  );
}
