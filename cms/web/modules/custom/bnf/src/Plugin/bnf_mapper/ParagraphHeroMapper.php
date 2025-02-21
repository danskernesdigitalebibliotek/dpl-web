<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\bnf\Attribute\BnfMapper;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphHero;
use Drupal\bnf\Plugin\BnfMapperPluginParagraphBase;
use Drupal\bnf\Plugin\FieldTypeTraits\DateTimeTrait;
use Drupal\bnf\Plugin\FieldTypeTraits\ImageTrait;
use Drupal\bnf\Plugin\FieldTypeTraits\LinkTrait;
use Spawnia\Sailor\ObjectLike;

/**
 * Mapping ParagraphHero => hero.
 */
#[BnfMapper(
  id: ParagraphHero::class,
)]
class ParagraphHeroMapper extends BnfMapperPluginParagraphBase {
  use ImageTrait;
  use LinkTrait;
  use DateTimeTrait;

  /**
   * {@inheritdoc}
   */
  public function map(ObjectLike $object): mixed {

    if (!$object instanceof ParagraphHero) {
      throw new \RuntimeException('Wrong class handed to mapper');
    }

    return $this->paragraphStorage->create([
      'type' => 'hero',
      // We are specifically ignoring the categories, as we do not wish
      // to support foreign terms. The categories field is NOT required.
      // 'field_hero_categories' => '',.
      'field_hero_content_type' => $object->heroContentType,
      'field_hero_description' => [
        'value' => $object->heroDescription?->value,
        'format' => $object->heroDescription?->format,
      ],
      'field_hero_image' => $this->getImageValue($object->heroImage),
      'field_hero_link' => $this->getLinkValue($object->heroLink),
      'field_hero_title' => $object->heroTitle,
      'field_hero_date' => $this->getDateTimeValue($object->heroDate, FALSE),
    ]);

  }

}
