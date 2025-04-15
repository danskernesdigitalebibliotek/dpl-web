<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\bnf\Attribute\BnfMapper;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\NodePage;
use Spawnia\Sailor\ObjectLike;

/**
 * Maps page nodes.
 */
#[BnfMapper(
  id: NodePage::class,
)]
class NodePageMapper extends BnfMapperNodePluginBase {

  /**
   * {@inheritdoc}
   */
  public function map(ObjectLike $object): mixed {
    if (!$object instanceof NodePage) {
      throw new \RuntimeException('Wrong class handed to mapper');
    }

    $node = $this->getNode($object, 'page');

    $node->set('field_subtitle', $object->subtitle);
    $node->set('field_teaser_text', $object->teaserText);
    $node->set('field_teaser_image', $this->getImageValue($object->teaserImage));
    $node->set('field_hero_title', $object->heroTitle);
    $node->set('field_display_titles', $object->displayTitles);

    return $node;
  }

}
