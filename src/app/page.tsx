"use client";

import { useMemo, useState } from "react";
import { CompanySearch } from "@/components/CompanySearch";
import { MaterialityPassport } from "@/components/MaterialityPassport";
import { GapQuadrantChart } from "@/components/GapQuadrantChart";
import { FrameworkComparison } from "@/components/FrameworkComparison";
import { PeerBenchmarkStrip } from "@/components/PeerBenchmarkStrip";
import { SectorMaterialitySplit } from "@/components/SectorMaterialitySplit";
import { getCompanyBySymbol, getCompanyMaterialityProfile } from "@/lib/dataLayer";

const DEFAULT_SYMBOL = "ADANIPOWER";

export default function Home() {
  const [symbol, setSymbol] = useState(DEFAULT_SYMBOL);

  const profile = useMemo(() => getCompanyMaterialityProfile(symbol), [symbol]);
  const selectedCompany = useMemo(() => getCompanyBySymbol(symbol), [symbol]);

  return (
    <div className="min-h-screen bg-[--surface-2] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-[--text-primary]">
            Company Materiality
          </h1>
          <p className="mb-4 text-sm text-[--text-secondary]">
            Green Mentor &middot; unified ESG materiality intelligence
          </p>
          <CompanySearch onSelect={setSymbol} selected={selectedCompany} />
        </header>

        {!profile ? (
          <div className="rounded-xl border border-[--border] bg-[--surface-1] p-8 text-center text-[--text-secondary]">
            No company selected. Search above to get started.
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <MaterialityPassport profile={profile} />
            <GapQuadrantChart points={profile.gapPoints} />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <FrameworkComparison profile={profile} />
              </div>
              <SectorMaterialitySplit highlightSection={profile.company.nicSection} />
            </div>
            <PeerBenchmarkStrip company={profile.company} />
          </div>
        )}
      </div>
    </div>
  );
}
