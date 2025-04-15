<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\bnf\Attribute\BnfMapper;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\NodeGoArticle;
use Spawnia\Sailor\ObjectLike;

/**
 * Maps GO article nodes.
 */
#[BnfMapper(
  id: NodeGoArticle::class,
)]
class NodeGoArticleMapper extends BnfMapperNodePluginBase {

  /**
   * {@inheritdoc}
   */
  public function map(ObjectLike $object): mixed {
    if (!$object instanceof NodeGoArticle) {
      throw new \RuntimeException('Wrong class handed to mapper');
    }

    $node = $this->getNode($object, 'go_article');

    $node->set('field_go_article_image', $this->getImageValue($object->goArticleImage));
    $node->set('field_subtitle', $object->subtitle);
    $node->set('field_override_author', $object->overrideAuthor);
    $node->set('field_show_override_author', $object->showOverrideAuthor);
    $node->set('field_teaser_text', $object->teaserText);
    $node->set('field_teaser_image', $this->getImageValue($object->teaserImageRequired));

    return $node;
  }

}
