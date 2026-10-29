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
 * The id a digital material is borrowed, reserved and read by - Publizon's
 * identifier and the service layer's `material_id` alike. Branded so that an
 * ISBN picked off a manifestation cannot stand in for it: the two look alike
 * (both are ISBN-13s), but only the value FBI exposes as a PUBLIZON
 * identifier names an edition the lending provider actually holds. Produced
 * by getManifestationDigitalIdentifier only.
 */
export type DigitalMaterialId = string & {
  readonly __brand: "DigitalMaterialId";
};
