<?php

namespace Drupal\dpl_react_apps\Controller;

use Drupal\Core\Controller\ControllerBase;
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
    $search_result_url = Url::fromRoute('dpl_react_apps.search_result')->toString();

    $options = ['context' => 'Search Result'];

    return [
      'search-result' => dpl_react_render('search-result', [
        'search-url' => $search_result_url,
        // TODO Consider if we can get this value from the routing instead of
        // hardcoding it.
        'material-url' => 'work/:workid',
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
   * Render material page.
   */

  /**
   * Render material page.
   *
   * @param string $pid
   *   A material post id.
   *
   * @return mixed[]
   *   Render array.
   */
  public function material(string $pid): array {
    // Translation context.
    $c = ['context' => 'Material Page'];

    return [
      'material' => dpl_react_render('material', [
        'pid' => $pid,
        'material-header-author-by-text' => $this->t('By', [], $c),
        'periodikum-select-year-text' => $this->t('Year', [], $c),
        'periodikum-select-week-text' => $this->t('Week', [], $c),
        'reserve-book-text' => $this->t('Reserve book', [], $c),
        'fine-on-bookshelf-text' => $this->t('Find at book Shelf', [], $c),
        'in-the-same-series-text' => $this->t('In the same series', [], $c),
        'subjects-text' => $this->t('Subjects', [], $c),
        'number-in-series-text' => $this->t('in series', [], $c),
      ]),
    ];
  }

}
