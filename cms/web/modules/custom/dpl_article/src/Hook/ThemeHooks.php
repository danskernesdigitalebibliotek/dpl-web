<?php

declare(strict_types=1);

namespace Drupal\dpl_article\Hook;

use Drupal\Core\Hook\Attribute\Hook;
use Drupal\node\NodeInterface;

/**
 * Theme hooks for dpl_article module.
 */
class ThemeHooks {

  /**
   * Overrides author name in node templates if configured.
   *
   * @param array<mixed> $variables
   *   The variables array.
   */
  #[Hook('preprocess_node')]
  public function overrideAuthorName(array &$variables): void {
    $node = $variables['node'] ?? NULL;

    // Process only if the node is a valid Node entity and is of
    // the type article or go_article.
    if (!($node instanceof NodeInterface) || !in_array($node->bundle(), ['article', 'go_article'], TRUE)) {
      return;
    }

    // Check if the 'show override author' field exists and is set.
    if ($node->hasField('field_show_override_author')) {
      $has_override = $node->get('field_show_override_author')
        ->getString() === '1';
      if ($has_override && $node->hasField('field_override_author')) {
        $variables['author_name'] = $node->get('field_override_author')
          ->getString();
      }
    }
  }

}
