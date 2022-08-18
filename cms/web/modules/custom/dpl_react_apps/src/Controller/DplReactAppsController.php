<?php

namespace Drupal\dpl_react_apps\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\GeneratedUrl;
use Drupal\Core\Url;

/**
 * Controller for rendering full page DPL React apps.
 */
class DplReactAppsController extends ControllerBase {

  /**
   * Render search result app.
   *
   * @return mixed[]
   *   Render array.
   */
  public function search(): array {
    $options = ['context' => 'Search Result'];

    return [
      'search-result' => dpl_react_render('search-result', [
        'search-url' => self::searchResultUrl(),
        'material-url' => self::materialUrl(),
        'et-al-text' => t('et. al.', [], $options),
        'by-author-text' => t('By', [], $options),
        'show-more-text' => t('Show more', [], $options),
        'showing-text' => t('Showing', [], $options),
        'out-of-text' => t('out of', [], $options),
        'results-text' => t('results', [], $options),
        'number-description-text' => t('Nr.', [], $options),
        'in-series-text' => t('In series', [], $options),
        'available-text' => t('Available', [], $options),
        'unavailable-text' => t('Unavailable', [], $options)
      ]),
    ];
  }

  /**
   * Render work page.
   *
   * @param string $wid
   *   A work id.
   *
   * @return mixed[]
   *   Render array.
   */
  public function work(string $wid): array {
    // Translation context.
    $c = ['context' => 'Work Page'];

    return [
      'material' => dpl_react_render('material', [
        'wid' => $wid,
        'search-url' => self::searchResultUrl(),
        'material-url' => self::materialUrl(),
        'material-header-author-by-text' => $this->t('By', [], $c),
        'periodikum-select-year-text' => $this->t('Year', [], $c),
        'periodikum-select-week-text' => $this->t('Week', [], $c),
        'reserve-book-text' => $this->t('Reserve book', [], $c),
        'find-on-bookshelf-text' => $this->t('Find on book shelf', [], $c),
        'description-headline-text' => $this->t('Description', [], $c),
        'identifier-text' => $this->t('Identifiers', [], $c),
        'in-same-series-text' => $this->t('In the same series', [], $c),
        'number-description-text' => $this->t('Nr.', [], $c),
        'in-series-text' => $this->t('in the series', [], $c),
        'login-to-see-review-text' => $this->t('Log in to read the review', [], $c),
        'cannot-see-review-text' => $this->t('The review is not accessible', [], $c),
        'rating-text' => $this->t('out of', [], $c),
        'hearts-icon-text' => $this->t('hearts', [], $c),
        'details-of-the-material-text' => $this->t('Details of the material', [], $c),
        'editions-text' => $this->t('Editions', [], $c),
        'fiction-nonfiction-text' => $this->t('Fiction/nonfiction', [], $c),
        'details-text' => $this->t('Details', [], $c),
        'type-text' => $this->t('Type', [], $c),
        'language-text' => $this->t('Language', [], $c),
        'contributors-text' => $this->t('Contributors', [], $c),
        'original-title-text' => $this->t('Original title', [], $c),
        'isbn-text' => $this->t('ISBN', [], $c),
        'edition-text' => $this->t('Edition', [], $c),
        'scope-text' => $this->t('Scope', [], $c),
        'publisher-text' => $this->t('Publisher', [], $c),
        'audience-text' => $this->t('Audience', [], $c),
        'reserve-text' => $this->t('Reserve', [], $c),
        'available-text' => $this->t('Available', [], $c),
        'unavailable-text' => $this->t('Unavailable', [], $c),
      ]),
    ];
  }

  /**
   * Builds an url for the local search result route.
   */
  public static function searchResultUrl(): string
  {
    $url = Url::fromRoute('dpl_react_apps.search_result')
      ->toString();
    if ($url instanceof GeneratedUrl) {
      $url = $url->getGeneratedUrl();
    }
    return $url;
  }

  /**
   * Builds an url for the material/work route.
   */
  public static function materialUrl(): string
  {
    // React applications support variable replacement where variables are
    // prefixed with :. Specify the variable :workid as a parameter to let the
    // route build the url. Unfortunatly : will be encoded as %3A so we have to
    // decode the url again to make replacement work.
    $url = Url::fromRoute('dpl_react_apps.work')
      ->setRouteParameter('wid', ':workid')
      ->toString();
    if ($url instanceof GeneratedUrl) {
      $url = $url->getGeneratedUrl();
    }
    return urldecode($url);
  }

}
