<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\bnf\Attribute\BnfMapper;
use Drupal\bnf\BnfMapperManager;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphCardGridManual;

use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphNavSpotsManual;
use Drupal\bnf\Services\BnfImporter;
use Drupal\bnf\Services\ImportContextStack;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Spawnia\Sailor\ObjectLike;

/**
 * Mapping ParagraphNavSpotsManual => nav_spots_manual.
 */
#[BnfMapper(
  id: ParagraphCardGridManual::class,
)]
class ParagraphNavSpotsManualMapper extends BnfMapperImportReferencePluginBase {

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
    if (!($object instanceof ParagraphNavSpotsManual)) {
      throw new \RuntimeException('Wrong class handed to mapper');
    }

    $references = [];

    if (!empty($object->navSpotsContentUuids)) {
      $references = $this->mapEntityReferences($object->navSpotsContentUuids);
    }

    return $this->entityTypeManager->getStorage('paragraph')->create([
      'type' => 'nav_spots_manual',
      'field_nav_spots_content' => $references,
    ]);
  }

}
