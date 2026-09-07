import type { Company } from "@/lib/types";

export function SectorCompanyList({ companies }: { companies: Company[] }) {
  return (
    <div className="rounded-xl border border-[--border] bg-[--surface-1] p-5">
      <h3 className="text-base font-semibold text-[--text-primary]">
        BRSR companies in this NIC sector ({companies.length})
      </h3>
      <p className="mb-3 text-sm text-[--text-secondary]">
        BRSR company records only carry NIC Section, not the 2-digit Industry
        code, so this lists every company in the sector — not only those in
        this exact subindustry.
      </p>
      {companies.length === 0 ? (
        <p className="text-sm text-[--text-secondary]">No BRSR companies mapped to this sector.</p>
      ) : (
        <ul className="max-h-72 divide-y divide-[--border] overflow-y-auto">
          {companies.map((c) => (
            <li key={c.symbol} className="flex items-center justify-between gap-3 py-2 text-sm">
              <span className="text-[--text-primary]">{c.name}</span>
              <span className="text-[--text-secondary]">{c.symbol}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
