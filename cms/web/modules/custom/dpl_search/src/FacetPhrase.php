<?php

namespace Drupal\dpl_search;

use function Safe\json_decode;

/**
 * Extracts the web search teaser phrase from the facets query parameter.
 *
 * Links from material pages search with q "*" and carry the human readable
 * value in the JSON `facets` parameter, so the phrase must be read from
 * there. The format is produced by constructSearchUrlWithFacets in
 * dpl-react: [{"facetName": "creators", "selectedValues": ["..."]}, ...].
 */
class FacetPhrase {

  /**
   * The facet types whose values are usable as a search phrase.
   */
  private const PHRASE_FACETS = ['creators', 'subjects', 'dk5'];

  /**
   * Get the first creator, subject or dk5 facet value.
   *
   * @param string $facets_json
   *   The JSON facets query parameter as produced by dpl-react.
   *
   * @return string|null
   *   The phrase, or NULL if the parameter holds none. Malformed user
   *   input is treated as no phrase rather than an error.
   */
  public static function fromJson(string $facets_json): ?string {
    if ($facets_json === '') {
      return NULL;
    }

    try {
      $facets = json_decode($facets_json, TRUE);
    }
    catch (\JsonException) {
      return NULL;
    }

    if (!is_array($facets)) {
      return NULL;
    }

    foreach ($facets as $facet) {
      if (!is_array($facet)) {
        continue;
      }

      $values = $facet['selectedValues'] ?? NULL;
      $value = is_array($values) ? ($values[0] ?? NULL) : NULL;

      if (
        in_array($facet['facetName'] ?? NULL, self::PHRASE_FACETS, TRUE)
        && is_string($value)
        && $value !== ''
      ) {
        return $value;
      }
    }

    return NULL;
  }

}
