import { appendQueryParametersToUrl } from "../utils/helpers/url";
import { FacetState, FilterState, FormView, SortOption } from "./types";

const shouldBeSerialized = (value: unknown) =>
  Array.isArray(value) ? value.length > 0 : value !== undefined;

const serializeParameter = (value: unknown) =>
  Array.isArray(value) ? JSON.stringify(value) : String(value);

/**
 * Constructs a link into advanced-search-v2 with its URL state pre-filled.
 * Params are written in the formats the app's nuqs parsers read them back in.
 */
export const constructAdvancedSearchUrl = ({
  advancedSearchUrl,
  ...parameters
}: {
  advancedSearchUrl: URL;
  filters?: FilterState[];
  preSearchFacets?: FacetState[];
  facets?: FacetState[];
  onlyExtraTitles?: boolean;
  sort?: SortOption;
  view?: FormView;
}) => {
  const serializableParameters = Object.entries(parameters).filter(
    ([, value]) => shouldBeSerialized(value)
  );

  const serializedParameters = serializableParameters.map(
    ([name, value]): [string, string] => [name, serializeParameter(value)]
  );

  return appendQueryParametersToUrl(
    advancedSearchUrl,
    Object.fromEntries(serializedParameters)
  );
};

/**
 * Constructs a link to advanced-search-v2 results for a single subject.
 */
export const constructAdvancedSearchSubjectUrl = (
  advancedSearchUrl: URL,
  subject: string
) =>
  constructAdvancedSearchUrl({
    advancedSearchUrl,
    filters: [{ term: "term.subject", query: subject }],
    view: "results"
  });
