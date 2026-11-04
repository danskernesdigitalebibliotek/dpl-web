export type FaustId = `${string}`;
export type Pid = `${number}-${string}:${FaustId}`;
export type WorkId = `work-of:${number}-${string}:${FaustId}`;
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
  | "series"
  | "dashboard";

export type LoanId = number;

/**
 * The id Publizon and the service layer lend a digital material by: the value
 * of FBI's PUBLIZON identifier. Branded so an ISBN - same shape, possibly
 * another edition - cannot stand in for it. getPublizonIdentifier is the one
 * place the brand is put on, which is where the guarantee lives. The name is
 * FBI's field, not the provider we call.
 */
export type PublizonIdentifier = string & {
  readonly __brand: "PublizonIdentifier";
};
