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
