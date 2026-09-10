import { DigitalArticleService } from "../../dbc-gateway/generated/graphql";

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
  | "series";

export type IssnId = DigitalArticleService["issn"];
export type LoanId = number;

declare const digitalMaterialIdBrand: unique symbol;

/**
 * The identifier a digital material is lent, reserved and read by, across
 * every provider in the chain.
 *
 * Only FBI's PUBLIZON identifier carries it. A manifestation's ISBN does not:
 * a record can hold several, and the leading one is not always the edition
 * that is actually loanable - a deselected PDF, say. The brand is what keeps
 * the two apart, so a caller cannot quietly hand an ISBN to a provider that
 * expects this.
 *
 * Build one with `getManifestationDigitalIdentifier`; absence is `null`.
 */
export type DigitalMaterialId = string & {
  readonly [digitalMaterialIdBrand]: never;
};
