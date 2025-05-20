<?php

declare(strict_types=1);

namespace Drupal\bnf;

use Drupal\Core\Field\FieldItemInterface;
use Drupal\graphql\GraphQL\Execution\FieldContext;
use Drupal\graphql_compose\Plugin\GraphQLCompose\FieldType\LinkItem;
use Drupal\link\Plugin\Field\FieldType\LinkItem as LinkItemField;

/**
 * Override graphql_compose link type to include linked content UUID.
 */
class LinkWithContentUuidItem extends LinkItem {

  /**
   * {@inheritdoc}
   */
  public function resolveFieldItem(FieldItemInterface $item, FieldContext $context) {
    $result = parent::resolveFieldItem($item, $context);

    if ($item instanceof LinkItemField) {
      // Core is nice enough to populate options with type and UUID, so we'll
      // just grab it from there.
      if (
        isset($item->options['data-entity-type']) &&
        $item->options['data-entity-type'] == 'node'
      ) {
        $result['id'] = $item->options['data-entity-uuid'];
      }
    }

    return $result;
  }

}
