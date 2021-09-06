<?php

namespace Drupal\ddb_react_demo\Controller;

use Drupal\Core\Controller\ControllerBase;

/**
 * This is used for demoing the react components.
 */
class DddbReactDemoController extends ControllerBase {

  /**
   * Render react components.
   */
  public function index() {
    $data = [
      'material-list-url' => ddb_react_material_list_url(),
      'cover-service-url' => ddb_react_cover_service_url(),
      'material-url' => '/ting/object/:pid',
      'author-url' => '/search/ting/phrase.creator=":author"',
      'remove-button-text' => 'Remove from list',
      'empty-list-text' => 'List is empty.',
      'error-text' => 'An error occurred while trying to fetch list.',
      'of-text' => 'by',
    ];

    return [
      'checklist' => ddb_react_render('checklist', $data),
      'button' => ddb_react_demo_button(),
    ];
  }

}
