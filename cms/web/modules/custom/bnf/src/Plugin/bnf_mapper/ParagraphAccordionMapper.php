<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\bnf\Attribute\BnfMapper;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphAccordion;
use Drupal\bnf\Plugin\BnfMapperPluginParagraphBase;
use Spawnia\Sailor\ObjectLike;

/**
 * Mapping ParagraphAccordion => accordion.
 */
#[BnfMapper(
  id: ParagraphAccordion::class,
  )]
class ParagraphAccordionMapper extends BnfMapperPluginParagraphBase {

  /**
   * {@inheritdoc}
   */
  public function map(ObjectLike $object): mixed {
    if (!$object instanceof ParagraphAccordion) {
      throw new \RuntimeException('Wrong class handed to mapper');
    }

    return $this->paragraphStorage->create([
      'type' => 'accordion',
      'field_accordion_title' => [
        'value' => $object->accordionTitle->value,
        'format' => $object->accordionTitle->format,
      ],
      'field_accordion_description' => [
        'value' => $object->accordionDescription->value ?? '',
        'format' => $object->accordionDescription->format ?? '',
      ],
    ]);
  }

}
