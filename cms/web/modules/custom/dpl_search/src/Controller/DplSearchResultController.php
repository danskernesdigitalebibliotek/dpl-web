<?php

namespace Drupal\dpl_search\Controller;

use Drupal\Core\Controller\ControllerBase;

/**
 * Controller for handling search related routes.
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
