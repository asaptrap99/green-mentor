"use client";

import { useMemo, useState } from "react";
import { CompanySearch } from "@/components/CompanySearch";
import { MaterialityPassport } from "@/components/MaterialityPassport";
import { GapQuadrantChart } from "@/components/GapQuadrantChart";
import { FrameworkComparison } from "@/components/FrameworkComparison";
import { PeerBenchmarkStrip } from "@/components/PeerBenchmarkStrip";
import { SectorMaterialitySplit } from "@/components/SectorMaterialitySplit";
import { TaxonomyExplorer } from "@/components/TaxonomyExplorer";
import { SasbIndustryDetail } from "@/components/SasbIndustryDetail";
import { SustainalyticsIndustryDetail } from "@/components/SustainalyticsIndustryDetail";
import { MetricsGlossary } from "@/components/MetricsGlossary";
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
          <div className="flex flex-col gap-8">
            <section className="flex flex-col gap-6">
              <div>
                <h2 className="text-lg font-semibold text-[--text-primary]">
                  {profile.company.name}
                </h2>
                <p className="text-sm text-[--text-secondary]">
                  Everything in this section is scoped to {profile.company.name}
                  {profile.nicSection ? ` and its NIC sector (${profile.nicSection.code} · ${profile.nicSection.name})` : ""}.
                  Framework materiality (Sustainalytics / SASB / MSCI) is published at
                  industry level, not per company — the company&apos;s BRSR sector
                  is used as the closest real proxy for its own material issues.
                </p>
              </div>
              <MaterialityPassport profile={profile} />
              <GapQuadrantChart points={profile.gapPoints} />
              <FrameworkComparison profile={profile} />
              <PeerBenchmarkStrip company={profile.company} />
            </section>

            <section className="flex flex-col gap-6 border-t border-[--border] pt-6">
              <div>
                <h2 className="text-lg font-semibold text-[--text-primary]">
                  Sector &amp; framework reference
                </h2>
                <p className="text-sm text-[--text-secondary]">
                  Broader context, not filtered to {profile.company.name} — these
                  cover the company&apos;s NIC sector or the full taxonomy so you can
                  see where its sector-level material issues come from and how it
                  compares to every other sector.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="flex flex-col gap-6 lg:col-span-2">
                  <SasbIndustryDetail nicSection={profile.company.nicSection} />
                  <SustainalyticsIndustryDetail nicSection={profile.company.nicSection} />
                </div>
                <SectorMaterialitySplit highlightSection={profile.company.nicSection} />
              </div>
              <TaxonomyExplorer />
            </section>

            <MetricsGlossary />
          </div>
        )}
      </div>
    </div>
  );
}
