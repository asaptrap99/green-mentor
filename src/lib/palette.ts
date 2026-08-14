import type { Pillar } from "./types";

// Validated categorical palette (dataviz skill, scatter/all-pairs subset: slots 1,3,7,2)
export const PILLAR_COLOR: Record<Pillar, { light: string; dark: string }> = {
  Environment: { light: "#2a78d6", dark: "#3987e5" }, // blue
  Social: { light: "#1baf7a", dark: "#199e70" }, // aqua
  Governance: { light: "#4a3aa7", dark: "#9085e9" }, // violet
  "Cross-cutting": { light: "#eb6834", dark: "#d95926" }, // orange
};

export const STATUS_COLOR = {
  good: "#0ca30c",
  warning: "#fab219",
  serious: "#ec835a",
  critical: "#d03b3b",
};

// Ordinal blue ramp (tier is a rank, not a status) — lightest step still clears 2:1.
export const TIER_COLOR: Record<string, { bg: string; text: string }> = {
  T1: { bg: "#1c5cab", text: "#ffffff" },
  T2: { bg: "#5598e7", text: "#ffffff" },
  T3: { bg: "#b7d3f6", text: "#0d366b" },
};
