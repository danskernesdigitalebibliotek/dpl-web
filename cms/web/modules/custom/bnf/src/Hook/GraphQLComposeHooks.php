<?php

declare(strict_types=1);

namespace Drupal\bnf\Hook;

use Drupal\Core\Hook\Attribute\Hook;

/**
 * Hooks into `graphql_compose`.
 */
class GraphQLComposeHooks {

  /**
   * Replace LinkItem producer with our own.
   *
   * @phpstan-ignore missingType.iterableValue
   */
  #[Hook('graphql_compose_field_type_alter')]
  public function extendLinkType(array &$field_types): void {
    $field_types['link']['class'] = 'Drupal\bnf\LinkWithContentUuidItem';
  }

}
