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
    $node->set('field_publication_date', $this->getDateTimeValue($object->publicationDate, FALSE));

    // The canonical URL field does not exist yet, but will eventually.
    if (isset($object->canonicalUrl) && $node->hasField('field_canonical_url')) {
      $node->set('field_canonical_url', [
        'uri' => $object->canonicalUrl->url,
      ]);
    }

    if ($object->paragraphs) {
      $paragraphs = [];

      foreach ($object->paragraphs as $paragraph) {
        $paragraphs[] = $this->manager->map($paragraph);
      }

      $node->set('field_paragraphs', $paragraphs);
    }

    return $node;
  }

}
