<?php

declare(strict_types=1);

namespace Drupal\dpl_library_agency\Hook;

use Drupal\Core\Hook\Attribute\Hook;
use Drupal\dpl_library_agency\Entity\BranchNode;

/**
 * Entity hooks for dpl_library_agency module.
 */
class EntityHooks {

  /**
   * Use the BranchNode class for branch nodes.
   *
   * @param mixed[] $bundles
   *   Bundle info for altering.
   */
  #[Hook('entity_bundle_info_alter')]
  public function setBranchNodeClass(array &$bundles): void {
    if (isset($bundles['node']['branch'])) {
      $bundles['node']['branch']['class'] = BranchNode::class;
    }
  }

}
