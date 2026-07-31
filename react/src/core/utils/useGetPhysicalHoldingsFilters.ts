import { ComplexSearchFiltersInput } from "../dbc-gateway/generated/graphql";
import { useConfig } from "./config";

/**
 * The five "physical-holdings" filters. Whenever any of these is active the
 * complex search must be narrowed with {@link useGetPhysicalHoldingsFilters}.
 *
 * Values may be scalars (the material grid passes strings/booleans) or arrays
 * (the advanced-search location filter). An empty array counts as inactive.
 */
export interface PhysicalHoldingsFilterValues {
  onShelf?: boolean;
  branch?: string | string[];
  department?: string | string[];
  location?: string | string[];
  sublocation?: string | string[];
}

/**
 * Single source of truth for "is at least one physical-holdings filter active?"
 * so the list of filters cannot drift between the apps that apply them.
 */
export const hasActivePhysicalHoldingsFilter = (
  values: PhysicalHoldingsFilterValues
): boolean =>
  Object.values(values).some((value) =>
    Array.isArray(value) ? value.length > 0 : Boolean(value)
  );

/**
 * Extra complex search filters that must accompany every filtering on physical
 * holdings (onShelf, branch, department, location, sublocation).
 *
 * - `useOnlineHoldings: false` removes the hidden OR-search for online editions
 *   so a physical-holdings filter only matches physical materials.
 * - `agencyId` restricts results to the site's own agency (e.g. "710100"),
 *   removing "overbygningsmaterialer" held only at other (central) libraries.
 *   The agency id is exposed globally to all apps via the "agencyConfig" data
 *   attribute and is always set by the CMS (a missing value is a hard
 *   configuration error there, never an empty string).
 *
 * Spread the result into a complex search `filters` object only when one of the
 * physical-holdings filters is actually active.
 */
export const useGetPhysicalHoldingsFilters = (): Pick<
  ComplexSearchFiltersInput,
  "useOnlineHoldings" | "agencyId"
> => {
  const config = useConfig();
  const { id } = config<{ id: string }>("agencyConfig", {
    transformer: "jsonParse"
  });

  return {
    useOnlineHoldings: false,
    agencyId: [id]
  };
};
