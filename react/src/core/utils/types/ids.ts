import { IdentifierTypeEnum } from "../../dbc-gateway/generated/graphql";

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
 * The id Publizon and the service layer lend a digital material by: FBI's
 * PUBLIZON identifier, kept whole rather than as its bare value so an ISBN -
 * same shape, possibly another edition - cannot stand in for it. The type is
 * FBI's field name, not the provider we call.
 */
export type PublizonIdentifier = {
  type: IdentifierTypeEnum.Publizon;
  value: string;
};
