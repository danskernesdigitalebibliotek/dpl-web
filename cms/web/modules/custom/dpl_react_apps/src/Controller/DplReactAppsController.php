<?php

namespace Drupal\dpl_react_apps\Controller;

use Drupal\Core\Controller\ControllerBase;

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
    return [
      'search-result' => dpl_react_render('search-result'),
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
