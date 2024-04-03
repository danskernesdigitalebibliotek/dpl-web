<?php

namespace Drupal\dpl_opening_hours\Controller;

use Drupal\Core\Access\AccessResult;
use Drupal\Core\Controller\ControllerBase;
use Drupal\node\NodeInterface;

/**
 * Defines OpeningHoursController class.
 */
class OpeningHoursEditorController extends ControllerBase {

  /**
   * Display the opening hours app.
   *
   * @return mixed[]
   *   The app render array.
   */
  public function content() : array {
    return [
      '#theme' => 'dpl_react_app',
      '#name' => 'opening-hours-editor',
    ];
  }

  /**
   * Check access for a specific node.
   */
  public function access(int $node) : AccessResult {
    $nodeStorage = $this->entityTypeManager()->getStorage('node');
    $nodeEntity = $nodeStorage->load($node);

    if ($nodeEntity instanceof NodeInterface && $nodeEntity->getType() === 'branch') {
      return AccessResult::allowed();
    }
    else {
      return AccessResult::forbidden();
    }
  }

}
