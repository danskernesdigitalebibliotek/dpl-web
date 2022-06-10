<?php

namespace Drupal\dpl_search\Controller;

use Drupal\Core\Controller\ControllerBase;

/**
 * This is used for demoing the react components.
 */
class DplSearchResultController extends ControllerBase {

  /**
   * Demo react rendering.
   *
   * @return mixed[]
   *   Render array.
   */
  public function index(): array {

    return [
      'search-result' => dpl_react_render('search-result'),
    ];
  }

}
