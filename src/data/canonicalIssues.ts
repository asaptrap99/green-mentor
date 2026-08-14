import type { CanonicalIssue, Pillar } from "@/lib/types";
import brsr from "./brsr.json";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Canonical material issues are keyed 1:1 to the real BRSR topic names — the only
// taxonomy in the source data with authoritative, already-canonical naming. This is
// the join key every framework materiality record and every BRSR topic record uses.
export const CANONICAL_ISSUES: CanonicalIssue[] = Object.entries(
  brsr.topics as Record<string, { topic: string }[]>
).flatMap(([pillar, rows]) =>
  rows.map((r) => ({
    id: slugify(r.topic),
    name: r.topic,
    pillar: pillar as Pillar,
  }))
);

export const CANONICAL_ISSUE_BY_ID = new Map(CANONICAL_ISSUES.map((i) => [i.id, i]));

export { slugify };
