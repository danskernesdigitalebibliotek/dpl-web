<?php

namespace Drupal\dpl_react_demo\Controller;

use Drupal\Core\Controller\ControllerBase;

/**
 * This is used for demoing the react components.
 */
class DplReactDemoController extends ControllerBase {

  /**
   * Demo react rendering.
   *
   * @return mixed[]
   *   Render array.
   */
  public function index(): array {
    $data = [
      'title-text' => 'Hej Jeg er title',
      'introduction-text' => 'hej jeg er introduction',
    ];

    return [
      'hello' => dpl_react_render('hello-world', $data),
    ];
  }

}
