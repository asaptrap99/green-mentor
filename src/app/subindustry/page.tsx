"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SubindustrySearch } from "@/components/SubindustrySearch";
import { SubindustryPassport } from "@/components/SubindustryPassport";
import { GapQuadrantChart } from "@/components/GapQuadrantChart";
import { FrameworkComparison } from "@/components/FrameworkComparison";
import { SectorCompanyList } from "@/components/SectorCompanyList";
import { SectorMaterialitySplit } from "@/components/SectorMaterialitySplit";
import { getSubindustryProfile } from "@/lib/dataLayer";

const DEFAULT_SUBINDUSTRY = "Advertising";

export default function SubindustryPage() {
  const [name, setName] = useState(DEFAULT_SUBINDUSTRY);

  const profile = useMemo(() => getSubindustryProfile(name), [name]);

  return (
    <div className="min-h-screen bg-[--surface-2] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h1 className="text-2xl font-semibold text-[--text-primary]">
              Subindustry Materiality
            </h1>
            <Link href="/" className="text-sm text-[#2a78d6] hover:underline">
              View by company &rarr;
            </Link>
          </div>
          <p className="mb-4 text-sm text-[--text-secondary]">
            Green Mentor &middot; unified ESG materiality intelligence, by subindustry
          </p>
          <SubindustrySearch onSelect={setName} selected={profile?.subindustry ?? null} />
        </header>

        {!profile ? (
          <div className="rounded-xl border border-[--border] bg-[--surface-1] p-8 text-center text-[--text-secondary]">
            No subindustry selected. Search above to get started.
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            <section className="flex flex-col gap-6">
              <div>
                <h2 className="text-lg font-semibold text-[--text-primary]">
                  {profile.subindustry.name}
                </h2>
                <p className="text-sm text-[--text-secondary]">
                  Everything in this section is scoped to this subindustry
                  {profile.nicSection ? ` and its NIC sector (${profile.nicSection.code} · ${profile.nicSection.name})` : ""}.
                  Framework materiality (Sustainalytics / SASB / MSCI) is published at
                  industry level; the gap chart below compares it against BRSR peer
                  disclosure prevalence for the whole NIC sector, since BRSR doesn&apos;t
                  carry a sector-level split.
                </p>
              </div>
              <SubindustryPassport profile={profile} />
              <GapQuadrantChart points={profile.gapPoints} />
              <FrameworkComparison frameworkRows={profile.frameworkRows} nicSection={profile.nicSection} />
              <SectorCompanyList companies={profile.companies} />
            </section>

            <section className="flex flex-col gap-6 border-t border-[--border] pt-6">
              <div>
                <h2 className="text-lg font-semibold text-[--text-primary]">
                  Sector reference
                </h2>
                <p className="text-sm text-[--text-secondary]">
                  Broader context across every NIC sector, with this subindustry&apos;s
                  sector highlighted.
                </p>
              </div>
              <SectorMaterialitySplit highlightSection={profile.nicSection?.code ?? null} />
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
