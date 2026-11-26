<?php

declare(strict_types=1);

namespace Drupal\bnf_client;

use Drupal\bnf\BnfStateEnum;
use Drupal\Core\Entity\EntityTypeManagerInterface;

/**
 * Helpers for interacting with nodes imported through subscriptions.
 */
class SubscriptionNodeHelper {

  /**
   * Claimed node was made local.
   */
  const LOCALIZED = 'localized';

  /**
   * Imported node was deleted.
   */
  const DELETED = 'deleted';

  /**
   * Node was not imported, and was left unchanged.
   */
  const IGNORED = 'ignored';

  /**
   * No node with the UUID exists.
   */
  const NOT_FOUND = 'not_found';

  public function __construct(
    protected EntityTypeManagerInterface $entityTypeManager,
  ) {}

  /**
   * Delete orphaned nodes, or make them local.
   *
   * Assumes the nodes have been deleted from the BNF server, and that's why
   * we want to remove it. Nodes in any state but LocallyClaimed and Imported
   * are left unchanged.
   *
   * @param string[] $uuids
   *   List of node UUIDs to fix.
   *
   * @return array<string, string>
   *   What was done to each node, keyed by UUID. One of the LOCALIZED,
   *   DELETED, IGNORED or NOT_FOUND constants.
   */
  public function fixOrphans(array $uuids): array {
    $result = array_fill_keys($uuids, self::NOT_FOUND);

    /** @var \Drupal\node\NodeInterface[] $nodes */
    $nodes = $this->entityTypeManager
      ->getStorage('node')
      ->loadByProperties(['uuid' => $uuids]);

    foreach ($nodes as $node) {
      // @phpstan-ignore property.notFound (we're sure the magic property exists)
      $state = $node->get(BnfStateEnum::FIELD_NAME)->first()?->enum;

      switch ($state) {
        case BnfStateEnum::LocallyClaimed:
          // Make locally claimed nodes local.
          $node->set(BnfStateEnum::FIELD_NAME, BnfStateEnum::None);
          $node->set('bnf_source_subscriptions', []);
          $node->set('bnf_source_changed', '');
          $node->set('bnf_source_name', '');
          if ($node->hasField('field_canonical_url')) {
            $node->set('field_canonical_url', []);
          }
          $node->save();
          $result[$node->uuid()] = self::LOCALIZED;
          break;

        case BnfStateEnum::Imported:
          $node->delete();
          $result[$node->uuid()] = self::DELETED;
          break;

        default:
          // Not imported, don't mess with it.
          $result[$node->uuid()] = self::IGNORED;
      }
    }

    return $result;
  }

}
