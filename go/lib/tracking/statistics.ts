// Central registry of Mapp Intelligence tracking instances.
//
// This mirrors the React apps' react/src/core/statistics/statistics.ts. The
// id / name / parameterName values come from DDF's external Mapp setup and
// MUST stay identical across GO and React so both report into the same Mapp
// instances.
//
// Add new tracking points here as they are implemented — GO is being tracked
// incrementally, this is only the first entry.
export type TStatisticsEntry = {
  id: number
  name: string
  parameterName: string
}

export const statistics = {
  // Search flow — on-site (internal) search term.
  searchQuery: { id: 10, name: "OSS", parameterName: "OSS" },
} as const satisfies Record<string, TStatisticsEntry>
