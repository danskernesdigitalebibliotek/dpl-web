<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\bnf\Attribute\BnfMapper;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphSimpleLinks;
use Drupal\bnf\Plugin\BnfMapperPluginParagraphBase;
use Drupal\bnf\Plugin\FieldTypeTraits\LinkTrait;
use Spawnia\Sailor\ObjectLike;

/**
 * Mapping ParagraphSimpleLinks => simple_links.
 */
#[BnfMapper(
  id: ParagraphSimpleLinks::class,
  )]
class ParagraphSimpleLinksMapper extends BnfMapperPluginParagraphBase {
  use LinkTrait;

  /**
   * {@inheritdoc}
   */
  public function map(ObjectLike $object): mixed {
    if (!($object instanceof ParagraphSimpleLinks)) {
      throw new \RuntimeException('Wrong class handed to mapper');
    }

    $links = $object->link;
    $linkValues = [];

    foreach ($links as $link) {
      $linkValues[] = $this->getLinkValue($link);
    }

    return $this->paragraphStorage->create([
      'type' => 'simple_links',
      'field_link' => $linkValues,
    ]);

  }

}
