<?php

declare(strict_types=1);

namespace Drupal\bnf\Hook;

use Drupal\bnf\BnfStateEnum;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\node\NodeInterface;

/**
 * Page hooks for the BNF module.
 */
class PageHooks {

  public function __construct(
    protected RouteMatchInterface $currentRouteMatch,
  ) {
  }

  /**
   * Setting the Mapp page parameter for BNF content.
   *
   * So we can track content from Delingstjenesten.
   *
   * @phpstan-ignore missingType.iterableValue
   */
  #[Hook('page_attachments')]
  public function pageAttachments(array &$page): void {
    $node = $this->currentRouteMatch->getParameter('node');

    if ($this->currentRouteMatch->getRouteName() !== 'entity.node.canonical' || !($node instanceof NodeInterface)) {
      return;
    }

    if (!$node->hasField(BnfStateEnum::FIELD_NAME) || $node->get(BnfStateEnum::FIELD_NAME)->isEmpty()) {
      return;
    }

    /** @var \Drupal\enum_field\Plugin\Field\FieldType\EnumItemList $state_field */
    $state_field = $node->get(BnfStateEnum::FIELD_NAME);
    $states = $state_field->enums();
    $state = reset($states);

    if (in_array($state, [BnfStateEnum::Imported, BnfStateEnum::LocallyClaimed])) {
      $page['#attached']['drupalSettings']['dpl_mapp']['page_params']['p_deltj_uuid'] = $node->uuid();
    }
  }

}
