<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\bnf\Attribute\BnfMapper;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphAccordion;

use Spawnia\Sailor\ObjectLike;

/**
 * Mapping ParagraphAccordion => accordion.
 */
#[BnfMapper(
  id: ParagraphAccordion::class,
  )]
class ParagraphAccordionMapper extends BnfMapperParagraphPluginBase {

  /**
   * {@inheritdoc}
   */
  public function map(ObjectLike $object): mixed {
    if (!$object instanceof ParagraphAccordion) {
      throw new \RuntimeException('Wrong class handed to mapper');
    }

    /** @var \Drupal\paragraphs\ParagraphInterface $paragraph */
    $paragraph = $this->paragraphStorage->create([
      'type' => 'accordion',
    ]);

    $paragraph->set('field_accordion_title', [
      'value' => $object->accordionTitle->value ?? '',
      'format' => $object->accordionTitle->format ?? '',
    ]);

    $paragraph->set('field_accordion_description', [
      'value' => $object->accordionDescription->value ?? '',
      'format' => $object->accordionDescription->format ?? '',
    ]);

    return $paragraph;
  }

}
