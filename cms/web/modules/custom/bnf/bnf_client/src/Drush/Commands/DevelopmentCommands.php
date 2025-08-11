<?php

declare(strict_types=1);

namespace Drupal\bnf_client\Drush\Commands;

use Drupal\bnf\BnfStateEnum;
use Drupal\bnf_client\BnfScheduler;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drush\Attributes\Command;
use Drush\Attributes\Help;
use Drush\Commands\AutowireTrait;
use Drush\Commands\DrushCommands;

/**
 * Commands for development.
 */
class DevelopmentCommands extends DrushCommands {

  use AutowireTrait;

  /**
   * Constructor.
   */
  public function __construct(
    protected EntityTypeManagerInterface $entityTypeManager,
    protected BnfScheduler $scheduler,
  ) {
  }

  /**
   * Reset the BNF state of all nodes.
   *
   * This is useful if you have manually deleted the nodes on the server side
   * and want to be able to re-export them.
   */
  #[Command(name: 'bnf:devel:reset-states')]
  #[Help(description: 'Reset the BNF state of all nodes')]
  public function resetStates(): void {
    $nodeStorage = $this->entityTypeManager->getStorage('node');

    $nids = $nodeStorage->getQuery()
      ->condition(BnfStateEnum::FIELD_NAME, '', '<>')
      ->condition(BnfStateEnum::FIELD_NAME, BnfStateEnum::None->value, '<>')
      // This is a CLI command - no need for access check.
      ->accessCheck(FALSE)
      ->execute();

    $nodes = $nodeStorage->loadMultiple($nids);

    /** @var \Drupal\node\NodeInterface[] $nodes */
    foreach ($nodes as $node) {
      $node->set(BnfStateEnum::FIELD_NAME, BnfStateEnum::None->value);
      $node->save();
    }
  }

  /**
   * Create test nodes, for testing reference importing.
   */
  #[Command(name: 'bnf:devel:create-test-reference-nodes')]
  #[Help(description: 'Create test nodes, for testing reference importing')]
  public function createTestReferenceNodes(): void {
    $nodeStorage = $this->entityTypeManager->getStorage('node');
    $paragraphStorage = $this->entityTypeManager->getStorage('paragraph');

    $nid = NULL;

    for ($i = 0; $i <= 10; $i++) {
      $paragraphs = [];

      if ($nid) {
        $paragraphs[] = $paragraphStorage->create([
          'type' => 'nav_spots_manual',
          'field_nav_spots_content' => [
            'target_id' => $nid,
            'target_type' => 'node',
          ],
        ]);

      }

      $node = $nodeStorage->create([
        'type' => 'article',
        'title' => "BNF-test-$i",
        'field_paragraphs' => $paragraphs,
      ]);

      $node->save();

      $nid = $node->id();
    }
  }

}
