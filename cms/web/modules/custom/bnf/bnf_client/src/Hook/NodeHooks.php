<?php

declare(strict_types=1);

namespace Drupal\bnf_client\Hook;

use Drupal\bnf\BnfStateEnum;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\node\NodeInterface;
use Drupal\bnf\Services\BnfImporter;

/**
 * Node hooks.
 */
class NodeHooks {

  public function __construct(protected BnfImporter $importer) {}

  /**
   * Disable BNF sync when nodes are unpublished.
   */
  #[Hook('node_presave')]
  public function unsubscribeUnpublished(NodeInterface $node): void {
    // Skip if importer is currently running, we don't want to mess with nodes
    // being syncronized.
    if ($this->importer->wasJustImported($node)) {
      return;
    }

    if (!$node->hasField(BnfStateEnum::FIELD_NAME) || $node->get(BnfStateEnum::FIELD_NAME)->isEmpty()) {
      return;
    }

    // @phpstan-ignore property.notFound (we're sure the magic property exists)
    $state = $node->get(BnfStateEnum::FIELD_NAME)->first()?->enum;

    // Locally claim unpublished imported nodes so they won't get re-synced
    // and consequently published again if it's updated in BNF.
    if ($state === BnfStateEnum::Imported && !$node->isPublished()) {
      $node->set(BnfStateEnum::FIELD_NAME, BnfStateEnum::LocallyClaimed);
    }
  }

}
