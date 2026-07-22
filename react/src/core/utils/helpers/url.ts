import { WorkId } from "../types/ids";

export const getCurrentLocation = () => String(window.location);

export const getQueryParams = (url: URL): Record<string, string> => {
  return Object.fromEntries(url.searchParams);
};

export const appendQueryParametersToUrl = (
  url: URL,
  parameters: { [key: string]: string }
) => {
  // We need to clone url in order not to manipulate the incoming object.
  const processedUrl = new URL(url);
  Object.keys(parameters).forEach((key) => {
    // Pass raw values: URLSearchParams encodes on its own, and layering
    // encodeURI on top double-encodes. See docs ADR-013.
    processedUrl.searchParams.set(key, parameters[key]);
  });

  return processedUrl;
};

export const getUrlQueryParam = (param: string): null | string => {
  const queryParams = new URLSearchParams(window.location.search);

  // Return the value as-is: URLSearchParams.get already decodes, and layering
  // decodeURI on top breaks single-encoded values. See docs ADR-013.
  return queryParams.get(param) ? String(queryParams.get(param)) : null;
};

export const redirectTo = (url: URL, isNewTab?: boolean): void => {
  if (isNewTab) {
    window.open(String(url), "_blank");
  } else {
    window.location.assign(String(url));
  }
};

export const constructUrlWithPlaceholder = (
  url: string,
  placeholderName: string,
  replacement: string
) => {
  const regex = new RegExp(`${placeholderName}`, "g");
  const placeholders = url.match(regex);

  if (!placeholders) {
    return url;
  }

  return url.replace(regex, replacement);
};

export const processUrlPlaceholders = (
  url: string,
  placeholders: [string, string][]
) => {
  let processedUrl = url;

  placeholders.forEach((placeholder) => {
    const [name, replacement] = placeholder;
    processedUrl = constructUrlWithPlaceholder(processedUrl, name, replacement);
  });

  return processedUrl;
};

// The query parameter carrying the selected material type on material pages.
// Single source for the nuqs writers (material, availability labels) and the
// deep-link construction below.
export const MATERIAL_TYPE_URL_PARAM = "type";

export const constructMaterialUrl = (
  url: URL,
  workId: WorkId,
  type?: string
) => {
  const materialUrl = new URL(url);

  // Replace placeholders with values.
  materialUrl.pathname = processUrlPlaceholders(materialUrl.pathname, [
    [":workid", workId]
  ]);

  // Append type if specified.
  if (type) {
    return appendQueryParametersToUrl(materialUrl, {
      [MATERIAL_TYPE_URL_PARAM]: type
    });
  }

  return materialUrl;
};

export const constructSearchUrl = (searchUrl: URL, q: string) =>
  appendQueryParametersToUrl(searchUrl, {
    q
  });

export const constructCreatorSearchUrl = (searchUrl: URL, creator: string) =>
  constructSearchUrlWithFacets({
    searchUrl,
    q: "*",
    facets: [{ facetName: "creators", selectedValues: [creator.toLowerCase()] }]
  });

export const constructSubjectSearchUrl = (searchUrl: URL, subject: string) =>
  constructSearchUrlWithFacets({
    searchUrl,
    q: "*",
    facets: [{ facetName: "subjects", selectedValues: [subject.toLowerCase()] }]
  });

export const constructDK5SearchUrl = (searchUrl: URL, dk5: string) =>
  constructSearchUrlWithFacets({
    searchUrl,
    q: "*",
    facets: [{ facetName: "dk5", selectedValues: [dk5.toLowerCase()] }]
  });

export const constructAdvancedSearchUrl = (advancedSearchUrl: URL, q: string) =>
  appendQueryParametersToUrl(advancedSearchUrl, {
    advancedSearchCql: q
  });

// Type for facet state in URL (matches search-result-v2 format)
type FacetUrlState = {
  facetName: string;
  selectedValues: string[];
};

/**
 * Constructs a search URL with facets in JSON format for search-result-v2
 */
export const constructSearchUrlWithFacets = (args: {
  searchUrl: URL;
  q: string;
  facets: FacetUrlState[];
}) => {
  const { searchUrl, q, facets } = args;
  const processedUrl = new URL(searchUrl);
  processedUrl.searchParams.set("q", q);
  if (facets.length > 0) {
    processedUrl.searchParams.set("facets", JSON.stringify(facets));
  }
  return processedUrl;
};

export const constructAdvancedSearchSubjectUrl = (
  advancedSearchUrl: URL,
  subject: string
) => {
  const filters = JSON.stringify([{ term: "term.subject", query: subject }]);
  return new URL(`${advancedSearchUrl}?filters=${filters}&view=results`);
};

/**
 * @deprecated Use constructSearchUrlWithFacets instead for search-result-v2 compatibility
 */
export const constructSearchUrlWithFilter = (args: {
  searchUrl: URL;
  selectedItemString: string;
  filter: { [type: string]: string };
}) => {
  const { searchUrl, selectedItemString, filter } = args;
  // Convert old filter format to new facets format
  const facets: FacetUrlState[] = Object.entries(filter).map(
    ([facetName, value]) => ({
      facetName,
      selectedValues: [value]
    })
  );
  return constructSearchUrlWithFacets({
    searchUrl,
    q: selectedItemString,
    facets
  });
};

export const turnUrlStringsIntoObjects = (urls: { [key: string]: string }) => {
  return Object.keys(urls).reduce(
    (acc: { [key: string]: URL }, key: string) => {
      return {
        ...acc,
        [key]: new URL(urls[key], getCurrentLocation())
      };
    },
    {}
  );
};

type RedirectToLoginAndBackParams = {
  authUrl: URL;
  returnUrl: URL;
  trackingFunction?: () => Promise<unknown>;
};
export function redirectToLoginAndBack({
  authUrl,
  returnUrl,
  trackingFunction
}: RedirectToLoginAndBackParams) {
  const { pathname, search, hash } = returnUrl;
  const localPathToReturnTo = `${pathname}${search}${hash}`;
  const redirectUrl = appendQueryParametersToUrl(authUrl, {
    "current-path": localPathToReturnTo
  });
  if (trackingFunction) {
    trackingFunction().then(() => redirectTo(redirectUrl));
  }
  redirectTo(redirectUrl);
}

// Checks whether a valid URL can be made out of a given string.
export const isUrlValid = (text: string) => {
  try {
    const url = new URL(text);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

export const currentLocationWithParametersUrl = (
  params: Record<string, string>
) => appendQueryParametersToUrl(new URL(getCurrentLocation()), params);

export const getCurrentUrlWithHash = (hash: string): string => {
  const { origin, pathname, search } = window.location;
  return `${origin}${pathname}${search}#${hash}`;
};

// Hash-based URL utilities
export enum HashPrefix {
  MANIFESTATION = "manifestation-",
  REVIEW = "review-"
}

export const createUrlHash = (prefix: HashPrefix, id: string): string => {
  return `${prefix}${id}`;
};

export const getIdFromUrlHash = (prefix: HashPrefix): string | null => {
  const hash = window.location.hash;
  if (hash.startsWith(`#${prefix}`)) {
    return hash.replace(`#${prefix}`, "");
  }
  return null;
};

export const getFromUrlHash = () => {
  const hash = window.location.hash;
  if (hash) {
    return hash.replace("#", "");
  }
  return null;
};
