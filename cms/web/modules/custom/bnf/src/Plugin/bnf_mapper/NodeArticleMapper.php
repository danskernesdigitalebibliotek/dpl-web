<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\bnf\Attribute\BnfMapper;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\NodeArticle;
use Spawnia\Sailor\ObjectLike;

/**
 * Maps article nodes.
 */
#[BnfMapper(
  id: NodeArticle::class,
)]
class NodeArticleMapper extends BnfMapperNodePluginBase {

  /**
   * {@inheritdoc}
   */
  public function map(ObjectLike $object): mixed {
    if (!$object instanceof NodeArticle) {
      throw new \RuntimeException('Wrong class handed to mapper');
    }

    $node = $this->getNode($object, 'article');

    $node->set('field_subtitle', $object->subtitle);

    $node->set('field_teaser_text', $object->teaserText);
    $node->set('field_teaser_image', $this->getImageValue($object->teaserImage));

    return $node;
  }

}
