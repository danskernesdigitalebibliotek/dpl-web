<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\bnf\Attribute\BnfMapper;
use Drupal\bnf\BnfMapperManager;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphContentSlider;

use Drupal\bnf\Services\BnfImporter;
use Drupal\bnf\Services\ImportContextStack;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Spawnia\Sailor\ObjectLike;

/**
 * Mapping ParagraphContentSlider => content_slider.
 */
#[BnfMapper(
  id: ParagraphContentSlider::class,
)]
class ParagraphContentSliderMapper extends BnfMapperImportReferencePluginBase {

  /**
   * {@inheritdoc}
   */
  public function __construct(
    array $configuration,
    string $pluginId,
    array $pluginDefinition,
    EntityTypeManagerInterface $entityTypeManager,
    protected ImportContextStack $importContext,
    protected BnfImporter $importer,
    protected BnfMapperManager $mapper,
  ) {
    parent::__construct($configuration, $pluginId, $pluginDefinition, $entityTypeManager, $importContext, $importer);
  }

  /**
   * {@inheritdoc}
   */
  public function map(ObjectLike $object): mixed {
    if (!($object instanceof ParagraphContentSlider)) {
      throw new \RuntimeException('Wrong class handed to mapper');
    }

    $references = [];

    if (isset($object->contentReferences) && !empty($object->contentReferences)) {
      $references = $this->mapEntityReferences(array_map(fn ($ref) => $ref->id, $object->contentReferences));
    }

    return $this->entityTypeManager->getStorage('paragraph')->create([
      'type' => 'content_slider',
      'field_title' => $object->title ?? NULL,
      'field_underlined_title' => [
        'value' => $object->underlinedTitle?->value ?? '',
        'format' => $object->underlinedTitle?->format ?? '',
      ],
      'field_content_references' => $references,
    ]);

  }

}
