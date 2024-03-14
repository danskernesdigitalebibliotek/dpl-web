<?php

namespace Drupal\dpl_opening_hours\Controller;

use Drupal\Core\Access\AccessResult;
use Drupal\Core\Controller\ControllerBase;

/**
 * Defines OpeningHoursController class.
 */
class OpeningHoursController extends ControllerBase {

  /**
   * Display the opening hours app.
   */
  public function content() {
    return [
      '#theme' => 'dpl_react_app',
      '#name' => 'opening-hours-editor',
    ];
  }

  /**
   * Check access for a specific node.
   *
   * @param int $node
   *   The node ID.
   *
   * @return \Drupal\Core\Access\AccessResult
   *   The access result.
   */
  public function adminTabAccess($node) {
    $node_storage = $this->entityTypeManager()->getStorage('node');
    $node_entity = $node_storage->load($node);

    if ($node_entity) {
      $node_type = $node_entity->getType();

      if ($node_type == 'branch') {
        return AccessResult::allowed();
      }
    }
    return AccessResult::forbidden();
  }

}
