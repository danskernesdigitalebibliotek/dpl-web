<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\bnf\Plugin\Traits\LinkTrait;
use Drupal\bnf\Services\BnfImporter;
use Drupal\bnf\Services\ImportContextStack;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\node\NodeInterface;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\BannerLink\Link as BannerLink;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\LinkRequired\Link as GoLink;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\HeroLink\Link as HeroLink;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\Link\Link as LinksLink;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\MoreLink\Link as MoreLink;

/**
 * Base class for link fields that import linked content.
 */
abstract class BnfMapperImportReferencePluginBase extends BnfMapperPluginBase {

  use LinkTrait;

  /**
   * The max amount of levels down we want to import.
   */
  static public int $recursionLimit = 3;

  /**
   * {@inheritdoc}
   */
  public function __construct(
    array $configuration,
    string $pluginId,
    array $pluginDefinition,
    protected EntityTypeManagerInterface $entityTypeManager,
    protected ImportContextStack $importContext,
    protected BnfImporter $importer,
  ) {
    parent::__construct($configuration, $pluginId, $pluginDefinition);
  }

  /**
   * Importing nodes that have been referenced, with recursion limit.
   */
  private function importReferencedNode(string $id): ?NodeInterface {
    if ($this->importContext->size() > $this::$recursionLimit) {
      return NULL;
    }
    /** @var \Drupal\node\Entity\Node[] $existing */
    $existing = $this->entityTypeManager->getStorage('node')->loadByProperties(['uuid' => $id]);

    if ($existing) {
      $node = reset($existing);
    }
    else {
      $node = $this->importer->importNode($id, $this->importContext->current());
    }

    return ($node instanceof NodeInterface) ? $node : NULL;
  }

  /**
   * Mapping entity reference fields.
   *
   * @param array<mixed> $ids
   *   The UUIDs that we will try to import.
   *
   * @return array<mixed>
   *   The reference data, ready to be put into a Drupal field.
   */
  public function mapEntityReferences(array $ids): array {
    $referenceData = [];

    foreach ($ids as $id) {
      $node = $this->importReferencedNode((string) $id);

      if (!$node) {
        continue;
      }

      $referenceData[] = [
        'target_id' => $node->id(),
        'target_type' => 'node',
      ];
    }

    return $referenceData;
  }

  /**
   * Mapping link fields.
   */
  public function mapLink(BannerLink|GoLink|HeroLink|LinksLink|MoreLink $object): mixed {
    if ($object->internal && is_string($object->id)) {
      $node = $this->importReferencedNode($object->id);

      if (!$node) {
        return NULL;
      }

      $linkValue = [
        'uri' => 'entity:node/' . $node->id(),
        'title' => $object->title,
      ];
    }
    else {
      $linkValue = $this->getLinkValue($object);
    }

    return $linkValue;
  }

}
