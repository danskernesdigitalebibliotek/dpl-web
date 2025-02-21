<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\bnf\Attribute\BnfMapper;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphLinks;
use Drupal\bnf\Plugin\BnfMapperPluginParagraphBase;
use Drupal\bnf\Plugin\FieldTypeTraits\LinkTrait;
use Spawnia\Sailor\ObjectLike;

/**
 * Mapping ParagraphLinks => links.
 */
#[BnfMapper(
  id: ParagraphLinks::class,
  )]
class ParagraphLinksMapper extends BnfMapperPluginParagraphBase {

  use LinkTrait;

  /**
   * {@inheritdoc}
   */
  public function map(ObjectLike $object): mixed {
    if (!($object instanceof ParagraphLinks)) {
      throw new \RuntimeException('Wrong class handed to mapper');
    }

    $links = $object->link;
    $linkValues = [];

    foreach ($links as $link) {
      $linkValues[] = $this->getLinkValue($link);
    }

    return $this->paragraphStorage->create([
      'type' => 'links',
      'field_link' => $linkValues,
    ]);

  }

}
