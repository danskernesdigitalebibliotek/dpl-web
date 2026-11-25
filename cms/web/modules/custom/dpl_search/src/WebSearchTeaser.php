<?php

declare(strict_types=1);

namespace Drupal\dpl_search;

use Drupal\Core\Url;
use Drupal\views\ViewExecutable;
use Drupal\views\Views;
use Symfony\Component\HttpFoundation\RequestStack;

/**
 * Builds the teaser linking from a material search to the web search.
 */
class WebSearchTeaser {

  public function __construct(
    protected RequestStack $requestStack,
  ) {}

  /**
   * Build the web search teaser data from the current request.
   *
   * The teaser phrase is the material search input: the q query parameter, or
   * for creator, subject, or dk5 searches the facet value instead of "*".
   *
   * @param string[] $cache_tags
   *   Filled with the cache tags of what the result was derived from, so both
   *   a shown and a suppressed teaser is invalidated when the web content
   *   changes.
   *
   * @return mixed[]|null
   *   The web search teaser config, or NULL if the request has no search
   *   phrase or the phrase has no web results.
   */
  public function getConfig(array &$cache_tags = []): ?array {
    $request = $this->requestStack->getCurrentRequest();

    if (!$request) {
      return NULL;
    }

    $query = $request->query;
    $input = $query->get(DplSearchSettings::MATERIAL_QUERY_KEY);

    if (empty($input)) {
      return NULL;
    }

    $input = urldecode($input);

    // A bare "*" is a browse-all search without a phrase to offer web results
    // for, unless a facet carries one.
    if ($input === '*') {
      $facets_json = $query->get(DplSearchSettings::FACETS_QUERY_KEY);
      $input = is_string($facets_json) ? FacetPhrase::fromJson($facets_json) : NULL;

      if ($input === NULL) {
        return NULL;
      }
    }

    $view = Views::getView(DplSearchSettings::EDITORIAL_VIEW_ID);

    if (!($view instanceof ViewExecutable)) {
      return NULL;
    }

    $view->setDisplay('page');
    $view->setExposedInput([DplSearchSettings::EDITORIAL_QUERY_KEY => $input]);
    $view->execute();
    $cache_tags = $view->getCacheTags();
    if (empty($view->total_rows)) {
      return NULL;
    }

    $url = Url::fromRoute(
      'view.' . DplSearchSettings::EDITORIAL_VIEW_ID . '.page',
      [],
      ['query' => [DplSearchSettings::EDITORIAL_QUERY_KEY => $input]]
    )->setAbsolute(TRUE)->toString();

    return [
      'webSearchText' => $input,
      'webSearchTotal' => $view->total_rows,
      'webSearchUrl' => $url,
      'hasWebSearchResults' => TRUE,
    ];
  }

}
