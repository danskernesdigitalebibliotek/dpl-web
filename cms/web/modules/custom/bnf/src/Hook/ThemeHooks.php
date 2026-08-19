<?php

declare(strict_types=1);

namespace Drupal\bnf\Hook;

use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\node\NodeInterface;

/**
 * Theme hooks and preprocess.
 */
class ThemeHooks {

  public function __construct(protected RouteMatchInterface $routeMatch) {}

  /**
   * Adds the node UUID as a metatag.
   *
   * This we can use when the user submits a URL to the BNF import form.
   *
   * @phpstan-ignore missingType.iterableValue (variables too complex)
   */
  #[Hook('preprocess_html')]
  public function preprocessHtml(array &$variables): void {
    $node = $this->routeMatch->getParameter('node');

    if ($this->routeMatch->getRouteName() !== 'entity.node.canonical' || !($node instanceof NodeInterface)) {
      return;
    }

    $uuid_metatag = [
      '#tag' => 'meta',
      '#attributes' => [
        'name' => 'uuid',
        'content' => $node->uuid(),
      ],
    ];

    $variables['page']['#attached']['html_head'][] = [$uuid_metatag, 'node-uuid'];
  }

}
