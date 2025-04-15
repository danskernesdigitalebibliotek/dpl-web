<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\bnf\Attribute\BnfMapper;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\NodeGoPage;
use Spawnia\Sailor\ObjectLike;

/**
 * Maps GO page nodes.
 */
#[BnfMapper(
  id: NodeGoPage::class,
)]
class NodeGoPageMapper extends BnfMapperNodePluginBase {

  /**
   * {@inheritdoc}
   */
  public function map(ObjectLike $object): mixed {
    if (!$object instanceof NodeGoPage) {
      throw new \RuntimeException('Wrong class handed to mapper');
    }

    $node = $this->getNode($object, 'go_page');

    return $node;
  }

}
