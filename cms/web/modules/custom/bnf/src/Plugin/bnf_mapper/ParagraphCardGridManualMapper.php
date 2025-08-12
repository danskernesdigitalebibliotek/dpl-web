<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\bnf\Attribute\BnfMapper;
use Drupal\bnf\BnfMapperManager;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphCardGridManual;

use Drupal\bnf\Services\BnfImporter;
use Drupal\bnf\Services\ImportContextStack;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Spawnia\Sailor\ObjectLike;

/**
 * Mapping ParagraphCardGridManual => card_grid_manual.
 */
#[BnfMapper(
  id: ParagraphCardGridManual::class,
)]
class ParagraphCardGridManualMapper extends BnfMapperImportReferencePluginBase {

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
    if (!($object instanceof ParagraphCardGridManual)) {
      throw new \RuntimeException('Wrong class handed to mapper');
    }

    $moreLink = [];
    if ($object->moreLink) {
      $moreLink = $this->mapper->map($object->moreLink);
    }

    $references = [];

    if (!empty($object->gridContentUuids)) {
      $references = $this->mapEntityReferences($object->gridContentUuids);
    }

    return $this->entityTypeManager->getStorage('paragraph')->create([
      'type' => 'card_grid_manual',
      'field_title' => $object->titleOptional,
      'field_more_link' => $moreLink,
      'field_grid_content' => $references,
    ]);

  }

}
