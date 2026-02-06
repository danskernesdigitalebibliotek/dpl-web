export type FaustId = `${string}`
export type Pid = `${number}-${string}:${FaustId}`
export type WorkId = `work-of:${number}-${string}:${FaustId}`
export type GuardedAppId =
  | "material"
  | "search-result"
  | "advanced-search"
  | "recommender"
  | "something-similar"
  | "favorites-list-mc"
  | "inspiration-recommender"
  | "recommended-material"
  | "recommendation"
  | "material-grid-automatic"
  | "material-grid-manual"

export type LoanId = number
