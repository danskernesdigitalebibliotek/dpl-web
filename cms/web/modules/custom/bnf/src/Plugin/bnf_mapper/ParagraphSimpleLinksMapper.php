<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\bnf\Attribute\BnfMapper;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphSimpleLinks;
use Drupal\bnf\Plugin\BnfMapperParagraphPluginBase;
use Drupal\bnf\Plugin\Traits\LinkTrait;
use Spawnia\Sailor\ObjectLike;

/**
 * Mapping ParagraphSimpleLinks => simple_links.
 */
#[BnfMapper(
  id: ParagraphSimpleLinks::class,
  )]
class ParagraphSimpleLinksMapper extends BnfMapperParagraphPluginBase {
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
