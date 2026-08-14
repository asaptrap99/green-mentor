"use client";

import { useMemo, useState } from "react";
import { searchCompanies } from "@/lib/dataLayer";
import type { Company } from "@/lib/types";

export function CompanySearch({
  onSelect,
  selected,
}: {
  onSelect: (symbol: string) => void;
  selected: Company | null;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const results = useMemo(() => searchCompanies(query), [query]);

  return (
    <div className="relative w-full max-w-md">
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Search company name or ticker..."
        className="w-full rounded-lg border border-[--border] bg-[--surface-1] px-3 py-2 text-sm text-[--text-primary] outline-none focus:border-[#2a78d6]"
      />
      {open && query.trim() && (
        <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-[--border] bg-[--surface-1] shadow-lg">
          {results.length === 0 && (
            <div className="px-3 py-2 text-sm text-[--text-secondary]">No matches</div>
          )}
          {results.map((c) => (
            <button
              key={c.symbol}
              className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-[--surface-2]"
              onMouseDown={() => {
                onSelect(c.symbol);
                setQuery("");
                setOpen(false);
              }}
            >
              <span className="text-[--text-primary]">{c.name}</span>
              <span className="text-[--text-secondary]">{c.symbol}</span>
            </button>
          ))}
        </div>
      )}
      {selected && !open && (
        <p className="mt-1 text-xs text-[--text-secondary]">
          Showing: {selected.name} ({selected.symbol})
        </p>
      )}
    </div>
  );
}
