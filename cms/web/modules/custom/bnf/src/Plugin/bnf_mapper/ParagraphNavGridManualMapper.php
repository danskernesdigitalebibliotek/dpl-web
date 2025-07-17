<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\bnf\Attribute\BnfMapper;
use Drupal\bnf\BnfMapperManager;

use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphNavGridManual;
use Drupal\bnf\Services\BnfImporter;
use Drupal\bnf\Services\ImportContextStack;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Spawnia\Sailor\ObjectLike;

/**
 * Mapping ParagraphNavGridManualMapper => nav_grid_manual.
 */
#[BnfMapper(
  id: ParagraphNavGridManual::class,
)]
class ParagraphNavGridManualMapper extends BnfMapperImportReferencePluginBase {

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
    if (!($object instanceof ParagraphNavGridManual)) {
      throw new \RuntimeException('Wrong class handed to mapper');
    }

    $references = [];

    if (!empty($object->contentReferenceUuids)) {
      $references = $this->mapEntityReferences($object->contentReferenceUuids);
    }

    return $this->entityTypeManager->getStorage('paragraph')->create([
      'type' => 'nav_grid_manual',
      'field_title' => $object->titleOptional,
      'field_show_subtitles' => $object->showSubtitles,
      'field_content_references' => $references,
    ]);
  }

}
