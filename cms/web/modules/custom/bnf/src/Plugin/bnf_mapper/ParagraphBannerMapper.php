<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\bnf\Attribute\BnfMapper;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphBanner;
use Drupal\bnf\Plugin\BnfMapperPluginParagraphBase;
use Drupal\bnf\Plugin\FieldTypeTraits\ImageTrait;
use Spawnia\Sailor\ObjectLike;

/**
 * Mapping ParagraphBanner => banner.
 */
#[BnfMapper(
  id: ParagraphBanner::class,
)]
class ParagraphBannerMapper extends BnfMapperPluginParagraphBase {
  use ImageTrait;

  /**
   * {@inheritdoc}
   */
  public function map(ObjectLike $object): mixed {

    if (!$object instanceof ParagraphBanner) {
      throw new \RuntimeException('Wrong class handed to mapper');
    }

    return $this->paragraphStorage->create([
      'type' => 'banner',
      'field_underlined_title' => [
        'value' => $object->underlinedTitle->value ?? '',
        'format' => $object->underlinedTitle->format ?? '',
      ],
      'field_banner_description' => $object->bannerDescription,
      'field_banner_link' => [
        'uri' => $object->bannerLink->url,
        'title' => $object->bannerLink->title,
      ],
      'field_banner_image' => $this->getImageValue($object->bannerImage),
    ]);

  }

}
