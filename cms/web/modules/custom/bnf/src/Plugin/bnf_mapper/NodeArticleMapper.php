<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\bnf\Attribute\BnfMapper;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\NodeArticle;
use Drupal\node\NodeInterface;
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
  public function map(ObjectLike $object): NodeInterface {
    if (!$object instanceof NodeArticle) {
      throw new \RuntimeException('Wrong class handed to mapper');
    }

    $node = $this->getNode($object, 'article');

    $node->set('field_subtitle', $object->subtitle);
    $node->set('field_override_author', $object->overrideAuthor);
    $node->set('field_show_override_author', $object->showOverrideAuthor);
    $node->set('field_publication_date', $this->getDateTimeValue($object->publicationDate, FALSE));
    $node->set('field_teaser_text', $object->teaserText);
    $node->set('field_teaser_image', $this->getImageValue($object->teaserImage));

    if (isset($object->canonicalUrl)) {
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
