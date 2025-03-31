<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\bnf\Attribute\BnfMapper;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphBanner;

use Drupal\bnf\Plugin\Traits\ImageTrait;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\File\FileSystemInterface;
use Drupal\file\FileRepositoryInterface;
use Spawnia\Sailor\ObjectLike;

/**
 * Mapping ParagraphBanner => banner.
 */
#[BnfMapper(
  id: ParagraphBanner::class,
)]
class ParagraphBannerMapper extends BnfMapperParagraphPluginBase {
  use ImageTrait;

  /**
   * {@inheritdoc}
   */
  public function __construct(
    array $configuration,
    string $pluginId,
    array $pluginDefinition,
    protected EntityTypeManagerInterface $entityTypeManager,
    protected FileSystemInterface $fileSystem,
    protected FileRepositoryInterface $fileRepository,
  ) {
    parent::__construct($configuration, $pluginId, $pluginDefinition, $entityTypeManager);
  }

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
