<?php

namespace Drupal\dpl_opening_hours\Controller;

use Drupal\Core\Controller\ControllerBase;

class OpeningHoursController extends ControllerBase {

  public function content() {
    return [
      '#theme' => 'dpl_react_app',
      "#name" => 'opening-hours-editor',
    ];
  }
}
